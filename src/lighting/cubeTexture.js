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
 @extends Component
 */
(function () {

    "use strict";

    xeogl.CubeTexture = xeogl.Component.extend({

        type: "xeogl.CubeTexture",

        _init: function (cfg) {

            this._state = new xeogl.renderer.CubeTexture({
                texture: null
            });

            this._src = [];
            this._images = [];

            this._srcDirty = false;
            this._imageDirty = false;

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored", this._webglContextRestored, this);

            this.flipY = cfg.flipY;
            this.src = cfg.src; // Image file}

            xeogl.stats.memory.textures++;
        },

        _webglContextRestored: function () {

            this._state.texture = null;

            if (this._src) {
                this._srcDirty = true;
            }

            this._scheduleUpdate();
        },

        _update: function () {

            if (this._srcDirty) {
                if (this._src) {
                    this._loadSrc(this._src); // _imageDirty is set when the image has loaded
                    this._srcDirty = false;
                    return;
                }
            }

            if (this._imageDirty) {
                this._createTexture();
                this._renderer.imageDirty = true;
            }
        },

        _loadSrc: function (src) {

            var self = this;

            var spinner = this.scene.canvas.spinner;
            var spinnerTextures = spinner.textures;

            this._images = [];

            var loadFailed = false;

            for (var i = 0; i < src.length; i++) {

                var image = new Image();

                image.onload = (function () {

                    var _image = image;
                    var index = i;

                    return function () {

                        if (loadFailed) {
                            return;
                        }

                        _image = xeogl.renderer.webgl.ensureImageSizePowerOfTwo(_image);

                        self._images[index] = _image;

                        if (self._images.length === src.length) {

                            self._imageDirty = true;

                            if (spinnerTextures) {
                                spinner.processes--;
                            }

                            self._scheduleUpdate();

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
                    if (spinnerTextures) {
                        spinner.processes--;
                    }

                };

                image.src = src[i];
            }
        },

        _createTexture: function () {

            var gl = this.scene.canvas.gl;

            var texture = this._state.texture;

            if (!texture) {
                texture = new xeogl.renderer.webgl.Texture2D(gl, gl.TEXTURE_CUBE_MAP);
                this._state.texture = texture;
            }

            texture.setImage(this._images, this._state);

            texture.setProps({
                minFilter: "linearMipmapLinear",
                magFilter: "linear",
                wrapS: "clampToEdge",
                wrapT: "clampToEdge",
                mipmaps: true
            });

            this._imageDirty = false;
        },

        _props: {

            /**
             Array of paths to six image files to source this CubeTexture.

             Fires a {{#crossLink "CubeTexture/src:event"}}{{/crossLink}} event on change.

             @property src
             @default null
             @type {Array of String}
             */
            src: {

                set: function (value) {

                    this._src = value;

                    this._srcDirty = true;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CubeTexture's {{#crossLink "CubeTexture/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type {Array of String}
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            },

            /**
             * Flips this CubeTexture's source data along its vertical axis when true.
             *
             * Fires a {{#crossLink "CubeTexture/flipY:event"}}{{/crossLink}} event on change.
             *
             * @property flipY
             * @default false
             * @type Boolean
             */
            flipY: {

                set: function (value) {

                    value = !!value;

                    if (this._state.flipY === value) {
                        return;
                    }

                    this._state.flipY = value;
                    this._imageDirty = true; // flipY is used when loading image data, not when post-applying props

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this CubeTexture's  {{#crossLink "CubeTexture/flipY:property"}}{{/crossLink}} property changes.
                     * @event flipY
                     * @param value {String} The property's new value
                     */
                    this.fire("flipY", this._state.flipY);
                },

                get: function () {
                    return this._state.flipY;
                }
            }
        },

        _getJSON: function () {

            var json =  {
                src: this._src.slice()
            };

            if (this._state.flipY !== false) {
                json.flipY = this._state.flipY;
            }

            return json;
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
