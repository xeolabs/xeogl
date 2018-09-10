/**
 A **SplineCurve** is a {{#crossLink "Curve"}}{{/crossLink}} along which a 3D position can be animated.

 ## Overview

 <ul>
 <li>As shown in the diagram below, a SplineCurve is defined by three or more control points.</li>
 <li>You can sample a {{#crossLink "SplineCurve/point:property"}}{{/crossLink}} and a {{#crossLink "Curve/tangent:property"}}{{/crossLink}}
 vector on a SplineCurve for any given value of {{#crossLink "SplineCurve/t:property"}}{{/crossLink}} in the range [0..1].</li>
 <li>When you set {{#crossLink "SplineCurve/t:property"}}{{/crossLink}} on a SplineCurve, its {{#crossLink "SplineCurve/point:property"}}{{/crossLink}} and {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties will update accordingly.</li>
 <li>To build a complex path, you can combine an unlimited combination of SplineCurves,
 {{#crossLink "CubicBezierCurve"}}CubicBezierCurves{{/crossLink}} and {{#crossLink "QuadraticBezierCurve"}}QuadraticBezierCurves{{/crossLink}}
 into a {{#crossLink "Path"}}{{/crossLink}}.</li>
 </ul>

 <img style="border:1px solid; background: white;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Quadratic_spline_six_segments.svg/200px-Quadratic_spline_six_segments.svg.png"/><br>
 *<a href="https://en.wikipedia.org/wiki/Spline_(mathematics)">Spline Curve from Wikipedia</a>*

 ## Examples

 <ul>
 <li>[Simple SplineCurve example](../../examples/#animation_curves_spline)</li>
 <li>[Moving a PointLight along a SplineCurve](../../examples/#animation_curves_spline_pointLight)</li>
 <li>[Path example](../../examples/#animation_curves_path)</li>
 </ul>

 ## Usage

 #### Animation along a SplineCurve

 Let's create a SplineCurve, subscribe to updates on its {{#crossLink "SplineCurve/point:property"}}{{/crossLink}},
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} and {{#crossLink "Curve/t:property"}}{{/crossLink}} properties,
 then vary its {{#crossLink "SplineCurve/t:property"}}{{/crossLink}}
 property over time:

 ````javascript
 var curve = new xeogl.SplineCurve({
     points: [
         [-10, 0, 0],
         [-5, 15, 0],
         [20, 15, 0],
         [10, 0, 0]
     ]
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

 Use SplineCurve's {{#crossLink "SplineCurve/getPoint:method"}}{{/crossLink}} and
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

 Use SplineCurve's {{#crossLink "Curve/getPoints:method"}}{{/crossLink}} method to sample a list of equidistant points
 along it. In the snippet below, we'll build a {{#crossLink "Geometry"}}{{/crossLink}} that renders a line along the
 curve.  Note that we need to flatten the points array for consumption by the {{#crossLink "Geometry"}}{{/crossLink}}.

 ````javascript
 var geometry = new xeogl.Geometry({
     positions: xeogl.math.flatten(curve.getPoints(50))
 });
 ````

 @class SplineCurve
 @module xeogl
 @submodule curves
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SplineCurve.
 @param [cfg.points=[]] Control points on this SplineCurve.
 @param [cfg.t=0] Current position on this SplineCurve, in range between 0..1.
 @extends Curve
 */
xeogl.SplineCurve = class xeoglSplineCurve extends xeogl.Curve {

    init(cfg) {
        super.init(cfg);
        this.points = cfg.points;
        this.t = cfg.t;
    }

    /**
     Control points on this SplineCurve.

     Fires a {{#crossLink "SplineCurve/points:event"}}{{/crossLink}} event on change.

     @property points
     @default []
     @type Float32Array
     */
    set points(value) {
        this._points = value || [];
        /**
         * Fired whenever this SplineCurve's
         * {{#crossLink "SplineCurve/points:property"}}{{/crossLink}} property changes.
         * @event points
         * @param value The property's new value
         */
        this.fire("points", this._points);
    }

    get points() {
        return this._points;
    }

    /**
     Progress along this SplineCurve.

     Automatically clamps to range [0..1].

     Fires a {{#crossLink "SplineCurve/t:event"}}{{/crossLink}} event on change.

     @property t
     @default 0
     @type Number
     */
    set t(value) {
        value = value || 0;
        this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);
        /**
         * Fired whenever this SplineCurve's
         * {{#crossLink "SplineCurve/t:property"}}{{/crossLink}} property changes.
         * @event t
         * @param value The property's new value
         */
        this.fire("t", this._t);
    }

    get t() {
        return this._t;
    }

    /**
     Point on this SplineCurve at position {{#crossLink "SplineCurve/t:property"}}{{/crossLink}}.

     @property point
     @type {{Array of Number}}
     */
    get point() {
        return this.getPoint(this._t);
    }

    /**
     * Returns point on this SplineCurve at the given position.
     * @method getPoint
     * @param {Number} t Position to get point at.
     * @returns {{Array of Number}}
     */
    getPoint(t) {

        var math = xeogl.math;

        var points = this.points;

        if (points.length < 3) {
            this.error("Can't sample point from SplineCurve - not enough points on curve - returning [0,0,0].");
            return;
        }

        var point = ( points.length - 1 ) * t;

        var intPoint = Math.floor(point);
        var weight = point - intPoint;

        var point0 = points[intPoint === 0 ? intPoint : intPoint - 1];
        var point1 = points[intPoint];
        var point2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
        var point3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];

        var vector = math.vec3();

        vector[0] = math.catmullRomInterpolate(point0[0], point1[0], point2[0], point3[0], weight);
        vector[1] = math.catmullRomInterpolate(point0[1], point1[1], point2[1], point3[1], weight);
        vector[2] = math.catmullRomInterpolate(point0[2], point1[2], point2[2], point3[2], weight);

        return vector;
    }

    getJSON() {
        return {
            points: points,
            t: this._t
        };
    }
};
