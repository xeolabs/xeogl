/*
 * XeoEngine V0.0.1
 *
 * A WebGL-Based 3D Engine from XeoLabs
 * http://xeoengine.org/
 *
 * Built on 2014-12-31
 *
 * MIT License
 * Copyright 2014, Lindsay Kay
 * http://xeolabs.com/
 *
 */

XEO.utils = XEO.utils || {};

/**
 * @class Generic map of IDs to items - can generate own IDs or accept given IDs. IDs should be strings in order to not
 * clash with internally generated IDs, which are numbers.
 */
XEO.utils.Map = function (items, baseId) {

    /**
     * @property Items in this map
     */
    this.items = items || [];

    baseId = _baseId || 0;
    var lastUniqueId = baseId + 1;

    /**
     * Adds an item to the map and returns the ID of the item in the map. If an ID is given, the item is
     * mapped to that ID. Otherwise, the map automatically generates the ID and maps to that.
     *
     * id = myMap.addItem("foo") // ID internally generated
     *
     * id = myMap.addItem("foo", "bar") // ID is "foo"
     *
     */
    this.addItem = function () {
        var item;
        if (arguments.length == 2) {
            var id = arguments[0];
            item = arguments[1];
            if (this.items[id]) { // Won't happen if given ID is string
                throw "ID clash: '" + id + "'";
            }
            this.items[id] = item;
            return id;

        } else {
            while (true) {
                item = arguments[0];
                var findId = lastUniqueId++;
                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    /**
     * Removes the item of the given ID from the map and returns it
     */
    this.removeItem = function (id) {
        var item = this.items[id];
        delete this.items[id];
        return item;
    };
};;"use strict";

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
 * Math functions.
 * @class XEO.math
 */
XEO.math = {

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
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[ i ] = '-';
                } else if (i == 14) {
                    uuid[ i ] = '4';
                } else {
                    if (rnd <= 0x02) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[ i ] = chars[ ( i == 19 ) ? ( r & 0x3 ) | 0x8 : r ];
                }
            }
            return uuid.join('');
        };

    }(),

    /**
     * Negates a four-element vector.
     * @method negateVec4
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
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
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
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
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
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return [] dest if specified, v otherwise
     *
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


    dotVec4: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    },


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
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return [] dest if specified, u otherwise
     *
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

    /**  */
    sqLenVec4: function (v) {
        return XEO.math.dotVec4(v, v);
    },

    /**  */
    lenVec4: function (v) {
        return Math.sqrt(XEO.math.sqLenVec4(v));
    },

    /**  */
    dotVec3: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    },

    /**  */
    dotVec2: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1]);
    },

    /**  */
    sqLenVec3: function (v) {
        return XEO.math.dotVec3(v, v);
    },

    /**  */
    sqLenVec2: function (v) {
        return XEO.math.dotVec2(v, v);
    },

    /**  */
    lenVec3: function (v) {
        return Math.sqrt(XEO.math.sqLenVec3(v));
    },

    /**  */
    lenVec2: function (v) {
        return Math.sqrt(XEO.math.sqLenVec2(v));
    },

    /**
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    rcpVec3: function (v, dest) {
        return XEO.math.divScalarVec3(1.0, v, dest);
    },

    /**
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    normalizeVec4: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec4(v);
        return XEO.math.mulVec4Scalar(v, f, dest);
    },

    /**  */
    normalizeVec3: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec3(v);
        return XEO.math.mulVec3Scalar(v, f, dest);
    },

// 
    normalizeVec2: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec2(v);
        return XEO.math.mulVec2Scalar(v, f, dest);
    },

    /**  */
    mat4: function () {
        return new Array(16);
    },

    /**  */
    dupMat4: function (m) {
        return m.slice(0, 16);
    },

    /**  */
    mat4To3: function (m) {
        return [
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        ];
    },

    /**  */
    m4s: function (s) {
        return [
            s, s, s, s,
            s, s, s, s,
            s, s, s, s,
            s, s, s, s
        ];
    },

    /**  */
    setMat4ToZeroes: function () {
        return XEO.math.m4s(0.0);
    },

    /**  */
    setMat4ToOnes: function () {
        return XEO.math.m4s(1.0);
    },

    /**  */
    diagonalMat4v: function (v) {
        return [
            v[0], 0.0, 0.0, 0.0,
            0.0, v[1], 0.0, 0.0,
            0.0, 0.0, v[2], 0.0,
            0.0, 0.0, 0.0, v[3]
        ];
    },

    /**  */
    diagonalMat4c: function (x, y, z, w) {
        return XEO.math.diagonalMat4v([x, y, z, w]);
    },

    /**  */
    diagonalMat4s: function (s) {
        return XEO.math.diagonalMat4c(s, s, s, s);
    },

    /**  */
    identityMat4: function () {
        return XEO.math.diagonalMat4v([1.0, 1.0, 1.0, 1.0]);
    },

    /**  */
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
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
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
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
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
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
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

    /**  */
    addScalarMat4: function (s, m, dest) {
        return XEO.math.addMat4Scalar(m, s, dest);
    },

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
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
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
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
     * @param s scalar
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
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
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
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
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
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
     * @param m mat4
     * @param v vec4
     * @return []
     *
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
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     *
     */
    transposeMat4: function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        var m4 = mat[4], m14 = mat[14], m8 = mat[8];
        var m13 = mat[13], m12 = mat[12], m9 = mat[9];
        if (!dest || mat == dest) {
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

    /**  */
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
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     *
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

    /**  */
    traceMat4: function (m) {
        return (m[0] + m[5] + m[10] + m[15]);
    },

    /**  */
    translationMat4v: function (v) {
        var m = XEO.math.identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    },

    /**  */
    translationMat4c: function (x, y, z) {
        return XEO.math.translationMat4v([x, y, z]);
    },

    /**  */
    translationMat4s: function (s) {
        return XEO.math.translationMat4c(s, s, s);
    },

    /**  */
    rotationMat4v: function (anglerad, axis) {
        var ax = XEO.math.normalizeVec4([axis[0], axis[1], axis[2], 0.0], []);
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

        var m = XEO.math.mat4();

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

    /**  */
    rotationMat4c: function (anglerad, x, y, z) {
        return XEO.math.rotationMat4v(anglerad, [x, y, z]);
    },

    /**  */
    scalingMat4v: function (v) {
        var m = XEO.math.identityMat4();
        m[0] = v[0];
        m[5] = v[1];
        m[10] = v[2];
        return m;
    },

    /**  */
    scalingMat4c: function (x, y, z) {
        return XEO.math.scalingMat4v([x, y, z]);
    },

    /**  */
    scalingMat4s: function (s) {
        return XEO.math.scalingMat4c(s, s, s);
    },

    /**
     * @param pos vec3 position of the viewer
     * @param target vec3 point the viewer is looking at
     * @param up vec3 pointing "up"
     * @param dest mat4 Optional, mat4 frustum matrix will be written into
     *
     * @return {mat4} dest if specified, a new mat4 otherwise
     */
    lookAtMat4v: function (pos, target, up, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
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

        if (posx == targetx && posy == targety && posz == targetz) {
            return XEO.math.identityMat4();
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

    /**  */
    lookAtMat4c: function (posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
        return XEO.math.lookAtMat4v([posx, posy, posz], [targetx, targety, targetz], [upx, upy, upz], []);
    },

    /**  */
    orthoMat4c: function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
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

    /**  */
    frustumMat4v: function (fmin, fmax) {
        var fmin4 = [fmin[0], fmin[1], fmin[2], 0.0];
        var fmax4 = [fmax[0], fmax[1], fmax[2], 0.0];
        var vsum = XEO.math.mat4();
        XEO.math.addVec4(fmax4, fmin4, vsum);
        var vdif = XEO.math.mat4();
        XEO.math.subVec4(fmax4, fmin4, vdif);
        var t = 2.0 * fmin4[2];

        var m = XEO.math.mat4();
        var vdif0 = vdif[0], vdif1 = vdif[1], vdif2 = vdif[2];

        m[0] = t / vdif0;
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif1;
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif0;
        m[9] = vsum[1] / vdif1;
        m[10] = -vsum[2] / vdif2;
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif2;
        m[15] = 0.0;

        return m;
    },

    /**  */
    frustumMatrix4: function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
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


    /**  */
    perspectiveMatrix4: function (fovyrad, aspectratio, znear, zfar) {
        var pmin = [];
        var pmax = [];

        pmin[2] = znear;
        pmax[2] = zfar;

        pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspectratio;
        pmin[0] = -pmax[0];

        return XEO.math.frustumMat4v(pmin, pmax);
    },

    /**  */
    transformPoint3: function (m, p) {
        var p0 = p[0], p1 = p[1], p2 = p[2];
        return [
                (m[0] * p0) + (m[4] * p1) + (m[8] * p2) + m[12],
                (m[1] * p0) + (m[5] * p1) + (m[9] * p2) + m[13],
                (m[2] * p0) + (m[6] * p1) + (m[10] * p2) + m[14],
                (m[3] * p0) + (m[7] * p1) + (m[11] * p2) + m[15]
        ];
    },


    /**  */
    transformPoints3: function (m, points) {
        var result = new Array(points.length);
        var len = points.length;
        var p0, p1, p2;
        var pi;

        // cache values
        var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
        var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
        var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
        var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];

        for (var i = 0; i < len; ++i) {
            // cache values
            pi = points[i];
            p0 = pi[0];
            p1 = pi[1];
            p2 = pi[2];

            result[i] = [
                    (m0 * p0) + (m4 * p1) + (m8 * p2) + m12,
                    (m1 * p0) + (m5 * p1) + (m9 * p2) + m13,
                    (m2 * p0) + (m6 * p1) + (m10 * p2) + m14,
                    (m3 * p0) + (m7 * p1) + (m11 * p2) + m15
            ];
        }

        return result;
    },

    /**  */
    transformVec3: function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2];
        return [
                (m[0] * v0) + (m[4] * v1) + (m[8] * v2),
                (m[1] * v0) + (m[5] * v1) + (m[9] * v2),
                (m[2] * v0) + (m[6] * v1) + (m[10] * v2)
        ];
    },

    transformVec4: function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
        return [
                m[ 0] * v0 + m[ 4] * v1 + m[ 8] * v2 + m[12] * v3,
                m[ 1] * v0 + m[ 5] * v1 + m[ 9] * v2 + m[13] * v3,
                m[ 2] * v0 + m[ 6] * v1 + m[10] * v2 + m[14] * v3,
                m[ 3] * v0 + m[ 7] * v1 + m[11] * v2 + m[15] * v3
        ];
    },

    /**  */
    projectVec4: function (v) {
        var f = 1.0 / v[3];
        return [v[0] * f, v[1] * f, v[2] * f, 1.0];
    }
};
;XEO.webgl = {

    /** Maps XEO node parameter names to WebGL enum names
     */
    enums: {
        funcAdd: "FUNC_ADD",
        funcSubtract: "FUNC_SUBTRACT",
        funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
        zero: "ZERO",
        one: "ONE",
        srcColor: "SRC_COLOR",
        oneMinusSrcColor: "ONE_MINUS_SRC_COLOR",
        dstColor: "DST_COLOR",
        oneMinusDstColor: "ONE_MINUS_DST_COLOR",
        srcAlpha: "SRC_ALPHA",
        oneMinusSrcAlpha: "ONE_MINUS_SRC_ALPHA",
        dstAlpha: "DST_ALPHA",
        oneMinusDstAlpha: "ONE_MINUS_DST_ALPHA",
        contantColor: "CONSTANT_COLOR",
        oneMinusConstantColor: "ONE_MINUS_CONSTANT_COLOR",
        constantAlpha: "CONSTANT_ALPHA",
        oneMinusConstantAlpha: "ONE_MINUS_CONSTANT_ALPHA",
        srcAlphaSaturate: "SRC_ALPHA_SATURATE",
        front: "FRONT",
        back: "BACK",
        frontAndBack: "FRONT_AND_BACK",
        never: "NEVER",
        less: "LESS",
        equal: "EQUAL",
        lequal: "LEQUAL",
        greater: "GREATER",
        notequal: "NOTEQUAL",
        gequal: "GEQUAL",
        always: "ALWAYS",
        cw: "CW",
        ccw: "CCW",
        linear: "LINEAR",
        nearest: "NEAREST",
        linearMipMapNearest: "LINEAR_MIPMAP_NEAREST",
        nearestMipMapNearest: "NEAREST_MIPMAP_NEAREST",
        nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
        linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
        repeat: "REPEAT",
        clampToEdge: "CLAMP_TO_EDGE",
        mirroredRepeat: "MIRRORED_REPEAT",
        alpha: "ALPHA",
        rgb: "RGB",
        rgba: "RGBA",
        luminance: "LUMINANCE",
        luminanceAlpha: "LUMINANCE_ALPHA",
        textureBinding2D: "TEXTURE_BINDING_2D",
        textureBindingCubeMap: "TEXTURE_BINDING_CUBE_MAP",
        compareRToTexture: "COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
        unsignedByte: "UNSIGNED_BYTE"
    }
}
;/** Buffer for vertices and indices
 *
 * @param gl  WebGL gl
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */
XEO.webgl.ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {

    /**
     * True when this buffer is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;
    this.type = type;
    this.numItems = numItems;
    this.itemSize = itemSize;
    this.usage = usage;

    this._allocate(values, numItems);
};

/**
 * Allocates this buffer
 *
 * @param values
 * @param numItems
 * @private
 */
XEO.webgl.ArrayBuffer.prototype._allocate = function (values, numItems) {
    this.allocated = false;
    this.handle = this.gl.createBuffer();
    if (!this.handle) {
        throw "Failed to allocate WebGL ArrayBuffer";
    }
    if (this.handle) {
        this.gl.bindBuffer(this.type, this.handle);
        this.gl.bufferData(this.type, values, this.usage);
        this.gl.bindBuffer(this.type, null);
        this.numItems = numItems;
        this.length = values.length;
        this.allocated = true;
    }
};

/**
 * Updates values within this buffer, reallocating if needed
 *
 * @param data
 * @param offset
 */
XEO.webgl.ArrayBuffer.prototype.setData = function (data, offset) {
    if (!this.allocated) {
        return;
    }
    if (data.length > this.length) {
        // Needs reallocation
        this.destroy();
        this._allocate(data, data.length);
    } else {
        // No reallocation needed
        if (offset || offset === 0) {
            this.gl.bufferSubData(this.type, offset, data);
        } else {
            this.gl.bufferData(this.type, data);
        }
    }
};

/**
 * Unbinds this buffer on WebGL
 */
XEO.webgl.ArrayBuffer.prototype.unbind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, null);
};

/**
 * Destroys this buffer
 */
XEO.webgl.ArrayBuffer.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteBuffer(this.handle);
    this.handle = null;
    this.allocated = false;
};


XEO.webgl.ArrayBuffer.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, this.handle);
};


;
/** An attribute within a {@link XEO.webgl.Shader}
 */
XEO.webgl.Attribute = function (gl, program, name, type, size, location) {

    this.gl = gl;
    this.location = location;

    this.bindFloatArrayBuffer = function (buffer) {
        if (buffer) {
            buffer.bind();
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        }
    };
};

XEO.webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {
    this.gl.enableVertexAttribArray(this.location);
    this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);   // Vertices are not homogeneous - no w-element
};
;/**
 * @class Wrapper for a WebGL program
 *
 * @param gl WebGL gl
 * @param vertex Source code for vertex shader
 * @param fragment Source code for fragment shader
 */
XEO.webgl.Program = function (gl, vertex, fragment) {

    /**
     * True as soon as this program is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;

    this._uniforms = {};
    this._samplers = {};
    this._attributes = {};

    this.uniformValues = [];

    this.materialSettings = {
        specular: [0, 0, 0],
        specularFactor: 0,
        shine: 0,
        emit: 0,
        alpha: 0
    };

    this._vertexShader = new XEO.webgl.Shader(gl, gl.VERTEX_SHADER, vertex);

    this._fragmentShader = new XEO.webgl.Shader(gl, gl.FRAGMENT_SHADER, fragment);

    var a, i, u, u_name, location, shader;

    // Create program, attach shaders, link and validate program

    this.handle = gl.createProgram();

    if (this.handle) {

        if (this._vertexShader.valid) {
            gl.attachShader(this.handle, this._vertexShader.handle);
        }

        if (this._fragmentShader.valid) {
            gl.attachShader(this.handle, this._fragmentShader.handle);
        }

        gl.linkProgram(this.handle);

        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        var valueIndex = 0;
        for (i = 0; i < numUniforms; ++i) {
            u = gl.getActiveUniform(this.handle, i);
            if (u) {
                u_name = u.name;
                if (u_name[u_name.length - 1] == "\u0000") {
                    u_name = u_name.substr(0, u_name.length - 1);
                }
                location = gl.getUniformLocation(this.handle, u_name);
                if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {
                    this._samplers[u_name] = new XEO.webgl.Sampler(gl, this.handle, u_name, u.type, u.size, location);
                } else {
                    this._uniforms[u_name] = new XEO.webgl.Uniform(gl, this.handle, u_name, u.type, u.size, location, valueIndex);
                    this.uniformValues[valueIndex] = null;
                    ++valueIndex;
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this._attributes[a.name] = new XEO.webgl.Attribute(gl, this.handle, a.name, a.type, a.size, location);
            }
        }

        // Program allocated
        this.allocated = true;
    }
};

XEO.webgl.Program.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.useProgram(this.handle);
};

XEO.webgl.Program.prototype.getUniformLocation = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u.getLocation();
    }
};

XEO.webgl.Program.prototype.getUniform = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u;
    }
};

XEO.webgl.Program.prototype.getAttribute = function (name) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        return attr;
    }
};

XEO.webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        attr.bindFloatArrayBuffer(buffer);
    }
};

XEO.webgl.Program.prototype.bindTexture = function (name, texture, unit) {
    if (!this.allocated) {
        return false;
    }
    var sampler = this._samplers[name];
    if (sampler) {
        return sampler.bindTexture(texture, unit);
    } else {
        return false;
    }
};

XEO.webgl.Program.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteProgram(this.handle);
    this.gl.deleteShader(this._vertexShader.handle);
    this.gl.deleteShader(this._fragmentShader.handle);
    this.handle = null;
    this._attributes = null;
    this._uniforms = null;
    this._samplers = null;
    this.allocated = false;
};


XEO.webgl.Program.prototype.setUniform = function (name, value) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        if (this.uniformValues[u.index] !== value || !u.numberValue) {
            u.setValue(value);
            this.uniformValues[u.index] = value;
        }
    }
};
;
XEO.webgl.RenderBuffer = function (cfg) {

    /**
     * True as soon as this buffer is allocated and ready to go
     */
    this.allocated = false;

    /**
     * The canvas, to synch buffer size with when its dimensions change
     */
    this.canvas = cfg.canvas;

    /**
     * WebGL context
     */
    this.gl = cfg.canvas.gl;

    /**
     * Buffer resources, set up in #_touch
     */
    this.buf = null;

    /**
     * True while this buffer is bound
     * @type {boolean}
     */
    this.bound = false;
};

/**
 * Called after WebGL context is restored.
 */
XEO.webgl.RenderBuffer.prototype.webglRestored = function (_gl) {
    this.gl = _gl;
    this.buf = null;
    this.allocated = false;
    this.bound = false;
};

/**
 * Binds this buffer
 */
XEO.webgl.RenderBuffer.prototype.bind = function () {
    this._touch();
    if (this.bound) {
        return;
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.bound = true;
};

XEO.webgl.RenderBuffer.prototype._touch = function () {
    var width = this.canvas.canvas.width;
    var height = this.canvas.canvas.height;
    if (this.buf) { // Currently have a buffer
        if (this.buf.width == width && this.buf.height == height) { // Canvas size unchanged, buffer still good
            return;
        } else { // Buffer needs reallocation for new canvas size
            this.gl.deleteTexture(this.buf.texture);
            this.gl.deleteFramebuffer(this.buf.framebuf);
            this.gl.deleteRenderbuffer(this.buf.renderbuf);
        }
    }

    this.buf = {
        framebuf: this.gl.createFramebuffer(),
        renderbuf: this.gl.createRenderbuffer(),
        texture: this.gl.createTexture(),
        width: width,
        height: height
    };

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.buf.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    try {
        // Do it the way the spec requires
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    } catch (exception) {
        // Workaround for what appears to be a Minefield bug.
        var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureStorage);
    }

    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.buf.texture, 0);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    // Verify framebuffer is OK
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);

    if (!this.gl.isFramebuffer(this.buf.framebuf)) {
        throw XEO_error.fatalError(XEO.errors.INVALID_FRAMEBUFFER, "Invalid framebuffer");
    }

    var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

    switch (status) {

        case this.gl.FRAMEBUFFER_COMPLETE:
            break;

        case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");

        case this.gl.FRAMEBUFFER_UNSUPPORTED:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");

        default:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: " + status);
    }

    this.bound = false;
};

/**
 * Clears this renderbuffer
 */
XEO.webgl.RenderBuffer.prototype.clear = function () {
    if (!this.bound) {
        throw "Render buffer not bound";
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.disable(this.gl.BLEND);
};

/**
 * Reads buffer pixel at given coordinates
 */
XEO.webgl.RenderBuffer.prototype.read = function (pickX, pickY) {
    var x = pickX;
    var y = this.canvas.canvas.height - pickY;
    var pix = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pix);
    return pix;
};

/**
 * Unbinds this renderbuffer
 */
XEO.webgl.RenderBuffer.prototype.unbind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.bound = false;
};

/** Returns the texture
 */
XEO.webgl.RenderBuffer.prototype.getTexture = function () {
    var self = this;
    return {
        bind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, self.buf.texture);
                return true;
            }
            return false;
        },
        unbind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, null);
            }
        }
    };
};

/** Destroys this buffer
 */
XEO.webgl.RenderBuffer.prototype.destroy = function () {
    if (this.buf) {
        this.gl.deleteTexture(this.buf.texture);
        this.gl.deleteFramebuffer(this.buf.framebuf);
        this.gl.deleteRenderbuffer(this.buf.renderbuf);
        this.buf = null;
        this.bound = false;
    }
};;
XEO.webgl.Sampler = function (gl, program, name, type, size, location) {

    this.bindTexture = function (texture, unit) {
        if (texture.bind(unit)) {
            gl.uniform1i(location, unit);
            return true;
        }
        return false;
    };
};
;
XEO.webgl.Texture2D = function (gl, cfg) {

    /**
     * True as soon as this texture is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.target = cfg.target || gl.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;
    this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
    this.texture = cfg.texture;
    this.format = gl.RGBA;
    this.isDepth = false;
    this.depthMode = 0;
    this.depthCompareMode = 0;
    this.depthCompareFunc = 0;

    try {
        gl.bindTexture(this.target, this.texture);

        if (cfg.minFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, cfg.minFilter);
        }

        if (cfg.magFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, cfg.magFilter);
        }

        if (cfg.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        if (cfg.minFilter == gl.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == gl.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == gl.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
            gl.generateMipmap(this.target);
        }

        gl.bindTexture(this.target, null);

        this.allocated = true;

    } catch (e) {
        throw XEO_error.fatalError(XEO.errors.OUT_OF_VRAM, "Failed to create texture: " + e.message || e);
    }

    this.bind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, this.texture);
            if (this.update) {
                this.update(gl);
            }
            return true;
        }
        return false;
    };

    this.unbind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, null);
        }
    };

    this.destroy = function () {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
    };
};

XEO.webgl.clampImageSize = function (image, numPixels) {
    var n = image.width * image.height;
    if (n > numPixels) {
        var ratio = numPixels / n;

        var width = image.width * ratio;
        var height = image.height * ratio;

        var canvas = document.createElement("canvas");

        canvas.width = XEO.webgl.nextHighestPowerOfTwo(width);
        canvas.height = XEO.webgl.nextHighestPowerOfTwo(height);

        var ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

        image = canvas;
    }
    return image;
};

XEO.webgl.ensureImageSizePowerOfTwo = function (image) {
    if (!XEO.webgl.isPowerOfTwo(image.width) || !XEO.webgl.isPowerOfTwo(image.height)) {
        var canvas = document.createElement("canvas");
        canvas.width = XEO.webgl.nextHighestPowerOfTwo(image.width);
        canvas.height = XEO.webgl.nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
};

XEO.webgl.isPowerOfTwo = function (x) {
    return (x & (x - 1)) == 0;
};

XEO.webgl.nextHighestPowerOfTwo = function (x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};

;
XEO.webgl.Uniform = function (gl, program, name, type, size, location, index, logging) {

    var func = null;

    this.numberValue = false;

    if (type == gl.BOOL) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1i(location, v);
        };
    } else if (type == gl.BOOL_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.BOOL_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.BOOL_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.INT) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1iv(location, v);
        };
    } else if (type == gl.INT_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.INT_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.INT_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.FLOAT) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1f(location, v);
        };
    } else if (type == gl.FLOAT_VEC2) {
        func = function (v) {
            gl.uniform2fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC3) {
        func = function (v) {
            gl.uniform3fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC4) {
        func = function (v) {
            gl.uniform4fv(location, v);
        };
    } else if (type == gl.FLOAT_MAT2) {
        func = function (v) {
            gl.uniformMatrix2fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT3) {
        func = function (v) {
            gl.uniformMatrix3fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT4) {
        func = function (v) {
            gl.uniformMatrix4fv(location, gl.FALSE, v);
        };
    } else {
        throw "Unsupported shader uniform type: " + type;
    }

    this.setValue = func;


    this.getValue = function () {
        return gl.getUniform(program, location);
    };

    this.getLocation = function () {
        return location;
    };

    // This is just an integer key for caching the uniform's value, more efficient than caching by name.
    this.index = index;
};










;XEO.renderer = XEO.renderer || {};

/**
 * @class Display compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
 *
 * <p>A Display is a container of {@link XEO.renderer.Object}s which are created (or updated) by a depth-first
 * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
 *
 * <h2>Rendering Pipeline</h2>
 *
 * <p>Conceptually, a Display implements a pipeline with the following stages:</p>
 *
 * <ol>
 * <li>Create or update {@link XEO.renderer.Object}s during scene compilation</li>
 * <li>Organise the {@link XEO.renderer.Object} into an <b>object list</b></li>
 * <li>Determine the GL state sort order for the object list</li>
 * <li>State sort the object list</li>
 * <li>Create a <b>draw list</b> containing {@link XEO.Chunk}s belonging to the {@link XEO.renderer.Object}s in the object list</li>
 * <li>Render the draw list to draw the image</li>
 * </ol>
 *
 * <p>An update to the scene causes the pipeline to be re-executed from one of these stages, and SceneJS is designed
 * so that the pipeline is always re-executed from the latest stage possible to avoid redoing work.</p>
 *
 * <p>For example:</p>
 *
 * <ul>
 * <li>when an object is created or updated, we need to (re)do stages 2, 3, 4, 5 and 6</li>
 * <li>when an object is made invisible, we need to redo stages 5 and 6</li>
 * <li>when an object is assigned to a different scene render layer (works like a render bin), we need to redo
 *   stages 3, 4, 5, and 6</li>
 *<li>when the colour of an object changes, or maybe when the viewpoint changes, we simplt redo stage 6</li>
 * </ul>
 *
 * <h2>Object Creation</h2>
 * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
 * "compiling" the scene graph into the Display. As traversal visits each scene node, the node's state core is
 * set on the Display (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
 * cores that are active at that instant during compilation. Each of the scene's leaf nodes is always
 * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildObject} to create an
 * object in the soup. For each of the currently active cores, the object is given a {@link XEO.Chunk}
 * containing the WebGL calls for rendering it.</p>
 *
 * <p>The object also gets a shader (implemented by {@link XEO.renderer.Program}), taylored to render those state cores.</p>
 *
 * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
 * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildObject}
 * may update the {@link XEO.Chunk}s on the object as required for any changes in the core soup since the
 * last time the object was built. If differences among the cores require it, then {@link #buildObject} may also replace
 * the object's {@link XEO.renderer.Program} in order to render the new core soup configuration.</p>
 *
 * <p>So in summary, to each {@link XEO.renderer.Object} it builds, {@link #buildObject} creates a list of
 * {@link XEO.Chunk}s to render the set of node state cores that are currently set on the {@link XEO.Renderer}.
 * When {@link #buildObject} is re-building an existing object, it may replace one or more {@link XEO.Chunk}s
 * for state cores that have changed from the last time the object was built or re-built.</p>

 * <h2>Object Destruction</h2>
 * <p>Destruction of a scene graph branch simply involves a call to {@link #removeObject} for each {@link SceneJS.Geometry}
 * in the branch.</p>
 *
 * <h2>Draw List</h2>
 * <p>The draw list is actually comprised of two lists of state chunks: a "pick" list to render a pick buffer
 * for colour-indexed GPU picking, along with a "draw" list for normal image rendering. The chunks in these lists
 * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.</p>
 *
 * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
 * then lazy-redone on the next call to #render or #pick.</p>
 */
XEO.renderer.Renderer = function (cfg) {

    // Display is bound to the lifetime of an HTML5 canvas
    this._canvas = cfg.canvas;

    // Factory which creates and recycles {@link XEO.renderer.Program} instances
    this._programFactory = new XEO.renderer.ProgramFactory({
        canvas: cfg.canvas
    });

    // Factory which creates and recycles {@link SceneJS.Chunk} instances
    this._chunkFactory = new XEO.ChunkFactory();

    /**
     * True when the background is to be transparent
     * @type {boolean}
     */
    this.transparent = cfg.transparent === true;

    /**
     * Node state core for the last {@link SceneJS.Enable} visited during scene graph compilation traversal
     * @type Object
     */
    this.enable = null;

    /**
     * Node state core for the last {@link SceneJS.Flags} visited during scene graph compilation traversal
     * @type Object
     */
    this.flags = null;

    /**
     * Node state core for the last {@link SceneJS.Layer} visited during scene graph compilation traversal
     * @type Object
     */
    this.layer = null;

    /**
     * Node state core for the last {@link SceneJS.Stage} visited during scene graph compilation traversal
     * @type Object
     */
    this.stage = null;

    /**
     * Node state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderer = null;

    /**
     * Node state core for the last {@link SceneJS.DepthBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.depthBuf = null;

    /**
     * Node state core for the last {@link SceneJS.ColorBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.colorBuf = null;

    /**
     * Node state core for the last {@link SceneJS.View} visited during scene graph compilation traversal
     * @type Object
     */
    this.view = null;

    /**
     * Node state core for the last {@link SceneJS.Lights} visited during scene graph compilation traversal
     * @type Object
     */
    this.lights = null;

    /**
     * Node state core for the last {@link SceneJS.Material} visited during scene graph compilation traversal
     * @type Object
     */
    this.material = null;

    /**
     * Node state core for the last {@link SceneJS.Texture} visited during scene graph compilation traversal
     * @type Object
     */
    this.texture = null;

    /**
     * Node state core for the last {@link SceneJS.Reflect} visited during scene graph compilation traversal
     * @type Object
     */
    this.cubemap = null;

    /**
     * Node state core for the last {@link SceneJS.XForm} visited during scene graph compilation traversal
     * @type Object
     */
    this.modelTransform = null;

    /**
     * Node state core for the last {@link SceneJS.LookAt} visited during scene graph compilation traversal
     * @type Object
     */
    this.viewTransform = null;

    /**
     * Node state core for the last {@link SceneJS.Camera} visited during scene graph compilation traversal
     * @type Object
     */
    this.projTransform = null;

    /**
     * Node state core for the last {@link SceneJS.ColorTarget} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderTarget = null;

    /**
     * Node state core for the last {@link SceneJS.Clips} visited during scene graph compilation traversal
     * @type Object
     */
    this.clips = null;

    /**
     * Node state core for the last {@link SceneJS.MorphGeometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.morphGeometry = null;

    /**
     * Node state core for the last {@link SceneJS.Name} visited during scene graph compilation traversal
     * @type Object
     */
    this.name = null;

    /**
     * Node state core for the last {@link SceneJS.Tag} visited during scene graph compilation traversal
     * @type Object
     */
    this.tag = null;

    /**
     * Node state core for the last {@link SceneJS.Shader} visited during scene graph compilation traversal
     * @type Object
     */
    this.shader = null;

    /**
     * Node state core for the last {@link SceneJS.ShaderParams} visited during scene graph compilation traversal
     * @type Object
     */
    this.shaderParams = null;

    /**
     * Node state core for the last {@link SceneJS.Style} visited during scene graph compilation traversal
     * @type Object
     */
    this.style = null;

    /**
     * Node state core for the last {@link SceneJS.Geometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.geometry = null;

    /* Factory which creates and recycles {@link XEO.renderer.Object} instances
     */
    this._objectFactory = new XEO.renderer.ObjectFactory();

    /**
     * The objects in the display
     */
    this._objects = {};

    /**
     * Ambient color, which must be given to gl.clearColor before draw list iteration
     */
    this._ambientColor = [0, 0, 0, 1.0];

    /**
     * The object list, containing all elements of #_objects, kept in GL state-sorted order
     */
    this._objectList = [];
    this._objectListLen = 0;

    /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
     * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
     * "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
     * their objects in #_objectList, with runs of duplicate states removed.
     */
    this._drawList = [];                // State chunk list to render all objects
    this._drawListLen = 0;

    this._pickDrawList = [];            // State chunk list to render scene to pick buffer
    this._pickDrawListLen = 0;

    this._targetList = [];
    this._targetListLen = 0;

    /* The frame context holds state shared across a single render of the draw list, along with any results of
     * the render, such as pick hits
     */
    this._frameCtx = {
        pickNames: [], // Pick names of objects hit during pick render
        canvas: this._canvas,           // The canvas
        VAO: null                       // Vertex array object extension
    };

    /*-------------------------------------------------------------------------------------
     * Flags which schedule what the display is to do when #render is next called.
     *------------------------------------------------------------------------------------*/

    /**
     * Flags the object list as needing to be rebuilt from existing objects on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #2 (see class comment),
     * causing object list rebuild, state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.objectListDirty = true;

    /**
     * Flags the object list as needing state orders to be computed on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #3 (see class comment),
     * causing state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateOrderDirty = true;

    /**
     * Flags the object list as needing to be state sorted on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #4 (see class comment),
     * causing state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateSortDirty = true;

    /**
     * Flags the draw list as needing to be rebuilt from the object list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #5 (see class comment),
     * causing draw list construction and image render.
     * @type Boolean
     */
    this.drawListDirty = true;

    /**
     * Flags the image as needing to be redrawn from the draw list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #6 (see class comment),
     * causing the image render.
     * @type Boolean
     */
    this.imageDirty = true;

    /**
     * Flags the neccessity for the image buffer to be re-rendered from the draw list.
     * @type Boolean
     */
    this.pickBufDirty = true;           // Redraw pick buffer
    this.rayPickBufDirty = true;        // Redraw raypick buffer
};

/**
 * Reallocates WebGL resources for objects within this display
 */
XEO.Renderer.prototype.webglRestored = function () {
    this._programFactory.webglRestored();// Reallocate programs
    this._chunkFactory.webglRestored(); // Recache shader var locations
    var gl = this._canvas.gl;
    if (this.pickBuf) {
        this.pickBuf.webglRestored(gl);          // Rebuild pick buffers
    }
    if (this.rayPickBuf) {
        this.rayPickBuf.webglRestored(gl);
    }
    this.imageDirty = true;             // Need redraw
};

/**
 * Internally creates (or updates) a {@link XEO.renderer.Object} of the given ID from whatever node state cores are currently set
 * on this {@link XEO.Renderer}. The object is created if it does not already exist in the display, otherwise it is
 * updated with the current state cores, possibly replacing cores already referenced by the object.
 *
 * @param {String} objectId ID of object to create or update
 */
XEO.Renderer.prototype.buildObject = function (objectId) {

    var object = this._objects[objectId];

    if (!object) { // Create object
        object = this._objects[objectId] = this._objectFactory.getObject(objectId);
        this.objectListDirty = true;
    }

    object.stage = this.stage;
    object.layer = this.layer;
    object.renderTarget = this.renderTarget;
    object.texture = this.texture;
    object.cubemap = this.cubemap;
    object.geometry = this.geometry;
    object.enable = this.enable;
    object.flags = this.flags;
    object.tag = this.tag;

    //if (!object.hash) {

    var hash = ([                   // Build current state hash
        this.geometry.hash,
        this.shader.hash,
        this.clips.hash,
        this.morphGeometry.hash,
        this.texture.hash,
        this.cubemap.hash,
        this.lights.hash
    ]).join(";");

    if (!object.program || hash != object.hash) {
        // Get new program for object if no program or hash mismatch
        if (object.program) {
            this._programFactory.putProgram(object.program);
        }
        object.program = this._programFactory.getProgram(hash, this);
        object.hash = hash;
    }
    //}

    // Build draw chunks for object

    this._setChunk(object, 0, "program");          // Must be first
    this._setChunk(object, 1, "xform", this.modelTransform);
    this._setChunk(object, 2, "lookAt", this.viewTransform);
    this._setChunk(object, 3, "camera", this.projTransform);
    this._setChunk(object, 4, "flags", this.flags);
    this._setChunk(object, 5, "shader", this.shader);
    this._setChunk(object, 6, "shaderParams", this.shaderParams);
    this._setChunk(object, 7, "style", this.style);
    this._setChunk(object, 8, "depthBuf", this.depthBuf);
    this._setChunk(object, 9, "colorBuf", this.colorBuf);
    this._setChunk(object, 10, "view", this.view);
    this._setChunk(object, 11, "name", this.name);
    this._setChunk(object, 12, "lights", this.lights);
    this._setChunk(object, 13, "material", this.material);
    this._setChunk(object, 14, "texture", this.texture);
    this._setChunk(object, 15, "cubemap", this.cubemap);
    this._setChunk(object, 16, "clips", this.clips);
    this._setChunk(object, 17, "renderer", this.renderer);
    this._setChunk(object, 18, "geometry", this.morphGeometry, this.geometry);
    this._setChunk(object, 19, "draw", this.geometry); // Must be last
};

XEO.Renderer.prototype._setChunk = function (object, order, chunkType, core, core2) {

    var chunkId;
    var chunkClass = this._chunkFactory.chunkTypes[chunkType];

    if (core) {

        // Core supplied
        if (core.empty) { // Only set default cores for state types that have them
            var oldChunk = object.chunks[order];
            if (oldChunk) {
                this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
            }
            object.chunks[order] = null;
            return;
        }

        // Note that core.stateId can be either a number or a string, that's why we make
        // chunkId a string here.
        // TODO: Would it be better if all were numbers?
        chunkId = chunkClass.prototype.programGlobal
            ? '_' + core.stateId
            : 'p' + object.program.id + '_' + core.stateId;

        if (core2) {
            chunkId += '__' + core2.stateId;
        }

    } else {

        // No core supplied, probably a program.
        // Only one chunk of this type per program.
        chunkId = 'p' + object.program.id;
    }

    // This is needed so that chunkFactory can distinguish between draw and geometry
    // chunks with the same core.
    chunkId = order + '__' + chunkId;

    var oldChunk = object.chunks[order];

    if (oldChunk) {
        if (oldChunk.id == chunkId) { // Avoid needless chunk reattachment
            return;
        }
        this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
    }

    object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, core, core2); // Attach new chunk

    // Ambient light is global across everything in display, and
    // can never be disabled, so grab it now because we want to
    // feed it to gl.clearColor before each display list render
    if (chunkType == "lights") {
        this._setAmbient(core);
    }
};

XEO.Renderer.prototype._setAmbient = function (core) {
    var lights = core.lights;
    var light;
    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        if (light.mode == "ambient") {
            this._ambientColor[0] = light.color[0];
            this._ambientColor[1] = light.color[1];
            this._ambientColor[2] = light.color[2];
        }
    }
};

/**
 * Removes an object from this display
 *
 * @param {String} objectId ID of object to remove
 */
XEO.Renderer.prototype.removeObject = function (objectId) {
    var object = this._objects[objectId];
    if (!object) {
        return;
    }
    this._programFactory.putProgram(object.program);
    object.program = null;
    object.hash = null;
    this._objectFactory.putObject(object);
    delete this._objects[objectId];
    this.objectListDirty = true;
};

/**
 * Set a tag selector to selectively activate objects that have matching SceneJS.Tag nodes
 */
XEO.Renderer.prototype.selectTags = function (tagSelector) {
    this._tagSelector = tagSelector;
    this.drawListDirty = true;
};

/**
 * Render this display. What actually happens in the method depends on what flags are set.
 *
 */
XEO.Renderer.prototype.render = function (params) {

    params = params || {};

    if (this.objectListDirty) {
        this._buildObjectList();          // Build object render bin
        this.objectListDirty = false;
        this.stateOrderDirty = true;        // Now needs state ordering
    }

    if (this.stateOrderDirty) {
        this._makeStateSortKeys();       // Compute state sort order
        this.stateOrderDirty = false;
        this.stateSortDirty = true;     // Now needs state sorting
    }

    if (this.stateSortDirty) {
        this._stateSort();              // State sort the object render bin
        this.stateSortDirty = false;
        this.drawListDirty = true;      // Now needs new visible object bin
        //this._logObjectList();
    }

    if (this.drawListDirty) {           // Render visible list while building transparent list
        this._buildDrawList();
        this.imageDirty = true;
        //this._logDrawList();
        //this._logPickList();
    }

    if (this.imageDirty || params.force) {
        this._doDrawList({ // Render, no pick
            clear: (params.clear !== false) // Clear buffers by default
        });
        this.imageDirty = false;
        this.pickBufDirty = true;       // Pick buff will now need rendering on next pick
    }
};

XEO.Renderer.prototype._buildObjectList = function () {
    this._objectListLen = 0;
    for (var objectId in this._objects) {
        if (this._objects.hasOwnProperty(objectId)) {
            this._objectList[this._objectListLen++] = this._objects[objectId];
        }
    }
};

XEO.Renderer.prototype._makeStateSortKeys = function () {
    //  console.log("--------------------------------------------------------------------------------------------------");
    // console.log("XEO.Renderer_makeSortKeys");
    var object;
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        object = this._objectList[i];
        if (!object.program) {
            // Non-visual object (eg. sound)
            object.sortKey = -1;
        } else {
            object.sortKey =
                ((object.stage.priority + 1) * 1000000000000)
                + ((object.flags.transparent ? 2 : 1) * 1000000000)
                + ((object.layer.priority + 1) * 1000000)
                + ((object.program.id + 1) * 1000)
                + object.texture.stateId;
        }
    }
    //  console.log("--------------------------------------------------------------------------------------------------");
};

XEO.Renderer.prototype._stateSort = function () {
    this._objectList.length = this._objectListLen;
    this._objectList.sort(this._stateSortObjects);
};

XEO.Renderer.prototype._stateSortObjects = function (a, b) {
    return a.sortKey - b.sortKey;
};

XEO.Renderer.prototype._logObjectList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._objectListLen + " objects");
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        var object = this._objectList[i];
        console.log("XEO.Renderer : object[" + i + "] sortKey = " + object.sortKey);
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

XEO.Renderer.prototype._buildDrawList = function () {

    this._lastStateId = this._lastStateId || [];
    this._lastPickStateId = this._lastPickStateId || [];

    for (var i = 0; i < 23; i++) {
        this._lastStateId[i] = null;
        this._lastPickStateId[i] = null;
    }

    this._drawListLen = 0;
    this._pickDrawListLen = 0;

    // For each render target, a list of objects to render to that target
    var targetObjectLists = {};

    // A list of all the render target object lists
    var targetListList = [];

    // List of all targets
    var targetList = [];

    var object;
    var tagMask;
    var tagRegex;
    var tagCore;
    var flags;

    if (this._tagSelector) {
        tagMask = this._tagSelector.mask;
        tagRegex = this._tagSelector.regex;
    }

    this._objectDrawList = this._objectDrawList || [];
    this._objectDrawListLen = 0;

    for (var i = 0, len = this._objectListLen; i < len; i++) {

        object = this._objectList[i];

        // Cull invisible objects
        if (object.enable.enabled === false) {
            continue;
        }

        flags = object.flags;

        // Cull invisible objects
        if (flags.enabled === false) {
            continue;
        }

        // Cull objects in disabled layers
        if (!object.layer.enabled) {
            continue;
        }

        // Cull objects with unmatched tags
        if (tagMask) {
            tagCore = object.tag;
            if (tagCore.tag) {
                if (tagCore.mask != tagMask) { // Scene tag mask was updated since last render
                    tagCore.mask = tagMask;
                    tagCore.matches = tagRegex.test(tagCore.tag);
                }
                if (!tagCore.matches) {
                    continue;
                }
            }
        }

        // Put objects with render targets into a bin for each target
        if (object.renderTarget.targets) {
            var targets = object.renderTarget.targets;
            var target;
            var coreId;
            var list;
            for (var j = 0, lenj = targets.length; j < lenj; j++) {
                target = targets[j];
                coreId = target.coreId;
                list = targetObjectLists[coreId];
                if (!list) {
                    list = [];
                    targetObjectLists[coreId] = list;
                    targetListList.push(list);
                    targetList.push(this._chunkFactory.getChunk(target.stateId, "renderTarget", object.program, target));
                }
                list.push(object);
            }
        } else {

            //
            this._objectDrawList[this._objectDrawListLen++] = object;
        }
    }

    // Append chunks for objects within render targets first

    var list;
    var target;
    var object;
    var pickable;

    for (var i = 0, len = targetListList.length; i < len; i++) {

        list = targetListList[i];
        target = targetList[i];

        this._appendRenderTargetChunk(target);

        for (var j = 0, lenj = list.length; j < lenj; j++) {
            object = list[j];
            pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages
            this._appendObjectToDrawLists(object, pickable);
        }
    }

    if (object) {

        // Unbinds any render target bound previously
        this._appendRenderTargetChunk(this._chunkFactory.getChunk(-1, "renderTarget", object.program, {}));
    }

    // Append chunks for objects not in render targets
    for (var i = 0, len = this._objectDrawListLen; i < len; i++) {
        object = this._objectDrawList[i];
        pickable = !object.stage || (object.stage && object.stage.pickable); // We'll only pick objects in pickable stages
        this._appendObjectToDrawLists(object, pickable);
    }

    this.drawListDirty = false;
};


XEO.Renderer.prototype._appendRenderTargetChunk = function (chunk) {
    this._drawList[this._drawListLen++] = chunk;
};

/**
 * Appends an object to the draw and pick lists.
 * @param object
 * @param pickable
 * @private
 */
XEO.Renderer.prototype._appendObjectToDrawLists = function (object, pickable) {
    var chunks = object.chunks;
    var picking = object.flags.picking;
    var chunk;
    for (var i = 0, len = chunks.length; i < len; i++) {
        chunk = chunks[i];
        if (chunk) {

            // As we apply the state chunk lists we track the ID of most types of chunk in order
            // to cull redundant re-applications of runs of the same chunk - except for those chunks with a
            // 'unique' flag, because we don't want to cull runs of draw chunks because they contain the GL
            // drawElements calls which render the objects.

            if (chunk.draw) {
                if (chunk.unique || this._lastStateId[i] != chunk.id) { // Don't reapply repeated states
                    this._drawList[this._drawListLen++] = chunk;
                    this._lastStateId[i] = chunk.id;
                }
            }

            if (chunk.pick) {
                if (pickable !== false) {   // Don't pick objects in unpickable stages
                    if (picking) {          // Don't pick unpickable objects
                        if (chunk.unique || this._lastPickStateId[i] != chunk.id) { // Don't reapply repeated states
                            this._pickDrawList[this._pickDrawListLen++] = chunk;
                            this._lastPickStateId[i] = chunk.id;
                        }
                    }
                }
            }
        }
    }
};

/**
 * Logs the contents of the draw list to the console.
 * @private
 */
XEO.Renderer.prototype._logDrawList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._drawListLen + " draw list chunks");
    for (var i = 0, len = this._drawListLen; i < len; i++) {
        var chunk = this._drawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Logs the contents of the pick list to the console.
 * @private
 */
XEO.Renderer.prototype._logPickList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._pickDrawListLen + " pick list chunks");
    for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
        var chunk = this._pickDrawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Performs a pick on the display graph and returns info on the result.
 * @param {*} params
 * @returns {*}
 */
XEO.Renderer.prototype.pick = function (params) {

    var canvas = this._canvas.canvas;
    var hit = null;
    var canvasX = params.canvasX;
    var canvasY = params.canvasY;
    var pickBuf = this.pickBuf;

    // Lazy-create pick buffer
    if (!pickBuf) {
        pickBuf = this.pickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
        this.pickBufDirty = true;
    }

    this.render(); // Do any pending visible render

    // Colour-index pick to find the picked object

    pickBuf.bind();

    // Re-render the pick buffer if the display has updated
    if (this.pickBufDirty) {
        pickBuf.clear();
        this._doDrawList({
            pick: true,
            clear: true
        });
        this._canvas.gl.finish();
        this.pickBufDirty = false;                                                  // Pick buffer up to date
        this.rayPickBufDirty = true;                                                // Ray pick buffer now dirty
    }

    // Read pixel color in pick buffer at given coordinates,
    // convert to an index into the pick name list

    var pix = pickBuf.read(canvasX, canvasY);                                       // Read pick buffer
    var pickedObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
    var pickIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;
    pickBuf.unbind();                                                               // Unbind pick buffer

    // Look up pick name from index
    var pickName = this._frameCtx.pickNames[pickIndex];                                   // Map pixel to name

    if (pickName) {

        hit = {
            name: pickName.name,
            path: pickName.path,
            nodeId: pickName.nodeId,
            canvasPos: [canvasX, canvasY]
        };

        // Now do a ray-pick if requested

        if (params.rayPick) {

            // Lazy-create ray pick depth buffer
            var rayPickBuf = this.rayPickBuf;
            if (!rayPickBuf) {
                rayPickBuf = this.rayPickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
                this.rayPickBufDirty = true;
            }

            // Render depth values to ray-pick depth buffer

            rayPickBuf.bind();

            if (this.rayPickBufDirty) {
                rayPickBuf.clear();
                this._doDrawList({
                    pick: true,
                    rayPick: true,
                    clear: true
                });
                this.rayPickBufDirty = false;
            }

            // Read pixel from depth buffer, convert to normalised device Z coordinate,
            // which will be in range of [0..1] with z=0 at front
            pix = rayPickBuf.read(canvasX, canvasY);

            rayPickBuf.unbind();

            var screenZ = this._unpackDepth(pix);
            var w = canvas.width;
            var h = canvas.height;
            // Calculate clip space coordinates, which will be in range
            // of x=[-1..1] and y=[-1..1], with y=(+1) at top
            var x = (canvasX - w / 2) / (w / 2);           // Calculate clip space coordinates
            var y = -(canvasY - h / 2) / (h / 2);
            var projMat = this._frameCtx.cameraMat;
            var viewMat = this._frameCtx.viewMat;
            var pvMat = SceneJS_math_mulMat4(projMat, viewMat, []);
            var pvMatInverse = SceneJS_math_inverseMat4(pvMat, []);
            var world1 = SceneJS_math_transformVec4(pvMatInverse, [x, y, -1, 1]);
            world1 = SceneJS_math_mulVec4Scalar(world1, 1 / world1[3]);
            var world2 = SceneJS_math_transformVec4(pvMatInverse, [x, y, 1, 1]);
            world2 = SceneJS_math_mulVec4Scalar(world2, 1 / world2[3]);
            var dir = SceneJS_math_subVec3(world2, world1, []);
            var vWorld = SceneJS_math_addVec3(world1, SceneJS_math_mulVec4Scalar(dir, screenZ, []), []);

            // Got World-space intersect with surface of picked geometry
            hit.worldPos = vWorld;
        }
    }

    return hit;
};

/**
 * Unpacks a color-encoded depth
 * @param {Array(Number)} depthZ Depth encoded as an RGBA color value
 * @returns {Number}
 * @private
 */
XEO.Renderer.prototype._unpackDepth = function (depthZ) {
    var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
    var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
    return SceneJS_math_dotVector4(vec, bitShift);
};

/** Renders either the draw or pick list.
 *
 * @param {*} params
 * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
 * @param {Boolean} params.pick Set true to render for picking
 * @param {Boolean} params.rayPick Set true to render for ray-picking
 * @private
 */
XEO.Renderer.prototype._doDrawList = function (params) {

    var gl = this._canvas.gl;

    // Reset frame context
    var frameCtx = this._frameCtx;
    frameCtx.renderTarget = null;
    frameCtx.targetIndex = 0;
    frameCtx.renderBuf = null;
    frameCtx.viewMat = null;
    frameCtx.modelMat = null;
    frameCtx.cameraMat = null;
    frameCtx.renderer = null;
    frameCtx.depthbufEnabled = null;
    frameCtx.clearDepth = null;
    frameCtx.depthFunc = gl.LESS;
    frameCtx.scissorTestEnabled = false;
    frameCtx.blendEnabled = false;
    frameCtx.backfaces = true;
    frameCtx.frontface = "ccw";
    frameCtx.pick = !!params.pick;
    frameCtx.rayPick = !!params.rayPick;
    frameCtx.pickIndex = 0;
    frameCtx.textureUnit = 0;
    frameCtx.lineWidth = 1;
    frameCtx.transparent = false;
    frameCtx.ambientColor = this._ambientColor;
    frameCtx.aspect = this._canvas.canvas.width / this._canvas.canvas.height;

    // The extension needs to be re-queried in case the context was lost and has been recreated.
    var VAO = gl.getExtension("OES_vertex_array_object");
    frameCtx.VAO = (VAO) ? VAO : null;
    frameCtx.VAO = null;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    if (this.transparent) {
        gl.clearColor(0, 0, 0, 0);
    } else {
        gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
    }

    if (params.clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    gl.frontFace(gl.CCW);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    if (params.pick) {
        // Render for pick
        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
            this._pickDrawList[i].pick(frameCtx);
        }
    } else {
        // Render for draw
        for (var i = 0, len = this._drawListLen; i < len; i++) {      // Push opaque rendering chunks
            this._drawList[i].draw(frameCtx);
        }
    }

    gl.flush();

    if (frameCtx.renderBuf) {
        frameCtx.renderBuf.unbind();
    }

    if (frameCtx.VAO) {
        frameCtx.VAO.bindVertexArrayOES(null);
        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
};

XEO.Renderer.prototype.destroy = function () {
    this._programFactory.destroy();
};
