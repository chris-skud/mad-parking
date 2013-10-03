/* The ParkingMap object handles  all the work
   of parsing the parking data and rendering the map */
function ParkingMap() {
  var _mapDivId = ""; // set in calling template, tells ParkingMap target div
  var _parkingData = null; // hold parking garage array from api
  var _map; // holds google map reference
}

/* "Public" method that gets it all started */
ParkingMap.prototype.renderMap = function(mapDivId, parkingData) {
  this._mapDivId = mapDivId;
  this._parkingData = parkingData;

  this.initializeMap();
  this.setCurrentLocationMarker();
  this.setMapMarkers();
};


ParkingMap.prototype.initializeMap = function() {
  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(43.0728, -89.3885),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this._map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
};


ParkingMap.prototype.setCurrentLocationMarker = function() {
  // Set current location marker if browser supports it
  var browserSupportFlag = new Boolean();
  var userLocation;
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      marker = new google.maps.Marker({
        position: userLocation,
        map: this._map,
        title: 'Your location'
      });

    }, function() {
      this.handleNoGeolocation(browserSupportFlag);
    });
  }
  
  // Browser doesn't support Geolocation
  else {
    browserSupportFlag = false;
    this.handleNoGeolocation(browserSupportFlag);
  }
};

  
ParkingMap.prototype.handleNoGeolocation = function(errorFlag) {
  var initialLocation;
  if (errorFlag == true) {
    initialLocation = new google.maps.LatLng(43.0728, -89.3885); // default it to Madison
  } 
  else {
    initialLocation = new google.maps.LatLng(60, 105); // put them in Siberia
  }
  this._map.setCenter(initialLocation);
};


/* Invoked during the setMapMarkers loop, setting
   marker color based on available slots */
ParkingMap.prototype.setMarkerIcon = function(openSpots) {
  if (openSpots > 50) {
    return 'img/green.png';
  }
  if (openSpots > 0) {
    return 'img/yellow.png';
  }
  else {
    return 'img/red.png';
  }
};


/* setMapMarkers loops through the parkdingData, 
   creates the markers, sets infowindow content and
   and adds the click event listener to each marker. 
   A little ripe for refactor */
ParkingMap.prototype.setMapMarkers = function() {
  var infowindow = new google.maps.InfoWindow();
  var geocoder = new google.maps.Geocoder();
  var marker;
  
  /* if !this._parkingData, still load the map, but don't try to 
     parse the this._parkingData */
  if (!this._parkingData) {
    alert('There was an issue retrieving the parking data from Madison City Data.  please reload or try back later.');
  }
  else {
    for (var i = 0; i < this._parkingData.length; i++) {

      // pick first addres is garage/lot has an array
      if ((Object.prototype.toString.call( this._parkingData[i].address) === '[object Array]')) {
        this._parkingData[i].address = this._parkingData[i].address[0];
      }

      /* Self executing function to freeze variables per iteration of loop */
      (function(currIndex, parkingData, that) {
        geocoder.geocode( { 'address': parkingData[i].address + ', Madison, WI'}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            marker = new google.maps.Marker({
              position: results[0].geometry.location,
              map: that._map,
              title: parkingData[currIndex].name,
              icon: that.setMarkerIcon(parkingData[currIndex].open_spots)
            });
            
            // add click handler to each marker
            google.maps.event.addListener(marker, 'click', (function(marker, currIndex) {
              return function() {
                infowindow.setContent(parkingData[currIndex].name + '<br/>' 
                  + parkingData[currIndex].address + '</br>'
                  + parkingData[currIndex].open_spots
                  + ' of '
                  + parkingData[currIndex].total_spots
                  + ' spots remaining'
                );
                infowindow.open(that._map, marker);
              }
            })(marker, currIndex));
          } 
          else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        }); // end geocode

      })(i, this._parkingData, this);

    } // end for loop
  }
};