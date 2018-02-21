/**
 * Boundary math functions.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    /**
     * Returns a new, uninitialized 3D axis-aligned bounding box.
     *
     * @private
     */
    math.AABB3 = function (values) {
        return new Float32Array(values || 6);
    };

    /**
     * Returns a new, uninitialized 2D axis-aligned bounding box.
     *
     * @private
     */
    math.AABB2 = function (values) {
        return new Float32Array(values || 4);
    };

    /**
     * Returns a new, uninitialized 3D oriented bounding box (OBB).
     *
     * @private
     */
    math.OBB3 = function (values) {
        return new Float32Array(values || 32);
    };

    /**
     * Returns a new, uninitialized 2D oriented bounding box (OBB).
     *
     * @private
     */
    math.OBB2 = function (values) {
        return new Float32Array(values || 16);
    };


    /**
     * Transforms an OBB3 by a 4x4 matrix.
     *
     * @private
     */
    math.transformOBB3 = function (m, p, p2) {

        p2 = p2 || p;

        var i;
        var len = p.length;

        var x;
        var y;
        var z;

        var m0 = m[0];
        var m1 = m[1];
        var m2 = m[2];
        var m3 = m[3];
        var m4 = m[4];
        var m5 = m[5];
        var m6 = m[6];
        var m7 = m[7];
        var m8 = m[8];
        var m9 = m[9];
        var m10 = m[10];
        var m11 = m[11];
        var m12 = m[12];
        var m13 = m[13];
        var m14 = m[14];
        var m15 = m[15];

        for (i = 0; i < len; i += 4) {

            x = p[i + 0];
            y = p[i + 1];
            z = p[i + 2];

            p2[i + 0] = (m0 * x) + (m4 * y) + (m8 * z) + m12;
            p2[i + 1] = (m1 * x) + (m5 * y) + (m9 * z) + m13;
            p2[i + 2] = (m2 * x) + (m6 * y) + (m10 * z) + m14;
            p2[i + 3] = (m3 * x) + (m7 * y) + (m11 * z) + m15;
        }

        return p2;
    };

    /**
     * Gets the diagonal size of an AABB3 given as minima and maxima.
     *
     * @private
     */
    math.getAABB3Diag = (function () {

        var min = new Float32Array(3);
        var max = new Float32Array(3);
        var tempVec3 = new Float32Array(3);

        return function (aabb) {

            min[0] = aabb[0];
            min[1] = aabb[1];
            min[2] = aabb[2];

            max[0] = aabb[3];
            max[1] = aabb[4];
            max[2] = aabb[5];

            math.subVec3(max, min, tempVec3);

            return Math.abs(math.lenVec3(tempVec3));
        };
    })();

    /**
     * Get a diagonal boundary size that is symmetrical about the given point.
     *
     * @private
     */
    math.getAABB3DiagPoint = (function () {

        var min = new Float32Array(3);
        var max = new Float32Array(3);
        var tempVec3 = new Float32Array(3);

        return function (aabb, p) {

            min[0] = aabb[0];
            min[1] = aabb[1];
            min[2] = aabb[2];

            max[0] = aabb[3];
            max[1] = aabb[4];
            max[2] = aabb[5];

            var diagVec = math.subVec3(max, min, tempVec3);

            var xneg = p[0] - aabb[0];
            var xpos = aabb[3] - p[0];
            var yneg = p[1] - aabb[1];
            var ypos = aabb[4] - p[1];
            var zneg = p[2] - aabb[2];
            var zpos = aabb[5] - p[2];

            diagVec[0] += (xneg > xpos) ? xneg : xpos;
            diagVec[1] += (yneg > ypos) ? yneg : ypos;
            diagVec[2] += (zneg > zpos) ? zneg : zpos;

            return Math.abs(math.lenVec3(diagVec));
        };
    })();

    /**
     * Gets the center of an AABB.
     *
     * @private
     */
    math.getAABB3Center = function (aabb, dest) {
        var r = dest || math.vec3();

        r[0] = (aabb[0] + aabb[3] ) / 2;
        r[1] = (aabb[1] + aabb[4] ) / 2;
        r[2] = (aabb[2] + aabb[5] ) / 2;

        return r;
    };

    /**
     * Gets the center of a 2D AABB.
     *
     * @private
     */
    math.getAABB2Center = function (aabb, dest) {
        var r = dest || math.vec2();

        r[0] = (aabb[2] + aabb[0] ) / 2;
        r[1] = (aabb[3] + aabb[1] ) / 2;

        return r;
    };

    /**
     * Collapses a 3D axis-aligned boundary, ready to expand to fit 3D points.
     * Creates new AABB if none supplied.
     *
     * @private
     */
    math.collapseAABB3 = function (aabb) {

        aabb = aabb || math.AABB3();

        aabb[0] = xeogl.math.MAX_DOUBLE;
        aabb[1] = xeogl.math.MAX_DOUBLE;
        aabb[2] = xeogl.math.MAX_DOUBLE;
        aabb[3] = -xeogl.math.MAX_DOUBLE;
        aabb[4] = -xeogl.math.MAX_DOUBLE;
        aabb[5] = -xeogl.math.MAX_DOUBLE;

        return aabb;
    };

    /**
     * Converts an axis-aligned 3D boundary into an oriented boundary consisting of
     * an array of eight 3D positions, one for each corner of the boundary.
     *
     * @private
     */
    math.AABB3ToOBB3 = function (aabb, obb) {

        obb = obb || math.OBB3();

        obb[0] = aabb[0];
        obb[1] = aabb[1];
        obb[2] = aabb[2];
        obb[3] = 1;

        obb[4] = aabb[3];
        obb[5] = aabb[1];
        obb[6] = aabb[2];
        obb[7] = 1;

        obb[8] = aabb[3];
        obb[9] = aabb[4];
        obb[10] = aabb[2];
        obb[11] = 1;

        obb[12] = aabb[0];
        obb[13] = aabb[4];
        obb[14] = aabb[2];
        obb[15] = 1;

        obb[16] = aabb[0];
        obb[17] = aabb[1];
        obb[18] = aabb[5];
        obb[19] = 1;

        obb[20] = aabb[3];
        obb[21] = aabb[1];
        obb[22] = aabb[5];
        obb[23] = 1;

        obb[24] = aabb[3];
        obb[25] = aabb[4];
        obb[26] = aabb[5];
        obb[27] = 1;

        obb[28] = aabb[0];
        obb[29] = aabb[4];
        obb[30] = aabb[5];
        obb[31] = 1;

        return obb;
    };

    /**
     * Finds the minimum axis-aligned 3D boundary enclosing the homogeneous 3D points (x,y,z,w) given in a flattened array.
     *
     * @private
     */
    math.positions3ToAABB3 = (function() {

        var p = new Float32Array(3);

        return function (positions, aabb, positionsDecodeMatrix) {

            aabb = aabb || math.AABB3();

            var xmin = xeogl.math.MAX_DOUBLE;
            var ymin = xeogl.math.MAX_DOUBLE;
            var zmin = xeogl.math.MAX_DOUBLE;
            var xmax = -xeogl.math.MAX_DOUBLE;
            var ymax = -xeogl.math.MAX_DOUBLE;
            var zmax = -xeogl.math.MAX_DOUBLE;

            var x, y, z;

            for (var i = 0, len = positions.length; i < len; i += 3) {

                if (positionsDecodeMatrix) {

                    p[0] = positions[i + 0];
                    p[1] = positions[i + 1];
                    p[2] = positions[i + 2];

                    math.decompressPosition(p, positionsDecodeMatrix, p);

                    x = p[0];
                    y = p[1];
                    z = p[2];

                } else {
                    x = positions[i + 0];
                    y = positions[i + 1];
                    z = positions[i + 2];
                }

                if (x < xmin) {
                    xmin = x;
                }

                if (y < ymin) {
                    ymin = y;
                }

                if (z < zmin) {
                    zmin = z;
                }

                if (x > xmax) {
                    xmax = x;
                }

                if (y > ymax) {
                    ymax = y;
                }

                if (z > zmax) {
                    zmax = z;
                }
            }

            aabb[0] = xmin;
            aabb[1] = ymin;
            aabb[2] = zmin;
            aabb[3] = xmax;
            aabb[4] = ymax;
            aabb[5] = zmax;

            return aabb;
        };
    })();

    /**
     * Finds the minimum axis-aligned 3D boundary enclosing the homogeneous 3D points (x,y,z,w) given in a flattened array.
     *
     * @private
     */
    math.OBB3ToAABB3 = function (obb, aabb) {

        aabb = aabb || math.AABB3();

        var xmin = xeogl.math.MAX_DOUBLE;
        var ymin = xeogl.math.MAX_DOUBLE;
        var zmin = xeogl.math.MAX_DOUBLE;
        var xmax = -xeogl.math.MAX_DOUBLE;
        var ymax = -xeogl.math.MAX_DOUBLE;
        var zmax = -xeogl.math.MAX_DOUBLE;

        var x, y, z;

        for (var i = 0, len = obb.length; i < len; i += 4) {

            x = obb[i + 0];
            y = obb[i + 1];
            z = obb[i + 2];

            if (x < xmin) {
                xmin = x;
            }

            if (y < ymin) {
                ymin = y;
            }

            if (z < zmin) {
                zmin = z;
            }

            if (x > xmax) {
                xmax = x;
            }

            if (y > ymax) {
                ymax = y;
            }

            if (z > zmax) {
                zmax = z;
            }
        }

        aabb[0] = xmin;
        aabb[1] = ymin;
        aabb[2] = zmin;
        aabb[3] = xmax;
        aabb[4] = ymax;
        aabb[5] = zmax;

        return aabb;
    };

    /**
     * Finds the minimum axis-aligned 3D boundary enclosing the given 3D points.
     *
     * @private
     */
    math.points3ToAABB3 = function (points, aabb) {

        aabb = aabb || math.AABB3();

        var xmin = xeogl.math.MAX_DOUBLE;
        var ymin = xeogl.math.MAX_DOUBLE;
        var zmin = xeogl.math.MAX_DOUBLE;
        var xmax = -xeogl.math.MAX_DOUBLE;
        var ymax = -xeogl.math.MAX_DOUBLE;
        var zmax = -xeogl.math.MAX_DOUBLE;

        var x, y, z;

        for (var i = 0, len = points.length; i < len; i++) {

            x = points[i][0];
            y = points[i][1];
            z = points[i][2];

            if (x < xmin) {
                xmin = x;
            }

            if (y < ymin) {
                ymin = y;
            }

            if (z < zmin) {
                zmin = z;
            }

            if (x > xmax) {
                xmax = x;
            }

            if (y > ymax) {
                ymax = y;
            }

            if (z > zmax) {
                zmax = z;
            }
        }

        aabb[0] = xmin;
        aabb[1] = ymin;
        aabb[2] = zmin;
        aabb[3] = xmax;
        aabb[4] = ymax;
        aabb[5] = zmax;

        return aabb;
    };

    /**
     * Finds the minimum boundary sphere enclosing the given 3D points.
     *
     * @private
     */
    math.points3ToSphere3 = (function () {

        var tempVec3 = new Float32Array(3);

        return function (points, sphere) {

            sphere = sphere || math.vec4();

            var x = 0;
            var y = 0;
            var z = 0;

            var i;
            var numPoints = points.length;

            for (i = 0; i < numPoints; i++) {
                x += points[i][0];
                y += points[i][1];
                z += points[i][2];
            }

            sphere[0] = x / numPoints;
            sphere[1] = y / numPoints;
            sphere[2] = z / numPoints;

            var radius = 0;
            var dist;

            for (i = 0; i < numPoints; i++) {

                dist = Math.abs(math.lenVec3(math.subVec3(points[i], sphere, tempVec3)));

                if (dist > radius) {
                    radius = dist;
                }
            }

            sphere[3] = radius;

            return sphere;
        };
    })();

    /**
     * Finds the minimum boundary sphere enclosing the given 3D points.
     *
     * @private
     */
    math.OBB3ToSphere3 = (function () {

        var point = new Float32Array(3);
        var tempVec3 = new Float32Array(3);

        return function (points, sphere) {

            sphere = sphere || math.vec4();

            var x = 0;
            var y = 0;
            var z = 0;

            var i;
            var lenPoints = points.length;
            var numPoints = lenPoints / 4;

            for (i = 0; i < lenPoints; i += 4) {
                x += points[i + 0];
                y += points[i + 1];
                z += points[i + 2];
            }

            sphere[0] = x / numPoints;
            sphere[1] = y / numPoints;
            sphere[2] = z / numPoints;

            var radius = 0;
            var dist;

            for (i = 0; i < lenPoints; i += 4) {

                point[0] = points[i + 0];
                point[1] = points[i + 1];
                point[2] = points[i + 2];

                dist = Math.abs(math.lenVec3(math.subVec3(point, sphere, tempVec3)));

                if (dist > radius) {
                    radius = dist;
                }
            }

            sphere[3] = radius;

            return sphere;
        };
    })();

    /**
     * Gets the center of a bounding sphere.
     *
     * @private
     */
    math.getSphere3Center = function (sphere, dest) {
        dest = dest || math.vec3();

        dest[0] = sphere[0];
        dest[1] = sphere[1];
        dest[2] = sphere[2];

        return dest;
    };

    /**
     * Expands the first axis-aligned 3D boundary to enclose the second, if required.
     *
     * @private
     */
    math.expandAABB3 = function (aabb1, aabb2) {

        if (aabb1[0] > aabb2[0]) {
            aabb1[0] = aabb2[0];
        }

        if (aabb1[1] > aabb2[1]) {
            aabb1[1] = aabb2[1];
        }

        if (aabb1[2] > aabb2[2]) {
            aabb1[2] = aabb2[2];
        }

        if (aabb1[3] < aabb2[3]) {
            aabb1[3] = aabb2[3];
        }

        if (aabb1[4] < aabb2[4]) {
            aabb1[4] = aabb2[4];
        }

        if (aabb1[5] < aabb2[5]) {
            aabb1[5] = aabb2[5];
        }

        return aabb1;
    };

    /**
     * Expands an axis-aligned 3D boundary to enclose the given point, if needed.
     *
     * @private
     */
    math.expandAABB3Point3 = function (aabb, p) {

        if (aabb[0] < p[0]) {
            aabb[0] = p[0];
        }

        if (aabb[1] < p[1]) {
            aabb[1] = p[1];
        }

        if (aabb[2] < p[2]) {
            aabb[2] = p[2];
        }

        if (aabb[3] > p[0]) {
            aabb[3] = p[0];
        }

        if (aabb[4] > p[1]) {
            aabb[4] = p[1];
        }

        if (aabb[5] > p[2]) {
            aabb[5] = p[2];
        }

        return aabb;
    };

    /**
     * Collapses a 2D axis-aligned boundary, ready to expand to fit 2D points.
     * Creates new AABB if none supplied.
     *
     * @private
     */
    math.collapseAABB2 = function (aabb) {

        aabb = aabb || math.AABB2();

        aabb[0] = xeogl.math.MAX_DOUBLE;
        aabb[1] = xeogl.math.MAX_DOUBLE;
        aabb[2] = -xeogl.math.MAX_DOUBLE;
        aabb[3] = -xeogl.math.MAX_DOUBLE;

        return aabb;
    };

    /**
     * Finds the minimum 2D projected axis-aligned boundary enclosing the given 3D points.
     *
     * @private
     */
    math.OBB3ToAABB2 = function (points, aabb) {

        aabb = aabb || math.AABB2();

        var xmin = xeogl.math.MAX_DOUBLE;
        var ymin = xeogl.math.MAX_DOUBLE;
        var xmax = -xeogl.math.MAX_DOUBLE;
        var ymax = -xeogl.math.MAX_DOUBLE;

        var x;
        var y;
        var w;
        var f;

        for (var i = 0, len = points.length; i < len; i += 4) {

            x = points[i + 0];
            y = points[i + 1];
            w = points[i + 3] || 1.0;

            f = 1.0 / w;

            x *= f;
            y *= f;

            if (x < xmin) {
                xmin = x;
            }

            if (y < ymin) {
                ymin = y;
            }

            if (x > xmax) {
                xmax = x;
            }

            if (y > ymax) {
                ymax = y;
            }
        }

        aabb[0] = xmin;
        aabb[1] = ymin;
        aabb[2] = xmax;
        aabb[3] = ymax;

        return aabb;
    };

    /**
     * Expands the first axis-aligned 2D boundary to enclose the second, if required.
     *
     * @private
     */
    math.expandAABB2 = function (aabb1, aabb2) {

        if (aabb1[0] > aabb2[0]) {
            aabb1[0] = aabb2[0];
        }

        if (aabb1[1] > aabb2[1]) {
            aabb1[1] = aabb2[1];
        }

        if (aabb1[2] < aabb2[2]) {
            aabb1[2] = aabb2[2];
        }

        if (aabb1[3] < aabb2[3]) {
            aabb1[3] = aabb2[3];
        }

        return aabb1;
    };

    /**
     * Expands an axis-aligned 2D boundary to enclose the given point, if required.
     *
     * @private
     */
    math.expandAABB2Point2 = function (aabb, p) {

        if (aabb[0] > p[0]) {
            aabb[0] = p[0];
        }

        if (aabb[1] > p[1]) {
            aabb[1] = p[1];
        }

        if (aabb[2] < p[0]) {
            aabb[2] = p[0];
        }

        if (aabb[3] < p[1]) {
            aabb[3] = p[1];
        }

        return aabb;
    };

    math.AABB2ToCanvas = function (aabb, canvasWidth, canvasHeight, aabb2) {

        aabb2 = aabb2 || aabb;

        var xmin = (aabb[0] + 1.0) * 0.5;
        var ymin = (aabb[1] + 1.0) * 0.5;
        var xmax = (aabb[2] + 1.0) * 0.5;
        var ymax = (aabb[3] + 1.0) * 0.5;

        aabb2[0] = Math.floor(xmin * canvasWidth);
        aabb2[1] = canvasHeight - Math.floor(ymax * canvasHeight);
        aabb2[2] = Math.floor(xmax * canvasWidth);
        aabb2[3] = canvasHeight - Math.floor(ymin * canvasHeight);

        return aabb2;
    };

})();