/**
 A **GLTFModel** is a {{#crossLink "Model"}}{{/crossLink}} loaded from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

 <a href="../../examples/#importing_gltf_gearbox"><img src="../../../assets/images/gltf/glTF_gearbox_squashed.png"></img></a>

 ## Overview

 * A GLTFModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from a glTF file.
 * It begins loading as soon as you set its {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}
 property to the location of a valid glTF file.
 * You can set {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
 the GLTFModel to clear itself and load components from the new file.

 It inherits these capabilities from its {{#crossLink "Model"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the components within it.
 * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * Provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 <img src="../../../assets/images/GLTFModel.png"></img>

 ## Supported glTF 2.0 features

 So far, GLTFModel loads only geometry, materials and modeling transform hierarchies, without animations. It does not
 load cameras or lights because its purpose is to import models into environments that have already been created using
 the xeogl API.

 In addition to glTF's core metal-roughness material workflow, GLTFModel also supports two material extensions:

 * [KHR_materials_pbrSpecularGlossiness](https://github.com/KhronosGroup/glTF/blob/master/extensions/Khronos/KHR_materials_pbrSpecularGlossiness/README.md)
 * [KHR_materials_common](https://github.com/KhronosGroup/glTF/blob/master/extensions/Khronos/KHR_materials_common/README.md)

 ## Usage

 ### Loading glTF

 Load a glTF file by creating a GLTFModel:

 ````javascript
 var gearbox = new xeogl.GLTFModel({
   id: "gearbox",
   src: "models/gltf/gearbox/gearbox_assy.gltf"
 });
 ````

 A GLTFModel prefixes its own ID to those of its components. Its ID is optional and defaults to
 the value of {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}. In this example we're providing our own short ID,
 however, in order to keep the component IDs short and easy to use.

 The GLTFModel begins loading the glTF file immediately. Bind a callback to be notified when the file has loaded (which
 fires immediately if already loaded):

 ````javascript
 gearbox.on("loaded", function() {
        // GLTFModel has loaded!
    });
 ````

 You can also bind a callback to fire if loading fails:

 ````javascript
 gearbox.on("error", function(msg) {
        // Error occurred
    });
 ````

 To switch to a different glTF file, simply update {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}:

 ````javascript
 gearbox.src = "models/gltf/Buggy/glTF/Buggy.gltf"
 ````

 ### Accessing components

 Once the GLTFModel has loaded, its {{#crossLink "Scene"}}{{/crossLink}} will contain various components that represent the elements of the glTF file.
 We'll now access some of those components by ID, to query and update them programmatically.

 **Transforms**

 Let's reposition one of the {{#crossLink "Entity"}}Entities{{/crossLink}} in our GLTFModel. We'll get the {{#crossLink "Transform"}}{{/crossLink}} that
 positions our target {{#crossLink "Entity"}}{{/crossLink}}, in this case a gear. Then we'll update its matrix to translate it ten units along the negative Z-axis.

 ````javascript
 var transform = gearbox.scene.components["gearbox#n274017_gear_53t-node.transform"];

 transform.matrix = xeogl.math.translationMat4v([0,0,-10]);
 ````

 Note the format of the {{#crossLink "Transform"}}{{/crossLink}}'s ID:

 ````<GLTFModel ID>#<glTF node ID>.transform````

 From left to right, the format contains the GLTFModel's ID, the ID of the glTF node that contains the transform, then
 "transform", to distinguish it from the IDs of any other components loaded from elements on the same glTF node.

 **Entities**

 Let's make our gear {{#crossLink "Entity"}}{{/crossLink}} invisible:

 ````javascript
 var gear53 = gearbox.scene.components["gearbox#n274017_gear_53.entity.0"];

 gear53.visible = false;
 ````

 Note the format of the {{#crossLink "Entity"}}{{/crossLink}}'s ID: ````<GLTFModel ID>#<glTF node ID>.entity.<glTF mesh index>````

 A glTF scene node may contain multiple meshes, and for each of those xeogl will create an individual {{#crossLink "Entity"}}{{/crossLink}}. As
 before, the part before the hash is the ID of the GLTFModel, which is then followed by the ID of the glTF node, then "entity"
 to signify that this is an Entity ID, then finally an index to differentiate the Entity from those loaded from other
 meshes on the same glTF node.

 ## Examples

 * [Damaged Helmet with metal/rough PBR materials](../../examples/#importing_gltf_pbr_metallic_helmet)
 * [Gearbox with entity explorer](../../examples/#importing_gltf_explorer)
 * [Ensuring individual materials on GLTFModel entities](../../examples/#models_filter_uniqueMaterials)
 * [Baking transform hierarchies in a GLTFModel](../../examples/#models_filter_bakeTransforms)

 @class GLTFModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GLTFModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GLTFModel.
 @param [cfg.src] {String} Path to a glTF file. You can set this to a new file path at any time, which will cause the
 GLTFModel to load components from the new file (after first destroying any components loaded from a previous file path).
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this GLTFModel.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this GLTFModel. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the GLTFModel attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @extends Model
 */
(function () {

    "use strict";

    xeogl.GLTFModel = xeogl.Model.extend({

        type: "xeogl.GLTFModel",

        _init: function (cfg) {
            this._super(cfg);
            this._src = null;
            this.src = cfg.src;
        },

        _props: {

            /**
             Path to a glTF file.

             You can set this to a new file path at any time (except while loading), which will cause the GLTFModel to load components from
             the new file (after first destroying any components loaded from a previous file path).

             Fires a {{#crossLink "GLTFModel/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (!xeogl._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    if (value === this._src) { // Already loaded this GLTFModel

                        /**
                         Fired whenever this GLTFModel has finished loading components from the glTF file
                         specified by {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        this.fire("loaded", true, true);
                        return;
                    }

                    this.destroyAll();

                    this._src = value;

                    xeogl.GLTFModel.load(this, this._src);

                    /**
                     Fired whenever this GLTFModel's {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _getJSON: function () {
            var json = {};
            if (this.src) {
                json.src = this._src;
            }
            return json;
        },

        _destroy: function () {
            this.destroyAll();
        }
    });

    /**
     * Loads glTF from a URL into a {{#crossLink "Model"}}{{/crossLink}}.
     *
     * @param {Model} model Model to load into.
     * @param {String} src Path to glTF file.
     * @param {Function} [ok] Completion callback.
     */
    xeogl.GLTFModel.load = function (model, src, ok) {

        var spinner = model.scene.canvas.spinner;
        spinner.processes++;

        loadGLTF(model, src, function () {

                spinner.processes--;

                xeogl.scheduleTask(function () {
                    model.fire("loaded", true, true);
                });

                if (ok) {
                    ok();
                }
            },
            function (msg) {

                spinner.processes--;

                model.error(msg);

                /**
                 Fired whenever this GLTFModel fails to load the glTF file
                 specified by {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}.
                 @event error
                 @param msg {String} Description of the error
                 */
                model.fire("error", msg);
            });
    };


    /**
     * Parses glTF JSON into a {{#crossLink "Model"}}{{/crossLink}}.
     *
     * @param {Model} model Model to parse into.
     * @param {Object} gltf The glTF JSON.
     * @param {String} [basePath] Base path path to find external resources on, if any.
     */
    xeogl.GLTFModel.parse = function (model, gltf, basePath) {
        parseGLTF(gltf, "", basePath || "", model, function () {
                model.fire("loaded", true, true);
            },
            function (msg) {
                model.error(msg);
                model.fire("error", msg);
            });
    };

    //--------------------------------------------------------------------------------------------
    // Loads glTF V2.0
    //--------------------------------------------------------------------------------------------

    var loadGLTF = (function () {

        return function (model, src, ok, error) {

            loadJSON(src, function (response) { // OK

                    var json;
                    try {
                        json = JSON.parse(response);
                    } catch (e) {
                        error(e);
                    }

                    var basePath = getBasePath(src);

                    parseGLTF(json, src, basePath, model, ok, error);
                },
                error);
        };

        function loadJSON(src, ok, error) {
            var request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.open('GET', src, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && // Request finished, response ready
                    request.status == "200") { // Status OK
                    ok(request.responseText, this);
                }
            };
            request.send(null);
        }

        function getBasePath(src) {
            var i = src.lastIndexOf("/");
            return (i !== 0) ? src.substring(0, i + 1) : "";
        }
    })();

    var parseGLTF = (function () {

        const WebGLConstants = {
            34963: 'ELEMENT_ARRAY_BUFFER',  //0x8893
            34962: 'ARRAY_BUFFER',          //0x8892
            5123: 'UNSIGNED_SHORT',         //0x1403
            5126: 'FLOAT',                  //0x1406
            4: 'TRIANGLES',                 //0x0004
            35678: 'SAMPLER_2D',            //0x8B5E
            35664: 'FLOAT_VEC2',            //0x8B50
            35665: 'FLOAT_VEC3',            //0x8B51
            35666: 'FLOAT_VEC4',            //0x8B52
            35676: 'FLOAT_MAT4'             //0x8B5C
        };

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

        return function (json, src, basePath, model, ok) {

            var ctx = {
                src: src,
                basePath: basePath,
                json: json,
                scene: model.scene,
                model: model
            };

            loadBuffers(ctx, function () {

                loadBufferViews(ctx);
                loadAccessors(ctx);
                loadTextures(ctx);
                loadMaterials(ctx);
                loadMeshes(ctx);
                loadDefaultScene(ctx);

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

                var mimeType = dataUriRegexResult[1];
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
                var request = new XMLHttpRequest();
                request.responseType = 'arraybuffer';
                request.open('GET', ctx.basePath + url, true);
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

            if (bufferViewInfo.target === 34963) {
                bufferViewInfo._typedArray = new Uint16Array(bufferViewInfo._buffer);

            } else if (bufferViewInfo.target == 34962) {
                bufferViewInfo._typedArray = new Float32Array(bufferViewInfo._buffer);

            } else {
                console.log(bufferViewInfo._typedArray)
            }
        }

        function loadAccessors(ctx) {
            var accessorsInfo = ctx.json.accessors;
            if (accessorsInfo) {
                for (var i = 0, len = accessorsInfo.length; i < len; i++) {
                    loadAccessor(ctx, accessorsInfo[i]);
                }
            }
        }

        function loadAccessor(ctx, accessorInfo) {
            var arraybuffer = ctx.json.bufferViews[accessorInfo.bufferView];
            var itemSize = WEBGL_TYPE_SIZES[accessorInfo.type];
            var TypedArray = WEBGL_COMPONENT_TYPES[accessorInfo.componentType];

            // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
            var elementBytes = TypedArray.BYTES_PER_ELEMENT;
            var itemBytes = elementBytes * itemSize;

            // The buffer is not interleaved if the stride is the item size in bytes.
            if (accessorInfo.byteStride && accessorInfo.byteStride !== itemBytes) {

                //TODO

//                alert("interleaved buffer!");

            } else {
                accessorInfo._typedArray = new TypedArray(arraybuffer._buffer, accessorInfo.byteOffset || 0, accessorInfo.count * itemSize);
                accessorInfo._itemSize = itemSize;
            }
        }


        function loadTextures(ctx) {
            var texturesInfo = ctx.json.textures;
            if (texturesInfo) {
                for (var i = 0, len = texturesInfo.length; i < len; i++) {
                    loadTexture(ctx, texturesInfo[i]);
                }
            }
        }

        function loadTexture(ctx, textureInfo) {
            var texture = new xeogl.Texture(ctx.scene, {
                src: ctx.basePath + ctx.json.images[textureInfo.source].uri,
                flipY: !!textureInfo.flipY
            });
            ctx.model.add(texture);
            textureInfo._texture = texture;
        }

        function loadMaterials(ctx) {
            var materialsInfo = ctx.json.materials;
            if (materialsInfo) {
                var materialInfo;
                var material;
                for (var i = 0, len = materialsInfo.length; i < len; i++) {
                    materialInfo = materialsInfo[i];
                    material = loadMaterial(ctx, materialInfo);
                    ctx.model.add(material);
                    materialInfo._material = material;
                }
            }
        }

        function loadMaterial(ctx, materialInfo) {

            var json = ctx.json;
            var cfg = {};
            var textureInfo;

            // Common attributes

            var normalTexture = materialInfo.normalTexture;
            if (normalTexture) {
                textureInfo = json.textures[normalTexture.index];
                if (textureInfo) {
                    cfg.normalMap = textureInfo._texture;
                }
            }

            var occlusionTexture = materialInfo.occlusionTexture;
            if (occlusionTexture) {
                textureInfo = json.textures[occlusionTexture.index];
                if (textureInfo) {
                    cfg.occlusionMap = textureInfo._texture;
                }
            }

            var emissiveTexture = materialInfo.emissiveTexture;
            if (emissiveTexture) {
                textureInfo = json.textures[emissiveTexture.index];
                if (textureInfo) {
                    cfg.emissiveMap = textureInfo._texture;
                }
            }

            var emissiveFactor = materialInfo.emissiveFactor;
            if (emissiveFactor) {
                cfg.emissive = emissiveFactor;
            }

            cfg.backfaces = !!materialInfo.doubleSided;

            var alphaMode = materialInfo.alphaMode;
            switch (alphaMode) {
                case "OPAQUE":
                    cfg.alphaMode = "opaque";
                    break;
                case "MASK":
                    cfg.alphaMode = "mask";
                    break;
                case "BLEND":
                    cfg.alphaMode = "blend";
                    break;
                default:
            }

            var alphaCutoff = materialInfo.alphaCutoff;
            if (alphaCutoff !== undefined) {
                cfg.alphaCutoff = alphaCutoff;
            }

            var extensions = materialInfo.extensions;
            if (extensions) {

                // Specular PBR material

                var specularPBR = extensions["KHR_materials_pbrSpecularGlossiness"];
                if (specularPBR) {

                    var diffuseFactor = specularPBR.diffuseFactor;
                    if (diffuseFactor !== null && diffuseFactor !== undefined) {
                        cfg.diffuse = diffuseFactor.slice(0, 3);
                        cfg.alpha = diffuseFactor[3];
                    }

                    var diffuseTexture = specularPBR.diffuseTexture;
                    if (diffuseTexture) {
                        textureInfo = json.textures[diffuseTexture.index];
                        if (textureInfo) {
                            cfg.diffuseMap = textureInfo._texture;
                        }
                    }

                    var specularFactor = specularPBR.specularFactor;
                    if (specularFactor !== null && specularFactor !== undefined) {
                        cfg.specular = specularFactor.slice(0, 3);
                    }

                    var glossinessFactor = specularPBR.glossinessFactor;
                    if (glossinessFactor !== null && glossinessFactor !== undefined) {
                        cfg.glossiness = glossinessFactor;
                    }

                    var specularGlossinessTexture = specularPBR.specularGlossinessTexture;
                    if (specularGlossinessTexture) {
                        textureInfo = json.textures[specularGlossinessTexture.index];
                        if (textureInfo) {
                            cfg.specularGlossinessMap = textureInfo._texture;
                        }
                    }

                    return new xeogl.SpecularMaterial(ctx.scene, cfg);
                }

                // Common Phong, Blinn, Lambert or Constant materials

                var common = extensions["KHR_materials_common"];
                if (common) {

                    var technique = common.technique;
                    var values = common.values || {};

                    var blinn = technique === "BLINN";
                    var phong = technique === "PHONG";
                    var lambert = technique === "LAMBERT";
                    var constant = technique === "CONSTANT";

                    var shininess = values.shininess;
                    if ((blinn || phong) && shininess !== null && shininess !== undefined) {
                        cfg.shininess = shininess;
                    } else {
                        cfg.shininess = 0;
                    }
                    var texture;
                    var diffuse = values.diffuse;
                    if (diffuse && (blinn || phong || lambert)) {
                        if (xeogl._isString(diffuse)) {
                            texture = ctx.textures[diffuse];
                            if (texture) {
                                cfg.diffuseMap = texture;
                            }
                        } else {
                            cfg.diffuse = diffuse.slice(0, 3);
                        }
                    } else {
                        cfg.diffuse = [0, 0, 0];
                    }

                    var specular = values.specular;
                    if (specular && (blinn || phong)) {
                        if (xeogl._isString(specular)) {
                            texture = ctx.textures[specular];
                            if (texture) {
                                cfg.specularMap = texture;
                            }
                        } else {
                            cfg.specular = specular.slice(0, 3);
                        }
                    } else {
                        cfg.specular = [0, 0, 0];
                    }

                    var emission = values.emission;
                    if (emission) {
                        if (xeogl._isString(emission)) {
                            texture = ctx.textures[emission];
                            if (texture) {
                                cfg.emissiveMap = texture;
                            }
                        } else {
                            cfg.emissive = emission.slice(0, 3);
                        }
                    } else {
                        cfg.emissive = [0, 0, 0];
                    }

                    var transparency = values.transparency;
                    if (transparency !== null && transparency !== undefined) {
                        cfg.alpha = transparency;
                    } else {
                        cfg.alpha = 1.0;
                    }

                    var transparent = values.transparent;
                    if (transparent !== null && transparent !== undefined) {
                        //cfg.transparent = transparent;
                    } else {
                        //cfg.transparent = 1.0;
                    }

                    return new xeogl.PhongMaterial(ctx.scene, cfg);
                }
            }

            // Metallic PBR naterial

            var metallicPBR = materialInfo.pbrMetallicRoughness;
            if (metallicPBR) {

                var baseColorFactor = metallicPBR.baseColorFactor;
                if (baseColorFactor) {
                    cfg.baseColor = baseColorFactor.slice(0, 3);
                    cfg.alpha = baseColorFactor[3];
                }

                var baseColorTexture = metallicPBR.baseColorTexture;
                if (baseColorTexture) {
                    textureInfo = json.textures[baseColorTexture.index];
                    if (textureInfo) {
                        cfg.baseColorMap = textureInfo._texture;
                    }
                }

                var metallicFactor = metallicPBR.metallicFactor;
                if (metallicFactor !== null && metallicFactor !== undefined) {
                    cfg.metallic = metallicFactor;
                }

                var roughnessFactor = metallicPBR.roughnessFactor;
                if (roughnessFactor !== null && roughnessFactor !== undefined) {
                    cfg.roughness = roughnessFactor;
                }

                var metallicRoughnessTexture = metallicPBR.metallicRoughnessTexture;
                if (metallicRoughnessTexture) {
                    textureInfo = json.textures[metallicRoughnessTexture.index];
                    if (textureInfo) {
                        cfg.metallicRoughnessMap = textureInfo._texture;
                    }
                }

                return new xeogl.MetallicMaterial(ctx.scene, cfg);
            }

            // Default material

            return new xeogl.PhongMaterial(ctx.scene, cfg);
        }

        function loadMeshes(ctx) {
            var meshes = ctx.json.meshes;
            if (meshes) {
                for (var i = 0, len = meshes.length; i < len; i++) {
                    loadMesh(ctx, meshes[i]);
                }
            }
        }

        function loadMesh(ctx, meshInfo) {
            var json = ctx.json;
            var mesh = [];
            var primitivesInfo = meshInfo.primitives;
            var materialIndex;
            var materialInfo;
            var accessorInfo;
            var bufferViewInfo;
            var attributes;

            if (primitivesInfo) {

                var primitiveInfo;
                var indicesIndex;
                var positionsIndex;
                var normalsIndex;
                var uv0Index;
                var geometryCfg;
                var meshCfg;
                var geometry;

                for (var i = 0, len = primitivesInfo.length; i < len; i++) {

                    geometryCfg = {
                        primitive: "triangles"
                    };

                    primitiveInfo = primitivesInfo[i];
                    indicesIndex = primitiveInfo.indices;

                    if (indicesIndex !== null && indicesIndex !== undefined) {
                        accessorInfo = json.accessors[indicesIndex];
                        bufferViewInfo = json.bufferViews[accessorInfo.bufferView];
                        geometryCfg.indices = accessorInfo._typedArray;
                    }

                    attributes = primitiveInfo.attributes;
                    if (!attributes) {
                        continue;
                    }

                    positionsIndex = attributes.POSITION;

                    if (positionsIndex !== null && positionsIndex !== undefined) {
                        accessorInfo = json.accessors[positionsIndex];
                        bufferViewInfo = json.bufferViews[accessorInfo.bufferView];
                        geometryCfg.positions = accessorInfo._typedArray;
                    }

                    normalsIndex = attributes.NORMAL;

                    if (normalsIndex !== null && normalsIndex !== undefined) {
                        accessorInfo = json.accessors[normalsIndex];
                        bufferViewInfo = json.bufferViews[accessorInfo.bufferView];
                        geometryCfg.normals = accessorInfo._typedArray;
                    }

                    uv0Index = attributes.TEXCOORD_0;

                    if (uv0Index !== null && uv0Index !== undefined) {
                        accessorInfo = json.accessors[uv0Index];
                        bufferViewInfo = json.bufferViews[accessorInfo.bufferView];
                        geometryCfg.uv = accessorInfo._typedArray;
                    }

                    meshCfg = {};

                    geometry = new xeogl.Geometry(ctx.scene, geometryCfg);
                    ctx.model.add(geometry);
                    meshCfg.geometry = geometry;

                    materialIndex = primitiveInfo.material;
                    if (materialIndex !== null && materialIndex !== undefined) {
                        materialInfo = json.materials[materialIndex];
                        if (materialInfo) {
                            meshCfg.material = materialInfo._material;
                        }
                    }

                    mesh.push(meshCfg);
                }
            }
            meshInfo._mesh = mesh;
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
                loadNode(ctx, i, nodeInfo, null);
            }
        }

        function loadNode(ctx, nodeIdx, nodeInfo, transform) {
            var json = ctx.json;
            var model = ctx.model;

            if (nodeInfo.matrix) {
                var matrix = nodeInfo.matrix;
                transform = new xeogl.Transform(model, {
                    matrix: matrix,
                    parent: transform
                });
                model.add(transform);
            }

            if (nodeInfo.translation) {
                var translation = nodeInfo.translation;
                transform = new xeogl.Translate(model, {
                    xyz: [translation[0], translation[1], translation[2]],
                    parent: transform
                });
                model.add(transform);
            }

            if (nodeInfo.rotation) {
                var rotation = nodeInfo.rotation;
                transform = new xeogl.Quaternion(model, {
                    xyzw: rotation,
                    parent: transform
                });
                model.add(transform);
            }

            if (nodeInfo.scale) {
                var scale = nodeInfo.scale;
                transform = new xeogl.Scale(model, {
                    xyz: [scale[0], scale[1], scale[2]],
                    parent: transform
                });
                model.add(transform);
            }

            if (nodeInfo.mesh !== undefined) {

                var meshInfo = json.meshes[nodeInfo.mesh];

                if (meshInfo) {

                    var meshes = meshInfo._mesh;
                    var mesh;
                    var entityId;
                    var entity;
                    var numMeshes = meshes.length;
                    var manyMeshes = numMeshes > 1;

                    for (var i = 0, len = numMeshes; i < len; i++) {

                        mesh = meshes[i];

                        entityId = makeEntityId(ctx, nodeInfo, nodeIdx, manyMeshes);

                        var meta = nodeInfo.extra || {};
                        meta.name = nodeInfo.name;

                        entity = new xeogl.Entity(model, {
                            id: entityId,
                            meta: meta,
                            material: mesh.material,
                            geometry: mesh.geometry,
                            transform: transform,

                            // Indicates that this Entity is freshly loaded -  increments the xeogl.Spinner#processes
                            // count on the Scene Canvas, which will decrement again as soon as Entity is compiled
                            // into the render graph, causing the Spinner to show until this Entity is visible
                            loading: true // TODO: track loading state explicitely
                        });

                        entity.on("loaded", function () {
                            //alert("done");
                        });

                        model.add(entity);
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
                    loadNode(ctx, nodeIdx, childNodeInfo, transform);
                }
            }
        }

        function makeEntityId(ctx, nodeInfo, nodeIdx, manyMeshes) {
            var id = makeID(ctx, nodeInfo.name || nodeIdx);
            if (!manyMeshes && !ctx.model.entities[id]) {
                return id;
            }
            var id2;
            var i = 0;
            while (true) {
                id2 = id + "." + i;
                if (!ctx.model.entities[id2]) {
                    return id2;
                }
                i++;
            }
        }

        function makeID(ctx, id) {
            return ctx.model.id + "#" + id;
        }

        function error(ctx, msg) {
            ctx.model.error(msg);
        }

    })();

})();
