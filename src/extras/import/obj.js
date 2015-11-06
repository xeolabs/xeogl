/**
 A **OBJ** defines a plane geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class OBJ
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this OBJ in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this OBJ.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.ySize=1] {Number} Dimension on the Y-axis.
 @param [cfg.xSegments=4] {Number} Number of segments on the X-axis.
 @param [cfg.ySegments=4] {Number} Number of segments on the Y-axis.

 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.OBJ = XEO.Geometry.extend({

        type: "XEO.OBJ",

        _init: function (cfg) {

            this._super(cfg);

            this.fileName = fileName;
            this.mtls = new Array(0);      // Initialize the property for MTL
            this.objects = new Array(0);   // Initialize the property for Object
            this.vertices = new Array(0);  // Initialize the property for Vertex
            this.normals = new Array(0);   // Initialize the property for Normal

            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;

            this.xSegments = cfg.xSegments;
            this.ySegments = cfg.ySegments;

            this.lod = cfg.lod;

            this.autoNormals = cfg.autoNormals !== false;
        },


parse : function(fileString, scale, reverse) {
        var lines = fileString.split('\n');  // Break up into lines and store them as array
        lines.push(null); // Append null
        var index = 0;    // Initialize index of line

        var currentObject = null;
        var currentMaterialName = "";

        // Parse line by line
        var line;         // A string in the line to be parsed
        var sp = new StringParser();  // Create StringParser
        while ((line = lines[index++]) != null) {
            sp.init(line);                  // init StringParser
            var command = sp.getWord();     // Get command
            if(command == null)	 continue;  // check null command

            switch(command){
                case '#':
                    continue;  // Skip comments
                case 'mtllib':     // Read Material chunk
                    var path = this.parseMtllib(sp, this.fileName);
                    var mtl = new MTLDoc();   // Create MTL instance
                    this.mtls.push(mtl);
                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function() {
                        if (request.readyState == 4) {
                            if (request.status != 404) {
                                onReadMTLFile(request.responseText, mtl);
                            }else{
                                mtl.complete = true;
                            }
                        }
                    }
                    request.open('GET', path, true);  // Create a request to acquire the file
                    request.send();                   // Send the request
                    continue; // Go to the next line
                case 'o':
                case 'g':   // Read Object name
                    var object = this.parseObjectName(sp);
                    this.objects.push(object);
                    currentObject = object;
                    continue; // Go to the next line
                case 'v':   // Read vertex
                    var vertex = this.parseVertex(sp, scale);
                    this.vertices.push(vertex);
                    continue; // Go to the next line
                case 'vn':   // Read normal
                    var normal = this.parseNormal(sp);
                    this.normals.push(normal);
                    continue; // Go to the next line
                case 'usemtl': // Read Material name
                    currentMaterialName = this.parseUsemtl(sp);
                    continue; // Go to the next line
                case 'f': // Read face
                    var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
                    currentObject.addFace(face);
                    continue; // Go to the next line
            }
        }

        return true;
    },

    parseMtllib : function(sp, fileName) {
        // Get directory path
        var i = fileName.lastIndexOf("/");
        var dirPath = "";
        if(i > 0) dirPath = fileName.substr(0, i+1);

        return dirPath + sp.getWord();   // Get path
    },

    parseObjectName : function(sp) {
        var name = sp.getWord();
        return (new OBJObject(name));
    },

    parseVertex : function(sp, scale) {
        var x = sp.getFloat() * scale;
        var y = sp.getFloat() * scale;
        var z = sp.getFloat() * scale;
        return (new Vertex(x, y, z));
    },

    parseNormal : function(sp) {
        var x = sp.getFloat();
        var y = sp.getFloat();
        var z = sp.getFloat();
        return (new Normal(x, y, z));
    },

    parseUsemtl : function(sp) {
        return sp.getWord();
    }

    parseFace : function(sp, materialName, vertices, reverse) {
        var face = new Face(materialName);
        // get indices
        for(;;){
            var word = sp.getWord();
            if(word == null) break;
            var subWords = word.split('/');
            if(subWords.length >= 1){
                var vi = parseInt(subWords[0]) - 1;
                face.vIndices.push(vi);
            }
            if(subWords.length >= 3){
                var ni = parseInt(subWords[2]) - 1;
                face.nIndices.push(ni);
            }else{
                face.nIndices.push(-1);
            }
        }

        // calc normal
        var v0 = [
            vertices[face.vIndices[0]].x,
            vertices[face.vIndices[0]].y,
            vertices[face.vIndices[0]].z];
        var v1 = [
            vertices[face.vIndices[1]].x,
            vertices[face.vIndices[1]].y,
            vertices[face.vIndices[1]].z];
        var v2 = [
            vertices[face.vIndices[2]].x,
            vertices[face.vIndices[2]].y,
            vertices[face.vIndices[2]].z];

        // é¢ã®æ³•ç·šã‚’è¨ˆç®—ã—ã¦normalã«è¨­å®š
        var normal = calcNormal(v0, v1, v2);
        // æ³•ç·šãŒæ­£ã—ãæ±‚ã‚ã‚‰ã‚ŒãŸã‹èª¿ã¹ã‚‹
        if (normal == null) {
            if (face.vIndices.length >= 4) { // é¢ãŒå››è§’å½¢ãªã‚‰åˆ¥ã®3ç‚¹ã®çµ„ã¿åˆã‚ã›ã§æ³•ç·šè¨ˆç®—
                var v3 = [
                    vertices[face.vIndices[3]].x,
                    vertices[face.vIndices[3]].y,
                    vertices[face.vIndices[3]].z];
                normal = calcNormal(v1, v2, v3);
            }
            if(normal == null){         // æ³•ç·šãŒæ±‚ã‚ã‚‰ã‚Œãªã‹ã£ãŸã®ã§Yè»¸æ–¹å‘ã®æ³•ç·šã¨ã™ã‚‹
                normal = [0.0, 1.0, 0.0];
            }
        }
        if(reverse){
            normal[0] = -normal[0];
            normal[1] = -normal[1];
            normal[2] = -normal[2];
        }
        face.normal = new Normal(normal[0], normal[1], normal[2]);

        // Devide to triangles if face contains over 3 points.
        if(face.vIndices.length > 3){
            var n = face.vIndices.length - 2;
            var newVIndices = new Array(n * 3);
            var newNIndices = new Array(n * 3);
            for(var i=0; i<n; i++){
                newVIndices[i * 3 + 0] = face.vIndices[0];
                newVIndices[i * 3 + 1] = face.vIndices[i + 1];
                newVIndices[i * 3 + 2] = face.vIndices[i + 2];
                newNIndices[i * 3 + 0] = face.nIndices[0];
                newNIndices[i * 3 + 1] = face.nIndices[i + 1];
                newNIndices[i * 3 + 2] = face.nIndices[i + 2];
            }
            face.vIndices = newVIndices;
            face.nIndices = newNIndices;
        }
        face.numIndices = face.vIndices.length;

        return face;
    },

// Analyze the material file
    function onReadMTLFile(fileString, mtl) {
        var lines = fileString.split('\n');  // Break up into lines and store them as array
        lines.push(null);           // Append null
        var index = 0;              // Initialize index of line

        // Parse line by line
        var line;      // A string in the line to be parsed
        var name = ""; // Material name
        var sp = new StringParser();  // Create StringParser
        while ((line = lines[index++]) != null) {
            sp.init(line);                  // init StringParser
            var command = sp.getWord();     // Get command
            if(command == null)	 continue;  // check null command

            switch(command){
                case '#':
                    continue;    // Skip comments
                case 'newmtl': // Read Material chunk
                    name = mtl.parseNewmtl(sp);    // Get name
                    continue; // Go to the next line
                case 'Kd':   // Read normal
                    if(name == "") continue; // Go to the next line because of Error
                    var material = mtl.parseRGB(sp, name);
                    mtl.materials.push(material);
                    name = "";
                    continue; // Go to the next line
            }
        }
        mtl.complete = true;
    },

// Check Materials
    isMTLComplete : function() {
        if(this.mtls.length == 0) return true;
        for(var i = 0; i < this.mtls.length; i++){
            if(!this.mtls[i].complete) return false;
        }
        return true;
    },

// Find color by material name
    findColor : function(name){
        for(var i = 0; i < this.mtls.length; i++){
            for(var j = 0; j < this.mtls[i].materials.length; j++){
                if(this.mtls[i].materials[j].name == name){
                    return(this.mtls[i].materials[j].color)
                }
            }
        }
        return(new Color(0.8, 0.8, 0.8, 1));
    },

    OBJDoc.prototype.getDrawingInfo = function() {
        // Create an arrays for vertex coordinates, normals, colors, and indices
        var numIndices = 0;
        for(var i = 0; i < this.objects.length; i++){
            numIndices += this.objects[i].numIndices;
        }
        var numVertices = numIndices;
        var vertices = new Float32Array(numVertices * 3);
        var normals = new Float32Array(numVertices * 3);
        var colors = new Float32Array(numVertices * 4);
        var indices = new Uint16Array(numIndices);

        // Set vertex, normal and color
        var index_indices = 0;
        for(var i = 0; i < this.objects.length; i++){
            var object = this.objects[i];
            for(var j = 0; j < object.faces.length; j++){
                var face = object.faces[j];
                var color = this.findColor(face.materialName);
                var faceNormal = face.normal;
                for(var k = 0; k < face.vIndices.length; k++){
                    // Set index
                    indices[index_indices] = index_indices;
                    // Copy vertex
                    var vIdx = face.vIndices[k];
                    var vertex = this.vertices[vIdx];
                    vertices[index_indices * 3 + 0] = vertex.x;
                    vertices[index_indices * 3 + 1] = vertex.y;
                    vertices[index_indices * 3 + 2] = vertex.z;
                    // Copy color
                    colors[index_indices * 4 + 0] = color.r;
                    colors[index_indices * 4 + 1] = color.g;
                    colors[index_indices * 4 + 2] = color.b;
                    colors[index_indices * 4 + 3] = color.a;
                    // Copy normal
                    var nIdx = face.nIndices[k];
                    if(nIdx >= 0){
                        var normal = this.normals[nIdx];
                        normals[index_indices * 3 + 0] = normal.x;
                        normals[index_indices * 3 + 1] = normal.y;
                        normals[index_indices * 3 + 2] = normal.z;
                    }else{
                        normals[index_indices * 3 + 0] = faceNormal.x;
                        normals[index_indices * 3 + 1] = faceNormal.y;
                        normals[index_indices * 3 + 2] = faceNormal.z;
                    }
                    index_indices ++;
                }
            }
        }

        return new DrawingInfo(vertices, normals, colors, indices);
    },

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
//    var MTLDoc = function() {
//        this.complete = false; // MTL is configured correctly
//        this.materials = new Array(0);
//    }

    parseNewmtl : function(sp) {
        return sp.getWord();         // Get name
    },

    parseRGB : function(sp, name) {
        var r = sp.getFloat();
        var g = sp.getFloat();
        var b = sp.getFloat();
        return (new Material(name, r, g, b, 1));
    }


    _getJSON: function () {
            return {
                xSize: this._xSize,
                ySize: this._ySize,
                xSegments: this._xSegments,
                ySegments: this._ySegments
            };
        }
    });

})();
