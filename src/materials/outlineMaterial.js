/**
 An **OutlineMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that's applied to {{#crossLink "Mesh"}}Meshes{{/crossLink}}
 to render an outline around them.

 WIP

 @class OutlineMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} The OutlineMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this OutlineMaterial.
 @param [cfg.color=[1.0,0.2,0.2]] {Array of Number}  Outline RGB color.
 @param [cfg.alpha=1.0] {Number} Outline opacity. A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
 @param [cfg.width=4] {Number}  Outline width, in pixels.
 */
import {core} from "./../core.js";
import {Material} from './material.js';
import {State} from '../renderer/state.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.OutlineMaterial";

class OutlineMaterial extends Material {

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

        this._state = new State({
            type: "OutlineMaterial",
            color: null,
            alpha: null,
            width: null
        });
        this.color = cfg.color;
        this.alpha = cfg.alpha;
        this.width = cfg.width;
    }

    /**
     RGB outline color.

     @property color
     @default [1.0, 0.2, 0.2]
     @type Float32Array
     */
    set color(value) {
        let color = this._state.color;
        if (!color) {
            color = this._state.color = new Float32Array(3);
        } else if (value && color[0] === value[0] && color[1] === value[1] && color[2] === value[2]) {
            return;
        }
        if (value) {
            color[0] = value[0];
            color[1] = value[1];
            color[2] = value[2];
        } else {
            color[0] = 1.0;
            color[1] = 0.2;
            color[2] = 0.2;
        }
        this._renderer.imageDirty();
    }

    get color() {
        return this._state.color;
    }

    /**
     Outline transparency.

     A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

     @property alpha
     @default 1.0
     @type Number
     */
    set alpha(value) {
        value = (value !== undefined && value !== null) ? value : 1.0;
        if (this._state.alpha === value) {
            return;
        }
        this._state.alpha = value;
        this._renderer.imageDirty();
    }

    get alpha() {
        return this._state.alpha;
    }

    /**
     Outline width in pixels.

     @property width
     @default 4.0
     @type Number
     */
    set width(value) {
        this._state.width = value || 4.0;
        this._renderer.imageDirty();
    }

    get width() {
        return this._state.width;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = OutlineMaterial;

export{OutlineMaterial};