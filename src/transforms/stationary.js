/**
 A **Stationary** disables the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}} translations for
 associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}}.

 ## Overview

 <img src="../../../assets/images/Stationary.png"></img>

 ## Examples

 * [Custom Skybox using a Stationary component](../../examples/#skyboxes_customSkybox)

 ## Usage

 An {{#crossLink "Entity"}}{{/crossLink}} with a Stationary that will cause it to never translate with respect to
 the viewpoint, as if far away.

 ````javascript
 new xeogl.Entity({

     geometry: new xeogl.BoxGeometry({
         xSize: 1,
         ySize: 1,
         zSize: 1
     }),

     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
         })
     }),

     stationary: new xeogl.Stationary({ // Locks position with respect to viewpoint
         active: true
     })
 });
 ````

 @class Stationary
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Stationary in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Stationary.
 @param [cfg.active=true] {Boolean} Indicates if this Stationary is active or not.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Stationary = xeogl.Component.extend({

        type: "xeogl.Stationary",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new xeogl.renderer.Stationary({
                active: true
            });

            this.active = cfg.active !== false;
        },

        _props: {

            /**
             * Flag which indicates whether this Stationary is active or not.
             *
             * Fires an {{#crossLink "Stationary/active:event"}}{{/crossLink}} event on change.
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

                    this._state.hash = (this._state.active ? "a;" : ";");

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Stationary's {{#crossLink "Stationary/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._state.active);
                },

                get: function () {
                    return this._state.active;
                }
            }
        },

        _compile: function () {
            this._renderer.stationary = this._state;
        },


        _getJSON: function () {
            return {
                active: this._state.active
            };
        }
    });

})();
