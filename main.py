#!/usr/bin/env python
import os
import logging
import urllib
import jinja2
import webapp2
from google.appengine.api import urlfetch
from google.appengine.api import memcache

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'])


class MainPage(webapp2.RequestHandler):
  def get(self):
    
    # Request parking data from smsmybus parking api
    parkingdata = self.getParking()

    # set parking data 
    if parkingdata is None:
      parkingdata = 'null'
    
    template_values = {
      'parkingData': parkingdata
    }

    template = JINJA_ENVIRONMENT.get_template('public/index.html')
    self.response.write(template.render(template_values))

    
  def getParking(self):
    
    # try to get parking data from cache.  if not, go get it
    # from the http://api.smsmybus.com/v1/getparking.
    parkingdata = memcache.get('parkingdata')
    if parkingdata is not None:
      logging.info('parkingdata retrieved from cache: ' + parkingdata)
      return parkingdata
    else:
      parkinguri = 'http://api.smsmybus.com/v1/getparking'
      parkingresonse = urlfetch.fetch(url=parkinguri,
        method=urlfetch.GET,
        headers={'Content-Type': 'application/json'},
        deadline=30
      )
      if parkingresonse.status_code == 200:
        parkingdata = parkingresonse.content
        logging.info('The following parking data retrieved from ' + parkinguri + ': ' + parkingdata)
      
        # cache it for 5 minutes
        if not memcache.add('parkingdata', parkingdata, 300):
          logging.error('Memcache set failed.')
      else:
        parkingdata = None
      
      return parkingdata


application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)