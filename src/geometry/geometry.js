/**
 A **Geometry** defines a mesh for attached {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 ## Usage

 * [Geometry compression](#geometry-compression)
 * [Geometry batching](#geometry-batching)

 ### Geometry compression

 Geometries may be automatically quantized to reduce memory and GPU bus usage. Usually, geometry attributes such as positions
 and normals are stored as 32-bit floating-point numbers. Quantization compresses those attributes to 16-bit integers
 represented on a scale between the minimum and maximum values. Decompression is then done on the GPU, via a simple
 matrix multiplication in the vertex shader.

 #### Disabling

 Since each normal vector is oct-encoded into two 8-bit unsigned integers, this can cause them to lose precision, which
 may affect the accuracy of any operations that rely on them being perfectly perpendicular to their surfaces. In such
 cases, you may need to disable compression for your geometries and models:

 ````javascript
 // Disable geometry compression when loading a Model
 var model = new xeogl.GLTFModel({
    src: "models/gltf/modern_office/scene.gltf",
    quantizeGeometry: false // Default is true
});

 // Disable compression when creating a Geometry
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry({
        quantized: false // Default is false
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    })
 });
 ````

 ### Geometry batching

 Geometries are automatically combined into the same vertex buffer objects (VBOs) so that we reduce the number of VBO
 binds done by WebGL on each frame. VBO binds are expensive, so this really makes a difference when we have large numbers
 of Meshes that share similar Materials (as is often the case in CAD rendering).

 #### Disabling

 Since combined VBOs need to be rebuilt whenever we destroy a Geometry, we can disable this optimization for individual
 Models and Geometries when we know that we'll be continually creating and destroying them.

 ````javascript
 // Disable VBO combination for a GLTFModel
 var model = new xeogl.GLTFModel({
    src: "models/gltf/modern_office/scene.gltf",
    combinedGeometry: false // Default is true
});

 // Disable VBO combination for an individual Geometry
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry({
        combined: false // Default is false
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    })
 });
 ````

 @class Geometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Geometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.positions] {Array of Number} Positions array.
 @param [cfg.normals] {Array of Number} Vertex normal vectors array.
 @param [cfg.uv] {Array of Number} UVs array.
 @param [cfg.colors] {Array of Number} Vertex colors.
 @param [cfg.indices] {Array of Number} Indices array.
 @param [cfg.autoVertexNormals=false] {Boolean} Set true to automatically generate normal vectors from the positions and
 indices, if those are supplied.
 @param [cfg.quantized=false] {Boolean} Stores positions, colors, normals and UVs in quantized and oct-encoded formats
 for reduced memory footprint and GPU bus usage.
 @param [cfg.combined=false] {Boolean} Combines positions, colors, normals and UVs into the same WebGL vertex buffers
 with other Geometries, in order to reduce the number of buffer binds performed per frame.
 @param [cfg.edgeThreshold=2] {Number} When a {{#crossLink "Mesh"}}{{/crossLink}} renders this Geometry as wireframe,
 this indicates the threshold angle (in degrees) between the face normals of adjacent triangles below which the edge is discarded.
 @extends Component
 */

import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {ArrayBuffer} from '../renderer/arrayBuffer.js';
import {getSceneVertexBufs} from './sceneVertexBufs.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Geometry";

const memoryStats = stats.memory;
var bigIndicesSupported = WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];
const IndexArrayType = bigIndicesSupported ? Uint32Array : Uint16Array;
const nullVertexBufs = new State({});
const tempAABB = math.AABB3();

class Geometry extends Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

        super.init(cfg);

        const self = this;

        this._state = new State({ // Arrays for emphasis effects are got from xeogl.Geometry friend methods
            combined: !!cfg.combined,
            quantized: !!cfg.quantized,
            autoVertexNormals: !!cfg.autoVertexNormals,
            primitive: null, // WebGL enum
            primitiveName: null, // String
            positions: null,    // Uint16Array when quantized == true, else Float32Array
            normals: null,      // Uint8Array when quantized == true, else Float32Array
            colors: null,
            uv: null,           // Uint8Array when quantized == true, else Float32Array
            indices: null,
            positionsDecodeMatrix: null, // Set when quantized == true
            uvDecodeMatrix: null, // Set when quantized == true
            positionsBuf: null,
            normalsBuf: null,
            colorsbuf: null,
            uvBuf: null,
            indicesBuf: null,
            indicesBufCombined: null, // Indices into a shared VertexBufs, set when combined == true
            hash: ""
        });

        this._edgeThreshold = cfg.edgeThreshold || 2.0;

        // Lazy-generated VBOs

        this._edgesIndicesBuf = null;
        this._pickTrianglePositionsBuf = null;
        this._pickTriangleColorsBuf = null;

        // Local-space Boundary3D

        this._boundaryDirty = true;

        this._aabb = null;
        this._aabbDirty = true;

        this._obb = null;
        this._obbDirty = true;

        const state = this._state;
        const gl = this.scene.canvas.gl;

        // Primitive type

        cfg.primitive = cfg.primitive || "triangles";
        switch (cfg.primitive) {
            case "points":
                state.primitive = gl.POINTS;
                state.primitiveName = cfg.primitive;
                break;
            case "lines":
                state.primitive = gl.LINES;
                state.primitiveName = cfg.primitive;
                break;
            case "line-loop":
                state.primitive = gl.LINE_LOOP;
                state.primitiveName = cfg.primitive;
                break;
            case "line-strip":
                state.primitive = gl.LINE_STRIP;
                state.primitiveName = cfg.primitive;
                break;
            case "triangles":
                state.primitive = gl.TRIANGLES;
                state.primitiveName = cfg.primitive;
                break;
            case "triangle-strip":
                state.primitive = gl.TRIANGLE_STRIP;
                state.primitiveName = cfg.primitive;
                break;
            case "triangle-fan":
                state.primitive = gl.TRIANGLE_FAN;
                state.primitiveName = cfg.primitive;
                break;
            default:
                this.error("Unsupported value for 'primitive': '" + cfg.primitive +
                    "' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', " +
                    "'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.");
                state.primitive = gl.TRIANGLES;
                state.primitiveName = cfg.primitive;
        }

        if (cfg.positions) {
            if (this._state.quantized) {
                var bounds = getBounds(cfg.positions, 3);
                var quantized = quantizeVec3(cfg.positions, bounds.min, bounds.max);
                state.positions = quantized.quantized;
                state.positionsDecodeMatrix = quantized.decode;
            } else {
                state.positions = cfg.positions.constructor === Float32Array ? cfg.positions : new Float32Array(cfg.positions);
            }
        }
        if (cfg.colors) {
            state.colors = cfg.colors.constructor === Float32Array ? cfg.colors : new Float32Array(cfg.colors);
        }
        if (cfg.uv) {
            if (this._state.quantized) {
                var bounds = getBounds(cfg.uv, 2);
                var quantized = quantizeVec2(cfg.uv, bounds.min, bounds.max);
                state.uv = quantized.quantized;
                state.uvDecodeMatrix = quantized.decode;
            } else {
                state.uv = cfg.uv.constructor === Float32Array ? cfg.uv : new Float32Array(cfg.uv);
            }
        }
        if (cfg.normals) {
            if (this._state.quantized) {
                state.normals = octEncode(cfg.normals);
            } else {
                state.normals = cfg.normals.constructor === Float32Array ? cfg.normals : new Float32Array(cfg.normals);
            }
        }
        if (cfg.indices) {
            if (!bigIndicesSupported && cfg.indices.constructor === Uint32Array) {
                this.error("This WebGL implementation does not support Uint32Array");
                return;
            }
            state.indices = (cfg.indices.constructor === Uint32Array || cfg.indices.constructor === Uint16Array) ? cfg.indices : new IndexArrayType(cfg.indices);
        }

        if (state.indices) {
            state.indicesBuf = new ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, state.indices, state.indices.length, 1, gl.STATIC_DRAW);
            memoryStats.indices += state.indicesBuf.numItems;
        }

        this._buildHash();

        memoryStats.meshes++;

        if (this._state.combined) {
            this._sceneVertexBufs = getSceneVertexBufs(this.scene, this._state);
            this._sceneVertexBufs.addGeometry(this._state);
        }

        this._buildVBOs();

        self.fire("created", this.created = true);
    }

    _buildVBOs() {
        const state = this._state;
        const gl = this.scene.canvas.gl;
        if (state.indices) {
            state.indicesBuf = new ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, state.indices, state.indices.length, 1, gl.STATIC_DRAW);
            memoryStats.indices += state.indicesBuf.numItems;
        }
        if (state.combined) {
            if (state.indices) {
                // indicesBufCombined is created when VertexBufs are built for this Geometry
            }
        } else {
            if (state.positions) {
                state.positionsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, state.positions, state.positions.length, 3, gl.STATIC_DRAW);
                memoryStats.positions += state.positionsBuf.numItems;
            }
            if (state.normals) {
                state.normalsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, state.normals, state.normals.length, 3, gl.STATIC_DRAW);
                memoryStats.normals += state.normalsBuf.numItems;
            }
            if (state.colors) {
                state.colorsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, state.colors, state.colors.length, 4, gl.STATIC_DRAW);
                memoryStats.colors += state.colorsBuf.numItems;
            }
            if (state.uv) {
                state.uvBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, state.uv, state.uv.length, 2, gl.STATIC_DRAW);
                memoryStats.uvs += state.uvBuf.numItems;
            }
        }
    }

    _buildHash() {
        const state = this._state;
        const hash = ["/g"];
        hash.push("/" + state.primitive + ";");
        if (state.positions) {
            hash.push("p");
        }
        if (state.colors) {
            hash.push("c");
        }
        if (state.normals || state.autoVertexNormals) {
            hash.push("n");
        }
        if (state.uv) {
            hash.push("u");
        }
        if (state.quantized) {
            hash.push("cp");
        }
        hash.push(";");
        state.hash = hash.join("");
    }

    _getEdgesIndices() {
        if (!this._edgesIndicesBuf) {
            this._buildEdgesIndices();
        }
        return this._edgesIndicesBuf;
    }

    _getPickTrianglePositions() {
        if (!this._pickTrianglePositionsBuf) {
            this._buildPickTriangleVBOs();
        }
        return this._pickTrianglePositionsBuf;
    }

    _getPickTriangleColors() {
        if (!this._pickTriangleColorsBuf) {
            this._buildPickTriangleVBOs();
        }
        return this._pickTriangleColorsBuf;
    }

    _buildEdgesIndices() { // FIXME: Does not adjust indices after other objects are deleted from vertex buffer!!
        const state = this._state;
        if (!state.positions || !state.indices) {
            return;
        }
        const gl = this.scene.canvas.gl;
        const edgesIndices = buildEdgesIndices(state.positions, state.indices, state.positionsDecodeMatrix, this._edgeThreshold, state.combined);
        if (state.combined) {
            const indicesOffset = this._sceneVertexBufs.getIndicesOffset(state);
            for (let i = 0, len = edgesIndices.length; i < len; i++) {
                edgesIndices[i] += indicesOffset;
            }
        }
        this._edgesIndicesBuf = new ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, edgesIndices, edgesIndices.length, 1, gl.STATIC_DRAW);
        memoryStats.indices += this._edgesIndicesBuf.numItems;
    }

    _buildPickTriangleVBOs() { // Builds positions and indices arrays that allow each triangle to have a unique color
        const state = this._state;
        if (!state.positions || !state.indices) {
            return;
        }
        const gl = this.scene.canvas.gl;
        const arrays = math.buildPickTriangles(state.positions, state.indices, state.quantized);
        const positions = arrays.positions;
        const colors = arrays.colors;
        this._pickTrianglePositionsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, positions, positions.length, 3, gl.STATIC_DRAW);
        this._pickTriangleColorsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, colors, colors.length, 4, gl.STATIC_DRAW, true);
        memoryStats.positions += this._pickTrianglePositionsBuf.numItems;
        memoryStats.colors += this._pickTriangleColorsBuf.numItems;
    }

    _buildPickVertexVBOs() {
        // var state = this._state;
        // if (!state.positions || !state.indices) {
        //     return;
        // }
        // var gl = this.scene.canvas.gl;
        // var arrays = math.buildPickVertices(state.positions, state.indices, state.quantized);
        // var pickVertexPositions = arrays.positions;
        // var pickColors = arrays.colors;
        // this._pickVertexPositionsBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickVertexPositions, pickVertexPositions.length, 3, gl.STATIC_DRAW);
        // this._pickVertexColorsBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickColors, pickColors.length, 4, gl.STATIC_DRAW, true);
        // memoryStats.positions += this._pickVertexPositionsBuf.numItems;
        // memoryStats.colors += this._pickVertexColorsBuf.numItems;
    }

    _webglContextLost() {
        if (this._sceneVertexBufs) {
            this._sceneVertexBufs.webglContextLost();
        }
    }

    _webglContextRestored() {
        if (this._sceneVertexBufs) {
            this._sceneVertexBufs.webglContextRestored();
        }
        this._buildVBOs();
        this._edgesIndicesBuf = null;
        this._pickVertexPositionsBuf = null;
        this._pickTrianglePositionsBuf = null;
        this._pickTriangleColorsBuf = null;
        this._pickVertexPositionsBuf = null;
        this._pickVertexColorsBuf = null;
    }

    /**
     The Geometry's primitive type.

     Valid types are: 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.

     @property primitive
     @default "triangles"
     @type String
     */
    get primitive() {
        return this._state.primitiveName;
    }

    /**
     Indicates if this Geometry is quantized.

     Compression is an internally-performed optimization which stores positions, colors, normals and UVs
     in quantized and oct-encoded formats for reduced memory footprint and GPU bus usage.

     Quantized geometry may not be updated.

     @property quantized
     @default false
     @type Boolean
     @final
     */
    get quantized() {
        return this._state.quantized;
    }

    /**
     Indicates if this Geometry is combined.

     Combination is an internally-performed optimization which combines positions, colors, normals and UVs into
     the same WebGL vertex buffers with other Geometries, in order to reduce the number of buffer binds
     performed per frame.

     @property combined
     @default false
     @type Boolean
     @final
     */
    get combined() {
        return this._state.combined;
    }

    /**
     The Geometry's vertex positions.

     @property positions
     @default null
     @type Float32Array
     */
    get positions() {
        if (!this._state.positions) {
            return;
        }
        if (!this._state.quantized) {
            return this._state.positions;
        }
        if (!this._decompressedPositions) {
            this._decompressedPositions = new Float32Array(this._state.positions.length);
            math.decompressPositions(this._state.positions, this._state.positionsDecodeMatrix, this._decompressedPositions);
        }
        return this._decompressedPositions;
    }

    set positions(newPositions) {
        const state = this._state;
        const positions = state.positions;
        if (!positions) {
            this.error("can't update geometry positions - geometry has no positions");
            return;
        }
        if (positions.length !== newPositions.length) {
            this.error("can't update geometry positions - new positions are wrong length");
            return;
        }
        if (this._state.quantized) {
            const bounds = getBounds(newPositions, 3);
            const quantized = quantizeVec3(newPositions, bounds.min, bounds.max);
            newPositions = quantized.quantized; // TODO: Copy in-place
            state.positionsDecodeMatrix = quantized.decode;
        }
        positions.set(newPositions);
        if (state.positionsBuf) {
            state.positionsBuf.setData(positions);
        }
        if (this._state.combined) {
            this._sceneVertexBufs.setPositions(state);
        }
        this._setBoundaryDirty();
        this._renderer.imageDirty();
    }

    /**
     The Geometry's vertex normals.

     @property normals
     @default null
     @type Float32Array
     */
    get normals() {
        if (!this._state.normals) {
            return;
        }
        if (!this._state.quantized) {
            return this._state.normals;
        }
        if (!this._decompressedNormals) {
            const lenCompressed = this._state.normals.length;
            const lenDecompressed = lenCompressed + (lenCompressed / 2); // 2 -> 3
            this._decompressedNormals = new Float32Array(lenDecompressed);
            math.octDecodeVec2s(this._state.normals, this._decompressedNormals);
        }
        return this._decompressedNormals;
    }

    set normals(newNormals) {
        if (this._state.quantized) {
            this.error("can't update geometry normals - quantized geometry is immutable"); // But will be eventually
            return;
        }
        const state = this._state;
        const normals = state.normals;
        if (!normals) {
            this.error("can't update geometry normals - geometry has no normals");
            return;
        }
        if (normals.length !== newNormals.length) {
            this.error("can't update geometry normals - new normals are wrong length");
            return;
        }
        normals.set(newNormals);
        if (state.normalsBuf) {
            state.normalsBuf.setData(normals);
        }
        if (this._state.combined) {
            this._sceneVertexBufs.setNormals(state);
        }
        this._renderer.imageDirty();
    }


    /**
     The Geometry's UV coordinates.

     @property uv
     @default null
     @type Float32Array
     */
    get uv() {
        if (!this._state.uv) {
            return;
        }
        if (!this._state.quantized) {
            return this._state.uv;
        }
        if (!this._decompressedUV) {
            this._decompressedUV = new Float32Array(this._state.uv.length);
            math.decompressUVs(this._state.uv, this._state.uvDecodeMatrix, this._decompressedUV);
        }
        return this._decompressedUV;
    }

    set uv(newUV) {
        if (this._state.quantized) {
            this.error("can't update geometry UVs - quantized geometry is immutable"); // But will be eventually
            return;
        }
        const state = this._state;
        const uv = state.uv;
        if (!uv) {
            this.error("can't update geometry UVs - geometry has no UVs");
            return;
        }
        if (uv.length !== newUV.length) {
            this.error("can't update geometry UVs - new UVs are wrong length");
            return;
        }
        uv.set(newUV);
        if (state.uvBuf) {
            state.uvBuf.setData(uv);
        }
        if (this._state.combined) {
            this._sceneVertexBufs.setUVs(state);
        }
        this._renderer.imageDirty();
    }

    /**
     The Geometry's vertex colors.

     @property colors
     @default null
     @type Float32Array
     */
    get colors() {
        return this._state.colors;
    }

    set colors(newColors) {
        if (this._state.quantized) {
            this.error("can't update geometry colors - quantized geometry is immutable"); // But will be eventually
            return;
        }
        const state = this._state;
        const colors = state.colors;
        if (!colors) {
            this.error("can't update geometry colors - geometry has no colors");
            return;
        }
        if (colors.length !== newColors.length) {
            this.error("can't update geometry colors - new colors are wrong length");
            return;
        }
        colors.set(newColors);
        if (state.colorsBuf) {
            state.colorsBuf.setData(colors);
        }
        if (this._state.combined) {
            this._sceneVertexBufs.setColors(state);
        }
        this._renderer.imageDirty();
    }

    /**
     The Geometry's indices.

     If ````xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]```` is true, then this can be
     a ````Uint32Array````, otherwise it needs to be a ````Uint16Array````.

     @property indices
     @default null
     @type Uint16Array | Uint32Array
     @final
     */
    get indices() {
        return this._state.indices;
    }

    /**
     * Local-space axis-aligned 3D boundary (AABB) of this geometry.
     *
     * The AABB is represented by a six-element Float32Array containing the min/max extents of the
     * axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.
     *
     * @property aabb
     * @final
     * @type {Float32Array}
     */
    get aabb() {
        if (this._aabbDirty) {
            if (!this._aabb) {
                this._aabb = math.AABB3();
            }
            math.positions3ToAABB3(this._state.positions, this._aabb, this._state.positionsDecodeMatrix);
            this._aabbDirty = false;
        }
        return this._aabb;
    }

    /**
     * Local-space oriented 3D boundary (OBB) of this geometry.
     *
     * The OBB is represented by a 32-element Float32Array containing the eight vertices of the box,
     * where each vertex is a homogeneous coordinate having [x,y,z,w] elements.
     *
     * @property obb
     * @final
     * @type {Float32Array}
     */
    get obb() {
        if (this._obbDirty) {
            if (!this._obb) {
                this._obb = math.OBB3();
            }
            math.positions3ToAABB3(this._state.positions, tempAABB, this._state.positionsDecodeMatrix);
            math.AABB3ToOBB3(tempAABB, this._obb);
            this._obbDirty = false;
        }
        return this._obb;
    }

    get kdtree() {
        const state = this._state;
        if (!state.indices || !state.positions) {
            this.error("Can't provide a KD-tree: no indices/positions");
            return;
        }
        if (!this._kdtree) {
            this._kdtree = math.buildKDTree(state.indices, state.positions, this._state.positionsDecodeMatrix);
        }
        return this._kdtree;
    }

    _setBoundaryDirty() {
        if (this._boundaryDirty) {
            return;
        }
        this._boundaryDirty = true;
        this._aabbDirty = true;
        this._obbDirty = true;

        /**
         Fired whenever this Geometry's boundary changes.

         Get the latest boundary from the Geometry's {{#crossLink "Geometry/aabb:property"}}{{/crossLink}}
         and {{#crossLink "Geometry/obb:property"}}{{/crossLink}} properties.

         @event boundary

         */
        this.fire("boundary");
    }

    _getState() {
        return this._state;
    }

    _getVertexBufs() {
        return this._state && this._state.combined ? this._sceneVertexBufs.getVertexBufs(this._state) : nullVertexBufs;
    }

    destroy() {
        super.destroy();
        const state = this._state;
        if (state.indicesBuf) {
            state.indicesBuf.destroy();
        }
        if (this._edgesIndicesBuf) {
            this._edgesIndicesBuf.destroy();
        }
        if (this._pickTrianglePositionsBuf) {
            this._pickTrianglePositionsBuf.destroy();
        }
        if (this._pickTriangleColorsBuf) {
            this._pickTriangleColorsBuf.destroy();
        }
        if (this._pickVertexPositionsBuf) {
            this._pickVertexPositionsBuf.destroy();
        }
        if (this._pickVertexColorsBuf) {
            this._pickVertexColorsBuf.destroy();
        }
        if (this._state.combined) {
            this._sceneVertexBufs.removeGeometry(state);
        }
        state.destroy();
        memoryStats.meshes--;
    }
}

function getBounds(array, stride) {
    const min = new Float32Array(stride);
    const max = new Float32Array(stride);
    let i, j;
    for (i = 0; i < stride; i++) {
        min[i] = Number.MAX_VALUE;
        max[i] = -Number.MAX_VALUE;
    }
    for (i = 0; i < array.length; i += stride) {
        for (j = 0; j < stride; j++) {
            min[j] = Math.min(min[j], array[i + j]);
            max[j] = Math.max(max[j], array[i + j]);
        }
    }
    return {
        min: min,
        max: max
    };
}

// http://cg.postech.ac.kr/research/mesh_comp_mobile/mesh_comp_mobile_conference.pdf
var quantizeVec3 = (function () {
    const translate = math.mat4();
    const scale = math.mat4();
    return function (array, min, max) {
        const quantized = new Uint16Array(array.length);
        const multiplier = new Float32Array([
            65535 / (max[0] - min[0]),
            65535 / (max[1] - min[1]),
            65535 / (max[2] - min[2])
        ]);
        let i;
        for (i = 0; i < array.length; i += 3) {
            quantized[i + 0] = Math.floor((array[i + 0] - min[0]) * multiplier[0]);
            quantized[i + 1] = Math.floor((array[i + 1] - min[1]) * multiplier[1]);
            quantized[i + 2] = Math.floor((array[i + 2] - min[2]) * multiplier[2]);
        }
        math.identityMat4(translate);
        math.translationMat4v(min, translate);
        math.identityMat4(scale);
        math.scalingMat4v([
            (max[0] - min[0]) / 65535,
            (max[1] - min[1]) / 65535,
            (max[2] - min[2]) / 65535
        ], scale);
        const decodeMat = math.mulMat4(translate, scale, math.identityMat4());
        return {
            quantized: quantized,
            decode: decodeMat
        };
    };
})();

var quantizeVec2 = (function () {
    const translate = math.mat3();
    const scale = math.mat3();
    return function (array, min, max) {
        const quantized = new Uint16Array(array.length);
        const multiplier = new Float32Array([
            65535 / (max[0] - min[0]),
            65535 / (max[1] - min[1])
        ]);
        let i;
        for (i = 0; i < array.length; i += 2) {
            quantized[i + 0] = Math.floor((array[i + 0] - min[0]) * multiplier[0]);
            quantized[i + 1] = Math.floor((array[i + 1] - min[1]) * multiplier[1]);
        }
        math.identityMat3(translate);
        math.translationMat3v(min, translate);
        math.identityMat3(scale);
        math.scalingMat3v([
            (max[0] - min[0]) / 65535,
            (max[1] - min[1]) / 65535
        ], scale);
        const decodeMat = math.mulMat3(translate, scale, math.identityMat3());
        return {
            quantized: quantized,
            decode: decodeMat
        };
    };
})();

// http://jcgt.org/published/0003/02/01/
function octEncode(array) {
    const encoded = new Int8Array(array.length * 2 / 3);
    let oct, dec, best, currentCos, bestCos;
    let i, ei;
    for (i = 0, ei = 0; i < array.length; i += 3, ei += 2) {
        // Test various combinations of ceil and floor
        // to minimize rounding errors
        best = oct = octEncodeVec3(array, i, "floor", "floor");
        dec = octDecodeVec2(oct);
        currentCos = bestCos = dot(array, i, dec);
        oct = octEncodeVec3(array, i, "ceil", "floor");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "floor", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "ceil", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        encoded[ei] = best[0];
        encoded[ei + 1] = best[1];
    }
    return encoded;
}

// Oct-encode single normal vector in 2 bytes
function octEncodeVec3(array, i, xfunc, yfunc) {
    let x = array[i] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    let y = array[i + 1] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    if (array[i + 2] < 0) {
        let tempx = x;
        let tempy = y;
        tempx = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        tempy = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
        x = tempx;
        y = tempy;
    }
    return new Int8Array([
        Math[xfunc](x * 127.5 + (x < 0 ? -1 : 0)),
        Math[yfunc](y * 127.5 + (y < 0 ? -1 : 0))
    ]);
}

// Decode an oct-encoded normal
function octDecodeVec2(oct) {
    let x = oct[0];
    let y = oct[1];
    x /= x < 0 ? 127 : 128;
    y /= y < 0 ? 127 : 128;
    const z = 1 - Math.abs(x) - Math.abs(y);
    if (z < 0) {
        x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        y = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
    }
    const length = Math.sqrt(x * x + y * y + z * z);
    return [
        x / length,
        y / length,
        z / length
    ];
}

// Dot product of a normal in an array against a candidate decoding
function dot(array, i, vec3) {
    return array[i] * vec3[0] + array[i + 1] * vec3[1] + array[i + 2] * vec3[2];
}

var buildEdgesIndices = (function () {

    // TODO: Optimize with caching, but need to cater to both compressed and uncompressed positions

    const uniquePositions = [];
    const indicesLookup = [];
    const indicesReverseLookup = [];
    const weldedIndices = [];

    function weldVertices(positions, indices) {
        const positionsMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
        let vx;
        let vy;
        let vz;
        let key;
        const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
        const precision = Math.pow(10, precisionPoints);
        let i;
        let len;
        let lenUniquePositions = 0;
        for (i = 0, len = positions.length; i < len; i += 3) {
            vx = positions[i];
            vy = positions[i + 1];
            vz = positions[i + 2];
            key = Math.round(vx * precision) + '_' + Math.round(vy * precision) + '_' + Math.round(vz * precision);
            if (positionsMap[key] === undefined) {
                positionsMap[key] = lenUniquePositions / 3;
                uniquePositions[lenUniquePositions++] = vx;
                uniquePositions[lenUniquePositions++] = vy;
                uniquePositions[lenUniquePositions++] = vz;
            }
            indicesLookup[i / 3] = positionsMap[key];
        }
        for (i = 0, len = indices.length; i < len; i++) {
            weldedIndices[i] = indicesLookup[indices[i]];
            indicesReverseLookup[weldedIndices[i]] = indices[i];
        }
    }

    const faces = [];
    let numFaces = 0;
    const compa = new Uint16Array(3);
    const compb = new Uint16Array(3);
    const compc = new Uint16Array(3);
    const a = math.vec3();
    const b = math.vec3();
    const c = math.vec3();
    const cb = math.vec3();
    const ab = math.vec3();
    const cross = math.vec3();
    const normal = math.vec3();

    function buildFaces(numIndices, positionsDecodeMatrix) {
        numFaces = 0;
        for (let i = 0, len = numIndices; i < len; i += 3) {
            const ia = ((weldedIndices[i]) * 3);
            const ib = ((weldedIndices[i + 1]) * 3);
            const ic = ((weldedIndices[i + 2]) * 3);
            if (positionsDecodeMatrix) {
                compa[0] = uniquePositions[ia];
                compa[1] = uniquePositions[ia + 1];
                compa[2] = uniquePositions[ia + 2];
                compb[0] = uniquePositions[ib];
                compb[1] = uniquePositions[ib + 1];
                compb[2] = uniquePositions[ib + 2];
                compc[0] = uniquePositions[ic];
                compc[1] = uniquePositions[ic + 1];
                compc[2] = uniquePositions[ic + 2];
                // Decode
                math.decompressPosition(compa, positionsDecodeMatrix, a);
                math.decompressPosition(compb, positionsDecodeMatrix, b);
                math.decompressPosition(compc, positionsDecodeMatrix, c);
            } else {
                a[0] = uniquePositions[ia];
                a[1] = uniquePositions[ia + 1];
                a[2] = uniquePositions[ia + 2];
                b[0] = uniquePositions[ib];
                b[1] = uniquePositions[ib + 1];
                b[2] = uniquePositions[ib + 2];
                c[0] = uniquePositions[ic];
                c[1] = uniquePositions[ic + 1];
                c[2] = uniquePositions[ic + 2];
            }
            math.subVec3(c, b, cb);
            math.subVec3(a, b, ab);
            math.cross3Vec3(cb, ab, cross);
            math.normalizeVec3(cross, normal);
            const face = faces[numFaces] || (faces[numFaces] = {normal: math.vec3()});
            face.normal[0] = normal[0];
            face.normal[1] = normal[1];
            face.normal[2] = normal[2];
            numFaces++;
        }
    }

    return function (positions, indices, positionsDecodeMatrix, edgeThreshold, combined) {
        weldVertices(positions, indices);
        buildFaces(indices.length, positionsDecodeMatrix);
        const edgeIndices = [];
        const thresholdDot = Math.cos(math.DEGTORAD * edgeThreshold);
        const edges = {};
        let edge1;
        let edge2;
        let index1;
        let index2;
        let key;
        let largeIndex = false;
        let edge;
        let normal1;
        let normal2;
        let dot;
        let ia;
        let ib;
        for (let i = 0, len = indices.length; i < len; i += 3) {
            const faceIndex = i / 3;
            for (let j = 0; j < 3; j++) {
                edge1 = weldedIndices[i + j];
                edge2 = weldedIndices[i + ((j + 1) % 3)];
                index1 = Math.min(edge1, edge2);
                index2 = Math.max(edge1, edge2);
                key = index1 + "," + index2;
                if (edges[key] === undefined) {
                    edges[key] = {
                        index1: index1,
                        index2: index2,
                        face1: faceIndex,
                        face2: undefined
                    };
                } else {
                    edges[key].face2 = faceIndex;
                }
            }
        }
        for (key in edges) {
            edge = edges[key];
            // an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
            if (edge.face2 !== undefined) {
                normal1 = faces[edge.face1].normal;
                normal2 = faces[edge.face2].normal;
                dot = math.dotVec3(normal1, normal2);
                if (dot > thresholdDot) {
                    continue;
                }
            }
            ia = indicesReverseLookup[edge.index1];
            ib = indicesReverseLookup[edge.index2];
            if (!largeIndex && ia > 65535 || ib > 65535) {
                largeIndex = true;
            }
            edgeIndices.push(ia);
            edgeIndices.push(ib);
        }
        return (largeIndex || combined) ? new Uint32Array(edgeIndices) : new Uint16Array(edgeIndices);
    };
})();

componentClasses[type] = Geometry;

export {Geometry};