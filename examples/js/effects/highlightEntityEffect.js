/**
 A **HighlightEntityEffect** highlights a single target {{#crossLink "Entity"}}{{/crossLink}}.

 This component works by by rendering a transparent glowing copy of the {{#crossLink "Entity"}}{{/crossLink}}, after
 all other {{#crossLink "Entity"}}Entities{{/crossLink}} have rendered, with depth testing disabled so that it's
 entirely visible even when other {{#crossLink "Entity"}}Entities{{/crossLink}} overlap it.

 ## Examples

 <ul>
 <li>[HighlightEntityEffect example](../../examples/#effects_HighlightEntityEffect)</li>
 </ul>

 ## Usage

 ````javascript

 // Create an entity

 var entity = new XEO.Entity({
     geometry: new XEO.TorusGeometry(),
     material: new XEO.PhongMaterial({         
         diffuse: [0.4, 0.4, 0.9]
     })
 });

 // Position the default camera

 var view = entity.scene.camera.view;
 view.eye = [0, 40, -80];

 // Highlight the entity

 var entityHighlight = new XEO.HighlightEntityEffect();

 entityHighlight.entity = entity;
 entityHighlight.active = true;  // Active by default
 ````

 @class HighlightEntityEffect
 @module xeo
 @submodule effects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this HighlightEntityEffect in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this HighlightEntityEffect.
 @param [cfg.entity] {String|Number|Entity} ID or instance of the {{#crossLink "Entity"}}{{/crossLink}} to highlight with this HighlightEntityEffect.
 @param [cfg.active=true] Flag which indicates whether this HighlightEntityEffect is active or not.
 @extends Entity
 */
(function () {

    "use strict";

    XEO.HighlightEntityEffect = XEO.Component.extend({

        type: "XEO.HighlightEntityEffect",

        _init: function (cfg) {

            this._helper = this.create(XEO.Entity, {

                geometry: null,
                transform: null,

                material: this.create(XEO.PhongMaterial, {
                    emissive: [0.6, 0.6, 0.6],
                    opacity: 0.6
                }, "material"),

                visibility: this.create(XEO.Visibility, {
                    visible: false
                }),

                modes: this.create(XEO.Modes, {
                    transparent: true
                }, "modes"),

                stage: this.create(XEO.Stage, {
                    priority: 2
                }, "stage"),

                depthBuf: this.create(XEO.DepthBuf, {
                    active: false
                }, "depthBuf")
            });

            this.entity = cfg.entity;
            this.active = cfg.active;
        },

        _props: {

            /**
             * ID or instance of the {{#crossLink "Entity"}}{{/crossLink}} to highlight with this HighlightEntityEffect.
             *
             * Fires a {{#crossLink "HighlightEntityEffect/entity:event"}}{{/crossLink}} event on change.
             *
             * @property entity
             * @type Entity
             * @default null
             */
            entity: {

                set: function (value) {

                    var helper = this._helper;

                    /**
                     * Fired whenever this Highlights's {{#crossLink "HighlightEntityEffect/entity:property"}}{{/crossLink}} property changes.
                     * @event entity
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "entity",
                        type: "XEO.Entity",
                        component: value,
                        sceneDefault: false,

                        // Event plumping

                        on: {
                            material: function (material) {
                                if (material) {
                                    helper.material.diffuse = material.diffuse;
                                    helper.material.ambient = material.ambient;
                                }
                            },
                            geometry: function (geometry) {
                                helper.geometry = geometry;
                            },
                            transform: function (transform) {
                                helper.transform = transform;
                            },
                            destroyed: function () {
                                helper.geometry = null;
                                helper.transform = null;
                            }
                        },
                        onDetached: function () {
                            helper.geometry = null;
                            helper.transform = null;
                        }
                    });
                },

                get: function () {
                    return this._attached.entity;
                }
            },

            /**
             * Flag which indicates whether this HighlightEntityEffect is active or not.
             *
             * Fires an {{#crossLink "HighlightEntityEffect/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             * @default true
             */
            active: {

                set: function (value) {

                    value = value !== false;

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;

                    this._helper.visibility.visible = this._active;

                    /**
                     * Fired whenever this HighlightEntityEffect's {{#crossLink "HighlightEntityEffect/active:property"}}{{/crossLink}} property changes.
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

            if (this._attached.entity) {
                json.entity = this._attached.entity.id;
            }

            return json;
        }
    });
})();