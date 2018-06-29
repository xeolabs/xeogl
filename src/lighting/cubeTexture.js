/**
 A **CubeTexture** specifies a cube texture map.

 ## Overview

 See {{#crossLink "Lights"}}{{/crossLink}} for an example of how to use CubeTextures for light and reflection mapping.

 @class CubeTexture
 @module xeogl
 @submodule lighting
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CubeTexture in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this CubeTexture, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CubeTexture.
 @param [cfg.src=null] {Array of String} Paths to six image files to load into this CubeTexture.
 @param [cfg.flipY=false] {Boolean} Flips this CubeTexture's source data along its vertical axis when true.
 @param [cfg.encoding="linear"] {String} Encoding format.  See the {{#crossLink "CubeTexture/encoding:property"}}{{/crossLink}} property for more info.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CubeTexture = xeogl.Component.extend({

        type: "xeogl.CubeTexture",

        _init: function (cfg) {

            var gl = this.scene.canvas.gl;

            this._state = new xeogl.renderer.State({
                texture : new xeogl.renderer.Texture2D(gl, gl.TEXTURE_CUBE_MAP),
                flipY: this._checkFlipY(cfg.minFilter),
                encoding: this._checkEncoding(cfg.encoding),
                minFilter: "linearMipmapLinear",
                magFilter: "linear",
                wrapS: "clampToEdge",
                wrapT: "clampToEdge",
                mipmaps: true
            });

            this._src = cfg.src;
            this._images = [];

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored", this._webglContextRestored, this);

            this._loadSrc(cfg.src);

            xeogl.stats.memory.textures++;
        },

        _checkFlipY: function (value) {
            return !!value;
        },

        _checkEncoding: function (value) {
            value = value || "linear";
            if (value !== "linear" && value !== "sRGB" && value !== "gamma") {
                this.error("Unsupported value for 'encoding': '" + value + "' - supported values are 'linear', 'sRGB', 'gamma'. Defaulting to 'linear'.");
                value = "linear";
            }
            return value;
        },

        _webglContextRestored: function () {
            this._state.texture = null;
            // TODO
        },

        _loadSrc: function (src) {
            var self = this;
            var gl = this.scene.canvas.gl;
            this._images = [];
            var loadFailed = false;
            var numLoaded = 0;
            for (var i = 0; i < src.length; i++) {
                var image = new Image();
                image.onload = (function () {
                    var _image = image;
                    var index = i;
                    return function () {
                        if (loadFailed) {
                            return;
                        }
                        _image = xeogl.renderer.ensureImageSizePowerOfTwo(_image);
                        self._images[index] = _image;
                        numLoaded++;
                        if (numLoaded === 6) {
                            self._imageDirty = true;
                            var texture = self._state.texture;
                            if (!texture) {
                                texture = new xeogl.renderer.Texture2D(gl, gl.TEXTURE_CUBE_MAP);
                                self._state.texture = texture;
                            }
                            texture.setImage(self._images, self._state);
                            texture.setProps(self._state);
                            /**
                             * Fired whenever this CubeTexture has loaded the
                             * image files that its {{#crossLink "CubeTexture/src:property"}}{{/crossLink}} property currently points to.
                             * @event loaded
                             * @param value {HTML Image} The value of the {{#crossLink "CubeTexture/src:property"}}{{/crossLink}} property
                             */
                            self.fire("loaded", self._src);
                        }
                    };
                })();
                image.onerror = function () {
                    loadFailed = true;
                };
                image.src = src[i];
            }
        },

        _destroy: function () {
            this.scene.canvas.off(this._webglContextRestored);
            if (this._state.texture) {
                this._state.texture.destroy();
            }
            xeogl.stats.memory.textures--;
        }
    });

})();
