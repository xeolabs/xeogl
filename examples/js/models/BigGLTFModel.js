/**
 A **BigGLTFModel** is a {{#crossLink "BigModel"}}{{/crossLink}} that's loaded from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

 @class BigGLTFModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this BigGLTFModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this BigGLTFModel.
 @param [cfg.parent] The parent Object.
 @param [cfg.visible=true] {Boolean}  Indicates if this BigGLTFModel is visible.
 @param [cfg.culled=false] {Boolean}  Indicates if this BigGLTFModel is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this BigGLTFModel is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this BigGLTFModel is clippable.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this BigGLTFModel.
 @param [cfg.ghosted=false] {Boolean} Whether this BigGLTFModel is rendered ghosted.
 @param [cfg.highlighted=false] {Boolean} Whether this BigGLTFModel is rendered highlighted.
 @param [cfg.selected=false] {Boolean} Whether this BigGLTFModel is rendered selected.
 @param [cfg.edges=false] {Boolean} Whether this BigGLTFModel is rendered with edges emphasized.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.position=[0,0,0]] {Float32Array} The BigGLTFModel's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The BigGLTFModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The BigGLTFModel's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} GLTFThe Model's local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @param [cfg.src] {String} Path to a glTF file. You can set this to a new file path at any time, which will cause the
 @param [cfg.loaded=true] {Boolean} Indicates whether this BigGLTFModel is loaded or not. If initially set false, then the BigGLTFModel will load as soon as you set it true while {{#crossLink "BigGLTFModel/src:property"}}{{/crossLink}} is set to the location of a glTF file.
 @param [cfg.lambertMaterials=false] {Boolean} When true, gives each {{#crossLink "Mesh"}}{{/crossLink}} the same {{#crossLink "LambertMaterial"}}{{/crossLink}} and a {{#crossLink "Mesh/colorize:property"}}{{/crossLink}} value set the to diffuse color extracted from the glTF material. This is typically used for CAD models with huge amounts of objects, and will ignore textures.
 @param [cfg.quantizeGeometry=true] {Boolean} When true, quantizes geometry to reduce memory and GPU bus usage.
 @param [cfg.combineGeometry=true] {Boolean} When true, combines geometry vertex buffers to improve rendering performance.
 @param [cfg.backfaces=false] {Boolean} When true, allows visible backfaces, wherever specified in the glTF. When false, ignores backfaces.
 @param [cfg.edgeThreshold=20] {Number} When ghosting, highlighting, selecting or edging, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn.
 @param [cfg.handleNode] {Function} Optional callback to mask which {{#crossLink "Object"}}Objects{{/crossLink}} are loaded. Each Object will only be loaded when this callback returns ````true``` for its ID.

 @extends BigModel
 */
(function () {

    const INSTANCE_THRESHOLD = 1; // Minimum times a glTF geometry is reused before BigModel renders it using WebGL instancing

    xeogl.BigGLTFModel = class xeoglBigModel extends xeogl.BigModel {

        init(cfg) {
            var self = this;
            super.init(cfg);
            this._src = cfg.src;
            if (!this._src) {
                this.error("Config missing: src");
                return;
            }
            if (!xeogl._isString(this._src)) {
                this.error("Value for 'src' should be a string");
                return;
            }
            this._options = {};
            this.loaded = cfg.loaded;
            var spinner = this.scene.canvas.spinner;
            spinner.processes++;
            loadGLTF(this, this._src, this._options,
                function () {
                    spinner.processes--;
                    xeogl.scheduleTask(function () {
                        self.loaded = true;
                        self.fire("loaded", true, true);
                    });
                },
                function (msg) {
                    spinner.processes--;
                    self.error(msg);
                    /**
                     Fired whenever this BigGLTFModel fails to load the glTF file
                     specified by {{#crossLink "BigGLTFModel/src:property"}}{{/crossLink}}.
                     @event error
                     @param msg {String} Description of the error
                     */
                    self.fire("error", msg);
                });
        }

        /**
         Path to the glTF file from which this BigGLTFModel was loaded.

         @property src
         @type String
         @final
         */
        get src() {
            return this._src;
        }
    };

    var loadGLTF = (function () {

        return function (model, src, options, ok, error) {
            loadJSON(src, function (response) { // OK
                    var json;
                    try {
                        json = JSON.parse(response);
                    } catch (e) {
                        error(e);
                    }
                    options.basePath = getBasePath(src);
                    parseGLTF(json, src, options, model, ok, error);
                },
                error);
        };

        function loadJSON(url, ok, err) {
            var request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.open('GET', url, true);
            request.addEventListener('load', function (event) {
                var response = event.target.response;
                if (this.status === 200) {
                    if (ok) {
                        ok(response);
                    }
                } else if (this.status === 0) {
                    // Some browsers return HTTP Status 0 when using non-http protocol e.g. 'file://' or 'data://'. Handle as success.
                    console.warn('loadFile: HTTP Status 0 received.');
                    if (ok) {
                        ok(response);
                    }
                } else {
                    if (err) {
                        err(event);
                    }
                }
            }, false);

            request.addEventListener('error', function (event) {
                if (err) {
                    err(event);
                }
            }, false);
            request.send(null);
        }

        function getBasePath(src) {
            var i = src.lastIndexOf("/");
            return (i !== 0) ? src.substring(0, i + 1) : "";
        }
    })();

    var parseGLTF = (function () {

        const WEBGL_COMPONENT_TYPES = {
            5120: Int8Array,
            5121: Uint8Array,
            5122: Int16Array,
            5123: Uint16Array,
            5125: Uint32Array,
            5126: Float32Array
        };

        const WEBGL_TYPE_SIZES = {
            'SCALAR': 1,
            'VEC2': 2,
            'VEC3': 3,
            'VEC4': 4,
            'MAT2': 4,
            'MAT3': 9,
            'MAT4': 16
        };

        return function (json, src, options, model, ok) {

            var ctx = {
                src: src,
                loadBuffer: options.loadBuffer,
                basePath: options.basePath,
                json: json,
                scene: model.scene,
                model: model,
                numObjects: 0
            };

            model.scene.loading++; // Disables (re)compilation

            loadBuffers(ctx, function () {
                loadBufferViews(ctx);
                loadMaterials(ctx);
                loadDefaultScene(ctx);
                model.scene.loading--; // Re-enables (re)compilation
                model.finalize();
                ok();
            });
        };

        function loadBuffers(ctx, ok) {
            var buffers = ctx.json.buffers;
            if (buffers) {
                var numToLoad = buffers.length;
                for (var i = 0, len = buffers.length; i < len; i++) {
                    loadBuffer(ctx, buffers[i], function () {
                        if (--numToLoad === 0) {
                            ok();
                        }
                    }, function (msg) {
                        ctx.model.error(msg);
                        if (--numToLoad === 0) {
                            ok();
                        }
                    });
                }
            } else {
                ok();
            }
        }

        function loadBuffer(ctx, bufferInfo, ok, err) {
            var uri = bufferInfo.uri;
            if (uri) {
                loadArrayBuffer(ctx, uri, function (data) {
                        bufferInfo._buffer = data;
                        ok();
                    },
                    err);
            }
            else {
                err('gltf/handleBuffer missing uri in ' + JSON.stringify(bufferInfo));
            }
        }

        function loadArrayBuffer(ctx, url, ok, err) {
            // Check for data: URI
            var dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;
            var dataUriRegexResult = url.match(dataUriRegex);
            if (dataUriRegexResult) { // Safari can't handle data URIs through XMLHttpRequest
                var isBase64 = !!dataUriRegexResult[2];
                var data = dataUriRegexResult[3];
                data = window.decodeURIComponent(data);
                if (isBase64) {
                    data = window.atob(data);
                }
                try {
                    var buffer = new ArrayBuffer(data.length);
                    var view = new Uint8Array(buffer);
                    for (var i = 0; i < data.length; i++) {
                        view[i] = data.charCodeAt(i);
                    }
                    window.setTimeout(function () {
                        ok(buffer);
                    }, 0);
                } catch (error) {
                    window.setTimeout(function () {
                        err(error);
                    }, 0);
                }
            } else {
                if (ctx.loadBuffer) {
                    ctx.loadBuffer(url, ok, err);

                } else {
                    var request = new XMLHttpRequest();
                    request.open('GET', ctx.basePath + url, true);
                    request.responseType = 'arraybuffer';
                    request.onreadystatechange = function () {
                        if (request.readyState == 4) {
                            if (request.status == "200") {
                                ok(request.response);
                            } else {
                                err('loadArrayBuffer error : ' + request.response);
                            }
                        }
                    };
                    request.send(null);
                }
            }
        }

        function loadBufferViews(ctx) {
            var bufferViewsInfo = ctx.json.bufferViews;
            if (bufferViewsInfo) {
                for (var i = 0, len = bufferViewsInfo.length; i < len; i++) {
                    loadBufferView(ctx, bufferViewsInfo[i]);
                }
            }
        }

        function loadBufferView(ctx, bufferViewInfo) {
            var buffer = ctx.json.buffers[bufferViewInfo.buffer];
            bufferViewInfo._typedArray = null;
            var byteLength = bufferViewInfo.byteLength || 0;
            var byteOffset = bufferViewInfo.byteOffset || 0;
            bufferViewInfo._buffer = buffer._buffer.slice(byteOffset, byteOffset + byteLength);
        }

        function loadMaterials(ctx) {
            var materialsInfo = ctx.json.materials;
            if (materialsInfo) {
                var materialInfo;
                var material;
                for (var i = 0, len = materialsInfo.length; i < len; i++) {
                    materialInfo = materialsInfo[i];
                    material = loadMaterialColorize(ctx, materialInfo);
                    materialInfo._rgbaColor = material;
                }
            }
        }

        function loadMaterialColorize(ctx, materialInfo) { // Substitute RGBA for material, to use fast flat shading instead
            var json = ctx.json;
            var colorize = new Float32Array([1, 1, 1, 1]);
            var extensions = materialInfo.extensions;
            if (extensions) {
                var specularPBR = extensions["KHR_materials_pbrSpecularGlossiness"];
                if (specularPBR) {
                    var diffuseFactor = specularPBR.diffuseFactor;
                    if (diffuseFactor !== null && diffuseFactor !== undefined) {
                        colorize.set(diffuseFactor);
                    }
                }
                var common = extensions["KHR_materials_common"];
                if (common) {
                    var technique = common.technique;
                    var values = common.values || {};
                    var blinn = technique === "BLINN";
                    var phong = technique === "PHONG";
                    var lambert = technique === "LAMBERT";
                    var diffuse = values.diffuse;
                    if (diffuse && (blinn || phong || lambert)) {
                        if (!xeogl._isString(diffuse)) {
                            colorize.set(diffuse);
                        }
                    }
                    var transparency = values.transparency;
                    if (transparency !== null && transparency !== undefined) {
                        colorize[3] = transparency;
                    }
                    var transparent = values.transparent;
                    if (transparent !== null && transparent !== undefined) {
                        colorize[3] = transparent;
                    }
                }
            }
            var metallicPBR = materialInfo.pbrMetallicRoughness;
            if (metallicPBR) {
                var baseColorFactor = metallicPBR.baseColorFactor;
                if (baseColorFactor) {
                    colorize.set(baseColorFactor);
                }
            }
            return colorize;
        }

        function loadDefaultScene(ctx) {
            var json = ctx.json;
            var scene = json.scene || 0;
            var defaultSceneInfo = json.scenes[scene];
            if (!defaultSceneInfo) {
                error(ctx, "glTF has no default scene");
                return;
            }
            loadScene(ctx, defaultSceneInfo);
        }

        function loadScene(ctx, sceneInfo) {
            var nodes = sceneInfo.nodes;
            if (!nodes) {
                return;
            }

            var json = ctx.json;
            var nodeInfo;

            for (var i = 0, len = nodes.length; i < len; i++) {
                nodeInfo = json.nodes[nodes[i]];
                if (!nodeInfo) {
                    error(ctx, "Node not found: " + i);
                    continue;
                }
                countMeshUsage(ctx, i, nodeInfo);
            }

            for (var i = 0, len = nodes.length; i < len; i++) {
                nodeInfo = json.nodes[nodes[i]];
                if (nodeInfo) {
                    loadNode(ctx, i, nodeInfo, null, null);
                }
            }
        }

        function countMeshUsage(ctx, nodeIdx, nodeInfo) {
            var json = ctx.json;
            var mesh = nodeInfo.mesh;
            if (mesh !== undefined) {
                var meshInfo = json.meshes[nodeInfo.mesh];
                if (meshInfo) {
                    meshInfo.instances = meshInfo.instances ? meshInfo.instances + 1 : 1;
                }
            }
            if (nodeInfo.children) {
                var children = nodeInfo.children;
                var childNodeInfo;
                var childNodeIdx;
                for (var i = 0, len = children.length; i < len; i++) {
                    childNodeIdx = children[i];
                    childNodeInfo = json.nodes[childNodeIdx];
                    if (!childNodeInfo) {
                        error(ctx, "Node not found: " + i);
                        continue;
                    }
                    countMeshUsage(ctx, nodeIdx, childNodeInfo);
                }
            }
        }

        function loadNode(ctx, nodeIdx, nodeInfo, matrix, parent, parentCfg) {

            parent = parent || ctx.model;

            var json = ctx.json;
            var model = ctx.model;
            var math = xeogl.math;
            var localMatrix;

            if (nodeInfo.matrix) {
                localMatrix = nodeInfo.matrix;
                if (matrix) {
                    matrix = math.mulMat4(matrix, localMatrix, math.mat4());
                } else {
                    matrix = localMatrix;
                }
            }

            if (nodeInfo.translation) {
                localMatrix = math.translationMat4v(nodeInfo.translation);
                if (matrix) {
                    matrix = math.mulMat4(matrix, localMatrix, localMatrix);
                } else {
                    matrix = localMatrix;
                }
            }

            if (nodeInfo.rotation) {
                localMatrix = math.quaternionToMat4(nodeInfo.rotation);
                if (matrix) {
                    matrix = math.mulMat4(matrix, localMatrix, localMatrix);
                } else {
                    matrix = localMatrix;
                }
            }

            if (nodeInfo.scale) {
                localMatrix = math.scalingMat4v(nodeInfo.scale);
                if (matrix) {
                    matrix = math.mulMat4(matrix, localMatrix, localMatrix);
                } else {
                    matrix = localMatrix;
                }
            }

            ctx.numObjects++;

            if (nodeInfo.mesh !== undefined) {
                var meshInfo = json.meshes[nodeInfo.mesh];
                if (meshInfo) {

                    const numPrimitives = meshInfo.primitives.length;
                    if (numPrimitives > 0) {
                        for (var i = 0, len = numPrimitives; i < len; i++) {

                            const objectCfg = {
                                id: model.id + "." + ctx.numObjects, // TODO
                                matrix: matrix,
                                instances: meshInfo.instances
                            };

                            var primitiveInfo = meshInfo.primitives[i];
                            var materialIndex = primitiveInfo.material;
                            var materialInfo;
                            if (materialIndex !== null && materialIndex !== undefined) {
                                materialInfo = json.materials[materialIndex];
                            }
                            if (materialInfo) {
                                objectCfg.color = materialInfo._rgbaColor;
                                objectCfg.opacity = materialInfo._rgbaColor[3];
                            } else {
                                objectCfg.color = new Float32Array([1.0, 1.0, 1.0]);
                                objectCfg.opacity = 1.0;
                            }

                            if (meshInfo.instances > INSTANCE_THRESHOLD) {

                                //--------------------------------------------------------------------------------------
                                // Instanced geometry - use instanced arrays
                                //--------------------------------------------------------------------------------------

                                const geometryId = model.id + "." + nodeInfo.mesh;

                                if (!meshInfo.geometryId) {
                                    meshInfo.geometryId = geometryId;
                                    var geometryCfg = {
                                        id: geometryId
                                    };
                                    loadPrimitiveGeometry(ctx, meshInfo, i, geometryCfg);
                                    model.createGeometry(geometryCfg);
                                }

                                objectCfg.geometryId = geometryId;

                            } else {

                                //--------------------------------------------------------------------------------------
                                // Not instanced - batch in VBOs
                                //--------------------------------------------------------------------------------------

                                loadPrimitiveGeometry(ctx, meshInfo, i, objectCfg);
                            }

                            model.createObject(objectCfg);
                        }
                    }
                }
            }

            if (nodeInfo.children) {
                var children = nodeInfo.children;
                var childNodeInfo;
                var childNodeIdx;
                for (var i = 0, len = children.length; i < len; i++) {
                    childNodeIdx = children[i];
                    childNodeInfo = json.nodes[childNodeIdx];
                    if (!childNodeInfo) {
                        error(ctx, "Node not found: " + i);
                        continue;
                    }
                    loadNode(ctx, nodeIdx, childNodeInfo, matrix, parent, parentCfg);
                }
            }
        }

        function loadPrimitiveGeometry(ctx, meshInfo, primitiveIdx, geometryCfg) {
            var primitivesInfo = meshInfo.primitives;
            if (!primitivesInfo) {
                return;
            }
            var primitiveInfo = primitivesInfo[primitiveIdx];
            if (!primitiveInfo) {
                return;
            }
            var attributes = primitiveInfo.attributes;
            if (!attributes) {
                return;
            }
            geometryCfg.primitive = "triangles";
            var indicesIndex = primitiveInfo.indices;
            if (indicesIndex !== null && indicesIndex !== undefined) {
                const accessorInfo = ctx.json.accessors[indicesIndex];
                geometryCfg.indices = loadAccessorTypedArray(ctx, accessorInfo);
            }
            var positionsIndex = attributes.POSITION;
            if (positionsIndex !== null && positionsIndex !== undefined) {
                const accessorInfo = ctx.json.accessors[positionsIndex];
                geometryCfg.positions = loadAccessorTypedArray(ctx, accessorInfo);
            }
            var normalsIndex = attributes.NORMAL;
            if (normalsIndex !== null && normalsIndex !== undefined) {
                const accessorInfo = ctx.json.accessors[normalsIndex];
                geometryCfg.normals = loadAccessorTypedArray(ctx, accessorInfo);
            }
            if (geometryCfg.indices) {
                geometryCfg.edgeIndices = xeogl.math.buildEdgeIndices(geometryCfg.positions, geometryCfg.indices, null, 10, false);
            }
        }

        function loadAccessorTypedArray(ctx, accessorInfo) {
            window.test = window.test || {};
            var id = "" + accessorInfo.bufferView + " " + accessorInfo.byteOffset;
            if (window.test[id]) {
                console.log("Repeated loadAccessorTypedArray");
            } else {
                window.test[id] = true;
            }
            var bufferViewInfo = ctx.json.bufferViews[accessorInfo.bufferView];
            var itemSize = WEBGL_TYPE_SIZES[accessorInfo.type];
            var TypedArray = WEBGL_COMPONENT_TYPES[accessorInfo.componentType];
            // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
            var elementBytes = TypedArray.BYTES_PER_ELEMENT;
            var itemBytes = elementBytes * itemSize;
            if (accessorInfo.byteStride && accessorInfo.byteStride !== itemBytes) { // The buffer is not interleaved if the stride is the item size in bytes.
                //TODO
//                alert("interleaved buffer!");
            } else {
                return new TypedArray(bufferViewInfo._buffer, accessorInfo.byteOffset || 0, accessorInfo.count * itemSize);
            }
        }

        function error(ctx, msg) {
            ctx.model.error(msg);
        }
    })();

})();