/**
 A **ZSpaceStylusHelper** shows a {{#crossLink "ZSpace"}}{{/crossLink}} stylus as an object within the 3D view.

 ## Examples

 <ul>
 <li>[zSpace with random geometries](../../examples/#webvr_zspace_geometries)</li>
 <li>[zSpace with glTF gearbox model](../../examples/#webvr_zspace_gltf_gearbox)</li>
 </ul>

 ## Usage

 In the example below, we'll create an {{#crossLink "Entity"}}{{/crossLink}} in xeoEngine's default
 {{#crossLink "Scene"}}{{/crossLink}}. Then we'll also create a {{#crossLink "ZSpace"}}{{/crossLink}}, which
 enables us to view and interact with the {{#crossLink "Scene"}}{{/crossLink}} using a ZSpace viewer.
 Finally, we'll create a **ZSpaceStylusHelper** to access the viewer's stylus input.

 ````javascript
 // Create an Entity

 new XEO.Entity({
     geometry: new XEO.TorusGeometry(),
     material: new XEO.PhongMaterial({
        diffuseMap: new XEO.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
        })
     })
 });

 // View it with a ZSpace viewer

 var zspace = new XEO.ZSpace();

 // Create a ZSpaceStylusHelper to show the viewer's stylus as an object in the 3D view

 var stylusHelper = new XEO.ZSpaceStylusHelperHelper({
     zspace: zspace
 });

 // Make our ZSpaceStylusHelper glow whenever the stylus intersects an Entity

 zspace.on("stylusMoved", function() {

        var hit = zspace.scene.pick({
            rayPick: true,
            origin: zspace.stylusPos,
            direction: zspace.stylusOrientation
        });

        if (hit) { // Picked an Entity

            stylusHelper.highlighted = true;

            // These properties are only on the hit result when we do a ray-pick:

            var primitive = hit.primitive; // Type of primitive that was picked, usually "triangles"
            var primIndex = hit.primIndex; // Position of triangle's first index in the picked Entity's Geometry's indices array
            var indices = hit.indices; // UInt32Array containing the triangle's vertex indices
            var localPos = hit.localPos; // Float32Array containing the picked Local-space position on the triangle
            var worldPos = hit.worldPos; // Float32Array containing the picked World-space position on the triangle
            var viewPos = hit.viewPos; // Float32Array containing the picked View-space position on the triangle
            var bary = hit.bary; // Float32Array containing the picked barycentric position within the triangle
            var normal = hit.normal; // Float32Array containing the interpolated normal vector at the picked position on the triangle
            var uv = hit.uv; // Float32Array containing the interpolated UV coordinates at the picked position on the triangle

            //...

        } else {

            stylusHelper.highlighted = false;
        }
     });
 ````

 @class ZSpaceStylusHelper
 @module XEO
 @submodule webvr
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ZSpaceStylusHelper in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ZSpaceStylusHelper.
 @param [cfg.ZSpace] {ZSpace} ID or instance of a {{#crossLink "ZSpace"}}{{/crossLink}} for this ZSpaceStylusHelper.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this ZSpaceStylusHelper.
 @param [cfg.visible=true] {Boolean} Shows the ray as a line segment in the 3D view when true.
 @param [cfg.highlighted=false] {Boolean} When true, highlights this ZSPaceStylusHelper in the 3D view by making it glow a different color.
 @extends Component
 */
(function () {

    "use strict";

    var math = XEO.math;

    XEO.ZSpaceStylusHelper = XEO.Component.extend({

        type: "XEO.ZSpaceStylusHelper",

        _init: function (cfg) {

            this._super(cfg);

            this._helper = this.create(XEO.Entity, {
                geometry: this.create(XEO.Geometry, {
                    positions: [0, 0, 0, 0, 0, 0],
                    indices: [0, 1]
                }),
                material: this.create(XEO.PhongMaterial, {
                    diffuse: [1, 0.3, 0.3],
                    ambient: [0.0, 0.0, 0.0],
                    specular: [.6, .6, .3],
                    shininess: 80,
                    lineWidth: 3
                }),
                modes: this.create(XEO.Modes, {
                    pickable: false,
                    collidable: false
                }),
                visibility: this.create(XEO.Visibility, {
                    visible: true
                })
            });

            this.zspace = cfg.zspace;
            this.visible = cfg.visible;
            this.highlighted = cfg.highlighted;
        },

        _updateHelper: (function () {
            var positions = new Float32Array(6);
            return function (origin, direction) {
                positions[0] = origin[0];
                positions[1] = origin[1];
                positions[2] = origin[2];
                positions[3] = origin[0] + direction[0];
                positions[4] = origin[1] + direction[1];
                positions[5] = origin[2] + direction[2];
                this._helper.geometry.positions = positions;
            };
        })(),

        _props: {

            /**
             * The {{#crossLink "ZSpace"}}{{/crossLink}} this ZSpaceStylusHelper is currently connected to.
             *
             * Fires a {{#crossLink "ZSpaceStylusHelper/zspace:event"}}{{/crossLink}} event on change.
             *
             * @property zspace
             * @type ZSpace
             */
            zspace: {

                set: function (value) {

                    var self = this;

                    this._attach({
                        name: "zspace",
                        type: "XEO.ZSpace",
                        component: value,
                        sceneDefault: false,
                        on: {
                            stylusMoved: function () {
                                self._updateHelper(this.stylusPos, this.stylusOrientation);
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.zspace;
                }
            },

            /**
             * Shows the ray as a line segment in the 3D view when true.
             *
             * Fires an {{#crossLink "ZSpaceStylusHelper/visible:event"}}{{/crossLink}} event on change.
             *
             * @property visible
             * @type Boolean
             * @default true
             */
            visible: {

                set: function (value) {

                    value = !!value;

                    if (this._visible === value) {
                        return;
                    }

                    this._visible = value;

                    this._helper.visibility.visible = value;

                    /**
                     * Fired whenever this ZSpaceStylusHelper's {{#crossLink "ZSpaceStylusHelper/visible:property"}}{{/crossLink}} property changes.
                     * @event visible
                     * @param value The property's new value
                     */
                    this.fire('visible', this._visible);
                },

                get: function () {
                    return this._visible;
                }
            },

            /**
             * Whether to highlight this ZSpaceStylusHelper or not.
             *
             * Fires an {{#crossLink "ZSpaceStylusHelper/highlighted:event"}}{{/crossLink}} event on change.
             *
             * @property highlighted
             * @type Boolean
             * @default false
             */
            highlighted: {

                set: function (value) {

                    value = !!value;

                    if (this._highlighted === value) {
                        return;
                    }

                    this._highlighted = value;

                    this._helper.material.emissive = value ? [1.0, 0.5, 0.5] : [0.5, 0.3, 0.3];

                    /**
                     * Fired whenever this ZSpaceStylusHelper's {{#crossLink "ZSpaceStylusHelper/highlighted:property"}}{{/crossLink}} property changes.
                     * @event highlighted
                     * @param value The property's new value
                     */
                    this.fire('highlighted', this._highlighted);
                },

                get: function () {
                    return this._highlighted;
                }
            }
        }
    });
})();
