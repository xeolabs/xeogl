/**
 A **Billboard** is a modelling {{#crossLink "Transform"}}{{/crossLink}} that causes associated {{#crossLink "Entity"}}Entities{{/crossLink}} to be always oriented towards the Camera.

 <a href="../../examples/#billboards_spherical"><img src="http://i.giphy.com/l3vR13LcnTuQGMInu.gif"></img></a>

 ## Overview

 * **Spherical** billboards are free to rotate their {{#crossLink "Entity"}}Entities{{/crossLink}} in any direction and always face the {{#crossLink "Camera"}}{{/crossLink}} perfectly.
 * **Cylindrical** billboards rotate their {{#crossLink "Entity"}}Entities{{/crossLink}} towards the {{#crossLink "Camera"}}{{/crossLink}}, but only about the Y-axis.
 * A Billboard will cause {{#crossLink "Scale"}}{{/crossLink}} transformations to have no effect on its {{#crossLink "Entity"}}Entities{{/crossLink}}

 <img src="../../../assets/images/Billboard.png"></img>

 ## Examples

 * [Spherical billboards](../../examples/#billboards_spherical)
 * [Cylindrical billboards](../../examples/#billboards_cylindrical)
 * [Clouds using billboards](../../examples/#billboards_spherical_clouds)
 * [Spherical billboards with video textures](../../examples/#billboards_spherical_video)

 ## Usage

 Let's create 1000 randomly-positioned {{#crossLink "Entity"}}Entities{{/crossLink}} that always face towards the
 viewpoint as we orbit the {{#crossLink "Camera"}}{{/crossLink}} about the X and Y axis:

 ```` javascript
 // Create 1000 Entities in default Scene with shared Geometry, PhongMaterial and Billboard

 var geometry = new xeogl.Geometry({
     primitive: "triangles",
     positions: [3, 3, 0, -3, 3, 0, -3, -3, 0, 3, -3, 0],
     normals: [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0],
     uv: [1, 1, 0, 1, 0, 0, 1, 0],
     indices: [2, 1, 0, 3, 2, 0] // Ensure these will be front-faces
 });

 var material = new xeogl.PhongMaterial({
     emissiveMap: new xeogl.Texture({
         src: "textures/diffuse/teapot.jpg"
     })
 });

 var billboard = new xeogl.Billboard({
     spherical: true
 });

 for (var i = 0; i < 1000; i++) {
     new xeogl.Entity({
         geometry: geometry,
         material: material,
         billboard: billboard,
         transform: new xeogl.Translate({
             xyz: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50]
         })
     });
 }

 // Move eye back to see everything, then orbit the Camera

 var scene = xeogl.scene;

 scene.camera.view.zoom(120);

 scene.on("tick", function () {

          var view = scene.camera.view;

          view.rotateEyeY(0.2);
          view.rotateEyeX(0.1);
     });
 ````

 @class Billboard
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Billboard in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Billboard.
 @param [cfg.active=true] {Boolean} Indicates if this Billboard is active or not.
 @param [cfg.spherical=true] {Boolean} Indicates if this Billboard is spherical (true) or cylindrical (false).
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Billboard = xeogl.Component.extend({

        type: "xeogl.Billboard",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new xeogl.renderer.Billboard({
                active: true,
                spherical: true,
                hash: "a;s;"
            });

            this.active = cfg.active !== false;
            this.spherical = cfg.spherical !== false;
        },

        _props: {

            /**
             * Flag which indicates whether this Billboard is active or not.
             *
             * Fires an {{#crossLink "Billboard/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._state.active === value) {
                        return;
                    }

                    this._state.active = value;

                    this._state.hash = (this._state.active ? "a;" : ";") + (this._state.spherical ? "s;" : ";");

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Billboard's {{#crossLink "Billboard/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._state.active);
                },

                get: function () {
                    return this._state.active;
                }
            },

            /**
             * Flag which indicates whether this Billboard is spherical (true) or cylindrical (false).
             *
             * Fires an {{#crossLink "Billboard/spherical:event"}}{{/crossLink}} event on change.
             *
             * @property spherical
             * @type Boolean
             */
            spherical: {

                set: function (value) {

                    value = !!value;

                    if (this._state.spherical === value) {
                        return;
                    }

                    this._state.spherical = value;

                    this._state.hash = (this._state.active ? "a;" : ";") + (this._state.spherical ? "s;" : ";");

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Billboard's {{#crossLink "Billboard/spherical:property"}}{{/crossLink}} property changes.
                     * @event spherical
                     * @param value The property's new value
                     */
                    this.fire('spherical', this._state.spherical);
                },

                get: function () {
                    return this._state.spherical;
                }
            }
        },

        _compile: function () {
            this._renderer.billboard = this._state;
        },


        _getJSON: function () {
            return {
                active: this._state.active
            };
        }
    });

})();
