/**
 A **Group** is an {{#crossLink "Object"}}{{/crossLink}} that groups other Objects.

 Group is subclassed by (at least) {{#crossLink "Model"}}{{/crossLink}}, which is the abstract base class for {{#crossLink "GLTFModel"}}{{/crossLink}}, {{#crossLink "STLModel"}}{{/crossLink}} etc.

 See {{#crossLink "Object"}}{{/crossLink}} for overall usage info.

 @class Group
 @module xeogl
 @submodule objects
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
 @param [cfg.children] {Array(Object)}      Children to add. Children must be in the same {{#crossLink "Scene"}}{{/crossLink}} and will be removed from whatever parents they may already have.
 @param [cfg.inheritStates=true] {Boolean}  Indicates if children given to this constructor should inherit state from this parent as they are added. State includes {{#crossLink "Object/visible:property"}}{{/crossLink}}, {{#crossLink "Object/culled:property"}}{{/crossLink}}, {{#crossLink "Object/pickable:property"}}{{/crossLink}},
 {{#crossLink "Object/clippable:property"}}{{/crossLink}}, {{#crossLink "Object/castShadow:property"}}{{/crossLink}}, {{#crossLink "Object/receiveShadow:property"}}{{/crossLink}},
 {{#crossLink "Object/outlined:property"}}{{/crossLink}}, {{#crossLink "Object/ghosted:property"}}{{/crossLink}}, {{#crossLink "Object/highlighted:property"}}{{/crossLink}},
 {{#crossLink "Object/selected:property"}}{{/crossLink}}, {{#crossLink "Object/colorize:property"}}{{/crossLink}} and {{#crossLink "Object/opacity:property"}}{{/crossLink}}.
 @extends Object
 */
import {xeoglObject} from "./object.js";
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Group";

 class Group extends xeoglObject{

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {
        super.init(cfg);
    }
}

componentClasses[type] = Group;

export {Group};