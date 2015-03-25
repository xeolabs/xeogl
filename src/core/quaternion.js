/**

 A **Quaternion** applies a rotation transformation to associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>A sub-class of {{#crossLink "Transform"}}{{/crossLink}}</li>
 <li>Can be connected into hierarchies with other {{#crossLink "Transform"}}Transforms{{/crossLink}} and sub-classes</li>
 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} are connected to leaf {{#crossLink "Transform"}}Transforms{{/crossLink}}
 in the hierarchy, and will be transformed by each {{#crossLink "Transform"}}Transforms{{/crossLink}} on the path up to the
 root, in that order.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7492985/L.png">

 ## Example

 In this example we have two {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that are transformed by a hierarchy that contains
 Quaternion, {{#crossLink "Translate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}} transforms.
 The GameObjects share the same {{#crossLink "Geometry"}}{{/crossLink}}, which is the default 2x2x2 cube.<br>

 ````javascript
 var scene = new XEO.Scene();


 var quaternion = new XEO.Quaternion(scene, {
    xyzw: [0, 0, 0, 1], // Unit quaternion
 });


 var translate1 = new XEO.Translate(scene, {
    parent: quaternion,
    xyz: [-5, 0, 0] // Translate along -X axis
 });


 var translate2 = new XEO.Translate(scene, {
    parent: quaternion,
    xyz: [5, 0, 0] // Translate along +X axis
 });


 var scale = new XEO.Scale(scene, {
    parent: translate2,
    xyz: [1, 2, 1] // Scale x2 on Y axis
 });


 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box


 var gameObject1 = new XEO.GameObject(scene, {
    transform: translate1,
    geometry: geometry
 });


 var gameObject2 = new XEO.GameObject(scene, {
    transform: scale,
    geometry: geometry
 });
 ````

 Since everything in xeoEngine is dynamically editable, we can restructure the transform hierarchy at any time.


 Let's insert a {{#crossLink "Scale"}}{{/crossLink}} between the first Translate and the first {{#crossLink "GameObject"}}{{/crossLink}}:

 ````javascript
var scale2 = new XEO.Scale(scene, {
    parent: translate1,
    xyz: [1, 1, 2] // Scale x2 on Z axis
 });


 gameObject2.transform = scale2;
 ````

 And just for fun, we'll start spinning the Quaternion:

 ````javascript
// Rotate 0.2 degrees about Y-axis on each frame
 scene.on("tick", function(e) {
    quaternion.rotate([0, 1, 0, 0.2]);
 });
 ````
 @class Quaternion
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Quaternion in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Quaternion.
 @param [cfg.xyzw=[0,0,0,1]] {Array(Number)} The initial Quaternion elements.
 @extends Transform
 */
(function () {

    "use strict";
    XEO.Quaternion = XEO.Transform.extend({

        className: "XEO.Quaternion",

        _init: function (cfg) {
            this._super(cfg);
            this.xyzw = cfg.xyzw;
        },

        _props: {

            /**
             The quaternion elements
             Fires an {{#crossLink "Quaternion/xyzw:event"}}{{/crossLink}} event on change.
             @property xyzw
             @default [0,0,0,1]
             @type {Array of Number}
             */
            xyzw: {

                set: function (value) {
                    this._xyzw = value || [0, 0, 0, 1];
//                this.matrix = XEO.math.scalingMat4v(this._xyzw);

                    /**
                     Fired whenever this Quaternion's {{#crossLink "Quaternion/xyzw:property"}}{{/crossLink}} property changes.

                     @event xyzw
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("xyzw", this._xyzw);
                },

                get: function () {
                    return this._xyz;
                }
            }
        },

        /**
         Rotates this Quaternion.
         Fires an {{#crossLink "Quaternion/xyzw:event"}}{{/crossLink}} event to notify of update to the Quaternion elements.
         @method rotate
         @param {Array of Number} angleAxis Rotation in angle-axis form.
         */
        rotate: function (angleAxis) {
            // TODO
        },

        _getJSON: function () {
            return {
                xyzw: this.xyzw
            };
        }
    });
})();