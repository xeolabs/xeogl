/**
 A **Quaternion** is a {{#crossLink "Transform"}}{{/crossLink}} that rotates associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}}.

 ## Overview

 * Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.
 * When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a
 leaf {{#crossLink "Transform"}}{{/crossLink}} within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be
 transformed by each {{#crossLink "Transform"}}{{/crossLink}} on the path up to the root, in that order.

 <img src="../../../assets/images/Quaternion.png"></img>

 ## Usage

 In this example we have two {{#crossLink "Entity"}}Entities{{/crossLink}} that are transformed by a hierarchy that contains
 Quaternion, {{#crossLink "Translate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}} transforms.
 The Entities share the same {{#crossLink "BoxGeometry"}}{{/crossLink}}.<br>

 ````javascript
 var quaternion = new xeogl.Quaternion({
    xyzw: [0, 0, 0, 1], // Unit quaternion
 });

 var translate1 = new xeogl.Translate({
   parent: quaternion,
   xyz: [-5, 0, 0] // Translate along -X axis
 });

 var translate2 = new xeogl.Translate({
   parent: quaternion,
   xyz: [5, 0, 0] // Translate along +X axis
 });

 var scale = new xeogl.Scale({
   parent: translate2,
   xyz: [1, 2, 1] // Scale x2 on Y axis
 });

 var geometry = new xeogl.BoxGeometry();

 var entity1 = new xeogl.Entity(scene, {
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

 Entity2.transform = scale2;
 ````

 Let's spin the Quaternion:

 ````javascript
 // Rotate 0.2 degrees about Y-axis on each frame
 scene.on("tick", function(e) {
        quaternion.rotate([0, 1, 0, 0.2]);
    });
 ````
 @class Quaternion
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Quaternion in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Quaternion.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.xyzw=[0,0,0,1]] {Array(Number)} The initial Quaternion elements.
 @extends Transform
 */
(function () {

    "use strict";

    xeogl.Quaternion = xeogl.Transform.extend({

        type: "xeogl.Quaternion",

        _init: function (cfg) {

            this._super(cfg);

            this.xyzw = cfg.xyzw;
        },

        _props: {

            /**

             The quaternion elements.

             @property xyzw
             @default [0,0,0,1]
             @type {Float32Array}
             */
            xyzw: {

                set: function (value) {
                    var math = xeogl.math;
                    (this._xyzw = this._xyzw || new math.vec4()).set(value || math.identityQuaternion());
                    this.matrix = math.quaternionToMat4(this._xyzw, this._matrix || (this._matrix = xeogl.math.identityMat4()));
                },

                get: function () {
                    return this._xyzw;
                }
            }
        },

        /**
         Rotates this Quaternion.
         @method rotate
         @param {Float32Array} angleAxis Rotation in angle-axis form.
         */
        rotate: (function () {
            var math = xeogl.math;
            var tempAngleAxis = math.vec4();
            var tempQuat = math.vec4();
            return function (angleAxis) {
                // TODO: Make API work in radians so we don't have to do this?:
                tempAngleAxis[0] = angleAxis[0];
                tempAngleAxis[1] = angleAxis[1];
                tempAngleAxis[2] = angleAxis[2];
                tempAngleAxis[3] = angleAxis[3] * math.DEGTORAD;
                math.angleAxisToQuaternion(tempAngleAxis, tempQuat);
                this.xyzw = math.mulQuaternions(this._xyzw, tempQuat, this._xyzw);
            };
        })()
    });
})();