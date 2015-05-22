(function () {

    "use strict";

    XEO.renderer = XEO.renderer || {};

    XEO.renderer.StateFactory = function () {
        this._stateIDMap = new XEO.utils.Map({});
    };

    XEO.renderer.StateFactory.prototype._createState = function (cfg) {

        var id = this._stateIDMap.addItem({});

        var state =  new (function () {

            // Unique state ID
            this.id = id;

            // Unique state hash
            this.hash = cfg.hash || "" + this.id; // Initial state hash

            // Create caller props

            for (var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    this[key] = cfg[key];
                }
            }
        })();

        return state;
    };

    XEO.renderer.StateFactory.prototype.newVisibility = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newModes = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newLayer = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newStage = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newDepthBuf = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newColorBuf = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newLights = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newMaterial = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newTexture = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newReflect = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newModelTransform = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newViewTransform = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newRenderTarget = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newClips = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newMorphTargets = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newShader = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.newShaderParams = function (cfg) {
        return this._createState(cfg);
    };

    XEO.renderer.StateFactory.prototype.destroyState = function (state) {
        this._stateIDMap.removeItem(state.id);
    };

})();


