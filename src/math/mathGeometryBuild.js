/**
 * Boundary math functions.
 */
(function () {

    "use strict";

    const math = xeogl.math;

    /**
     * Builds normal vectors from positions and indices.
     *
     * @private
     */
    math.buildNormals = (function () {

        const a = math.vec3();
        const b = math.vec3();
        const c = math.vec3();
        const ab = math.vec3();
        const ac = math.vec3();
        const crossVec = math.vec3();

        return function (positions, indices, normals) {

            let i;
            let len;
            const nvecs = new Array(positions.length / 3);
            let j0;
            let j1;
            let j2;

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

                const normVec = math.vec3();

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

            let count;
            let x;
            let y;
            let z;

            for (i = 0, len = nvecs.length; i < len; i++) {  // Now go through and average out everything

                count = nvecs[i].length;

                x = 0;
                y = 0;
                z = 0;

                for (let j = 0; j < count; j++) {
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

        const tempVec3 = new Float32Array(3);
        const tempVec3b = new Float32Array(3);
        const tempVec3c = new Float32Array(3);
        const tempVec3d = new Float32Array(3);
        const tempVec3e = new Float32Array(3);
        const tempVec3f = new Float32Array(3);
        const tempVec3g = new Float32Array(3);

        return function (positions, indices, uv) {

            const tangents = new Float32Array(positions.length);

            // The vertex arrays needs to be calculated
            // before the calculation of the tangents

            for (let location = 0; location < indices.length; location += 3) {

                // Recontructing each vertex and UV coordinate into the respective vectors

                let index = indices[location];

                const v0 = positions.subarray(index * 3, index * 3 + 3);
                const uv0 = uv.subarray(index * 2, index * 2 + 2);

                index = indices[location + 1];

                const v1 = positions.subarray(index * 3, index * 3 + 3);
                const uv1 = uv.subarray(index * 2, index * 2 + 2);

                index = indices[location + 2];

                const v2 = positions.subarray(index * 3, index * 3 + 3);
                const uv2 = uv.subarray(index * 2, index * 2 + 2);

                const deltaPos1 = math.subVec3(v1, v0, tempVec3);
                const deltaPos2 = math.subVec3(v2, v0, tempVec3b);

                const deltaUV1 = math.subVec2(uv1, uv0, tempVec3c);
                const deltaUV2 = math.subVec2(uv2, uv0, tempVec3d);

                const r = 1 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

                const tangent = math.mulVec3Scalar(
                    math.subVec3(
                        math.mulVec3Scalar(deltaPos1, deltaUV2[1], tempVec3e),
                        math.mulVec3Scalar(deltaPos2, deltaUV1[1], tempVec3f),
                        tempVec3g
                    ),
                    r,
                    tempVec3f
                );

                // Average the value of the vectors

                let addTo;

                for (let v = 0; v < 3; v++) {
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

        const numIndices = indices.length;
        const pickPositions = quantized ? new Uint16Array(numIndices * 9) : new Float32Array(numIndices * 9);
        const pickColors = new Uint8Array(numIndices  * 12);
        let primIndex = 0;
        let vi;// Positions array index
        let pvi = 0;// Picking positions array index
        let pci = 0; // Picking color array index

        // Triangle indices
        let i;
        let r;
        let g;
        let b;
        let a;

        for (let location = 0; location < numIndices; location += 3) {

            // Primitive-indexed triangle pick color

            a = (primIndex >> 24 & 0xFF);
            b = (primIndex >> 16 & 0xFF);
            g = (primIndex >> 8 & 0xFF);
            r = (primIndex & 0xFF);

            // A

            i = indices[location];
            vi = i * 3;

            pickPositions[pvi++] = positions[vi];
            pickPositions[pvi++] = positions[vi + 1];
            pickPositions[pvi++] = positions[vi + 2];

            pickColors[pci++] = r;
            pickColors[pci++] = g;
            pickColors[pci++] = b;
            pickColors[pci++] = a;

            // B

            i = indices[location + 1];
            vi = i * 3;

            pickPositions[pvi++] = positions[vi];
            pickPositions[pvi++] = positions[vi + 1];
            pickPositions[pvi++] = positions[vi + 2];

            pickColors[pci++] = r;
            pickColors[pci++] = g;
            pickColors[pci++] = b;
            pickColors[pci++] = a;

            // C

            i = indices[location + 2];
            vi = i * 3;

            pickPositions[pvi++] = positions[vi];
            pickPositions[pvi++] = positions[vi + 1];
            pickPositions[pvi++] = positions[vi + 2];

            pickColors[pci++] = r;
            pickColors[pci++] = g;
            pickColors[pci++] = b;
            pickColors[pci++] = a;

            primIndex++;
        }

        return {
            positions: pickPositions,
            colors: pickColors
        };
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
        const smoothNormalsAngleThreshold = options.smoothNormalsAngleThreshold || 20;
        const vertexMap = {};
        const vertexNormals = [];
        const vertexNormalAccum = {};
        let acc;
        let vx;
        let vy;
        let vz;
        let key;
        const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        const precision = Math.pow(10, precisionPoints);
        let posi;
        let i;
        let j;
        let len;
        let a;
        let b;
        let c;

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

            const normal = math.normalizeVec3([normals[i], normals[i + 1], normals[i + 2]]);

            vertexNormals[posi] = normal;

            acc = math.vec4([normal[0], normal[1], normal[2], 1]);

            vertexNormalAccum[posi] = acc;
        }

        for (key in vertexMap) {

            if (vertexMap.hasOwnProperty(key)) {

                const vertices = vertexMap[key];
                const numVerts = vertices.length;

                for (i = 0; i < numVerts; i++) {

                    const ii = vertices[i];

                    acc = vertexNormalAccum[ii];

                    for (j = 0; j < numVerts; j++) {

                        if (i === j) {
                            continue;
                        }

                        const jj = vertices[j];

                        a = vertexNormals[ii];
                        b = vertexNormals[jj];

                        const angle = Math.abs(math.angleVec3(a, b) / math.DEGTORAD);

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