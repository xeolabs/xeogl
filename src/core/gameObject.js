"use strict";

/**
 A 3D object within a {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <ul>
 <li>See the {{#crossLink "Scene"}}Scene{{/crossLink}} documentation for description and usage examples.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7122967/L.png"></img>

 @class GameObject
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GameObject within the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GameObject.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.clips] {String|Clips} ID or instance of a {{#crossLink "Clips"}}Clips{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/clips:property"}}clips{{/crossLink}}.
 @param [cfg.colorTarget] {String|ColorTarget} ID or instance of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}}.
 @param [cfg.depthTarget] {String|DepthTarget} ID or instance of a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}}.
 @param [cfg.depthBuf] {String|DepthBuf} ID or instance of a {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, depth {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}}.
 @param [cfg.visibility] {String|Visibility} ID or instance of a {{#crossLink "Visibility"}}Visibility{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}}.
 @param [cfg.modes] {String|Modes} ID or instance of a {{#crossLink "Modes"}}Modes{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/modes:property"}}modes{{/crossLink}}.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.layer] {String|Layer} ID or instance of a {{#crossLink "Layer"}}Layer{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}.
 @param [cfg.lights] {String|Lights} ID or instance of a {{#crossLink "Lights"}}Lights{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/lights:property"}}lights{{/crossLink}}.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.morphTargets] {String|MorphTargets} ID or instance of a {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default instance, {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}}.
 @param [cfg.reflect] {String|Reflect} ID or instance of a {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/reflect:property"}}reflection{{/crossLink}}.
 @param [cfg.shader] {String|Shader} ID or instance of a {{#crossLink "Shader"}}Shader{{/crossLink}} within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shader:property"}}shader{{/crossLink}}.
 @param [cfg.shaderParams] {String|ShaderParams} ID or instance of a {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}}.
 @param [cfg.stage] {String|Stage} ID or instance of of a {{#crossLink "Stage"}}Stage{{/crossLink}} within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform within the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @extends Component
 */

/**
 * Fired when this GameObject is *picked* via a call to the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method
 * on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas {{/crossLink}}.
 * @event picked
 * @param {String} objectId The ID of this GameObject.
 * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
 * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
 */

XEO.GameObject = XEO.Component.extend({

    className: "XEO.GameObject",

    type: "object",

    _init: function (cfg) {

        this.camera = cfg.camera;
        this.clips = cfg.clips;
        this.colorTarget = cfg.colorTarget;
        this.colorBuf = cfg.colorBuf;
        this.depthTarget = cfg.depthTarget;
        this.depthBuf = cfg.depthBuf;
        this.visibility = cfg.visibility;
        this.modes = cfg.modes;
        this.geometry = cfg.geometry;
        this.layer = cfg.layer;
        this.lights = cfg.lights;
        this.material = cfg.material;
        this.morphTargets = cfg.morphTargets;
        this.reflect = cfg.reflect;
        this.shader = cfg.shader;
        this.shaderParams = cfg.shaderParams;
        this.stage = cfg.stage;
        this.transform = cfg.transform;
    },

    /**
     * The {{#crossLink "Camera"}}Camera{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/camera:event"}}{{/crossLink}} event on change.
     * @property camera
     * @type Camera
     */
    set camera(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/camera:property"}}{{/crossLink}} property changes.
         * @event camera
         * @param value The property's new value
         */
        this._setChild("camera", value);
    },

    get camera() {
        return this._children.camera;
    },

    /**
     * The {{#crossLink "Clips"}}Clips{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/clips:property"}}clips{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/clips:event"}}{{/crossLink}} event on change.
     * @property clips
     * @type Clips
     */
    set clips(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/clips:property"}}{{/crossLink}} property changes.
         * @event clips
         * @param value The property's new value
         */
        this._setChild("clips", value);
    },

    get clips() {
        return this._children.clips;
    },

    /**
     * The {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/colorTarget:event"}}{{/crossLink}} event on change.
     * @property colorTarget
     * @type ColorTarget
     */
    set colorTarget(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/colorTarget:property"}}{{/crossLink}} property changes.
         * @event colorTarget
         * @param value The property's new value
         */
        this._setChild("colorTarget", value);
    },

    get colorTarget() {
        return this._children.colorTarget;
    },

    /**
     * The {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorBuf:property"}}colorBuf{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/colorBuf:event"}}{{/crossLink}} event on change.
     * @property colorBuf
     * @type ColorBuf
     */
    set colorBuf(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/colorBuf:property"}}{{/crossLink}} property changes.
         * @event colorBuf
         * @param value The property's new value
         */
        this._setChild("colorBuf", value);
    },

    get colorBuf() {
        return this._children.colorBuf;
    },

    /**
     * The {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/depthTarget:event"}}{{/crossLink}} event on change.
     * @property depthTarget
     * @type DepthTarget
     */
    set depthTarget(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/depthTarget:property"}}{{/crossLink}} property changes.
         * @event depthTarget
         * @param value The property's new value
         */
        this._setChild("depthTarget", value);
    },

    get depthTarget() {
        return this._children.depthTarget;
    },

    /**
     * The {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/depthBuf:event"}}{{/crossLink}} event on change.
     * @property depthBuf
     * @type DepthBuf
     */
    set depthBuf(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/depthBuf:property"}}{{/crossLink}} property changes.
         * @event depthBuf
         * @param value The property's new value
         */
        this._setChild("depthBuf", value);
    },

    get depthBuf() {
        return this._children.depthBuf;
    },

    /**
     * The {{#crossLink "Visibility"}}Visibility{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/visibility:event"}}{{/crossLink}} event on change.
     * @property visibility
     * @type Visibility
     */
    set visibility(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/visibility:property"}}{{/crossLink}} property changes.
         * @event visibility
         * @param value The property's new value
         */
        this._setChild("visibility", value);
    },

    get visibility() {
        return this._children.visibility;
    },

    /**
     * The {{#crossLink "Modes"}}Modes{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/modes:property"}}modes{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/modes:event"}}{{/crossLink}} event on change.
     * @property modes
     * @type Modes
     */
    set modes(value) {

        /**
         * Fired whenever this GameObject's {{#crossLink "GameObject/modes:property"}}{{/crossLink}} property changes.
         * @event modes
         * @param value The property's new value
         */
        this._setChild("modes", value);
    },

    get modes() {
        return this._children.modes;
    },

    /**
     * The {{#crossLink "Geometry"}}Geometry{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/geometry:property"}}camera{{/crossLink}}
     * (a simple box) when set to a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/geometry:event"}}{{/crossLink}} event on change.
     * @property geometry
     * @type Geometry
     */
    set geometry(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/geometry:property"}}{{/crossLink}} property changes.
         * @event visibility
         * @param value The property's new value
         */
        this._setChild("geometry", value);
    },

    get geometry() {
        return this._children.geometry;
    },

    /**
     * The {{#crossLink "Layer"}}Layer{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/layer:property"}}layer{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/layer:event"}}{{/crossLink}} event on change.
     * @property layer
     * @type Layer
     */
    set layer(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/layer:property"}}{{/crossLink}} property changes.
         * @event layer
         * @param value The property's new value
         */
        this._setChild("layer", value);
    },

    get layer() {
        return this._children.layer;
    },

    /**
     * The {{#crossLink "Lights"}}Lights{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}lights{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/lights:event"}}{{/crossLink}} event on change.
     * @property lights
     * @type Lights
     */
    set lights(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/lights:property"}}{{/crossLink}} property changes.
         * @event lights
         * @param value The property's new value
         */
        this._setChild("lights", value);
    },

    get lights() {
        return this._children.lights;
    },

    /**
     * The {{#crossLink "Material"}}Material{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/material:property"}}material{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/material:event"}}{{/crossLink}} event on change.
     * @property material
     * @type Material
     */
    set material(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/material:property"}}{{/crossLink}} property changes.
         * @event material
         * @param value The property's new value
         */
        this._setChild("material", value);
    },

    get material() {
        return this._children.material;
    },

    /**
     * The {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/morphTargets:event"}}{{/crossLink}} event on change.
     * @property morphTargets
     * @type MorphTargets
     */
    set morphTargets(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/morphTargets:property"}}{{/crossLink}} property changes.
         * @event morphTargets
         * @param value The property's new value
         */
        this._setChild("morphTargets", value);
    },

    get morphTargets() {
        return this._children.morphTargets;
    },

    /**
     * The {{#crossLink "Reflect"}}Reflect{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/reflect:property"}}reflect{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/reflect:event"}}{{/crossLink}} event on change.
     * @property reflect
     * @type Reflect
     */
    set reflect(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/reflect:property"}}{{/crossLink}} property changes.
         * @event reflect
         * @param value The property's new value
         */
        this._setChild("reflect", value);
    },

    get reflect() {
        return this._children.reflect;
    },

    /**
     * The {{#crossLink "Shader"}}Shader{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shader:property"}}shader{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/shader:event"}}{{/crossLink}} event on change.
     * @property shader
     * @type Shader
     */
    set shader(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/shader:property"}}{{/crossLink}} property changes.
         * @event shader
         * @param value The property's new value
         */
        this._setChild("shader", value);
    },

    get shader() {
        return this._children.shader;
    },

    /**
     * The {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/shaderParams:event"}}{{/crossLink}} event on change.
     * @property shaderParams
     * @type ShaderParams
     */
    set shaderParams(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/shaderParams:property"}}{{/crossLink}} property changes.
         * @event shaderParams
         * @param value The property's new value
         */
        this._setChild("shaderParams", value);
    },

    get shaderParams() {
        return this._children.shaderParams;
    },

    /**
     * The {{#crossLink "Stage"}}Stage{{/crossLink}} associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/stage:property"}}stage{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/stage:event"}}{{/crossLink}} event on change.
     * @property stage
     * @type Stage
     */
    set stage(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/stage:property"}}{{/crossLink}} property changes.
         * @event stage
         * @param value The property's new value
         */
        this._setChild("stage", value);
    },

    get stage() {
        return this._children.stage;
    },

    /**
     * The modelling transform associated with this GameObject.
     *
     * Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/transform:property"}}transform{{/crossLink}}
     * (an identity matrix) when set to a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/transform:event"}}{{/crossLink}} event on change.
     *
     * @property transform
     * @type Component
     */
    set transform(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/transform:property"}}{{/crossLink}} property changes.
         * @event transform
         * @param value The property's new value
         */
        this._setChild("transform", value);
    },

    get transform() {
        return this._children.transform;
    },

    _compile: function () {

        // Set states associated with this GameObject on the renderer

        var children = this._children;

        children.camera._compile();
        children.clips._compile();
        children.colorTarget._compile();
        children.colorBuf._compile();
        children.depthTarget._compile();
        children.depthBuf._compile();
        children.visibility._compile();
        children.modes._compile();
        children.geometry._compile();
        children.layer._compile();
        children.lights._compile();
        children.material._compile();
        children.morphTargets._compile();
        children.reflect._compile();
        children.shader._compile();
        children.shaderParams._compile();
        children.stage._compile();
        children.transform._compile();

        // (Re)build this GameObject in the renderer

        this._renderer.buildGameObject(this.id);
    },

    _getJSON: function () {
        return {
            camera: this.camera.id,
            clips: this.clips.id,
            colorTarget: this.colorTarget.id,
            colorBuf: this.colorBuf.id,
            depthTarget: this.depthTarget.id,
            depthBuf: this.depthBuf.id,
            visibility: this.visibility.id,
            modes: this.modes.id,
            geometry: this.geometry.id,
            layer: this.layer.id,
            lights: this.lights.id,
            material: this.material.id,
            morphTargets: this.morphTargets.id,
            reflect: this.reflect.id,
            shader: this.shader.id,
            shaderParams: this.shaderParams.id,
            stage: this.stage.id,
            transform: this.transform.id
        };
    },

    _destroy: function () {

        this._renderer.removeGameObject(this.id);
    }
});





