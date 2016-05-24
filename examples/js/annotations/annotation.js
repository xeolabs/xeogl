/**
 A **Annotation** is a label that's attached to a {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Example

 ````javascript
 
 var a = new XEO.Annotation({
    entity: torus,
    localPos: [4,4,4],
    title: "My annotation",
    desc: "A few words for the description.",
    offset: [0,0,0],
    visible: true, // Pin is visible, and label will be also visible while open
    open: true // Label is open
 });
 ````

 @class Annotation
 @module XEO
 @submodule annotations
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Annotation in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Annotation.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Annotation = XEO.Geometry.extend({

        type: "XEO.Annotation",

        _init: function (cfg) {

            /**
             * The Annotation's {{#crossLink "Pin"}}{{/crossLink}}.
             *
             * @property pin
             * @type XEO.Pin
             * @final
             */
            this.pin = this.create(XEO.Pin, {
                entity: cfg.entity,
                worldPos: cfg.worldPos,
                visible: cfg.visible
            });

            /**
             * The Annotation's {{#crossLink "Label"}}{{/crossLink}}.
             *
             * @property pin
             * @type XEO.Pin
             * @final
             */
            this.label = this.create(XEO.Label, {
                pin: this.pin,
                title: cfg.title,
                desc: cfg.desc,
                offset: cfg.offset,
                open: cfg.open
            });
        }
    });

})();
