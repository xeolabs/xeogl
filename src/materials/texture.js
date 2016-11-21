/**
 A **Texture** specifies a texture map.

 <a href="../../examples/#materials_texture_diffuse"><img src="../../assets/images/screenshots/TorusGeometry.png"></img></a>

 ## Overview

 * Textures are grouped within {{#crossLink "PhongMaterial"}}PhongMaterials{{/crossLink}}s, which are attached to
 {{#crossLink "Entity"}}Entities{{/crossLink}}.
 To create a Texture from an image file, set the Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}}
 property to the image file path.
 To create a Texture from an HTMLImageElement, set the Texture's {{#crossLink "Texture/image:property"}}{{/crossLink}}
 property to the HTMLImageElement.
 To render color images of {{#crossLink "Entity"}}Entities{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} that is attached to those {{#crossLink "Entity"}}Entities{{/crossLink}}.
 Similarly, to render depth images of {{#crossLink "Entity"}}Entities{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} that is attached to those {{#crossLink "Entity"}}Entities{{/crossLink}}.
 For special effects, we often use rendered Textures in combination with {{#crossLink "Shader"}}Shaders{{/crossLink}} and {{#crossLink "Stage"}}Stages{{/crossLink}}.

 <img src="../../../assets/images/Texture.png"></img>

 ## Examples

 * [Diffuse Texture](../../examples/#materials_texture_diffuse)
 * [Specular Texture](../../examples/#materials_texture_specular)
 * [Opacity Texture](../../examples/#materials_texture_opacity)
 * [Emissive Texture](../../examples/#materials_texture_emissive)
 * [Normal map](../../examples/#materials_texture_normalMap)
 * [Diffuse Video Texture](../../examples/#materials_texture_video)
 * [Texture Animation](../../examples/#materials_texture_animation)

 ## Usage

 In this example we have an Entity with

 * a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},
 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies diffuse and specular {{#crossLink "Texture"}}Textures{{/crossLink}}, and
 * a {{#crossLink "TorusGeometry"}}{{/crossLink}}.

 Note that xeogl will ignore the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} properties, since we assigned {{#crossLink "Texture"}}Textures{{/crossLink}} to the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} and
 {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}} properties. The {{#crossLink "Texture"}}Textures'{{/crossLink}} pixel
 colors directly provide the diffuse and specular components for each fragment across the {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var entity = new xeogl.Entity({

    lights: new xeogl.Lights({
        lights: [
            new xeogl.AmbientLight({
                color: [0.7, 0.7, 0.7]
            }),
            new xeogl.DirLight({
                dir: [-1, -1, -1],
                color: [0.5, 0.7, 0.5],
                intensity: [1.0, 1.0, 1.0],
                space: "view"
            })
        ]
    }),

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
        opacity: 1.0 // Default
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
 @param [cfg.target=null] {String | xeogl.ColorTarget | xeogl.DepthTarget} Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
 {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this Texture from. See the {{#crossLink "Texture/target:property"}}{{/crossLink}} property for more info.
 @param [cfg.minFilter="linearMipmapLinear"] {String} How the texture is sampled when a texel covers less than one pixel. See the {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.magFilter="linear"] {String} How the texture is sampled when a texel covers more than one pixel. See the {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapS="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapT="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property for more info.
 @param [cfg.flipY=false] {Boolean} Flips this Texture's source data along its vertical axis when true.
 @param [cfg.translate=[0,0]] {Array of Number} 2D translation vector that will be added to texture's *S* and *T* coordinates.
 @param [cfg.scale=[1,1]] {Array of Number} 2D scaling vector that will be applied to texture's *S* and *T* coordinates.
 @param [cfg.rotate=0] {Number} Rotation, in degrees, that will be applied to texture's *S* and *T* coordinates.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Texture = xeogl.Component.extend({

        type: "xeogl.Texture",

        _init: function (cfg) {

            // Rendering state

            this._state = new xeogl.renderer.Texture({

                texture: null,  // xeogl.renderer.webgl.Texture2D
                matrix: null,   // Float32Array

                // Texture properties

                minFilter: null,
                magFilter: null,
                wrapS: null,
                wrapT: null,
                flipY: null,

                pageTableTexture: null
            });

            // Data source

            this._src = null;   // URL string
            this._image = null; // HTMLImageElement
            this._target = null;// xeogl.RenderTarget

            this._pageTable = null; // Float32Array

            // Transformation

            this._translate = xeogl.math.vec2([0, 0]);
            this._scale = xeogl.math.vec2([1, 1]);
            this._rotate = xeogl.math.vec2([0, 0]);

            // Dirty flags, processed in _buildTexture()

            this._matrixDirty = false;
            this._srcDirty = false;
            this._imageDirty = false;
            this._targetDirty = false;
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

            // Data source

            if (cfg.src) {
                this.src = cfg.src; // Image file

            } else if (cfg.image) {
                this.image = cfg.image; // Image object

            } else if (cfg.target) {
                this.target = cfg.target; // Render target
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

            } else if (this._target) {
                this._targetDirty = true;
            }

            this._scheduleUpdate();
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

                    if (this._onTargetActive) {
                        this._target.off(this._onTargetActive);
                        this._onTargetActive = null;
                    }

                    if (state.texture && state.texture.renderBuffer) {

                        // Detach from "virtual texture" provided by render target
                        state.texture = null;
                    }

                    if (!state.texture) {
                        state.texture = new xeogl.renderer.webgl.Texture2D(gl);
                    }

                    state.texture.setImage(this._image, state);

                    this._imageDirty = false;
                    this._propsDirty = true; // May now need to regenerate mipmaps etc
                }
            }

            if (this._targetDirty) {

                if (state.texture && !state.texture.renderBuffer) {
                    state.texture.destroy();
                    state.texture = null;
                }

                if (this._onTargetActive) {
                    this._target.off(this._onTargetActive);
                    this._onTargetActive = null;
                }

                if (this._target) {
                    this._onTargetActive = this._target.on("active",  // Called immediately when first bound
                        function (active) {
                            state.texture = active ? this._state.renderBuf.getTexture() : null;
                        });
                }

                this._targetDirty = false;
                this._propsDirty = true;
            }

            if (this._matrixDirty) {

                var matrix;

                var t;

                if (this._translate[0] !== 0 || this._translate[2] !== 0) {
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
                    // to recompile xeogl shaders to use the matrix

                    this.fire("dirty");
                }
            }

            if (this._propsDirty) {

                if (state.texture && state.texture.setProps) {

                    // TODO: Ability to set props on texture from _target's RenderBuffer?

                    state.texture.setProps(state);
                }

                this._propsDirty = false;
            }

            if (this._pageTableDirty) {

                if (this._image) {

                    if (this._onTargetActive) {
                        this._target.off(this._onTargetActive);
                        this._onTargetActive = null;
                    }

                    if (state.texture && state.texture.renderBuffer) {

                        // Detach from "virtual texture" provided by render target
                        state.texture = null;
                    }

                    if (!state.texture) {
                        state.texture = new xeogl.renderer.webgl.Texture2D(gl);
                    }

                    state.texture.setImage(this._image, state);

                    this._imageDirty = false;
                    this._propsDirty = true; // May now need to regenerate mipmaps etc
                }
            }

            this._renderer.imageDirty = true;
        },


        _loadSrc: function (src) {

            var self = this;

            var image = new Image();

            var spinner = this.scene.canvas.spinner;
            var spinnerTextures = spinner.textures;

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = xeogl.renderer.webgl.ensureImageSizePowerOfTwo(image);

                    self._imageDirty = true;
                    self._srcDirty = false;
                    self._targetDirty = false;

                    if (spinnerTextures) {
                        spinner.processes--;
                    }

                    self._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    self.fire("image", self._image);

                    /**
                     * Fired whenever this Texture has loaded the
                     * image file that its {{#crossLink "Texture/src:property"}}{{/crossLink}} property currently points to.
                     * @event loaded
                     * @param value {HTML Image} The value of the {{#crossLink "Texture/src:property"}}{{/crossLink}} property
                     */
                    self.fire("loaded", self._src);
                }

//                task.setCompleted();
            };

            image.onerror = function () {
                //              task.setFailed();
                if (spinnerTextures) {
                    spinner.processes--;
                }
            };

            if (src.indexOf("data") === 0) {

                // Image data
                image.src = src;

            } else {

                // Image file
                image.crossOrigin = "Anonymous";
                image.src = src;

                if (spinnerTextures) {
                    spinner.processes++;
                }
            }
        },

        _props: {

            /**
             * Indicates an HTML DOM Image object to source this Texture from.
             *
             * Alternatively, you could indicate the source via either of properties
             * {{#crossLink "Texture/src:property"}}{{/crossLink}} or {{#crossLink "Texture/target:property"}}{{/crossLink}}.
             *
             * Fires an {{#crossLink "Texture/image:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} and
             * {{#crossLink "Texture/target:property"}}{{/crossLink}} properties to null.
             *
             * @property image
             * @default null
             * @type {HTMLImageElement}
             */
            image: {

                set: function (value) {

                    this._image = xeogl.renderer.webgl.ensureImageSizePowerOfTwo(value);
                    this._src = null;

                    this._imageDirty = true;
                    this._srcDirty = false;
                    this._targetDirty = false;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    this.fire("image", this._image);
                },

                get: function () {
                    return this._state.image;
                }
            },

            /**
             * Indicates a path to an image file to source this Texture from.
             *
             * Alternatively, you could indicate the source via either of properties
             * {{#crossLink "Texture/image:property"}}{{/crossLink}} or {{#crossLink "Texture/target:property"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "Texture/src:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Texture/image:property"}}{{/crossLink}} and
             * {{#crossLink "Texture/target:property"}}{{/crossLink}} properties to null.
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
                    this._targetDirty = false;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type String
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            },

            /**
             * Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
             * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this Texture from.
             *
             * Alternatively, you could indicate the source via either of properties
             * {{#crossLink "Texture/src:property"}}{{/crossLink}} or {{#crossLink "Texture/image:property"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "Texture/target:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} and
             * {{#crossLink "Texture/image:property"}}{{/crossLink}} properties to null.
             *
             * @property target
             * @default null
             * @type String | xeogl.ColorTarget | xeogl.DepthTarget
             */
            target: {

                set: function (value) {

                    this._image = null;
                    this._src = null;

                    this._target = this._attach({
                        name: "renderBuf",
                        type: null,
                        component: value,
                        sceneDefault: true,
                        on: {
                            active: {
                                callback: this._onTargetActive,
                                scope: this
                            }
                        }
                    });

                    this._imageDirty = false;
                    this._srcDirty = false;
                    this._targetDirty = true;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/target:property"}}{{/crossLink}} property changes.
                     * @event target
                     * @param value The property's new value
                     * @type String | xeogl.ColorTarget | xeogl.DepthTarget
                     */
                    this.fire("target", this._target);
                },

                get: function () {
                    return this._attached.target;
                }
            },

            /**
             * Page table for sparse virtual texturing.
             *
             * Fires an {{#crossLink "Texture/pageTable:event"}}{{/crossLink}} event on change.
             *
             * @property pageTable
             * @default null
             * @type {Float32Array}
             */
            pageTable: {

                set: function (value) {

                    this._pageTable = value;

                    this._imageDirty = true;

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/pageTable:property"}}{{/crossLink}} property changes.
                     * @event pageTable
                     * @param value {Float32Array} The property's new value
                     */
                    this.fire("pageTable", this._pageTable);
                },

                get: function () {
                    return this._state._pageTable;
                }
            },

            /**
             * 2D translation vector that will be added to this Texture's *S* and *T* coordinates.
             *
             * Fires a {{#crossLink "Texture/translate:event"}}{{/crossLink}} event on change.
             *
             * @property translate
             * @default [0, 0]
             * @type Array(Number)
             */
            translate: {

                set: function (value) {

                    this._translate.set(value || [0, 0]);
                    this._matrixDirty = true;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/translate:property"}}{{/crossLink}} property changes.
                     * @event translate
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("translate", this._translate);
                },

                get: function () {
                    return this._translate;
                }
            },

            /**
             * 2D scaling vector that will be applied to this Texture's *S* and *T* coordinates.
             *
             * Fires a {{#crossLink "Texture/scale:event"}}{{/crossLink}} event on change.
             *
             * @property scale
             * @default [1, 1]
             * @type Array(Number)
             */
            scale: {

                set: function (value) {

                    this._scale.set(value || [1, 1]);
                    this._matrixDirty = true;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/scale:property"}}{{/crossLink}} property changes.
                     * @event scale
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("scale", this._scale);
                },

                get: function () {
                    return this._scale;
                }
            },

            /**
             * Rotation, in degrees, that will be applied to this Texture's *S* and *T* coordinates.
             *
             * Fires a {{#crossLink "Texture/rotate:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/rotate:property"}}{{/crossLink}} property changes.
                     * @event rotate
                     * @param value {Number} The property's new value
                     */
                    this.fire("rotate", this._rotate);
                },

                get: function () {
                    return this._rotate;
                }
            },

            /**
             * How this Texture is sampled when a texel covers less than one pixel.
             *
             * Options are:
             *
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
             *
             * Fires a {{#crossLink "Texture/minFilter:event"}}{{/crossLink}} event on change.
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
                        value !== "linearMipmapLinear") {

                        this.error("Unsupported value for 'minFilter': '" + value +
                            "' - supported values are 'linear', 'linearMipmapNearest', 'nearestMipmapLinear' " +
                            "and 'linearMipmapLinear'. Defaulting to 'linearMipmapLinear'.");

                        value = "linearMipmapLinear";
                    }

                    this._state.minFilter = value;
                    this._propsDirty = true;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property changes.
                     * @event minFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("minFilter", this._state.minFilter);
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
             *
             * Fires a {{#crossLink "Texture/magFilter:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property changes.
                     * @event magFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("magFilter", this._state.magFilter);
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
             *
             * Fires a {{#crossLink "Texture/wrapS:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property changes.
                     * @event wrapS
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapS", this._state.wrapS);
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
             *
             * Fires a {{#crossLink "Texture/wrapT:event"}}{{/crossLink}} event on change.
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

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property changes.
                     * @event wrapT
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapT", this._state.wrapT);
                },

                get: function () {
                    return this._state.wrapT;
                }
            },

            /**
             * Flips this Texture's source data along its vertical axis when true.
             *
             * Fires a {{#crossLink "Texture/flipY:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Texture's  {{#crossLink "Texture/flipY:property"}}{{/crossLink}} property changes.
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

            var json = {};

            if (this._translate && (this._translate[0] !== 0 || this._translate[1] !== 0)) {
                json.translate = this._translate;
            }

            if (this._scale && (this._scale[0] !== 1 || this._scale[1] !== 1)) {
                json.scale = this._scale;
            }

            if (this._rotate !== 0) {
                json.rotate = this._rotate;
            }

            if (this._state.minFilter !== "linearMipmapLinear") {
                json.minFilter = this._state.minFilter;
            }

            if (this._state.magFilter !== "linear") {
                json.magFilter = this._state.magFilter;
            }

            if (this._state.wrapS !== "repeat") {
                json.wrapS = this._state.wrapS;
            }

            if (this._state.wrapT !== "repeat") {
                json.wrapT = this._state.wrapT;
            }

            if (this._state.flipY !== false) {
                json.flipY = this._state.flipY;
            }

            if (this._src) {
                json.src = this._src;

            } else if (this._target) {
                json.target = this._target.id;

            } else if (this._image) {
                // TODO: Image data
                // json.src = image.src;
            }

            if (false && this._state.pageTable !== false) {
                json.pageTable = this._state.pageTable;
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
