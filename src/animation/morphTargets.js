(function () {

    "use strict";


    /**
     A **MorphTargets** defines interpolation targets for morphing {{#crossLink "Geometry"}}Geometry{{/crossLink}}s on
     attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

     <img src="../../../assets/images/MorphTargets.png"></img>

     ## Usage

     TODO


     @module xeogl
     @submodule animation
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this MorphTarget in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this MorphTarget.
     @param [cfg.targets=[]] {Array} The morph targets.
     @param [cfg.factor=0] {Number} The morph factor.
     @extends Component
     */
    xeogl.MorphTargets = xeogl.Component.extend({

        type: "xeogl.MorphTargets",

        _init: function (cfg) {

            this.scene.on("webglContextRestored",
                function () {

                });

            this.targets = cfg.targets;
            this.factor = cfg.factor;
        },


        _props: {

            /**
             * The morph targets.
             *
             *TODO
             *
             * @property targets
             * @default []
             * @type Array
             */
            targets: {

                set: function (value) {

                    /**
                     * Fired whenever this MorphTarget's  {{#crossLink "MorphTargets/targets:property"}}{{/crossLink}} property changes.
                     * @event targets
                     * @param value The property's new value
                     */
                },

                get: function () {

                }
            },

            /**
             * The morph factor
             *
             * @property factor
             * @default 0
             * @type Number
             */
            factor: {

                set: function (value) {

                    /**
                     * Fired whenever this MorphTarget's  {{#crossLink "MorphTargets/factor:property"}}{{/crossLink}} property changes.
                     * @event factor
                     * @param value The property's new value
                     */
                },

                get: function () {
                    return 0;
                    return this._state.factor;
                }
            },

            _compile: function () {
                this._renderer.MorphTargets = this._state;
            }
        },

        /**
         * JSON representation of this component
         * @property json
         * @type Object
         */

        _getJSON: function () {
            return {
                targets: this.targets,
                factor: this.factor
            };
        }
    });

})();


