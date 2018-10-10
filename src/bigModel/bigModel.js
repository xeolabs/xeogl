import {xeoglObject} from './../objects/object.js';
import {componentClasses} from "./../componentClasses.js";
import {getBatchingBuffer, putBatchingBuffer} from "./batchingBuffer.js";
import {BatchingLayer} from './batchingLayer.js';
import {RENDER_FLAGS} from './renderFlags.js';
import {buildEdgeIndices} from '../math/buildEdges.js';

// import {InstancingLayer} from './instancingLayer.js';
import {math} from '../math/math.js';

const type = "xeogl.BigModel";

var tempColor = new Uint8Array(3);

/**
 A **BigModel** is a {{#crossLink "Group"}}{{/crossLink}} that represents a very large model.

 * Represents objects as IDs.
 * Does not retain geometry arrays in RAM.
 * For each geometry that is used by exactly one object, creates a portion in a set of attribute arrays.
 *
 matrix and batches the World-space  into a combined set of VBOs. The VBO contains
 an additional per-vertex attribute arrays that hold flags (visibility, clippability etc) that , with each portion  with attribute buffers for
 * {{#crossLink "OBJModel"}}{{/crossLink}}, which loads its components from .OBJ and .MTL files.
 * {{#crossLink "STLModel"}}{{/crossLink}}, which loads its components from .STL files.
 * {{#crossLink "SceneJSModel"}}{{/crossLink}}, which loads its components from SceneJS scene definitions.
 * {{#crossLink "BuildableModel"}}{{/crossLink}}, which provides a fluent API for building its components.

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
        this._layers = [];
        this._instancingLayers = {}; // InstancingLayer for each geometry
        this._currentBatchingLayer = null;
        this._objects = {};
        this._objectIds = [];
        this._buffer = getBatchingBuffer();

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

    /**
     * Creates a reusable geometry within this BigModel.
     * @param {*} cfg Geometry properties.
     * @param {String|Number} cfg.id ID for the geometry.
     * @param {Array} cfg.positions Flat array of positions.
     * @param {Array} cfg.normals Flat array of normal vectors.
     * @param {Array} cfg.indices Array of triangle indices.
     * @param {Array} cfg.edgeIndices Array of edge line indices.
     */
    createGeometry(cfg) {
        var geometryId = cfg.id;
        if (geometryId === undefined || geometryId === null) {
            this.error("Config missing: id");
            return;
        }
        if (this._instancingLayers[geometryId]) {
            this.error("Geometry already loaded: " + geometryId);
            return;
        }
        var instancingLayer = new InstancingLayer(this.scene, cfg);
        this._layers.unshift(instancingLayer);
        this._instancingLayers[geometryId] = instancingLayer;
    }

    /**
     * Creates an object within this BigModel.
     *
     * You can either provide geometry data arrays or the ID of a geometry that was previously added
     * with {{#crossLink "BigModel/addGeometry:method"}}addGeometry(){{/crossLink}}. When you provide arrays,
     * then that geometry will only be used by the object. When you provide an ID, then your object will potentially
     * share (instance) that geometry with other objects in this BigModel.
     *
     * @method createObject
     * @param cfg
     * @returns {null}
     */
    createObject(cfg) {
        var id = cfg.id;
        if (this.scene.components[id]) {
            this.error("Scene already has a Component with this ID: " + id);
            return;
        }
        var color = cfg.color;
        color = new Uint8Array([ // Quantize color
            color ? Math.floor(color[0] * 255) : 255,
            color ? Math.floor(color[1] * 255) : 255,
            color ? Math.floor(color[2] * 255) : 255,
            cfg.opacity !== undefined ? Math.floor(cfg.opacity * 255) : 255
        ]);
        var matrix = cfg.matrix;
        var flags = 0;
        // Apply flags fom xeogl.Object base class
        if (this._visible && cfg.visible !== false) {
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
        var aabb = math.AABB3();
        var geometryId = cfg.geometryId;
        var instancing = (geometryId !== undefined);
        var object = {
            id: id,
            model: this,
            layer: null,
            portionId: 0,
            flags: flags,
            color: color,
            aabb: aabb
        };
        if (instancing) {
            var instancingLayer = this._instancingLayers[geometryId];
            object.layer = instancingLayer;
            object.portionId = instancingLayer.createPortion(flags, color, matrix, object.aabb);
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
                this._layers.push(this._currentBatchingLayer);
            }
            object.layer = this._currentBatchingLayer;
            if (!edgeIndices && indices) {
                edgeIndices = math.buildEdgeIndices(positions, indices, null, 10, false);
            }
            object.portionId = this._currentBatchingLayer.createPortion(positions, normals, indices, edgeIndices, flags, color, matrix, object.aabb);
            math.expandAABB3(this.__aabb, object.aabb);
        }
        this._objects[id] = object;
        this._objectIds.push(id);
        this.numObjects++;
    }

    /**
     * Finalizes this BigModel.
     * Objects cannot be created within this BigModel once finalized.
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
        this._renderer.imageDirty();
        this.scene._bigModelCreated(this);
        this.scene._aabbDirty = true;
    }

    /**
     * Gets the IDs of objects within this BigModel.
     * @returns {Array}
     */
    getObjectIDs() {
        return this._objectIds;
    }

    /**
     * Updates a rendering flag for an object within this BigModel.
     * @param {String} id ID of target object.
     * @param {Number} flag Target flag to set.
     * @param {boolean} value New value for that flag.
     */
    setFlag(id, flag, value) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        object.flags = value ? (object.flags | flag) : (object.flags & ~flag);
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets the value of a rendering flag of an object within this BigModel.
     * @param {String} id ID of target object.
     * @param {Number} flag Target flag to get.
     * @returns {boolean} Current value of the flag.
     */
    getFlag(id, flag) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        return !!(object.flags & flag);
    }

    /**
     * Sets the visibility of an object within this BigModel.
     * @param {String} id ID of the target object.
     * @param {Boolean} visible New visibility state.
     */
    setVisible(id, visible) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentVisible = !!(object.flags & RENDER_FLAGS.VISIBLE);
        if (currentVisible === visible) {
            return; // Redundant update
        }
        if (visible) {
            object.flags = object.flags | RENDER_FLAGS.VISIBLE;
            object.layer.numVisibleObjects++;
            this.numVisibleObjects++;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.VISIBLE;
            object.layer.numVisibleObjects--;
            this.numVisibleObjects--;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets the visibility of an object within this BigModel.
     * @param {String} id ID of the target object.
     * @returns {boolean} Current visibility of the target object.
     */
    getVisible(id) {
        return this.getFlag(id, RENDER_FLAGS.VISIBLE);
    }

    /**
     * Sets whether or not a target object within this BigModel is clippable.
     *
     * When false, the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} will have no effect on the Object.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} clippable New clippability state.
     */
    setClippable(id, clippable) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentClippable = !!(object.flags & RENDER_FLAGS.CLIPPABLE);
        if (currentClippable === clippable) {
            return; // Redundant update
        }
        if (clippable) {
            object.flags = object.flags | RENDER_FLAGS.CLIPPABLE;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.CLIPPABLE;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not a target object within this BigModel is clippable.
     *
     * When false, the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} will have no effect on the Object.
     *
     * @param {String} id ID of the target object.
     * @returns {Boolean} Whether or not the target object is clippable.
     */
    getClippable(id) {
        return this.getFlag(id, RENDER_FLAGS.CLIPPABLE);
    }

    /**
     * Sets whether or not a target object within this BigModel is pickable.
     *
     * When false, the object will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}}
     * method, and picking will happen as "through" the object, to attempt to pick whatever lies on the other side of it.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} pickable Whether or not the target object is pickable.
     */
    setPickable(id, pickable) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentPickable = !!(object.flags & RENDER_FLAGS.PICKABLE);
        if (currentPickable === pickable) {
            return; // Redundant update
        }
        if (pickable) {
            object.flags = object.flags | RENDER_FLAGS.PICKABLE;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.PICKABLE;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not a target object within this BigModel is pickable.
     *
     * When false, the object will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}}
     * method, and picking will happen as "through" the object, to attempt to pick whatever lies on the other side of it.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is pickable.
     */
    getPickable(id) {
        return this.getFlag(id, RENDER_FLAGS.PICKABLE);
    }

    /**
     * Sets whether or not a target object within this BigModel is included in boundary calculations.
     *
     * When false, the object's boundary will never be included within the boundary of its {{#crossLink "Scene"}}Scene{{/crossLink}} or BigModel.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} collidable Whether or not the target object is collidable.
     */
    setCollidable(id, collidable) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentCollidable = !!(object.flags & RENDER_FLAGS.COLLIDABLE);
        if (currentCollidable === collidable) {
            return; // Redundant update
        }
        if (collidable) {
            object.flags = object.flags | RENDER_FLAGS.COLLIDABLE;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.COLLIDABLE;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not a target object within this BigModel is included in boundary calculations.
     *
     * When false, the object's boundary will never be included within the boundary of its {{#crossLink "Scene"}}Scene{{/crossLink}} or BigModel.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is collidable.
     */
    getCollidable(id) {
        return this.getFlag(id, RENDER_FLAGS.COLLIDABLE);
    }

    /**
     * Sets whether or not a target object within this BigModel is rendered as ghosted.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} ghosted Whether or not the target object is ghosted.
     */
    setGhosted(id, ghosted) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentGhosted = !!(object.flags & RENDER_FLAGS.GHOSTED);
        if (currentGhosted === ghosted) {
            return; // Redundant update
        }
        if (ghosted) {
            object.flags = object.flags | RENDER_FLAGS.GHOSTED;
            object.layer.numGhostedObjects++;
            this.numGhostedObjects++;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.GHOSTED;
            object.layer.numGhostedObjects--;
            this.numGhostedObjects--;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not a target object within this BigModel is rendered as ghosted.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is ghosted.
     */
    getGhosted(id) {
        return this.getFlag(id, RENDER_FLAGS.GHOSTED);
    }

    /**
     * Sets whether or not a target object within this BigModel is rendered as highlighted.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} highlighted Whether or not the target object is highlighted.
     */
    setHighlighted(id, highlighted) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentHighlighted = !!(object.flags & RENDER_FLAGS.HIGHLIGHTED);
        if (currentHighlighted === highlighted) {
            return; // Redundant update
        }
        if (highlighted) {
            object.flags = object.flags | RENDER_FLAGS.HIGHLIGHTED;
            object.layer.numHighlightedObjects++;
            this.numHighlightedObjects++;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.HIGHLIGHTED;
            object.layer.numHighlightedObjects--;
            this.numHighlightedObjects--;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not a target object within this BigModel is rendered as highlighted.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is highlighted.
     */
    getHighlighted(id) {
        return this.getFlag(id, RENDER_FLAGS.HIGHLIGHTED);
    }

    /**
     * Sets whether or not the edges on a target object are rendered.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} edges True to render edges.
     */
    setEdges(id, edges) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        var currentEdges = !!(object.flags & RENDER_FLAGS.EDGES);
        if (currentEdges === edges) {
            return; // Redundant update
        }
        if (edges) {
            object.flags = object.flags | RENDER_FLAGS.EDGES;
            object.layer.numEdgesObjects++;
            this.numEdgesObjects++;
        } else {
            object.flags = object.flags & ~RENDER_FLAGS.EDGES;
            object.layer.numEdgesObjects--;
            this.numEdgesObjects--;
        }
        object.layer.setFlags(object.portionId, object.flags);
    }

    /**
     * Gets whether or not the edges on a target object are rendered.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} True to render edges.
     */
    getEdges(id) {
        return this.getFlag(id, RENDER_FLAGS.EDGES);
    }

    /**
     * Sets the RGB color of a target object within this BigModel.
     *
     * @param {String} id ID of the target object.
     * @param {Array} color RGB color for the object.
     */
    setColor(id, color) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        object.color[0] = Math.floor(color[0] * 255.0); // Quantize
        object.color[1] = Math.floor(color[1] * 255.0);
        object.color[2] = Math.floor(color[2] * 255.0);
        object.layer.setColor(object.portionId, object.color); // Only set RGB, not alpha
    }

    /**
     * Gets the RGB color of a target object within this BigModel.
     *
     * The returned value must not be modified, and is valid only until the next call to this method.
     *
     * @param {String} id ID of the target object.
     * @return {Array} RGB color for the object.
     */
    getColor(id) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        tempColor[0] = color[0] / 255.0; // Unquantize
        tempColor[1] = color[1] / 255.0;
        tempColor[2] = color[2] / 255.0;
        return tempColor;
    }

    /**
     * Sets the opacity of a target object within this BigModel.
     *
     * @param {String} id ID of the target object.
     * @param {Number} opacity Opacity factor in range ````[0..1]````.
     */
    setOpacity(id, opacity) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        if (opacity < 0) {
            opacity = 0;
        } else if (opacity > 1) {
            opacity = 1;
        }
        opacity = Math.floor(opacity * 255.0); // Quantize
        var lastOpacity = object.color[3];
        if (lastOpacity === opacity) {
            return;
        }
        if (opacity < 1.0) {
            object.layer.numTransparentObjects++;
            this.numTransparentObjects++;
        } else {
            object.layer.numTransparentObjects--;
            this.numTransparentObjects--;
        }
        object.color[3] = opacity; // Only set alpha
        object.layer.setColor(object.portionId, object.color);
    }

    /**
     * Gets the opacity of a target object within this BigModel.
     *
     * @param {String} id ID of the target object.
     * @return {Number} Opacity factor in range ````[0..1]````.
     */
    getOpacity(id) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        return object.color[3] / 255.0;
    }

    /**
     Returns whether or not there are any opaque objects in this BigModel.
     @returns {boolean}
     */
    get opaque() {
        return (this.numTransparentObjects < this.numObjects);
    }

    /**
     Returns whether or not there are any transparent objects in this BigModel.
     @returns {boolean}
     */
    get transparent() {
        return (this.numTransparentObjects > 0);
    }

    /**
     Gets the axis-aligned World-space bounding box of a target object within this BigModel.

     @method getAABB
     @param {String|Number} id ID of the target object.
     @returns {[Number, Number, Number, Number, Number, Number]} An axis-aligned World-space bounding box, given as elements ````[xmin, ymin, zmin, xmax, ymax, zmax]````.
     */
    getAABB(id) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        return object.aabb;
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
            this.setVisible(this._objectIds[i], visible);
        }
    }

    get visible() {
        return (this.numVisibleObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are highlighted.

     @property highlighted
     @default false
     @type Boolean
     */
    set highlighted(highlighted) {
        highlighted = !!highlighted;
        this._highlighted = highlighted;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.setHighlighted(this._objectIds[i], highlighted);
        }
    }

    get highlighted() {
        return (this.numHighlightedObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are selected.

     @property selected
     @default false
     @type Boolean
     */
    set selected(selected) {
        selected = !!selected;
        this._selected = selected;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.setSelected(this._objectIds[i], selected);
        }
    }

    get selected() {
        return (this.numSelectedObjects > 0);
    }

    /**
     Indicates if objects in this BigModel are ghosted.

     @property ghosted
     @default false
     @type Boolean
     */
    set ghosted(ghosted) {
        ghosted = !!ghosted;
        this._ghosted = ghosted;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.setGhosted(this._objectIds[i], ghosted);
        }
    }

    get ghosted() {
        return (this.numGhostedObjects > 0);
    }

    /**
     Indicates if objects in BigModel are shown with emphasized edges.

     @property edges
     @default false
     @type Boolean
     */
    set edges(edges) {
        edges = !!edges;
        this._edges = edges;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.setEdges(this._objectIds[i], edges);
        }
    }

    get edges() {
        return (this.numEdgesObjects > 0);
    }

    /**
     Indicates if this BigModel is culled from view.

     Only rendered when {{#crossLink "BigModel/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "BigModel/culled:property"}}{{/crossLink}} is false.

     @property culled
     @default false
     @type Boolean
     */
    set culled(culled) {
        culled = !!culled;
        this._culled = culled;
        for (var i = 0, len = this._objectIds.length; i < len; i++) {
            this.setCulled(this._objectIds[i], culled);
        }
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
            this.setClippable(this._objectIds[i], clippable);
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
            this.setCollidable(this._objectIds[i], collidable);
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
            this.setPickable(this._objectIds[i], pickable);
        }
    }

    get pickable() {
        return this._pickable;
    }

    /**
     Defines the appearance of ghosted objects within this BigModel.

     This is the

     @property ghostMaterial
     @type EmphasisMaterial
     */
    get ghostMaterial() {
        return this.scene.highlightMaterial;
    }

    /**
     Defines the appearance of highlighted objects within this BigModel.

     @property highlightedMaterial
     @type EmphasisMaterial
     */
    get highlightMaterial() {
        return this.scene.highlightMaterial;
    }

    /**
     Defines the appearance of selected objects within this BigModel.

     @property selectedMaterial
     @type EmphasisMaterial
     */
    get selectedMaterial() {
        return this.scene.selectedMaterial;
    }

    _compile() {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].compile();
        }
        this._renderer.imageDirty();
    }

    //------------------------------------------------------------------------------------------------------------------
    // Renderer hooks - private and used only by Renderer
    //------------------------------------------------------------------------------------------------------------------

    get _getStateSortable() { // BigModel contains essentially a uniform rendering state, so doesn't need state sorting
        return false;
    }

    _getOpaque() { // Whether this BigModel needs _drawOpaque()
        return (this.numTransparentObjects < this.numObjects);
    }

    _getTransparent() { // Whether this BigModel needs _drawTransparent()
        return (this.numTransparentObjects > 0);
    }

    _drawOpaque(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === this.numObjects || this.numGhostedObjects === this.numObjects) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawOpaque(frame);
        }
    }

    _drawTransparent(frame) {
        if (this.numVisibleObjects === 0 || this.numTransparentObjects === 0 || this.numGhostedObjects === this.numObjects) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawTransparent(frame);
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
    }

    _drawGhostedVertices(frame) { // TODO: Needed?
    }

    _drawHighlightedFill(frame) {
        if (this.numVisibleObjects === 0 || this.numHighlightedObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i]._drawHighlightedFill(frame);
        }
    }

    _drawHighlightedEdges(frame) {
    }

    _drawHighlightedVertices(frame) {
    }

    _drawSelectedFill(frame) {
    }

    _drawSelectedEdges(frame) {
    }

    _drawSelectedVertices(frame) {
    }

    _drawEdges(frame) {
        if (this.numEdgesObjects === 0) {
            return;
        }
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].drawEdges(frame);
        }
    }

    _drawOutline(frame) {
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
        this.scene._bigModelDestroyed(this);
        this.scene._aabbDirty = true;
        this._renderer.removeDrawable(this.id, this);
        this._renderer.imageDirty();
    }
}

componentClasses[type] = BigModel;

export {BigModel};