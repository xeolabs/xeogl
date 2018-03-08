/**
 An **STLModel** is a {{#crossLink "Model"}}{{/crossLink}} loaded from an <a href="https://github.com/KhronosGroup/STL" target = "_other">STL</a> file.

 <a href="../../examples/#importing_gltf_GearboxAssy"><img src="../../../assets/images/gltf/STL_gearbox_squashed.png"></img></a>

 ## Overview

 * An STLModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from an [STL](https://en.wikipedia.org/wiki/STL_(file_format)) file.
 * It begins loading as soon as you set its {{#crossLink "STLModel/src:property"}}{{/crossLink}}
 property to the location of a valid STL file.
 * You can set {{#crossLink "STLModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
 the STLModel to clear itself and load components from the new file.
 * For binary STL, has the option to create a separate {{#crossLink "Entity"}}{{/crossLink}} for each group of faces
 that share the same vertex colors. This allows us to treat STL models as parts assemblies.

 It inherits these capabilities from its {{#crossLink "Model"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the components within it.
 * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * Provides its dynamic World-space axis-aligned boundary.

 ## Examples

 * TODO

 ## Usage

 * [Loading STL](#loading-gltf)
 * [Parsing STL](#parsing-gltf)
 * [Loading options](#loading-options)
 * [Finding loaded Entities](#finding-loaded-entities)
 * [Transforming an STLModel](#transforming-a-gltfmodel)
 * [Getting the World-space boundary of an STLModel](#getting-the-world-space-boundary-of-a-gltfmodel)
 * [Clearing an STLModel](#clearing-a-gltfmodel)
 * [Destroying an STLModel](#destroying-a-gltfmodel)

 ### Loading STL

 Load an STL file by creating an STLModel:

 ````javascript
 var model = new xeogl.STLModel({
     id: "gearbox",
     src: "models/STL/gearbox_conical/scene.gltf",
 });
 ````

 An STLModel prefixes its own ID to those of its components. The ID is optional, but in this example we're providing our own custom ID.

 The STLModel begins loading the STL file immediately.

 To bind a callback to be notified when the file has loaded (which fires immediately if already loaded):

 ````javascript
 model.on("loaded", function() {
        // STLModel has loaded!
    });
 ````

 You can also bind a callback to fire if loading fails:

 ````javascript
 model.on("error", function(msg) {
        // Error occurred
    });
 ````

 To switch to a different STL file, simply update {{#crossLink "STLModel/src:property"}}{{/crossLink}}:

 ````javascript
 model.src = "models/gltf/Buggy/STL/Buggy.gltf"
 ````

 ### Parsing STL

 If we have an STL JSON with embedded assets in memory, then we can parse it straight into an STLModel using the
 static {{#crossLink "STLModel/parse:method"}}{{/crossLink}}:

 ````javascript
 xeogl.STLModel.parse(model, json); // Clears the target model first
 ````

 ### Loading options

 The following options may be specified when loading STL:

 | Option | Type | Range | Default Value | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 | quantizeGeometry | Boolean |  | true | When true, quantizes geometry to reduce memory and GPU bus usage (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | combineGeometry | Boolean |  | true | When true, combines geometry vertex buffers to improve rendering performance (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | backfaces | Boolean |  | true | When true, allows visible backfaces, wherever specified in the STL. When false, ignores backfaces. |
 | ghost | Boolean |  | false | When true, ghosts all the model's Entities (see {{#crossLink "Entity"}}{{/crossLink}} and {{#crossLink "GhostMaterial"}}{{/crossLink}}). |
 | outline | Boolean |  | false | When true, outlines all the model's Entities (see {{#crossLink "Entity"}}{{/crossLink}} and {{#crossLink "OutlineMaterial"}}{{/crossLink}}). |
 | highlight | Boolean |  | false | When true, highlights all the model's Entities (see {{#crossLink "Entity"}}{{/crossLink}} and {{#crossLink "HighlightMaterial"}}{{/crossLink}}). |
 | ghostEdgeThreshold | Number | [0..180] | 2 | When ghosting, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn. |
 | splitEntities | Boolean |  | true | When true, creates a separate {{#crossLink "Entity"}}{{/crossLink}} for each group of faces that share the same vertex colors. Only works with binary STL.| |

 ### Finding STLModels in Scenes

 Our STLModel will now be registered by ID on its Scene, so we can now find it like this:

 ````javascript
 model = xeogl.scene.models["gearbox"];
 ````

 That's assuming that we've created the STLModel in the default xeogl Scene, which we're doing in these examples.

 ### Finding loaded Entities

 Once the STLModel has loaded, its {{#crossLink "Scene"}}{{/crossLink}} will contain various components that represent the elements of the STL file.
 We'll now access some of those components by ID, to query and update them programmatically.

 Let's highlight an {{#crossLink "Entity"}}Entities{{/crossLink}} in our STLModel:

 ````javascript
 var entities = scene.entities;

 entities["gearbox#1"].highlight = true;
 ````

 An STLModel also has ID maps of the components within it. Its components map contains all
 its {{#crossLink "Component"}}Components{{/crossLink}} in one big map:

 ````javascript
 model.components["gearbox#1"].highlight = true;
 ````

 while its entities map contains just the {{#crossLink "Entity"}}Entities{{/crossLink}}:

 ````javascript
 model.entities["gearbox#1"].highlight = true;
 ````

 TODO: ID format description

 ### Transforming an STLModel

 An STLModel lets us transform its Entities as a group.

 We can attach a modeling {{#crossLink "Transform"}}{{/crossLink}} to our STLModel, as a either a
 configuration object or a component instance:

 ```` Javascript
 // Attach transforms as a configuration object:
 model.transform = {
        type: "xeogl.Translate",
        xyz: [-35, 0, 0],
        parent: {
            type: "xeogl.Rotate",
            xyz: [0, 1, 0],
            angle: 45
        }
     };

 // Attach our own transform instances:
 model.transform = new xeogl.Translate({
        xyz: [-35, 0, 0],
        parent: new xeogl.Rotate({
            xyz: [0, 1, 0],
            angle: 45
        })
     });
 ````

 We can also provide the {{#crossLink "Transform"}}{{/crossLink}} to the STLModel constructor, as either configuration
 objects or instances.

 Here we'll provide a Transform hierarchy as a configuration object:

 ```` Javascript
 // Model internally instantiates our transform components:
 var model = new xeogl.STLModel({
     src: "models/gltf/gearbox_conical/scene.gltf",
     transform: {
        type: "xeogl.Translate",
        xyz: [-35, 0, 0],
        parent: {
            type: "xeogl.Rotate",
            xyz: [0, 1, 0],
            angle: 45
        }
     }
 });

 ````

 ### Getting the World-space boundary of an STLModel

 Get the World-space axis-aligned boundary like this:

 ```` Javascript
 model.on("boundary", function() {
    var aabb = model.aabb; //  [xmin, ymin,zmin,xmax,ymax, zmax]
    //...
 });
 ````

 We can also subscribe to changes to that boundary, which will happen whenever

 * the STLModel's {{#crossLink "Transform"}}{{/crossLink}} is updated,
 * components are added or removed, or
 * the STLModel is reloaded from a different source,
 * the {{#crossLink "Geometry"}}Geometries{{/crossLink}} or {{#crossLink "Transform"}}Transforms{{/crossLink}} of its {{#crossLink "Entities"}}Entities{{/crossLink}} are updated.

 ````javascript
 model.on("boundary", function() {
    var aabb = model.aabb; // [xmin, ymin,zmin,xmax,ymax, zmax]
 });
 ````

 ### Clearing an STLModel

 ```` Javascript
 model.clear();
 ````

 ### Destroying an STLModel

 ```` Javascript
 model.destroy();
 ````

 @class STLModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this STLModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this STLModel.
 @param [cfg.src] {String} Path to an STL file. You can set this to a new file path at any time, which will cause the
 @param [cfg.quantizeGeometry=true] When true, quantizes geometry to reduce memory and GPU bus usage. |
 @param [cfg.combineGeometry=true] When true, combines geometry vertex buffers to improve rendering performance. |
 @param [cfg.backfaces=false] When true, allows visible backfaces, wherever specified in the STL. When false, ignores backfaces. |
 @param [cfg.ghost=false] {Boolean} When true, sets all the Model's Entities initially ghosted. |
 @param [cfg.highlight=false] {Boolean} When true, sets all the Model's Entities initially highlighted. |
 @param [cfg.outline=false] {Boolean} When true, sets all the Model's Entities initially outlined. |
 @param [cfg.ghostEdgeThreshold=2] {Number} When ghosting, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn. |
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this STLModel.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this STLModel. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the STLModel attaches to its {{#crossLink "Entity"}}Entities{{/crossLink}}.
 @param [cfg.splitEntities=true] {Boolean} When true, creates a separate {{#crossLink "Entity"}}{{/crossLink}} for each group of faces that share the same vertex colors. Only works with binary STL.|
 @extends Model
 */
(function () {

    "use strict";

    xeogl.STLModel = xeogl.Model.extend({

        type: "xeogl.STLModel",

        _init: function (cfg) {
            this._super(cfg);
            this._src = null;
            this._options = {
                combineGeometry: cfg.combineGeometry !== false,
                quantizeGeometry: cfg.quantizeGeometry !== false,
                ghostEdgeThreshold: cfg.ghostEdgeThreshold,
                splitEntities: cfg.splitEntities
            };
            this.src = cfg.src;
        },

        _props: {

            /**
             Path to an STL file.

             You can set this to a new file path at any time (except while loading), which will cause the STLModel to load components from
             the new file (after first destroying any components loaded from a previous file path).

             Fires a {{#crossLink "STLModel/loaded:event"}}{{/crossLink}} event when the STL has loaded.

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
                    if (value === this._src) { // Already loaded this STLModel

                        /**
                         Fired whenever this STLModel has finished loading components from the STL file
                         specified by {{#crossLink "STLModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        this.fire("loaded", true, true);
                        return;
                    }
                    this.destroyAll();
                    this._src = value;
                    xeogl.STLModel.load(this, this._src, this._options);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _destroy: function () {
            this.destroyAll();
        }
    });

    /**
     * Loads STL from a URL into a {{#crossLink "Model"}}{{/crossLink}}.
     *
     * @param {Model} model Model to load into.
     * @param {String} src Path to STL file.
     * @param {Object} options Loading options.
     * @param {Function} [ok] Completion callback.
     * @param {Function} [error] Error callback.
     */
    xeogl.STLModel.load = function (model, src, options, ok, error) {
        var spinner = model.scene.canvas.spinner;
        spinner.processes++;
        load(model, src, options, function () {
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
                 Fired whenever this STLModel fails to load the STL file
                 specified by {{#crossLink "STLModel/src:property"}}{{/crossLink}}.
                 @event error
                 @param msg {String} Description of the error
                 */
                model.fire("error", msg);
            });
    };


    /**
     * Parses STL into a {{#crossLink "Model"}}{{/crossLink}}.
     *
     * @param {Model} model Model to parse into.
     * @param {ArrayBuffer} data The STL data.
     * @param {Object} [options] Parsing options
     * @param {String} [options.basePath] Base path path to find external resources on, if any.
     * @param {String} [options.loadBuffer] Callback to load buffer files.
     */
    xeogl.STLModel.parse = function (model, data, options) {
        options = options || {};
        var spinner = model.scene.canvas.spinner;
        spinner.processes++;
        parse(data, "", options, model, function () {
                spinner.processes--;
                model.fire("loaded", true, true);
            },
            function (msg) {
                spinner.processes--;
                model.error(msg);
                model.fire("error", msg);
            });
    };

    var load = (function () {
        function loadData(src, ok, error) {
            var request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.open('GET', src, true);
            request.responseType = 'arraybuffer';
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == "200") {
                    ok(request.response, this);
                }
            };
            request.send(null);
        }

        return function (model, src, options, ok, error) {
            loadData(src, function (data) { // OK
                    parse(data, model, options);
                    ok();
                },
                error);
        };
    })();

    function parse(data, model, options) {

        function isBinary(data) {
            var reader = new DataView(data);
            var numFaces = reader.getUint32(80, true);
            var faceSize = ( 32 / 8 * 3 ) + ( ( 32 / 8 * 3 ) * 3 ) + ( 16 / 8 );
            var numExpectedBytes = 80 + ( 32 / 8 ) + ( numFaces * faceSize );
            if (numExpectedBytes === reader.byteLength) {
                return true;
            }
            var solid = [115, 111, 108, 105, 100];
            for (var i = 0; i < 5; i++) {
                if (solid[i] != reader.getUint8(i, false)) {
                    return true;
                }
            }
            return false;
        }

        function parseBinary(data, model, options) {
            var reader = new DataView(data);
            var faces = reader.getUint32(80, true);
            var r;
            var g;
            var b;
            var hasColors = false;
            var colors;
            var defaultR;
            var defaultG;
            var defaultB;
            var lastR = null;
            var lastG = null;
            var lastB = null;
            var newEntity = false;
            var alpha;
            var entityCount = 0;
            var indices;
            var geometry;
            var entity;
            for (var index = 0; index < 80 - 10; index++) {
                if (( reader.getUint32(index, false) == 0x434F4C4F /*COLO*/ ) &&
                    ( reader.getUint8(index + 4) == 0x52 /*'R'*/ ) &&
                    ( reader.getUint8(index + 5) == 0x3D /*'='*/ )) {
                    hasColors = true;
                    colors = [];
                    defaultR = reader.getUint8(index + 6) / 255;
                    defaultG = reader.getUint8(index + 7) / 255;
                    defaultB = reader.getUint8(index + 8) / 255;
                    alpha = reader.getUint8(index + 9) / 255;
                }
            }
            var material = new xeogl.MetallicMaterial(model, {
                roughness: 0.5
            });
            model.add(material);
            var dataOffset = 84;
            var faceLength = 12 * 4 + 2;
            var positions = [];
            var normals = [];
            var splitEntities = options.splitEntities;
            for (var face = 0; face < faces; face++) {
                var start = dataOffset + face * faceLength;
                var normalX = reader.getFloat32(start, true);
                var normalY = reader.getFloat32(start + 4, true);
                var normalZ = reader.getFloat32(start + 8, true);
                if (hasColors) {
                    var packedColor = reader.getUint16(start + 48, true);
                    if (( packedColor & 0x8000 ) === 0) {
                        r = ( packedColor & 0x1F ) / 31;
                        g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
                        b = ( ( packedColor >> 10 ) & 0x1F ) / 31;
                    } else {
                        r = defaultR;
                        g = defaultG;
                        b = defaultB;
                    }
                    if (splitEntities && r !== lastR || g !== lastG || b !== lastB) {
                        if (lastR !== null) {
                            newEntity = true;
                        }
                        lastR = r;
                        lastG = g;
                        lastB = b;
                    }
                }
                for (var i = 1; i <= 3; i++) {
                    var vertexstart = start + i * 12;
                    positions.push(reader.getFloat32(vertexstart, true));
                    positions.push(reader.getFloat32(vertexstart + 4, true));
                    positions.push(reader.getFloat32(vertexstart + 8, true));
                    normals.push(normalX, normalY, normalZ);
                    if (hasColors) {
                        colors.push(r, g, b, 1); // TODO: handle alpha
                    }
                }
                if (splitEntities && newEntity) {
                    indices = new Int32Array(positions.length / 3);
                    for (var ni = 0, len = indices.length; ni < len; ni++) {
                        indices[ni] = ni;
                    }
                    geometry = new xeogl.Geometry(model, {
                        primitive: "triangles",
                        positions: positions,
                        normals: normals,
                        colors: colors,
                        indices: indices
                    });
                    entity = new xeogl.Entity(model, {
                        id: model.id + "#" + entityCount++,
                        geometry: geometry,
                        material: material
                    });
                    model.add(geometry);
                    model.add(entity);
                    positions = [];
                    normals = [];
                    colors = colors ? [] : null;
                    newEntity = false;
                }
            }
            if (positions.length > 0) {
                indices = new Int32Array(positions.length / 3);
                for (var ni = 0, len = indices.length; ni < len; ni++) {
                    indices[ni] = ni;
                }
                geometry = new xeogl.Geometry(model, {
                    primitive: "triangles",
                    positions: positions,
                    normals: normals,
                    colors: colors,
                    indices: indices
                });
                entity = new xeogl.Entity(model, {
                    id: model.id + "#" + entityCount++,
                    geometry: geometry,
                    material: material
                });
                model.add(geometry);
                model.add(entity);
            }
        }

        function parseASCII(data) {
            var faceRegex = /facet([\s\S]*?)endfacet/g;
            var faceCounter = 0;
            var floatRegex = /[\s]+([+-]?(?:\d+.\d+|\d+.|\d+|.\d+)(?:[eE][+-]?\d+)?)/.source;
            var vertexRegex = new RegExp('vertex' + floatRegex + floatRegex + floatRegex, 'g');
            var normalRegex = new RegExp('normal' + floatRegex + floatRegex + floatRegex, 'g');
            var positions = [];
            var normals = [];
            var normal = xeogl.math.vec3();
            var result;
            var verticesPerFace;
            var normalsPerFace;
            var text;
            while (( result = faceRegex.exec(data) ) !== null) {
                verticesPerFace = 0;
                normalsPerFace = 0;
                text = result[0];
                while (( result = normalRegex.exec(text) ) !== null) {
                    normal.x = parseFloat(result[1]);
                    normal.y = parseFloat(result[2]);
                    normal.z = parseFloat(result[3]);
                    normalsPerFace++;
                }
                while (( result = vertexRegex.exec(text) ) !== null) {
                    positions.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                    normals.push(normal.x, normal.y, normal.z);
                    verticesPerFace++;
                }
                if (normalsPerFace !== 1) {
                    model.error("Error in normal of face " + faceCounter);
                }
                if (verticesPerFace !== 3) {
                    model.error("Error in positions of face " + faceCounter);
                }
                faceCounter++;
            }
            var indices = new Int32Array(positions.length / 3);
            for (var ni = 0, len = indices.length; ni < len; ni++) {
                indices[ni] = ni;
            }
            var material = new xeogl.MetallicMaterial(model, {
                roughness: 0.5
            });
            var geometry = new xeogl.Geometry(model, {
                primitive: "triangles",
                positions: positions,
                normals: normals,
                indices: indices
            });
            var entity = new xeogl.Entity(model, {
                id: model.id + "#1",
                geometry: geometry,
                material: material
            });
            model.add(material);
            model.add(geometry);
            model.add(entity);
        }

        function ensureString(buffer) {
            if (typeof buffer !== 'string') {
                return decodeText(new Uint8Array(buffer));
            }
            return buffer;
        }

        function ensureBinary(buffer) {
            if (typeof buffer === 'string') {
                var arrayBuffer = new Uint8Array(buffer.length);
                for (var i = 0; i < buffer.length; i++) {
                    arrayBuffer[i] = buffer.charCodeAt(i) & 0xff; // implicitly assumes little-endian
                }
                return arrayBuffer.buffer || arrayBuffer;
            } else {
                return buffer;
            }
        }

        function decodeText(array) {
            if (typeof TextDecoder !== 'undefined') {
                return new TextDecoder().decode(array);
            }
            var s = '';
            for (var i = 0, il = array.length; i < il; i++) {
                s += String.fromCharCode(array[i]); // Implicitly assumes little-endian.
            }
            return decodeURIComponent(escape(s));
        }

        var binData = ensureBinary(data);

        return isBinary(binData) ? parseBinary(binData, model, options) : parseASCII(ensureString(data), model, options);
    }
})();
