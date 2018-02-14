/**
 A **Rotate** is a {{#crossLink "Transform"}}{{/crossLink}} that rotates associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}} about an axis vector.

 ## Overview

 * Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.
 * When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a leaf {{#crossLink "Transform"}}{{/crossLink}}
 within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be transformed by each {{#crossLink "Transform"}}{{/crossLink}}
 on the path up to the root, in that order.


 <img src="../../../assets/images/Rotate.png"></img>

 ## Examples

 * [Modeling transform hierarchy](../../examples/#transforms_entity_hierarchy)

 ## Usage

 In this example we have two {{#crossLink "Entity"}}Entities{{/crossLink}} that are transformed by a hierarchy that contains
 Rotate, {{#crossLink "Translate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}} transforms.
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

 var geometry = new xeogl.Geometry(scene); // Defaults to a 2x2x2 box

 var Entity1 = new xeogl.Entity({
    transform: translate1,
    geometry: geometry
 });

 var Entity2 = new xeogl.Entity({
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

 Entity2.transform = scale2;
 ````

 Let's start spinning the {{#crossLink "Rotate"}}{{/crossLink}}:

 ````javascript
 // Rotate 0.2 degrees on each frame
 scene.on("tick", function(e) {
    rotate.angle += 0.2;
 });
 ````
 @class Rotate
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Rotate in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Rotate.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.xyz=[0,1,0]] {Float32Array} Axis of rotation.
 @param [cfg.angle=0] {Number} Angle of rotation in degrees.
 @extends Transform
 */
(function () {

    "use strict";

    xeogl.Rotate = xeogl.Transform.extend({

        type: "xeogl.Rotate",

        _init: function (cfg) {

            this._super(cfg);

            this.xyz = cfg.xyz;
            this.angle = cfg.angle;
        },

        _update: function () {
            if (this._xyz[0] === 0 && this._xyz[1] === 0 && this._xyz[2] === 0) {
                this.warn("Rotation axis is [0,0,0] - won't build matrix.");
                return;
            }
            this.matrix = xeogl.math.rotationMat4v(this._angle * xeogl.math.DEGTORAD, this._xyz, this._matrix);
        },

        _props: {

            /**
             * Vector indicating the axis of rotation.
             *
             * @property xyz
             * @default [0,1,0]
             * @type {Float32Array}
             */
            xyz: {

                set: function (value) {
                    (this._xyz = this._xyz || new xeogl.math.vec3()).set(value || [0, 1, 0]);
                    this._needUpdate(0);
                },

                get: function () {
                    return this._xyz;
                }
            },

            /**
             * Angle of rotation in degrees.
             *
             * @property angle
             * @default 0
             * @type {Number}
             */
            angle: {

                set: function (value) {
                    this._angle = value || 0;
                    this._needUpdate(0);
                },

                get: function () {
                    return this._angle;
                }
            }
        }
    });

})();
