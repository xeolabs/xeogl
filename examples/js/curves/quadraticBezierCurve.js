/**
 A **QuadraticBezierCurve** is a {{#crossLink "Curve"}}{{/crossLink}} along which a 3D position can be animated.

 ## Overview

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

 ## Examples

 <ul>
 <li>[Tweening position along a QuadraticBezierCurve](../../examples/#animation_curves_quadraticBezier)</li>
 <li>[Tweening color along a QuadraticBezierCurve](../../examples/#animation_curves_quadraticBezier_color)</li>
 <li>[Path example](../../examples/#curves_Path)</li>
 </ul>

 ## Usage

 #### Animation along a QuadraticBezierCurve

 Let's create a QuadraticBezierCurve, subscribe to updates on its {{#crossLink "QuadraticBezierCurve/point:property"}}{{/crossLink}},
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} and {{#crossLink "Curve/t:property"}}{{/crossLink}} properties,
 then vary its {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}}
 property over time:

 ````javascript
 var curve = new xeogl.QuadraticBezierCurve({
     v0: [10, 0, 0],
     v1: [20, 15, 0],
     v2: [10, 0, 0]
 });

 curve.on("point", function(point) {
     this.log("curve.point=" + JSON.stringify(point));
 });

 curve.on("tangent", function(tangent) {
     this.log("curve.tangent=" + JSON.stringify(tangent));
 });

 curve.on("t", function(t) {
     this.log("curve.t=" + t);
 });

 curve.scene.on("tick", function(e) {
     curve.t = (e.time - e.startTime) * 0.01;
 });
 ````

 #### Randomly sampling points

 Use QuadraticBezierCurve's {{#crossLink "QuadraticBezierCurve/getPoint:method"}}{{/crossLink}} and
 {{#crossLink "Curve/getTangent:method"}}{{/crossLink}} methods to sample the point and vector
 at a given **t**:

 ````javascript
 curve.scene.on("tick", function(e) {

     var t = (e.time - e.startTime) * 0.01;

     var point = curve.getPoint(t);
     var tangent = curve.getTangent(t);

     this.log("t=" + t + ", point=" + JSON.stringify(point) + ", tangent=" + JSON.stringify(tangent));
 });
 ````

 #### Sampling multiple points

 Use QuadraticBezierCurve's {{#crossLink "Curve/getPoints:method"}}{{/crossLink}} method to sample a list of equidistant points
 along it. In the snippet below, we'll build a {{#crossLink "Geometry"}}{{/crossLink}} that renders a line along the
 curve.  Note that we need to flatten the points array for consumption by the {{#crossLink "Geometry"}}{{/crossLink}}.

 ````javascript
 var geometry = new xeogl.Geometry({
     positions: xeogl.math.flatten(curve.getPoints(50))
 });
 ````

 @class QuadraticBezierCurve
 @module xeogl
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
xeogl.QuadraticBezierCurve = class xeoglQuadraticBezierCurve extends xeogl.Curve {

    init(cfg) {
        super.init(cfg);
        this.v0 = cfg.v0;
        this.v1 = cfg.v1;
        this.v2 = cfg.v2;
        this.t = cfg.t;
    }

    /**
     Starting point on this QuadraticBezierCurve.

     Fires a {{#crossLink "QuadraticBezierCurve/v0:event"}}{{/crossLink}} event on change.

     @property v0
     @default [0.0, 0.0, 0.0]
     @type Float32Array
     */
    set v0(value) {

        /**
         * Fired whenever this QuadraticBezierCurve's
         * {{#crossLink "QuadraticBezierCurve/v0:property"}}{{/crossLink}} property changes.
         * @event v0
         * @param value The property's new value
         */
        this.fire("v0", this._v0 = value || xeogl.math.vec3([0, 0, 0]));
    }

    get v0() {
        return this._v0;
    }

    /**
     Middle control point on this QuadraticBezierCurve.

     Fires a {{#crossLink "QuadraticBezierCurve/v1:event"}}{{/crossLink}} event on change.

     @property v1
     @default [0.0, 0.0, 0.0]
     @type Float32Array
     */
    set v1(value) {

        /**
         * Fired whenever this QuadraticBezierCurve's
         * {{#crossLink "QuadraticBezierCurve/v1:property"}}{{/crossLink}} property changes.
         * @event v1
         * @param value The property's new value
         */
        this.fire("v1", this._v1 = value || xeogl.math.vec3([0, 0, 0]));
    }

    get v1() {
        return this._v1;
    }

    /**
     End point on this QuadraticBezierCurve.

     Fires a {{#crossLink "QuadraticBezierCurve/v2:event"}}{{/crossLink}} event on change.

     @property v2
     @default [0.0, 0.0, 0.0]
     @type Float32Array
     */
    set v2(value) {
        /**
         * Fired whenever this QuadraticBezierCurve's
         * {{#crossLink "QuadraticBezierCurve/v2:property"}}{{/crossLink}} property changes.
         * @event v2
         * @param value The property's new value
         */
        this.fire("v2", this._v2 = value || xeogl.math.vec3([0, 0, 0]));
    }

    get v2() {
        return this._v2;
    }

    /**
     Progress along this QuadraticBezierCurve.

     Automatically clamps to range [0..1].

     Fires a {{#crossLink "QuadraticBezierCurve/t:event"}}{{/crossLink}} event on change.

     @property t
     @default 0
     @type Number
     */
    set t(value) {
        value = value || 0;
        this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);
        /**
         * Fired whenever this QuadraticBezierCurve's
         * {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}} property changes.
         * @event t
         * @param value The property's new value
         */
        this.fire("t", this._t);
    }

    get t() {
        return this._t;
    }

    /**
     Point on this QuadraticBezierCurve at position {{#crossLink "QuadraticBezierCurve/t:property"}}{{/crossLink}}.

     @property point
     @type {{Array of Number}}
     */
    get point() {
        return this.getPoint(this._t);
    }

    /**
     * Returns point on this QuadraticBezierCurve at the given position.
     * @method getPoint
     * @param {Number} t Position to get point at.
     * @returns {{Array of Number}}
     */
    getPoint(t) {
        var math = xeogl.math;
        var vector = math.vec3();
        vector[0] = math.b2(t, this._v0[0], this._v1[0], this._v2[0]);
        vector[1] = math.b2(t, this._v0[1], this._v1[1], this._v2[1]);
        vector[2] = math.b2(t, this._v0[2], this._v1[2], this._v2[2]);
        return vector;
    }

    getJSON() {
        return {
            v0: this._v0,
            v1: this._v1,
            v2: this._v2,
            t: this._t
        };
    }
};
