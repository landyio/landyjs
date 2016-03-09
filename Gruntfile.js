module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    strip_code: {
      options: {
        start_comment: "test-code",
        end_comment: "end-test-code",
      },
      target: {
        src: "src/landy.js",
        dest: "build/landy.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/landy.js',
        dest: 'build/landy.min.js'
      }
    },
    zopfli: {
      'compress-plugins': {
        files: {
          'build/landy.min.js.gz': 'build/landy.min.js'
        }
      }
    },
    jasmine: {
      landy: {
        src: 'src/landy.js',
        options: {
          specs: 'test/spec/*.js',
          template: 'test/templates/landyio.tmpl',
          helpers: 'test/helpers/*.js',
          '--web-security': false,
          '--local-to-remote-url-access': true,
          '--ignore-ssl-errors': true,
          host: 'http://0.0.0.0:9001',
          vendor: [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
          ]
        }
      }
    },
    connect: {
      tests: {
        options: {
          port: 9001,
          base: '.'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-zopfli');

  grunt.registerTask('test', ['connect', 'jasmine']);
  grunt.registerTask('build', ['test', 'strip_code', 'uglify', 'zopfli'])
  grunt.registerTask('strip', ['strip_code'])

  // Default task(s).
  grunt.registerTask('default', ['test']);

};
