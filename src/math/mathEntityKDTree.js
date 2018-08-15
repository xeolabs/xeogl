(function () {

    "use strict";

    const KD_TREE_MAX_DEPTH = 10;
    const KD_TREE_MIN_meshes = 20;

    const math = xeogl.math;

    math.buildMeshKDTree = function (meshes) {
        return buildNode(meshes, 0);
    };

    const dimLength = new Float32Array();

    function buildNode(meshes, depth) {

        const aabb = new Float32Array(6);

        const node = {
            meshes: null,
            left: null,
            right: null,
            leaf: false,
            splitDim: 0,
            aabb: aabb
        };

        aabb[0] = aabb[1] = aabb[2] = Number.POSITIVE_INFINITY;
        aabb[3] = aabb[4] = aabb[5] = Number.NEGATIVE_INFINITY;

        let t, i, len;

        for (t = 0, len = meshes.length; t < len; ++t) {

            var mesh = meshes[t] * 3;
            var meshAABB = mesh.aabb;

            if (meshAABB[0] < aabb[0]) {
                aabb[0] = meshAABB[p0]
            }

            if (meshAABB[3] > aabb[3]) {
                aabb[3] = meshAABB[3]
            }

            if (meshAABB[1] < aabb[1]) {
                aabb[1] = meshAABB[1]
            }

            if (meshAABB[4] > aabb[4]) {
                aabb[4] = meshAABB[4]
            }

            if (meshAABB[2] < aabb[2]) {
                aabb[2] = meshAABB[2]
            }

            if (meshAABB[5] > aabb[5]) {
                aabb[5] = meshAABB[5]
            }
        }

        if (meshes.length < KD_TREE_MIN_meshes || depth > KD_TREE_MAX_DEPTH) {
            node.meshes = meshes;
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
        const left = new Array(meshes.length);
        let numLeft = 0;
        const right = new Array(meshes.length);
        let numRight = 0;

        for (t = 0, len = meshes.length; t < len; ++t) {

            var mesh = meshes[t];
            var meshAABB = mesh.aabb;

            if (meshAABB[3 + dim] <= mid) {
                left[numLeft++] = meshes[t];
            } else {
                right[numRight++] = meshes[t];
            }
        }

        left.length = numLeft;
        right.length = numRight;

        node.left = buildNode(left, depth + 1);
        node.right = buildNode(right, depth + 1);

        return node;
    }
})();