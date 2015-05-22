/**
 * Builds normal vectors from positions and indices
 * @private
 */
XEO.math.buildNormals = function (positions, indices) {

    var nvecs = new Array(positions.length / 3);
    var j0;
    var j1;
    var j2;
    var v1;
    var v2;
    var v3;

    for (var i = 0, len = indices.length - 3; i < len; i += 3) {
        j0 = indices[i + 0];
        j1 = indices[i + 1];
        j2 = indices[i + 2];

        v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
        v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
        v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

        v2 = XEO.math.subVec4(v2, v1, [0, 0, 0, 0]);
        v3 = XEO.math.subVec4(v3, v1, [0, 0, 0, 0]);

        var n = XEO.math.normalizeVec4(XEO.math.cross3Vec4(v2, v3, [0, 0, 0, 0]), [0, 0, 0, 0]);

        if (!nvecs[j0]) nvecs[j0] = [];
        if (!nvecs[j1]) nvecs[j1] = [];
        if (!nvecs[j2]) nvecs[j2] = [];

        nvecs[j0].push(n);
        nvecs[j1].push(n);
        nvecs[j2].push(n);
    }

    var normals = new Array(positions.length);

    // now go through and average out everything
    for (var i = 0, len = nvecs.length; i < len; i++) {
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
};


/**
 * Builds vertex tangent vectors from positions, UVs and indices
 *
 * Based on code by @rollokb, in his fork of webgl-obj-loader:
 * https://github.com/rollokb/webgl-obj-loader
 *
 * @private
 **/
XEO.math.buildTangents = function (positions, indices, uv) {

    var tangents = [];

    // The vertex arrays needs to be calculated
    // before the calculation of the tangents

    for (var location = 0; location < indices.length; location += 3) {

        // Recontructing each vertex and UV coordinate into the respective vectors

        var index = indices[location];

        var v0 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
        var uv0 = [uv[index * 2], uv[(index * 2) + 1]];

        index = indices[location + 1];

        var v1 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
        var uv1 = [uv[index * 2], uv[(index * 2) + 1]];

        index = indices[location + 2];

        var v2 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
        var uv2 = [uv[index * 2], uv[(index * 2) + 1]];

        var deltaPos1 = XEO.math.subVec3(v1, v0, []);
        var deltaPos2 = XEO.math.subVec3(v2, v0, []);

        var deltaUV1 = XEO.math.subVec2(uv1, uv0, []);
        var deltaUV2 = XEO.math.subVec2(uv2, uv0, []);

        var r = 1.0 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

        var tangent = XEO.math.mulVec3Scalar(
            XEO.math.subVec3(
                XEO.math.mulVec3Scalar(deltaPos1, deltaUV2[1], []),
                XEO.math.mulVec3Scalar(deltaPos2, deltaUV1[1], []),
                []
            ),
            r,
            []
        );

        // Average the value of the vectors outs
        for (var v = 0; v < 3; v++) {
            var addTo = indices[location + v];
            if (typeof tangents[addTo] !== "undefined") {
                tangents[addTo] = XEO.math.addVec3(tangents[addTo], tangent, []);
            } else {
                tangents[addTo] = tangent;
            }
        }
    }

    // Deconstruct the vectors back into 1D arrays for WebGL

    var tangents2 = [];

    for (var i = 0; i < tangents.length; i++) {
        tangents2 = tangents2.concat(tangents[i]);
    }

    return tangents2;
};

