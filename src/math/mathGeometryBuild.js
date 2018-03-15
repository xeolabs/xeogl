/**
 * Boundary math functions.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    /**
     * Builds normal vectors from positions and indices.
     *
     * @private
     */
    math.buildNormals = (function () {

        var a = math.vec3();
        var b = math.vec3();
        var c = math.vec3();
        var ab = math.vec3();
        var ac = math.vec3();
        var crossVec = math.vec3();

        return function (positions, indices, normals) {

            var i;
            var len;
            var nvecs = new Array(positions.length / 3);
            var j0;
            var j1;
            var j2;

            for (i = 0, len = indices.length; i < len; i += 3) {

                j0 = indices[i];
                j1 = indices[i + 1];
                j2 = indices[i + 2];

                a[0] = positions[j0 * 3];
                a[1] = positions[j0 * 3 + 1];
                a[2] = positions[j0 * 3 + 2];

                b[0] = positions[j1 * 3];
                b[1] = positions[j1 * 3 + 1];
                b[2] = positions[j1 * 3 + 2];

                c[0] = positions[j2 * 3];
                c[1] = positions[j2 * 3 + 1];
                c[2] = positions[j2 * 3 + 2];

                math.subVec3(b, a, ab);
                math.subVec3(c, a, ac);

                var normVec = math.vec3();

                math.normalizeVec3(math.cross3Vec3(ab, ac, crossVec), normVec);

                if (!nvecs[j0]) {
                    nvecs[j0] = [];
                }
                if (!nvecs[j1]) {
                    nvecs[j1] = [];
                }
                if (!nvecs[j2]) {
                    nvecs[j2] = [];
                }

                nvecs[j0].push(normVec);
                nvecs[j1].push(normVec);
                nvecs[j2].push(normVec);
            }

            normals = (normals && normals.length === positions.length) ? normals : new Float32Array(positions.length);

            var count;
            var x;
            var y;
            var z;

            for (i = 0, len = nvecs.length; i < len; i++) {  // Now go through and average out everything

                count = nvecs[i].length;

                x = 0;
                y = 0;
                z = 0;

                for (var j = 0; j < count; j++) {
                    x += nvecs[i][j][0];
                    y += nvecs[i][j][1];
                    z += nvecs[i][j][2];
                }

                normals[i * 3] = (x / count);
                normals[i * 3 + 1] = (y / count);
                normals[i * 3 + 2] = (z / count);
            }

            return normals;
        };
    })();

    /**
     * Builds vertex tangent vectors from positions, UVs and indices.
     *
     * @private
     */
    math.buildTangents = (function () {

        var tempVec3 = new Float32Array(3);
        var tempVec3b = new Float32Array(3);
        var tempVec3c = new Float32Array(3);
        var tempVec3d = new Float32Array(3);
        var tempVec3e = new Float32Array(3);
        var tempVec3f = new Float32Array(3);
        var tempVec3g = new Float32Array(3);

        return function (positions, indices, uv) {

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

                // Average the value of the vectors

                var addTo;

                for (var v = 0; v < 3; v++) {
                    addTo = indices[location + v] * 3;
                    tangents[addTo] += tangent[0];
                    tangents[addTo + 1] += tangent[1];
                    tangents[addTo + 2] += tangent[2];
                }
            }

            return tangents;
        };
    })();

    /**
     * Builds vertex and index arrays needed by color-indexed triangle picking.
     *
     * @private
     */
    math.buildPickTriangles = function (positions, indices, quantized) {

        var numIndices = indices.length;
        var pickPositions = quantized ? new Uint16Array(numIndices * 30) : new Float32Array(numIndices * 30); // FIXME: Why do we need to extend size like this to make large meshes pickable?
        var pickColors = new Uint8Array(numIndices * 40);
        var primIndex = 0;
        var vi;// Positions array index
        var pvi;// Picking positions array index
        var pci; // Picking color array index

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

            a = (primIndex >> 24 & 0xFF);
            b = (primIndex >> 16 & 0xFF);
            g = (primIndex >> 8 & 0xFF);
            r = (primIndex & 0xFF);

            // A

            i = indices[location];
            vi = i * 3;

            pickPositions[pvi] = positions[vi];
            pickPositions[pvi + 1] = positions[vi + 1];
            pickPositions[pvi + 2] = positions[vi + 2];

            pickColors[pci + 0] = r;
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
    };

    /**
     * Removes duplicate vertices from a triangle mesh.
     * @returns {{positions: Array, uv: *, normals: *,indices: *}}
     */
    math.mergeVertices = function (positions, uv, normals, colors, indices) {

        var positionsMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
        var uniquePositions = [];
        var uniqueUV = uv ? [] : null;
        var uniqueNormals = normals ? [] : null;
        var changes = [];
        var vx;
        var vy;
        var vz;
        var key;
        var precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        var precision = Math.pow(10, precisionPoints);
        var i;
        var il;

        for (i = 0, il = positions.length; i < il; i += 3) {

            vx = positions[i];
            vy = positions[i + 1];
            vz = positions[i + 2];

            key = Math.round(vx * precision) + '_' + Math.round(vy * precision) + '_' + Math.round(vz * precision);

            if (positionsMap[key] === undefined) {

                positionsMap[key] = i / 3;

                uniquePositions.push(vx);
                uniquePositions.push(vy);
                uniquePositions.push(vz);

                if (uv) {
                    // uniqueUV.push(uv[i]);
                    // uniqueUV.push(uv[i + 1]);
                    // uniqueUV.push(uv[i + 2]);
                }

                if (normals) {
                    uniqueNormals.push(normals[i]);
                    uniqueNormals.push(normals[i + 1]);
                    uniqueNormals.push(normals[i + 2]);
                }

                changes[i / 3] = (uniquePositions.length - 3) / 3;

            } else {

                changes[i / 3] = changes[positionsMap[key]];
            }
        }

        var faceIndicesToRemove = [];

        for (i = 0, il = indices.length; i < il; i += 3) {

            indices[i + 0] = changes[indices[i + 0]];
            indices[i + 1] = changes[indices[i + 1]];
            indices[i + 2] = changes[indices[i + 2]];

            var indicesDup = [indices[i + 0], indices[i + 1], indices[i + 2]];

            for (var n = 0; n < 3; n++) {
                if (indicesDup[n] === indicesDup[( n + 1 ) % 3]) {
                    faceIndicesToRemove.push(i);
                    break;
                }
            }
        }

        if (faceIndicesToRemove.length > 0) {
            indices = Array.prototype.slice.call(indices); // splice is not available on typed arrays
            for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
                var idx = faceIndicesToRemove[i];
                indices.splice(idx, 3);
            }
        }

        var result = {
            positions: uniquePositions,
            indices: indices
        };

        if (uv) {
            result.uv = uniqueUV;
        }

        if (normals) {
            result.normals = uniqueNormals;
        }

        return result;
    };

    /**
     * Converts surface-perpendicular face normals to vertex normals. Assumes that the mesh contains disjoint triangles
     * that don't share vertex array elements. Works by finding groups of vertices that have the same location and
     * averaging their normal vectors.
     *
     * @returns {{positions: Array, normals: *}}
     */
    math.faceToVertexNormals = function (positions, normals, options) {
        options = options || {};
        var smoothNormalsAngleThreshold = options.smoothNormalsAngleThreshold || 20;
        var vertexMap = {};
        var vertexNormals = [];
        var vertexNormalAccum = {};
        var acc;
        var vx;
        var vy;
        var vz;
        var key;
        var precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        var precision = Math.pow(10, precisionPoints);
        var posi;
        var i;
        var j;
        var len;
        var a;
        var b;
        var c;

        for (i = 0, len = positions.length; i < len; i += 3) {

            posi = i / 3;

            vx = positions[i];
            vy = positions[i + 1];
            vz = positions[i + 2];

            key = Math.round(vx * precision) + '_' + Math.round(vy * precision) + '_' + Math.round(vz * precision);

            if (vertexMap[key] === undefined) {
                vertexMap[key] = [posi];
            } else {
                vertexMap[key].push(posi);
            }

            var normal = math.normalizeVec3([normals[i], normals[i + 1], normals[i + 2]]);

            vertexNormals[posi] = normal;

            acc = math.vec4([normal[0], normal[1], normal[2], 1]);

            vertexNormalAccum[posi] = acc;
        }

        for (key in vertexMap) {

            if (vertexMap.hasOwnProperty(key)) {

                var vertices = vertexMap[key];
                var numVerts = vertices.length;

                for (i = 0; i < numVerts; i++) {

                    var ii = vertices[i];

                    acc = vertexNormalAccum[ii];

                    for (j = 0; j < numVerts; j++) {

                        if (i === j) {
                            continue;
                        }

                        var jj = vertices[j];

                        a = vertexNormals[ii];
                        b = vertexNormals[jj];

                        var angle = Math.abs(math.angleVec3(a, b) / math.DEGTORAD);

                        if (angle < smoothNormalsAngleThreshold) {

                            acc[0] += b[0];
                            acc[1] += b[1];
                            acc[2] += b[2];
                            acc[3] += 1.0;
                        }
                    }
                }
            }
        }

        for (i = 0, len = normals.length; i < len; i += 3) {

            acc = vertexNormalAccum[i / 3];

            normals[i + 0] = acc[0] / acc[3];
            normals[i + 1] = acc[1] / acc[3];
            normals[i + 2] = acc[2] / acc[3];

        }
    };
}());