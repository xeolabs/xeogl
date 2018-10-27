import {xeoglObject} from './../objects/object.js';
import {BigModelObject} from './bigModelObject.js';
import {componentClasses} from "./../componentClasses.js";
import {getBatchingBuffer, putBatchingBuffer} from "./batching/batchingBuffer.js";
import {BatchingLayer} from './batching/batchingLayer.js';
import {InstancingLayer} from './instancing/instancingLayer.js';
import {RENDER_FLAGS} from './renderFlags.js';
import {buildEdgeIndices} from '../math/buildEdges.js';
import {math} from '../math/math.js';
import {WEBGL_INFO} from './../webglInfo.js';

const instancedArraysSupported = WEBGL_INFO.SUPPORTED_EXTENSIONS["ANGLE_instanced_arrays"];

const type = "xeogl.BigModel";

var tempColor = new Uint8Array(3);

/**
 A **BigModel** is an {{#crossLink "Object"}}{{/crossLink}} that represents a very large model.

 * Used for high-detail engineering visualizations with millions of objects.
 * Represents each object with a {{#crossLink "BigModelObject"}}{{/crossLink}}.
 * Renders objects flat-shaded, without textures. Each object has simply color and opacity.
 * Objects are individually visible, clippable, collidable, ghosted, highlighted, selected, edge-enhanced etc.
 * Objects are static, ie. cannot be dynamically translated, rotated and scaled.
 * For memory efficiency, does not retain geometry data in CPU memory. Keeps geometry only in GPU memory (which cannot be read).
 * Renders efficiently using a combination of geometry batching and WebGL instancing.
 * Instances objects that share geometries, batches objects that have unique geometries.
 * To configure appearance when emphasised, BigModelObjects use the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}}, {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}},
 {{#crossLink "Scene/selectedMaterial:property"}}{{/crossLink}} and {{#crossLink "Scene/edgeMaterial:property"}}{{/crossLink}}.

 ## Usage

 TODO: describe hybrid rendering algorithm

 ### Creating objects with unique geometries

 When creating objects that each have their own unique geometry, just specify that geometry data as you create each object:

 ````javascript
 var bigModel = new xeogl.BigModel();

 // Create a red box object

 var object1 = bigModel.createObject({
     id: "myObject1",
     primitive: "triangles",
     positions: [2, 2, 2, -2, 2, 2, -2, -2, ... ],
     normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, ... ],
     indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, ... ],
     color: [1, 0, 0],
     matrix: xeogl.math.translationMat4c(-7, 0, 0)
 });

 // Create a green box object

 var object2 = bigModel.createObject({
     id: "myObject2",
     primitive: "triangles",
     positions: [2, 2, 2, -2, 2, 2, -2, -2, ... ],
     normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, ... ],
     indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, ... ],
     color: [0, 1, 0],
     matrix: xeogl.math.translationMat4c(0, 0, 0)
 });
 ````

 ### Creating objects with shared geometries

 When multiple objects share the same geometry, create the geometry as a separate element that's referenced by the objects using its ID.

 ```` javascript

 // Create a box-shaped geometry

 bigModel.createGeometry({
     id: "myGeometry",
     primitive: "triangles",
     positions: [2, 2, 2, -2, 2, 2, -2, -2, ... ],
     normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, ... ],
     indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, ... ],
 });

 // Create a blue object that instances the geometry

 var object3 = bigModel.createObject({
     id: "myObject3",
     geometryId: "mGeometry",
     color: [0, 0, 1],
     matrix: xeogl.math.translationMat4c(-7, -7, 0)
 });

 // Create a yellow object that instances the geometry

 var object4 = bigModel.createObject({
     id: "myObject4",
     geometryId: "mGeometry",
     color: [1, 1, 0],
     matrix: xeogl.math.translationMat4c(0, -7, 0)
 });
 ````

 ### Finalizing

 Once we've created all our objects, we need to finalize the BigModel before it will render. Once finalized, we can no longer
 create objects within it.

 ```` javascript
 bigModel.finalize();
 ````

 @class BigModel
 @module xeogl
 @submodule models
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.parent] {Object} The parent.
 @param [cfg.position=[0,0,0]] {Float32Array} Local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} Local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} Local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} Local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @param [cfg.visible=true] {Boolean}        Indicates if visible.
 @param [cfg.culled=false] {Boolean}        Indicates if culled from view.
 @param [cfg.pickable=true] {Boolean}       Indicates if pickable.
 @param [cfg.clippable=true] {Boolean}      Indicates if clippable.
 @param [cfg.collidable=true] {Boolean}     Indicates if included in boundary calculations.
 @param [cfg.castShadow=true] {Boolean}     Indicates if casting shadows.
 @param [cfg.receiveShadow=true] {Boolean}  Indicates if receiving shadows.
 @param [cfg.outlined=false] {Boolean}      Indicates if outline is rendered.
 @param [cfg.ghosted=false] {Boolean}       Indicates if rendered as ghosted.
 @param [cfg.highlighted=false] {Boolean}   Indicates if rendered as highlighted.
 @param [cfg.selected=false] {Boolean}      Indicates if rendered as selected.
 @param [cfg.edges=false] {Boolean}         Indicates if edges are emphasized.
 @param [cfg.aabbVisible=false] {Boolean}   Indicates if axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean}    Indicates if oriented World-space bounding box is visible.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.

 @extends Object
 */
class BigModel extends xeoglObject {

    get type() {
        return type;
    }

    init(cfg) {

        this.__aabb = math.collapseAABB3();
        this._layers = []; // For GL state efficiency when drawing, InstancingLayers are in first part, BatchingLayers are in second
        this._instancingLayers = {}; // InstancingLayer for each geometry - can build many of these concurrently
        this._currentBatchingLayer = null; // Current BatchingLayer - can only build one of these at a time due to its use of global geometry buffers
        this._objectIds = [];
        this._buffer = getBatchingBuffer(); // Each BigModel gets it's own batching buffer - allows multiple BigModels to load concurrently

        /**
         All contained {{#crossLink "BigModelObject"}}BigModelObjects{{/crossLink}}, mapped to their IDs.

         @property objects
         @final
         @type {{String:BigModelObject}}
         */
        this.objects = {};

        this.numGeometries = 0; // Number of instance-able geometries created with createGeometry()

        // These counts are used to avoid unnecessary render passes
        this.numObjects = 0;
        this.numVisibleObjects = 0;
        this.numTransparentObjects = 0;
        this.numGhostedObjects = 0;
        this.numHighlightedObjects = 0;
        this.numSelectedObjects = 0;
        this.numEdgesObjects = 0;

        super.init(cfg);

        this._renderer.addDrawable(this.id, this); // TODO: More compact ID?
    }

    // TODO: rebuild AABB from transforming BigModel's AABBs
    // _buildAABB(worldMatrix, aabb) {
    //     math.transformOBB3(worldMatrix, this._geometry.obb, obb);
    //     math.OBB3ToAABB3(obb, aabb);
    // }

    static getGeometryBytesUsed(positions, colors, indices, normals) {
        // var bytes = 0;
        // bytes += positions.length * 2;
        // if (colors != null) {
        //     bytes += colors.length;
        // }
        // //bytes += positions.length * 8;
        // if (indices.length < 65536 && useSmallIndicesIfPossible) {
        //     bytes += indices.length * 2;
        // } else {
        //     bytes += indices.length * 4;
        // }
        // bytes += normals.length;
        // return bytes;
    }

    /**
     Creates a reusable geometry within this BigModel.

     We can then call {{#crossLink "BigModel/createObject:method"}}createObject(){{/crossLink}} with the
     ID of the geometry to create an instance of it, that will be rendered using WebGL hardware instancing.

     @method createGeometry
     @param {*} cfg Geometry properties.
     @param {String|Number} cfg.id ID for the geometry, to refer to with {{#crossLink "BigModel/createObject:method"}}createObject(){{/crossLink}}
     @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
     @param {Array} cfg.positions Flat array of positions.
     @param {Array} cfg.normals Flat array of normal vectors.
     @param {Array} cfg.indices Array of triangle indices.
     @param {Array} cfg.edgeIndices Array of edge line indices.
     */
    createGeometry(cfg) {
        if (!instancedArraysSupported) {
            this.error("WebGL instanced arrays not supported"); // TODO: Gracefully use batching?
            return;
        }
        var geometryId = cfg.id;
        if (geometryId === undefined || geometryId === null) {
            this.error("Config missing: id");
            return;
        }
        if (this._instancingLayers[geometryId]) {
            this.error("Geometry already created: " + geometryId);
            return;
        }
        var instancingLayer = new InstancingLayer(this, cfg);
        this._layers.unshift(instancingLayer); // Instancing layers are rendered before batching layers
        this._instancingLayers[geometryId] = instancingLayer;
        this.numGeometries++;
    }

    /**
     Creates an object within this BigModel.

     You can either provide geometry data arrays or the ID of a geometry that was previously created
     with {{#crossLink "BigModel/createGeometry:method"}}createGeometry(){{/crossLink}}.

     When you provide arrays, then that geometry will be used solely by the object, which will be rendered
     using geometry batching.

     When you provide a geometry ID, then the object will instance that geometry, and will be
     rendered using WebGL instancing.

     @method createObject
     @param {*} cfg Object properties.
     @param {String|Number} [cfg.geometryId] ID of a geometry to instance, previously created with {{#crossLink "BigModel/createGeometry:method"}}createObject(){{/crossLink}}. Overrides all other geometry parameters given to this method.
     @param [cfg.primitive="triangles"] {String} Geometry primitive type. Ignored when geometryId is given. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
     @param {Array} [cfg.positions] Flat array of geometry positions. Ignored when geometryId is given.
     @param {Array} [cfg.normals] Flat array of normal vectors. Ignored when geometryId is given.
     @param {Array} [cfg.indices] Array of triangle indices. Ignored when geometryId is given.
     @param {Array} [cfg.edgeIndices] Array of edge line indices. Ignored when geometryId is given.
     @returns {xeogl.BigModelObject}
     */
    createObject(cfg) {
        var id = cfg.id;
        if (this.scene.components[id]) {
            this.error("Scene already has a Component with this ID: " + id);
            return;
        }
        var geometryId = cfg.geometryId;
        var instancing = (geometryId !== undefined);
        if (instancing) {
            if (!instancedArraysSupported) {
                this.error("WebGL instanced arrays not supported"); // TODO: Gracefully use batching?
                return;
            }
            if (!this._instancingLayers[geometryId]) {
                this.error("Geometry not found: " + geometryId + " - ensure that you create it first with createGeometry()");
                return;
            }
        }
        var color = cfg.color;
        color = new Uint8Array([ // Quantize color
            color ? Math.floor(color[0] * 255) : 255,
            color ? Math.floor(color[1] * 255) : 255,
            color ? Math.floor(color[2] * 255) : 255,
            cfg.opacity !== undefined ? Math.floor(cfg.opacity * 255) : 255
        ]);
        if (color[3] < 255) {
            this.numTransparentObjects++;
        }
        var matrix = cfg.matrix;
        var flags = 0;
        if (this._visible && cfg.visible !== false) { // Apply flags fom xeogl.Object base class
            flags = flags | RENDER_FLAGS.VISIBLE;
            this.numVisibleObjects++;
        }
        if (this._pickable && cfg.pickable !== false) {
            flags = flags | RENDER_FLAGS.PICKABLE;
        }
        if (this._clippable && cfg.clippable !== false) {
            flags = flags | RENDER_FLAGS.CLIPPABLE;
        }
        if (this._collidable && cfg.collidable !== false) {
            flags = flags | RENDER_FLAGS.COLLIDABLE;
        }
        if (this._edges && cfg.edges !== false) {
            flags = flags | RENDER_FLAGS.EDGES;
            this.numEdgesObjects++;
        }
        if (this._ghosted && cfg.ghosted !== false) {
            flags = flags | RENDER_FLAGS.GHOSTED;
            this.numGhostedObjects++;
        }
        if (this._highlighted && cfg.highlighted !== false) {
            flags = flags | RENDER_FLAGS.HIGHLIGHTED;
            this.numHighlightedObjects++;
        }
        if (this._selected && cfg.selected !== false) {
            flags = flags | RENDER_FLAGS.SELECTED;
            this.numSelectedObjects++;
        }
        var layer;
        var portionId;
        var aabb = math.AABB3();
        if (instancing) {
            var instancingLayer = this._instancingLayers[geometryId];
            layer = instancingLayer;
            portionId = instancingLayer.createPortion(flags, color, matrix, aabb);
        } else {
            var primitive = cfg.primitive || "triangles";
            if (primitive !== "points" && primitive !== "lines" && primitive !== "line-loop" &&
                primitive !== "line-strip" && primitive !== "triangles" && primitive !== "triangle-strip" && primitive !== "triangle-fan") {
                this.error(`Unsupported value for 'primitive': '${primitive}' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.`);
                primitive = "triangles";
            }
            var indices = cfg.indices;
            var edgeIndices = cfg.edgeIndices;
            var positions = cfg.positions;
            if (!positions) {
                this.error("Config missing: positions");
                return null;
            }
            var normals = cfg.normals;
            if (indices && !normals) {
                this.error("Config missing: normals - needed for triangle mesh indices");
                return null;
            }
            if (!edgeIndices && !indices) {
                this.error("Config missing: must have one or both of indices and edgeIndices");
                return null;
            }
            if (this._currentBatchingLayer) {
                if (!this._currentBatchingLayer.canCreatePortion(cfg.positions.length)) {
                    this._currentBatchingLayer.finalize();
                    this._currentBatchingLayer = null;
                }
            }
            if (!this._currentBatchingLayer) {
                this._currentBatchingLayer = new BatchingLayer(this, {
                    primitive: "triangles",
                    buffer: this._buffer
                });
                this._layers.push(this._currentBatchingLayer); // Instancing layers rendered before batching layers
            }
            layer = this._currentBatchingLayer;
            if (!edgeIndices && indices) {
                edgeIndices = math.buildEdgeIndices(positions, indices, null, 10, false);
            }
            portionId = this._currentBatchingLayer.createPortion(positions, normals, indices, edgeIndices, flags, color, matrix, aabb);
            math.expandAABB3(this.__aabb, aabb);
            this.numGeometries++;
        }
        var object = new BigModelObject(this, cfg.entityType, id, cfg.guid, layer, portionId, flags, color, aabb);
        this.objects[id] = object;
        this._objectIds.push(id);
        this.numObjects++;
        return object;
    }

    /**
     Finalizes this BigModel.

     Once finalized, you can't create any more objects within this BigModel.

     @method finalize
     */
    finalize() {
        if (this._currentBatchingLayer) {
            this._currentBatchingLayer.finalize();
            this._currentBatchingLayer = null;
        }
        if (this._buffer) {
            putBatchingBuffer(this._buffer);
            this._buffer = null;
        }
        for (const geometryId in this._instancingLayers) {
            if (this._instancingLayers.hasOwnProperty(geometryId)) {
                this._instancingLayers[geometryId].finalize();
            }
        }
        this._renderer.imageDirty();
        this.scene._bigModelCreated(this);
        this.scene._aabbDirty = true;
        console.log("[BigModel] finalize() - numObjects = " + this.numObjects + ", numGeometries = " + this.numGeometries);
    }

    /**
     Gets the IDs of objects within this BigModel.

     @method getObjectIds
     @returns {Array}
     */
    getObjectIDs() {
        return this._objectIds;
    }

    /**
     World-space 3D axis-aligned bounding box (AABB) enclosing the objects within this BigModel.

     Represented by a six-element Float32Array containing the min/max extents of the
     axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

     @property aabb
     @final
     @type {Float32Array}
     */
    get aabb() {
        return this.__aabb;
    }

    /**
     Indicates if objects in this BigModel are visible.

     Only rendered when {{#crossLink "BigModel/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "BigModel/culled:property"}}{{/crossLink}} is false.

     @property visible
     @default true
     @type Boolean
     */
    set visible(visible) {
        visible = visible !== false;
        this._visible = visible;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].visible = visible;
        }
    }

    get visible() {
        return (this.numVisibleObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are highlighted.

     Highlighted appearance for the entire BigModel is configured by the {{#crossLink "Scene/highlightMaterial:property"}}Scene highlightMaterial{{/crossLink}}.

     @property highlighted
     @default false
     @type Boolean
     */
    set highlighted(highlighted) {
        highlighted = !!highlighted;
        this._highlighted = highlighted;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].highlighted = highlighted;
        }
    }

    get highlighted() {
        return (this.numHighlightedObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are selected.

     Selected appearance for the entire BigModel is configured by the {{#crossLink "Scene/selectedMaterial:property"}}Scene selectedMaterial{{/crossLink}}.

     @property selected
     @default false
     @type Boolean
     */
    set selected(selected) {
        selected = !!selected;
        this._selected = selected;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].selected = selected;
        }
    }

    get selected() {
        return (this.numSelectedObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are ghosted.

     Ghosted appearance for the entire BigModel is configured by the {{#crossLink "Scene/ghostMaterial:property"}}Scene ghostMaterial{{/crossLink}}.

     @property ghosted
     @default false
     @type Boolean
     */
    set ghosted(ghosted) {
        ghosted = !!ghosted;
        this._ghosted = ghosted;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].ghosted = ghosted;
        }
    }

    get ghosted() {
        return (this.numGhostedObjects > 0);
    }

    /**
     Indicates if objects in BigModel are shown with emphasized edges.

     Edges appearance for the entire BigModel is configured by the {{#crossLink "Scene/edgeMaterial:property"}}Scene edgeMaterial{{/crossLink}}.

     @property edges
     @default false
     @type Boolean
     */
    set edges(edges) {
        edges = !!edges;
        this._edges = edges;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].edges = edges;
        }
    }

    get edges() {
        return (this.numEdgesObjects > 0);
    }

    /**
     Indicates if this BigModel is culled from view.

     The BigModel is only rendered when {{#crossLink "BigModel/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "BigModel/culled:property"}}{{/crossLink}} is false.

     @property culled
     @default false
     @type Boolean
     */
    set culled(culled) {
        culled = !!culled;
        this._culled = culled; // Whole BigModel is culled
    }

    get culled() {
        return this._culled;
    }

    /**
     Indicates if this BigModel is clippable.

     Clipping is done by the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} component.

     @property clippable
     @default true
     @type Boolean
     */
    set clippable(clippable) {
        clippable = clippable !== false;
        this._clippable = clippable;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].clippable = clippable;
        }
    }

    get clippable() {
        return this._clippable;
    }

    /**
     Indicates if this BigModel is included in boundary calculations.

     @property collidable
     @default true
     @type Boolean
     */
    set collidable(collidable) {
        collidable = collidable !== false;
        this._collidable = collidable;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].collidable = collidable;
        }
    }

    get collidable() {
        return this._collidable;
    }

    /**
     Whether or not to allow picking on this BigModel.

     Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

     @property pickable
     @default true
     @type Boolean
     */
    set pickable(pickable) {
        pickable = pickable !== false;
        this._pickable = pickable;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]].pickable = pickable;
        }
    }

    get pickable() {
        return this._pickable;
    }

    /**
     Defines the appearance of edges of objects within this BigModel.

     This is the {{#crossLink "Scene/edgeMaterial:property"}}Scene edgeMaterial{{/crossLink}}.

     @property edgeMaterial
     @type EdgeMaterial
     */
    get edgeMaterial() {
        return this.scene.edgeMaterial;
    }

    /**
     Defines the appearance of ghosted objects within this BigModel.

     This is the {{#crossLink "Scene/ghostMaterial:property"}}Scene ghostMaterial{{/crossLink}}.

     @property ghostMaterial
     @type EmphasisMaterial
     */
    get ghostMaterial() {
        return this.scene.ghostMaterial;
    }

    /**
     Defines the appearance of highlighted objects within this BigModel.

     This is the {{#crossLink "Scene/highlightMaterial:property"}}Scene highlightMaterial{{/crossLink}}.

     @property highlightMaterial
     @type EmphasisMaterial
     */
    get highlightMaterial() {
        return this.scene.highlightMaterial;
    }

    /**
     Defines the appearance of selected objects within this BigModel.

     This is the {{#crossLink "Scene/selectedMaterial:property"}}Scene selectedMaterial{{/crossLink}}.

     @property selectedMaterial
     @type EmphasisMaterial
     */
    get selectedMaterial() {
        return this.scene.selectedMaterial;
    }

    _compile() {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].compileShaders();
        }
        this._renderer.imageDirty();
    }

    //------------------------------------------------------------------------------------------------------------------
    // Renderer hooks - private and used only by Renderer
    //------------------------------------------------------------------------------------------------------------------

    get _needStateSort() { // BigModel contains essentially a uniform rendering state, so doesn't need state sorting
        return false;
    }

    _needDrawOpaque() { // Whether this BigModel needs an opaque draw pass, ie. which calls _drawOpaque()
        return (this.numTransparentObjects < this.numObjects);
    }

    _needDrawTransparent() { // Whether this BigModel needs a transparent draw pass, ie. which calls _drawTransparent()
        return (this.numTransparentObjects > 0);
    }

    _drawOpaqueFill(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === this.numObjects || this.numGhostedObjects === this.numObjects) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawOpaqueFill(frame);
        }
    }

    _drawOpaqueEdges(frame) {
        if (this.numEdgesObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawOpaqueEdges(frame);
        }
    }

    _drawTransparentFill(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === 0 || this.numGhostedObjects === this.numObjects) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawTransparentFill(frame);
        }
    }

    _drawGhostedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numGhostedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawGhostedFill(frame);
        }
    }

    _drawGhostedEdges(frame) {
        if (this.numVisibleObjects === 0 || this.numGhostedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawGhostedEdges(frame);
        }
    }

    _drawHighlightedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numHighlightedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawHighlightedFill(frame);
        }
    }

    _drawHighlightedEdges(frame) {
        if (this.numVisibleObjects === 0 || this.numHighlightedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawHighlightedEdges(frame);
        }
    }

    _drawSelectedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numSelectedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawSelectedFill(frame);
        }
    }

    _drawSelectedEdges(frame) {
        if (this.numVisibleObjects === 0 || this.numSelectedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawSelectedEdges(frame);
        }
    }

    _drawOutline(frame) {
    }

    _drawShadow(frame) {
    }

    _pick(frame) {
        if (this.numVisibleObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            //   this._layers[i].pick(frame);
        }
    }

    _findPickedObject(color) {
        // TODO: map color back to an object
    }

    destroy() {
        super.destroy();
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].destroy();
        }
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.objects[this._objectIds[i]]._destroy();
        }
        this.scene._bigModelDestroyed(this);
        this.scene._aabbDirty = true;
        this._renderer.removeDrawable(this.id, this);
    }
}

componentClasses[type] = BigModel;

export {BigModel};