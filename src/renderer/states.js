/**
 * @author xeolabs / https://github.com/xeolabs
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

xeogl.renderer.Visibility = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Cull = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Modes = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Lights = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Light = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.LambertMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.PhongMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.SpecularMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.MetallicMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.VerticesMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.EmphasisMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.OutlineMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.HighlightMaterial = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.ViewTransform = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.ProjTransform = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Transform = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Clips = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Texture = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.CubeTexture = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Fresnel = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.VertexBufs = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Geometry = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
xeogl.renderer.Viewport = xeogl.renderer.State.extend({_ids: new xeogl.utils.Map({})});
