/**
 * KD-tree functions
 */
(function () {

    "use strict";

    const KD_TREE_MAX_DEPTH = 10;
    const KD_TREE_MIN_TRIANGLES = 20;

    const math = xeogl.math;

    /**
     * Returns a KD-tree that contains the triangles of the given mesh
     *
     * @private
     */
    math.buildKDTree = function (indices, positions) {
        const numTris = indices.length / 3;
        const triangles = new Array(numTris);
        for (let i = 0; i < numTris; ++i) {
            triangles[i] = i;
        }
        return buildNode(triangles, indices, positions, 0);
    };

    const dimLength = new Float32Array();

    function buildNode(triangles, indices, positions, depth) {

        const aabb = new Float32Array(6);

        const node = {
            triangles: null,
            left: null,
            right: null,
            leaf: false,
            splitDim: 0,
            aabb: aabb
        };

        aabb[0] = aabb[1] = aabb[2] = Number.POSITIVE_INFINITY;
        aabb[3] = aabb[4] = aabb[5] = Number.NEGATIVE_INFINITY;

        let t, i, len;

        for (t = 0, len = triangles.length; t < len; ++t) {
            var ii = triangles[t] * 3;
            for (let j = 0; j < 3; ++j) {
                const pi = indices[ii + j] * 3;
                if (positions[pi] < aabb[0]) {
                    aabb[0] = positions[pi]
                }
                if (positions[pi] > aabb[3]) {
                    aabb[3] = positions[pi]
                }
                if (positions[pi + 1] < aabb[1]) {
                    aabb[1] = positions[pi + 1]
                }
                if (positions[pi + 1] > aabb[4]) {
                    aabb[4] = positions[pi + 1]
                }
                if (positions[pi + 2] < aabb[2]) {
                    aabb[2] = positions[pi + 2]
                }
                if (positions[pi + 2] > aabb[5]) {
                    aabb[5] = positions[pi + 2]
                }
            }
        }

        if (triangles.length < KD_TREE_MIN_TRIANGLES || depth > KD_TREE_MAX_DEPTH) {
            node.triangles = triangles;
            node.leaf = true;
            return node;
        }

        dimLength[0] = aabb[3] - aabb[0];
        dimLength[1] = aabb[4] - aabb[1];
        dimLength[2] = aabb[5] - aabb[2];

        let dim = 0;

        if (dimLength[1] > dimLength[dim]) {
            dim = 1;
        }

        if (dimLength[2] > dimLength[dim]) {
            dim = 2;
        }

        node.splitDim = dim;

        const mid = (aabb[dim] + aabb[dim + 3]) / 2;
        const left = new Array(triangles.length);
        let numLeft = 0;
        const right = new Array(triangles.length);
        let numRight = 0;

        for (t = 0, len = triangles.length; t < len; ++t) {

            var ii = triangles[t] * 3;
            const i0 = indices[ii];
            const i1 = indices[ii + 1];
            const i2 = indices[ii + 2];

            const pi0 = i0 * 3;
            const pi1 = i1 * 3;
            const pi2 = i2 * 3;

            if (positions[pi0 + dim] <= mid || positions[pi1 + dim] <= mid || positions[pi2 + dim] <= mid) {
                left[numLeft++] = triangles[t];
            } else {
                right[numRight++] = triangles[t];
            }
        }

        left.length = numLeft;
        right.length = numRight;

        node.left = buildNode(left, indices, positions, depth + 1);
        node.right = buildNode(right, indices, positions, depth + 1);

        return node;
    }

})();