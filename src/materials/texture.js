/**
 A **Texture** specifies a texture map.

 ## Overview

 * Textures are grouped within {{#crossLink "Material"}}Materials{{/crossLink}}, which are attached to
 {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * To create a Texture from an image file, set the Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}}
 property to the image file path.
 * To create a Texture from an HTMLImageElement, set the Texture's {{#crossLink "Texture/image:property"}}{{/crossLink}}
 property to the HTMLImageElement.

 ## Examples

 * [Textures on MetallicMaterials](../../examples/#materials_metallic_textures)
 * [Textures on SpecularMaterials](../../examples/#materials_specGloss_textures)
 * [Textures on PhongMaterials](../../examples/#materials_phong_textures)
 * [Video texture](../../examples/#materials_phong_textures_video)

 ## Usage

 In this example we have an Entity with

 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies diffuse and specular {{#crossLink "Texture"}}Textures{{/crossLink}}, and
 * a {{#crossLink "TorusGeometry"}}{{/crossLink}}.

 Note that xeogl will ignore the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} properties, since we assigned {{#crossLink "Texture"}}Textures{{/crossLink}} to the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} and
 {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}} properties. The {{#crossLink "Texture"}}Textures'{{/crossLink}} pixel
 colors directly provide the diffuse and specular components for each fragment across the {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var entity = new xeogl.Entity({

    material: new xeogl.PhongMaterial({
        ambient: [0.3, 0.3, 0.3],
        diffuse: [0.5, 0.5, 0.0],   // Ignored, since we have assigned a Texture to diffuseMap, below
        specular: [1.0, 1.0, 1.0],   // Ignored, since we have assigned a Texture to specularMap, below
        diffuseMap: new xeogl.Texture({
            src: "diffuseMap.jpg"
        }),
        specularMap: new xeogl.Fresnel({
            src: "diffuseMap.jpg"
        }),
        shininess: 80, // Default
        alpha: 1.0 // Default
    }),

    geometry: new xeogl.TorusGeometry()
});
 ````

 @class Texture
 @module xeogl
 @submodule materials
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Texture in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this Texture, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Texture.
 @param [cfg.src=null] {String} Path to image file to load into this Texture. See the {{#crossLink "Texture/src:property"}}{{/crossLink}} property for more info.
 @param [cfg.image=null] {HTMLImageElement} HTML Image object to load into this Texture. See the {{#crossLink "Texture/image:property"}}{{/crossLink}} property for more info.
 @param [cfg.minFilter="linearMipmapLinear"] {String} How the texture is sampled when a texel covers less than one pixel. See the {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.magFilter="linear"] {String} How the texture is sampled when a texel covers more than one pixel. See the {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapS="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapT="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property for more info.
 @param [cfg.flipY=false] {Boolean} Flips this Texture's source data along its vertical axis when true.
 @param [cfg.translate=[0,0]] {Array of Number} 2D translation vector that will be added to texture's *S* and *T* coordinates.
 @param [cfg.scale=[1,1]] {Array of Number} 2D scaling vector that will be applied to texture's *S* and *T* coordinates.
 @param [cfg.rotate=0] {Number} Rotation, in degrees, that will be applied to texture's *S* and *T* coordinates.
 @param [cfg.encoding="linear"] {String} Encoding format.  See the {{#crossLink "Texture/encoding:property"}}{{/crossLink}} property for more info.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Texture = xeogl.Component.extend({

        type: "xeogl.Texture",

        _init: function (cfg) {

            // Rendering state

            this._state = new xeogl.renderer.Texture({

                texture: new xeogl.renderer.Texture2D(this.scene.canvas.gl),
                matrix: null,   // Float32Array

                // Texture properties

                minFilter: null,
                magFilter: null,
                wrapS: null,
                wrapT: null,
                flipY: false
            });

            // Data source

            this._src = null;   // URL string
            this._image = null; // HTMLImageElement

            // Transformation

            this._translate = xeogl.math.vec2([0, 0]);
            this._scale = xeogl.math.vec2([1, 1]);
            this._rotate = xeogl.math.vec2([0, 0]);

            // Dirty flags, processed in _buildTexture()

            this._matrixDirty = false;
            this._srcDirty = false;
            this._imageDirty = false;
            this._propsDirty = false;

            // Handle WebGL context restore

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored", this._webglContextRestored, this);

            // Transform

            this.translate = cfg.translate;
            this.scale = cfg.scale;
            this.rotate = cfg.rotate;

            // Properties

            this.minFilter = cfg.minFilter;
            this.magFilter = cfg.magFilter;
            this.wrapS = cfg.wrapS;
            this.wrapT = cfg.wrapT;
            this.flipY = cfg.flipY;
            this.encoding = cfg.encoding;

            // Data source

            if (cfg.src) {
                this.src = cfg.src; // Image file

            } else if (cfg.image) {
                this.image = cfg.image; // Image object
            }

            xeogl.stats.memory.textures++;
        },

        _webglContextRestored: function () {

            this._state.texture = null;

            this._matrixDirty = true;
            this._propsDirty = true;

            if (this._image) {
                this._imageDirty = true;

            } else if (this._src) {
                this._srcDirty = true;
            }

            this._needUpdate();
        },

        _update: function () {

            var gl = this.scene.canvas.gl;

            var state = this._state;

            if (this._srcDirty) {

                if (this._src) {

                    this._loadSrc(this._src);

                    this._srcDirty = false;

                    // _imageDirty is set when the image has loaded

                    return;
                }
            }

            if (this._imageDirty) {

                if (this._image) {

                    if (!state.texture) {
                        state.texture = new xeogl.renderer.Texture2D(gl);
                    }

                    state.texture.setImage(this._image, state);

                    state.renderable = true;

                    this._imageDirty = false;
                    this._propsDirty = true; // May now need to regenerate mipmaps etc
                }
            }

            if (this._matrixDirty) {

                var matrix;

                var t;

                if (this._translate[0] !== 0 || this._translate[1] !== 0) {
                    matrix = xeogl.math.translationMat4v([this._translate[0], this._translate[1], 0]);
                }

                if (this._scale[0] !== 1 || this._scale[1] !== 1) {
                    t = xeogl.math.scalingMat4v([this._scale[0], this._scale[1], 1]);
                    matrix = matrix ? xeogl.math.mulMat4(matrix, t) : t;
                }

                if (this._rotate !== 0) {
                    t = xeogl.math.rotationMat4v(this._rotate * 0.0174532925, [0, 0, 1]);
                    matrix = matrix ? xeogl.math.mulMat4(matrix, t) : t;
                }

                var oldMatrix = state.matrix;

                state.matrix = matrix;

                this._matrixDirty = false;

                if (!!matrix !== !!oldMatrix) {

                    // Matrix has been lazy-created, now need
                    // to recompile xeogl objectRenderers to use the matrix

                    this.fire("dirty");
                }
            }

            if (this._propsDirty) {

                if (state.texture && state.texture.setProps) {
                    state.texture.setProps(state);
                }

                this._propsDirty = false;
            }

            this._renderer.imageDirty();
        },

        _loadSrc: function (src) {

            var self = this;

            var image = new Image();

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = xeogl.renderer.ensureImageSizePowerOfTwo(image);

                    self._imageDirty = true;
                    self._srcDirty = false;

                    self._needUpdate();

                    /**
                     * Fired whenever this Texture has loaded the
                     * image file that its {{#crossLink "Texture/src:property"}}{{/crossLink}} property currently points to.
                     * @event loaded
                     * @param value {HTML Image} The value of the {{#crossLink "Texture/src:property"}}{{/crossLink}} property
                     */
                    self.fire("loaded", self._src);
                }
            };

            image.onerror = function () {

                /**
                 * Fired when an error occurs that prevents this Texture from loading.
                 * @event error
                 */
                self.fire("error");
            };

            if (src.indexOf("data") === 0) {

                // Image data
                image.src = src;

            } else {

                // Image file
                image.crossOrigin = "Anonymous";
                image.src = src;
            }
        },

        _props: {

            /**
             * Indicates an HTML DOM Image object to source this Texture from.
             *
             * Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} property to null.
             *
             * @property image
             * @default null
             * @type {HTMLImageElement}
             */
            image: {

                set: function (value) {

                    this._image = xeogl.renderer.ensureImageSizePowerOfTwo(value);
                    this._src = null;

                    this._imageDirty = true;
                    this._srcDirty = false;

                    this._needUpdate();
                },

                get: function () {
                    return this._image;
                }
            },

            /**
             * Indicates a path to an image file to source this Texture from.
             *
             * Sets the {{#crossLink "Texture/image:property"}}{{/crossLink}} property to null.
             *
             * @property src
             * @default null
             * @type String
             */
            src: {

                set: function (value) {

                    this._image = null;
                    this._src = value;

                    this._imageDirty = false;
                    this._srcDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._src;
                }
            },

            /**
             * 2D translation vector that will be added to this Texture's *S* and *T* coordinates.
             *
             * @property translate
             * @default [0, 0]
             * @type Array(Number)
             */
            translate: {

                set: function (value) {

                    this._translate.set(value || [0, 0]);
                    this._matrixDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._translate;
                }
            },

            /**
             * 2D scaling vector that will be applied to this Texture's *S* and *T* coordinates.
             *
             * @property scale
             * @default [1, 1]
             * @type Array(Number)
             */
            scale: {

                set: function (value) {

                    this._scale.set(value || [1, 1]);
                    this._matrixDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._scale;
                }
            },

            /**
             * Rotation, in degrees, that will be applied to this Texture's *S* and *T* coordinates.
             *
             * @property rotate
             * @default 0
             * @type Number
             */
            rotate: {

                set: function (value) {

                    value = value || 0;

                    if (this._rotate === value) {
                        return;
                    }

                    this._rotate = value;
                    this._matrixDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._rotate;
                }
            },

            /**
             * How this Texture is sampled when a texel covers less than one pixel.
             *
             *
             * Options are:
             *
             *     * **"nearest"** - Uses the value of the texture element that is nearest
             *     (in Manhattan distance) to the center of the pixel being textured.
             *
             *     * **"linear"** - Uses the weighted average of the four texture elements that are
             *     closest to the center of the pixel being textured.
             *
             *     * **"nearestMipmapNearest"** - Chooses the mipmap that most closely matches the
             *     size of the pixel being textured and uses the "nearest" criterion (the texture
             *     element nearest to the center of the pixel) to produce a texture value.
             *
             *     * **"linearMipmapNearest"** - Chooses the mipmap that most closely matches the size of
             *     the pixel being textured and uses the "linear" criterion (a weighted average of the
             *     four texture elements that are closest to the center of the pixel) to produce a
             *     texture value.
             *
             *     * **"nearestMipmapLinear"** - Chooses the two mipmaps that most closely
             *     match the size of the pixel being textured and uses the "nearest" criterion
             *     (the texture element nearest to the center of the pixel) to produce a texture
             *     value from each mipmap. The final texture value is a weighted average of those two
             *     values.
             *
             *     * **"linearMipmapLinear"** - **(default)** - Chooses the two mipmaps that most closely match the size
             *     of the pixel being textured and uses the "linear" criterion (a weighted average
             *     of the four texture elements that are closest to the center of the pixel) to
             *     produce a texture value from each mipmap. The final texture value is a weighted
             *     average of those two values.
             *
             * @property minFilter
             * @default "linearMipmapLinear"
             * @type String
             */
            minFilter: {

                set: function (value) {

                    value = value || "linearMipmapLinear";

                    if (value !== "linear" &&
                        value !== "linearMipmapNearest" &&
                        value !== "linearMipmapLinear" &&
                        value !== "nearestMipmapLinear" &&
                        value !== "nearestMipmapNearest") {

                        this.error("Unsupported value for 'minFilter': '" + value +
                            "' - supported values are 'linear', 'linearMipmapNearest', 'nearestMipmapNearest', " +
                            "'nearestMipmapLinear' and 'linearMipmapLinear'. Defaulting to 'linearMipmapLinear'.");

                        value = "linearMipmapLinear";
                    }

                    this._state.minFilter = value;
                    this._propsDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._state.minFilter;
                }
            },

            /**
             * How this Texture is sampled when a texel covers more than one pixel.
             *
             * Options are:
             *
             *
             *     * **"nearest"** - Uses the value of the texture element that is nearest
             *     (in Manhattan distance) to the center of the pixel being textured.
             *     * **"linear"** - **(default)** - Uses the weighted average of the four texture elements that are
             *     closest to the center of the pixel being textured.
             *
             * @property magFilter
             * @default "linear"
             * @type String
             */
            magFilter: {

                set: function (value) {

                    value = value || "linear";

                    if (value !== "linear" && value !== "nearest") {

                        this.error("Unsupported value for 'magFilter': '" + value +
                            "' - supported values are 'linear' and 'nearest'. Defaulting to 'linear'.");

                        value = "linear";
                    }

                    this._state.magFilter = value;
                    this._propsDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._state.magFilter;
                }
            },

            /**
             * Wrap parameter for this Texture's *S* coordinate.
             *
             * Options are:
             *
             *
             *     * **"clampToEdge"** -  causes *S* coordinates to be clamped to the size of the texture.
             *     * **"mirroredRepeat"** - causes the *S* coordinate to be set to the fractional part of the texture coordinate
             *     if the integer part of *S* is even; if the integer part of *S* is odd, then the *S* texture coordinate is
             *     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *S*.
             *     * **"repeat"** - **(default)** - causes the integer part of the *S* coordinate to be ignored; xeogl uses only the
             *     fractional part, thereby creating a repeating pattern.
             *
             * @property wrapS
             * @default "repeat"
             * @type String
             */
            wrapS: {

                set: function (value) {

                    value = value || "repeat";

                    if (value !== "clampToEdge" && value !== "mirroredRepeat" && value !== "repeat") {

                        this.error("Unsupported value for 'wrapS': '" + value +
                            "' - supported values are 'clampToEdge', 'mirroredRepeat' and 'repeat'. Defaulting to 'repeat'.");

                        value = "repeat";
                    }

                    this._state.wrapS = value;
                    this._propsDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._state.wrapS;
                }
            },

            /**
             * Wrap parameter for this Texture's *T* coordinate.
             *
             * Options are:
             *
             *
             *     * **"clampToEdge"** -  Causes *T* coordinates to be clamped to the size of the texture.
             *     * **"mirroredRepeat"** - Causes the *T* coordinate to be set to the fractional part of the texture coordinate
             *     if the integer part of *T* is even; if the integer part of *T* is odd, then the *T* texture coordinate is
             *     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *T*.
             *     * **"repeat"** - **(default)** - Causes the integer part of the *T* coordinate to be ignored; xeogl uses only the
             *     fractional part, thereby creating a repeating pattern.
             *
             * @property wrapT
             * @default "repeat"
             * @type String
             */
            wrapT: {

                set: function (value) {

                    value = value || "repeat";

                    if (value !== "clampToEdge" && value !== "mirroredRepeat" && value !== "repeat") {

                        this.error("Unsupported value for 'wrapT': '" + value +
                            "' - supported values are 'clampToEdge', 'mirroredRepeat' and 'repeat'. Defaulting to 'repeat'.");

                        value = "repeat";
                    }

                    this._state.wrapT = value;
                    this._propsDirty = true;

                    this._needUpdate();
                },

                get: function () {
                    return this._state.wrapT;
                }
            },

            /**
             * Flips this Texture's source data along its vertical axis when true.
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

                    this._needUpdate();
                },

                get: function () {
                    return this._state.flipY;
                }
            },

            /**
             The Texture's encoding format.

             Supported values are:

             * "linear" (default)
             * "sRGB"
             * "gamma"

             @property encoding
             @default "linear"
             @type String
             */
            encoding: {

                set: function (value) {

                    value = value || "linear";

                    if (value !== "linear" && value !== "sRGB" && value !== "gamma") {
                        this.error("Unsupported value for 'encoding': '" + value +  "' - supported values are 'linear', 'sRGB', 'gamma'. Defaulting to 'linear'.");

                        value = "linear";
                    }

                    this._state.encoding = value;

                    this.fire("dirty"); // Encoding/decoding is baked into shaders - need recompile of entities using this texture in their materials
                },

                get: function () {
                    return this._state.encoding;
                }
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
