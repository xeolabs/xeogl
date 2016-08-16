/**
 A **Scale** applies a scaling transformation to associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}}.

 <ul>
 <li>Scale is a sub-class of {{#crossLink "Transform"}}{{/crossLink}}</li>
 <li>Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.</li>
 <li>When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a leaf {{#crossLink "Transform"}}{{/crossLink}}
 within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be transformed by each {{#crossLink "Transform"}}{{/crossLink}}
 on the path up to the root, in that order.</li>
 <li>See <a href="./Shader.html#inputs">Shader Inputs</a> for the variables that Transform create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Scale.png"></img>

 ## Examples

 <ul>
 <li>[Transform hierarchy](../../examples/#transforms_hierarchy)</li>
 </ul>

 ## Usage

 In this example we have two {{#crossLink "Entity"}}Entities{{/crossLink}} that are transformed by a hierarchy that contains
 {{#crossLink "Rotate"}}{{/crossLink}}, {{#crossLink "Translate"}}{{/crossLink}} and Scale transforms.
 The Entities share the same {{#crossLink "BoxGeometry"}}{{/crossLink}}.<br>

 ````javascript
 var rotate = new XEO.Rotate({
    xyz: [0, 1, 0], // Rotate 30 degrees about Y axis
    angle: 30
 });

 var translate1 = new XEO.Translate({
    parent: rotate,
    xyz: [-5, 0, 0] // Translate along -X axis
 });

 var translate2 = new XEO.Translate({
    parent: rotate,
    xyz: [5, 0, 0] // Translate along +X axis
 });

 var scale = new XEO.Scale({
    parent: translate2,
    xyz: [1, 2, 1] // Scale x2 on Y axis
 });

 var geometry = new XEO.BoxGeometry();

 var entity1 = new XEO.Entity({
    transform: translate1,
    geometry: geometry
 });

 var entity2 = new XEO.Entity({
    transform: scale,
    geometry: geometry
 });
 ````

 Since everything in xeoEngine is dynamically editable, we can restructure the transform hierarchy at any time.

 Let's insert a {{#crossLink "Scale"}}{{/crossLink}} between the first Translate and the first {{#crossLink "Entity"}}{{/crossLink}}:

 ````javascript
 var scale2 = new XEO.Scale({
    parent: translate1,
    xyz: [1, 1, 2] // Scale x2 on Z axis
 });

 entity2.transform = scale2;
 ````

 And just for fun, we'll start spinning the {{#crossLink "Rotate"}}{{/crossLink}}:

 ````javascript
 // Rotate 0.2 degrees on each frame
 scene.on("tick", function(e) {
    rotate.angle += 0.2;
 });
 ````
 @class Scale
 @module XEO
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Scale in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Scale.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.xyz=[1,1,1]] {Float32Array} Scale factors.
 @extends Transform
 */
(function () {

    "use strict";

    XEO.Scale = XEO.Transform.extend({

        type: "XEO.Scale",

        _init: function (cfg) {

            this._super(cfg);

            this.xyz = cfg.xyz;
        },

        _build: function () {
            this.matrix = XEO.math.scalingMat4v(this._xyz, this._matrix);
        },

        _props: {

            /**
             * Vector indicating a scale factor for each axis.
             * Fires an {{#crossLink "Scale/xyz:event"}}{{/crossLink}} event on change.
             * @property xyz
             * @default [1,1,1]
             * @type {Float32Array}
             */
            xyz: {

                set: function (value) {

                    (this._xyz = this._xyz || new XEO.math.vec3()).set(value || [1, 1, 1]);

                    this._scheduleUpdate();

                    /**
                     Fired whenever this Scale's {{#crossLink "Scale/xyz:property"}}{{/crossLink}} property changes.

                     @event xyz
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("xyz", this._xyz);
                },

                get: function () {
                    return this._xyz;
                }
            }
        },

        _getJSON: function () {
            var json = {
                xyz: this._xyz
            };
            if (this._parent) {
                json.parent = this._parent.id;
            }
            return json;
        }
    });

})();
