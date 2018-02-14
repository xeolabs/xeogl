/**
 * Geometry math functions.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    /**
     * Calculates the normal vector of a triangle.
     *
     * @private
     */
    math.triangleNormal = function (a, b, c, normal) {

        normal = normal || math.vec3();

        var p1x = b[0] - a[0];
        var p1y = b[1] - a[1];
        var p1z = b[2] - a[2];

        var p2x = c[0] - a[0];
        var p2y = c[1] - a[1];
        var p2z = c[2] - a[2];

        var p3x = p1y * p2z - p1z * p2y;
        var p3y = p1z * p2x - p1x * p2z;
        var p3z = p1x * p2y - p1y * p2x;

        var mag = Math.sqrt(p3x * p3x + p3y * p3y + p3z * p3z);
        if (mag === 0) {
            normal[0] = 0;
            normal[1] = 0;
            normal[2] = 0;
        } else {
            normal[0] = p3x / mag;
            normal[1] = p3y / mag;
            normal[2] = p3z / mag;
        }

        return normal
    };

    /**
     * Finds the intersection of a 3D ray with a 3D triangle.
     *
     * @private
     */
    math.rayTriangleIntersect = (function() {

        var tempVec3 = new Float32Array(3);
        var tempVec3b = new Float32Array(3);
        var tempVec3c = new Float32Array(3);
        var tempVec3d = new Float32Array(3);
        var tempVec3e = new Float32Array(3);

        return function (origin, dir, a, b, c, isect) {

            isect = isect || math.vec3();

            var EPSILON = 0.000001;

            var edge1 = math.subVec3(b, a, tempVec3);
            var edge2 = math.subVec3(c, a, tempVec3b);

            var pvec = math.cross3Vec3(dir, edge2, tempVec3c);
            var det = math.dotVec3(edge1, pvec);
            if (det < EPSILON) {
                return null;
            }

            var tvec = math.subVec3(origin, a, tempVec3d);
            var u = math.dotVec3(tvec, pvec);
            if (u < 0 || u > det) {
                return null;
            }

            var qvec = math.cross3Vec3(tvec, edge1, tempVec3e);
            var v = math.dotVec3(dir, qvec);
            if (v < 0 || u + v > det) {
                return null;
            }

            var t = math.dotVec3(edge2, qvec) / det;
            isect[0] = origin[0] + t * dir[0];
            isect[1] = origin[1] + t * dir[1];
            isect[2] = origin[2] + t * dir[2];

            return isect;
        };
    })();

    /**
     * Finds the intersection of a 3D ray with a plane defined by 3 points.
     *
     * @private
     */
    math.rayPlaneIntersect = (function() {

        var tempVec3 = new Float32Array(3);
        var tempVec3b = new Float32Array(3);
        var tempVec3c = new Float32Array(3);
        var tempVec3d = new Float32Array(3);

        return function (origin, dir, a, b, c, isect) {

            isect = isect || math.vec3();

            dir = math.normalizeVec3(dir, tempVec3);

            var edge1 = math.subVec3(b, a, tempVec3b);
            var edge2 = math.subVec3(c, a, tempVec3c);

            var n = math.cross3Vec3(edge1, edge2, tempVec3d);
            math.normalizeVec3(n, n);

            var d = -math.dotVec3(a, n);

            var t = -(math.dotVec3(origin, n) + d) / math.dotVec3(dir, n);

            isect[0] = origin[0] + t * dir[0];
            isect[1] = origin[1] + t * dir[1];
            isect[2] = origin[2] + t * dir[2];

            return isect;
        };
    })();

    /**
     * Gets barycentric coordinates from cartesian coordinates within a triangle.
     * Gets barycentric coordinates from cartesian coordinates within a triangle.
     *
     * @private
     */
    math.cartesianToBarycentric = (function() {

        var tempVec3 = new Float32Array(3);
        var tempVec3b = new Float32Array(3);
        var tempVec3c = new Float32Array(3);

        return function (cartesian, a, b, c, dest) {

            var v0 = math.subVec3(c, a, tempVec3);
            var v1 = math.subVec3(b, a, tempVec3b);
            var v2 = math.subVec3(cartesian, a, tempVec3c);

            var dot00 = math.dotVec3(v0, v0);
            var dot01 = math.dotVec3(v0, v1);
            var dot02 = math.dotVec3(v0, v2);
            var dot11 = math.dotVec3(v1, v1);
            var dot12 = math.dotVec3(v1, v2);

            var denom = ( dot00 * dot11 - dot01 * dot01 );

            // Colinear or singular triangle

            if (denom === 0) {

                // Arbitrary location outside of triangle

                return null;
            }

            var invDenom = 1 / denom;

            var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
            var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

            dest[0] = 1 - u - v;
            dest[1] = v;
            dest[2] = u;

            return dest;
        };
    })();

    /**
     * Returns true if the given barycentric coordinates are within their triangle.
     *
     * @private
     */
    math.barycentricInsideTriangle = function (bary) {

        var v = bary[1];
        var u = bary[2];

        return (u >= 0) && (v >= 0) && (u + v < 1);
    };

    /**
     * Gets cartesian coordinates from barycentric coordinates within a triangle.
     *
     * @private
     */
    math.barycentricToCartesian = function (bary, a, b, c, cartesian) {

        cartesian = cartesian || math.vec3();

        var u = bary[0];
        var v = bary[1];
        var w = bary[2];

        cartesian[0] = a[0] * u + b[0] * v + c[0] * w;
        cartesian[1] = a[1] * u + b[1] * v + c[1] * w;
        cartesian[2] = a[2] * u + b[2] * v + c[2] * w;

        return cartesian;
    };

})();