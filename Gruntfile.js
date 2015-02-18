/*
 XeoEngine - WebGL Scene Graph Engine
 Copyright (c) 2015, Lindsay Kay
 lindsay.kay@xeolabs.com
 All rights reserved.
 */

'use strict';

var jsFiles = [

    // API classes (public)

    // These files before everything else
    'src/xeo.js', // Engine namespace
    'src/node.js', // Base node component type

    'src/ambientLight.js',
    'src/camera.js',
    'src/canvas.js',
    'src/clip.js',
    'src/clips.js',
    'src/colorBuf.js',
    'src/colorTarget.js',
    'src/component.js',
    'src/configs.js',
    'src/depthBuf.js',
    'src/depthTarget.js',
    'src/dirLight.js',
    'src/visibility.js',
    'src/modes.js',
    'src/frustum.js',
    'src/geometry.js',
    'src/helloWorld.js',
    'src/input.js',
    'src/layer.js',
    'src/lights.js',
    'src/lookat.js',
    'src/matrix.js',
    'src/material.js',
    'src/morphGeometry.js',
    'src/name.js',
    'src/gameObject.js',
    'src/ortho.js',
    'src/perspective.js',
    'src/pointLight.js',
    'src/scene.js',
    'src/shader.js',
    'src/shaderParams.js',
    'src/stage.js',
    'src/stats.js',
    'src/tag.js',
    'src/task.js',
    'src/tasks.js',
    'src/texture.js',

    // Utilities (private)

    'src/utils/map.js',

    // Math library (public)

    'src/math/math.js',

    // WebGL wrappers (private)

    'src/webgl/webgl.js',
    'src/webgl/arrayBuffer.js',
    'src/webgl/attribute.js',
    'src/webgl/program.js',
    'src/webgl/renderBuffer.js',
    'src/webgl/sampler.js',
    'src/webgl/texture2d.js',
    'src/webgl/uniform.js',

    // Renderer (private)

    'src/renderer/renderer.js'
    //...

];


module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        build_dir: 'build/<%= pkg.name %>.js',
        release_dir: "build",
        license: grunt.file.read("LICENSE.txt"),

        concat: {
            options: {
                banner: grunt.file.read('BANNER'),
                separator: ';'
            },
            dist: {
                src: jsFiles,
                dest: 'build/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                report: "min",
                banner: grunt.file.read('BANNER')
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
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
            scripts: {
                options: {
                    browser: true,
                    globals: {
                        XEO: true,
                        alert: true,
                        console: true
                    }
                },
                src: jsFiles
            }
        },
        
        clean: {
            tmp: "tmp/*.js",
            docs: ["docs/*"]
        },
        
        qunit: {
            all: ["test/*.html"]
        },

        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: ['src/core/', 'src/math'],
                    outdir: './docs/'
                },
                logo: '../files/logo.png'
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");

    grunt.registerTask("compile", ["clean", "concat", "uglify"]);
    grunt.registerTask("build", ["test", "compile"]);
    grunt.registerTask("test", ["jshint", "qunit"]);
    grunt.registerTask("docs", ["clean", "yuidoc"]);
    grunt.registerTask("default", "test");
    grunt.registerTask("all", ["build", "docs"]);
};
