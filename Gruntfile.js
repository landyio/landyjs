module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/landy.js',
        dest: 'build/landy.min.js'
      }
    },
    jasmine: {
      customTemplate: {
        src: 'src/landy.js',
        options: {
          specs: 'test/spec/*.js',
          template: 'test/templates/landyio.tmpl',
          helpers: 'test/helpers/*.js',
          '--web-security': false,
          '--local-to-remote-url-access': true,
          '--ignore-ssl-errors': true
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', ['jasmine']);
  // Default task(s).
  grunt.registerTask('default', ['test']);

};
