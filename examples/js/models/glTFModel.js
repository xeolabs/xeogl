/**
 A **GLTFModel** is a {{#crossLink "Model"}}{{/crossLink}} that's loaded from a <a href="https://github.com/KhronosGroup/glTF" target = "_other">glTF</a> file.

 <a href="../../examples/#importing_gltf_GearboxAssy"><img src="../../../assets/images/gltf/glTF_gearbox_squashed.png"></img></a>

 ## Overview

 * Extends {{#crossLink "Model"}}{{/crossLink}}, which extends {{#crossLink "Group"}}{{/crossLink}}, which extends {{#crossLink "Object"}}{{/crossLink}}.
 * Plugs into the scene graph and contains child {{#crossLink "Objects"}}{{/crossLink}} that represent its glTF model's scene node elements.
 * Can be configured with a handleNode callback to customize the way child Objects are created from glTF scene nodes.
 * Provides its dynamic World-space axis-aligned bounding box (AABB).
 * May be transformed, shown, hidden, ghosted, highlighted etc. as a unit.
 * May be configured to compress and batch geometries.
 * May be configured to convert materials to {{#crossLink "LambertMaterial"}}{{/crossLink}} for faster rendering.

 ## Supported glTF 2.0 features

 So far, GLTFModel loads only geometry, materials and modeling transform hierarchies, without animations. It does not
 load cameras or lights because its purpose is to import models into environments that have already been created using
 the xeogl API.

 In addition to glTF's core metal-roughness material workflow, GLTFModel also supports two material extensions:

 * KHR_materials_pbrSpecularGlossiness
 * KHR_materials_common

 ## Examples

 * [Damaged Helmet with metal/rough PBR materials](../../examples/#importing_gltf_DamagedHelmet)
 * [Hover bike with specular/glossiness PBR materials](../../examples/#importing_gltf_Hoverbike)
 * [Loading glTF with embedded assets](../../examples/#importing_gltf_embedded)
 * [Parsing glTF JSON with embedded assets](../../examples/#importing_gltf_parsing_embedded)
 * [Ignoring materials when loading](../../examples/#importing_gltf_options_ignoreMaterials)
 * [Converting materials to simple Lambertian when loading](../../examples/#importing_gltf_options_lambertMaterials)
 * [All loading options for max performance](../../examples/#importing_gltf_options_maxPerformance)
 * [Models within object hierarchies](../../examples/#objects_hierarchy_models)

 ## Usage

 * [Loading glTF](#loading-gltf)
 * [Parsing glTF](#parsing-gltf)
 * [Loading options](#loading-options)
 * [handleNode callback](#handlenode-callback)
 * [Generating IDs for loaded Objects](#generating-ids-for-loaded-objects)
 * [Transforming a GLTFModel](#transforming-a-gltfmodel)
 * [Getting the World-space boundary of a GLTFModel](#getting-the-world-space-boundary-of-a-gltfmodel)
 * [Clearing a GLTFModel](#clearing-a-gltfmodel)
 * [Destroying a GLTFModel](#destroying-a-gltfmodel)

 ### Loading glTF

 Load a glTF file by creating a GLTFModel:

 ````javascript
 var model = new xeogl.GLTFModel({
     id: "gearbox",
     src: "models/gltf/gearbox_conical/scene.gltf",
 });
 ````

 A GLTFModel prefixes its own ID to those of its components. The ID is optional, but in this example we're providing our own custom ID.

 The GLTFModel begins loading the glTF file immediately.

 To bind a callback to be notified when the file has loaded (which fires immediately if already loaded):

 ````javascript
 model.on("loaded", function() {
        // GLTFModel has loaded!
    });
 ````

 You can also bind a callback to fire if loading fails:

 ````javascript
 model.on("error", function(msg) {
        // Error occurred
    });
 ````

 To switch to a different glTF file, simply update {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}:

 ````javascript
 model.src = "models/gltf/Buggy/glTF/Buggy.gltf"
 ````

 #### Finding GLTFModels in Scenes

 Our GLTFModel will now be registered by ID on its  {{#crossLink "Scene"}}{{/crossLink}}, so we can now find it like this:

 ````javascript
 var scene = xeogl.getDefaultScene();
 model = scene.models["gearbox"];
 ````

 That's assuming that we've created the GLTFModel in the default Scene, which we're doing in these examples.

 We can also get all the GLTFModels in a Scene, using the Scene's {{#crossLink "Scene/types:property"}}{{/crossLink}} map:

 ````javascript
 var gltfModels = scene.types["xeogl.GLTFModel"];

 model = gltfModels["myModel"];
 ````

 ### Parsing glTF

 If we have a glTF JSON with embedded assets in memory, then we can parse it straight into a GLTFModel using the
 static {{#crossLink "GLTFModel/parse:method"}}{{/crossLink}} method:

 ````javascript
 xeogl.GLTFModel.parse(model, json); // Clears the target model first
 ````

 ### Loading options

 The following options may be specified when loading glTF:

 | Option | Type | Range | Default Value | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 | lambertMaterials | Boolean |  | false | When true, gives each {{#crossLink "Mesh"}}{{/crossLink}} the same {{#crossLink "LambertMaterial"}}{{/crossLink}} and a {{#crossLink "Mesh/colorize:property"}}{{/crossLink}} set the to diffuse color extracted from the glTF material. This is typically used for CAD models with huge amounts of objects, and will ignore textures.|
 | quantizeGeometry | Boolean |  | true | When true, quantizes geometry to reduce memory and GPU bus usage (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | combineGeometry | Boolean |  | true | When true, combines geometry vertex buffers to improve rendering performance (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | backfaces | Boolean |  | true | When true, allows visible backfaces, wherever specified in the glTF. When false, ignores backfaces. |
 | ghosted | Boolean |  | false | When true, ghosts all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EmphasisMaterial"}}{{/crossLink}}). |
 | outlined | Boolean |  | false | When true, outlines all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "OutlineMaterial"}}{{/crossLink}}). |
 | selected | Boolean |  | false | When true, renders all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "OutlineMaterial"}}{{/crossLink}}). |
 | highlighted | Boolean |  | false | When true, highlights all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EmphasisMaterial"}}{{/crossLink}}). |
 | edges | Boolean |  | false | When true, emphasizes the edges on all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EdgeMaterial"}}{{/crossLink}}). |
 | edgeThreshold | Number | [0..180] | 20 | When ghosting, highlighting, selecting or edging, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn. |
 | handleNode | Function(object, object) | | null | Optional callback to mask which {{#crossLink "Object"}}Objects{{/crossLink}} are loaded. Each Object will only be loaded when this callback returns ````true```. |

 As mentioned above, GLTFModels are {{#crossLink "Object"}}Objects{{/crossLink}} that plug into the scene graph, containing
 child Objects of their own, that represent their glTF
 model's ````scene```` ````node```` elements.

 GLTFModels can also be configured with a ````handleNode```` callback to determine how their child
 {{#crossLink "Object"}}{{/crossLink}} hierarchies are created as they load the ````node```` elements.

 #### handleNode callback

 As a GLTFModel parses glTF, it creates child {{#crossLink "Object"}}Objects{{/crossLink}} from the ````node```` elements in the glTF ````scene````.

 GLTFModel traverses the ````node```` elements in depth-first order. We can configure a GLTFModel with
 a ````handleNode```` callback to call at each ````node````, to indicate how to process the ````node````.

 Typically, we would use the callback to selectively create Objects from the glTF ````scene````, while maybe also
 configuring those Objects depending on what the callback finds on their glTF ````node```` elements.

 For example, we might want to load a building model and set all its wall objects initially highlighted. For ````node```` elements
 that have some sort of attribute that indicate that they are walls, then the callback can indicate that the GLTFModel
 should create Objects that are initially highlighted.

 The callback accepts two arguments:

 * ````nodeInfo```` - the glTF node element.
 * ````actions```` - an object on to which the callback may attach optional configs for each Object to create.

 When the callback returns nothing or ````false````, then GLTFModel skips the given ````node```` and its children.

 When the callback returns ````true````, then the GLTFModel may process the ````node````.

 For each Object to create, the callback can specify initial properties for it by creating a ````createObject```` on
 its ````actions```` argument, containing values for those properties.

 In the example below, we're loading a GLTF model of a building. We use the callback create Objects only
 for ````node```` elements who name is not "dontLoadMe". For those Objects, we set them highlighted if
 their ````node```` element's name happens to be "wall".

 ````javascript
 var model = new xeogl.GLTFModel({
    src: "models/myBuilding.gltf",

    // Callback to intercept creation of objects while parsing glTF scene nodes

    handleNode: function (nodeInfo, actions) {

        var name = nodeInfo.name;

        // Don't parse glTF scene nodes that have no "name" attribute,
        // but do continue down to parse their children.
        if (!name) {
            return true; // Continue descending this node subtree
        }

        // Don't parse glTF scene nodes named "dontLoadMe",
        // and skip their children as well.
        if (name === "dontLoadMe") {
            return false; // Stop descending this node subtree
        }

        // Create an Object for each glTF scene node.

        // Highlight the Object if the name is "wall"

        actions.createObject = {
            highlighted: name === "wall"
        };

        return true; // Continue descending this glTF node subtree
    }
});
 ````

 #### Generating IDs for loaded Objects

 You can use the ````handleNodeNode```` callback to generate a unique ID for each loaded {{#crossLink "Object"}}Object{{/crossLink}}:

 ````javascript
 var model = new xeogl.GLTFModel({
    id: "gearbox",
    src: "models/gltf/gearbox_conical/scene.gltf",
    handleNode: (function() {
        var objectCount = 0;
        return function (nodeInfo, actions) {
            if (nodeInfo.mesh !== undefined) { // Node has a mesh
                actions.createObject = {
                    id: "gearbox." + objectCount++
                };
            }
            return true;
        };
    })()
});

 // Highlight a couple of Objects by ID
 model.on("loaded", function () {
    model.objects["gearbox.83"].highlighted = true;
    model.objects["gearbox.81"].highlighted = true;
});
 ````

 If the ````node```` elements have ````name```` attributes, then we can also use those names with the ````handleNodeNode```` callback
 to generate a (hopefully) unique ID for each loaded {{#crossLink "Object"}}Object{{/crossLink}}:

 ````javascript
 var adamModel = new xeogl.GLTFModel({
    id: "adam",
    src: "models/gltf/adamHead/adamHead.gltf",
    handleNode: function (nodeInfo, actions) {
        if (nodeInfo.name && nodeInfo.mesh !== undefined) { // Node has a name and a mesh
            actions.createObject = {
                id: "adam." + nodeInfo.name
            };
        }
        return true;
    }
});

 // Highlight a couple of Objects by ID
 model.on("loaded", function () {
    model.objects["adam.node_mesh_Adam_mask_-4108.0"].highlighted = true; // ID contains name
    model.objects["adam.node_Object001_-4112.5"].highlighted = true;
});
 ````

 ### Transforming a GLTFModel

 A GLTFModel lets us transform its Objects as a group:

 ```` Javascript
 var model = new xeogl.GLTFModel({
     src: "models/carModel.gltf",
     position: [-35, 0, 0],
     rotation: [0, 45, 0],
     scale: [0.5, 0.5, 0.5]
 });

 model.position = [-20, 0, 0];
 ````

 ### Getting the World-space boundary of a GLTFModel

 Get the World-space axis-aligned boundary like this:

 ```` Javascript
 model.on("boundary", function() {
    var aabb = model.aabb; //  [xmin, ymin,zmin,xmax,ymax, zmax]
    //...
 });
 ````

 We can also subscribe to changes to that boundary, which will happen whenever

 * the GLTFModel's {{#crossLink "Transform"}}{{/crossLink}} is updated,
 * components are added or removed, or
 * the GLTF model is reloaded from a different source,
 * its {{#crossLink "Geometry"}}Geometries{{/crossLink}} or {{#crossLink "Object"}}Objects{{/crossLink}} are updated.

 ````javascript
 model.on("boundary", function() {
    var aabb = model.aabb; // [xmin, ymin,zmin,xmax,ymax, zmax]
 });
 ````

 ### Clearing a GLTFModel

 ```` Javascript
 model.clear();
 ````

 ### Destroying a GLTFModel

 ```` Javascript
 model.destroy();
 ````

 @class GLTFModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GLTFModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GLTFModel.
 @param [cfg.parent] The parent Object.
 @param [cfg.visible=true] {Boolean}  Indicates if this GLTFModel is visible.
 @param [cfg.culled=false] {Boolean}  Indicates if this GLTFModel is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this GLTFModel is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this GLTFModel is clippable.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this GLTFModel.
 @param [cfg.ghosted=false] {Boolean} Whether this GLTFModel is rendered ghosted.
 @param [cfg.highlighted=false] {Boolean} Whether this GLTFModel is rendered highlighted.
 @param [cfg.selected=false] {Boolean} Whether this GLTFModel is rendered selected.
 @param [cfg.edges=false] {Boolean} Whether this GLTFModel is rendered with edges emphasized.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.position=[0,0,0]] {Float32Array} The GLTFModel's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The GLTFModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The GLTFModel's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} GLTFThe Model's local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @param [cfg.src] {String} Path to a glTF file. You can set this to a new file path at any time, which will cause the
 @param [cfg.loaded=true] {Boolean} Indicates whether this GLTFModel is loaded or not. If initially set false, then the GLTFModel will load as soon as you set it true while {{#crossLink "GLTFModel/src:property"}}{{/crossLink}} is set to the location of a glTF file.
 @param [cfg.lambertMaterials=false] {Boolean} When true, gives each {{#crossLink "Mesh"}}{{/crossLink}} the same {{#crossLink "LambertMaterial"}}{{/crossLink}} and a {{#crossLink "Mesh/colorize:property"}}{{/crossLink}} value set the to diffuse color extracted from the glTF material. This is typically used for CAD models with huge amounts of objects, and will ignore textures.
 @param [cfg.quantizeGeometry=true] {Boolean} When true, quantizes geometry to reduce memory and GPU bus usage.
 @param [cfg.combineGeometry=true] {Boolean} When true, combines geometry vertex buffers to improve rendering performance.
 @param [cfg.backfaces=false] {Boolean} When true, allows visible backfaces, wherever specified in the glTF. When false, ignores backfaces.
 @param [cfg.edgeThreshold=20] {Number} When ghosting, highlighting, selecting or edging, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn.
 @param [cfg.handleNode] {Function} Optional callback to mask which {{#crossLink "Object"}}Objects{{/crossLink}} are loaded. Each Object will only be loaded when this callback returns ````true``` for its ID.

 @extends Model
 */
{
    xeogl.GLTFModel = class xeoglGLTFModel extends xeogl.Model {

        init(cfg) {

            super.init(cfg); // Call xeogl.Model._init()

            this._src = null;
            this._options = {
                ignoreMaterials: !!cfg.ignoreMaterials,
                combineGeometry: cfg.combineGeometry !== false,
                quantizeGeometry: cfg.quantizeGeometry !== false,
                edgeThreshold: cfg.edgeThreshold || 20,
                lambertMaterials: !!cfg.lambertMaterials,
                handleNode: cfg.handleNode
            };
            this.loaded = cfg.loaded;
            this.src = cfg.src;
        }


        /**
         Array of all the root {{#crossLink "Object"}}Objects{{/crossLink}} in this GLTFModel.

         @property children
         @final
         @type Array
         */

        /**
         Map of all the root {{#crossLink "Object"}}Objects{{/crossLink}} in this GLTFModel, mapped to their IDs.

         @property childMap
         @final
         @type {*}
         */

        /**
         Indicates whether this GLTFModel is loaded or not.

         @property loaded
         @default true
         @type Boolean
         */
        set loaded(value) {
            value = value !== false;
            if (this._loaded === value) {
                return;
            }
            this._loaded = value;
            this.clear();
            if (this._loaded) {
                if (this._src) {
                    xeogl.GLTFModel.load(this, this._src, this._options);
                }
            }
        }

        get loaded() {
            return this._loaded;
        }

        /**
         Path to a glTF file.

         You can set this to a new file path at any time (except while loading), which will cause the GLTFModel to load components from
         the new file (after first destroying any components loaded from a previous file path).

         Fires a {{#crossLink "GLTFModel/loaded:event"}}{{/crossLink}} event when the glTF has loaded.

         @property src
         @type String
         */
        set src(value) {
            if (!value) {
                this.clear();
                this._src = null;
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
            this.clear();
            this._src = value;
            if (this._loaded) {
                xeogl.GLTFModel.load(this, this._src, this._options);
            }
        }

        get src() {
            return this._src;
        }

        /**
         * Loads glTF from a URL into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method load
         * @static
         * @param {Model} model Model to load into.
         * @param {String} src Path to glTF file.
         * @param {Object} options Loading options.
         * @param {Function} [ok] Completion callback.
         * @param {Function} [error] Error callback.
         */
        static load(model, src, options, ok, error) {
            var spinner = model.scene.canvas.spinner;
            spinner.processes++;
            loadGLTF(model, src, options, function () {
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
                    if (error) {
                        error(msg);
                    }
                    /**
                     Fired whenever this GLTFModel fails to load the glTF file
                     specified by {{#crossLink "GLTFModel/src:property"}}{{/crossLink}}.
                     @event error
                     @param msg {String} Description of the error
                     */
                    model.fire("error", msg);
                });
        }

        /**
         * Parses glTF JSON into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method parse
         * @static
         * @param {Model} model Model to parse into.
         * @param {Object} gltf The glTF JSON.
         * @param {Object} [options] Parsing options
         * @param {String} [options.basePath] Base path path to find external resources on, if any.
         * @param {String} [options.loadBuffer] Callback to load buffer files.
         */
        static parse(model, gltf, options, ok, error) {
            options = options || {};
            var spinner = model.scene.canvas.spinner;
            spinner.processes++;
            parseGLTF(gltf, "", options, model, function () {
                    spinner.processes--;
                    model.fire("loaded", true, true);
                    if (ok) {
                        ok();
                    }
                },
                function (msg) {
                    spinner.processes--;
                    model.error(msg);
                    model.fire("error", msg);
                    if (error) {
                        error(msg);
                    }
                });
        }
    };

//--------------------------------------------------------------------------------------------
// Loads glTF V2.0
//--------------------------------------------------------------------------------------------

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
                    // Some browsers return HTTP Status 0 when using non-http protocol
                    // e.g. 'file://' or 'data://'. Handle as success.
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

        return function (json, src, options, model, ok) {

            model.clear();

            var ctx = {
                src: src,
                loadBuffer: options.loadBuffer,
                basePath: options.basePath,
                handleNode: options.handleNode,
                ignoreMaterials: !!options.ignoreMaterials,
                combineGeometry: options.combineGeometry,
                quantizeGeometry: options.quantizeGeometry,
                edgeThreshold: options.edgeThreshold,
                lambertMaterials: !!options.lambertMaterials,
                json: json,
                scene: model.scene,
                model: model,
                modelProps: {
                    visible: model.visible,
                    culled: model.culled,
                    ghosted: model.ghosted,
                    highlighted: model.highlighted,
                    selected: model.selected,
                    outlined: model.outlined,
                    clippable: model.clippable,
                    pickable: model.pickable,
                    collidable: model.collidable,
                    castShadow: model.castShadow,
                    receiveShadow: model.receiveShadow,
                    colorize: model.colorize,
                    opacity: model.opacity,
                    edges: model.edges
                },
                numObjects: 0
            };

            model.scene.loading++; // Disables (re)compilation

            loadBuffers(ctx, function () {

                loadBufferViews(ctx);
                loadAccessors(ctx);
                if (!ctx.lambertMaterials) {
                    loadTextures(ctx);
                }
                if (!ctx.ignoreMaterials) {
                    loadMaterials(ctx);
                }
                loadMeshes(ctx);
                loadDefaultScene(ctx);

                model.scene.loading--; // Re-enables (re)compilation

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

                if (ctx.loadBuffer) {
                    ctx.loadBuffer(url, ok, err);

                } else {

                    var request = new XMLHttpRequest();
                    request.open('GET', ctx.basePath + url, true);
                    request.responseType = 'arraybuffer';
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            if (request.status === "200" || request.status === 200) {
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

            if (bufferViewInfo.target === 34963) {
                bufferViewInfo._typedArray = new Uint16Array(bufferViewInfo._buffer);

            } else if (bufferViewInfo.target === 34962) {
                bufferViewInfo._typedArray = new Float32Array(bufferViewInfo._buffer);

            } else {
                //ctx.model.log(bufferViewInfo._typedArray)
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
                src: ctx.json.images[textureInfo.source].uri ? ctx.basePath + ctx.json.images[textureInfo.source].uri : undefined,
                flipY: !!textureInfo.flipY
            });
            ctx.model._addComponent(texture);
            textureInfo._texture = texture;
        }

        function loadMaterials(ctx) {
            var materialsInfo = ctx.json.materials;
            if (materialsInfo) {
                var materialInfo;
                var material;
                for (var i = 0, len = materialsInfo.length; i < len; i++) {
                    materialInfo = materialsInfo[i];
                    if (ctx.lambertMaterials) {
                        // Substitute RGBA for material, to use fast flat shading instead
                        material = loadMaterialColorize(ctx, materialInfo);
                    } else {
                        material = loadMaterial(ctx, materialInfo);
                        ctx.model._addComponent(material);
                    }
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
                    cfg.normalMap.encoding = "linear";
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
                    cfg.emissiveMap.encoding = "sRGB";
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
                            cfg.diffuseMap.encoding = "sRGB";
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
                            cfg.specularGlossinessMap.encoding = "linear";
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
                                cfg.diffuseMap.encoding = "sRGB";
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
                        cfg.baseColorMap.encoding = "sRGB";
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
                        cfg.metallicRoughnessMap.encoding = "linear";
                    }
                }

                return new xeogl.MetallicMaterial(ctx.scene, cfg);
            }

            // Default material

            return new xeogl.PhongMaterial(ctx.scene, cfg);
        }

        // Extract diffuse/baseColor and alpha into RGBA Mesh 'colorize' property
        function loadMaterialColorize(ctx, materialInfo) {

            var json = ctx.json;
            var colorize = new Float32Array([1, 1, 1, 1]);

            var extensions = materialInfo.extensions;
            if (extensions) {

                // Specular PBR material

                var specularPBR = extensions["KHR_materials_pbrSpecularGlossiness"];
                if (specularPBR) {
                    var diffuseFactor = specularPBR.diffuseFactor;
                    if (diffuseFactor !== null && diffuseFactor !== undefined) {
                        colorize.set(diffuseFactor);
                    }
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

            // Metallic PBR naterial

            var metallicPBR = materialInfo.pbrMetallicRoughness;
            if (metallicPBR) {
                var baseColorFactor = metallicPBR.baseColorFactor;
                if (baseColorFactor) {
                    colorize.set(baseColorFactor);
                }
            }

            return colorize;
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
                        primitive: "triangles",
                        combined: ctx.combineGeometry,
                        quantized: ctx.quantizeGeometry,
                        edgeThreshold: ctx.edgeThreshold
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

                    ctx.model._addComponent(geometry);
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
                loadNode(ctx, i, nodeInfo, null, null);
            }
        }

        function loadNode(ctx, nodeIdx, nodeInfo, matrix, parent, parentCfg) {

            parent = parent || ctx.model;
            var createObject;

            if (ctx.handleNode) {
                var actions = {};
                if (!ctx.handleNode(nodeInfo, actions)) {
                    return;
                }
                if (actions.createObject) {
                    createObject = actions.createObject;
                }
                // if (actions.createMesh) {
                //     createMesh = actions.createMesh;
                // }
            }

            var json = ctx.json;
            var model = ctx.model;
            var math = xeogl.math;
            var localMatrix;
            var hasChildNodes = nodeInfo.children && nodeInfo.children.length > 0;
            var group;

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

                    var meshesInfo = meshInfo._mesh;
                    var meshesInfoMesh;
                    var mesh;
                    var numMeshes = meshesInfo.length;

                    if (!createObject && numMeshes > 0 && !hasChildNodes) {

                        // Case 1: Not creating object, node has meshes, node has no child nodes

                        for (var i = 0, len = numMeshes; i < len; i++) {
                            meshesInfoMesh = meshesInfo[i];
                            var meshCfg = {
                                geometry: meshesInfoMesh.geometry,
                                matrix: matrix
                            };
                            xeogl._apply(ctx.modelProps, meshCfg);
                            if (ctx.lambertMaterials) {
                                if (!model.material) {
                                    model.material = new xeogl.LambertMaterial(ctx.scene, {
                                        backfaces: true
                                    });
                                }
                                meshCfg.material = model.material;
                                meshCfg.colorize = meshesInfoMesh.material;
                                meshCfg.opacity = meshesInfoMesh.material[3];
                            } else {
                                meshCfg.material = meshesInfoMesh.material;
                            }
                            mesh = new xeogl.Mesh(ctx.scene, meshCfg);
                            parent.addChild(mesh, false); // Don't automatically inherit properties
                            model._addComponent(mesh);
                        }
                        return;
                    }

                    if (createObject && numMeshes === 1 && !hasChildNodes) {

                        // Case 2: Creating object, node has one mesh, node has no child nodes

                        meshesInfoMesh = meshesInfo[0];
                        var meshCfg = {
                            geometry: meshesInfoMesh.geometry,
                            matrix: matrix
                        };
                        xeogl._apply(ctx.modelProps, meshCfg);
                        if (ctx.lambertMaterials) {
                            if (!model.material) {
                                model.material = new xeogl.LambertMaterial(ctx.scene, {
                                    backfaces: true
                                });
                            }
                            meshCfg.material = model.material;
                            meshCfg.colorize = meshesInfoMesh.material; // [R,G,B,A]
                            meshCfg.opacity = meshesInfoMesh.material[3];
                        } else {
                            meshCfg.material = meshesInfoMesh.material;
                        }
                        xeogl._apply(createObject, meshCfg);
                        mesh = new xeogl.Mesh(ctx.scene, meshCfg);
                        parent.addChild(mesh, false); // Don't automatically inherit properties
                        model._addComponent(mesh);
                        return;
                    }

                    if (createObject && numMeshes > 0 && !hasChildNodes) {

                        // Case 3: Creating object, node has meshes, node has no child nodes

                        var groupCfg = {
                            matrix: matrix
                        };
                        xeogl._apply(ctx.modelProps, groupCfg);
                        xeogl._apply(createObject, groupCfg);
                        var group = new xeogl.Group(ctx.scene, groupCfg);
                        parent.addChild(group, false);
                        model._addComponent(group);
                        for (var i = 0, len = numMeshes; i < len; i++) {
                            meshesInfoMesh = meshesInfo[i];
                            var meshCfg = {
                                geometry: meshesInfoMesh.geometry
                            };
                            xeogl._apply(ctx.modelProps, meshCfg);
                            if (ctx.lambertMaterials) {
                                if (!model.material) {
                                    model.material = new xeogl.LambertMaterial(ctx.scene, {
                                        backfaces: true
                                    });
                                }
                                meshCfg.material = model.material;
                                meshCfg.colorize = meshesInfoMesh.material;
                                meshCfg.opacity = meshesInfoMesh.material[3];
                            } else {
                                meshCfg.material = meshesInfoMesh.material;
                            }
                            xeogl._apply(createObject, meshCfg);
                            meshCfg.id = createObject.id + "." + i;
                            meshCfg.entityType = null;
                            mesh = new xeogl.Mesh(ctx.scene, meshCfg);
                            group.addChild(mesh, false);
                            model._addComponent(mesh);
                        }
                        return;
                    }

                    if (!createObject && numMeshes > 0 && hasChildNodes) {

                        // Case 4: Not creating object, node has meshes, node has child nodes

                        var groupCfg = {
                            matrix: matrix
                        };
                        xeogl._apply(ctx.modelProps, groupCfg);
                        var group = new xeogl.Group(ctx.scene, groupCfg);
                        parent.addChild(group, false);
                        model._addComponent(group);
                        for (var i = 0, len = numMeshes; i < len; i++) {
                            meshesInfoMesh = meshesInfo[i];
                            var meshCfg = {
                                geometry: meshesInfoMesh.geometry
                            };
                            xeogl._apply(groupCfg, meshCfg);
                            meshCfg.entityType = null;
                            meshCfg.matrix = null; // Group has matrix
                            if (ctx.lambertMaterials) {
                                if (!model.material) {
                                    model.material = new xeogl.LambertMaterial(ctx.scene, {
                                        backfaces: true
                                    });
                                }
                                meshCfg.material = model.material;
                                meshCfg.colorize = meshesInfoMesh.material;
                                meshCfg.opacity = meshesInfoMesh.material[3];
                            } else {
                                meshCfg.material = meshesInfoMesh.material;
                            }
                            mesh = new xeogl.Mesh(ctx.scene, meshCfg);
                            group.addChild(mesh, false);
                            model._addComponent(mesh);
                        }
                        matrix = null;
                        parent = group;
                        parentCfg = groupCfg;
                    }

                    if (createObject && numMeshes === 0 && hasChildNodes) {

                        // Case 5: Creating explicit object, node has meshes OR node has child nodes

                        var groupCfg = {
                            matrix: matrix
                        };
                        xeogl._apply(ctx.modelProps, groupCfg);
                        xeogl._apply(createObject, groupCfg);
                        createObject.matrix = matrix;
                        var group = new xeogl.Group(ctx.scene, groupCfg);
                        parent.addChild(group, false); // Don't automatically inherit properties
                        model._addComponent(group);
                        matrix = null;
                        parent = group;
                        parentCfg = groupCfg;
                    }

                    if (createObject && numMeshes > 0 || hasChildNodes) {

                        // Case 6: Creating explicit object, node has meshes OR node has child nodes

                        console.log("Case 6");

                        var groupCfg = {
                            matrix: matrix
                        };
                        xeogl._apply(ctx.modelProps, groupCfg);
                        if (createObject) {
                            xeogl._apply(createObject, groupCfg);
                        }
                        var group = new xeogl.Group(ctx.scene, groupCfg);
                        parent.addChild(group, false); // Don't automatically inherit properties
                        model._addComponent(group);
                        for (var i = 0, len = numMeshes; i < len; i++) {
                            meshesInfoMesh = meshesInfo[i];
                            var meshCfg = {
                                geometry: meshesInfoMesh.geometry
                            };
                            xeogl._apply(ctx.modelProps, meshCfg);
                            if (ctx.lambertMaterials) {
                                if (!model.material) {
                                    model.material = new xeogl.LambertMaterial(ctx.scene, {
                                        backfaces: true
                                    });
                                }
                                meshCfg.material = model.material;
                                meshCfg.colorize = meshesInfoMesh.material; // [R,G,B,A]
                                meshCfg.opacity = meshesInfoMesh.material[3];
                            } else {
                                meshCfg.material = meshesInfoMesh.material;
                            }
                            if (createObject) {
                                xeogl._apply(createObject, meshCfg);
                                meshCfg.id = createObject.id + "." + i;
                            }
                            meshCfg.entityType = null;
                            mesh = new xeogl.Mesh(ctx.scene, meshCfg);
                            group.addChild(mesh, false); // Don't automatically inherit properties
                            model._addComponent(mesh);
                        }
                        matrix = null;
                        parent = group;
                        parentCfg = groupCfg;
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

        function error(ctx, msg) {
            ctx.model.error(msg);
        }

    })();
}