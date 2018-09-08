/**
 An **STLModel** is a {{#crossLink "Model"}}{{/crossLink}} that's loaded from an <a href="https://en.wikipedia.org/wiki/STL_(file_format)">STL</a> file.

 <a href="../../examples/#importing_stl_shapes"><img src="../../../assets/images/screenshots/STLModel.png"></img></a>

 ## Overview

 * An <a href="https://en.wikipedia.org/wiki/STL_(file_format)">STL</a> (“StereoLithography”) file is a triangular representation of a 3-dimensional surface geometry. The surface is
 tessellated logically into a series of triangles. Each facet is described by a perpendicular
 direction and three points representing the vertices (corners) of the triangle.
 * An STLModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from an STL file.
 * It begins loading as soon as you set its {{#crossLink "STLModel/src:property"}}{{/crossLink}}
 property to the location of a valid STL file.
 * You can set {{#crossLink "STLModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
 the STLModel to clear itself and load components from the new file.
 * For binary STL, has the option to create a separate {{#crossLink "Mesh"}}{{/crossLink}} for each group of faces
 that share the same vertex colors. This allows us to treat STL models as parts assemblies.
 * Can be configured to automatically smooth STL models by converting their face-oriented normals to vertex-oriented.

 STLModel inherits these capabilities from its {{#crossLink "Group"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the {{#crossLink "Meshes"}}{{/crossLink}} within it.
 * Can be transformed as a unit within World-space.
 * Can be a child within a parent {{#crossLink "Group"}}{{/crossLink}}.
 * Provides its World-space axis-aligned and object-aligned boundaries.

 ## Examples

 * [Simple shapes with smoothing](../../examples/#importing_stl_shapes)
 * [F1 concept car with smoothing](../../examples/#importing_stl_F1Concept)
 * [Models within an object hierarchy](../../examples/#objects_hierarchy_models)

 ## Usage

 * [Loading STL](#loading-stl)
 * [Parsing STL](#parsing-stl)
 * [Options](#options)
 * [Smoothing Normals](#smoothing-normals)
 * [Finding loaded Meshes](#finding-loaded-meshes)
 * [Transforming an STLModel](#transforming-a-gltfmodel)
 * [Getting the World-space boundary of an STLModel](#getting-the-world-space-boundary-of-an-stlmodel)
 * [Clearing an STLModel](#clearing-a-gltfmodel)
 * [Destroying an STLModel](#destroying-a-gltfmodel)

 ### Loading STL

 Load an STL file by creating an STLModel:

 ````javascript
 var model = new xeogl.STLModel({
     id: "myModel",
     src: "models/stl/F1Concept.stl",

     // Some example loading options (see "Options" below)
     smoothNormals: true,
     smoothNormalsAngleThreshold: 45
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

 To switch to a different STL file, you can dynamically update {{#crossLink "STLModel/src:property"}}{{/crossLink}}:

 ````javascript
 model.src = "models/stl/F1Concept.stl"
 ````

 That will apply whatever options were specified to the constructor.

 ### Parsing STL

 If we have STL data in memory, then we can parse it directly into an existing STLModel instance using the
 static {{#crossLink "STLModel/parse:method"}}{{/crossLink}} method:

 ````javascript
 xeogl.STLModel.parse(model, stlData, {

    // Some example parsing options (see "Options" below)
     smoothNormals: true,
     smoothNormalsAngleThreshold: 45,
     combineGeometry: true,
     quantizeGeometry: true
 });
 ````

 That's asynchronous because STL is self-contained and does not need to load any external assets.

 ### Options

 The following options may be specified when loading or parsing STL:

 | Option | Type | Range | Default Value | Description |
 |:--------:|:----:|:-----:|:-------------:|:-----:|:-----------:|
 | quantizeGeometry | Boolean |  | true | When true, quantizes geometry to reduce memory and GPU bus usage (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | combineGeometry | Boolean |  | true | When true, internally combines geometry vertex buffers to improve rendering performance (see {{#crossLink "Geometry"}}{{/crossLink}}). |
 | smoothNormals | Boolean |  | false | When true, automatically converts face-oriented normals to vertex normals for a smooth appearance. See [Smoothing Normals](#smoothing-normals). |
 | smoothNormalsAngleThreshold | Number (degrees) | [0..180] | 20 | See [Smoothing Normals](#smoothing-normals). |
 | backfaces | Boolean |  | true | When true, allows visible backfaces, wherever specified in the STL. When false, ignores backfaces. |
 | ghosted | Boolean |  | false | When true, ghosts all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EmphasisMaterial"}}{{/crossLink}}). |
 | outlined | Boolean |  | false | When true, outlines all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "OutlineMaterial"}}{{/crossLink}}). |
 | highlighted | Boolean |  | false | When true, highlights all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EmphasisMaterial"}}{{/crossLink}}). |
 | selected | Boolean |  | false | When true, renders all the model's Meshes as selected (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EmphasisMaterial"}}{{/crossLink}}). |
 | edges | Boolean |  | false | When true, emphasizes the edges on all the model's Meshes (see {{#crossLink "Mesh"}}{{/crossLink}} and {{#crossLink "EdgeMaterial"}}{{/crossLink}}). |
 | edgeThreshold | Number | [0..180] | 2 | When ghosting, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn. |
 | splitMeshes | Boolean |  | true | When true, creates a separate {{#crossLink "Mesh"}}{{/crossLink}} for each group of faces that share the same vertex colors. Only works with binary STL.| |

 ### Smoothing Normals

 As mentioned above, providing a ````smoothNormals```` flag to the constructor gives our STLModel a smooth appearance. Triangles in STL
 are disjoint, where each triangle has its own separate vertex positions, normals and (optionally) colors. This means that you can
 have gaps between triangles. Normals for each triangle are perpendicular to the triangle's surface, which gives the model a faceted appearance by default.

 The ```smoothNormals``` flag causes the STLModel to recalculate its normals, so that each normal's direction is the average
 of the orientations of the triangles adjacent to its vertex. When smoothing, each vertex normal is set to the average of the
 orientations of all other triangles that have a vertex at the same position, excluding those triangles whose direction deviates from
 the direction of the vertice's triangle by a threshold given in ````smoothNormalsAngleThreshold````. This makes
 smoothing robust for hard edges, which you can see on the cylindrical objects in one of the examples:

 <a href="../../examples/#importing_stl_shapes"><img src="../../../assets/images/screenshots/STLModelHardEdges.png"></img></a>

 Note how the rim is smooth, yet the there is still a sharp edge adjacent to the flat portions.

 ### Finding STLModels in Scenes

 Our STLModel will now be registered by ID on its Scene, so we can now find it like this:

 ````javascript
 var scene = xeogl.getDefaultScene();
 model = scene.models["myModel"];
 ````

 That's assuming that we've created the STLModel in the default xeogl Scene, which we're doing in these examples.

 We can also get all the STLModels in a Scene, using the Scene's {{#crossLink "Scene/types:property"}}{{/crossLink}} map:

 ````javascript
 var scene = xeogl.getDefaultScene();
 var stlModels = scene.types["xeogl.STLModel"];

 model = stlModels["myModel"];
 ````

 ### Finding loaded Meshes

 Once the STLModel has loaded, its {{#crossLink "Scene"}}{{/crossLink}} will contain various components that represent the elements of the STL file.
 We'll now access some of those components by ID, to query and update them programmatically.

 Let's highlight an {{#crossLink "Object"}}{{/crossLink}} in our STLModel:

 ````javascript
 scene.omponents["myModel#1"].highlighted = true;
 ````

 An STLModel also has an ID map of the components within it. Let's highlight another {{#crossLink "Object"}}{{/crossLink}} via the STLModel:

 ````javascript
 model.components["myModel#2"].highlighted = true;
 ````

 An STLModel also has a map containing just the {{#crossLink "Objects"}}Objects{{/crossLink}}:

 ````javascript
 model.objects["myModel#3"].highlighted = true;
 ````

 TODO: ID format description

 ### Transforming an STLModel

 An STLModel lets us transform its Meshes as a group:

 ```` Javascript
 var model = new xeogl.STLModel({
     src: "models/stl/F1Concept.stl",
     position: [-35, 0, 0],
     rotation: [0, 45, 0],
     scale: [0.5, 0.5, 0.5]
 });

 model.position = [-20, 0, 0];
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
 * the {{#crossLink "Geometry"}}Geometries{{/crossLink}} or {{#crossLink "Transform"}}Transforms{{/crossLink}} of its {{#crossLink "Mesh"}}Meshes{{/crossLink}} are updated.

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
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this STLModel.
 @param [cfg.src] {String} Path to an STL file. You can set this to a new file path at any time, which will cause the
 @param [cfg.quantizeGeometry=true] {Boolean} When true, quantizes geometry to reduce memory and GPU bus usage.
 @param [cfg.combineGeometry=true] {Boolean} When true, combines geometry vertex buffers to improve rendering performance.
 @param [cfg.smoothNormals=false] {Boolean} When true, automatically converts face-oriented normals to vertex normals for a smooth appearance - see <a href="#smoothing-normals">Smoothing Normals</a>.
 @param [cfg.smoothNormalsAngleThreshold=20] {Number} See <a href="#smoothing-normals">Smoothing Normals</a>.
 @param [cfg.backfaces=false] {Boolean} When true, allows visible backfaces, wherever specified in the STL. When false, ignores backfaces.
 @param [cfg.ghosted=false] {Boolean} When true, sets all the Model's Meshes initially ghosted.
 @param [cfg.highlighted=false] {Boolean} When true, sets all the Model's Meshes initially highlighted.
 @param [cfg.outline=false] {Boolean} When true, sets all the Model's Meshes initially outlined.
 @param [cfg.edgeThreshold=2] {Number} When ghosting, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn.
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this STLModel.
 Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this STLModel. Internally, the given
 {{#crossLink "Transform"}}{{/crossLink}} will be inserted above each top-most {{#crossLink "Transform"}}Transform{{/crossLink}}
 that the STLModel attaches to its {{#crossLink "Mesh"}}Meshes{{/crossLink}}.
 @param [cfg.splitMeshes=true] {Boolean} When true, creates a separate {{#crossLink "Mesh"}}{{/crossLink}} for each group of faces that share the same vertex colors. Only works with binary STL.|
 @param [cfg.position=[0,0,0]] {Float32Array} The STLModel's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The STLModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The STLModel's local rotation, as Euler angles given in degrees.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The STLModel's local transform matrix. Overrides the position, scale and rotation parameters.
 @extends Model
 */
{
    xeogl.STLModel = class xeoglSTLModel extends xeogl.Model {

        init(cfg) {
            super.init(cfg);
            this._src = null;
            this._options = {
                combineGeometry: cfg.combineGeometry !== false,
                quantizeGeometry: cfg.quantizeGeometry !== false,
                edgeThreshold: cfg.edgeThreshold,
                splitMeshes: cfg.splitMeshes,
                smoothNormals: cfg.smoothNormals,
                smoothNormalsAngleThreshold: cfg.smoothNormalsAngleThreshold
            };
            this.src = cfg.src;
        }

        /**
         Path to an STL file.

         You can set this to a new file path at any time (except while loading), which will cause the STLModel to load components from
         the new file (after first destroying any components loaded from a previous file path).

         Fires a {{#crossLink "STLModel/loaded:event"}}{{/crossLink}} event when the STL has loaded.

         @property src
         @type String
         */
        set src(value) {
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
            this.clear();
            this._src = value;
            xeogl.STLModel.load(this, this._src, this._options);
        }

        get source() {
            return this._src;
        }


        destroy() {
            this.destroyAll();
            super.destroy();
        }


        /**
         * Loads STL from a URL into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method load
         * @static
         * @param {Model} model Model to load into.
         * @param {String} src Path to STL file.
         * @param {Object} options Loading options.
         * @param {Function} [ok] Completion callback.
         * @param {Function} [error] Error callback.
         */
        static load(model, src, options, ok, error) {
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
        }

        /**
         * Parses STL into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method parse
         * @static
         * @param {Model} model Model to parse into.
         * @param {ArrayBuffer} data The STL data.
         * @param {Object} [options] Parsing options
         * @param {String} [options.basePath] Base path path to find external resources on, if any.
         * @param {String} [options.loadBuffer] Callback to load buffer files.
         */
        static parse(model, data, options) {
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
        }
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

        var entityCount = 0;

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
            var autoVertexNormals = options.autoVertexNormals;
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
            var newMesh = false;
            var alpha;
            var indices;
            var geometry;
            var mesh;
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
            var material = new xeogl.MetallicMaterial(model, { // Share material with all meshes
                roughness: 0.5
            });
            // var material = new xeogl.PhongMaterial(model, { // Share material with all meshes
            //     diffuse: [0.4, 0.4, 0.4],
            //     reflectivity: 1,
            //     specular: [0.5, 0.5, 1.0]
            // });
            model._addComponent(material);
            var dataOffset = 84;
            var faceLength = 12 * 4 + 2;
            var positions = [];
            var normals = [];
            var splitMeshes = options.splitMeshes;
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
                    if (splitMeshes && r !== lastR || g !== lastG || b !== lastB) {
                        if (lastR !== null) {
                            newMesh = true;
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
                    if (!autoVertexNormals) {
                        normals.push(normalX, normalY, normalZ);
                    }
                    if (hasColors) {
                        colors.push(r, g, b, 1); // TODO: handle alpha
                    }
                }
                if (splitMeshes && newMesh) {
                    addMesh(model, positions, normals, colors, material, options);
                    positions = [];
                    normals = [];
                    colors = colors ? [] : null;
                    newMesh = false;
                }
            }
            if (positions.length > 0) {
                addMesh(model, positions, normals, colors, material, options);
            }
        }

        function parseASCII(data, model, options) {
            var faceRegex = /facet([\s\S]*?)endfacet/g;
            var faceCounter = 0;
            var floatRegex = /[\s]+([+-]?(?:\d+.\d+|\d+.|\d+|.\d+)(?:[eE][+-]?\d+)?)/.source;
            var vertexRegex = new RegExp('vertex' + floatRegex + floatRegex + floatRegex, 'g');
            var normalRegex = new RegExp('normal' + floatRegex + floatRegex + floatRegex, 'g');
            var positions = [];
            var normals = [];
            var colors = null;
            var normalx;
            var normaly;
            var normalz;
            var result;
            var verticesPerFace;
            var normalsPerFace;
            var text;
            while (( result = faceRegex.exec(data) ) !== null) {
                verticesPerFace = 0;
                normalsPerFace = 0;
                text = result[0];
                while (( result = normalRegex.exec(text) ) !== null) {
                    normalx = parseFloat(result[1]);
                    normaly = parseFloat(result[2]);
                    normalz = parseFloat(result[3]);
                    normalsPerFace++;
                }
                while (( result = vertexRegex.exec(text) ) !== null) {
                    positions.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                    normals.push(normalx, normaly, normalz);
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
            var material = new xeogl.MetallicMaterial(model, {
                roughness: 0.5
            });
            // var material = new xeogl.PhongMaterial(model, {
            //     diffuse: [0.4, 0.4, 0.4],
            //     reflectivity: 1,
            //     specular: [0.5, 0.5, 1.0]
            // });
            model._addComponent(material);
            addMesh(model, positions, normals, colors, material, options);
        }

        function addMesh(model, positions, normals, colors, material, options) {

            var indices = new Int32Array(positions.length / 3);
            for (var ni = 0, len = indices.length; ni < len; ni++) {
                indices[ni] = ni;
            }

            normals = normals && normals.length > 0 ? normals : null;
            colors = colors && colors.length > 0 ? colors : null;

            if (options.smoothNormals) {
                xeogl.math.faceToVertexNormals(positions, normals, options);
            }

            var geometry = new xeogl.Geometry(model, {
                primitive: "triangles",
                positions: positions,
                normals: normals,
                // autoVertexNormals: !normals,
                colors: colors,
                indices: indices
            });

            var mesh = new xeogl.Mesh(model, {
                id: model.id + "#" + entityCount++,
                geometry: geometry,
                material: material
            });

            model._addComponent(geometry);
            model.addChild(mesh);
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
}
