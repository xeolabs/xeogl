import {Component} from '../component.js';
import {componentClasses} from "./../componentClasses.js";
import {BatchingLayer} from './batchingLayer.js';
import {math} from '../math/math.js';

const type = "xeogl.BigModel";

/**
 A **BigModel** is a TODO.



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

 @extends Component
 */
class BigModel extends Component {

    get type() {
        return type;
    }

    init(cfg) {
        super.init(cfg);
        this._layers = [];
        this._currentLayer = null;
        this._objects = {};
        this._objectIds = [];
        this._renderer.drawables[this.id] = this;
    }

    /**
     * Creates a reusable geometry within this BIGModel.
     * @param {*} cfg Geometry properties.
     * @param {String|Number} cfg.id ID for the geometry.
     * @param {Array} cfg.positions Flat array of positions.
     * @param {Array} cfg.normals Flat array of normal vectors.
     * @param {Array} cfg.indices Array of indices.
     */
    createGeometry(cfg) { // TODO

    }

    /**
     * Creates an object within this BIGModel.
     *
     * You can either provide geometry data arrays or the ID of a geometry that was previously added
     * with {{#crossLink "BIGModel/addGeometry:method"}}addGeometry(){{/crossLink}}. When you provide arrays,
     * then that geometry will only be used by the object. When you provide an ID, then your object will potentially
     * share (instance) that geometry with other objects in this BIGModel.
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
        var primitive = cfg.primitive || "triangles";
        if (primitive !== "points" && primitive !== "lines" && primitive !== "line-loop" &&
            primitive !== "line-strip" && primitive !== "triangles" && primitive !== "triangle-strip" && primitive !== "triangle-fan") {
            this.error(`Unsupported value for 'primitive': '${primitive}' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.`);
            primitive = "triangles";
        }
        var positions = cfg.positions;
        if (!positions) {
            this.error("Config missing: positions");
            return null;
        }
        var normals = cfg.normals;
        if (!normals) {
            this.error("Config missing: normals");
            return null;
        }
        var indices = cfg.indices;
        if (!indices) {
            this.error("Config missing: indices");
            return null;
        }
        var color = cfg.color;
        color = new Float32Array([color ? color[0] : 1, color ? color[1] : 1, color ? color[2] : 1, cfg.opacity !== undefined ? cfg.opacity : 1]);
        var matrix = cfg.matrix;
        var flags = 0;
        if (cfg.visible !== false) {
            flags = flags | BigModel.FLAGS.VISIBLE;
        }
        if (cfg.pickable !== false) {
            flags = flags | BigModel.FLAGS.PICKABLE;
        }
        if (cfg.clippable !== false) {
            flags = flags | BigModel.FLAGS.CLIPPABLE;
        }
        if (cfg.collidable !== false) {
            flags = flags | BigModel.FLAGS.COLLIDABLE;
        }
        var aabb = math.AABB3();
        if (this._currentLayer) {
            if (!this._currentLayer.canCreatePortion(cfg.positions.length)) {
                this._currentLayer.finalize();
                this._currentLayer = null;
            }
        }
        if (!this._currentLayer) {
            this._currentLayer = new BatchingLayer(this.scene, {
                primitive: "triangles"
            });
            this._layers.push(this._currentLayer);
        }
        var object = {
            model: this,
            layer: this._currentLayer,
            portionId: 0,
            flags: flags,
            color: color,
            aabb: aabb
        };
        object.portionId = this._currentLayer.createPortion(positions, normals, indices, flags, color, matrix, aabb);
        this._objects[id] = object;
        this._objectIds.push(id);
    }

    /**
     * Finalizes this BIGModel.
     * Objects cannot be created within this BIGModel once finalized.
     */
    finalize() {
        if (this._currentLayer) {
            this._currentLayer.finalize();
            this._currentLayer = null;
        }
        this._renderer.imageDirty();
    }

    /**
     * Returns the IDs of objects within this BIGModel.
     * @returns {Array}
     */
    getObjectIDs() {
        return this._objectIds;
    }

    /**
     * Updates a rendering flag for an object within this BIGModel.
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
        object.layer.setFlags(id, object.flags);
    }

    /**
     * Returns the value of a rendering flag of an object within this BIGModel.
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
     * Sets the visibility of an object within this BIGModel.
     * @param {String} id ID of the target object.
     * @param {Boolean} visible New visibility state.
     */
    setVisible(id, visible) {
        this.setFlag(id, BigModel.FLAGS.VISIBLE, visible);
    }

    /**
     * Gets the visibility of an object within this BIGModel.
     * @param {String} id ID of the target object.
     * @returns {boolean} Current visibility of the target object.
     */
    getVisible(id) {
        return this.getFlag(id, BigModel.FLAGS.VISIBLE);
    }

    /**
     * Sets whether or not a target object within this BIGModel is clippable.
     *
     * When false, the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} will have no effect on the Object.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} clippable New clippability state.
     */
    setClippable(id, clippable) {
        this.setFlag(id, BigModel.FLAGS.CLIPPABLE, clippable);
    }

    /**
     * Gets whether or not a target object within this BIGModel is clippable.
     *
     * When false, the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} will have no effect on the Object.
     *
     * @param {String} id ID of the target object.
     * @returns {Boolean} Whether or not the target object is clippable..
     */
    getClippable(id) {
        return this.getFlag(id, BigModel.FLAGS.CLIPPABLE);
    }

    /**
     * Sets whether or not a target object within this BIGModel is pickable.
     *
     * When false, the object will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}}
     * method, and picking will happen as "through" the object, to attempt to pick whatever lies on the other side of it.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} pickable Whether or not the target object is pickable.
     */
    setPickable(id, pickable) {
        this.setFlag(id, BigModel.FLAGS.PICKABLE, pickable);
    }

    /**
     * Gets whether or not a target object within this BIGModel is pickable.
     *
     * When false, the object will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}}
     * method, and picking will happen as "through" the object, to attempt to pick whatever lies on the other side of it.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is pickable.
     */
    getPickable(id) {
        return this.getFlag(id, BigModel.FLAGS.PICKABLE);
    }

    /**
     * Sets whether or not a target object within this BIGModel is included in boundary calculations.
     *
     * When false, the object's boundary will never be included within the boundary of its {{#crossLink "Scene"}}Scene{{/crossLink}} or BIGModel.
     *
     * @param {String} id ID of the target object.
     * @param {Boolean} collidable Whether or not the target object is collidable.
     */
    setCollidable(id, collidable) {
        this.setFlag(id, BigModel.FLAGS.COLLIDABLE, collidable);
    }

    /**
     * Gets whether or not a target object within this BIGModel is included in boundary calculations.
     *
     * When false, the object's boundary will never be included within the boundary of its {{#crossLink "Scene"}}Scene{{/crossLink}} or BIGModel.
     *
     * @param {String} id ID of the target object.
     * @return {Boolean} Whether or not the target object is collidable.
     */
    getCollidable(id) {
        return this.getFlag(id, BigModel.FLAGS.COLLIDABLE);
    }

    setColor(id, color) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        object.color.set(color);
        object.layer.setColor(id, color);
    }

    setOpacity(id, opacity) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        object.color[3] = opacity;
        object.layer.setOpacity(id, opacity);
    }

    getAABB(id) {
        var object = this._objects[id];
        if (!object) {
            this.error("Object not found: " + id);
            return;
        }
        return object.aabb;
    }

    _draw(frame) {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].draw(frame);
        }
    }

    destroy() {
        super.destroy();
        this._layer.destroy();
        delete this._renderer.drawables[this.id];
        this._renderer.imageDirty();
    }
}

BigModel.FLAGS = {
    VISIBLE: 1,
    PICKABLE: 1 << 1,
    BACKFACES: 1 << 2,
    CLIPPABLE: 1 << 3,
    COLLIDABLE: 1 << 4
};

componentClasses[type] = BigModel;

export {BigModel};