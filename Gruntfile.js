module.exports = function (grunt) {

    "use strict";

    var devScripts = grunt.file.readJSON("dev-scripts.json");

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        PROJECT_NAME: "<%= pkg.name %>",
        ENGINE_VERSION: "<%= pkg.version %>",
        build_dir: "build/<%= ENGINE_VERSION %>",
        license: grunt.file.read("MIT-LICENSE"),

        concat: {
            options: {
                banner: grunt.file.read('BANNER'),
                footer: "xeogl.version=\"<%= ENGINE_VERSION %>\";",
                separator: ';',
                process: true
            },
            engine: {
                src: devScripts.engine,
                //dest: '/home/lindsay/viewer.js/src/lib/xeogl/xeogl.js'
                dest: 'build/<%= PROJECT_NAME %>.js'
            }
        },

        uglify: {
            options: {
                report: "min",
                banner: grunt.file.read('BANNER')
            },
            engine: {
                files: {
                    "build/<%= PROJECT_NAME %>.min.js": "<%= concat.engine.dest %>"
                }
            }
        },

        ifc2json: {

        },

        clean: {
            tmp: "tmp/*.js",
            docs: ["docs/*"]
        },

        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    themedir: "yuiDocThemes/xeogl",

                    // Add paths here as we include more non-core components in API docs
                    paths: [
                        'src',
                        'examples/js/animation',
                        'examples/js/annotations',
                        'examples/js/controls',
                        'examples/js/effects',
                        'examples/js/curves',
                        'examples/js/generation',
                        'examples/js/skyboxes',
                        'examples/js/stories',
                        'examples/js/geometry',
                        'examples/js/models',
                        'examples/js/helpers'
                    ],

                    outdir: './docs/',
                    exclude: "renderer, utils"
                },
                logo: '../assets/images/logo.png'
            }
        },

        copy: {
            minified: {
                src: 'build/<%= PROJECT_NAME %>.min.js',
                dest: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.min.js'
            },
            unminified: {
                src: 'build/<%= PROJECT_NAME %>.js',
                dest: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.js'
            },
            website: {
                files: [
                    {
                        cwd: 'website/assets',
                        src: ['**/*'],
                        dest: 'assets/',
                        expand: true
                    },
                    {
                        src: ['website/index.html'],
                        dest: 'index.html'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-contrib-yuidoc");

    // Builds snapshot libs within api/latest
    // Run this when testing examples locally against your changes before committing them
    grunt.registerTask("snapshot", ["concat", "yuidoc", "uglify"]);

    // Build a package within ./build
    // Assigns the package the current version number that's defined in package.json
    grunt.registerTask("build", ["snapshot", "yuidoc", "copy"]);

    grunt.registerTask("default", "snapshot");

    grunt.registerTask("website", "copy:website");
};
