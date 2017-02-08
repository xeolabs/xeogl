/**
 A **VoxelGeometryBuilder** is a builder that you can use to procedurally generate {{#crossLink "Geometry"}}Geometries{{/crossLink}} that are 3D arrays of voxels.

 <a href="../../examples/#generation_VoxelGeometryBuilder_wavyBlocks"><img src="http://i.giphy.com/26gJAMkOxAW5fWlb2.gif"></img></a>

 ## Overview

 * Implements the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern).
 * Helps us improve WebGL performance by combining many voxel shapes into the same {{#crossLink "Geometry"}}Geometries{{/crossLink}},
 thus reducing the number of draw calls.
 * A plain JavaScript class, IE. not a xeogl {{#crossLink "Component"}}{{/crossLink}} subclass.

 ## Dependencies

 * {{#crossLink "GeometryBuilder"}}{{/crossLink}}

 ## Examples

 * [Generating a 3D sine wave from boxes](../../examples/#generation_VoxelGeometryBuilder_wavyBlocks)</li>

 ## Usage

 * Works by accumulating additions to an internal buffer of geometry vertex and index arrays.
 * Call {{#crossLink "VoxelGeometryBuilder/setShape:method"}}setShape(){{/crossLink}} to set the mesh that it uses to represent each voxel.
 * Then, whenever you call {{#crossLink "VoxelGeometryBuilder/writeVoxel:method"}}writeVoxel(){{/crossLink}}, it accumulates the shape,
 * at that voxel position, within its internal buffer.
 * Finally, call {{#crossLink "VoxelGeometryBuilder/build:method"}}build(){{/crossLink}} to dump its buffer into a target {{#crossLink "Geometry"}}{{/crossLink}}.
 * Retains its buffer so that you can call {{#crossLink "VoxelGeometryBuilder/build:method"}}build(){{/crossLink}} again, to dump its
 buffer into other {{#crossLink "Geometry"}}Geometries{{/crossLink}} as needed.
 * Call {{#crossLink "VoxelGeometryBuilder/clearVoxel:method"}}voxel(){{/crossLink}} to clear individual voxels.
 * Call {{#crossLink "VoxelGeometryBuilder/reset:method"}}reset(){{/crossLink}} to empty its buffer.

 In the example below we'll use a VoxelGeometryBuilder to create something like the screen capture shown above.

 ````javascript
 // Intatiate a VoxelGeometryBuilder; note that it's a
 // plain JavaScript object, not a xeogl Component subtype
 var voxelGeometryBuilder = new xeogl.VoxelGeometryBuilder({

        // Extents of voxel grid
        xSize: 1000,
        ySize: 1000,
        zSize: 1000,

        rez: 100
    });

 // Now write some voxels
 // within the VoxelGeometryBuilder.
 for (var i = 0; i < 500; i++) {
        for (var j = 0; j < 500; j++) {
            voxelGeometryBuilder.writeVoxel([i, (Math.cos(i * 0.01) * 250 + Math.cos(j * 0.01) * 250) + 500, j]);
        }
    }

 // Set the shape we'll use for each voxel;
 // this can be a Geometry, or just an object containing vertex and indices arrays.
 voxelGeometryBuilder.setShape(new xeogl.BoxGeometry());


 // Dump the buffer into a Geometry component
 var geometry = new xeogl.Geometry();
 VoxelGeometryBuilder.build(geometry);

 // Create an Entity with our Geometry attached
 var entity = new xeogl.Entity({
    geometry: geometry,
    material: new xeogl.PhongMaterial({
        diffuse: [0.6, 0.6, 0.7]
    })
 });

 // Set initial camera position
 var view = entity.camera.view;
 view.eye = [0, 0, -1600];
 view.look = [0, 0, 0];
 view.up = [0, 1, 0];

 // Allow camera interaction
 new xeogl.CameraControl();
 ````

 @module xeogl
 @submodule generation
 @constructor
 */
(function () {

    "use strict";

    xeogl.VoxelGeometryBuilder = function (cfg) {

        cfg = cfg || {};

        this.aabb = new Float32Array(cfg.aabb || [-500, -500, -500, 500, 500, 500]);
        this.resolution = new Float32Array(cfg.resolution || [100, 100, 100]);
        this.voxelSize = new Float32Array([
            (this.aabb[3] - this.aabb[0]) / this.resolution[0],
            (this.aabb[4] - this.aabb[1]) / this.resolution[1],
            (this.aabb[5] - this.aabb[2]) / this.resolution[2]]);
        this._cells = {};
        this._matrix = xeogl.math.mat4();
        this._geometryBuilder = new xeogl.GeometryBuilder();
        this._dirty = true;
    };

    /**
     * Sets the shape that the {{#crossLink "VoxelGeometryBuilder/build:method"}}method(){{/crossLink}} will add
     * to target {{#crossLink "Geometry"}}Geometries{{/crossLink}} for each voxel.
     *
     * The shape can be either a {{#crossLink "Geometry"}}{{/crossLink}} or a JavaScript object containing vertex
     * and index arrays.
     *
     * @method setShape
     * @param {Geometry|*} shape The shape to add.
     * @returns this
     */
    xeogl.VoxelGeometryBuilder.prototype.setShape = function (shape) {
        this._geometryBuilder.setShape(shape);
        return this;
    };

    /**
     * Writes a voxel.
     *
     * Ignored if the voxel is already written, or if the given position
     * falls outside this VoxelGeometryBuilder's voxel space extents.
     *
     * It's OK to just blindly write voxels that have already been written, there is little performance penalty.
     *
     * @method writeVoxel
     * @param {Float32Array} pos 3D Voxel position.
     */
    xeogl.VoxelGeometryBuilder.prototype.writeVoxel = function (pos) {
        this._setVoxel(pos, true);
        return this;
    };

    /**
     * Clears a voxel.
     *
     * Ignored if the voxel is already clear, or if the given position
     * falls outside this VoxelGeometryBuilder's voxel space extents.
     *
     * It's OK to just blindly clear voxels that are already clear, there is little performance penalty.
     *
     * @method clearVoxel
     * @param {Float32Array} pos 3D Voxel position.
     */
    xeogl.VoxelGeometryBuilder.prototype.clearVoxel = function (pos) {
        this._setVoxel(pos, false);
    };

    xeogl.VoxelGeometryBuilder.prototype._setVoxel = function (pos, write) {

        if (pos[0] < this.aabb[0] || pos[0] > this.aabb[3] ||
            pos[1] < this.aabb[1] || pos[1] > this.aabb[4] ||
            pos[2] < this.aabb[2] || pos[2] > this.aabb[5]) {
            return this; // Clipped
        }

        var xi = Math.round(pos[0] / this.voxelSize[0]);
        var yi = Math.round(pos[1] / this.voxelSize[1]);
        var zi = Math.round(pos[2] / this.voxelSize[2]);

        var key = xi + "." + yi + "." + zi;

        if (!!this._cells[key] === write) {
            return this; // Reject overwrite
        }

        write ? this._cells[key] = new Uint16Array([xi, yi, zi]) : delete this._cells[key];

        this._dirty = true;

        return this;
    };


    /**
     * Loads all the voxels accumulated from previous calls to {{#crossLink "VoxelGeometryBuilder/writeVoxel:method"}}writeVoxel(){{/crossLink}} into
     * a target {{#crossLink "Geometry"}}{{/crossLink}}.
     *
     * Retains all that state afterwards, so that you can continue to call this method to add the state to
     * other {{#crossLink "Geometry"}}Geometries{{/crossLink}}.
     *
     * @method build
     * @param {Geometry} geometry The target {{#crossLink "Geometry"}}{{/crossLink}}.
     * @returns this
     */
    xeogl.VoxelGeometryBuilder.prototype.build = function (geometry) {

        if (this._dirty) {

            this._geometryBuilder.reset();

            var math = xeogl.math;
            var cell;

            for (var key in this._cells) {
                if (this._cells.hasOwnProperty(key)) {

                    cell = this._cells[key];

                    var x = 1 + cell[0] * this.voxelSize[0];
                    var y = 1 + cell[1] * this.voxelSize[1];
                    var z = 1 + cell[2] * this.voxelSize[2];

                    math.identityMat4(this._matrix);
                    math.scaleMat4c(this.voxelSize[0] * 0.5, this.voxelSize[1] * 0.5, this.voxelSize[2] * 0.5, this._matrix);
                    math.translateMat4c(x, y, z, this._matrix);

                    this._geometryBuilder.setMatrix(this._matrix);
                    this._geometryBuilder.addShape();
                }
            }
        }

        this._geometryBuilder.build(geometry);

        return this;
    };

    /**
     *
     * Resets this VoxelGeometryBuilder, clearing all the state previously accumulated with
     * {{#crossLink "VoxelGeometryBuilder/setVoxel:method"}}setVoxel(){{/crossLink}} and
     * {{#crossLink "VoxelGeometryBuilder/setShape:method"}}setShape(){{/crossLink}}.
     *
     * @method reset
     * @returns this
     */
    xeogl.VoxelGeometryBuilder.prototype.reset = function () {
        this._geometryBuilder.reset();
        this._cells = {};
        this._dirty = false;
        return this;
    };

})();
