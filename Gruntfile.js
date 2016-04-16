module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    concat: {
      new: {
        src: ['src/uaparser.js', 'src/landy.js'],
        dest: 'temp/landy.js',
      },
      legacy: {
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
        dest: "temp/landy.js",
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
      'production': {
        files: {
          'build/landy.min.js.gz': 'build/landy.min.js'
        }
      },
      staging: {
        files: {
          'build/landy.min.<%= grunt.template.today("yyyymmddHHMM") %>.js.gz': 'build/landy.min.js'
        }
      }
    },


    clean: {
      build: {
        src: ['build/landy.js', 'temp']
      },
      deploy: {
        src: ['build'],
      }
    },


    jasmine: {
      landy: {
        src: ['src/uaparser.js', 'src/landy.js'],
        options: {
          specs: 'test/spec/specs-universal.js',
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
      },
      landy_legacy: {
        src: ['src/uaparser.js', 'src/landy.js'],
        options: {
          specs: 'test/spec/specs-legacy.js',
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
    },

    aws: grunt.file.readJSON('aws.json'),

    aws_s3: {
      options: {
        accessKeyId: '<%= aws.AWSAccessKeyId %>',
        secretAccessKey: '<%= aws.AWSSecretKey %>',
        region: 'us-west-2',
        uploadConcurrency: 5,
        downloadConcurrency: 5,
        bucket: 'landyjs',
        gzipRename: 'ext',
      },
      staging: {
        files: [{
          expand: true,
          cwd: 'build/',
          src: '**/landy.min.*.js.gz',
          dest: 'dev/',
          action: 'upload',
        }],
      },
      production: {
        files: [{
          expand: true,
          cwd: 'build/',
          src: '**/landy.min.js.gz',
          dest: '/',
          action: 'upload',
          params: { CacheControl: 'max-age=86400' }
        }],
      },
    },

    invalidate_cloudfront: {
      options: {
        key: '<%= aws.AWSAccessKeyId %>',
        secret: '<%= aws.AWSSecretKey %>',
        distribution: '<%= aws.CloudFront %>'
      },
      production: {
        files: [{
          dest: 'landy.min.js'
        }]
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
  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');


  grunt.registerTask('test', ['connect', 'jasmine:landy']);
  grunt.registerTask('test:legacy', ['connect', 'jasmine:landy_legacy']);
  grunt.registerTask('build:new', ['test', 'concat:new', 'strip_code', 'uglify', 'clean:build']);
  grunt.registerTask('deploy', ['build', 'zopfli'])
  grunt.registerTask('default', ['test']);


  grunt.registerTask('build:legacy', ['concat:legacy', 'strip_code', 'uglify', 'clean:build']);
  grunt.registerTask('deploy:staging:legacy', ['build:legacy', 'zopfli:staging', 'aws_s3:staging', 'clean:deploy'])
  grunt.registerTask('deploy:production:legacy', ['build:legacy','zopfli:production', 'aws_s3:production', 'invalidate_cloudfront:production', 'clean:deploy'])
};
