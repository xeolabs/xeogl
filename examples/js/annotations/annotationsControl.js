/**
 Manages the **AnnotationsControl** within a Scene.

 @class AnnotationsControl
 @module XEO
 @submodule annotation
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this AnnotationsControl in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AnnotationsControl.
 @param [cfg.active=true] {Boolean} Whether or not this AnnotationsControl is active.
 @extends Component
 */
(function () {

    "use strict";

    XEO.AnnotationsControl = XEO.Component.extend({

        type: "XEO.AnnotationsControl",

        _init: function (cfg) {

            this.annotations = {};

            this._mousePickEntity = this.create(XEO.MousePickEntity, {
                rayPick: true
            });

            this._mousePickEntity.on("pick",
                function (hit) {

                    if (hit.entity && hit.localPos) {

                        this.createAnnotation({
                            entity: entity,
                            worldPos: hit.worldPos,
                            title: "none",
                            visible: true,
                            open: true
                        });
                    }
                },
                this);

            this.active = cfg.active !== false;
        },

        /**
         * Creates an annotation on an object
         *
         * @param {*} params
         * @param {Entity} params.entity
         * @param {Float32Array} params.worldPos
         * @param {String} params.title
         * @param {String} params.desc
         * @param {Boolean} params.visible
         * @param {Boolean} params.open
         */
        createAnnotation: function (params) {
            var a = new XEO.Annotation(params);
            this.annotations[a.id] = a;
        },

        _props: {

            /**
             * Flag which indicates whether this AnnotationsControl is active or not.
             *
             * Fires an {{#crossLink "AnnotationsControl/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = !!value;

                    if (this._active === value) {
                        return;
                    }

                    this._mousePickEntity.active = value;

                    this._active = value;

                    /**
                     * Fired whenever this AnnotationsControl's {{#crossLink "AnnotationsControl/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _getJSON: function () {

            var json = {
                active: this._active
            };

            return json;
        },

        _destroy: function () {
            this.active = false;
        }
    });
})();
