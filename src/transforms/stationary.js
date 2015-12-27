/**

 A **Stationary** disables the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}} translations for
 associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 TODO

 ## Example

 TODO

 @class Stationary
 @module XEO
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

    XEO.Stationary = XEO.Component.extend({

        type: "XEO.Stationary",

        _init: function (cfg) {

            this._super(cfg);

            this._state = new XEO.renderer.Stationary({
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
