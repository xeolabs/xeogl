/**
 * Renderer states
 */
(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    var states = new XEO.utils.Map({});

    /**

     Base class for Renderer states.

     @class renderer.State
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     */
    XEO.renderer.State = Class.extend({

        __init: function (cfg) {

            this.id = states.addItem({});

            this.hash = cfg.hash || "" + this.id;

            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    this[key] = cfg[key];
                }
            }
        },

        destroy: function () {
            states.removeItem(this.id);
        }
    });

    //XEO.renderer.State.prototype.destroy = function () {
    //    states.removeItem(this.id);
    //};

    /**

     Visibility state.

     @class renderer.Visibility
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.visible {Boolean} Flag which controls visibility of the associated render objects.
     @extends renderer.State
     */
    XEO.renderer.Visibility = XEO.renderer.State.extend({});

    /**

     Modes state.

     @class renderer.Mode
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.picking {Boolean} Flag which controls pickability of the associated render objects.
     @param cfg.clipping {Boolean} Flag which controls whether associated render objects are clippable.
     @param cfg.transparent {Boolean} Flag which controls transparency of the associated render objects.
     @param cfg.frontFace {Boolean} Flag which determines winding order of backfaces on the associated render objects - true == "ccw", false == "cw".
     @extends renderer.State
     */
    XEO.renderer.Modes = XEO.renderer.State.extend({});

    /**

     Layer state.

     @class renderer.Layer
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Layer render priority.
     @extends renderer.State
     */
    XEO.renderer.Layer = XEO.renderer.State.extend({});

    /**

     Stage state.

     @class renderer.Stage
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.priority {Number} Stage render priority.
     @extends renderer.State
     */
    XEO.renderer.Stage = XEO.renderer.State.extend({});

    /**

     Depth buffer state.

     @class renderer.DepthBuf
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.clearDepth {Number} Clear depth
     @param cfg.depthBuf {String} Depth function
     @extends renderer.State
     */
    XEO.renderer.DepthBuf = XEO.renderer.State.extend({});

    /**

     Color buffer state.

     @class renderer.ColorBuf
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.blendEnabled {Boolean} Indicates if blending is enebled for
     @param cfg.colorMask {Array of String} The color mask
     @extends renderer.State
     */
    XEO.renderer.ColorBuf = XEO.renderer.State.extend({});

    /**

     Renderer lights state.

     @class renderer.Lights
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @param cfg.colorMask {Array of Object} The light sources
     @extends renderer.State
     */
    XEO.renderer.Lights = XEO.renderer.State.extend({});

    /**

     Material state.

     @class renderer.Material
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Material = XEO.renderer.State.extend({});

    /**

     Environmental reflection state.

     @class renderer.Reflect
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Reflect = XEO.renderer.State.extend({});

    /**

     Modelling transform state.

     @class renderer.ModelTransform
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ModelTransform = XEO.renderer.State.extend({});

    /**

     Viewing transform state.

     @class renderer.ViewTransform
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ViewTransform = XEO.renderer.State.extend({});

    /**

     Projection transform state.

     @class renderer.ProjTransform
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ProjTransform = XEO.renderer.State.extend({});

    /**

     Render target state.

     @class renderer.RenderTarget
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.RenderTarget = XEO.renderer.State.extend({});

    XEO.renderer.RenderTarget.DEPTH = 0;
    XEO.renderer.RenderTarget.COLOR = 1;

    /**

     Clip planes state.

     @class renderer.Clips
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Clips = XEO.renderer.State.extend({});

    /**

     Renderer morph targets state.

     @class renderer.MorphTargets
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.MorphTargets = XEO.renderer.State.extend({});

    /**

     Shader state.

     @class renderer.Shader
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Shader = XEO.renderer.State.extend({});

    /**

     Shader parameters state.

     @class renderer.ShaderParams
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.ShaderParams = XEO.renderer.State.extend({});

    /**

     Geometry state.

     @class renderer.Geometry
     @module XEO
     @submodule renderer
     @constructor
     @param cfg {*} Configs
     @extends renderer.State
     */
    XEO.renderer.Geometry = XEO.renderer.State.extend({});

})();


