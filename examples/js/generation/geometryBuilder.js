/**
 A **GeometryBuilder** is a builder that you can use to procedurally generate {{#crossLink "Geometry"}}Geometries{{/crossLink}}.

 <a href="../../examples/#geometry_generation_wavyBlocks"><img src="http://i.giphy.com/26gJAMkOxAW5fWlb2.gif"></img></a>

 ## Overview

 * Implements the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern).
 * Helps us improve WebGL performance by combining many shapes into the same {{#crossLink "Geometry"}}Geometries{{/crossLink}},
 thus reducing the number of draw calls.
 * A plain JavaScript class, ie. not a xeogl {{#crossLink "Component"}}{{/crossLink}} subclass.

 ## Examples

 * [Generating a 3D sine wave from boxes](../../examples/#geometry_generation_wavyBlocks)

 ## Usage

 * Works by accumulating additions to an internal buffer of geometry vertex and index arrays.
 * Call {{#crossLink "GeometryBuilder/setShape:method"}}setShape(){{/crossLink}} to set its current mesh, and
 {{#crossLink "GeometryBuilder/setMatrix:method"}}setMatrix(){{/crossLink}} to set its current modelling transform.
 * Then, whenever you call {{#crossLink "GeometryBuilder/addShape:method"}}addShape(){{/crossLink}}, it appends the shape, transformed
 by the matrix, to its internal buffer.
 * Finally, call {{#crossLink "GeometryBuilder/build:method"}}build(){{/crossLink}} to dump its buffer into a target {{#crossLink "Geometry"}}{{/crossLink}}.
 * Retains its buffer so that you can call {{#crossLink "GeometryBuilder/build:method"}}build(){{/crossLink}} again, to dump its
 buffer into other {{#crossLink "Geometry"}}Geometries{{/crossLink}} as needed.
 * Call {{#crossLink "GeometryBuilder/reset:method"}}reset(){{/crossLink}} to empty its buffer.

 In the example below we'll use a GeometryBuilder to create something like the screen capture shown above.

 ````javascript
 // Intatiate a GeometryBuilder; note that it's a
 // plain JavaScript object, not a xeogl Component subtype
 var geometryBuilder = new xeogl.GeometryBuilder();

 // Set the current shape we'll be adding to our GeometryBuilder;
 // this can be a Geometry, or just an object containing vertex and indices arrays.
 geometryBuilder.setShape(new xeogl.BoxGeometry());

 // Now add that shape many times, each time setting a different modelling matrix
 // on the GeometryBuilder. As we do this, we are accumulating geometry in a buffer
 // within the GeometryBuilder.

 var matrix = xeogl.math.mat4();
 var height = 3;
 var height2 = height * 2;
 var x;
 var y;
 var z;
 var size = 200;

 for (x = -size; x <= size; x += 2) {
     for (z = -size; z <= size; z += 2) {

        y = ((Math.sin(x * 0.05) * height + Math.sin(z * 0.05) * height)) + height2;

        xeogl.math.identityMat4(matrix);            // Fresh matrix
        xeogl.math.scaleMat4c(.90, y, .90, matrix); // Post-concatenate scaling
        xeogl.math.translateMat4c(x, y, z, matrix); // Post-concatenate translation

        geometryBuilder.setMatrix(matrix);          // Set the current modeling transform matrix

        geometryBuilder.addShape();                 // Add current shape to the buffer, transformed by the matrix
     }
 }

 var geometry = new xeogl.Geometry();               // Dump the buffer into a Geometry component

 geometryBuilder.build(geometry);

 var mesh = new xeogl.Mesh({                    // Create an Mesh with our Geometry attached
    geometry: geometry,
    material: new xeogl.PhongMaterial({
        diffuse: [0.6, 0.6, 0.7]
    })
 });

 mesh.scene.camera.eye = [-200, 50, -200];   // Set initial Camera position

 new xeogl.CameraControl();                         // Allow camera interaction
 ````
 @class GeometryBuilder
 @module xeogl
 @submodule generation
 @constructor
 */
(function () {

    "use strict";

    xeogl.GeometryBuilder = function () {
        this.reset();
    };

    /**
     * Sets the shape that will be added to this GeometryBuilder on each subsequent call to {{#crossLink "GeometryBuilder/addShape:method"}}addShape(){{/crossLink}}.
     *
     * The shape can be either a {{#crossLink "Geometry"}}{{/crossLink}} or a JavaScript object containing vertex and index arrays.
     *
     * @method setShape
     * @param {Geometry|*} shape The shape to add.
     * @returns this
     */
    xeogl.GeometryBuilder.prototype.setShape = function (shape) {
        this._shape = shape;
        return this;
    };

    /**
     * Sets the modeling transform matrix to apply to each shape added with subsequent calls to {{#crossLink "GeometryBuilder/addShape:method"}}addShape(){{/crossLink}}.
     *
     * @method setMatrix
     * @param {Float32Array} matrix a 16-element transform matrix.
     * @returns this
     */
    xeogl.GeometryBuilder.prototype.setMatrix = function (matrix) {
        this._matrix.set(matrix);
        return this;
    };

    /**
     * Adds a shape to this GeometryBuilder. The shape geometry is the one last added
     * by {{#crossLink "GeometryBuilder/addShape:method"}}addShape(){{/crossLink}}, and will be transformed by the
     * matrix that was set by the last call to {{#crossLink "GeometryBuilder/build:method"}}setMatrix(){{/crossLink}}.
     *
     * A subsequent call to {{#crossLink "GeometryBuilder/build:method"}}build(){{/crossLink}} will add all the
     * accumulated transformed shapes to a target {{#crossLink "Geometry"}}{{/crossLink}}.
     *
     * @method addShape
     * @returns this
     */
    xeogl.GeometryBuilder.prototype.addShape = (function () {

        var math = xeogl.math;

        var tempVec3a = math.vec3();
        var tempVec3b = math.vec3();

        return function () {

            var i;
            var len;
            var indicesBump = (this._positions) ? (this._positions.length / 3) : 0;

            if (this._shape.positions) {

                if (!this._positions) {
                    this._positions = [];
                }

                var positions = this._shape.positions;

                if (!this._matrix) {

                    for (i = 0, len = positions.length; i < len; i++) {
                        this._positions.push(positions[i]);
                    }

                } else {

                    for (i = 0, len = positions.length; i < len; i += 3) {

                        tempVec3a[0] = positions[i + 0];
                        tempVec3a[1] = positions[i + 1];
                        tempVec3a[2] = positions[i + 2];

                        math.transformPoint3(this._matrix, tempVec3a, tempVec3b);

                        this._positions.push(tempVec3b[0]);
                        this._positions.push(tempVec3b[1]);
                        this._positions.push(tempVec3b[2]);
                    }
                }
            }

            if (this._shape.normals) {
                if (!this._normals) {
                    this._normals = [];
                }
                for (i = 0, len = this._shape.normals.length; i < len; i++) {
                    this._normals.push(this._shape.normals[i]);
                }
            }

            if (this._shape.uv) {
                if (!this._uv) {
                    this._uv = [];
                }
                for (i = 0, len = this._shape.uv.length; i < len; i++) {
                    this._uv.push(this._shape.uv[i]);
                }
            }

            if (this._shape.colors) {
                if (!this._colors) {
                    this._colors = [];
                }
                for (i = 0, len = this._shape.colors.length; i < len; i++) {
                    this._colors.push(this._shape.colors[i]);
                }
            }

            if (this._shape.indices) {
                if (!this._indices) {
                    this._indices = [];
                }
                for (i = 0, len = this._shape.indices.length; i < len; i++) {
                    this._indices.push(this._shape.indices[i] + indicesBump);
                }
            }
        };
    })();

    /**
     * Returns the accumulated state from previous calls to {{#crossLink "GeometryBuilder/setMatrix:method"}}setMatrix(){{/crossLink}} and
     * {{#crossLink "GeometryBuilder/setShape:method"}}setShape(){{/crossLink}}.
     *
     * Retains all that state afterwards, so that you can continue to call this method to add the state to
     * other {{#crossLink "Geometry"}}Geometries{{/crossLink}}.
     *
     * @method build
     * @returns {Object}
     */
    xeogl.GeometryBuilder.prototype.build = function (geometry) {
        return {
            primitive: this.primitive || "triangles",
            positions: this._positions,
            normals: this._normals,
            uv: this._uv,
            colors: this._colors,
            indices: this._indices
        };
    };

    /**
     *
     * Resets this GeometryBuilder, clearing all the state previously accumulated with {{#crossLink "GeometryBuilder/setMatrix:method"}}setMatrix(){{/crossLink}} and
     * {{#crossLink "GeometryBuilder/setShape:method"}}setShape(){{/crossLink}}.
     * @method reset
     * @returns this
     */
    xeogl.GeometryBuilder.prototype.reset = function () {
        this._positions = null;
        this._normals = null;
        this._uv = null;
        this._colors = null;
        this._indices = null;
        this._matrix = xeogl.math.identityMat4(xeogl.math.mat4());
        return this;
    };

})();
