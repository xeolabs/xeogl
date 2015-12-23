/**
 * Renderer states
 */
(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};


    /**

     Base class for Renderer states.

     renderer.State
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     */
    XEO.renderer.State = Class.extend({

        __init: function (cfg) {

            this.id = this._ids.addItem({});

            this.hash = cfg.hash || "" + this.id; // Not used by all sub-classes

            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    this[key] = cfg[key];
                }
            }
        },

        destroy: function () {
            this._ids.removeItem(this.id);
        }
    });

    //XEO.renderer.State.prototype.destroy = function () {
    //    states.removeItem(this.id);
    //};

    /**

     Visibility state.

     renderer.Visibility
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.visible {Boolean} Flag which controls visibility of the associated render objects.
     @extends renderer.State
     */
    XEO.renderer.Visibility = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Modes state.

     renderer.Mode
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.pickable {Boolean} Flag which controls pickability of the associated render objects.
     @param cfg.clipping {Boolean} Flag which controls whether associated render objects are clippable.
     @param cfg.transparent {Boolean} Flag which controls transparency of the associated render objects.
     @param cfg.frontFace {Boolean} Flag which determines winding order of backfaces on the associated render objects - true == "ccw", false == "cw".
     @extends renderer.State
     */
    XEO.renderer.Modes = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Layer state.

     renderer.Layer
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Layer render priority.
     @extends renderer.State
     */
    XEO.renderer.Layer = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Stage state.

     renderer.Stage
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Stage render priority.
     @extends renderer.State
     */
    XEO.renderer.Stage = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Depth buffer state.

     renderer.DepthBuf
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.clearDepth {Number} Clear depth
     @param cfg.depthBuf {String} Depth function
     @extends renderer.State
     */
    XEO.renderer.DepthBuf = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Color buffer state.

     renderer.ColorBuf
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.blendEnabled {Boolean} Indicates if blending is enebled for
     @param cfg.colorMask {Array of String} The color mask
     @extends renderer.State
     */
    XEO.renderer.ColorBuf = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Renderer lights state.

     renderer.Lights
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @param cfg.colorMask {Array of Object} The light sources
     @extends renderer.State
     */
    XEO.renderer.Lights = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     PhongMaterial state.

     renderer.PhongMaterial
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.PhongMaterial = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Environmental reflection state.

     renderer.Reflect
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Reflect = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Modelling transform state.

     renderer.ModelTransform
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ModelTransform = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Viewing transform state.

     renderer.ViewTransform
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ViewTransform = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Projection transform state.

     renderer.ProjTransform
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ProjTransform = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Billboard transform state.

     renderer.Billboard
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Billboard = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Stationary transform state.

     renderer.Stationary
     @module XEO

     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Stationary = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });


    /**

     Render target state.

     renderer.RenderTarget
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.RenderTarget = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    XEO.renderer.RenderTarget.DEPTH = 0;
    XEO.renderer.RenderTarget.COLOR = 1;

    /**

     Clip planes state.

     renderer.Clips
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Clips = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Renderer morph targets state.

     renderer.MorphTargets
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.MorphTargets = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Shader state.

     renderer.Shader
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Shader = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Shader parameters state.

     renderer.ShaderParams
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ShaderParams = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Texture state.

     renderer.Texture
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Texture = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });


    /**

     Fresnel state.

     renderer.Fresnel
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Fresnel = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });


    /**

     Geometry state.

     renderer.Geometry
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Geometry = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

    /**

     Program state.

     renderer.ProgramState
     @module XEO
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ProgramState = XEO.renderer.State.extend({
        _ids: new XEO.utils.Map({})
    });

})();


