import {State} from '../renderer/state.js';
import {ArrayBuffer} from '../renderer/arrayBuffer.js';
import {stats} from './../stats.js';
import {WEBGL_INFO} from './../webglInfo.js';

const CHUNK_LEN = bigIndicesSupported ? (Number.MAX_SAFE_INTEGER / 6) : (64000 * 4); // RGBA is largest item
const memoryStats = stats.memory;
var bigIndicesSupported = WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];
const IndexArrayType = bigIndicesSupported ? Uint32Array : Uint16Array;
const nullVertexBufs = new State({});

class SceneVertexBufs {

    constructor(scene, hasPositions, hasNormals, hasColors, hasUVs, quantized) {

        this.scene = scene;
        this.gl = scene.canvas.gl;
        this.contextLost = false;
        this.geometries = {};
        this.geometryIndicesOffsets = {};
        this.newGeometries = [];
        this.geometryVertexBufs = {};
        this.needRebuild = false;
        this.needAppend = false;
        this.positions = hasPositions ? [] : null;
        this.normals = hasNormals ? [] : null;
        this.colors = hasColors ? [] : null;
        this.uv = hasUVs ? [] : null;
        this.quantized = quantized;
        this.vertexBufs = null;
    }

    addGeometry(geometry) {
        if (!geometry.positions || !geometry.indices) {
            this.scene.warn(`Ignoring geometry with no positions or indices: ${geometry.id}`);
            return;
        }
        this.geometries[geometry.id] = geometry;
        this.geometryIndicesOffsets[geometry.id] = 0; // Will initialize below
        this.newGeometries.push(geometry);
        this.needAppend = true;
    }

    getIndicesOffset(geometry) {
        if (this.needRebuild || this.needAppend) {
            this.build();
        }
        return this.geometryIndicesOffsets[geometry.id];
    }

    getVertexBufs(geometry) {
        if (!this.geometries[geometry.id]) {
            return nullVertexBufs;
        }
        if (this.needRebuild || this.needAppend) {
            this.build();
        }
        return this.geometryVertexBufs[geometry.id];
    }

    setPositions(geometry) {
        const vertexBufs = this.geometryVertexBufs[geometry.id];
        if (!vertexBufs) {
            return;
        }
        if (!geometry.positions) {
            return;
        }
        const positionsBuf = vertexBufs.positionsBuf;
        if (!positionsBuf) {
            return;
        }
        positionsBuf.setData(geometry.positions, this.geometryIndicesOffsets[geometry.id] * 3);
    }

    setNormals(geometry) {
        const vertexBufs = this.geometryVertexBufs[geometry.id];
        if (!vertexBufs) {
            return;
        }
        if (!geometry.normals) {
            return;
        }
        const normalsBuf = vertexBufs.normalsBuf;
        if (!normalsBuf) {
            return;
        }
        normalsBuf.setData(geometry.normals, this.geometryIndicesOffsets[geometry.id] * 3);
    }

    setUVs(geometry) {
        const vertexBufs = this.geometryVertexBufs[geometry.id];
        if (!vertexBufs) {
            return;
        }
        if (!geometry.uv) {
            return;
        }
        const uvBuf = vertexBufs.uvBuf;
        if (!uvBuf) {
            return;
        }
        uvBuf.setData(geometry.uv, this.geometryIndicesOffsets[geometry.id] * 2);
    }

    setColors(geometry) {
        const vertexBufs = this.geometryVertexBufs[geometry.id];
        if (!vertexBufs) {
            return;
        }
        if (!geometry.color) {
            return;
        }
        const colorsBuf = vertexBufs.colorsBuf;
        if (!colorsBuf) {
            return;
        }
        colorsBuf.setData(geometry.colors, this.geometryIndicesOffsets[geometry.id] * 4);
    }

    removeGeometry(geometry) {
        const id = geometry.id;
        if (!this.geometries[id]) {
            return;
        }
        delete this.geometries[id];
        delete this.geometryIndicesOffsets[id];
        if (geometry.indicesBufCombined) {
            geometry.indicesBufCombined.destroy();
        }
        this.needRebuild = true;
    }

    webglContextLost() {
        this.contextLost = true;
    }

    webglContextRestored() {
        if (this.contextLost) {
            for (const id in this.geometries) {
                if (this.geometries.hasOwnProperty(id)) {
                    this.geometries[id].indicesBufCombined = null;
                }
            }
            this.build();
            this.contextLost = false;
        }
    }

    build() {

        const gl = this.scene.canvas.gl;

        this.geometryVertexBufs = {};

        let id;
        let geometry;
        let indicesOffset = 0;

        this.vertexBufs = null;

        let lenPositions = 0;
        let lenNormals = 0;
        let lenUVs = 0;
        let lenColors = 0;

        for (id in this.geometries) {
            if (this.geometries.hasOwnProperty(id)) {
                geometry = this.geometries[id];
                if (this.positions) {
                    lenPositions += geometry.positions.length;
                }
                if (this.normals) {
                    lenNormals += geometry.normals.length;
                }
                if (this.uv) {
                    lenUVs += geometry.uv.length;
                }
                if (this.colors) {
                    lenColors += geometry.uv.length;
                }
            }
        }

        // if (this.positions) {
        //     positions = this.quantized ? new Uint16Array(lenPositions) : new Float32Array(lenPositions);
        // }
        // if (this.normals) {
        //     normals = this.quantized ? new Uint16Array(lenNormals) : new Float32Array(lenNormals);
        // }
        // if (this.uv) {
        //     uv = this.quantized ? new Uint16Array(lenUVs) : new Float32Array(lenUVs);
        // }
        // if (this.colors) {
        //     colors = this.quantized ? new Uint16Array(lenColors) : new Float32Array(lenColors);
        // }

        for (id in this.geometries) {
            if (this.geometries.hasOwnProperty(id)) {

                geometry = this.geometries[id];

                const needNew = (!this.vertexBufs) || (this.positions.length + geometry.positions.length > CHUNK_LEN);

                if (needNew) {
                    if (this.vertexBufs) {
                        this.createBufs(this.vertexBufs);
                    }
                    this.vertexBufs = new State({
                        positionsBuf: null,
                        normalsBuf: null,
                        uvBuf: null,
                        colorsBuf: null,
                        quantized: this.quantized
                    });
                    indicesOffset = 0;
                }

                this.geometryVertexBufs[id] = this.vertexBufs;

                if (this.positions) {
                    for (var i = 0, len = geometry.positions.length; i < len; i++) {
                        this.positions.push(geometry.positions[i]);
                    }
                }

                if (this.normals) {
                    for (var i = 0, len = geometry.normals.length; i < len; i++) {
                        this.normals.push(geometry.normals[i]);
                    }
                }

                if (this.colors) {
                    for (var i = 0, len = geometry.colors.length; i < len; i++) {
                        this.colors.push(geometry.colors[i]);
                    }
                }

                if (this.uv) {
                    for (var i = 0, len = geometry.uv.length; i < len; i++) {
                        this.uv.push(geometry.uv[i]);
                    }
                }

                // Adjust geometry indices

                this.geometryIndicesOffsets[id] = indicesOffset;

                let indices;

                if (indicesOffset) {
                    indices = new (bigIndicesSupported ? Uint32Array : Uint16Array)(geometry.indices);
                    for (var i = 0, len = indices.length; i < len; i++) {
                        indices[i] += indicesOffset;
                        if (indices[i] > (CHUNK_LEN / 3)) {
                            console.error(`out of range: ${indices[i]}`)
                        }
                    }
                } else {
                    indices = geometry.indices;
                }

                // Update indices buffer, lazy-create first if necessary

                if (!geometry.indicesBufCombined) {
                    geometry.indicesBufCombined = new ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices, indices.length, 1, gl.STATIC_DRAW);
                } else {
                    geometry.indicesBufCombined.setData(indices);
                }

                indicesOffset += geometry.positions.length / 3;
            }
        }

        if (this.vertexBufs) {
            this.createBufs(this.vertexBufs);
        }

        this.needRebuild = false;
        this.needAppend = false;
    }

    createBufs(vertexBufs) {
        const gl = this.scene.canvas.gl;
        let array;
        if (this.positions) {
            array = this.quantized ? new Uint16Array(this.positions) : new Float32Array(this.positions);
            vertexBufs.positionsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 3, gl.STATIC_DRAW);
            memoryStats.positions += vertexBufs.positionsBuf.numItems;
            this.positions = [];
        }
        if (this.normals) {
            array = this.quantized ? new Int8Array(this.normals) : new Float32Array(this.normals);
            vertexBufs.normalsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 3, gl.STATIC_DRAW);
            memoryStats.normals += vertexBufs.normalsBuf.numItems;
            this.normals = [];
        }
        if (this.colors) {
            array = new Float32Array(this.colors);
            vertexBufs.colorsBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 4, gl.STATIC_DRAW);
            memoryStats.colors += vertexBufs.colorsBuf.numItems;
            this.colors = [];
        }
        if (this.uv) {
            array = this.quantized ? new Uint16Array(this.uv) : new Float32Array(this.uv);
            vertexBufs.uvBuf = new ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 2, gl.STATIC_DRAW);
            memoryStats.uvs += vertexBufs.uvBuf.numItems;
            this.uv = [];
        }
    }
}

const getSceneVertexBufs = (scene, geometry) => {
    const hasPositions = !!geometry.positions;
    const quantized = !!geometry.quantized;
    const hasNormals = !!geometry.normals;
    const hasColors = !!geometry.colors;
    const hasUVs = !!geometry.uv;
    const hash = ([scene.id, hasPositions ? "p" : "", quantized ? "c" : "", hasNormals ? "n" : "", hasColors ? "c" : "", hasUVs ? "u" : ""]).join(";");
    if (!scene._sceneVertexBufs) {
        scene._sceneVertexBufs = {};
    }
    let sceneVertexBufs = scene._sceneVertexBufs[hash];
    if (!sceneVertexBufs) {
        sceneVertexBufs = new SceneVertexBufs(scene, hasPositions, hasNormals, hasColors, hasUVs, quantized);
        scene._sceneVertexBufs[hash] = sceneVertexBufs;
    }
    return sceneVertexBufs;
};

export {getSceneVertexBufs};