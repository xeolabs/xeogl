/**
 A **Path** is a complex curved path constructed from various {{#crossLink "Curve"}}{{/crossLink}} subtypes.

 <ul>
 <li>A Path can be constructed from these {{#crossLink "Curve"}}{{/crossLink}} subtypes: {{#crossLink "SplineCurve"}}{{/crossLink}},
 {{#crossLink "CubicBezierCurve"}}{{/crossLink}} and {{#crossLink "QuadraticBezierCurve"}}{{/crossLink}}.</li>
 <li>You can sample a {{#crossLink "Path/point:property"}}{{/crossLink}} and a {{#crossLink "Curve/tangent:property"}}{{/crossLink}}
 vector on a Path for any given value of {{#crossLink "Path/t:property"}}{{/crossLink}} in the range [0..1].</li>
 <li>When you set {{#crossLink "Path/t:property"}}{{/crossLink}} on a Path, its
 {{#crossLink "Path/point:property"}}{{/crossLink}} and {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties
 will update accordingly.</li>
 </ul>

 ## Examples

 <ul>
 <li>[CubicBezierCurve example](../../examples/#curves_CubicBezierCurve)</li>
 <li>[Tweening position along a QuadraticBezierCurve](../../examples/#curves_QuadraticBezierCurve)</li>
 <li>[Tweening color along a QuadraticBezierCurve](../../examples/#curves_QuadraticBezierCurve_color)</li>
 <li>[SplineCurve example](../../examples/#curves_SplineCurve)</li>
 <li>[Path example](../../examples/#curves_Path)</li>
 </ul>

 ## Usage

 Create a Path containing a {{#crossLink "CubicBezierCurve"}}{{/crossLink}}, a {{#crossLink "QuadraticBezierCurve"}}{{/crossLink}}
 and a {{#crossLink "SplineCurve"}}{{/crossLink}}, subscribe to updates on its {{#crossLink "Path/point:property"}}{{/crossLink}} and
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties, then vary its {{#crossLink "Path/t:property"}}{{/crossLink}}
 property over time:

 ````javascript
 var path = new XEO.Path({
     curves: [
         new XEO.CubicBezierCurve({
             v0: [-10, 0, 0],
             v1: [-5, 15, 0],
             v2: [20, 15, 0],
             v3: [10, 0, 0]
         }),
         new XEO.QuadraticBezierCurve({
             v0: [10, 0, 0],
             v1: [20, 15, 0],
             v2: [10, 0, 0]
         }),
         new XEO.SplineCurve({
             points: [
                 [10, 0, 0],
                 [-5, 15, 0],
                 [20, 15, 0],
                 [10, 0, 0]
             ]
         })
     ]
 });

 path.scene.on("tick", function(e) {

     path.t = (e.time - e.startTime) * 0.01;

     var point = path.point;
     var tangent = path.tangent;

     this.log("t=" + path.t + ", point=" +
         JSON.stringify(point) + ", tangent=" +
             JSON.stringify(tangent));
 });
 ````
 @class Path
 @module XEO
 @submodule curves
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Fly configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Path.
 @param [cfg.curves=[]] IDs or instances of {{#crossLink "Curve"}}{{/crossLink}} subtypes to add to this Path.
 @param [cfg.t=0] Current position on this Path, in range between 0..1.
 @extends Curve
 */
(function () {

    "use strict";

    XEO.Path = XEO.Curve.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "XEO.Path",

        _init: function (cfg) {

            this._super(cfg);

            this._cachedLengths = [];
            this._dirty = true;

            // Array of child Curve components
            this._curves = [];

            this._t = 0;

            // Subscriptions to "dirty" events from child Curve components
            this._dirtySubs = [];

            // Subscriptions to "destroyed" events from child Curve components
            this._destroyedSubs = [];

            // Add initial curves
            this.curves = cfg.curves || [];

            // Set initial progress
            this.t = cfg.t;
        },

        /**
         * Adds a {{#crossLink "Curve"}}{{/crossLink}} to this Path.
         *
         * Fires a {{#crossLink "Path/curves:event"}}{{/crossLink}} event on change.
         *
         * @param {Curve} curve The {{#crossLink "Curve"}}{{/crossLink}} to add.
         */
        addCurve: function (curve) {

            this._curves.push(curve);

            this._dirty = true;

            /**
             * Fired whenever this Path's
             * {{#crossLink "Path/curves:property"}}{{/crossLink}} property changes.
             * @event curves
             * @param value The property's new value
             */
            this.fire("curves", this._curves);
        },

        _props: {

            /**
             The {{#crossLink "Curve"}}Curves{{/crossLink}} in this Path.

             Fires a {{#crossLink "Path/curves:event"}}{{/crossLink}} event on change.

             @property curves
             @default []
             @type {{Array of Spline, Path, QuadraticBezierCurve or CubicBezierCurve}}
             */
            curves: {

                set: function (value) {

                    value = value || [];

                    var curve;

                    // Unsubscribe from events on old curves

                    var i;
                    var len;

                    for (i = 0, len = this._curves.length; i < len; i++) {

                        curve = this._curves[i];

                        curve.off(this._dirtySubs[i]);
                        curve.off(this._destroyedSubs[i]);
                    }

                    this._curves = [];

                    this._dirtySubs = [];
                    this._destroyedSubs = [];

                    var self = this;

                    function curveDirty() {
                        self._dirty = true;
                    }

                    function curveDestroyed() {

                        var id = this.id;

                        for (i = 0, len = self._curves.length; i < len; i++) {

                            if (self._curves[i].id === id) {

                                self._curves = self._curves.slice(i, i + 1);
                                self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                                self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);

                                self._dirty = true;

                                self.fire("curves", self._curves);

                                return;
                            }
                        }
                    }

                    for (i = 0, len = value.length; i < len; i++) {

                        curve = value[i];

                        if (XEO._isNumeric(curve) || XEO._isString(curve)) {

                            // ID given for curve - find the curve component

                            var id = curve;

                            curve = this.scene.components[id];

                            if (!curve) {
                                this.error("Component not found: " + XEO._inQuotes(id));
                                continue;
                            }
                        }

                        var type = curve.type;

                        if (type !== "XEO.SplineCurve" &&
                            type !== "XEO.Path" &&
                            type !== "XEO.CubicBezierCurve" &&
                            type !== "XEO.QuadraticBezierCurve") {

                            this.error("Component " + XEO._inQuotes(curve.id)
                                + " is not a XEO.SplineCurve, XEO.Path or XEO.QuadraticBezierCurve");

                            continue;
                        }

                        this._curves.push(curve);

                        this._dirtySubs.push(curve.on("dirty", curveDirty));

                        this._destroyedSubs.push(curve.on("destroyed", curveDestroyed));
                    }

                    this._dirty = true;

                    this.fire("curves", this._curves);
                },

                get: function () {
                    return this._curves;
                }
            },

            /**
             Current point of progress along this Path.

             Automatically clamps to range [0..1].

             Fires a {{#crossLink "Path/t:event"}}{{/crossLink}} event on change.

             @property t
             @default 0
             @type Number
             */
            t: {
                set: function (value) {

                    value = value || 0;

                    this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);

                    /**
                     * Fired whenever this Path's
                     * {{#crossLink "Path/t:property"}}{{/crossLink}} property changes.
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
             Point on this Path corresponding to the current value of {{#crossLink "Path/t:property"}}{{/crossLink}}.

             @property point
             @type {{Array of Number}}
             */
            point: {

                get: function () {
                    return this.getPoint(this._t);
                }
            },

            /**
             Length of this Path, which is the cumulative length of all {{#crossLink "Curve/t:property"}}Curves{{/crossLink}}
             currently in {{#crossLink "Path/curves:property"}}{{/crossLink}}.

             @property length
             @type {Number}
             */
            length: {

                get: function () {
                    var lens = this._getCurveLengths();
                    return lens[lens.length - 1];
                }
            }
        },

        /**
         * Gets a point on this Path corresponding to the given progress position.
         * @param {Number} t Indicates point of progress along this curve, in the range [0..1].
         * @returns {{Array of Number}}
         */
        getPoint: function (t) {

            var d = t * this.length;
            var curveLengths = this._getCurveLengths();
            var i = 0, diff, curve;

            while (i < curveLengths.length) {

                if (curveLengths[i] >= d) {

                    diff = curveLengths[i] - d;
                    curve = this._curves[i];

                    var u = 1 - diff / curve.length;

                    return curve._getPointAt(u);
                }
                i++;
            }
            return null;
        },

        _getCurveLengths: function () {

            if (!this._dirty) {
                return this._cachedLengths;
            }

            var lengths = [];
            var sums = 0;
            var i, il = this._curves.length;

            for (i = 0; i < il; i++) {

                sums += this._curves[i].length;
                lengths.push(sums);

            }

            this._cachedLengths = lengths;
            this._dirty = false;

            return lengths;
        },

        _getJSON: function () {

            var curveIds = [];

            for (var i = 0, len = this._curves.length; i < len; i++) {
                curveIds.push(this._curves[i].id);
            }

            return {
                curves: curveIds,
                t: this._t
            };
        },

        _destroy: function () {

            var i;
            var len;
            var curve;

            for (i = 0, len = this._curves.length; i < len; i++) {

                curve = this._curves[i];

                curve.off(this._dirtySubs[i]);
                curve.off(this._destroyedSubs[i]);
            }

            this._super();
        }
    });

})();

