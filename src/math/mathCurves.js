/**
 * Curve math functions.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    math.tangentQuadraticBezier = function (t, p0, p1, p2) {
        return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 );
    };

    math.tangentQuadraticBezier = function (t, p0, p1, p2, p3) {
        return -3 * p0 * (1 - t) * (1 - t) +
            3 * p1 * (1 - t) * (1 - t) - 6 * t * p1 * (1 - t) +
            6 * t * p2 * (1 - t) - 3 * t * t * p2 +
            3 * t * t * p3;
    };

    math.tangentSpline = function (t) {
        var h00 = 6 * t * t - 6 * t;
        var h10 = 3 * t * t - 4 * t + 1;
        var h01 = -6 * t * t + 6 * t;
        var h11 = 3 * t * t - 2 * t;
        return h00 + h10 + h01 + h11;
    };

    math.catmullRomInterpolate = function (p0, p1, p2, p3, t) {
        var v0 = ( p2 - p0 ) * 0.5;
        var v1 = ( p3 - p1 ) * 0.5;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( -3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;
    };

    // Bezier Curve formulii from http://en.wikipedia.org/wiki/B%C3%A9zier_curve

    // Quad Bezier Functions

    math.b2p0 = function (t, p) {
        var k = 1 - t;
        return k * k * p;

    };

    math.b2p1 = function (t, p) {
        return 2 * ( 1 - t ) * t * p;
    };

    math.b2p2 = function (t, p) {
        return t * t * p;
    };

    math.b2 = function (t, p0, p1, p2) {
        return this.b2p0(t, p0) + this.b2p1(t, p1) + this.b2p2(t, p2);
    };

    // Cubic Bezier Functions

    math.b3p0 = function (t, p) {
        var k = 1 - t;
        return k * k * k * p;
    };

    math.b3p1 = function (t, p) {
        var k = 1 - t;
        return 3 * k * k * t * p;
    };

    math.b3p2 = function (t, p) {
        var k = 1 - t;
        return 3 * k * t * t * p;
    };

    math.b3p3 = function (t, p) {
        return t * t * t * p;
    };

    math.b3 = function (t, p0, p1, p2, p3) {
        return this.b3p0(t, p0) + this.b3p1(t, p1) + this.b3p2(t, p2) + this.b3p3(t, p3);
    };
})();