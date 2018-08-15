/**
 * Geometry math functions.
 */
(function () {

    "use strict";

    const math = xeogl.math;

    /**
     * Calculates the normal vector of a triangle.
     *
     * @private
     */
    math.triangleNormal = function (a, b, c, normal) {

        normal = normal || math.vec3();

        const p1x = b[0] - a[0];
        const p1y = b[1] - a[1];
        const p1z = b[2] - a[2];

        const p2x = c[0] - a[0];
        const p2y = c[1] - a[1];
        const p2z = c[2] - a[2];

        const p3x = p1y * p2z - p1z * p2y;
        const p3y = p1z * p2x - p1x * p2z;
        const p3z = p1x * p2y - p1y * p2x;

        const mag = Math.sqrt(p3x * p3x + p3y * p3y + p3z * p3z);
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
    math.rayTriangleIntersect = (function () {

        const tempVec3 = new Float32Array(3);
        const tempVec3b = new Float32Array(3);
        const tempVec3c = new Float32Array(3);
        const tempVec3d = new Float32Array(3);
        const tempVec3e = new Float32Array(3);

        return function (origin, dir, a, b, c, isect) {

            isect = isect || math.vec3();

            const EPSILON = 0.000001;

            const edge1 = math.subVec3(b, a, tempVec3);
            const edge2 = math.subVec3(c, a, tempVec3b);

            const pvec = math.cross3Vec3(dir, edge2, tempVec3c);
            const det = math.dotVec3(edge1, pvec);
            if (det < EPSILON) {
                return null;
            }

            const tvec = math.subVec3(origin, a, tempVec3d);
            const u = math.dotVec3(tvec, pvec);
            if (u < 0 || u > det) {
                return null;
            }

            const qvec = math.cross3Vec3(tvec, edge1, tempVec3e);
            const v = math.dotVec3(dir, qvec);
            if (v < 0 || u + v > det) {
                return null;
            }

            const t = math.dotVec3(edge2, qvec) / det;
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
    math.rayPlaneIntersect = (function () {

        const tempVec3 = new Float32Array(3);
        const tempVec3b = new Float32Array(3);
        const tempVec3c = new Float32Array(3);
        const tempVec3d = new Float32Array(3);

        return function (origin, dir, a, b, c, isect) {

            isect = isect || math.vec3();

            dir = math.normalizeVec3(dir, tempVec3);

            const edge1 = math.subVec3(b, a, tempVec3b);
            const edge2 = math.subVec3(c, a, tempVec3c);

            const n = math.cross3Vec3(edge1, edge2, tempVec3d);
            math.normalizeVec3(n, n);

            const d = -math.dotVec3(a, n);

            const t = -(math.dotVec3(origin, n) + d) / math.dotVec3(dir, n);

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
    math.cartesianToBarycentric = (function () {

        const tempVec3 = new Float32Array(3);
        const tempVec3b = new Float32Array(3);
        const tempVec3c = new Float32Array(3);

        return function (cartesian, a, b, c, dest) {

            const v0 = math.subVec3(c, a, tempVec3);
            const v1 = math.subVec3(b, a, tempVec3b);
            const v2 = math.subVec3(cartesian, a, tempVec3c);

            const dot00 = math.dotVec3(v0, v0);
            const dot01 = math.dotVec3(v0, v1);
            const dot02 = math.dotVec3(v0, v2);
            const dot11 = math.dotVec3(v1, v1);
            const dot12 = math.dotVec3(v1, v2);

            const denom = ( dot00 * dot11 - dot01 * dot01 );

            // Colinear or singular triangle

            if (denom === 0) {

                // Arbitrary location outside of triangle

                return null;
            }

            const invDenom = 1 / denom;

            const u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
            const v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

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

        const v = bary[1];
        const u = bary[2];

        return (u >= 0) && (v >= 0) && (u + v < 1);
    };

    /**
     * Gets cartesian coordinates from barycentric coordinates within a triangle.
     *
     * @private
     */
    math.barycentricToCartesian = function (bary, a, b, c, cartesian) {

        cartesian = cartesian || math.vec3();

        const u = bary[0];
        const v = bary[1];
        const w = bary[2];

        cartesian[0] = a[0] * u + b[0] * v + c[0] * w;
        cartesian[1] = a[1] * u + b[1] * v + c[1] * w;
        cartesian[2] = a[2] * u + b[2] * v + c[2] * w;

        return cartesian;
    };

    /**
     * Given geometry defined as an array of positions, optional normals, option uv and an array of indices, returns
     * modified arrays that have duplicate vertices removed.
     *
     * Note: does not work well when co-incident vertices have same positions but different normals and UVs.
     *
     * @param positions
     * @param normals
     * @param uv
     * @param indices
     * @returns {{positions: Array, indices: Array}}
     * @private
     */
    math.mergeVertices = function (positions, normals, uv, indices) {
        const positionsMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
        const indicesLookup = [];
        const uniquePositions = [];
        const uniqueNormals = normals ? [] : null;
        const uniqueUV = uv ? [] : null;
        const indices2 = [];
        let vx;
        let vy;
        let vz;
        let key;
        const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        const precision = Math.pow(10, precisionPoints);
        let i;
        let len;
        let uvi = 0;
        for (i = 0, len = positions.length; i < len; i += 3) {
            vx = positions[i];
            vy = positions[i + 1];
            vz = positions[i + 2];
            key = Math.round(vx * precision) + '_' + Math.round(vy * precision) + '_' + Math.round(vz * precision);
            if (positionsMap[key] === undefined) {
                positionsMap[key] = uniquePositions.length / 3;
                uniquePositions.push(vx);
                uniquePositions.push(vy);
                uniquePositions.push(vz);
                if (normals) {
                    uniqueNormals.push(normals[i]);
                    uniqueNormals.push(normals[i + 1]);
                    uniqueNormals.push(normals[i + 2]);
                }
                if (uv) {
                    uniqueUV.push(uv[uvi]);
                    uniqueUV.push(uv[uvi + 1]);
                }
            }
            indicesLookup[i / 3] = positionsMap[key];
            uvi += 2;
        }
        for (i = 0, len = indices.length; i < len; i++) {
            indices2[i] = indicesLookup[indices[i]];
        }
        const result = {
            positions: uniquePositions,
            indices: indices2
        };
        if (uniqueNormals) {
            result.normals = uniqueNormals;
        }
        if (uniqueUV) {
            result.uv = uniqueUV;

        }
        return result;
    }


})();