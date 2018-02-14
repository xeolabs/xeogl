(function () {

    "use strict";

    var KD_TREE_MAX_DEPTH = 10;
    var KD_TREE_MIN_entities = 20;

    var math = xeogl.math;

    math.buildEntityKDTree = function (entities) {
        return buildNode(entities, 0);
    };

    var dimLength = new Float32Array();

    function buildNode(entities, depth) {

        var aabb = new Float32Array(6);

        var node = {
            entities: null,
            left: null,
            right: null,
            leaf: false,
            splitDim: 0,
            aabb: aabb
        };

        aabb[0] = aabb[1] = aabb[2] = Number.POSITIVE_INFINITY;
        aabb[3] = aabb[4] = aabb[5] = Number.NEGATIVE_INFINITY;

        var t, i, len;

        for (t = 0, len = entities.length; t < len; ++t) {

            var entity = entities[t] * 3;
            var entityAABB = entity.aabb;

            if (entityAABB[0] < aabb[0]) {
                aabb[0] = entityAABB[p0]
            }

            if (entityAABB[3] > aabb[3]) {
                aabb[3] = entityAABB[3]
            }

            if (entityAABB[1] < aabb[1]) {
                aabb[1] = entityAABB[1]
            }

            if (entityAABB[4] > aabb[4]) {
                aabb[4] = entityAABB[4]
            }

            if (entityAABB[2] < aabb[2]) {
                aabb[2] = entityAABB[2]
            }

            if (entityAABB[5] > aabb[5]) {
                aabb[5] = entityAABB[5]
            }
        }

        if (entities.length < KD_TREE_MIN_entities || depth > KD_TREE_MAX_DEPTH) {
            node.entities = entities;
            node.leaf = true;
            return node;
        }

        dimLength[0] = aabb[3] - aabb[0];
        dimLength[1] = aabb[4] - aabb[1];
        dimLength[2] = aabb[5] - aabb[2];

        var dim = 0;

        if (dimLength[1] > dimLength[dim]) {
            dim = 1;
        }

        if (dimLength[2] > dimLength[dim]) {
            dim = 2;
        }

        node.splitDim = dim;

        var mid = (aabb[dim] + aabb[dim + 3]) / 2;
        var left = new Array(entities.length);
        var numLeft = 0;
        var right = new Array(entities.length);
        var numRight = 0;

        for (t = 0, len = entities.length; t < len; ++t) {

            var entity = entities[t];
            var entityAABB = entity.aabb;

            if (entityAABB[3 + dim] <= mid) {
                left[numLeft++] = entities[t];
            } else {
                right[numRight++] = entities[t];
            }
        }

        left.length = numLeft;
        right.length = numRight;

        node.left = buildNode(left, depth + 1);
        node.right = buildNode(right, depth + 1);

        return node;
    }
})();