/**

 A **Rotate** applies a rotation transformation to associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>
 <li>Rotate is a sub-class of {{#crossLink "Transform"}}{{/crossLink}}</li>
 <li>Can be connected into hierarchies with other {{#crossLink "Transform"}}Transforms{{/crossLink}} and sub-classes</li>
 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} are connected to leaf {{#crossLink "Transform"}}Transforms{{/crossLink}}
 in the hierarchy, and will be transformed by each {{#crossLink "Transform"}}Transform{{/crossLink}} on the path up to the
 root, in that order.</li>
 </ul>

 <img src="../../../assets/images/Rotate.png"></img>

 ## Example

 In this example we have two {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that are transformed by a hierarchy that contains
 Rotate, {{#crossLink "Translate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}} transforms.
 The GameObjects share the same {{#crossLink "Geometry"}}{{/crossLink}}, which is the default 2x2x2 cube.<br>

````javascript
var scene = new XEO.Scene();

var rotate = new XEO.Rotate(scene, {
    xyz: [0, 1, 0], // Rotate 30 degrees about Y axis
    angle: 30
});

var translate1 = new XEO.Translate(scene, {
    parent: rotate,
    xyz: [-5, 0, 0] // Translate along -X axis
});

var translate2 = new XEO.Translate(scene, {
    parent: rotate,
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

 And just for fun, we'll start spinning the {{#crossLink "Rotate"}}{{/crossLink}}:

 ````javascript
// Rotate 0.2 degrees on each frame
scene.on("tick", function(e) {
    rotate.angle += 0.2;
});
 ````
 @class Rotate
 @module XEO
 @extends Transform
 */
(function () {

    "use strict";

    XEO.Rotate = XEO.Transform.extend({

        className: "XEO.Rotate",

        _init: function (cfg) {
            this._super(cfg);
            this.xyz = cfg.xyz;
        },

        _props: {

            /**
             * Vector indicating the axis of rotation.
             * Fires an {{#crossLink "Rotate/xyz:event"}}{{/crossLink}} event on change.
             * @property xyz
             * @default [1,1,1]
             * @type {Array of Number}
             */
            xyz: {

                set: function (value) {
                    this._xyz = value || [0, 0, 0];
                    this.matrix = XEO.math.scalingMat4v(this._xyz);

                    /**
                     Fired whenever this Rotate's {{#crossLink "Rotate/xyz:property"}}{{/crossLink}} property changes.

                     @event xyz
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("xyz", this._xyz);
                },

                get: function () {
                    return this._xyz;
                }
            }

            // TODO angle
        },

        _getJSON: function () {
            return {
                xyz: this.xyz
            };
        }
    });

})();