(function () {

    const CHUNK_LEN = bigIndicesSupported ? (Number.MAX_SAFE_INTEGER / 6) : (64000 * 4); // RGBA is largest item
    const memoryStats = xeogl.stats.memory;
    var bigIndicesSupported = xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];
    const IndexArrayType = bigIndicesSupported ? Uint32Array : Uint16Array;
    const nullVertexBufs = new xeogl.renderer.State({});

    xeogl.SceneVertexBufs = function (scene, hasPositions, hasNormals, hasColors, hasUVs, quantized) {

        const gl = scene.canvas.gl;
        let contextLost = false;
        const geometries = {};
        const geometryIndicesOffsets = {};
        const newGeometries = [];
        let geometryVertexBufs = {};
        let needRebuild = false;
        let needAppend = false;
        let positions = [];
        let normals = [];
        let colors = [];
        let uv = [];
        let vertexBufs = null;

        this.addGeometry = function (geometry) {
            if (!geometry.positions || !geometry.indices) {
                scene.warn("Ignoring geometry with no positions or indices: " + geometry.id);
                return;
            }
            geometries[geometry.id] = geometry;
            geometryIndicesOffsets[geometry.id] = 0; // Will initialize below
            newGeometries.push(geometry);
            needAppend = true;
        };

        this.getIndicesOffset = function (geometry) {
            if (needRebuild || needAppend) {
                build();
            }
            return geometryIndicesOffsets[geometry.id];
        };

        this.getVertexBufs = function (geometry) {
            if (!geometries[geometry.id]) {
                return nullVertexBufs;
            }
            if (needRebuild || needAppend) {
                build();
            }
            return geometryVertexBufs[geometry.id];
        };

        this.setPositions = function (geometry) {
            const vertexBufs = geometryVertexBufs[geometry.id];
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
            positionsBuf.setData(geometry.positions, geometryIndicesOffsets[geometry.id] * 3);
        };

        this.setNormals = function (geometry) {
            const vertexBufs = geometryVertexBufs[geometry.id];
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
            normalsBuf.setData(geometry.normals, geometryIndicesOffsets[geometry.id] * 3);
        };

        this.setUVs = function (geometry) {
            const vertexBufs = geometryVertexBufs[geometry.id];
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
            uvBuf.setData(geometry.uv, geometryIndicesOffsets[geometry.id] * 2);
        };

        this.setColors = function (geometry) {
            const vertexBufs = geometryVertexBufs[geometry.id];
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
            colorsBuf.setData(geometry.colors, geometryIndicesOffsets[geometry.id] * 4);
        };

        this.removeGeometry = function (geometry) {
            const id = geometry.id;
            if (!geometries[id]) {
                return;
            }
            delete geometries[id];
            delete geometryIndicesOffsets[id];
            if (geometry.indicesBufCombined) {
                geometry.indicesBufCombined.destroy();
            }
            needRebuild = true;
        };

        this.webglContextLost = function () {
            contextLost = true;
        };

        this.webglContextRestored = function () {
            if (contextLost) {
                for (const id in geometries) {
                    if (geometries.hasOwnProperty(id)) {
                        geometries[id].indicesBufCombined = null;
                    }
                }
                build();
                contextLost = false;
            }
        };

        function build() {

            geometryVertexBufs = {};

            let id;
            let geometry;
            let indicesOffset = 0;

            vertexBufs = null;

            let lenPositions = 0;
            let lenNormals = 0;
            let lenUVs = 0;
            let lenColors = 0;

            for (id in geometries) {
                if (geometries.hasOwnProperty(id)) {
                    geometry = geometries[id];
                    if (hasPositions) {
                        lenPositions += geometry.positions.length;
                    }
                    if (hasNormals) {
                        lenNormals += geometry.normals.length;
                    }
                    if (hasUVs) {
                        lenUVs += geometry.uv.length;
                    }
                    if (hasColors) {
                        lenColors += geometry.uv.length;
                    }
                }
            }

            // if (hasPositions) {
            //     positions = quantized ? new Uint16Array(lenPositions) : new Float32Array(lenPositions);
            // }
            // if (hasNormals) {
            //     normals = quantized ? new Uint16Array(lenNormals) : new Float32Array(lenNormals);
            // }
            // if (hasUVs) {
            //     uv = quantized ? new Uint16Array(lenUVs) : new Float32Array(lenUVs);
            // }
            // if (hasColors) {
            //     colors = quantized ? new Uint16Array(lenColors) : new Float32Array(lenColors);
            // }

            for (id in geometries) {
                if (geometries.hasOwnProperty(id)) {

                    geometry = geometries[id];

                    const needNew = (!vertexBufs) || (positions.length + geometry.positions.length > CHUNK_LEN);

                    if (needNew) {
                        if (vertexBufs) {
                            createBufs(vertexBufs);
                        }
                        vertexBufs = new xeogl.renderer.State({
                            positionsBuf: null,
                            normalsBuf: null,
                            uvBuf: null,
                            colorsBuf: null,
                            quantized: quantized
                        });
                        indicesOffset = 0;
                    }

                    geometryVertexBufs[id] = vertexBufs;

                    if (hasPositions) {
                        for (var i = 0, len = geometry.positions.length; i < len; i++) {
                            positions.push(geometry.positions[i]);
                        }
                    }

                    if (hasNormals) {
                        for (var i = 0, len = geometry.normals.length; i < len; i++) {
                            normals.push(geometry.normals[i]);
                        }
                    }

                    if (hasColors) {
                        for (var i = 0, len = geometry.colors.length; i < len; i++) {
                            colors.push(geometry.colors[i]);
                        }
                    }

                    if (hasUVs) {
                        for (var i = 0, len = geometry.uv.length; i < len; i++) {
                            uv.push(geometry.uv[i]);
                        }
                    }

                    // Adjust geometry indices

                    geometryIndicesOffsets[id] = indicesOffset;

                    let indices;

                    if (indicesOffset) {
                        indices = new (bigIndicesSupported ? Uint32Array : Uint16Array)(geometry.indices);
                        for (var i = 0, len = indices.length; i < len; i++) {
                            indices[i] += indicesOffset;
                            if (indices[i] > (CHUNK_LEN / 3)) {
                                console.error("out of range: " + indices[i])
                            }
                        }
                    } else {
                        indices = geometry.indices;
                    }

                    // Update indices buffer, lazy-create first if necessary

                    if (!geometry.indicesBufCombined) {
                        geometry.indicesBufCombined = new xeogl.renderer.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices, indices.length, 1, gl.STATIC_DRAW);
                    } else {
                        geometry.indicesBufCombined.setData(indices);
                    }

                    indicesOffset += geometry.positions.length / 3;
                }
            }

            if (vertexBufs) {
                createBufs(vertexBufs);
            }

            needRebuild = false;
            needAppend = false;
        }

        function createBufs(vertexBufs) {
            const gl = scene.canvas.gl;
            let array;
            if (hasPositions) {
                array = quantized ? new Uint16Array(positions) : new Float32Array(positions);
                vertexBufs.positionsBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 3, gl.STATIC_DRAW);
                memoryStats.positions += vertexBufs.positionsBuf.numItems;
                positions = [];
            }
            if (hasNormals) {
                array = quantized ? new Int8Array(normals) : new Float32Array(normals);
                vertexBufs.normalsBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 3, gl.STATIC_DRAW);
                memoryStats.normals += vertexBufs.normalsBuf.numItems;
                normals = [];
            }
            if (hasColors) {
                array = new Float32Array(colors);
                vertexBufs.colorsBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 4, gl.STATIC_DRAW);
                memoryStats.colors += vertexBufs.colorsBuf.numItems;
                colors = [];
            }
            if (hasUVs) {
                array = quantized ? new Uint16Array(uv) : new Float32Array(uv);
                vertexBufs.uvBuf = new xeogl.renderer.ArrayBuffer(gl, gl.ARRAY_BUFFER, array, array.length, 2, gl.STATIC_DRAW);
                memoryStats.uvs += vertexBufs.uvBuf.numItems;
                uv = [];
            }
        }
    }; // SceneVertexBufs

    xeogl.SceneVertexBufs.get = function (scene, geometry) {
        const hasPositions = !!geometry.positions;
        const quantized = !!geometry.quantized;
        const hasNormals = !!geometry.normals;
        const hasColors = !!geometry.colors;
        const hasUVs = !!geometry.uv;
        const hash = ([
            scene.id,
            hasPositions ? "p" : "",
            quantized ? "c" : "",
            hasNormals ? "n" : "",
            hasColors ? "c" : "",
            hasUVs ? "u" : ""
        ]).join(";");
        if (!scene._sceneVertexBufs) {
            scene._sceneVertexBufs = {};
        }
        let sceneVertexBufs = scene._sceneVertexBufs[hash];
        if (!sceneVertexBufs) {
            sceneVertexBufs = new xeogl.SceneVertexBufs(
                scene,
                hasPositions,
                hasNormals,
                hasColors,
                hasUVs,
                quantized);
            scene._sceneVertexBufs[hash] = sceneVertexBufs;
        }
        return sceneVertexBufs;
    };
})();