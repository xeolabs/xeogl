/**
 * Renderer states
 */
(function () {

    "use strict";

    xeogl.renderer = xeogl.renderer || {};


    /**

     Base class for Renderer states.

     renderer.State
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     */
    xeogl.renderer.State = Class.extend({

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

    //xeogl.renderer.State.prototype.destroy = function () {
    //    states.removeItem(this.id);
    //};

    /**

     Visibility state.

     renderer.Visibility
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.visible {Boolean} Flag which controls visibility of the associated render objects.
     @extends renderer.State
     */
    xeogl.renderer.Visibility = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Culling state.

     renderer.Cull
     @module xeogl

     @constructor
     @param cfg {*} Configs
     @param cfg.culled {Boolean} Flag which controls cull state of the associated render objects.
     @extends renderer.State
     */
    xeogl.renderer.Cull = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Modes state.

     renderer.Mode
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.pickable {Boolean} Flag which controls pickability of the associated render objects.
     @param cfg.clipping {Boolean} Flag which controls whether associated render objects are clippable.
     @param cfg.transparent {Boolean} Flag which controls transparency of the associated render objects.
     @param cfg.frontFace {Boolean} Flag which determines winding order of backfaces on the associated render objects - true == "ccw", false == "cw".
     @extends renderer.State
     */
    xeogl.renderer.Modes = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Layer state.

     renderer.Layer
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Layer render priority.
     @extends renderer.State
     */
    xeogl.renderer.Layer = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Stage state.

     renderer.Stage
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Stage render priority.
     @extends renderer.State
     */
    xeogl.renderer.Stage = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Depth buffer state.

     renderer.DepthBuf
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.clearDepth {Number} Clear depth
     @param cfg.depthBuf {String} Depth function
     @extends renderer.State
     */
    xeogl.renderer.DepthBuf = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Color buffer state.

     renderer.ColorBuf
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.blendEnabled {Boolean} Indicates if blending is enebled for
     @param cfg.colorMask {Array of String} The color mask
     @extends renderer.State
     */
    xeogl.renderer.ColorBuf = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Renderer lights state.

     renderer.Lights
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @param cfg.colorMask {Array of Object} The light sources
     @extends renderer.State
     */
    xeogl.renderer.Lights = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     PhongMaterial state.

     renderer.PhongMaterial
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.PhongMaterial = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Environmental reflection state.

     renderer.Reflect
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Reflect = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Transform state.

     renderer.Transform
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Transform = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Billboard transform state.

     renderer.Billboard
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Billboard = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Stationary transform state.

     renderer.Stationary
     @module xeogl

     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Stationary = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });


    /**

     Render target state.

     renderer.RenderTarget
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.RenderTarget = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    xeogl.renderer.RenderTarget.DEPTH = 0;
    xeogl.renderer.RenderTarget.COLOR = 1;

    /**

     Clip planes state.

     renderer.Clips
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Clips = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Renderer morph targets state.

     renderer.MorphTargets
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.MorphTargets = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Shader state.

     renderer.Shader
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Shader = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Shader parameters state.

     renderer.ShaderParams
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.ShaderParams = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Texture state.

     renderer.Texture
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Texture = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });


    /**

     Fresnel state.

     renderer.Fresnel
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Fresnel = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });


    /**

     Geometry state.

     renderer.Geometry
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.Geometry = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Program state.

     renderer.ProgramState
     @module xeogl
     
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    xeogl.renderer.ProgramState = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });

    /**

     Viewport state.

     renderer.Viewport
     @module xeogl

     @constructor
     @param cfg {*} Configs
     @param cfg.boundary {Float32Array} Canvas-space viewport extents.
     @extends renderer.State
     */
    xeogl.renderer.Viewport = xeogl.renderer.State.extend({
        _ids: new xeogl.utils.Map({})
    });
})();


