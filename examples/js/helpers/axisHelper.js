(function () {

    "use strict";

    /**

     Helper widget that indicates the World coordinate axis.

     The helper works by tracking updates on a xeogl.Lookat and orienting a gnomon accordingly.

     @class AxisHelper
     @constructor
     @param cfg {*} Configuration
     @param cfg.lookat {xeogl.Lookat} A {{#crossLink "xeogl.Lookat"}}{{/crossLink}} to observe.
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

        var helperLookat = scene.camera.view;

        lookat.on("matrix",
            function () {

                var eye = lookat.eye;
                var look = lookat.look;
                var up = lookat.up;

                var eyeLook = xeogl.math.mulVec3Scalar(xeogl.math.normalizeVec3(xeogl.math.subVec3(eye, look, [])), 18);

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

        var xAxisMaterial = axisMaterial.clone({ // Red by convention
            diffuse: [1, 0.3, 0.3]
        });

        var yAxisMaterial = axisMaterial.clone({ // Green by convention
            diffuse: [0.3, 1, 0.3]
        });

        var zAxisMaterial = axisMaterial.clone({ // Blue by convention
            diffuse: [0.3, 0.3, 1]
        });

        var ballMaterial = axisMaterial.clone({
            diffuse: [0.5, 0.5, 0.5]
        });

        var visibility = new xeogl.Visibility(scene, { // Shows or hides gnomon
            visible: !!cfg.visible
        });

        var modes = new xeogl.Modes(scene, { // Ensures that gnomon is not pickable and has no collision boundary
            pickable: false,
            collidable: false
        });

        var billboard = new xeogl.Billboard(scene, { // Keeps axis labels oriented towards eye
            spherical: true
        });

        // ----------------- Entities ------------------------------

        // Sphere behind gnomon

        new xeogl.Entity(scene, {
            lights: new xeogl.Lights(scene),
            geometry: new xeogl.SphereGeometry(scene, {
                radius: 9,
                heightSegments: 60,
                widthSegments: 60
            }),
            material: new xeogl.PhongMaterial(scene, {
                diffuse: [1.0, 1.0, 1.0],
                emissive: [0.8, 0.8, 0.8],
                ambient: [0.3, 0.3, 0.3],
                specular: [1, 1, 1],
                opacity: 0.4
            }),
            modes: new xeogl.Modes(scene, {
                pickable: false,
                collidable: false,
                transparent: true,
                frontface: "cw"

            }),
            visibility: visibility
        });

        // Ground plane

        //new xeogl.Entity(scene, {
        //    geometry: new xeogl.BoxGeometry(scene, {
        //        xSize: 6,
        //        ySize: 0.01,
        //        zSize: 6
        //    }),
        //    material: axisMaterial.clone({
        //        diffuse: [0.3, 0.3, 1.0],
        //        opacity: 0.4,
        //        diffuseMap: new xeogl.Texture(scene, {
        //            src: "bimsurfer/src/xeoViewer/helpers/UVCheckerMap11-1024.png"
        //        })
        //    }),
        //    visibility: visibility,
        //    modes: modes.clone({transparent: true}),
        //    transform: new xeogl.Rotate(scene, { xyz:[1,0,0], angle: 90})
        //});

        // Ball at center of axis

        new xeogl.Entity(scene, {  // Arrow
            geometry: new xeogl.SphereGeometry(scene, {
                radius: 1.0
            }),
            material: ballMaterial,
            visibility: visibility,
            modes: modes
        });

        // X-axis arrow, shaft and label

        new xeogl.Entity(scene, {  // Arrow
            geometry: arrowHead,
            material: xAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 5, 0],
                parent: new xeogl.Rotate(scene, {
                    xyz: [0, 0, 1],
                    angle: 90
                })
            })
        });

        new xeogl.Entity(scene, {  // Shaft
            geometry: arrowShaft,
            material: xAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 2, 0],
                parent: new xeogl.Rotate(scene, {
                    xyz: [0, 0, 1],
                    angle: 90
                })
            })
        });

        new xeogl.Entity(scene, {  // Label
            geometry: new xeogl.VectorTextGeometry(scene, {text: "X", xSize: 1.5, ySize: 1.5}),
            material: xAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [-7, 0, 0]
            }),
            billboard: billboard
        });

        // Y-axis arrow, shaft and label

        new xeogl.Entity(scene, {  // Arrow
            geometry: arrowHead,
            material: yAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 5, 0]
            })
        });

        new xeogl.Entity(scene, {  // Shaft
            geometry: arrowShaft,
            material: yAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 2, 0]
            })
        });

        new xeogl.Entity(scene, {  // Label
            geometry: new xeogl.VectorTextGeometry(scene, {text: "Y", xSize: 1.5, ySize: 1.5}),
            material: yAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 7, 0]
            }),
            billboard: billboard
        });

        // Z-axis arrow, shaft and label

        new xeogl.Entity(scene, {  // Arrow
            geometry: arrowHead,
            material: zAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 5, 0],
                parent: new xeogl.Rotate(scene, {
                    xyz: [1, 0, 0],
                    angle: 90
                })
            })
        });

        new xeogl.Entity(scene, {  // Shaft
            geometry: arrowShaft,
            material: zAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 2, 0],
                parent: new xeogl.Rotate(scene, {
                    xyz: [1, 0, 0],
                    angle: 90
                })
            })
        });


        new xeogl.Entity(scene, {  // Label
            geometry: new xeogl.VectorTextGeometry(scene, {text: "Z", xSize: 1.5, ySize: 1.5}),
            material: zAxisMaterial,
            visibility: visibility,
            modes: modes,
            transform: new xeogl.Translate(scene, {
                xyz: [0, 0, 7]
            }),
            billboard: billboard
        });

        /** Shows or hides this helper
         *
         * @param visible
         */
        this.setVisible = function (visible) {
            visibility.visible = visible;
        }
    };
})();
