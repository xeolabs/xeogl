{

    /**s

     Helper widget that indicates the World coordinate axis.

     The helper works by tracking updates on a xeogl.Camera and orienting a gnomon accordingly.

     @class AxisHelper
     @constructor
     @param cfg {*} Configuration
     @param cfg.camera {xeogl.Camera} A {{#crossLink "xeogl.Camera"}}{{/crossLink}} to observe.
     @param [cfg.size] {Int16Array} Pixel dimensions of helper's canvas, [250, 250] by default.
     */
    xeogl.AxisHelper = function (cfg) {

        var camera = cfg.camera;

        if (!camera) {
            throw "Param expected: camera";
        }

        var size = cfg.size || [250, 250];

        var canvas = camera.scene.canvas;

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
        scene.clearLights();

        new xeogl.AmbientLight(scene, {
            color: [0.45, 0.45, 0.5],
            intensity: 0.9
        });

        new xeogl.DirLight(scene, {
            dir: [-0.5, 0.5, -0.6],
            color: [0.8, 0.8, 0.7],
            intensity: 1.0,
            space: "view"
        });

        new xeogl.DirLight(scene, {
            dir: [0.5, -0.5, -0.6],
            color: [0.8, 0.8, 0.8],
            intensity: 1.0,
            space: "view"
        });

        // Rotate helper in synch with target camera

        var helperCamera = scene.camera;

        camera.on("matrix", function () {

            var eye = camera.eye;
            var look = camera.look;
            var up = camera.up;

            var eyeLook = xeogl.math.mulVec3Scalar(xeogl.math.normalizeVec3(xeogl.math.subVec3(eye, look, [])), 22);

            helperCamera.look = [0, 0, 0];
            helperCamera.eye = eyeLook;
            helperCamera.up = up;
        });

        // ----------------- Components that are shared among more than one mesh ---------------

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


        var zAxisMaterial = new xeogl.PhongMaterial(scene, { // Blue by convention
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


        // ----------------- Meshes ------------------------------

        var meshes = [

            // Sphere behind gnomon

            new xeogl.Mesh(scene, {
                geometry: new xeogl.SphereGeometry(scene, {
                    radius: 9.0,
                    heightSegments: 60,
                    widthSegments: 60
                }),
                material: new xeogl.PhongMaterial(scene, {
                    diffuse: [0.0, 0.0, 0.0],
                    emissive: [0.1, 0.1, 0.1],
                    ambient: [0.1, 0.1, 0.2],
                    specular: [0, 0, 0],
                    alpha: 0.4,
                    alphaMode: "blend",
                    frontface: "cw"
                }),
                pickable: false,
                collidable: false,
                visible: !!cfg.visible
            }),

            // Ball at center of axis

            new xeogl.Mesh(scene, {  // Arrow
                geometry: new xeogl.SphereGeometry(scene, {
                    radius: 1.0
                }),
                material: ballMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible
            }),

            // X-axis arrow, shaft and label

            new xeogl.Mesh(scene, {  // Arrow
                geometry: arrowHead,
                material: xAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [-5, 0, 0],
                rotation: [0, 0, 90]
            }),

            new xeogl.Mesh(scene, {  // Shaft
                geometry: arrowShaft,
                material: xAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [-2, 0, 0],
                rotation: [0, 0, 90]
            }),

            new xeogl.Mesh(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "X", size: 1.5}),
                material: xAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [-7, 0, 0],
                billboard: "spherical"
            }),

            // Y-axis arrow, shaft and label

            new xeogl.Mesh(scene, {  // Arrow
                geometry: arrowHead,
                material: yAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 5, 0]
            }),

            new xeogl.Mesh(scene, {  // Shaft
                geometry: arrowShaft,
                material: yAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 2, 0]
            }),

            new xeogl.Mesh(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "Y", size: 1.5}),
                material: yAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 7, 0],
                billboard: "spherical"
            }),

            // Z-axis arrow, shaft and label

            new xeogl.Mesh(scene, {  // Arrow
                geometry: arrowHead,
                material: zAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 0, 5],
                rotation: [90, 0, 0]
            }),

            new xeogl.Mesh(scene, {  // Shaft
                geometry: arrowShaft,
                material: zAxisMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 0, 2],
                rotation: [90, 0, 0]
            }),

            new xeogl.Mesh(scene, {  // Label
                geometry: new xeogl.VectorTextGeometry(scene, {text: "Z", size: 1.5}),
                material: zAxisLabelMaterial,
                pickable: false,
                collidable: false,
                visible: !!cfg.visible,
                position: [0, 0, 7],
                billboard: "spherical"
            })
        ];

        /** Shows or hides this helper
         *
         * @param visible
         */
        this.setVisible = function (visible) {
            for (var i = 0; i < meshes.length; i++) {
                meshes[i].visible = visible;
            }
        }
    };
}
