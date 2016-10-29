(function () {

    "use strict";

    /**

     Helper widget that indicates the World coordinate axis.

     The helper works by tracking updates on a xeogl.Lookat and orienting a gnomon accordingly.

     @class LookatHelper
     @constructor
     @param cfg {*} Configuration
     @param cfg.lookat {xeogl.Lookat} A {{#crossLink "xeogl.Lookat"}}{{/crossLink}} to observe.
     @param [cfg.size] {Int16Array} Pixel dimensions of helper's canvas, [250, 250] by default.
     */
    xeogl.LookatHelper = xeogl.Component.extend({

        type: "xeogl.Geometry",

        _init: function (cfg) {

            // ----------------- Components that are shared among more than one entity ---------------

            var arrowHead = this.create({
                type: "xeogl.CylinderGeometry",
                radiusTop: 0.01,
                radiusBottom: 0.6,
                height: 1.7,
                radialSegments: 20,
                heightSegments: 1,
                openEnded: false
            }, "arrowHead");

            var arrowShaft = this.create({
                type: "xeogl.CylinderGeometry",
                radiusTop: 0.2,
                radiusBottom: 0.2,
                height: 4.5,
                radialSegments: 20,
                heightSegments: 1,
                openEnded: false
            }, "arrowShaft");

            var xAxisMaterial = this.create({ // Red by convention
                type: "xeogl.PhongMaterial",
                diffuse: [1, 0.3, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "xAxisMaterial");

            var yAxisMaterial = this.create({ // Green by convention
                type: "xeogl.PhongMaterial",
                diffuse: [0.3, 1, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "yAxisMaterial");

            var zAxisMaterial = this.create({ // Blue by convention
                type: "xeogl.PhongMaterial",
                diffuse: [0.3, 0.3, 1.0],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "zAxisMaterial");

            var ballMaterial = this.create({
                type: "xeogl.PhongMaterial",
                diffuse: [0.5, 0.5, 0.5],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "ballMaterial");

            var visibility = this.create({ // Shows or hides gnomon
                type: "xeogl.Visibility",
                visible: !!cfg.visible
            });

            var modes = this.create({ // Ensures that gnomon is not pickable and has no collision boundary
                type: "xeogl.Modes",
                pickable: false,
                collidable: false
            }, "modes");


            var billboard = this.create({ // Keeps axis labels oriented towards eye
                type: "xeogl.Billboard",
                spherical: true
            }, "billboard");

            // ----------------- Entities ------------------------------

            // Eye

            this.create({  // Arrow
                type: "new xeogl.Entity",
                geometry: this.create({
                    type: "xeogl.SphereGeometry",
                    radius: 1.0
                }, "ball"),
                material: ballMaterial,
                visibility: visibility,
                modes: modes
            });

            // "Up" axis

            this.create({  // Arrow
                type: "new xeogl.Entity",
                geometry: arrowHead,
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 5, 0]
                })
            });

            this.create({  // Shaft
                type: "new xeogl.Entity",
                geometry: arrowShaft,
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 2, 0]
                })
            });

            this.create({  // Label
                type: "new xeogl.Entity",
                geometry: this.create({type: "xeogl.VectorTextGeometry", text: "up", xSize: 1.5, ySize: 1.5}, "yLabel"),
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 7, 0]
                }),
                billboard: billboard
            });

            // Target

            this.create({  // Arrow
                type: "new xeogl.Entity",
                geometry: arrowHead,
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 5, 0],
                    parent: this.create({
                        ype: "xeogl.Rotate",
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            });

            this.create({  // Shaft
                type: "new xeogl.Entity",
                geometry: arrowShaft,
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type: "xeogl.Translate",
                    xyz: [0, 2, 0],
                    parent: this.create({
                        type: "xeogl.Rotate",
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            });

            this.create({  // Label
                type: "new xeogl.Entity",
                geometry: this.create({
                    type: "xeogl.VectorTextGeometry",
                    text: "Z",
                    xSize: 1.5,
                    ySize: 1.5
                }, "zLabel"),
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create({
                    type:"xeogl.Translate",
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
        }
    });
})();
