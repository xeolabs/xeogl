/**
 * Ray casting support functions.
 */
(function () {

    "use strict";

    var math = xeogl.math;

    /**
     Transforms a Canvas-space position into a World-space ray, in the context of a Camera.
     @method canvasPosToWorldRay
     @static
     @param {Camera} camera The Camera.
     @param {Float32Array} canvasPos The Canvas-space position.
     @param {Float32Array} worldRayOrigin The World-space ray origin.
     @param {Float32Array} worldRayDir The World-space ray direction.
     */
    math.canvasPosToWorldRay = (function () {

        var tempMat4b = math.mat4();
        var tempMat4c = math.mat4();
        var tempVec4a = math.vec4();
        var tempVec4b = math.vec4();
        var tempVec4c = math.vec4();
        var tempVec4d = math.vec4();

        return function (camera, canvasPos, worldRayOrigin, worldRayDir) {

            var canvas = camera.scene.canvas.canvas;

            var viewMat = camera.viewMatrix;
            var projMat = camera.projection === "ortho" ? camera.ortho.matrix : camera.perspective.matrix;

            var pvMat = math.mulMat4(projMat, viewMat, tempMat4b);
            var pvMatInverse = math.inverseMat4(pvMat, tempMat4c);

            // Calculate clip space coordinates, which will be in range
            // of x=[-1..1] and y=[-1..1], with y=(+1) at top

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            var clipX = (canvasPos[0] - canvasWidth / 2) / (canvasWidth / 2);  // Calculate clip space coordinates
            var clipY = -(canvasPos[1] - canvasHeight / 2) / (canvasHeight / 2);

            tempVec4a[0] = clipX;
            tempVec4a[1] = clipY;
            tempVec4a[2] = -1;
            tempVec4a[3] = 1;

            math.transformVec4(pvMatInverse, tempVec4a, tempVec4b);
            math.mulVec4Scalar(tempVec4b, 1 / tempVec4b[3]);

            tempVec4c[0] = clipX;
            tempVec4c[1] = clipY;
            tempVec4c[2] = 1;
            tempVec4c[3] = 1;

            math.transformVec4(pvMatInverse, tempVec4c, tempVec4d);
            math.mulVec4Scalar(tempVec4d, 1 / tempVec4d[3]);

            worldRayOrigin[0] = tempVec4d[0];
            worldRayOrigin[1] = tempVec4d[1];
            worldRayOrigin[2] = tempVec4d[2];

            math.subVec3(tempVec4d, tempVec4b, worldRayDir);

            math.normalizeVec3(worldRayDir);
        };
    })();

    /**
     Transforms a Canvas-space position to an Entity's Local-space coordinate system, in the context of a Camera.
     @method canvasPosToLocalRay
     @static
     @param {Camera} camera The Camera.
     @param {Entity} entity The Entity.
     @param {Float32Array} canvasPos The Canvas-space position.
     @param {Float32Array} localRayOrigin The Local-space ray origin.
     @param {Float32Array} localRayDir The Local-space ray direction.
     */
    math.canvasPosToLocalRay = (function () {

        var worldRayOrigin = math.vec3();
        var worldRayDir = math.vec3();

        return function (camera, entity, canvasPos, localRayOrigin, localRayDir) {
            math.canvasPosToWorldRay(camera, canvasPos, worldRayOrigin, worldRayDir);
            math.worldRayToLocalRay(entity, worldRayOrigin, worldRayDir, localRayOrigin, localRayDir);
        };
    })();

    /**
     Transforms a ray from World-space to an Entity's Local-space coordinate system.
     @method worldRayToLocalRay
     @static
     @param {Entity} entity The Entity.
     @param {Float32Array} worldRayOrigin The World-space ray origin.
     @param {Float32Array} worldRayDir The World-space ray direction.
     @param {Float32Array} localRayOrigin The Local-space ray origin.
     @param {Float32Array} localRayDir The Local-space ray direction.
     */
    math.worldRayToLocalRay = (function () {

        var tempMat4 = math.mat4();
        var tempVec4a = math.vec4();
        var tempVec4b = math.vec4();

        return function (entity, worldRayOrigin, worldRayDir, localRayOrigin, localRayDir) {

            var modelMat = entity.transform.leafMatrix;
            var modelMatInverse = math.inverseMat4(modelMat, tempMat4);

            tempVec4a[0] = worldRayOrigin[0];
            tempVec4a[1] = worldRayOrigin[1];
            tempVec4a[2] = worldRayOrigin[2];
            tempVec4a[3] = 1;

            math.transformVec4(modelMatInverse, tempVec4a, tempVec4b);

            localRayOrigin[0] = tempVec4b[0];
            localRayOrigin[1] = tempVec4b[1];
            localRayOrigin[2] = tempVec4b[2];

            math.transformVec3(modelMatInverse, worldRayDir, localRayDir);
        };
    })();
})();