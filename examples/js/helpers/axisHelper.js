(function () {

    "use strict";

    /**

     Helper widget that indicates the World coordinate axis.

     @class AxisHelper
     @constructor
     @param cfg {*} Configuration
     @param [cfg.size] {Int16Array} Pixel dimensions of helper's canvas, [250, 250] by default.
     */
    xeogl.AxisHelper = function (cfg) {

        var lookat = cfg.lookat;

        if (!lookat) {
            throw "Param expected: lookat";
        }

        var size = cfg.size || [250, 250];

        var canvas = lookat.scene.canvas;

        // Create canvas for this helper

        var canvasId = "xeogl-axisHelper-canvas-" + xeogl.math.createUUID();
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.height = size[0] + "px";
        style.width = size[1] + "px";
        style.padding = "0";
        style.margin = "0";
        style.float = "left";
        style.left = "410px";
        style.bottom = "350px";
        style.position = "absolute";
        style["z-index"] = "1000000";
        // style["background-color"] = "rgba(0,0,0,0.3)";
        div.innerHTML += '<canvas id="' + canvasId + '" style="width: ' + size[0] + 'px; height: ' + size[1] + 'px; float: left; margin: 0; padding: 0;"></canvas>';
        body.appendChild(div);
        var helperCanvas = document.getElementById(canvasId);

        canvas.on("boundary",
            function (boundary) {
                style.left = boundary[0] + 10 + "px";
                style.bottom = (boundary[0] + 20) + "px";
            });

        // The scene containing this helper
        var scene = new xeogl.Scene({
            canvas: helperCanvas,
            transparent: true
        });

        // Custom lights
        scene.lights.lights = [

            new xeogl.AmbientLight(scene, {
                color: [0.45, 0.45, 0.5],
                intensity: 0.9
            }),

            new xeogl.DirLight(scene, {
                dir: [-0.5, 0.5, -0.6],
                color: [0.8, 0.8, 0.7],
                intensity: 1.0,
                space: "view"
            }),

            new xeogl.DirLight(scene, {
                dir: [0.5, -0.5, -0.6],
                color: [0.8, 0.8, 0.8],
                intensity: 1.0,
                space: "view"
            })
        ];

        // Rotate helper in synch with target lookat

        var helperLookat = scene.camera;

        lookat.on("matrix",            function () {

                var eye = lookat.eye;
                var look = lookat.look;
                var up = lookat.up;

                var eyeLook = xeogl.math.mulVec3Scalar(xeogl.math.normalizeVec3(xeogl.math.subVec3(eye, look, [])), 22);

                helperLookat.look = [0, 0, 0];
                helperLookat.eye = eyeLook;
                helperLookat.up = up;
            });

        // ----------------- Components that are shared among more than one entity ---------------

        var arrowHead = new xeogl.CylinderGeometry(scene, {
            radiusTop: 0.01,
            radiusBottom: 0.6,
            height: 1.7,
            radialSegments: 20,
            heightSegments: 1,
            openEnded: false
        });

        var arrowShaft = new xeogl.CylinderGeometry(scene, {
            radiusTop: 0.2,
            radiusBottom: 0.2,
            height: 4.5,
            radialSegments: 20,
            heightSegments: 1,
            openEnded: false
        });

        var axisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var xAxisMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            diffuse: [1, 0.3, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var xAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Red by convention
            emissive: [1, 0.3, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var yAxisMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
            diffuse: [0.3, 1, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var yAxisLabelMaterial = new xeogl.PhongMaterial(scene, { // Green by convention
            emissive: [0.3, 1, 0.3],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });


        var zAxisMaterial  = new xeogl.PhongMaterial(scene, { // Blue by convention
            diffuse: [0.3, 0.3, 1],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var zAxisLabelMaterial = new xeogl.PhongMaterial(scene, {
            emissive: [0.3, 0.3, 1],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });

        var ballMaterial = new xeogl.PhongMaterial(scene, {
            diffuse: [0.5, 0.5, 0.5],
            ambient: [0.0, 0.0, 0.0],
            specular: [.6, .6, .3],
            shininess: 80,
            lineWidth: 2
        });


        // ----------------- Entities ------------------------------

        var entities = [

            // Sphere behind gnomon

            new xeogl.Entity(scene, {
                geometry: new xeogl.SphereGeometry(scene, {
                    radius: 9.0,
                    heightSegments: 60,
                    widthSegments: 60
                }),
                material: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.0, 0.0, 0.0],
                    emissive: [0.1, 0.1, 0.1],
                    ambient: [0.1, 0.1, 0.2],
                    specular: [0,0,0],
                    alpha: 0.4,
                    alphaMode: "blend",
                    frontface: "cw"
                }),
                pickable: false,
                collidable: false,
                visible: !!cfg.visible
            }),

            // Ball at center of axis

            new xeogl.Entity(scene, {  // Arrow
                geometry: new xeogl.SphereGeometry(scene, {
                    radius: 1.0
                }),
                material: ballMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible
            }),

            // X-axis arrow, shaft and label

            new xeogl.Entity(scene, {  // Arrow
                geometry: arrowHead,
                material: xAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 5, 0],
                    parent: new xeogl.Rotate(scene, {
                        xyz: [0, 0, 1],
                        angle: 270
                    })
                })
            }),

            new xeogl.Entity(scene, {  // Shaft
                geometry: arrowShaft,
                material: xAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 2, 0],
                    parent: new xeogl.Rotate(scene, {
                        xyz: [0, 0, 1],
                        angle: 270
                    })
                })
            }),

            new xeogl.Entity(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "X", size: 1.5}),
                material: xAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [7, 0, 0]
                }),
                billboard: "spherical"
            }),

            // Y-axis arrow, shaft and label

            new xeogl.Entity(scene, {  // Arrow
                geometry: arrowHead,
                material: yAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 5, 0]
                })
            }),

            new xeogl.Entity(scene, {  // Shaft
                geometry: arrowShaft,
                material: yAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 2, 0]
                })
            }),

            new xeogl.Entity(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "Y", size: 1.5}),
                material: yAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 7, 0]
                }),
                billboard: "spherical"
            }),

            // Z-axis arrow, shaft and label

            new xeogl.Entity(scene, {  // Arrow
                geometry: arrowHead,
                material: zAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 5, 0],
                    parent: new xeogl.Rotate(scene, {
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            }),

            new xeogl.Entity(scene, {  // Shaft
                geometry: arrowShaft,
                material: zAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 2, 0],
                    parent: new xeogl.Rotate(scene, {
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            }),

            new xeogl.Entity(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "Z", size: 1.5}),
                material: zAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                transform: new xeogl.Translate(scene, {
                    xyz: [0, 0, 7]
                }),
                billboard: "spherical"
            })
        ];

        /** Shows or hides this helper
         *
         * @param visible
         */
        this.setVisible = function (visible) {
            for (var i = 0; i < entities.length; i++) {
                entities[i].visible = visible;
            }
        };

        this.setLocale = function (locale) {

        };

        this.show = function () {
            this.setVisible(true);
        };

        this.hide = function () {
            this.setVisible(false);
        };

        this.setVisible = function (visible) {
            style.visibility = visible ? "visible" : "hidden";
        };

        this.getVisible = function () {
            return cube.visible;
        };

        /**
         * Sets the canvas size of the ViewCube.
         * @param {Number} size Canvas size.
         */
        this.setSize = function (value) {
            size = value || 200;
            cubeCanvas.width = size;
            cubeCanvas.height = size;
            cubeCanvas.style.width = size + "px";
            cubeCanvas.style.height = size + "px";
        };

        /**
         * Gets the canvas size of the ViewCube.
         * @returns {Number} Canvas size.
         */
        this.getSize = function () {
            return size;
        };

        // /**
        //  * Sets the top margin. Overrides the bottom margin if previously set.
        //  * @param {Number} top Top margin in pixels.
        //  */
        // this.setTop = function(top) {
        //     style.top = top + "px";
        //     style.bottom = null;
        // };
        //
        // /**
        //  * Sets the bottom margin. Overrides the top margin if previously set.
        //  * @param {Number} bottom Bottom margin in pixels.
        //  */
        // this.setBottom = function(bottom) {
        //     style.top = null;
        //     style.bottom = bottom + "px";
        // };
        //
        // /**
        //  * Sets the left margin. Overrides the right margin if previously set.
        //  * @param {Number} left Left margin in pixels.
        //  */
        // this.setLeft = function(left) {
        //     style.left = left + "px";
        //     style.right = null;
        // };
        //
        // /**
        //  * Sets the right margin. Overrides the left margin if previously set.
        //  * @param {Number} right Right margin in pixels.
        //  */
        // this.setRight = function(right) {
        //     style.left = null;
        //     style.right = right + "px";
        // };
        //
    };
})();
