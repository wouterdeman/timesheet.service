'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        mochaTest: {
            specific: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/timetracker_detectsamelocation_test.js']
            },
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['<%= allTests %>']
            },
            migrate: {
                options: {
                    reporter: 'spec'
                },
                src: ['migrations/combinecrumbles.js']
            }
        },
        allTests: 'test/**/*.js',
        // Hint Config
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'assets/scripts/**/*.js',
                '!assets/scripts/vendor/*',
                'test/**/*.js',
                'modules',
                'express',
                'mongoose',
                'passport',
                'models',
                'routes',
                'services',
                'app.js'
            ]
        },
        // Watch Config
        watch: {
            files: ['views/**/*'],
            options: {
                livereload: true
            },
            scripts: {
                files: [
                    'assets/scripts/**/*.js',
                ],
            },
            css: {
                files: [
                    'assets/styles/**/*.css',
                ],
            },
            sass: {
                files: ['assets/styles/**/*.scss'],
                tasks: ['sass:dev']
            },
            images: {
                files: [
                    'assets/images/**/*.{png,jpg,jpeg,webp}'
                ],
            },
            express: {
                files: ['app.js',
                    'models/**/*.js', 'mongoose/**/*.js', 'routes/**/*.js', '!**/node_modules/**', '!Gruntfile.js', 'services/**/*.js', 'modules/**/*.js'
                ],
                tasks: ['express:dev'],
                options: {
                    nospawn: true // Without this option specified express won't be reloaded
                }
            },
            test: {
                files: 'test/**/*.js',
                tasks: ['jshint', 'mochaTest']
            }
        },

        // Clean Config
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        'dist/*',
                        '!dist/.git*'
                    ]
                }]
            },
            server: ['.tmp'],
        },

        // Sass Config
        sass: {
            options: {
                cacheLocation: '.tmp/.sass-cache'
            },
            dev: {
                options: {
                    style: 'expanded',
                    lineComments: true
                },
                files: [{
                    expand: true,
                    cwd: 'assets/styles/sass',
                    dest: 'assets/styles',
                    src: ['screen.scss'],
                    ext: '.css'
                }]
            }
        },

        // Express Config
        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: 'app.js'
                }
            }
        },

        // Open Config MAC ONLY...
        /*open: {
            site: {
                path: 'http://localhost:3000',
                app: 'Google Chrome'
            },
            editor: {
                path: './',
                app: 'Sublime Text 2'
            },
        },*/

        // Rev Config
        rev: {
            dist: {
                files: {
                    src: [
                        'dist/assets/scripts/**/*.js',
                        'dist/assets/styles/**/*.css',
                        'dist/assets/images/**/*.{png,jpg,jpeg,gif,webp}',
                        'dist/assets/styles/fonts/**/*.*'
                    ]
                }
            }
        },

        // Usemin Config
        useminPrepare: {
            options: {
                dest: 'dist/assets'
            },
            html: ['assets/{,*/}*.html', 'views/**/*.handlebars']
        },
        usemin: {
            options: {
                dirs: ['dist/assets'],
                basedir: 'dist/assets',
            },
            html: ['dist/assets/{,*/}*.html', 'dist/views/**/*.handlebars'],
            css: ['dist/assets/styles/{,*/}*.css']
        },

        // Imagemin Config
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: 'dist/assets/images'
                }]
            }
        },

        // SVGmin Config
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/images',
                    src: '{,*/}*.svg',
                    dest: 'dist/assets/images'
                }]
            }
        },

        // CSSmin config
        cssmin: {
            // This task is pre-configured if you do not wish to use Usemin
            // blocks for your CSS. By default, the Usemin block from your
            // `index.html` will take care of minification, e.g.
            //
            //     <!-- build:css({.tmp,app}) styles/main.css -->
            //
            // dist: {
            //     files: {
            //         'dist/assets/styles/main.css': [
            //             '.tmp/styles/{,*/}*.css',
            //             'assets/styles/{,*/}*.css'
            //         ]
            //     }
            // }
        },

        // HTML Config
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: 'assets',
                    src: '*.html',
                    dest: 'dist/assets'
                }]
            }
        },

        // Copy Config
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'assets',
                    dest: 'dist/assets',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/**/*.{webp,gif}',
                        'styles/fonts/{,*/}*.*',
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: 'views',
                    dest: 'dist/views/',
                    src: '**/*.handlebars',
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: 'assets/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
        },

        // Concurrent Config
        concurrent: {
            dist: [
                'copy:styles',
                'svgmin',
                'htmlmin'
            ]
        },
    });

    // Register Tasks
    // Workon
    grunt.registerTask('debug', 'Start working on this project.', [
        'jshint',
        'sass:dev',
        'express:dev',
        //--Mac only.. --
        //'open:site', 
        //'open:editor',
        'watch'
    ]);


    // Restart
    grunt.registerTask('restart', 'Restart the server.', [
        'express:dev',
        'watch'
    ]);

    // Test task.
    grunt.registerTask('test', ['jshint', 'mochaTest:test', 'watch:test']);

    // Test specific task
    grunt.registerTask('testspecific', ['jshint', 'mochaTest:specific']);

    // Migrate task.
    grunt.registerTask('migrate', ['mochaTest:migrate']);

    // Build
    grunt.registerTask('default', 'Build production ready assets and views.', [
        'clean:dist',
        'concurrent:dist',
        'useminPrepare',
        'imagemin',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'rev',
        'usemin',
        'nodeunit'
    ]);
};