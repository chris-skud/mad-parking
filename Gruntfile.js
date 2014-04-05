module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! grunt generated <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      build: {
        src: 'public/js/madparking.js',
        dest: 'public/js/madparking.min.js'
      }
    },

    cssmin: {
      options: {
        banner: '/*! grunt generated <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      build: {
        src: 'public/css/madparking.css',
        dest: 'public/css/madparking.min.css'
      }
    }


  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load css plugin
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};