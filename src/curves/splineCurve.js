/**
 A **SplineCurve** extends {{#crossLink "Curve"}}{{/crossLink}} to provide a spline curve.

 ## Overview

 <img style="border:1px solid; background: white;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Quadratic_spline_six_segments.svg/200px-Quadratic_spline_six_segments.svg.png"/>

 *[Spline Curve from Wikipedia](https://en.wikipedia.org/wiki/Spline_(mathematics))*

 <ul>
    <li>To build a complex path, you can combine an unlimited combination of SplineCurves,
 {{#crossLink "CubicBezierCurve"}}CubicBezierCurves{{/crossLink}} and {{#crossLink "QuadraticBezierCurve"}}QuadraticBezierCurves{{/crossLink}}
 within a {{#crossLink "Path"}}{{/crossLink}}.</li>
 </ul>


 ## Example 1

 Create a SplineCurve, subscribe to updates on its {{#crossLink "SplineCurve/point:property"}}{{/crossLink}} and
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties, then vary its {{#crossLink "SplineCurve/t:property"}}{{/crossLink}}
 property over time:

 ````javascript

 var curve = new XEO.SplineCurve({
        points: [
            [-10, 0, 0],
            [-5, 15, 0],
            [20, 15, 0],
            [10, 0, 0]
        ]
    });

 curve.scene.on("tick", function(e) {

        curve.t = (e.time - e.startTime) * 0.01;

        var point = curve.point;
        var tangent = curve.tangent;

        this.log("t=" + curve.t + ", point=" + JSON.stringify(point) + ", tangent=" + JSON.stringify(tangent));
    });
 ````

 ## Example 2

 Alternatively, we can randomly sample the point and vector at a given **t** with calls
 to the SplineCurve's {{#crossLink "SplineCurve/getPoint:method"}}{{/crossLink}} and
 {{#crossLink "Curve/getTangent:method"}}{{/crossLink}} methods:

 ````javascript
 var curve = new XEO.SplineCurve({
        points: [
            [-10, 0, 0],
            [-5, 15, 0],
            [20, 15, 0],
            [10, 0, 0]
        ]
    });

 curve.scene.on("tick", function(e) {

        var t = (e.time - e.startTime) * 0.01;

        var point = curve.getPoint(t);
        var tangent = curve.getTangent(t);

        this.log("t=" + t + ", point=" + JSON.stringify(point) + ", tangent=" + JSON.stringify(tangent));
    });
 ````

 @class SplineCurve
 @module XEO
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
(function () {

    "use strict";

    XEO.SplineCurve = XEO.Curve.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.SplineCurve",

        _init: function (cfg) {

            this._super(cfg);

            this.points = cfg.points;

            this.t = cfg.t;
        },

        _props: {

            /**
             Control points on this SplineCurve.

             Fires a {{#crossLink "SplineCurve/points:event"}}{{/crossLink}} event on change.

             @property points
             @default []
             @type Array(Number)
             */
            points: {

                set: function (value) {

                    this._points = value || [];

                    /**
                     * Fired whenever this SplineCurve's
                     * {{#crossLink "SplineCurve/points:property"}}{{/crossLink}} property changes.
                     * @event points
                     * @param value The property's new value
                     */
                    this.fire("points", this._points);
                },

                get: function () {
                    return this._points;
                }
            },

            /**
             Progress along this SplineCurve.

             Automatically clamps to range [0..1].

             Fires a {{#crossLink "SplineCurve/t:event"}}{{/crossLink}} event on change.

             @property t
             @default 0
             @type Number
             */
            t: {
                set: function (value) {

                    value = value || 0;

                    this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);

                    /**
                     * Fired whenever this SplineCurve's
                     * {{#crossLink "SplineCurve/t:property"}}{{/crossLink}} property changes.
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
             Point on this SplineCurve at position {{#crossLink "SplineCurve/t:property"}}{{/crossLink}}.

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
         * Returns point on this SplineCurve at the given position.
         * @method getPoint
         * @param {Number} t Position to get point at.
         * @returns {{Array of Number}}
         */
        getPoint: function(t) {

            var math = XEO.math;

            var points = this.points;
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
        },

        _getJSON: function () {
            return {
                v0: this._v0,
                v1: this._v1,
                v2: this._v2,
                v3: this._v3,
                t: this._t
            };
        }
    });

})();
