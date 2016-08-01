(function () {

    "use strict";

    /**

     Helper widget that indicates the World coordinate axis.

     The helper works by tracking updates on a XEO.Lookat and orienting a gnomon accordingly.

     @class LookatHelper
     @constructor
     @param cfg {*} Configuration
     @param cfg.lookat {XEO.Lookat} A {{#crossLink "XEO.Lookat"}}{{/crossLink}} to observe.
     @param [cfg.size] {Int16Array} Pixel dimensions of helper's canvas, [250, 250] by default.
     */
    XEO.LookatHelper = XEO.Component.extend({

        type: "XEO.Geometry",

        _init: function (cfg) {

            // ----------------- Components that are shared among more than one entity ---------------

            var arrowHead = this.create(XEO.CylinderGeometry, {
                radiusTop: 0.01,
                radiusBottom: 0.6,
                height: 1.7,
                radialSegments: 20,
                heightSegments: 1,
                openEnded: false
            }, "arrowHead");

            var arrowShaft = this.create(XEO.CylinderGeometry, {
                radiusTop: 0.2,
                radiusBottom: 0.2,
                height: 4.5,
                radialSegments: 20,
                heightSegments: 1,
                openEnded: false
            }, "arrowShaft");

            var xAxisMaterial = this.create(XEO.PhongMaterial, { // Red by convention
                diffuse: [1, 0.3, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "xAxisMaterial");

            var yAxisMaterial = this.create(XEO.PhongMaterial, { // Green by convention
                diffuse: [0.3, 1, 0.3],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "yAxisMaterial");

            var zAxisMaterial = this.create(XEO.PhongMaterial, { // Blue by convention
                diffuse: [0.3, 0.3, 1.0],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "zAxisMaterial");

            var ballMaterial = this.create(XEO.PhongMaterial, {
                diffuse: [0.5, 0.5, 0.5],
                ambient: [0.0, 0.0, 0.0],
                specular: [.6, .6, .3],
                shininess: 80,
                lineWidth: 2
            }, "ballMaterial");

            var visibility = this.create(XEO.Visibility, { // Shows or hides gnomon
                visible: !!cfg.visible
            });

            var modes = this.create(XEO.Modes, { // Ensures that gnomon is not pickable and has no collision boundary
                pickable: false,
                collidable: false
            }, "modes");


            var billboard = this.create(XEO.Billboard, { // Keeps axis labels oriented towards eye
                spherical: true
            }, "billboard");

            // ----------------- Entities ------------------------------

            // Eye

            this.create(new XEO.Entity, {  // Arrow
                geometry: this.create(XEO.SphereGeometry, {radius: 1.0}, "ball"),
                material: ballMaterial,
                visibility: visibility,
                modes: modes
            });

            // "Up" axis

            this.create(XEO.Entity, {  // Arrow
                geometry: arrowHead,
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
                    xyz: [0, 5, 0]
                })
            });

            this.create(XEO.Entity, {  // Shaft
                geometry: arrowShaft,
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
                    xyz: [0, 2, 0]
                })
            });

            this.create(XEO.Entity, {  // Label
                geometry: this.create(XEO.VectorTextGeometry, {text: "up", xSize: 1.5, ySize: 1.5}, "yLabel"),
                material: yAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
                    xyz: [0, 7, 0]
                }),
                billboard: billboard
            });

            // Target

            this.create(XEO.Entity, {  // Arrow
                geometry: arrowHead,
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
                    xyz: [0, 5, 0],
                    parent: this.create(XEO.Rotate, {
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            });

            this.create(XEO.Entity, {  // Shaft
                geometry: arrowShaft,
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
                    xyz: [0, 2, 0],
                    parent: this.create(XEO.Rotate, {
                        xyz: [1, 0, 0],
                        angle: 90
                    })
                })
            });

            this.create(XEO.Entity, {  // Label
                geometry: this.create(XEO.VectorTextGeometry, {text: "Z", xSize: 1.5, ySize: 1.5}, "zLabel"),
                material: zAxisMaterial,
                visibility: visibility,
                modes: modes,
                transform: this.create(XEO.Translate, {
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
