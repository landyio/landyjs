module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    concat: {
      new: {
        src: ['src/uaparser.js', 'src/landy.js'],
        dest: 'temp/landy.js',
      },
      old: {
        src: ['src/uaparser.js', 'src/landy_legacy.js'],
        dest: 'temp/landy.js',
      },
    },

    strip_code: {
      options: {
        start_comment: "test-code",
        end_comment: "end-test-code",
      },
      target: {
        src: "temp/landy.js",
        dest: "temp/landy.js"
      }
    },


    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'temp/landy.js',
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


    clean: {
      js: ["build/*.js", "!build/*.min.js"],
      temp: 'temp'
    },


    jasmine: {
      landy: {
        src: 'src/*.js',
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


  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-zopfli');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');


  grunt.registerTask('test', ['connect', 'jasmine']);
  grunt.registerTask('build', ['test', 'concat:new', 'strip_code', 'uglify', 'clean']);
  grunt.registerTask('build_old', ['concat:old', 'strip_code', 'uglify', 'clean']);
  grunt.registerTask('deploy', ['build', 'zopfli'])
  grunt.registerTask('default', ['test']);

};
