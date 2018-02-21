/**
 A **Translate** is a {{#crossLink "Transform"}}{{/crossLink}} that translates associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}}.

 ## Overview

 * Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.
 * When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a leaf {{#crossLink "Transform"}}{{/crossLink}}
 within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be transformed by each {{#crossLink "Transform"}}{{/crossLink}}
 on the path up to the root, in that order.

 <img src="../../../assets/images/Translate.png"></img>

 ## Examples

 * [Modeling transform hierarchy](../../examples/#transforms_entity_hierarchy)

 ## Usage

 This example has two {{#crossLink "Entity"}}Entities{{/crossLink}} that are transformed by a hierarchy that contains
 {{#crossLink "Rotate"}}{{/crossLink}}, Translate and {{#crossLink "Scale"}}{{/crossLink}} transforms.
 The Entities share the same {{#crossLink "BoxGeometry"}}{{/crossLink}}.<br>

 ````javascript
 var rotate = new xeogl.Rotate({
    xyz: [0, 1, 0], // Rotate 30 degrees about Y axis
    angle: 30
 });

 var translate1 = new xeogl.Translate({
    parent: rotate,
    xyz: [-5, 0, 0] // Translate along -X axis
 });

 var translate2 = new xeogl.Translate({
    parent: rotate,
    xyz: [5, 0, 0] // Translate along +X axis
 });

 var scale = new xeogl.Scale({
    parent: translate2,
    xyz: [1, 2, 1] // Scale x2 on Y axis
 });

 var geometry = new xeogl.BoxGeometry();

 var entity1 = new xeogl.Entity({
    transform: translate1,
    geometry: geometry
 });

 var entity2 = new xeogl.Entity({
    transform: scale,
    geometry: geometry
 });
 ````

 Since everything in xeogl is dynamically editable, we can restructure the transform hierarchy at any time.

 Let's insert a {{#crossLink "Scale"}}{{/crossLink}} between the first Translate and the first {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript
 var scale2 = new xeogl.Scale({
    parent: translate1,
    xyz: [1, 1, 2] // Scale x2 on Z axis
 });

 entity2.transform = scale2;
 ````

 And just for fun, we'll start updating the second {{#crossLink "Translate"}}{{/crossLink}}:

 ````javascript
 // Rotate 0.2 degrees on each frame
 scene.on("tick", function(e) {
    var xyz = translate2.xyz;
    xyz[0] += 0.2;
    translate2.xyz = xyz;
 });
 ````

 @class Translate
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Translate in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Translate.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.xyz=[0,0,0]] {Float32Array} The translation vector
 @extends Transform
 */
(function () {

    "use strict";

    xeogl.Translate = xeogl.Transform.extend({

        type: "xeogl.Translate",

        _init: function (cfg) {

            this._super(cfg);

            this.xyz = cfg.xyz;
        },

        _props: {

            /**
             * Vector indicating a translation amount for each axis.
             *
             * @property xyz
             * @default [0,0,0]
             * @type {Float32Array}
             */
            xyz: {

                set: function (value) {
                    (this._xyz = this._xyz || new xeogl.math.vec3()).set(value || [0, 0, 0]);
                    this.matrix = xeogl.math.translationMat4v(this._xyz, this._matrix);
                },

                get: function () {
                    return this._xyz;
                }
            }
        }
    });
})();
