(function () {

    "use strict";

    // Some temporary vars to help avoid garbage collection

    var tempMat1 = new Float32Array(16);
    var tempMat2 = new Float32Array(16);
    var tempVec3 = new Float32Array(3);
    var tempVec3b = new Float32Array(3);
    var tempVec3c = new Float32Array(3);
    var tempVec3d = new Float32Array(3);
    var tempVec3e = new Float32Array(3);
    var tempVec3f = new Float32Array(3);
    var tempVec3g = new Float32Array(3);

    var tempVec4 = new Float32Array(4);

    /*
     * Optimizations made based on glMatrix by Brandon Jones
     */

    /*
     * Copyright (c) 2010 Brandon Jones
     *
     * This software is provided 'as-is', without any express or implied
     * warranty. In no event will the authors be held liable for any damages
     * arising from the use of this software.
     *
     * Permission is granted to anyone to use this software for any purpose,
     * including commercial applications, and to alter it and redistribute it
     * freely, subject to the following restrictions:
     *
     *    1. The origin of this software must not be misrepresented; you must not
     *    claim that you wrote the original software. If you use this software
     *    in a product, an acknowledgment in the product documentation would be
     *    appreciated but is not required.
     *
     *    2. Altered source versions must be plainly marked as such, and must not
     *    be misrepresented as being the original software.
     *
     *    3. This notice may not be removed or altered from any source
     *    distribution.
     */


    /**
     * This utility object provides math functions that are used within xeoEngine. These functions are also part xeoEngine's
     * public API and are therefore available for you to use within your application code.
     * @module XEO
     * @submodule math
     * @class math
     * @static
     */
    var math = XEO.math = {

        /**
         * The number of radiians in a degree (0.0174532925).
         * @property DEGTORAD
         * @namespace XEO.math
         * @type {Number}
         */
        DEGTORAD: 0.0174532925,

        /**
         * Returns a new, uninitialized two-element vector.
         * @method vec2
         * @param [values] Initial values.
         * @static
         * @returns {Float32Array}
         */
        vec2: function (values) {
            return new Float32Array(values || 2);
        },

        /**
         * Returns a new, uninitialized three-element vector.
         * @method vec3
         * @param [values] Initial values.
         * @static
         * @returns {Float32Array}
         */
        vec3: function (values) {
            return new Float32Array(values || 3);
        },

        /**
         * Returns a new, uninitialized four-element vector.
         * @method vec4
         * @param [values] Initial values.
         * @static
         * @returns {Float32Array}
         */
        vec4: function (values) {
            return new Float32Array(values || 4);
        },

        /**
         * Returns a new, uninitialized 3x3 matrix.
         * @method mat3
         * @param [values] Initial values.
         * @static
         * @returns {Float32Array}
         */
        mat3: function (values) {
            return new Float32Array(values || 9);
        },

        /**
         * Returns a new, uninitialized 4x4 matrix.
         * @method mat4
         * @param [values] Initial values.
         * @static
         * @returns {Float32Array}
         */
        mat4: function (values) {
            return new Float32Array(values || 16);
        },

        /**
         * Returns a new, uninitialized 3D axis-aligned bounding box.
         * @method AABB3
         * @static
         * @returns {*} The bounding box.
         */
        AABB3: function () {
            return {
                min: new Float32Array(3),
                max: new Float32Array(3)
            }
        },

        /**
         * Returns a new, uninitialized 2D axis-aligned bounding box.
         * @method AABB2
         * @static
         * @returns {*} The bounding box.
         */
        AABB2: function () {
            return {
                min: new Float32Array(2),
                max: new Float32Array(2)
            }
        },

        /**
         * Returns a new UUID.
         * @method createUUID
         * @static
         * @return string The new UUID
         */
        createUUID: function () {
            // http://www.broofa.com/Tools/Math.uuid.htm
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = new Array(36);
            var rnd = 0, r;
            return function () {
                for (var i = 0; i < 36; i++) {
                    if (i === 8 || i === 13 || i === 18 || i === 23) {
                        uuid[i] = '-';
                    } else if (i === 14) {
                        uuid[i] = '4';
                    } else {
                        if (rnd <= 0x02) {
                            rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                        }
                        r = rnd & 0xf;
                        rnd = rnd >> 4;
                        uuid[i] = chars[( i === 19 ) ? ( r & 0x3 ) | 0x8 : r];
                    }
                }
                return uuid.join('');
            };
        }(),

        /**
         * Clamps a value to the given range.
         * @param {Number} value Value to clamp.
         * @param {Number} min Lower bound.
         * @param {Number} max Upper bound.
         * @returns {Number} Clamped result.
         */
        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));

        },

        /**
         * Floating-point modulus
         * @method fmod
         * @static
         * @param {Number} a
         * @param {Number} b
         * @returns {*}
         */
        fmod: function (a, b) {
            if (a < b) {
                console.error("XEO.math.fmod : Attempting to find modulus within negative range - would be infinite loop - ignoring");
                return a;
            }
            while (b <= a) {
                a -= b;
            }
            return a;
        },

        /**
         * Negates a four-element vector.
         * @method negateVec4
         * @static
         * @param {Array(Number)} v Vector to negate
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        negateVec4: function (v, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = -v[0];
            dest[1] = -v[1];
            dest[2] = -v[2];
            dest[3] = -v[3];
            return dest;
        },

        /**
         * Adds one four-element vector to another.
         * @method addVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        addVec4: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] + v[0];
            dest[1] = u[1] + v[1];
            dest[2] = u[2] + v[2];
            dest[3] = u[3] + v[3];
            return dest;
        },

        /**
         * Adds a scalar value to each element of a four-element vector.
         * @method addVec4Scalar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        addVec4Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] + s;
            dest[1] = v[1] + s;
            dest[2] = v[2] + s;
            dest[3] = v[3] + s;
            return dest;
        },

        /**
         * Adds one three-element vector to another.
         * @method addVec3
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        addVec3: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] + v[0];
            dest[1] = u[1] + v[1];
            dest[2] = u[2] + v[2];
            return dest;
        },

        /**
         * Adds a scalar value to each element of a three-element vector.
         * @method addVec4Scalar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        addVec3Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] + s;
            dest[1] = v[1] + s;
            dest[2] = v[2] + s;
            return dest;
        },

        /**
         * Subtracts one four-element vector from another.
         * @method subVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Vector to subtract
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        subVec4: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] - v[0];
            dest[1] = u[1] - v[1];
            dest[2] = u[2] - v[2];
            dest[3] = u[3] - v[3];
            return dest;
        },

        /**
         * Subtracts one three-element vector from another.
         * @method subVec3
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Vector to subtract
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        subVec3: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] - v[0];
            dest[1] = u[1] - v[1];
            dest[2] = u[2] - v[2];
            return dest;
        },

        /**
         * Subtracts one two-element vector from another.
         * @method subVec2
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Vector to subtract
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        subVec2: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] - v[0];
            dest[1] = u[1] - v[1];
            return dest;
        },

        /**
         * Subtracts a scalar value from each element of a four-element vector.
         * @method subVec4Scalar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        subVec4Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] - s;
            dest[1] = v[1] - s;
            dest[2] = v[2] - s;
            dest[3] = v[3] - s;
            return dest;
        },

        /**
         * Sets each element of a 4-element vector to a scalar value minus the value of that element.
         * @method subScalarVec4
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        subScalarVec4: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = s - v[0];
            dest[1] = s - v[1];
            dest[2] = s - v[2];
            dest[3] = s - v[3];
            return dest;
        },

        /**
         * Multiplies one three-element vector by another.
         * @method mulVec3
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        mulVec4: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] * v[0];
            dest[1] = u[1] * v[1];
            dest[2] = u[2] * v[2];
            dest[3] = u[3] * v[3];
            return dest;
        },

        /**
         * Multiplies each element of a four-element vector by a scalar.
         * @method mulVec34calar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        mulVec4Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] * s;
            dest[1] = v[1] * s;
            dest[2] = v[2] * s;
            dest[3] = v[3] * s;
            return dest;
        },

        /**
         * Multiplies each element of a three-element vector by a scalar.
         * @method mulVec3Scalar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        mulVec3Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] * s;
            dest[1] = v[1] * s;
            dest[2] = v[2] * s;
            return dest;
        },

        /**
         * Multiplies each element of a two-element vector by a scalar.
         * @method mulVec2Scalar
         * @static
         * @param {Array(Number)} v The vector
         * @param {Number} s The scalar
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, v otherwise
         */
        mulVec2Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] * s;
            dest[1] = v[1] * s;
            return dest;
        },

        /**
         * Divides one three-element vector by another.
         * @method divVec3
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        divVec3: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] / v[0];
            dest[1] = u[1] / v[1];
            dest[2] = u[2] / v[2];
            return dest;
        },

        /**
         * Divides one four-element vector by another.
         * @method divVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @param  {Array(Number)} [dest] Destination vector
         * @return {Array(Number)} dest if specified, u otherwise
         */
        divVec4: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            dest[0] = u[0] / v[0];
            dest[1] = u[1] / v[1];
            dest[2] = u[2] / v[2];
            dest[3] = u[3] / v[3];
            return dest;
        },

        /**
         * Divides a scalar by a three-element vector, returning a new vector.
         * @method divScalarVec3
         * @static
         * @param v vec3
         * @param s scalar
         * @param dest vec3 - optional destination
         * @return [] dest if specified, v otherwise
         */
        divScalarVec3: function (s, v, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = s / v[0];
            dest[1] = s / v[1];
            dest[2] = s / v[2];
            return dest;
        },

        /**
         * Divides a three-element vector by a scalar.
         * @method divVec3Scalar
         * @static
         * @param v vec3
         * @param s scalar
         * @param dest vec3 - optional destination
         * @return [] dest if specified, v otherwise
         */
        divVec3Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] / s;
            dest[1] = v[1] / s;
            dest[2] = v[2] / s;
            return dest;
        },

        /**
         * Divides a four-element vector by a scalar.
         * @method divVec4Scalar
         * @static
         * @param v vec4
         * @param s scalar
         * @param dest vec4 - optional destination
         * @return [] dest if specified, v otherwise
         */
        divVec4Scalar: function (v, s, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = v[0] / s;
            dest[1] = v[1] / s;
            dest[2] = v[2] / s;
            dest[3] = v[3] / s;
            return dest;
        },


        /**
         * Divides a scalar by a four-element vector, returning a new vector.
         * @method divScalarVec4
         * @static
         * @param s scalar
         * @param v vec4
         * @param dest vec4 - optional destination
         * @return [] dest if specified, v otherwise
         */
        divScalarVec4: function (s, v, dest) {
            if (!dest) {
                dest = v;
            }
            dest[0] = s / v[0];
            dest[1] = s / v[1];
            dest[2] = s / v[2];
            dest[3] = s / v[3];
            return dest;
        },

        /**
         * Returns the dot product of two four-element vectors.
         * @method dotVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @return The dot product
         */
        dotVec4: function (u, v) {
            return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
        },

        /**
         * Returns the cross product of two four-element vectors.
         * @method cross3Vec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @return The cross product
         */
        cross3Vec4: function (u, v) {
            var u0 = u[0], u1 = u[1], u2 = u[2];
            var v0 = v[0], v1 = v[1], v2 = v[2];
            return [
                u1 * v2 - u2 * v1,
                u2 * v0 - u0 * v2,
                u0 * v1 - u1 * v0,
                0.0];
        },

        /**
         * Returns the cross product of two three-element vectors.
         * @method cross3Vec3
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @return The cross product
         */
        cross3Vec3: function (u, v, dest) {
            if (!dest) {
                dest = u;
            }
            var x = u[0], y = u[1], z = u[2];
            var x2 = v[0], y2 = v[1], z2 = v[2];
            dest[0] = y * z2 - z * y2;
            dest[1] = z * x2 - x * z2;
            dest[2] = x * y2 - y * x2;
            return dest;
        },


        sqLenVec4: function (v) { // TODO
            return math.dotVec4(v, v);
        },

        /**
         * Returns the length of a four-element vector.
         * @method lenVec4
         * @static
         * @param {Array(Number)} v The vector
         * @return The length
         */
        lenVec4: function (v) {
            return Math.sqrt(math.sqLenVec4(v));
        },

        /**
         * Returns the dot product of two three-element vectors.
         * @method dotVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @return The dot product
         */
        dotVec3: function (u, v) {
            return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
        },

        /**
         * Returns the dot product of two two-element vectors.
         * @method dotVec4
         * @static
         * @param {Array(Number)} u First vector
         * @param {Array(Number)} v Second vector
         * @return The dot product
         */
        dotVec2: function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]);
        },


        sqLenVec3: function (v) {
            return math.dotVec3(v, v);
        },


        sqLenVec2: function (v) {
            return math.dotVec2(v, v);
        },

        /**
         * Returns the length of a three-element vector.
         * @method lenVec3
         * @static
         * @param {Array(Number)} v The vector
         * @return The length
         */
        lenVec3: function (v) {
            return Math.sqrt(math.sqLenVec3(v));
        },

        /**
         * Returns the length of a two-element vector.
         * @method lenVec2
         * @static
         * @param {Array(Number)} v The vector
         * @return The length
         */
        lenVec2: function (v) {
            return Math.sqrt(math.sqLenVec2(v));
        },

        /**
         * @method rcpVec3
         * @static
         * @param v vec3
         * @param dest vec3 - optional destination
         * @return [] dest if specified, v otherwise
         *
         */
        rcpVec3: function (v, dest) {
            return math.divScalarVec3(1.0, v, dest);
        },

        /**
         * Normalizes a four-element vector
         * @method normalizeVec4
         * @static
         * @param v vec4
         * @param dest vec4 - optional destination
         * @return [] dest if specified, v otherwise
         *
         */
        normalizeVec4: function (v, dest) {
            var f = 1.0 / math.lenVec4(v);
            return math.mulVec4Scalar(v, f, dest);
        },

        /**
         * Normalizes a three-element vector
         * @method normalizeVec4
         * @static
         */
        normalizeVec3: function (v, dest) {
            var f = 1.0 / math.lenVec3(v);
            return math.mulVec3Scalar(v, f, dest);
        },

        /**
         * Normalizes a two-element vector
         * @method normalizeVec2
         * @static
         */
        normalizeVec2: function (v, dest) {
            var f = 1.0 / math.lenVec2(v);
            return math.mulVec2Scalar(v, f, dest);
        },

        /**
         * Duplicates a 4x4 identity matrix.
         * @method dupMat4
         * @static
         */
        dupMat4: function (m) {
            return m.slice(0, 16);
        },

        /**
         * Extracts a 3x3 matrix from a 4x4 matrix.
         * @method mat4To3
         * @static
         */
        mat4To3: function (m) {
            return [
                m[0], m[1], m[2],
                m[4], m[5], m[6],
                m[8], m[9], m[10]
            ];
        },

        /**
         * Returns a 4x4 matrix with each element set to the given scalar value.
         * @method m4s
         * @static
         */
        m4s: function (s) {
            return [
                s, s, s, s,
                s, s, s, s,
                s, s, s, s,
                s, s, s, s
            ];
        },

        /**
         * Returns a 4x4 matrix with each element set to zero.
         * @method setMat4ToZeroes
         * @static
         */
        setMat4ToZeroes: function () {
            return math.m4s(0.0);
        },

        /**
         * Returns a 4x4 matrix with each element set to 1.0.
         * @method setMat4ToOnes
         * @static
         */
        setMat4ToOnes: function () {
            return math.m4s(1.0);
        },

        /**
         * Returns a 4x4 matrix with each element set to 1.0.
         * @method setMat4ToOnes
         * @static
         */
        diagonalMat4v: function (v) {
            return new Float32Array([
                v[0], 0.0, 0.0, 0.0,
                0.0, v[1], 0.0, 0.0,
                0.0, 0.0, v[2], 0.0,
                0.0, 0.0, 0.0, v[3]
            ]);
        },

        /**
         * Returns a 4x4 matrix with diagonal elements set to the given vector.
         * @method diagonalMat4c
         * @static
         */
        diagonalMat4c: function (x, y, z, w) {
            return math.diagonalMat4v([x, y, z, w]);
        },

        /**
         * Returns a 4x4 matrix with diagonal elements set to the given scalar.
         * @method diagonalMat4s
         * @static
         */
        diagonalMat4s: function (s) {
            return math.diagonalMat4c(s, s, s, s);
        },

        /**
         * Returns a 4x4 identity matrix.
         * @method identityMat4
         * @static
         */
        identityMat4: function (mat) {

            mat = mat || new Float32Array(16);

            mat[0] = 1.0;
            mat[1] = 0.0;
            mat[2] = 0.0;
            mat[3] = 0.0;

            mat[4] = 0.0;
            mat[5] = 1.0;
            mat[6] = 0.0;
            mat[7] = 0.0;

            mat[8] = 0.0;
            mat[9] = 0.0;
            mat[10] = 1.0;
            mat[11] = 0.0;

            mat[12] = 0.0;
            mat[13] = 0.0;
            mat[14] = 0.0;
            mat[15] = 1.0;

            return mat;
        },

        /**
         * Tests if the given 4x4 matrix is the identity matrix.
         * @method isIdentityMat4
         * @static
         */
        isIdentityMat4: function (m) {
            if (m[0] !== 1.0 || m[1] !== 0.0 || m[2] !== 0.0 || m[3] !== 0.0 ||
                m[4] !== 0.0 || m[5] !== 1.0 || m[6] !== 0.0 || m[7] !== 0.0 ||
                m[8] !== 0.0 || m[9] !== 0.0 || m[10] !== 1.0 || m[11] !== 0.0 ||
                m[12] !== 0.0 || m[13] !== 0.0 || m[14] !== 0.0 || m[15] !== 1.0) {
                return false;
            }
            return true;
        },

        /**
         * Negates the given 4x4 matrix.
         * @method negateMat4
         * @static
         */
        negateMat4: function (m, dest) {
            if (!dest) {
                dest = m;
            }
            dest[0] = -m[0];
            dest[1] = -m[1];
            dest[2] = -m[2];
            dest[3] = -m[3];
            dest[4] = -m[4];
            dest[5] = -m[5];
            dest[6] = -m[6];
            dest[7] = -m[7];
            dest[8] = -m[8];
            dest[9] = -m[9];
            dest[10] = -m[10];
            dest[11] = -m[11];
            dest[12] = -m[12];
            dest[13] = -m[13];
            dest[14] = -m[14];
            dest[15] = -m[15];
            return dest;
        },

        /**
         * Adds the given 4x4 matrices together.
         * @method addMat4
         * @static
         */
        addMat4: function (a, b, dest) {
            if (!dest) {
                dest = a;
            }
            dest[0] = a[0] + b[0];
            dest[1] = a[1] + b[1];
            dest[2] = a[2] + b[2];
            dest[3] = a[3] + b[3];
            dest[4] = a[4] + b[4];
            dest[5] = a[5] + b[5];
            dest[6] = a[6] + b[6];
            dest[7] = a[7] + b[7];
            dest[8] = a[8] + b[8];
            dest[9] = a[9] + b[9];
            dest[10] = a[10] + b[10];
            dest[11] = a[11] + b[11];
            dest[12] = a[12] + b[12];
            dest[13] = a[13] + b[13];
            dest[14] = a[14] + b[14];
            dest[15] = a[15] + b[15];
            return dest;
        },

        /**
         * Adds the given scalar to each element of the given 4x4 matrix.
         * @method addMat4Scalar
         * @static
         */
        addMat4Scalar: function (m, s, dest) {
            if (!dest) {
                dest = m;
            }
            dest[0] = m[0] + s;
            dest[1] = m[1] + s;
            dest[2] = m[2] + s;
            dest[3] = m[3] + s;
            dest[4] = m[4] + s;
            dest[5] = m[5] + s;
            dest[6] = m[6] + s;
            dest[7] = m[7] + s;
            dest[8] = m[8] + s;
            dest[9] = m[9] + s;
            dest[10] = m[10] + s;
            dest[11] = m[11] + s;
            dest[12] = m[12] + s;
            dest[13] = m[13] + s;
            dest[14] = m[14] + s;
            dest[15] = m[15] + s;
            return dest;
        },

        /**
         * Adds the given scalar to each element of the given 4x4 matrix.
         * @method addScalarMat4
         * @static
         */
        addScalarMat4: function (s, m, dest) {
            return math.addMat4Scalar(m, s, dest);
        },

        /**
         * Subtracts the second 4x4 matrix from the first.
         * @method subMat4
         * @static
         */
        subMat4: function (a, b, dest) {
            if (!dest) {
                dest = a;
            }
            dest[0] = a[0] - b[0];
            dest[1] = a[1] - b[1];
            dest[2] = a[2] - b[2];
            dest[3] = a[3] - b[3];
            dest[4] = a[4] - b[4];
            dest[5] = a[5] - b[5];
            dest[6] = a[6] - b[6];
            dest[7] = a[7] - b[7];
            dest[8] = a[8] - b[8];
            dest[9] = a[9] - b[9];
            dest[10] = a[10] - b[10];
            dest[11] = a[11] - b[11];
            dest[12] = a[12] - b[12];
            dest[13] = a[13] - b[13];
            dest[14] = a[14] - b[14];
            dest[15] = a[15] - b[15];
            return dest;
        },

        /**
         * Subtracts the given scalar from each element of the given 4x4 matrix.
         * @method subMat4Scalar
         * @static
         */
        subMat4Scalar: function (m, s, dest) {
            if (!dest) {
                dest = m;
            }
            dest[0] = m[0] - s;
            dest[1] = m[1] - s;
            dest[2] = m[2] - s;
            dest[3] = m[3] - s;
            dest[4] = m[4] - s;
            dest[5] = m[5] - s;
            dest[6] = m[6] - s;
            dest[7] = m[7] - s;
            dest[8] = m[8] - s;
            dest[9] = m[9] - s;
            dest[10] = m[10] - s;
            dest[11] = m[11] - s;
            dest[12] = m[12] - s;
            dest[13] = m[13] - s;
            dest[14] = m[14] - s;
            dest[15] = m[15] - s;
            return dest;
        },

        /**
         * Subtracts the given scalar from each element of the given 4x4 matrix.
         * @method subScalarMat4
         * @static
         */
        subScalarMat4: function (s, m, dest) {
            if (!dest) {
                dest = m;
            }
            dest[0] = s - m[0];
            dest[1] = s - m[1];
            dest[2] = s - m[2];
            dest[3] = s - m[3];
            dest[4] = s - m[4];
            dest[5] = s - m[5];
            dest[6] = s - m[6];
            dest[7] = s - m[7];
            dest[8] = s - m[8];
            dest[9] = s - m[9];
            dest[10] = s - m[10];
            dest[11] = s - m[11];
            dest[12] = s - m[12];
            dest[13] = s - m[13];
            dest[14] = s - m[14];
            dest[15] = s - m[15];
            return dest;
        },

        /**
         * Multiplies the two given 4x4 matrix by each other.
         * @method mulMat4
         * @static
         */
        mulMat4: function (a, b, dest) {
            if (!dest) {
                dest = a;
            }

            // Cache the matrix values (makes for huge speed increases!)
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

            var b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
            var b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
            var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
            var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

            dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
            dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
            dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
            dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
            dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
            dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
            dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
            dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
            dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
            dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
            dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
            dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
            dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
            dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
            dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
            dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

            return dest;
        },

        /**
         * Multiplies each element of the given 4x4 matrix by the given scalar.
         * @method mulMat4Scalar
         * @static
         */
        mulMat4Scalar: function (m, s, dest) {
            if (!dest) {
                dest = m;
            }
            dest[0] = m[0] * s;
            dest[1] = m[1] * s;
            dest[2] = m[2] * s;
            dest[3] = m[3] * s;
            dest[4] = m[4] * s;
            dest[5] = m[5] * s;
            dest[6] = m[6] * s;
            dest[7] = m[7] * s;
            dest[8] = m[8] * s;
            dest[9] = m[9] * s;
            dest[10] = m[10] * s;
            dest[11] = m[11] * s;
            dest[12] = m[12] * s;
            dest[13] = m[13] * s;
            dest[14] = m[14] * s;
            dest[15] = m[15] * s;
            return dest;
        },

        /**
         * Multiplies the given 4x4 matrix by the given four-element vector.
         * @method mulMat4v4
         * @static
         */
        mulMat4v4: function (m, v) {
            var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
            return [
                m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3,
                m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3,
                m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3,
                m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3
            ];
        },

        /**
         * Transposes the given 4x4 matrix.
         * @method transposeMat4
         * @static
         */
        transposeMat4: function (mat, dest) {
            // If we are transposing ourselves we can skip a few steps but have to cache some values
            var m4 = mat[4], m14 = mat[14], m8 = mat[8];
            var m13 = mat[13], m12 = mat[12], m9 = mat[9];
            if (!dest || mat === dest) {
                var a01 = mat[1], a02 = mat[2], a03 = mat[3];
                var a12 = mat[6], a13 = mat[7];
                var a23 = mat[11];
                mat[1] = m4;
                mat[2] = m8;
                mat[3] = m12;
                mat[4] = a01;
                mat[6] = m9;
                mat[7] = m13;
                mat[8] = a02;
                mat[9] = a12;
                mat[11] = m14;
                mat[12] = a03;
                mat[13] = a13;
                mat[14] = a23;
                return mat;
            }
            dest[0] = mat[0];
            dest[1] = m4;
            dest[2] = m8;
            dest[3] = m12;
            dest[4] = mat[1];
            dest[5] = mat[5];
            dest[6] = m9;
            dest[7] = m13;
            dest[8] = mat[2];
            dest[9] = mat[6];
            dest[10] = mat[10];
            dest[11] = m14;
            dest[12] = mat[3];
            dest[13] = mat[7];
            dest[14] = mat[11];
            dest[15] = mat[15];
            return dest;
        },

        /**
         * Returns the determinant of the given 4x4 matrix.
         * @method determinantMat4
         * @static
         */
        determinantMat4: function (mat) {
            // Cache the matrix values (makes for huge speed increases!)
            var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
            var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
            var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
            var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
            return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
                a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
                a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
                a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
                a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
                a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
        },

        /**
         * Returns the inverse of the given 4x4 matrix.
         * @method inverseMat4
         * @static
         */
        inverseMat4: function (mat, dest) {
            if (!dest) {
                dest = mat;
            }
            // Cache the matrix values (makes for huge speed increases!)
            var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
            var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
            var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
            var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
            var b00 = a00 * a11 - a01 * a10;
            var b01 = a00 * a12 - a02 * a10;
            var b02 = a00 * a13 - a03 * a10;
            var b03 = a01 * a12 - a02 * a11;
            var b04 = a01 * a13 - a03 * a11;
            var b05 = a02 * a13 - a03 * a12;
            var b06 = a20 * a31 - a21 * a30;
            var b07 = a20 * a32 - a22 * a30;
            var b08 = a20 * a33 - a23 * a30;
            var b09 = a21 * a32 - a22 * a31;
            var b10 = a21 * a33 - a23 * a31;
            var b11 = a22 * a33 - a23 * a32;

            // Calculate the determinant (inlined to avoid double-caching)
            var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

            dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
            dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
            dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
            dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
            dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
            dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
            dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
            dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
            dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
            dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
            dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
            dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
            dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
            dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
            dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
            dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

            return dest;
        },

        /**
         * Returns the trace of the given 4x4 matrix.
         * @method traceMat4
         * @static
         */
        traceMat4: function (m) {
            return (m[0] + m[5] + m[10] + m[15]);
        },

        /**
         * Returns 4x4 translation matrix.
         * @method translationMat4
         * @static
         */
        translationMat4v: function (v, dest) {
            var m = dest || math.identityMat4();
            m[12] = v[0];
            m[13] = v[1];
            m[14] = v[2];
            return m;
        },

        /**
         * Returns 4x4 translation matrix.
         * @method translationMat4c
         * @static
         */
        translationMat4c: function (x, y, z, dest) {
            return math.translationMat4v([x, y, z], dest);
        },

        /**
         * Returns 4x4 translation matrix.
         * @method translationMat4s
         * @static
         */
        translationMat4s: function (s, dest) {
            return math.translationMat4c(s, s, s, dest);
        },

        /**
         * Returns 4x4 rotation matrix.
         * @method rotationMat4v
         * @static
         */
        rotationMat4v: function (anglerad, axis, m) {
            var ax = math.normalizeVec4([axis[0], axis[1], axis[2], 0.0], []);
            var s = Math.sin(anglerad);
            var c = Math.cos(anglerad);
            var q = 1.0 - c;

            var x = ax[0];
            var y = ax[1];
            var z = ax[2];

            var xy, yz, zx, xs, ys, zs;

            //xx = x * x; used once
            //yy = y * y; used once
            //zz = z * z; used once
            xy = x * y;
            yz = y * z;
            zx = z * x;
            xs = x * s;
            ys = y * s;
            zs = z * s;

            m = m || math.mat4();

            m[0] = (q * x * x) + c;
            m[1] = (q * xy) + zs;
            m[2] = (q * zx) - ys;
            m[3] = 0.0;

            m[4] = (q * xy) - zs;
            m[5] = (q * y * y) + c;
            m[6] = (q * yz) + xs;
            m[7] = 0.0;

            m[8] = (q * zx) + ys;
            m[9] = (q * yz) - xs;
            m[10] = (q * z * z) + c;
            m[11] = 0.0;

            m[12] = 0.0;
            m[13] = 0.0;
            m[14] = 0.0;
            m[15] = 1.0;

            return m;
        },

        /**
         * Returns 4x4 rotation matrix.
         * @method rotationMat4c
         * @static
         */
        rotationMat4c: function (anglerad, x, y, z, mat) {
            return math.rotationMat4v(anglerad, [x, y, z], mat);
        },

        /**
         * Returns 4x4 scale matrix.
         * @method scalingMat4v
         * @static
         */
        scalingMat4v: function (v, m) {
            m = m || math.identityMat4();
            m[0] = v[0];
            m[5] = v[1];
            m[10] = v[2];
            return m;
        },

        /**
         * Returns 4x4 scale matrix.
         * @method scalingMat4c
         * @static
         */
        scalingMat4c: function (x, y, z) {
            return math.scalingMat4v([x, y, z]);
        },

        /**
         * Returns 4x4 scale matrix.
         * @method scalingMat4s
         * @static
         */
        scalingMat4s: function (s) {
            return math.scalingMat4c(s, s, s);
        },

        /**
         * Creates a matrix from a quaternion rotation and vector translation
         *
         * @param {Float32Array} q Rotation quaternion
         * @param {Float32Array} v Translation vector
         * @param {Float32Array} dest Destination matrix
         * @returns {Float32Array} dest
         */
        rotationTranslationMat4: function (q, v, dest) {

            dest = dest || math.mat4();

            var x = q[0];
            var y = q[1];
            var z = q[2];
            var w = q[3];

            var x2 = x + x;
            var y2 = y + y;
            var z2 = z + z;
            var xx = x * x2;
            var xy = x * y2;
            var xz = x * z2;
            var yy = y * y2;
            var yz = y * z2;
            var zz = z * z2;
            var wx = w * x2;
            var wy = w * y2;
            var wz = w * z2;

            dest[0] = 1 - (yy + zz);
            dest[1] = xy + wz;
            dest[2] = xz - wy;
            dest[3] = 0;
            dest[4] = xy - wz;
            dest[5] = 1 - (xx + zz);
            dest[6] = yz + wx;
            dest[7] = 0;
            dest[8] = xz + wy;
            dest[9] = yz - wx;
            dest[10] = 1 - (xx + yy);
            dest[11] = 0;
            dest[12] = v[0];
            dest[13] = v[1];
            dest[14] = v[2];
            dest[15] = 1;

            return dest;
        },

        /**
         * Gets Euler angles from a 4x4 matrix.
         *
         * @param {Float32Array} mat The 4x4 matrix.
         * @param {String} order Desired Euler angle order: "XYZ", "YXZ", "ZXY" etc.
         * @param {Float32Array} [dest] Destination Euler angles, created by default.
         * @returns {Float32Array} The Euler angles.
         */
        mat4ToEuler: function (mat, order, dest) {

            dest = dest || math.vec4();

            var clamp = math.clamp;

            // Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

            var m11 = mat[0], m12 = mat[4], m13 = mat[8];
            var m21 = mat[1], m22 = mat[5], m23 = mat[9];
            var m31 = mat[2], m32 = mat[6], m33 = mat[10];

            if (order === 'XYZ') {

                dest[1] = Math.asin(clamp(m13, -1, 1));

                if (Math.abs(m13) < 0.99999) {
                    dest[0] = Math.atan2(-m23, m33);
                    dest[2] = Math.atan2(-m12, m11);
                } else {
                    dest[0] = Math.atan2(m32, m22);
                    dest[2] = 0;

                }

            } else if (order === 'YXZ') {

                dest[0] = Math.asin(-clamp(m23, -1, 1));

                if (Math.abs(m23) < 0.99999) {
                    dest[1] = Math.atan2(m13, m33);
                    dest[2] = Math.atan2(m21, m22);
                } else {
                    dest[1] = Math.atan2(-m31, m11);
                    dest[2] = 0;
                }

            } else if (order === 'ZXY') {

                dest[0] = Math.asin(clamp(m32, -1, 1));

                if (Math.abs(m32) < 0.99999) {
                    dest[1] = Math.atan2(-m31, m33);
                    dest[2] = Math.atan2(-m12, m22);
                } else {
                    dest[1] = 0;
                    dest[2] = Math.atan2(m21, m11);
                }

            } else if (order === 'ZYX') {

                dest[1] = Math.asin(-clamp(m31, -1, 1));

                if (Math.abs(m31) < 0.99999) {
                    dest[0] = Math.atan2(m32, m33);
                    dest[2] = Math.atan2(m21, m11);
                } else {
                    dest[0] = 0;
                    dest[2] = Math.atan2(-m12, m22);
                }

            } else if (order === 'YZX') {

                dest[2] = Math.asin(clamp(m21, -1, 1));

                if (Math.abs(m21) < 0.99999) {
                    dest[0] = Math.atan2(-m23, m22);
                    dest[1] = Math.atan2(-m31, m11);
                } else {
                    dest[0] = 0;
                    dest[1] = Math.atan2(m13, m33);
                }

            } else if (order === 'XZY') {

                dest[2] = Math.asin(-clamp(m12, -1, 1));

                if (Math.abs(m12) < 0.99999) {
                    dest[0] = Math.atan2(m32, m22);
                    dest[1] = Math.atan2(m13, m11);
                } else {
                    dest[0] = Math.atan2(-m23, m33);
                    dest[1] = 0;
                }
            }

            return dest;
        },

        /**
         * Returns a 4x4 'lookat' viewing transform matrix.
         * @method lookAtMat4v
         * @param pos vec3 position of the viewer
         * @param target vec3 point the viewer is looking at
         * @param up vec3 pointing "up"
         * @param dest mat4 Optional, mat4 matrix will be written into
         *
         * @return {mat4} dest if specified, a new mat4 otherwise
         */
        lookAtMat4v: function (pos, target, up, dest) {
            if (!dest) {
                dest = math.mat4();
            }

            var posx = pos[0],
                posy = pos[1],
                posz = pos[2],
                upx = up[0],
                upy = up[1],
                upz = up[2],
                targetx = target[0],
                targety = target[1],
                targetz = target[2];

            if (posx === targetx && posy === targety && posz === targetz) {
                return math.identityMat4();
            }

            var z0, z1, z2, x0, x1, x2, y0, y1, y2, len;

            //vec3.direction(eye, center, z);
            z0 = posx - targetx;
            z1 = posy - targety;
            z2 = posz - targetz;

            // normalize (no check needed for 0 because of early return)
            len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;

            //vec3.normalize(vec3.cross(up, z, x));
            x0 = upy * z2 - upz * z1;
            x1 = upz * z0 - upx * z2;
            x2 = upx * z1 - upy * z0;
            len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
            if (!len) {
                x0 = 0;
                x1 = 0;
                x2 = 0;
            } else {
                len = 1 / len;
                x0 *= len;
                x1 *= len;
                x2 *= len;
            }

            //vec3.normalize(vec3.cross(z, x, y));
            y0 = z1 * x2 - z2 * x1;
            y1 = z2 * x0 - z0 * x2;
            y2 = z0 * x1 - z1 * x0;

            len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
            if (!len) {
                y0 = 0;
                y1 = 0;
                y2 = 0;
            } else {
                len = 1 / len;
                y0 *= len;
                y1 *= len;
                y2 *= len;
            }

            dest[0] = x0;
            dest[1] = y0;
            dest[2] = z0;
            dest[3] = 0;
            dest[4] = x1;
            dest[5] = y1;
            dest[6] = z1;
            dest[7] = 0;
            dest[8] = x2;
            dest[9] = y2;
            dest[10] = z2;
            dest[11] = 0;
            dest[12] = -(x0 * posx + x1 * posy + x2 * posz);
            dest[13] = -(y0 * posx + y1 * posy + y2 * posz);
            dest[14] = -(z0 * posx + z1 * posy + z2 * posz);
            dest[15] = 1;

            return dest;
        },

        /**
         * Returns a 4x4 'lookat' viewing transform matrix.
         * @method lookAtMat4c
         * @static
         */
        lookAtMat4c: function (posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
            return math.lookAtMat4v([posx, posy, posz], [targetx, targety, targetz], [upx, upy, upz], []);
        },

        /**
         * Returns a 4x4 orthographic projection matrix.
         * @method orthoMat4c
         * @static
         */
        orthoMat4c: function (left, right, bottom, top, near, far, dest) {
            if (!dest) {
                dest = math.mat4();
            }
            var rl = (right - left);
            var tb = (top - bottom);
            var fn = (far - near);

            dest[0] = 2.0 / rl;
            dest[1] = 0.0;
            dest[2] = 0.0;
            dest[3] = 0.0;

            dest[4] = 0.0;
            dest[5] = 2.0 / tb;
            dest[6] = 0.0;
            dest[7] = 0.0;

            dest[8] = 0.0;
            dest[9] = 0.0;
            dest[10] = -2.0 / fn;
            dest[11] = 0.0;

            dest[12] = -(left + right) / rl;
            dest[13] = -(top + bottom) / tb;
            dest[14] = -(far + near) / fn;
            dest[15] = 1.0;

            return dest;
        },

        /**
         * Returns a 4x4 perspective projection matrix.
         * @method frustumMat4v
         * @static
         */
        frustumMat4v: function (fmin, fmax, m) {

            if (!m) {
                m = math.mat4();
            }

            var fmin4 = [fmin[0], fmin[1], fmin[2], 0.0];
            var fmax4 = [fmax[0], fmax[1], fmax[2], 0.0];

            math.addVec4(fmax4, fmin4, tempMat1);
            math.subVec4(fmax4, fmin4, tempMat2);

            var t = 2.0 * fmin4[2];

            var tempMat20 = tempMat2[0], tempMat21 = tempMat2[1], tempMat22 = tempMat2[2];

            m[0] = t / tempMat20;
            m[1] = 0.0;
            m[2] = 0.0;
            m[3] = 0.0;

            m[4] = 0.0;
            m[5] = t / tempMat21;
            m[6] = 0.0;
            m[7] = 0.0;

            m[8] = tempMat1[0] / tempMat20;
            m[9] = tempMat1[1] / tempMat21;
            m[10] = -tempMat1[2] / tempMat22;
            m[11] = -1.0;

            m[12] = 0.0;
            m[13] = 0.0;
            m[14] = -t * fmax4[2] / tempMat22;
            m[15] = 0.0;

            return m;
        },

        /**
         * Returns a 4x4 perspective projection matrix.
         * @method frustumMat4v
         * @static
         */
        frustumMat4: function (left, right, bottom, top, near, far, dest) {
            if (!dest) {
                dest = math.mat4();
            }
            var rl = (right - left);
            var tb = (top - bottom);
            var fn = (far - near);
            dest[0] = (near * 2) / rl;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            dest[4] = 0;
            dest[5] = (near * 2) / tb;
            dest[6] = 0;
            dest[7] = 0;
            dest[8] = (right + left) / rl;
            dest[9] = (top + bottom) / tb;
            dest[10] = -(far + near) / fn;
            dest[11] = -1;
            dest[12] = 0;
            dest[13] = 0;
            dest[14] = -(far * near * 2) / fn;
            dest[15] = 0;
            return dest;
        },

        /**
         * Returns a 4x4 perspective projection matrix.
         * @method perspectiveMat4v
         * @static
         */
        perspectiveMat4: function (fovyrad, aspectratio, znear, zfar, m) {
            var pmin = [];
            var pmax = [];

            pmin[2] = znear;
            pmax[2] = zfar;

            pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
            pmin[1] = -pmax[1];

            pmax[0] = pmax[1] * aspectratio;
            pmin[0] = -pmax[0];

            return math.frustumMat4v(pmin, pmax, m);
        },

        /**
         * Transforms a three-element position by a 4x4 matrix.
         * @method transformPoint3
         * @static
         */
        transformPoint3: function (m, p, dest) {

            dest = dest || math.vec3();

            dest[0] = (m[0] * p[0]) + (m[4] * p[1]) + (m[8] * p[2]) + m[12];
            dest[1] = (m[1] * p[0]) + (m[5] * p[1]) + (m[9] * p[2]) + m[13];
            dest[2] = (m[2] * p[0]) + (m[6] * p[1]) + (m[10] * p[2]) + m[14];

            return dest;
        },

        /**
         * Transforms a homogeneous coordinate by a 4x4 matrix.
         * @method transformPoint3
         * @static
         */
        transformPoint4: function (m, v, dest) {

            dest = dest || math.vec4();

            dest[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3];
            dest[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3];
            dest[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3];
            dest[3] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3];

            return dest;
        },


        /**
         * Transforms an array of three-element positions by a 4x4 matrix.
         * @method transformPoints3
         * @static
         */
        transformPoints3: function (m, points, points2) {
            var result = points2 || [];
            var len = points.length;
            var p0, p1, p2;
            var pi;

            // cache values
            var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
            var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
            var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
            var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];

            var r;

            for (var i = 0; i < len; ++i) {

                // cache values
                pi = points[i];

                p0 = pi[0];
                p1 = pi[1];
                p2 = pi[2];

                r = result[i] || (result[i] = [0, 0, 0]);

                r[0] = (m0 * p0) + (m4 * p1) + (m8 * p2) + m12;
                r[1] = (m1 * p0) + (m5 * p1) + (m9 * p2) + m13;
                r[2] = (m2 * p0) + (m6 * p1) + (m10 * p2) + m14;
                r[3] = (m3 * p0) + (m7 * p1) + (m11 * p2) + m15;
            }

            result.length = len;

            return result;
        },

        /**
         * Transforms a three-element vector by a 4x4 matrix.
         * @method transformVec3
         * @static
         */
        transformVec3: function (m, v, dest) {
            var v0 = v[0], v1 = v[1], v2 = v[2];
            dest = dest || this.vec3();
            dest[0] = (m[0] * v0) + (m[4] * v1) + (m[8] * v2);
            dest[1] = (m[1] * v0) + (m[5] * v1) + (m[9] * v2);
            dest[2] = (m[2] * v0) + (m[6] * v1) + (m[10] * v2);
            return dest;
        },

        /**
         * Transforms a four-element vector by a 4x4 matrix.
         * @method transformVec4
         * @static
         */
        transformVec4: function (m, v, dest) {
            var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
            dest = dest || this.vec4();
            dest[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3;
            dest[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3;
            dest[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3;
            dest[3] = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3;
            return dest;
        },

        /**
         * Rotate a 3D vector around the x-axis
         *
         * @method rotateVec3X
         * @param {Float32Array} a The vec3 point to rotate
         * @param {Float32Array} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @param {Float32Array} dest The receiving vec3
         * @returns {Float32Array} dest
         * @static
         */
        rotateVec3X: function (a, b, c, dest) {

            var p = [], r = [];

            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[0];
            r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
            r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

            //translate to correct position
            dest[0] = r[0] + b[0];
            dest[1] = r[1] + b[1];
            dest[2] = r[2] + b[2];

            return dest;
        },

        /**
         * Rotate a 3D vector around the y-axis
         *
         * @method rotateVec3Y
         * @param {Float32Array} a The vec3 point to rotate
         * @param {Float32Array} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @param {Float32Array} dest The receiving vec3
         * @returns {Float32Array} dest
         * @static
         */
        rotateVec3Y: function (a, b, c, dest) {

            var p = [], r = [];

            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
            r[1] = p[1];
            r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

            //translate to correct position
            dest[0] = r[0] + b[0];
            dest[1] = r[1] + b[1];
            dest[2] = r[2] + b[2];

            return dest;
        },

        /**
         * Rotate a 3D vector around the z-axis
         *
         * @method rotateVec3Z
         * @param {Float32Array} a The vec3 point to rotate
         * @param {Float32Array} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @param {Float32Array} dest The receiving vec3
         * @returns {Float32Array} dest
         * @static
         */
        rotateVec3Z: function (a, b, c, dest) {

            var p = [], r = [];

            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
            r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
            r[2] = p[2];

            //translate to correct position
            dest[0] = r[0] + b[0];
            dest[1] = r[1] + b[1];
            dest[2] = r[2] + b[2];

            return dest;
        },

        /**
         * Transforms a four-element vector by a 4x4 projection matrix.
         *
         * @method projectVec4
         * @param {Float32Array} p 3D View-space coordinate
         * @param {Float32Array} q 2D Projected coordinate
         * @returns {Float32Array} 2D Projected coordinate
         * @static
         */
        projectVec4: function (p, q) {
            var f = 1.0 / p[3];
            q = q || math.vec2();
            q[0] = v[0] * f;
            q[1] = v[1] * f;
            return q;
        },

        /**
         * Linearly interpolates between two 3D vectors.
         * @method lerpVec3
         * @static
         */
        lerpVec3: function (t, t1, t2, p1, p2, dest) {
            var result = dest || this.vec3();
            var f = (t - t1) / (t2 - t1);
            result[0] = p1[0] + (f * (p2[0] - p1[0]));
            result[1] = p1[1] + (f * (p2[1] - p1[1]));
            result[2] = p1[2] + (f * (p2[2] - p1[2]));
            return result;
        },

        /**
         * Gets the diagonal size of a boundary given as minima and maxima.
         * @method getAABBDiag
         * @static
         */
        getAABBDiag: function (aabb) {
            this.subVec3(aabb.max, aabb.min, tempVec3c);
            return Math.abs(this.lenVec3(tempVec3c));
        },

        /**
         * Get a diagonal boundary size that is symmetrical about the given point.
         *
         * @method getAABBDiagPoint
         * @static
         */
        getAABBDiagPoint: function (aabb, p) {

            var diagVec = this.subVec3(aabb.max, aabb.min, tempVec3c);

            var xneg = p[0] - aabb.min[0];
            var xpos = aabb.max[0] - p[0];
            var yneg = p[1] - aabb.min[1];
            var ypos = aabb.max[1] - p[1];
            var zneg = p[2] - aabb.min[2];
            var zpos = aabb.max[2] - p[2];

            diagVec[0] += (xneg > xpos) ? xneg : xpos;
            diagVec[1] += (yneg > ypos) ? yneg : ypos;
            diagVec[2] += (zneg > zpos) ? zneg : zpos;

            return Math.abs(this.lenVec3(diagVec));
        },

        /**
         * Gets the center of an AABB.
         * @method getAABBCenter
         * @static
         */
        getAABBCenter: function (aabb, dest) {
            var r = dest || this.vec3();

            r[0] = (aabb.max[0] + aabb.min[0] ) * 0.5;
            r[1] = (aabb.max[1] + aabb.min[1] ) * 0.5;
            r[2] = (aabb.max[2] + aabb.min[2] ) * 0.5;

            return r;
        },

        /**
         * Gets the center of a 2D AABB.
         * @method getAABB2Center
         * @static
         */
        getAABB2Center: function (aabb, dest) {
            var r = dest || this.vec2();

            r[0] = (aabb.max[0] + aabb.min[0] ) / 2;
            r[1] = (aabb.max[1] + aabb.min[1] ) / 2;

            return r;
        },

        /**
         * Collapses a 3D axis-aligned boundary, ready to expand to fit 3D points.
         * Creates new AABB if none supplied.
         *
         * @method collapseAABB3
         * @static
         * @param {*} [aabb] 3D axis-aligned bounding box.
         * @returns {*} 3D axis-aligned bounding box.
         */
        collapseAABB3: function (aabb) {

            aabb = aabb || math.AABB2();

            aabb.min[0] = 10000000;
            aabb.min[1] = 10000000;
            aabb.min[2] = 10000000;
            aabb.max[0] = -10000000;
            aabb.max[1] = -10000000;
            aabb.max[2] = -10000000;

            return aabb;
        },

        /**
         * Converts an axis-aligned 3D boundary into an oriented boundary consisting of
         * an array of eight 3D positions, one for each corner of the boundary.
         *
         * @method AABB3ToOBB3
         * @static
         * @param {*} aabb Axis-aligned boundary.
         * @param {Array} [obb] Oriented bounding box.
         * @returns {*} Oriented bounding box.
         */
        AABB3ToOBB3: function (aabb, obb) {

            obb = obb || [];

            if (!obb[0]) {
                obb[0] = [];
            }

            obb[0][0] = aabb.min[0];
            obb[0][1] = aabb.min[1];
            obb[0][2] = aabb.min[2];
            obb[0][3] = 1;

            if (!obb[1]) {
                obb[1] = [];
            }

            obb[1][0] = aabb.max[0];
            obb[1][1] = aabb.min[1];
            obb[1][2] = aabb.min[2];
            obb[1][3] = 1;

            if (!obb[2]) {
                obb[2] = [];
            }

            obb[2][0] = aabb.max[0];
            obb[2][1] = aabb.max[1];
            obb[2][2] = aabb.min[2];
            obb[2][3] = 1;

            if (!obb[3]) {
                obb[3] = [];
            }

            obb[3][0] = aabb.min[0];
            obb[3][1] = aabb.max[1];
            obb[3][2] = aabb.min[2];
            obb[3][3] = 1;

            if (!obb[4]) {
                obb[4] = [];
            }

            obb[4][0] = aabb.min[0];
            obb[4][1] = aabb.min[1];
            obb[4][2] = aabb.max[2];
            obb[4][3] = 1;

            if (!obb[5]) {
                obb[5] = [];
            }

            obb[5][0] = aabb.max[0];
            obb[5][1] = aabb.min[1];
            obb[5][2] = aabb.max[2];
            obb[5][3] = 1;

            if (!obb[6]) {
                obb[6] = [];
            }

            obb[6][0] = aabb.max[0];
            obb[6][1] = aabb.max[1];
            obb[6][2] = aabb.max[2];
            obb[6][3] = 1;

            if (!obb[7]) {
                obb[7] = [];
            }

            obb[7][0] = aabb.min[0];
            obb[7][1] = aabb.max[1];
            obb[7][2] = aabb.max[2];
            obb[7][3] = 1;

            return obb;
        },

        /**
         * Finds the minimum axis-aligned 3D boundary enclosing the 3D points given in a flattened,  1-dimensional array.
         *
         * @method positions3ToAABB3
         * @static
         * @param {Array} positions Flattened 3D positions array
         * @param {*} [aabb] Axis-aligned bounding box.
         * @returns {*} Axis-aligned bounding box.
         */
        positions3ToAABB3: function (positions, aabb) {

            aabb = aabb || math.AABB3();

            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;

            var x, y, z;

            for (var i = 0, len = positions.length - 2; i < len; i += 3) {

                x = positions[i + 0];
                y = positions[i + 1];
                z = positions[i + 2];

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

            aabb.min[0] = xmin;
            aabb.min[1] = ymin;
            aabb.min[2] = zmin;
            aabb.max[0] = xmax;
            aabb.max[1] = ymax;
            aabb.max[2] = zmax;

            return aabb;
        },

        /**
         * Finds the minimum axis-aligned 3D boundary enclosing the given 3D points.
         *
         * @method points3ToAABB3
         * @static
         * @param {Array} points Oriented bounding box.
         * @param {*} [aabb] Axis-aligned bounding box.
         * @returns {*} Axis-aligned bounding box.
         */
        points3ToAABB3: function (points, aabb) {

            aabb = aabb || math.AABB3();

            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;

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

            aabb.min[0] = xmin;
            aabb.min[1] = ymin;
            aabb.min[2] = zmin;
            aabb.max[0] = xmax;
            aabb.max[1] = ymax;
            aabb.max[2] = zmax;

            return aabb;
        },

        /**
         * Expands the first axis-aligned 3D boundary to enclose the second, if required.
         *
         * @method expandAABB3
         * @static
         * @param {*} aabb1 First AABB
         * @param {*} aabb2 Second AABB
         * @returns {*} The second AABB
         */
        expandAABB3: function (aabb1, aabb2) {

            if (aabb1.min[0] > aabb2.min[0]) {
                aabb1.min[0] = aabb2.min[0];
            }

            if (aabb1.min[1] > aabb2.min[1]) {
                aabb1.min[1] = aabb2.min[1];
            }

            if (aabb1.min[2] > aabb2.min[2]) {
                aabb1.min[2] = aabb2.min[2];
            }

            if (aabb1.max[0] < aabb2.max[0]) {
                aabb1.max[0] = aabb2.max[0];
            }

            if (aabb1.max[1] < aabb2.max[1]) {
                aabb1.max[1] = aabb2.max[1];
            }

            if (aabb1.max[2] < aabb2.max[2]) {
                aabb1.max[2] = aabb2.max[2];
            }

            return aabb2;
        },

        /**
         * Expands an axis-aligned 3D boundary to enclose the given point, if needed.
         *
         * @method expandAABB3Point3
         * @static
         * @param {*} aabb AABB
         * @param {*} p Point
         * @returns {*} The AABB
         */
        expandAABB3Point3: function (aabb, p) {

            if (aabb.min[0] < p[0]) {
                aabb.min[0] = p[0];
            }

            if (aabb.min[1] < p[1]) {
                aabb.min[1] = p[1];
            }

            if (aabb.min[2] < p[2]) {
                aabb.min[2] = p[2];
            }

            if (aabb.max[0] > p[0]) {
                aabb.max[0] = p[0];
            }

            if (aabb.max[1] > p[1]) {
                aabb.max[1] = p[1];
            }

            if (aabb.max[2] > p[2]) {
                aabb.max[2] = p[2];
            }

            return aabb;
        },

        /**
         * Collapses a 2D axis-aligned boundary, ready to expand to fit 2D points.
         * Creates new AABB if none supplied.
         *
         * @method collapseAABB2
         * @static
         * @param {*} [aabb] 2D axis-aligned bounding box.
         * @returns {*} 2D axis-aligned bounding box.
         */
        collapseAABB2: function (aabb) {

            aabb = aabb || math.AABB2();

            aabb.min[0] = 10000000;
            aabb.min[1] = 10000000;
            aabb.max[0] = -10000000;
            aabb.max[1] = -10000000;

            return aabb;
        },

        /**
         * Finds the minimum 2D projected axis-aligned boundary enclosing the given 3D points.
         *
         * @method points3ToAABB2
         * @static
         * @param {Array} points 3D Points.
         * @param {*} [aabb] 2D axis-aligned bounding box.
         * @returns {*} 2D axis-aligned bounding box.
         */
        points3ToAABB2: function (points, aabb) {

            aabb = aabb || math.AABB2();

            var xmin = 10000000;
            var ymin = 10000000;
            var xmax = -10000000;
            var ymax = -10000000;

            var x;
            var y;
            var w;
            var f;

            for (var i = 0, len = points.length; i < len; i++) {

                x = points[i][0];
                y = points[i][1];
                w = points[i][3] || 1.0;

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

            aabb.min[0] = xmin;
            aabb.min[1] = ymin;
            aabb.max[0] = xmax;
            aabb.max[1] = ymax;

            return aabb;
        },

        /**
         * Expands the first axis-aligned 2D boundary to enclose the second, if required.
         *
         * @method expandAABB3
         * @static
         * @param {*} aabb1 First AABB
         * @param {*} aabb2 Second AABB
         * @returns {*} The second AABB
         */
        expandAABB2: function (aabb1, aabb2) {

            if (aabb1.min[0] > aabb2.min[0]) {
                aabb1.min[0] = aabb2.min[0];
            }

            if (aabb1.min[1] > aabb2.min[1]) {
                aabb1.min[1] = aabb2.min[1];
            }

            if (aabb1.max[0] < aabb2.max[0]) {
                aabb1.max[0] = aabb2.max[0];
            }

            if (aabb1.max[1] < aabb2.max[1]) {
                aabb1.max[1] = aabb2.max[1];
            }

            return aabb2;
        },

        /**
         * Expands an axis-aligned 2D boundary to enclose the given point, if required.
         *
         * @method expandAABB2Point2
         * @static
         * @param {*} aabb AABB
         * @param {*} p Point
         * @returns {*} The AABB
         */
        expandAABB2Point2: function (aabb, p) {

            if (aabb.min[0] > p[0]) {
                aabb.min[0] = p[0];
            }

            if (aabb.min[1] > p[1]) {
                aabb.min[1] = p[1];
            }

            if (aabb.max[0] < p[0]) {
                aabb.max[0] = p[0];
            }

            if (aabb.max[1] < p[1]) {
                aabb.max[1] = p[1];
            }

            return aabb;
        },

        AABB2ToCanvas: function (aabb, canvasWidth, canvasHeight, aabb2) {

            aabb2 = aabb2 || aabb;

            var xmin = (aabb.min[0] + 1.0) * 0.5;
            var ymin = (aabb.min[1] + 1.0) * 0.5;
            var xmax = (aabb.max[0] + 1.0) * 0.5;
            var ymax = (aabb.max[1] + 1.0) * 0.5;

            aabb2.min[0] = Math.floor(xmin * canvasWidth);
            aabb2.min[1] = canvasHeight - Math.floor(ymax * canvasHeight);
            aabb2.max[0] = Math.floor(xmax * canvasWidth);
            aabb2.max[1] = canvasHeight - Math.floor(ymin * canvasHeight);

            return aabb;
        },

        /**
         * Calculates the normal vector of a triangle
         *
         * @method triangleNormal
         * @param a
         * @param b
         * @param c
         * @param normal
         * @returns {*}
         */
        triangleNormal: function (a, b, c, normal) {

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
        },

        /**
         * Builds normal vectors from positions and indices.
         *
         * @method buildNormals
         * @static
         * @param {Float32Array} positions One-dimensional flattened array of positions.
         * @param {Float32Array} indices One-dimensional flattened array of indices.*
         * @returns {Float32Array} One-dimensional flattened array of normal vectors.
         */
        buildNormals: function (positions, indices) {

            var i;
            var len;
            var nvecs = new Array(positions.length / 3);
            var j0;
            var j1;
            var j2;
            var v1;
            var v2;
            var v3;

            for (i = 0, len = indices.length; i < len; i += 3) {
                j0 = indices[i + 0];
                j1 = indices[i + 1];
                j2 = indices[i + 2];

                v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
                v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
                v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

                v2 = math.subVec3(v2, v1, [0, 0, 0]);
                v3 = math.subVec3(v3, v1, [0, 0, 0]);

                var n = math.normalizeVec3(math.cross3Vec3(v2, v3, [0, 0, 0]), [0, 0, 0]);

                if (!nvecs[j0]) {
                    nvecs[j0] = [];
                }
                if (!nvecs[j1]) {
                    nvecs[j1] = [];
                }
                if (!nvecs[j2]) {
                    nvecs[j2] = [];
                }

                nvecs[j0].push(n);
                nvecs[j1].push(n);
                nvecs[j2].push(n);
            }

            var normals = new Float32Array(positions.length);

            // now go through and average out everything
            for (i = 0, len = nvecs.length; i < len; i++) {
                var count = nvecs[i].length;
                var x = 0;
                var y = 0;
                var z = 0;
                for (var j = 0; j < count; j++) {
                    x += nvecs[i][j][0];
                    y += nvecs[i][j][1];
                    z += nvecs[i][j][2];
                }
                normals[i * 3 + 0] = (x / count);
                normals[i * 3 + 1] = (y / count);
                normals[i * 3 + 2] = (z / count);
            }

            return normals;
        },


        /**
         * Builds vertex tangent vectors from positions, UVs and indices
         *
         * @method buildTangents
         * @static
         * @param {Float32Array} positions One-dimensional flattened array of positions.
         * @param {Float32Array} indices One-dimensional flattened array of indices.
         * @param {Float32Array} uv One-dimensional flattened array of UV coordinates.
         * @returns {Float32Array} One-dimensional flattened array of tangents.
         */
        buildTangents: function (positions, indices, uv) {

            var math = XEO.math;

            var tangents = new Float32Array(positions.length);

            // The vertex arrays needs to be calculated
            // before the calculation of the tangents

            for (var location = 0; location < indices.length; location += 3) {

                // Recontructing each vertex and UV coordinate into the respective vectors

                var index = indices[location];

                var v0 = positions.subarray(index * 3, index * 3 + 3);
                var uv0 = uv.subarray(index * 2, index * 2 + 2);

                index = indices[location + 1];

                var v1 = positions.subarray(index * 3, index * 3 + 3);
                var uv1 = uv.subarray(index * 2, index * 2 + 2);

                index = indices[location + 2];

                var v2 = positions.subarray(index * 3, index * 3 + 3);
                var uv2 = uv.subarray(index * 2, index * 2 + 2);

                var deltaPos1 = math.subVec3(v1, v0, tempVec3);
                var deltaPos2 = math.subVec3(v2, v0, tempVec3b);

                var deltaUV1 = math.subVec2(uv1, uv0, tempVec3c);
                var deltaUV2 = math.subVec2(uv2, uv0, tempVec3d);

                var r = 1 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

                var tangent = math.mulVec3Scalar(
                    math.subVec3(
                        math.mulVec3Scalar(deltaPos1, deltaUV2[1], tempVec3e),
                        math.mulVec3Scalar(deltaPos2, deltaUV1[1], tempVec3f),
                        tempVec3g
                    ),
                    r,
                    tempVec3f
                );

                // Average the value of the vectors outs
                for (var v = 0; v < 3; v++) {
                    var addTo = indices[location + v] * 3;

                    tangents[addTo] += tangent[0];
                    tangents[addTo + 1] += tangent[1];
                    tangents[addTo + 2] += tangent[2];
                }
            }

            return tangents;
        },

        /**
         * Flattens a two-dimensional array into a one-dimensional array.
         *
         * @method flatten
         * @static
         * @param {Array of Arrays} a A 2D array
         * @returns Flattened 1D array
         */
        flatten: function (a) {

            var result = [];

            var i;
            var leni;
            var j;
            var lenj;
            var item;

            for (i = 0, leni = a.length; i < leni; i++) {
                item = a[i];
                for (j = 0, lenj = item.length; j < lenj; j++) {
                    result.push(item[j]);
                }
            }

            return result;
        },

        /**
         * Builds vertex and index arrays needed by color-indexed triangle picking.
         *
         * @method getPickPrimitives
         * @static
         * @param {Float32Array} positions One-dimensional flattened array of positions.
         * @param {Float32Array} indices One-dimensional flattened array of indices.
         * @returns {*} Object containing the arrays, created by this method or reused from 'pickTris' parameter.
         */
        getPickPrimitives: function (positions, indices) {

            var numIndices = indices.length;

            var pickPositions = new Float32Array(numIndices * 30); // FIXME: Why do we need to extend size like this to make large meshes pickable?
            var pickColors = new Float32Array(numIndices * 40);

            var primIndex = 0;

            // Positions array index
            var vi;

            // Picking positions array index
            var pvi;

            // Picking color array index
            var pci;

            // Triangle indices

            var i;
            var r;
            var g;
            var b;
            var a;

            for (var location = 0; location < numIndices; location += 3) {

                pvi = location * 3;
                pci = location * 4;

                // Primitive-indexed triangle pick color

                a = (primIndex >> 24 & 0xFF) / 255.0;
                b = (primIndex >> 16 & 0xFF) / 255.0;
                g = (primIndex >> 8 & 0xFF) / 255.0;
                r = (primIndex & 0xFF) / 255.0;

                // A

                i = indices[location];
                vi = i * 3;

                pickPositions[pvi] = positions[vi];
                pickPositions[pvi + 1] = positions[vi + 1];
                pickPositions[pvi + 2] = positions[vi + 2];

                pickColors[pci] = r;
                pickColors[pci + 1] = g;
                pickColors[pci + 2] = b;
                pickColors[pci + 3] = a;


                // B

                i = indices[location + 1];
                vi = i * 3;

                pickPositions[pvi + 3] = positions[vi];
                pickPositions[pvi + 4] = positions[vi + 1];
                pickPositions[pvi + 5] = positions[vi + 2];

                pickColors[pci + 4] = r;
                pickColors[pci + 5] = g;
                pickColors[pci + 6] = b;
                pickColors[pci + 7] = a;


                // C

                i = indices[location + 2];
                vi = i * 3;

                pickPositions[pvi + 6] = positions[vi];
                pickPositions[pvi + 7] = positions[vi + 1];
                pickPositions[pvi + 8] = positions[vi + 2];

                pickColors[pci + 8] = r;
                pickColors[pci + 9] = g;
                pickColors[pci + 10] = b;
                pickColors[pci + 11] = a;

                primIndex++;
            }

            return {
                positions: pickPositions,
                colors: pickColors
            };
        },

        /**
         * Finds the intersection of a 3D ray with a 3D triangle.
         *
         * @method rayTriangleIntersect
         * @static
         * @param {Float32Array} origin Ray origin.
         * @param {Float32Array} dir Ray direction.
         * @param {Float32Array} a First triangle vertex.
         * @param {Float32Array} b Second triangle vertex.
         * @param {Float32Array} c Third triangle vertex.
         * @param {Float32Array} [isect] Intersection point.
         * @returns {Float32Array} The intersection point, or null if no intersection found.
         */
        rayTriangleIntersect: function (origin, dir, a, b, c, isect) {

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
        },

        /**
         * Finds the intersection of a 3D ray with a plane defined by 3 points.
         *
         * @method rayPlaneIntersect
         * @static
         * @param {Float32Array} origin Ray origin.
         * @param {Float32Array} dir Ray direction.
         * @param {Float32Array} a First point on plane.
         * @param {Float32Array} b Second point on plane.
         * @param {Float32Array} c Third point on plane.
         * @param {Float32Array} [isect] Intersection point.
         * @returns {Float32Array} The intersection point.
         */
        rayPlaneIntersect: function (origin, dir, a, b, c, isect) {

            var math = XEO.math;

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
        },

        /**
         * Gets barycentric coordinates from cartesian coordinates within a triangle.
         *
         * @method cartesianToBaryCentric
         * @static
         * @param {Float32Array} cartesian Cartesian coordinates.
         * @param {Float32Array} a First triangle vertex.
         * @param {Float32Array} b Second triangle vertex.
         * @param {Float32Array} c Third triangle vertex.
         * @param {Float32Array} [bary] The barycentric coordinates.
         * @returns {Float32Array} The barycentric coordinates, or null if the triangle was invalid.
         * @returns {*}
         */
        cartesianToBarycentric: function (cartesian, a, b, c, bary) {

            var f1 = math.subVec3(a, cartesian, tempVec3);
            var f2 = math.subVec3(b, cartesian, tempVec3b);
            var f3 = math.subVec3(c, cartesian, tempVec3c);

            var t1 = math.subVec3(a, b, tempVec3d);
            var t2 = math.subVec3(a, c, tempVec3e);

            var a0 = math.lenVec3(math.cross3Vec3(t1, t2, tempVec3f));

            bary[0] = math.lenVec3(math.cross3Vec3(f2, f3, tempVec3f)) / a0;
            bary[1] = math.lenVec3(math.cross3Vec3(f3, f1, tempVec3f)) / a0;
            bary[2] = math.lenVec3(math.cross3Vec3(f1, f2, tempVec3f)) / a0;

            return bary;
        },

        cartesianToBarycentric2: function (cartesian, a, b, c, dest) {
            var math = XEO.math;

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
        },

        /**
         * Returns true if the given barycentric coordinates are within their triangle.
         *
         * @method barycentricInsideTriangle
         * @static
         * @param {Float32Array} bary Barycentric coordinates.
         * @returns {Boolean} True if the barycentric coordinates are inside their triangle.
         * @returns {*}
         */
        barycentricInsideTriangle: function (bary) {

            var v = bary[1];
            var u = bary[2];

            return (u >= 0) && (v >= 0) && (u + v < 1);
        },

        /**
         * Gets cartesian coordinates from barycentric coordinates within a triangle.
         *
         * @method barycentricToCartesian
         * @static
         * @param {Float32Array} bary The barycentric coordinate.
         * @param {Float32Array} a First triangle vertex.
         * @param {Float32Array} b Second triangle vertex.
         * @param {Float32Array} c Third triangle vertex.
         * @param {Float32Array} [cartesian] Cartesian coordinates.
         * @returns {Float32Array} The cartesian coordinates, or null if the triangle was invalid.
         * @returns {*}
         */
        barycentricToCartesian2: function (bary, a, b, c, cartesian) {

            cartesian = cartesian || math.vec3();

            var u = bary[0];
            var v = bary[1];
            var w = bary[2];

            cartesian[0] = a[0] * u + b[0] * v + c[0] * w;
            cartesian[1] = a[1] * u + b[1] * v + c[1] * w;
            cartesian[2] = a[2] * u + b[2] * v + c[2] * w;

            return cartesian;
        },


        identityQuaternion: function (dest) {
            dest = dest || math.vec4();
            dest[0] = 0.0;
            dest[1] = 0.0;
            dest[2] = 0.0;
            dest[3] = 1.0;
            return dest;
        },

        /**
         * Initializes a quaternion from Euler angles.
         *
         * @param {Float32Array} euler The Euler angles.
         * @param {String} order Euler angle order: "XYZ", "YXZ", "ZXY" etc.
         * @param {Float32Array} [dest] Destination quaternion, created by default.
         * @returns {Float32Array} The quaternion.
         */
        eulerToQuaternion: function (euler, order, dest) {

            dest = dest || math.vec4();

            // http://www.mathworks.com/matlabcentral/fileexchange/
            // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
            //	content/SpinCalc.m

            var c1 = Math.cos(euler[0] / 2);
            var c2 = Math.cos(euler[1] / 2);
            var c3 = Math.cos(euler[2] / 2);
            var s1 = Math.sin(euler[0] / 2);
            var s2 = Math.sin(euler[1] / 2);
            var s3 = Math.sin(euler[2] / 2);

            if (order === 'XYZ') {

                dest[0] = s1 * c2 * c3 + c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 - s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 + s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 - s1 * s2 * s3;

            } else if (order === 'YXZ') {

                dest[0] = s1 * c2 * c3 + c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 - s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 - s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 + s1 * s2 * s3;

            } else if (order === 'ZXY') {

                dest[0] = s1 * c2 * c3 - c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 + s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 + s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 - s1 * s2 * s3;

            } else if (order === 'ZYX') {

                dest[0] = s1 * c2 * c3 - c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 + s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 - s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 + s1 * s2 * s3;

            } else if (order === 'YZX') {

                dest[0] = s1 * c2 * c3 + c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 + s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 - s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 - s1 * s2 * s3;

            } else if (order === 'XZY') {

                dest[0] = s1 * c2 * c3 - c1 * s2 * s3;
                dest[1] = c1 * s2 * c3 - s1 * c2 * s3;
                dest[2] = c1 * c2 * s3 + s1 * s2 * c3;
                dest[3] = c1 * c2 * c3 + s1 * s2 * s3;
            }

            return dest;
        },

        mat4ToQuaternion: function (m, dest) {

            dest = dest || math.vec4();

            // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

            // Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

            var m11 = m[0];
            var m12 = m[4];
            var m13 = m[8];
            var m21 = m[1];
            var m22 = m[5];
            var m23 = m[9];
            var m31 = m[2];
            var m32 = m[6];
            var m33 = m[10];
            var s;

            var trace = m11 + m22 + m33;

            if (trace > 0) {

                s = 0.5 / Math.sqrt(trace + 1.0);

                dest[3] = 0.25 / s;
                dest[0] = ( m32 - m23 ) * s;
                dest[1] = ( m13 - m31 ) * s;
                dest[2] = ( m21 - m12 ) * s;

            } else if (m11 > m22 && m11 > m33) {

                s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

                dest[3] = ( m32 - m23 ) / s;
                dest[0] = 0.25 * s;
                dest[1] = ( m12 + m21 ) / s;
                dest[2] = ( m13 + m31 ) / s;

            } else if (m22 > m33) {

                s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

                dest[3] = ( m13 - m31 ) / s;
                dest[0] = ( m12 + m21 ) / s;
                dest[1] = 0.25 * s;
                dest[2] = ( m23 + m32 ) / s;

            } else {

                s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

                dest[3] = ( m21 - m12 ) / s;
                dest[0] = ( m13 + m31 ) / s;
                dest[1] = ( m23 + m32 ) / s;
                dest[2] = 0.25 * s;
            }

            return dest;
        },

        vec3PairToQuaternion: function (u, v, dest) {

            dest = dest || math.vec4();

            var math = XEO.math;

            var norm_u_norm_v = Math.sqrt(math.dotVec3(u, u) * math.dotVec3(v, v));
            var real_part = norm_u_norm_v + math.dotVec3(u, v);

            if (real_part < 0.00000001 * norm_u_norm_v) {

                // If u and v are exactly opposite, rotate 180 degrees
                // around an arbitrary orthogonal axis. Axis normalisation
                // can happen later, when we normalise the quaternion.

                real_part = 0.0;

                if (Math.abs(u[0]) > Math.abs(u[2])) {

                    dest[0] = -u[1];
                    dest[1] = u[0];
                    dest[2] = 0;

                } else {
                    dest[0] = 0;
                    dest[1] = -u[2];
                    dest[2] = u[1]
                }

            } else {

                // Otherwise, build quaternion the standard way.
                math.cross3Vec3(u, v, dest);
            }

            dest[3] = real_part;

            return math.normalizeQuaternion(dest);
        },

        angleAxisToQuaternion: function (angleAxis, dest) {
            dest = dest || math.vec4();
            var halfAngle = angleAxis[3] / 2.0;
            var fsin = Math.sin(halfAngle);
            dest[0] = fsin * angleAxis[0];
            dest[1] = fsin * angleAxis[1];
            dest[2] = fsin * angleAxis[2];
            dest[3] = Math.cos(halfAngle);
            return dest;
        },

        quaternionToEuler: function (euler, order, dest) {
            dest = dest || math.vec4();
            var halfAngle = euler[3] / 2.0;
            var fsin = Math.sin(halfAngle);
            dest[0] = fsin * euler[0];
            dest[1] = fsin * euler[1];
            dest[2] = fsin * euler[2];
            dest[3] = Math.cos(halfAngle);
            return dest;
        },

        mulQuaternions: function (p, q, dest) {
            dest = dest || math.vec4();
            var p0 = p[0], p1 = p[1], p2 = p[2], p3 = p[3];
            var q0 = q[0], q1 = q[1], q2 = q[2], q3 = q[3];
            dest[0] = p3 * q0 + p0 * q3 + p1 * q2 - p2 * q1;
            dest[1] = p3 * q1 + p1 * q3 + p2 * q0 - p0 * q2;
            dest[2] = p3 * q2 + p2 * q3 + p0 * q1 - p1 * q0;
            dest[3] = p3 * q3 - p0 * q0 - p1 * q1 - p2 * q2;
            return dest;
        },

        vec3ApplyQuaternion: function (q, vec, dest) {

            dest = dest || math.vec3();

            var x = vec[0];
            var y = vec[1];
            var z = vec[2];

            var qx = q[0];
            var qy = q[1];
            var qz = q[2];
            var qw = q[3];

            // calculate quat * vector

            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;

            // calculate result * inverse quat

            dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

            return dest;
        },

        quaternionToMat4: function (q, dest) {

            dest = math.identityMat4(dest);

            var q0 = q[0];  //x
            var q1 = q[1];  //y
            var q2 = q[2];  //z
            var q3 = q[3];  //w

            var tx = 2.0 * q0;
            var ty = 2.0 * q1;
            var tz = 2.0 * q2;

            var twx = tx * q3;
            var twy = ty * q3;
            var twz = tz * q3;

            var txx = tx * q0;
            var txy = ty * q0;
            var txz = tz * q0;

            var tyy = ty * q1;
            var tyz = tz * q1;
            var tzz = tz * q2;

            dest[0] = 1.0 - (tyy + tzz);
            dest[1] = txy + twz;
            dest[2] = txz - twy;

            dest[4] = txy - twz;
            dest[5] = 1.0 - (txx + tzz);
            dest[6] = tyz + twx;

            dest[8] = txz + twy;
            dest[9] = tyz - twx;

            dest[10] = 1.0 - (txx + tyy);

            return dest;
        },

        normalizeQuaternion: function (q, dest) {
            dest = dest || q;
            var len = math.lenVec4([q[0], q[1], q[2], q[3]]);
            dest[0] = q[0] / len;
            dest[1] = q[1] / len;
            dest[2] = q[2] / len;
            dest[3] = q[3] / len;
            return dest;
        },

        conjugateQuaternion: function (q, dest) {
            dest = dest || q;
            dest[0] = -q[0];
            dest[1] = -q[1];
            dest[2] = -q[2];
            dest[3] = q[3];
            return dest;
        },

        inverseQuaternion: function (q, dest) {
            return math.normalizeQuaternion(math.conjugateQuaternion(q, dest));
        },

        quaternionToAngleAxis: function (q, angleAxis) {
            angleAxis = angleAxis || math.vec4();
            q = math.normalizeQuaternion(q, tempVec4);
            var q3 = q[3];
            var angle = 2 * Math.acos(q3);
            var s = Math.sqrt(1 - q3 * q3);
            if (s < 0.001) { // test to avoid divide by zero, s is always positive due to sqrt
                angleAxis[0] = q[0];
                angleAxis[1] = q[1];
                angleAxis[2] = q[2];
            } else {
                angleAxis[0] = q[0] / s;
                angleAxis[0] = q[1] / s;
                angleAxis[0] = q[2] / s;
            }
            angleAxis[3] = angle; // * 57.295779579;
            return angleAxis;
        }
    };

})();