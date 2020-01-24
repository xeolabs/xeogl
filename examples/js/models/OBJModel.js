/**
 An **OBJModel** is a {{#crossLink "Model"}}{{/crossLink}} that loads itself from OBJ and MTL files.

 <a href="../../examples/#importing_obj_conferenceRoom"><img src="../../../assets/images/screenshots/OBJModel.png"></img></a>

 ## Overview

 * Begins loading as soon as you set its {{#crossLink "OBJModel/src:property"}}{{/crossLink}} property to the location of an OBJ file.
 * Once loaded, contains an {{#crossLink "Mesh"}}{{/crossLink}} for each object. The {{#crossLink "Mesh"}}Meshes{{/crossLink}} can then be independently shown, hidden, colored, transformed etc.
 * Set {{#crossLink "OBJModel/src:property"}}{{/crossLink}} to a new file path at any time, to clear the OBJModel and load components from the new file.

 OBJModel inherits these capabilities from its {{#crossLink "Group"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the {{#crossLink "Meshes"}}{{/crossLink}} within it.
 * Can be transformed as a unit within World-space.
 * Can be a child within a parent {{#crossLink "Group"}}{{/crossLink}}.
 * Provides its World-space axis-aligned and object-aligned boundaries.

 ## Examples

 * [Basic example](../../examples/#importing_obj_people)
 * [Models within an object hierarchy](../../examples/#objects_hierarchy_models)

 ## Usage

 Let's load the conference room model (shown in the screenshot above):

 ````javascript
 var confRoom = new xeogl.OBJModel({
     id: "confRoom",
     src: "models/obj/conference/conference.obj"
 });
 ````

 Bind a callback to fire when the model has loaded:

 ````javascript
 confRoom.on("loaded", function() {
     // OBJModel has loaded!
 });
 ````

 That fires immediately if the OBJModel already happens to be loaded. You can also bind a callback to fire if loading fails:

 ````javascript
 confRoom.on("error", function(msg) {
     // Error occurred
 });
 ````

 To switch to a different OBJ file, simply update {{#crossLink "OBJModel/src:property"}}{{/crossLink}}:

 ````javascript
 confRoom.src = "models/obj/female02/female02.obj";
 ````

 ### Fitting to view

 ````javascript
 var cameraFlight = new xeogl.CameraFlightAnimation();
 cameraFlight.flyTo(confRoom);
 ````

 ### Accessing components

 Let's make everything  transparent, except for the conference table and chairs:

 ````javascript
 for (var id in confRoom.meshes) {
    var mesh = confRoom.meshes[id];
    switch (id) {
        case "confRoom#mesh31":
        case "confRoom#mesh29":
        case "confRoom#mesh30":
            break;
        default: // Not a chair mesh
            mesh.material.alpha = 0.5;
            mesh.material.blendMode = "blend"
    }
 }
 ````

 Note the format of the {{#crossLink "Mesh"}}{{/crossLink}} IDs - an OBJModel prefixes its own ID to the IDs of its components:

 ````<OBJModel ID>#<OBJ object/group ID>````

 **Transforms**

 An OBJModel lets us transform its Meshes as a group:

 ```` Javascript
 var model = new xeogl.OBJModel({
     src: "models/obj/conference/conference.obj"
     position: [-35, 0, 0],
     rotation: [0, 45, 0],
     scale: [0.5, 0.5, 0.5]
 });

 model.position = [-20, 0, 0];
 ````

 Let's move the white table top upwards:

 ````javascript
 var tableTop = confRoom.meshes["confRoom#mesh29"];
 tableTop.position = [0, 150, 0];
 ````

 ## Examples

 * [Conference room model](../../examples/#importing_obj_conferenceRoom)
 * [Two character models](../../examples/#importing_obj_people)

 @class OBJModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this OBJModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this OBJModel.
 @param [cfg.src] {String} Path to an OBJ file. You can set this to a new file path at any time, which will cause the
 OBJModel to load components from the new file (after first destroying any components loaded from a previous file path).
 @param [cfg.quantizeGeometry=true] {Boolean} When true, quantizes geometry to reduce memory and GPU bus usage.
 @param [cfg.combineGeometry=true] {Boolean} When true, combines geometry vertex buffers to improve rendering performance.
 @param [cfg.ghosted=false] {Boolean} When true, sets all the OBJModel's Meshes initially ghosted.
 @param [cfg.highlighted=false] {Boolean} When true, sets all the OBJModel's Meshes initially highlighted.
 @param [cfg.outline=false] {Boolean} When true, sets all the OBJModel's Meshes initially outlined.
 @param [cfg.edgeThreshold=2] {Number} When ghosting, this is the threshold angle between normals of adjacent triangles, below which their shared wireframe edge is not drawn.
 @param [cfg.transform] {Number|String|Transform} A Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} to attach to this OBJModel.
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

    xeogl.OBJModel = class xeoglOBJModel extends xeogl.Model {


        init(cfg) {
            super.init(cfg);
            this._src = null;
            this.src = cfg.src;
        }


        /**
         Path to a Wavefront OBJ file.

         You can set this to a new file path at any time, which will cause the OBJModel to load components from
         the new file (after first destroying any components loaded from a previous file path).

         Also loads materials from any MTL files referenced in the OBJ.

         Fires a {{#crossLink "OBJModel/src:event"}}{{/crossLink}} event on change.

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

            if (value === this._src) { // Already loaded this OBJModel

                /**
                 Fired whenever this OBJModel has finished loading components from the OBJ file
                 specified by {{#crossLink "OBJModel/src:property"}}{{/crossLink}}.
                 @event loaded
                 */
                this.fire("loaded", true, true);

                return;
            }

            this.destroyAll();

            this._src = value;

            xeogl.OBJModel.load(this, this._src);

            /**
             Fired whenever this OBJModel's {{#crossLink "OBJModel/src:property"}}{{/crossLink}} property changes.
             @event src
             @param value The property's new value
             */
            this.fire("src", this._src);
        }

        get src() {
            return this._src;
        }


        /**
         * Loads OBJ and MTL from file(s) into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method load
         * @static
         * @param {Model} model Model to load into.
         * @param {String} src Path to OBJ file.
         * @param {Function} [ok] Completion callback.
         */
        static load(model, src, ok) {

            var spinner = model.scene.canvas.spinner;
            spinner.processes++;

            loadOBJ(model, src, function (state) {
                loadMTLs(model, state, function () {

                    createMeshes(model, state);

                    spinner.processes--;

                    xeogl.scheduleTask(function () {
                        model.fire("loaded", true);
                    });

                    if (ok) {
                        ok();
                    }
                });
            });
        }

        /**
         * Parses OBJ and MTL text strings into a {{#crossLink "Model"}}{{/crossLink}}.
         *
         * @method parse
         * @static
         * @param {Model} model Model to load into.
         * @param {String} objText OBJ text string.
         * @param {String} [mtlText] MTL text string.
         * @param {String} [basePath] Base path for external resources.
         */
        static parse(model, objText, mtlText, basePath) {
            if (!objText) {
                this.warn("load() param expected: objText");
                return;
            }
            var state = parseOBJ(model, objText, null);
            if (mtlText) {
                parseMTL(model, mtlText, basePath);
            }
            createMeshes(model, state);
            model.src = null;
            model.fire("loaded", true, true);
        }
    };

//--------------------------------------------------------------------------------------------
// Loads OBJ
//
// Parses OBJ into an intermediate state object. The object will contain geometry data
// and material IDs from which meshes can be created later. The object will also
// contain a list of filenames of the MTL files referenced by the OBJ, is any.
//
// Originally based on the THREE.js OBJ and MTL loaders:
//
// https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js
// https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/MTLLoader.js
//--------------------------------------------------------------------------------------------

    var loadOBJ = function (model, url, ok) {

        loadFile(url, function (text) {
                var state = parseOBJ(model, text, url);
                ok(state);
            },
            function (error) {
                model.error(error);
            });
    };

    var parseOBJ = (function () {

        const regexp = {
            // v float float float
            vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
            // vn float float float
            normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
            // vt float float
            uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
            // f vertex vertex vertex
            face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
            // f vertex/uv vertex/uv vertex/uv
            face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
            // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
            face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
            // f vertex//normal vertex//normal vertex//normal
            face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
            // o object_name | g group_name
            object_pattern: /^[og]\s*(.+)?/,
            // s boolean
            smoothing_pattern: /^s\s+(\d+|on|off)/,
            // mtllib file_reference
            material_library_pattern: /^mtllib /,
            // usemtl material_name
            material_use_pattern: /^usemtl /
        };

        return function (model, text, url) {

            url = url || ""

            var state = {
                src: url,
                basePath: getBasePath(url),
                objects: [],
                object: {},
                positions: [],
                normals: [],
                uv: [],
                materialLibraries: {}
            };

            startObject(state, "", false);

            // Parts of this parser logic are derived from the THREE.js OBJ loader:
            // https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js

            if (text.indexOf('\r\n') !== -1) {
                // This is faster than String.split with regex that splits on both
                text = text.replace('\r\n', '\n');
            }

            var lines = text.split('\n');
            var line = '', lineFirstChar = '', lineSecondChar = '';
            var lineLength = 0;
            var result = [];

            // Faster to just trim left side of the line. Use if available.
            var trimLeft = ( typeof ''.trimLeft === 'function' );

            for (var i = 0, l = lines.length; i < l; i++) {

                line = lines[i];

                line = trimLeft ? line.trimLeft() : line.trim();

                lineLength = line.length;

                if (lineLength === 0) {
                    continue;
                }

                lineFirstChar = line.charAt(0);

                if (lineFirstChar === '#') {
                    continue;
                }

                if (lineFirstChar === 'v') {

                    lineSecondChar = line.charAt(1);

                    if (lineSecondChar === ' ' && ( result = regexp.vertex_pattern.exec(line) ) !== null) {

                        // 0                  1      2      3
                        // ['v 1.0 2.0 3.0', '1.0', '2.0', '3.0']

                        state.positions.push(
                            parseFloat(result[1]),
                            parseFloat(result[2]),
                            parseFloat(result[3])
                        );

                    } else if (lineSecondChar === 'n' && ( result = regexp.normal_pattern.exec(line) ) !== null) {

                        // 0                   1      2      3
                        // ['vn 1.0 2.0 3.0', '1.0', '2.0', '3.0']

                        state.normals.push(
                            parseFloat(result[1]),
                            parseFloat(result[2]),
                            parseFloat(result[3])
                        );

                    } else if (lineSecondChar === 't' && ( result = regexp.uv_pattern.exec(line) ) !== null) {

                        // 0               1      2
                        // ['vt 0.1 0.2', '0.1', '0.2']

                        state.uv.push(
                            parseFloat(result[1]),
                            parseFloat(result[2])
                        );

                    } else {

                        model.error('Unexpected vertex/normal/uv line: \'' + line + '\'');
                        return;
                    }

                } else if (lineFirstChar === 'f') {

                    if (( result = regexp.face_vertex_uv_normal.exec(line) ) !== null) {

                        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
                        // 0                        1    2    3    4    5    6    7    8    9   10         11         12
                        // ['f 1/1/1 2/2/2 3/3/3', '1', '1', '1', '2', '2', '2', '3', '3', '3', undefined, undefined, undefined]

                        addFace(state,
                            result[1], result[4], result[7], result[10],
                            result[2], result[5], result[8], result[11],
                            result[3], result[6], result[9], result[12]
                        );

                    } else if (( result = regexp.face_vertex_uv.exec(line) ) !== null) {

                        // f vertex/uv vertex/uv vertex/uv
                        // 0                  1    2    3    4    5    6   7          8
                        // ['f 1/1 2/2 3/3', '1', '1', '2', '2', '3', '3', undefined, undefined]

                        addFace(state,
                            result[1], result[3], result[5], result[7],
                            result[2], result[4], result[6], result[8]
                        );

                    } else if (( result = regexp.face_vertex_normal.exec(line) ) !== null) {

                        // f vertex//normal vertex//normal vertex//normal
                        // 0                     1    2    3    4    5    6   7          8
                        // ['f 1//1 2//2 3//3', '1', '1', '2', '2', '3', '3', undefined, undefined]

                        addFace(state,
                            result[1], result[3], result[5], result[7],
                            undefined, undefined, undefined, undefined,
                            result[2], result[4], result[6], result[8]
                        );

                    } else if (( result = regexp.face_vertex.exec(line) ) !== null) {

                        // f vertex vertex vertex
                        // 0            1    2    3   4
                        // ['f 1 2 3', '1', '2', '3', undefined]

                        addFace(state, result[1], result[2], result[3], result[4]);
                    } else {
                        model.error('Unexpected face line: \'' + line + '\'');
                        return;
                    }

                } else if (lineFirstChar === 'l') {

                    var lineParts = line.substring(1).trim().split(' ');
                    var lineVertices = [], lineUVs = [];

                    if (line.indexOf('/') === -1) {

                        lineVertices = lineParts;

                    } else {
                        for (var li = 0, llen = lineParts.length; li < llen; li++) {
                            var parts = lineParts[li].split('/');
                            if (parts[0] !== '') {
                                lineVertices.push(parts[0]);
                            }
                            if (parts[1] !== '') {
                                lineUVs.push(parts[1]);
                            }
                        }
                    }
                    addLineGeometry(state, lineVertices, lineUVs);

                } else if (( result = regexp.object_pattern.exec(line) ) !== null) {

                    // o object_name
                    // or
                    // g group_name

                    var id = result[0].substr(1).trim();
                    startObject(state, id, true);

                } else if (regexp.material_use_pattern.test(line)) {

                    // material

                    var id = line.substring(7).trim();
                    state.object.material.id = id;

                } else if (regexp.material_library_pattern.test(line)) {

                    // mtl file

                    state.materialLibraries[line.substring(7).trim()] = true;

                } else if (( result = regexp.smoothing_pattern.exec(line) ) !== null) {

                    // smooth shading

                    var value = result[1].trim().toLowerCase();
                    state.object.material.smooth = ( value === '1' || value === 'on' );

                } else {

                    // Handle null terminated files without exception
                    if (line === '\0') {
                        continue;
                    }

                    model.error('Unexpected line: \'' + line + '\'');
                    return;
                }
            }

            return state;
        };

        function getBasePath(src) {
            var n = src.lastIndexOf('/');
            return (n === -1) ? src : src.substring(0, n + 1);
        }

        function startObject(state, id, fromDeclaration) {
            if (state.object && state.object.fromDeclaration === false) {
                state.object.id = id;
                state.object.fromDeclaration = ( fromDeclaration !== false );
                return;
            }
            state.object = {
                id: id || '',
                geometry: {
                    positions: [],
                    normals: [],
                    uv: []
                },
                material: {
                    id: '',
                    smooth: true
                },
                fromDeclaration: ( fromDeclaration !== false )
            };
            state.objects.push(state.object);
        }

        function parseVertexIndex(value, len) {
            var index = parseInt(value, 10);
            return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
        }

        function parseNormalIndex(value, len) {
            var index = parseInt(value, 10);
            return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
        }

        function parseUVIndex(value, len) {
            var index = parseInt(value, 10);
            return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;
        }

        function addVertex(state, a, b, c) {
            var src = state.positions;
            var dst = state.object.geometry.positions;
            dst.push(src[a + 0]);
            dst.push(src[a + 1]);
            dst.push(src[a + 2]);
            dst.push(src[b + 0]);
            dst.push(src[b + 1]);
            dst.push(src[b + 2]);
            dst.push(src[c + 0]);
            dst.push(src[c + 1]);
            dst.push(src[c + 2]);
        }

        function addVertexLine(state, a) {
            var src = state.positions;
            var dst = state.object.geometry.positions;
            dst.push(src[a + 0]);
            dst.push(src[a + 1]);
            dst.push(src[a + 2]);
        }

        function addNormal(state, a, b, c) {
            var src = state.normals;
            var dst = state.object.geometry.normals;
            dst.push(src[a + 0]);
            dst.push(src[a + 1]);
            dst.push(src[a + 2]);
            dst.push(src[b + 0]);
            dst.push(src[b + 1]);
            dst.push(src[b + 2]);
            dst.push(src[c + 0]);
            dst.push(src[c + 1]);
            dst.push(src[c + 2]);
        }

        function addUV(state, a, b, c) {
            var src = state.uv;
            var dst = state.object.geometry.uv;
            dst.push(src[a + 0]);
            dst.push(src[a + 1]);
            dst.push(src[b + 0]);
            dst.push(src[b + 1]);
            dst.push(src[c + 0]);
            dst.push(src[c + 1]);
        }

        function addUVLine(state, a) {
            var src = state.uv;
            var dst = state.object.geometry.uv;
            dst.push(src[a + 0]);
            dst.push(src[a + 1]);
        }

        function addFace(state, a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
            var vLen = state.positions.length;
            var ia = parseVertexIndex(a, vLen);
            var ib = parseVertexIndex(b, vLen);
            var ic = parseVertexIndex(c, vLen);
            var id;
            if (d === undefined) {
                addVertex(state, ia, ib, ic);

            } else {
                id = parseVertexIndex(d, vLen);
                addVertex(state, ia, ib, id);
                addVertex(state, ib, ic, id);
            }

            if (ua !== undefined) {

                var uvLen = state.uv.length;

                ia = parseUVIndex(ua, uvLen);
                ib = parseUVIndex(ub, uvLen);
                ic = parseUVIndex(uc, uvLen);

                if (d === undefined) {
                    addUV(state, ia, ib, ic);

                } else {
                    id = parseUVIndex(ud, uvLen);
                    addUV(state, ia, ib, id);
                    addUV(state, ib, ic, id);
                }
            }

            if (na !== undefined) {

                // Normals are many times the same. If so, skip function call and parseInt.

                var nLen = state.normals.length;

                ia = parseNormalIndex(na, nLen);
                ib = na === nb ? ia : parseNormalIndex(nb, nLen);
                ic = na === nc ? ia : parseNormalIndex(nc, nLen);

                if (d === undefined) {
                    addNormal(state, ia, ib, ic);

                } else {

                    id = parseNormalIndex(nd, nLen);
                    addNormal(state, ia, ib, id);
                    addNormal(state, ib, ic, id);
                }
            }
        }

        function addLineGeometry(state, positions, uv) {

            state.object.geometry.type = 'Line';

            var vLen = state.positions.length;
            var uvLen = state.uv.length;

            for (var vi = 0, l = positions.length; vi < l; vi++) {
                addVertexLine(state, parseVertexIndex(positions[vi], vLen));
            }

            for (var uvi = 0, uvl = uv.length; uvi < uvl; uvi++) {
                addUVLine(state, parseUVIndex(uv[uvi], uvLen));
            }
        }
    })();

//--------------------------------------------------------------------------------------------
// Loads MTL files listed in parsed state
//--------------------------------------------------------------------------------------------

    function loadMTLs(model, state, ok) {
        var basePath = state.basePath;
        var srcList = Object.keys(state.materialLibraries);
        var numToLoad = srcList.length;
        if (numToLoad === 0) {
            ok();
        }
        for (var i = 0, len = numToLoad; i < len; i++) {
            loadMTL(model, basePath, basePath + srcList[i], function () {
                if (--numToLoad === 0) {
                    ok();
                }
            });
        }
    }

//--------------------------------------------------------------------------------------------
// Loads an MTL file
//--------------------------------------------------------------------------------------------

    var loadMTL = function (model, basePath, src, ok) {
        loadFile(src, function (text) {
                parseMTL(model, text, basePath);
                ok();
            },
            function (error) {
                model.error(error);
                ok();
            });
    };

    var parseMTL = (function () {

        var delimiter_pattern = /\s+/;

        return function (model, mtlText, basePath) {

            var lines = mtlText.split('\n');
            var materialCfg = {
                id: "Default"
            };
            var needCreate = false;
            var line;
            var pos;
            var key;
            var value;
            var alpha;

            basePath = basePath || "";

            for (var i = 0; i < lines.length; i++) {

                line = lines[i].trim();

                if (line.length === 0 || line.charAt(0) === '#') { // Blank line or comment ignore
                    continue;
                }

                pos = line.indexOf(' ');

                key = ( pos >= 0 ) ? line.substring(0, pos) : line;
                key = key.toLowerCase();

                value = ( pos >= 0 ) ? line.substring(pos + 1) : '';
                value = value.trim();

                switch (key.toLowerCase()) {

                    case "newmtl": // New material
                        //if (needCreate) {
                        createMaterial(model, materialCfg);
                        //}
                        materialCfg = {
                            id: value
                        };
                        needCreate = true;
                        break;

                    case 'ka':
                        materialCfg.ambient = parseRGB(value);
                        break;

                    case 'kd':
                        materialCfg.diffuse = parseRGB(value);
                        break;

                    case 'ks':
                        materialCfg.specular = parseRGB(value);
                        break;

                    case 'map_kd':
                        if (!materialCfg.diffuseMap) {
                            materialCfg.diffuseMap = createTexture(model, basePath, value, "sRGB");
                        }
                        break;

                    case 'map_ks':
                        if (!materialCfg.specularMap) {
                            materialCfg.specularMap = createTexture(model, basePath, value, "linear");
                        }
                        break;

                    case 'map_bump':
                    case 'bump':
                        if (!materialCfg.normalMap) {
                            materialCfg.normalMap = createTexture(model, basePath, value);
                        }
                        break;

                    case 'ns':
                        materialCfg.shininess = parseFloat(value);
                        break;

                    case 'd':
                        alpha = parseFloat(value);
                        if (alpha < 1) {
                            materialCfg.alpha = alpha;
                            materialCfg.alphaMode = "blend";
                        }
                        break;

                    case 'tr':
                        alpha = parseFloat(value);
                        if (alpha > 0) {
                            materialCfg.alpha = 1 - alpha;
                            materialCfg.alphaMode = "blend";
                        }
                        break;

                    default:
                    // model.error("Unrecognized token: " + key);
                }
            }

            if (needCreate) {
                createMaterial(model, materialCfg);
            }
        };

        function createTexture(model, basePath, value, encoding) {
            var textureCfg = {};
            var items = value.split(/\s+/);
            var pos = items.indexOf('-bm');
            if (pos >= 0) {
                //matParams.bumpScale = parseFloat(items[pos + 1]);
                items.splice(pos, 2);
            }
            pos = items.indexOf('-s');
            if (pos >= 0) {
                textureCfg.scale = [parseFloat(items[pos + 1]), parseFloat(items[pos + 2])];
                items.splice(pos, 4); // we expect 3 parameters here!
            }
            pos = items.indexOf('-o');
            if (pos >= 0) {
                textureCfg.translate = [parseFloat(items[pos + 1]), parseFloat(items[pos + 2])];
                items.splice(pos, 4); // we expect 3 parameters here!
            }
            textureCfg.src = basePath + items.join(' ').trim();
            textureCfg.flipY = true;
            textureCfg.encoding = encoding || "linear";
            //textureCfg.wrapS = self.wrap;
            //textureCfg.wrapT = self.wrap;
            var texture = new xeogl.Texture(model, textureCfg);
            model._addComponent(texture);
            return texture.id;
        }

        function createMaterial(model, materialCfg) {
            model._addComponent(new xeogl.PhongMaterial(model, materialCfg));
        }

        function parseRGB(value) {
            var ss = value.split(delimiter_pattern, 3);
            return [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
        }

    })();
//--------------------------------------------------------------------------------------------
// Creates meshes from parsed state
//--------------------------------------------------------------------------------------------

    var createMeshes = (function () {

        return function (model, state) {

            for (var j = 0, k = state.objects.length; j < k; j++) {

                var object = state.objects[j];
                var geometry = object.geometry;
                var isLine = ( geometry.type === 'Line' );

                if (geometry.positions.length === 0) {
                    // Skip o/g line declarations that did not follow with any faces
                    continue;
                }

                var geometryCfg = {
                    primitive: "triangles"
                };

                geometryCfg.positions = geometry.positions;

                if (geometry.normals.length > 0) {
                    geometryCfg.normals = geometry.normals;
                } else {
                    geometryCfg.autoVertexNormals = true;
                }

                if (geometry.uv.length > 0) {
                    geometryCfg.uv = geometry.uv;
                }

                var indices = new Array(geometryCfg.positions.length / 3); // Triangle soup
                for (var idx = 0; idx < indices.length; idx++) {
                    indices[idx] = idx;
                }
                geometryCfg.indices = indices;

                var xeoGeometry = new xeogl.Geometry(model, geometryCfg);
                model._addComponent(xeoGeometry);

                var materialId = object.material.id;
                var material;
                if (materialId && materialId !== "") {
                    material = model.scene.components[materialId];
                    if (!material) {
                        model.error("Material not found: " + materialId);
                    }
                } else {
                    material = new xeogl.PhongMaterial(model, {
                        //emissive: [0.6, 0.6, 0.0],
                        diffuse: [0.6, 0.6, 0.6],
                        backfaces: true
                    });
                    model._addComponent(material);
                }

                // material.emissive = [Math.random(), Math.random(), Math.random()];

                var mesh = new xeogl.Mesh(model, {
                    id: model.id + "#" + object.id,
                    geometry: xeoGeometry,
                    material: material,
                    pickable: true
                });

                model.addChild(mesh);
                model._addComponent(mesh);
            }
        };
    })();

    function loadFile(url, ok, err) {
        var request = new XMLHttpRequest();
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
}
