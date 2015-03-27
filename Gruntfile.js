module.exports = function (grunt) {

    "use strict";

    var devScripts = grunt.file.readJSON("dev-scripts.json");

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        ENGINE_VERSION: "<%= pkg.version %>",
        build_dir: "build/<%= ENGINE_VERSION %>",
        license: grunt.file.read("LICENSE.txt"),

        concat: {
            options: {
                banner: grunt.file.read('BANNER'),
                separator: ';',
                process: true
            },
            engine: {
                src: devScripts.engine,
                dest: "<%= build_dir %>/xeoengine-<%= ENGINE_VERSION %>.js"
            }
        },

        uglify: {
            options: {
                report: "min",
                banner: grunt.file.read('BANNER')
            },
            engine: {
                files: {
                    "<%= build_dir %>/xeoengine-<%= ENGINE_VERSION %>.min.js": "<%= concat.engine.dest %>"
                }
            }
        },

        jshint: {
            options: {
                eqeqeq: true,
                undef: true,
                unused: true,
                strict: true,
                indent: 2,
                immed: true,
                newcap: true,
                nonew: true,
                trailing: true
            },
            grunt: {
                src: "Gruntfile.js",
                options: {
                    node: true
                }
            },
            engine: {
                options: {
                    browser: true,
                    globals: {
                        XEO: true
                    }
                },
                src: [
                    "<%= concat.engine.src %>"
                ]
            }
        },

        clean: {
            tmp: "tmp/*.js",
            docs: ["docs/*"]
        },

        jasmine: {
            pivotal: {
                src: 'src/**/*.js',
                options: {
                    specs: 'tests/*Spec.js',
                    helpers: 'tests/*Helper.js'
                }
            }
        },

        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: ['src/core'],
                    outdir: './docs/',
                    "exclude" : "renderer, utils, webgl"
                },
                logo: '../assets/images/logo.png'
            }

        },

        copy: {
            minified: {
                src: '<%= build_dir %>/xeoengine-<%= ENGINE_VERSION %>.min.js',
                dest: 'build/xeoengine.min.js'
            },
            unminified: {
                src: '<%= build_dir %>/xeoengine-<%= ENGINE_VERSION %>.js',
                dest: 'build/xeoengine.js'
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');


    grunt.registerTask("compile", ["clean", "concat"]);
    grunt.registerTask("build", ["test", "compile"]);
//    grunt.registerTask("test", [ ]);
    grunt.registerTask("test", ["qunit"]);
//    grunt.registerTask("test", ["jshint", "qunit"]);
    grunt.registerTask("docs", ["clean", "yuidoc"]);
    grunt.registerTask("default", "test");
    grunt.registerTask("all", ["build", "docs"]);

    grunt.registerTask("snapshot", ["concat", "uglify", "copy"]);

//    grunt.registerTask('snapshot', 'Deploy snapshot builds',
//        function () {
//            grunt.task.run('all');
//            grunt.file.copy("<%= build_dir %>/xeoengine-<%= ENGINE_VERSION %>.min.js", "xeoengine-<%= ENGINE_VERSION %>.min.js");
//        });
};
