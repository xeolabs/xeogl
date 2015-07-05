/**
 A **Texture** specifies a texture map.

 ## Overview

 <ul>
 <li>Textures are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>To create a Texture from an image file, set the Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}}
 property to the image file path.</li>
 <li>To create a Texture from an HTML DOM Image object, set the Texture's {{#crossLink "Texture/image:property"}}{{/crossLink}}
 property to the object.</li>
 <li>To render color images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>Similarly, to render depth images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>For special effects, we often use rendered Textures in combination with {{#crossLink "Shader"}}Shaders{{/crossLink}} and {{#crossLink "Stage"}}Stages{{/crossLink}}.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Textures create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Texture.png"></img>

 ## Example

 The example below has:
 <ul>
 <li>three Textures,</li>
 <li>a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}}s as diffuse, bump and specular maps,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that has the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var texture1 = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
});

 var texture2 = new XEO.Texture(scene, {
    src: "bumpMap.jpg"
});

 var texture3 = new XEO.Texture(scene, {
    src: "specularMap.jpg"
});

 var material = new XEO.PhongMaterial(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess: 30,
    diffuseMap: texture1,
    bumpMap: texture2,
    specularMap: texture3
});

 var light1 = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    color: [0.5, 0.7, 0.5]
});

 var light2 = new XEO.AmbientLight(scene, {
    color: [0.5, 0.7, 0.5]
});

 var lights = new XEO.Lights(scene, {
    lights: [
        light1,
        light2
    ]
});

 // Geometry without parameters will default to a 2x2x2 box.
 var geometry = new XEO.Geometry(scene);

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````
 @class Texture
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Texture in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this Texture, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Texture.
 @param [cfg.src=null] {String} Path to image file to load into this Texture. See the {{#crossLink "Texture/src:property"}}{{/crossLink}} property for more info.
 @param [cfg.image=null] {HTMLImageElement} HTML Image object to load into this Texture. See the {{#crossLink "Texture/image:property"}}{{/crossLink}} property for more info.
 @param [cfg.target=null] {String | XEO.ColorTarget | XEO.DepthTarget} Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
 {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this Texture from. See the {{#crossLink "Texture/target:property"}}{{/crossLink}} property for more info.
 @param [cfg.minFilter="linearMipmapLinear"] {String} How the texture is sampled when a texel covers less than one pixel. See the {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.magFilter="linear"] {String} How the texture is sampled when a texel covers more than one pixel. See the {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapS="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapT="repeat"] {String} Wrap parameter for texture coordinate *S*. See the {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property for more info.
 @param [cfg.flipY=true] {Boolean} Flips the image's Y axis to match the WebGL texture coordinate space. See the {{#crossLink "Texture/flipY:property"}}{{/crossLink}} property for more info.
 @param [cfg.translate=[0,0]] {Array of Number} 2D translation vector that will be added to texture's *S* and *T* coordinates.
 @param [cfg.scale=[1,1]] {Array of Number} 2D scaling vector that will be applied to texture's *S* and *T* coordinates.
 @param [cfg.rotate=0] {Number} Rotation, in degrees, that will be applied to texture's *S* and *T* coordinates.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Texture = XEO.Component.extend({

        className: "XEO.Texture",

        type: "texture",

        _init: function (cfg) {

            // Rendering state

            this._state = new XEO.renderer.Texture({
                texture: null,
                matrix: null
            });
            
            // Data source

            this._src = null;
            this._image = null;
            this._target = null;

            // Transformation

            this._translate = [0, 0];
            this._scale = [1, 1];
            this._rotate = [0, 0];

            // Texture properties

            this._minFilter = null;
            this._magFilter = null;
            this._wrapS = null;
            this._wrapT = null;
            this._flipY = null;

            // Dirty flags

            this._dirty = true;
            this._matrixDirty = true;
            this._srcDirty = false;
            this._imageDirty = false;
            this._targetDirty = false;
            this._propsDirty = true;

            var self = this;
            
            // Handle WebGL context restore

            this._webglContextRestored = this.scene.canvas.on(
                "webglContextRestored",
                function () {

                    self._state.texture = null;

                    self._matrixDirty = true;
                    self._propsDirty = true;

                    if (self._image) {
                        self._imageDirty = true;

                    } else if (self._src) {
                        self._srcDirty = true;

                    } else if (self._target) {
                        self._targetDirty = true;
                    }

                    self._scheduleBuild();
                });

            // Transform

            this.translate = cfg.translate;
            this.scale = cfg.scale;
            this.rotate = cfg.rotate;

            // Data source

            if (cfg.src) {
                this.src = cfg.src; // Image file

            } else if (cfg.image) {
                this.image = cfg.image; // Image object

            } else if (cfg.target) {
                this.target = cfg.target; // Render target
            }

            // Properties

            this.minFilter = cfg.minFilter;
            this.magFilter = cfg.magFilter;
            this.wrapS = cfg.wrapS;
            this.wrapT = cfg.wrapT;
            this.flipY = cfg.flipY;

            this.scene.stats.inc("textures");
        },

        // Schedules a call to #_build for the next "tick"
        _scheduleBuild: function () {

            if (!this._dirty) {

                this._dirty = true;

                var self = this;

                this.scene.once("tick",
                    function () {
                        self._build();
                    });
            }
        },

        _build: function () {

            var gl = this.scene.canvas.gl;

            var state = this._state;

            if (!state.texture) {
                state.texture = new XEO.renderer.webgl.Texture2D(gl);
            }

            if (this._srcDirty) {
                if (this._src) {
                    this._loadSrc(this._src);
                    this._srcDirty = false;
                    return;
                }
            }

            if (this._imageDirty) {
                if (this._image) {
                    state.texture.setImage(this._image);
                    this._imageDirty = false;            
                }
            }

            if (this._targetDirty) {

                // TODO: destroy texture only if created for this state,
                // don't destroy texture belong to a previous target
                
                this._targetDirty = false;
            }

            if (this._matrixDirty) {

                var matrix;

                var t;

                if (this._translate[0] !== 0 || this._translate[2] !== 0) {
                    matrix = XEO.math.translationMat4v([this._translate[0], this._translate[0], 0]);
                }

                if (this._scale[0] !== 1 || this._scale[1] !== 1) {
                    t = XEO.math.scalingMat4v([this._scale[0], this._scale[1], 1]);
                    matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
                }

                if (this._rotate !== 0) {
                    t = XEO.math.rotationMat4v(this._rotate * 0.0174532925, [0, 0, 1]);
                    matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
                }

                if (matrix) {
                    state.matrix = matrix;
                }

                this._matrixDirty = false;
            }
            
            if (this._propsDirty) {
                state.texture.setProps(state);
                this._propsDirty = false;
            }

            this._renderer.imageDirty = true;

            this._dirty = false;
        },


        _loadSrc: function (src) {            

            var task = this.scene.tasks.create({
                description: "Loading texture"
            });

            var self = this;

            var image = new Image();

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = XEO.renderer.webgl.ensureImageSizePowerOfTwo(image);
                    self._target = null;

                    self._imageDirty = false;
                    self._srcDirty = false;
                    self._targetDirty = false;

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    self.fire("image", self._image);

                    self._scheduleBuild();
                }

                task.setCompleted();
            };

            image.onerror = function () {
                task.setFailed();
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

                    this._image = XEO.renderer.webgl.ensureImageSizePowerOfTwo(value);
                    this._src = null;
                    this._target = null;

                    this._imageDirty = true;
                    this._srcDirty = false;
                    this._targetDirty = false;

                    this._scheduleBuild();

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

                set  function (value) {

                    this._image = null;
                    this._src = value;
                    this._target = null;

                    this._imageDirty = false;
                    this._srcDirty = true;
                    this._targetDirty = false;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type String
                     */
                    this.fire("src", this._src);
                },

                get  function () {
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
             * @type String | XEO.ColorTarget | XEO.DepthTarget
             */
            target: {

                set  function (value) {

                    this._image = null;
                    this._src = null;
                    this._target = this._setChild("renderBuf", value); // Target is a render buffer;

                    this._imageDirty = false;
                    this._srcDirty = false;
                    this._targetDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/target:property"}}{{/crossLink}} property changes.
                     * @event target
                     * @param value The property's new value
                     * @type String | XEO.ColorTarget | XEO.DepthTarget
                     */
                    this.fire("target", this._target);
                },

                get  function () {
                    return this._target; // Created by this._setChild()
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

                set  function (value) {

                    value = value || [0, 0];

                    this._translate = value;
                    this._matrixDirty = true;

                    this._scheduleBuild();


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

                    value = value || [1, 1];

                    this._scale = value;
                    this._matrixDirty = true;

                    this._scheduleBuild();

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

                    this._rotate = value;
                    this._matrixDirty = true;

                    this._scheduleBuild();

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
             * <ul>
             *     <li>**"nearest"** - Uses the value of the texture element that is nearest
             *     (in Manhattan distance) to the center of the pixel being textured.</li>
             *
             *     <li>**"linear"** - Uses the weighted average of the four texture elements that are
             *     closest to the center of the pixel being textured.</li>
             *
             *     <li>**"nearestMipmapNearest"** - Chooses the mipmap that most closely matches the
             *     size of the pixel being textured and uses the "nearest" criterion (the texture
             *     element nearest to the center of the pixel) to produce a texture value.</li>
             *
             *     <li>**"linearMipmapNearest"** - Chooses the mipmap that most closely matches the size of
             *     the pixel being textured and uses the "linear" criterion (a weighted average of the
             *     four texture elements that are closest to the center of the pixel) to produce a
             *     texture value.</li>
             *
             *     <li>**"nearestMipmapLinear"** - Chooses the two mipmaps that most closely
             *     match the size of the pixel being textured and uses the "nearest" criterion
             *     (the texture element nearest to the center of the pixel) to produce a texture
             *     value from each mipmap. The final texture value is a weighted average of those two
             *     values.</li>
             *
             *     <li>**"linearMipmapLinear"** - **(default)** - Chooses the two mipmaps that most closely match the size
             *     of the pixel being textured and uses the "linear" criterion (a weighted average
             *     of the four texture elements that are closest to the center of the pixel) to
             *     produce a texture value from each mipmap. The final texture value is a weighted
             *     average of those two values.</li>
             * </ul>
             *
             * Fires a {{#crossLink "Texture/minFilter:event"}}{{/crossLink}} event on change.
             *
             * @property minFilter
             * @default "linearMipMapLinear"
             * @type String
             */
            minFilter: {

                set: function (value) {

                    value = value || "linearMipMapLinear";

                    this._minFilter = value;
                    this._propsDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property changes.
                     * @event minFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("minFilter", this._minFilter);
                },

                get: function () {
                    return this._minFilter;
                }
            },

            /**
             * How this Texture is sampled when a texel covers more than one pixel.
             *
             * Options are:
             *
             * <ul>
             *     <li>**"nearest"** - Uses the value of the texture element that is nearest
             *     (in Manhattan distance) to the center of the pixel being textured.</li>
             *     <li>**"linear"** - **(default)** - Uses the weighted average of the four texture elements that are
             *     closest to the center of the pixel being textured.</li>
             * </ul>
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

                    this._magFilter = value;
                    this._propsDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property changes.
                     * @event magFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("magFilter", this._magFilter);
                },

                get: function () {
                    return this._magFilter;
                }
            },

            /**
             * Wrap parameter for this Texture's *S* coordinate.
             *
             * Options are:
             *
             * <ul>
             *     <li>**"clampToEdge"** -  causes *S* coordinates to be clamped to the size of the texture.</li>
             *     <li>**"mirroredRepeat"** - causes the *S* coordinate to be set to the fractional part of the texture coordinate
             *     if the integer part of *S* is even; if the integer part of *S* is odd, then the *S* texture coordinate is
             *     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *S*.</li>
             *     <li>**"repeat"** - **(default)** - causes the integer part of the *S* coordinate to be ignored; XEOEngine uses only the
             *     fractional part, thereby creating a repeating pattern.</li>
             * </ul>
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

                    this._wrapS = value;
                    this._propsDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property changes.
                     * @event wrapS
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapS", this._wrapS);
                },

                get: function () {
                    return this._wrapS;
                }
            },

            /**
             * Wrap parameter for this Texture's *T* coordinate.
             *
             * Options are:
             *
             * <ul>
             *     <li>**"clampToEdge"** -  Causes *T* coordinates to be clamped to the size of the texture.</li>
             *     <li>**"mirroredRepeat"** - Causes the *T* coordinate to be set to the fractional part of the texture coordinate
             *     if the integer part of *T* is even; if the integer part of *T* is odd, then the *T* texture coordinate is
             *     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *T*.</li>
             *     <li>**"repeat"** - **(default)** - Causes the integer part of the *T* coordinate to be ignored; XEOEngine uses only the
             *     fractional part, thereby creating a repeating pattern.</li>
             * </ul>
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

                    this._wrapT = value;
                    this._propsDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property changes.
                     * @event wrapT
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapT", this._wrapT);
                },

                get: function () {
                    return this._wrapT;
                }
            },


            /**
             * Flips this Texture's Y axis to match the WebGL texture coordinate space.
             *
             * Fires a {{#crossLink "Texture/flipY:event"}}{{/crossLink}} event on change.
             *
             * @property flipY
             * @default true
             * @type Boolean
             */
            flipY: {

                set: function (value) {

                    value = value !== false;

                    this._flipY = value;
                    this._propsDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/flipY:property"}}{{/crossLink}} property changes.
                     * @event flipY
                     * @param value {Boolean} The property's new value
                     */
                    this.fire("flipY", this._flipY);
                },

                get: function () {
                    return this._flipY;
                }
            }
        },

        _getJSON: function () {            

            var json = {
                minFilter: this._minFilter,
                magFilter: this._magFilter,
                wrapS: this._wrapS,
                wrapT: this._wrapT,
                flipY: this._flipY,

                translate: this._translate,
                scale: this._scale,
                rotate: this._rotate
            };

            if (this._src) {
                json.src = this._src;

            } else if (this._target) {
                json.target = this._target.id;

            } else if (this._image) {
                // json.src = image.src;
            }

            return json;
        },

        _destroy: function () {

            this.scene.canvas.off(this._webglContextRestored);

            if (this._state.texture) {
                this._state.texture.destroy();
            }

            this.scene.stats.dec("textures");
        }
    });

})();