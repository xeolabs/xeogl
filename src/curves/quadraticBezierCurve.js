/**
 A **QuadraticBezierCurve** is a {{#crossLink "Curve"}}{{/crossLink}} along which a 3D position can be animated.

 <ul>
    <li>As shown in the diagram below, a QuadraticBezierCurve is defined by three control points.</li>
 <li>You can sample a {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}} and a {{#crossLink "Curve/tangent:property"}}{{/crossLink}}
 vector on a QuadraticBezierCurve for any given value of {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} in the range [0..1].</li>
 <li>When you set {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} on a QuadraticBezierCurve, its
 {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}} and {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties
 will update accordingly.</li>
    <li>To build a complex path, you can combine an unlimited combination of QuadraticBezierCurves,
 {{#crossLink "CubicBezierCurve"}}CubicBezierCurves{{/crossLink}} and {{#crossLink "SplineCurve"}}SplineCurves{{/crossLink}}
 into a {{#crossLink "Path"}}{{/crossLink}}.</li>
 </ul>

 <img style="border:1px solid;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/B%C3%A9zier_2_big.gif/240px-B%C3%A9zier_2_big.gif"/><br>
 *[Quadratic Bezier Curve from WikiPedia](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)*

 ## Example 1

 Create a QuadraticBezierCurve, subscribe to updates on its {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}} and
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties, then vary its {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}}
 property over time:

 ````javascript
 var curve = new XEO.QuadraticBezierCurve({
     v0: [-10, 0, 0],
     v1: [20, 15, 0],
     v2: [10, 0, 0]
 });

 curve.scene.on("tick", function(e) {

     curve.t = (e.time - e.startTime) * 0.01;

     var point = curve.point;
     var tangent = curve.tangent;

     this.log("t=" + curve.t + ", point=" +
            JSON.stringify(point) + ", tangent=" +
                JSON.stringify(tangent));
 });
 ````

 ## Example 2

 In the next example, we'll create an {{#crossLink "Entity"}}{{/crossLink}} with a
 {{#crossLink "PhongMaterial"}}{{/crossLink}} whose diffuse color is bound to the
 interpolated {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}} property on the QuadraticBezierCurve.

 Then we'll animate the QuadraticBezierCurve's {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} property
 to update the diffuse color.

 ````javascript
 var curve = new XEO.QuadraticBezierCurve({
     v0: [1, 0, 0],
     v1: [0, 1, 0],
     v2: [0, 0, 1]
 });

 // Create a Entity with a PhongMaterial
 var material = new XEO.PhongMaterial({
     diffuse: [0, 0, 0]
 });

 var entity = new XEO.Entity({
     material: material
 });

 // Bind the PhongMaterial diffuse color
 // to the QuadraticBezierCurve
 curve.on("t", function() {
     material.diffuse = curve.point;
 });

 // Animate the QuadraticBezierCurve, which in turn
 // updates the PhongMaterial diffuse color
 var tick = entity.scene.on("tick", function (e) {
     curve.t = (e.time - e.startTime) * 0.00005;
 });
 ````

 ## Example 3

 In the previous two examples, we relied on our QuadraticBezierCurves to remember their progress in their
 {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} and {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}}
 properties, which is useful when we want to wire components together into reactive event-driven networks, as we did with the
 PhongMaterial in the previous example.

 As an alternative, we can instead sample the point and vector at a given *t* via calls
 to the QuadraticBezierCurve's {{#crossLink "QuadraticBezierCurve/getPoint:method"}}{{/crossLink}} and
 {{#crossLink "Curve/getTangent:method"}}{{/crossLink}} methods:

 ````javascript
 var curve = new XEO.QuadraticBezierCurve({
     v0: [-10, 0, 0],
     v1: [20, 15, 0],
     v2: [10, 0, 0]
 });

 curve.scene.on("tick", function(e) {

     var t = (e.time - e.startTime) * 0.01;

     var point = curve.getPoint(t);
     var tangent = curve.getTangent(t);

     this.log("t=" + t + ", point=" + JSON.stringify(point) + ", tangent=" + JSON.stringify(tangent));
 });
 ````

 ## Example 4

 When we want to build a {{#crossLink "Geometry"}}{{/crossLink}} from a QuadraticBezierCurve, we can sample points
 along the curve using its {{#crossLink "Curve/getPoints:method"}}{{/crossLink}} method, as shown below.

 Note that we need to flatten the points array for consumption by the {{#crossLink "Geometry"}}{{/crossLink}}.

 ````javascript
 var curve = new XEO.QuadraticBezierCurve({
     v0: [-10, 0, 0],
     v1: [20, 15, 0],
     v2: [10, 0, 0]
 });

 // Geometry which creates a line-strip through fifty
 // points sampled at equidistant positions on our QuadraticBezierCurve

 var geometry = new XEO.Geometry({
     positions: XEO.math.flatten(curve.getPoints(50))
 });
 ````

 @class QuadraticBezierCurve
 @module XEO
 @submodule curves
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this QuadraticBezierCurve.
 @param [cfg.v0=[0,0,0]] The starting point.
 @param [cfg.v1=[0,0,0]] The middle control point.
 @param [cfg.v2=[0,0,0]] The end point.
 @param [cfg.t=0] Current position on this QuadraticBezierCurve, in range between 0..1.
 @extends Curve
 */
(function () {

    "use strict";

    XEO.QuadraticBezierCurve = XEO.Curve.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.QuadraticBezierCurve",

        _init: function (cfg) {

            this._super(cfg);

            this.v0 = cfg.v0;
            this.v1 = cfg.v1;
            this.v2 = cfg.v2;

            this.t = cfg.t;
        },

        _props: {

            /**
             Starting point on this QuadraticBezierCurve.

             Fires a {{#crossLink "QuadraticBezierCurve/v0:event"}}{{/crossLink}} event on change.

             @property v0
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            v0: {

                set: function (value) {

                    /**
                     * Fired whenever this QuadraticBezierCurve's
                     * {{#crossLink "QuadraticBezierCurve/v0:property"}}{{/crossLink}} property changes.
                     * @event v0
                     * @param value The property's new value
                     */
                    this.fire("v0", this._v0 = value || [0, 0, 0]);
                },

                get: function () {
                    return this._v0;
                }
            },

            /**
             Middle control point on this QuadraticBezierCurve.

             Fires a {{#crossLink "QuadraticBezierCurve/v1:event"}}{{/crossLink}} event on change.

             @property v1
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            v1: {

                set: function (value) {

                    /**
                     * Fired whenever this QuadraticBezierCurve's
                     * {{#crossLink "QuadraticBezierCurve/v1:property"}}{{/crossLink}} property changes.
                     * @event v1
                     * @param value The property's new value
                     */
                    this.fire("v1", this._v1 = value || [0, 0, 0]);
                },

                get: function () {
                    return this._v1;
                }
            },

            /**
             End point on this QuadraticBezierCurve.

             Fires a {{#crossLink "QuadraticBezierCurve/v2:event"}}{{/crossLink}} event on change.

             @property v2
             @default [0.0, 0.0, 0.0]
             @type Array(Number)
             */
            v2: {

                set: function (value) {

                    /**
                     * Fired whenever this QuadraticBezierCurve's
                     * {{#crossLink "QuadraticBezierCurve/v2:property"}}{{/crossLink}} property changes.
                     * @event v2
                     * @param value The property's new value
                     */
                    this.fire("v2", this._v2 = value || [0, 0, 0]);
                },

                get: function () {
                    return this._v2;
                }
            },

            /**
             Progress along this QuadraticBezierCurve.

             Automatically clamps to range [0..1].

             Fires a {{#crossLink "QuadraticBezierCurve/t:event"}}{{/crossLink}} event on change.

             @property t
             @default 0
             @type Number
             */
            t: {
                set: function (value) {

                    value = value || 0;

                    this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);

                    /**
                     * Fired whenever this QuadraticBezierCurve's
                     * {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} property changes.
                     * @event t
                     * @param value The property's new value
                     */
                    this.fire("t", this._t);
                },

                get: function () {
                    return this._t;
                }
            },


            /**
             Point on this QuadraticBezierCurve at position {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}}.

             @property point
             @type {{Array of Number}}
             */
            point: {

                get: function () {
                    return this.getPoint(this._t);
                }
            }
        },

        /**
         * Returns point on this QuadraticBezierCurve at the given position.
         * @method getPoint
         * @param {Number} t Position to get point at.
         * @returns {{Array of Number}}
         */
        getPoint: function (t) {

            var math = XEO.math;
            var vector = math.vec3();

            vector[0] = math.b2(t, this._v0[0], this._v1[0], this._v2[0]);
            vector[1] = math.b2(t, this._v0[1], this._v1[1], this._v2[1]);
            vector[2] = math.b2(t, this._v0[2], this._v1[2], this._v2[2]);

            return vector;
        },

        _getJSON: function () {
            return {
                v0: this._v0,
                v1: this._v1,
                v2: this._v2,
                t: this._t
            };
        }
    });

})();
