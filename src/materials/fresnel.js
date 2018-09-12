/**
 A **Fresnel** specifies a Fresnel effect for attached {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}}.

 <a href="../../examples/#materials_phong_fresnel"><img src="../../assets/images/screenshots/PhongMaterial/fresnelWide.png"></img></a>

 ## Overview

 * Fresnels are grouped within {{#crossLink "PhongMaterial"}}{{/crossLink}}s, which are attached to
 {{#crossLink "Mesh"}}Meshes{{/crossLink}}.

 ## Examples

 * [PhongMaterials with Fresnels](../../examples/#materials_phong_fresnel)

 ## Usage

 ````javascript
 var mesh = new xeogl.Mesh({

     material: new xeogl.PhongMaterial({
         ambient: [0.3, 0.3, 0.3],
         shininess: 30,

         diffuseFresnel: new xeogl.Fresnel({
             edgeColor: [1.0, 1.0, 1.0],
             centerColor: [0.0, 0.0, 0.0],
             power: 4,
             bias: 0.6
         }),

         specularFresnel: new xeogl.Fresnel({
             edgeColor: [1.0, 1.0, 1.0],
             centerColor: [0.0, 0.0, 0.0],
             power: 4,
             bias: 0.2
         })
     }),

     new xeogl.TorusGeometry()
 });
 ````

 @class Fresnel
 @module xeogl
 @submodule materials
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Fresnel.
 @param [cfg.edgeColor=[ 0.0, 0.0, 0.0 ]] {Array of Number} Color used on edges.
 @param [cfg.centerColor=[ 1.0, 1.0, 1.0 ]] {Array of Number} Color used on center.
 @param [cfg.edgeBias=0] {Number} Bias at the edge.
 @param [cfg.centerBias=1] {Number} Bias at the center.
 @param [cfg.power=0] {Number} The power.
 @extends Component
 */

import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Fresnel";

class Fresnel extends Component {

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
            edgeColor: math.vec3([0, 0, 0]),
            centerColor: math.vec3([1, 1, 1]),
            edgeBias: 0,
            centerBias: 1,
            power: 1
        });

        this.edgeColor = cfg.edgeColor;
        this.centerColor = cfg.centerColor;
        this.edgeBias = cfg.edgeBias;
        this.centerBias = cfg.centerBias;
        this.power = cfg.power;
    }

    /**
     This Fresnel's edge color.

     @property edgeColor
     @default [0.0, 0.0, 0.0]
     @type Float32Array
     */
    set edgeColor(value) {
        this._state.edgeColor.set(value || [0.0, 0.0, 0.0]);
        this._renderer.imageDirty();
    }

    get edgeColor() {
        return this._state.edgeColor;
    }

    /**
     This Fresnel's center color.

     @property centerColor
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set  centerColor(value) {
        this._state.centerColor.set(value || [1.0, 1.0, 1.0]);
        this._renderer.imageDirty();
    }

    get centerColor() {
        return this._state.centerColor;
    }

    /**
     * Indicates this Fresnel's edge bias.
     *
     * @property edgeBias
     * @default 0
     * @type Number
     */
    set edgeBias(value) {
        this._state.edgeBias = value || 0;
        this._renderer.imageDirty();
    }

    get edgeBias() {
        return this._state.edgeBias;
    }

    /**
     * Indicates this Fresnel's center bias.
     *
     * @property centerBias
     * @default 1
     * @type Number
     */
    set centerBias(value) {
        this._state.centerBias = (value !== undefined && value !== null) ? value : 1;
        this._renderer.imageDirty();
    }

    get centerBias() {
        return this._state.centerBias;
    }

    /**
     * Indicates this Fresnel's power.
     *
     * @property power
     * @default 1
     * @type Number
     */
    set power(value) {
        this._state.power = (value !== undefined && value !== null) ? value : 1;
        this._renderer.imageDirty();
    }

    get power() {
        return this._state.power;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = Fresnel;

export{Fresnel};