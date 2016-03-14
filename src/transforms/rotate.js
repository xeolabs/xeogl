/**
 A **Rotate** rotates associated {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}} about an axis vector.

 <ul>
 <li>Rotate is a sub-class of {{#crossLink "Transform"}}{{/crossLink}}</li>
 <li>Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.</li>
 <li>When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a leaf {{#crossLink "Transform"}}{{/crossLink}}
 within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be transformed by each {{#crossLink "Transform"}}{{/crossLink}}
 on the path up to the root, in that order.</li>
 <li>See <a href="./Shader.html#inputs">Shader Inputs</a> for the variables that Transform create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Rotate.png"></img>

 ## Examples

 <ul>
 <li>[Transform hierarchy](../../examples/#transforms_hierarchy)</li>
 </ul>

 ## Usage

 In this example we have two {{#crossLink "Entity"}}Entities{{/crossLink}} that are transformed by a hierarchy that contains
 Rotate, {{#crossLink "Translate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}} transforms.
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

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var Entity1 = new XEO.Entity({
    transform: translate1,
    geometry: geometry
 });

 var Entity2 = new XEO.Entity({
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
 @module XEO
 @submodule transforms
 @extends Transform
 */
(function () {

    "use strict";

    XEO.Rotate = XEO.Transform.extend({

        type: "XEO.Rotate",

        _init: function (cfg) {

            this._super(cfg);

            this.xyz = cfg.xyz;
            this.angle = cfg.angle;
        },

        _props: {

            /**
             * Vector indicating the axis of rotation.
             *
             * Fires an {{#crossLink "Rotate/xyz:event"}}{{/crossLink}} event on change.
             *
             * @property xyz
             * @default [0,1,0]
             * @type {Array of Number}
             */
            xyz: {

                set: function (value) {

                    value = value || [0, 1, 0];

                    if (this._xyz) {
                        if (this._xyz[0] === value[0] && this._xyz[1] === value[1] && this._xyz[2] === value[2]) {
                            return;
                        } else {
                            this._xyz[0] = value[0];
                            this._xyz[1] = value[1];
                            this._xyz[2] = value[2];
                        }
                    } else {
                        this._xyz = value;
                    }

                    this._buildMatrix();

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
            },

            /**
             * Angle of rotation in degrees.
             *
             * Fires an {{#crossLink "Rotate/angle:event"}}{{/crossLink}} event on change.
             *
             * @property angle
             * @default 0
             * @type {Number}
             */
            angle: {

                set: function (value) {

                    this._angle = value || 0;

                    this._buildMatrix();

                    /**
                     Fired whenever this Rotate's {{#crossLink "Rotate/angle:property"}}{{/crossLink}} property changes.

                     @event angle
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("angle", this._angle);
                },

                get: function () {
                    return this._angle;
                }
            }
        },

        _buildMatrix: function () {

            if (this._xyz !== null && this._angle !== null) {

                // Both axis and angle have been set, so update the matrix.

                // Only do the update if both axis and angle have been set.

                // The update will be done once after both the axis and angle are set in the constructor,
                // and then subsequently every time that either the axis or angle is updated.
                //
                // This is wasteful for the case where both the axis and the angle are continually updated,
                // but that will be rarely be the case, where ormally it would just be the angle that is
                // continually updated.

                this.matrix = XEO.math.rotationMat4v(this._angle * XEO.math.DEGTORAD, this._xyz, this._matrix || (this._matrix = XEO.math.identityMat4()));
            }
        },

        _getJSON: function () {
            return {
                xyz: this._xyz,
                angle: this._angle
            };
        }
    });

})();
