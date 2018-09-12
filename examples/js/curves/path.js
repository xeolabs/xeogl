/**
 A **Path** is a complex curved path constructed from various {{#crossLink "Curve"}}{{/crossLink}} subtypes.

 ## Overview


 * A Path can be constructed from these {{#crossLink "Curve"}}{{/crossLink}} subtypes: {{#crossLink "SplineCurve"}}{{/crossLink}},
 {{#crossLink "CubicBezierCurve"}}{{/crossLink}} and {{#crossLink "QuadraticBezierCurve"}}{{/crossLink}}.
 * You can sample a {{#crossLink "Path/point:property"}}{{/crossLink}} and a {{#crossLink "Curve/tangent:property"}}{{/crossLink}}
 vector on a Path for any given value of {{#crossLink "Path/t:property"}}{{/crossLink}} in the range [0..1].
 * When you set {{#crossLink "Path/t:property"}}{{/crossLink}} on a Path, its
 {{#crossLink "Path/point:property"}}{{/crossLink}} and {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties
 will update accordingly.

 ## Examples

 * [CubicBezierCurve example](../../examples/#animation_curves_cubicBezier)
 * [Tweening position along a QuadraticBezierCurve](../../examples/#animation_curves_quadraticBezier)
 * [Tweening color along a QuadraticBezierCurve](../../examples/#animation_curves_quadraticBezier_color)
 * [SplineCurve example](../../examples/#animation_curves_spline)
 * [Path example](../../examples/#curves_Path)

 ## Usage

 #### Animation along a SplineCurve

 Create a Path containing a {{#crossLink "CubicBezierCurve"}}{{/crossLink}}, a {{#crossLink "QuadraticBezierCurve"}}{{/crossLink}}
 and a {{#crossLink "SplineCurve"}}{{/crossLink}}, subscribe to updates on its {{#crossLink "Path/point:property"}}{{/crossLink}} and
 {{#crossLink "Curve/tangent:property"}}{{/crossLink}} properties, then vary its {{#crossLink "Path/t:property"}}{{/crossLink}}
 property over time:

 ````javascript
 var path = new xeogl.Path({
     curves: [
         new xeogl.CubicBezierCurve({
             v0: [-10, 0, 0],
             v1: [-5, 15, 0],
             v2: [20, 15, 0],
             v3: [10, 0, 0]
         }),
         new xeogl.QuadraticBezierCurve({
             v0: [10, 0, 0],
             v1: [20, 15, 0],
             v2: [10, 0, 0]
         }),
         new xeogl.SplineCurve({
             points: [
                 [10, 0, 0],
                 [-5, 15, 0],
                 [20, 15, 0],
                 [10, 0, 0]
             ]
         })
     ]
 });

 path.on("point", function(point) {
     this.log("path.point=" + JSON.stringify(point));
 });

 path.on("tangent", function(tangent) {
     this.log("path.tangent=" + JSON.stringify(tangent));
 });

 path.on("t", function(t) {
     this.log("path.t=" + t);
 });

 path.scene.on("tick", function(e) {
     path.t = (e.time - e.startTime) * 0.01;
 });
 ````

 #### Randomly sampling points

 Use Path's {{#crossLink "Path/getPoint:method"}}{{/crossLink}} and
 {{#crossLink "path/getTangent:method"}}{{/crossLink}} methods to sample the point and vector
 at a given **t**:

 ````javascript
 path.scene.on("tick", function(e) {

     var t = (e.time - e.startTime) * 0.01;

     var point = path.getPoint(t);
     var tangent = path.getTangent(t);

     this.log("t=" + t + ", point=" + JSON.stringify(point) + ", tangent=" + JSON.stringify(tangent));
 });
 ````

 #### Sampling multiple points

 Use Path's {{#crossLink "path/getPoints:method"}}{{/crossLink}} method to sample a list of equidistant points
 along it. In the snippet below, we'll build a {{#crossLink "Geometry"}}{{/crossLink}} that renders a line along the
 path.  Note that we need to flatten the points array for consumption by the {{#crossLink "Geometry"}}{{/crossLink}}.

 ````javascript
 var geometry = new xeogl.Geometry({
     positions: xeogl.math.flatten(path.getPoints(50))
 });
 ````

 @class Path
 @module xeogl
 @submodule curves
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg] {*} Fly configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Path.
 @param [cfg.paths=[]] IDs or instances of {{#crossLink "path"}}{{/crossLink}} subtypes to add to this Path.
 @param [cfg.t=0] Current position on this Path, in range between 0..1.
 @extends path
 */

xeogl.Path = class xeoglPath extends xeogl.Curve {

    init(cfg) {
        super.init(cfg);
        this._cachedLengths = [];
        this._dirty = true;
        this._curves = []; // Array of child Curve components
        this._t = 0;
        this._dirtySubs = []; // Subscriptions to "dirty" events from child Curve components
        this._destroyedSubs = []; // Subscriptions to "destroyed" events from child Curve components
        this.curves = cfg.curves || [];    // Add initial curves
        this.t = cfg.t; // Set initial progress
    }

    /**
     * Adds a {{#crossLink "Curve"}}{{/crossLink}} to this Path.
     *
     * Fires a {{#crossLink "Path/curves:event"}}{{/crossLink}} event on change.
     *
     * @param {Curve} curve The {{#crossLink "Curve"}}{{/crossLink}} to add.
     */
    addCurve(curve) {
        this._curves.push(curve);
        this._dirty = true;
        /**
         * Fired whenever this Path's
         * {{#crossLink "Path/curves:property"}}{{/crossLink}} property changes.
         * @event curves
         * @param value The property's new value
         */
        this.fire("curves", this._curves);
    }

    /**
     The {{#crossLink "Curve"}}Curves{{/crossLink}} in this Path.

     Fires a {{#crossLink "Path/curves:event"}}{{/crossLink}} event on change.

     @property curves
     @default []
     @type {{Array of Spline, Path, QuadraticBezierCurve or CubicBezierCurve}}
     */
    set   curves(value) {

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
            if (xeogl._isNumeric(curve) || xeogl._isString(curve)) {
                // ID given for curve - find the curve component
                var id = curve;
                curve = this.scene.components[id];
                if (!curve) {
                    this.error("Component not found: " + xeogl._inQuotes(id));
                    continue;
                }
            }

            var type = curve.type;

            if (type !== "xeogl.SplineCurve" &&
                type !== "xeogl.Path" &&
                type !== "xeogl.CubicBezierCurve" &&
                type !== "xeogl.QuadraticBezierCurve") {

                this.error("Component " + xeogl._inQuotes(curve.id)
                    + " is not a xeogl.SplineCurve, xeogl.Path or xeogl.QuadraticBezierCurve");

                continue;
            }

            this._curves.push(curve);
            this._dirtySubs.push(curve.on("dirty", curveDirty));
            this._destroyedSubs.push(curve.on("destroyed", curveDestroyed));
        }

        this._dirty = true;

        this.fire("curves", this._curves);
    }

    get curves() {
        return this._curves;
    }

    /**
     Current point of progress along this Path.

     Automatically clamps to range [0..1].

     Fires a {{#crossLink "Path/t:event"}}{{/crossLink}} event on change.

     @property t
     @default 0
     @type Number
     */
    set t(value) {
        value = value || 0;
        this._t = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);
        /**
         * Fired whenever this Path's
         * {{#crossLink "Path/t:property"}}{{/crossLink}} property changes.
         * @event t
         * @param value The property's new value
         */
        this.fire("t", this._t);
    }

    get t() {
        return this._t;
    }

    /**
     Point on this Path corresponding to the current value of {{#crossLink "Path/t:property"}}{{/crossLink}}.

     @property point
     @type {{Array of Number}}
     */
    get point() {
        return this.getPoint(this._t);
    }

    /**
     Length of this Path, which is the cumulative length of all {{#crossLink "Curve/t:property"}}Curves{{/crossLink}}
     currently in {{#crossLink "Path/curves:property"}}{{/crossLink}}.

     @property length
     @type {Number}
     */
    get length() {
        var lens = this._getCurveLengths();
        return lens[lens.length - 1];
    }

    /**
     * Gets a point on this Path corresponding to the given progress position.
     * @param {Number} t Indicates point of progress along this curve, in the range [0..1].
     * @returns {{Array of Number}}
     */
    getPoint(t) {
        var d = t * this.length;
        var curveLengths = this._getCurveLengths();
        var i = 0, diff, curve;
        while (i < curveLengths.length) {
            if (curveLengths[i] >= d) {
                diff = curveLengths[i] - d;
                curve = this._curves[i];
                var u = 1 - diff / curve.length;
                return curve.getPointAt(u);
            }
            i++;
        }
        return null;
    }

    _getCurveLengths() {
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
    }

    _getJSON() {
        var curveIds = [];
        for (var i = 0, len = this._curves.length; i < len; i++) {
            curveIds.push(this._curves[i].id);
        }
        return {
            curves: curveIds,
            t: this._t
        };
    }

    destroy() {
        super.destroy();
        var i;
        var len;
        var curve;
        for (i = 0, len = this._curves.length; i < len; i++) {
            curve = this._curves[i];
            curve.off(this._dirtySubs[i]);
            curve.off(this._destroyedSubs[i]);
        }
    }
};

