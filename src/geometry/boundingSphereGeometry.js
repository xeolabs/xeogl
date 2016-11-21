/**
 An **BoundingSphereGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that shows the extents of a World-space bounding sphere.

 <a href="../../examples/#boundaries_Entity_worldBoundary_sphere"><img src="http://i.giphy.com/3oz8xRv4g56Y4pZKWk.gif"></img></a>

 ## Overview

 * A sphere is given as a four-element Float32Array containing elements````[x,y,z,radius]````.
 * Set the BoundingSphereGeometry's {{#crossLink "BoundingSphereGeometry/sphere:property"}}{{/crossLink}} property to a sphere to fix the BoundingSphereGeometry to those extents, or
 * Set the BoundingSphereGeometry's {{#crossLink "BoundingSphereGeometry/boundary:property"}}{{/crossLink}} property to a {{#crossLink "Boundary3D"}}{{/crossLink}}
 to make it dynamically fit itself to changes in the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/sphere:property"}}{{/crossLink}} extents.

 ## Examples

 * [Rendering a BoundingSphereGeometry](../../examples/#boundaries_Entity_worldBoundary_sphere)

 ## Usage

 In the example below we'll render a transparent {{#crossLink "Entity"}}{{/crossLink}} with a BoundingSphereGeometry that shows the spherical extents of the
 World-space {{#crossLink "Boundary3D"}}{{/crossLink}} of another {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript
 // First Entity with a TorusGeometry
 var torus = new xeogl.Entity({
     geometry: new xeogl.TorusGeometry()
 });

 // Second Entity with an BoundingSphereGeometry that shows a wireframe box
 // for the World-space boundary of the first Entity

 var boundaryHelper = new xeogl.Entity({

     geometry: new xeogl.BoundingSphereGeometry({
         boundary: torus.worldBoundary
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         opacity: 0.4
     }),

     modes: new xeogl.Modes({
        transparent: true
     })
 });
 ````

 Now whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position, our BoundingSphereGeometry will automatically
 update to stay fitted to it.

 As shown below, we can also directly configure the BoundingSphereGeometry with
 the {{#crossLink "Boundary3D"}}{{/crossLink}}'s {{#crossLink "Boundary3D/aabb:property"}}AABB{{/crossLink}}. In this second example, we'll
 show the sphere as wireframe.

 ````javascript
 var boundaryHelper2 = new xeogl.Entity({

     geometry: new xeogl.BoundingSphereGeometry({
         boundary: torus.worldBoundary.sphere,
         primitive: "lines"
     }),

     material: new xeogl.PhongMaterial({
         diffuse: [0.5, 1.0, 0.5],
         emissive: [0.5, 1.0, 0.5],
         lineWidth:2
     })
 });
 ````
 Note that, without the reference to a {{#crossLink "Boundary3D"}}{{/crossLink}}, our second BoundingSphereGeometry is fixed to the
 given AABB and will not automatically update whenever our torus {{#crossLink "Entity"}}{{/crossLink}} changes shape or position.

 @class BoundingSphereGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BoundingSphereGeometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BoundingSphereGeometry.
 @param [cfg.boundary] {Number|String|Boundary3D} ID or instance of a {{#crossLink "Boundary3D"}}{{/crossLink}}.
 @param [cfg.aabb] {Float32Array} An axis-aligned box (AABB) in a six-element Float32Array
 containing the min/max extents of the axis-aligned volume, ie. ````(xmin,ymin,zmin,xmax,ymax,zmax)````.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.BoundingSphereGeometry = xeogl.SphereGeometry.extend({

        type: "xeogl.BoundingSphereGeometry",

        _init: function (cfg) {

            this._super(cfg);

           // this.primitive = cfg.primitive || "lines";

            if (cfg.boundary) {
                this.boundary = cfg.boundary;

            } else if (cfg.sphere) {
                this.sphere = cfg.sphere;
            }
        },

        _props: {

            /**
             A {{#crossLink "Boundary3D"}}{{/crossLink}} whose {{#crossLink "Boundary3D/aabb:property"}}OBB{{/crossLink}} we'll
             dynamically fit this OBBGeometry to.

             This property effectively replaces the {{#crossLink "BoundingSphereGeometry/aabb:property"}}{{/crossLink}} property.

             Fires a {{#crossLink "BoundingSphereGeometry/boundary:event"}}{{/crossLink}} event on change.

             @property boundary
             @type Boundary3D
             */
            boundary: {

                set: function (value) {

                    var geometryDirty = false;
                    var self = this;

                    /**
                     * Fired whenever this BoundingSphereGeometry's {{#crossLink "BoundingSphereGeometry/boundary:property"}}{{/crossLink}}
                     * property changes.
                     *
                     * @event boundary
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "boundary",
                        type: "xeogl.Boundary3D",
                        component: value,
                        sceneDefault: false,
                        on: {
                            updated: function () {
                                if (geometryDirty) {
                                    return;
                                }
                                geometryDirty = true;
                                xeogl.scheduleTask(function () {
                                    self._setFromSphere(self._attached.boundary.sphere);
                                    geometryDirty = false;
                                });
                            }
                        },
                        onAttached: function () {
                            self._setFromSphere(self._attached.boundary.sphere);
                        }
                    });
                },

                get: function () {
                    return this._attached.boundary;
                }
            },

            /**
             Sets this BoundingSphereGeometry to an axis-aligned box (SPHERE), given as a six-element Float32Array
             containing the min/max extents of the
             axis-aligned volume, ie. ````[xmin,ymin,zmin,xmax,ymax,zmax]````.

             This property overrides the {{#crossLink "BoundingSphereGeometry/boundary:property"}}{{/crossLink}} property, causing it to become null.

             @property sphere
             @type Float32Array
             */
            sphere: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (this._attached.boundary) {
                        this.boundary = null;
                    }

                    this._setFromSphere(value);
                }
            }
        },

        _setFromSphere: (function () {

            var vec3 = xeogl.math.vec3();

            return function (sphere) {

                vec3[0] = sphere[0];
                vec3[1] = sphere[1];
                vec3[2] = sphere[2];

                this.center = vec3;
                this.radius = sphere[4];
            };
        })()

        //_getJSON: function () {
        //
        //    var json = {};
        //
        //    if (this._attached.boundary) {
        //        json.boundary = this._attached.boundary.id;
        //
        //    } else if (this.positions) {
        //        this.positions = this.positions;
        //    }
        //
        //    return json;
        //},

    });
})();
