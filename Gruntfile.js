module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); //will load all the grunt plugins installed in the package.json
  
  grunt.initConfig({
    watch: {
      //will watch for any modification of files
      staticJS: {
        files: ['./scripts/**.*'], //All files within directory
        tasks: ['jshint:client','browserify:dist'], //will hint the files and then minify and concatinate
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: false //Enable LiveReload
        }
      }
    },
    browserify: {
      dist: {
        files: {
          './scripts/dist/truss.js': ['./scripts/main.js']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },
      client: ['./scripts/**.js']
    }
  });
  grunt.registerTask('default', ['jshint:client','browserify:dist','watch:staticJS']);
};
