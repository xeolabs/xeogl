/**
 A **Skybox** is a textured box that does not translate with respect to the
 {{#crossLink "Lookat"}}viewing transform{{/crossLink}}, to a provide the appearance of a background
 for associated {{#crossLink "Entities"}}Entities{{/crossLink}}.

 <a href="../../examples/#skyboxes_skybox"><img src="http://i.giphy.com/3o7TKIBOOCEC5gJ224.gif"></img></a>

 ## Examples

 <ul>
 <li>[Basic Skybox](../../examples/#skyboxes_skybox)</li>
 <li>[Custom Skybox](../../examples/#skyboxes_customSkybox)</li>
 </ul>

 ## Usage

 In the example below we're going to create twenty randomly-positioned and colored {{#crossLink "Entity"}}Entities{{/crossLink}}
 and wrap them in a Skybox. The Skybox will use the texture image shown below, and the result will appear like the screen capture shown above.

 <img src="../../assets/images/skyboxMiramarClouds.jpg">

 ````javascript
 // A bunch of random cube Entities

 // Share this BoxGeometry among the Entities
 var boxGeometry = new BoxGeometry();

 for (var i = 0; i < 20; i++) {
        new xeogl.Entity({
            geometry: boxGeometry,
            transform: new xeogl.Translate({
                xyz: [
                    Math.random() * 15 - 7,
                    Math.random() * 15 - 7,
                    Math.random() * 15 - 7
                ]
            }),
            material: new xeogl.PhongMaterial({
                diffuse: [
                    Math.random(),
                    Math.random(),
                    Math.random()
                ]
            })
        });
    }

 // A Skybox that wraps our Entities in a cloudy background
 var skybox = new xeogl.Skybox({
        src: "textures/skybox/miramarClouds.jpg",
        size: 1000 // Default
    });

 // Get the default Scene off the Skybox
 var scene = skybox.scene;

 // Move the camera back a bit
 scene.camera.view.eye = [0, 0, -30];

 // Slowly orbit the camera on each frame
 scene.on("tick", function () {
         scene.camera.view.rotateEyeY(0.2);
     });
 ````

 @class Skybox
 @module xeogl
 @submodule skyboxes
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Skybox within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} Skybox configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Skybox.
 @param [cfg.src=[null]] {String} Path to skybox texture
 @param [cfg.size=1000] {Number} Size of this Skybox, given as the distance from the center at [0,0,0] to each face.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Skybox = xeogl.Component.extend({

        type: "xeogl.Skybox",

        _init: function (cfg) {

            this._skyboxEntity = this.create({

                type: "xeogl.Entity",

                geometry: this.create({ // Box-shaped geometry
                        type: "xeogl.Geometry",
                        primitive: "triangles",
                        positions: [
                            1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, // v0-v1-v2-v3 front
                            1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, // v0-v3-v4-v5 right
                            1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, // v0-v5-v6-v1 top
                            -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, // v1-v6-v7-v2 left
                            -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // v7-v4-v3-v2 bottom
                            1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1 // v4-v7-v6-v5 back
                        ],
                        uv: [
                            0.5, 0.6666,
                            0.25, 0.6666,
                            0.25, 0.3333,
                            0.5, 0.3333,

                            0.5, 0.6666,
                            0.5, 0.3333,
                            0.75, 0.3333,
                            0.75, 0.6666,

                            0.5, 0.6666,
                            0.5, 1,
                            0.25, 1,
                            0.25, 0.6666,

                            0.25, 0.6666,
                            0.0, 0.6666,
                            0.0, 0.3333,
                            0.25, 0.3333,

                            0.25, 0,
                            0.50, 0,
                            0.50, 0.3333,
                            0.25, 0.3333,

                            0.75, 0.3333,
                            1.0, 0.3333,
                            1.0, 0.6666,
                            0.75, 0.6666
                        ],
                        indices: [
                            0, 1, 2,
                            0, 2, 3,
                            4, 5, 6,
                            4, 6, 7,
                            8, 9, 10,
                            8, 10, 11,
                            12, 13, 14,
                            12, 14, 15,

                            16, 17, 18,
                            16, 18, 19,

                            20, 21, 22,
                            20, 22, 23
                        ]
                    },
                    "geometryInstance"), // Use same Geometry for all Skyboxes

                transform: this.create({ // Scale the box
                    type: "xeogl.Scale",
                    xyz: [2000, 2000, 2000] // Overridden when we initialize the 'size' property, below
                }),

                material: this.create({ // Emissive map of sky, no diffuse, ambient or specular reflection
                        type: "xeogl.PhongMaterial",
                        ambient: [0, 0, 0],
                        diffuse: [0, 0, 0],
                        specular: [0, 0, 0],
                        emissiveMap: this.create({
                            type: "xeogl.Texture",
                            src: cfg.src
                        })
                    },
                    "materialInstance"), // Use same PhongMaterial for all Skyboxes

                stationary: this.create({ // Lock skybox position with respect to viewpoint
                        type: "xeogl.Stationary",
                        active: true
                    },
                    "stationaryInstance"), // Use same Stationary for all SkyBoxes

                modes: this.create({
                        type: "xeogl.Modes",
                        backfaces: true, // Show interior faces of our skybox geometry
                        pickable: false, // Don't want to ba able to pick skybox

                        // SkyBox does not contribute to the size of any enclosing boundaries
                        // that might be calculated by xeogl, eg. like that returned by xeogl.Scene#worldBoundary
                        collidable: false
                    },
                    "modesInstance") // Use same Modes for all Skyboxes
            });

            this.size = cfg.size; // Sets 'xyz' property on the Entity's Scale transform
        },

        _props: {

            /**
             * Size of this Skybox, given as the distance from the center at [0,0,0] to each face.
             *
             * Fires an {{#crossLink "Skybox/size:event"}}{{/crossLink}} event on change.
             *
             * @property size
             * @default 1000
             * @type {Number}
             */
            size: {

                set: function (value) {

                    this._size = value || 1000;

                    this._skyboxEntity.transform.xyz = [this._size, this._size, this._size];

                    /**
                     Fired whenever this Skybox's {{#crossLink "Skybox/size:property"}}{{/crossLink}} property changes.

                     @event size
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("size", this._size);
                },

                get: function () {
                    return this._size;
                }
            }
        },

        _getJSON: function () {
            return {
                src: this._skyboxEntity.material.emissiveMap.src,
                size: this._size
            };
        }
    });

})();
