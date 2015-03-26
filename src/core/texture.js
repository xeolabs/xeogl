/**
 A **Texture** specifies a texture map.

 ## Overview

 <ul>
 <li>Textures are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>To create a Texture from an image file, setting the Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}}
 property to the image file path.</li>
 <li>To render color images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>Similarly, to render depth images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>For special effects, we often use rendered Textures in combination with {{#crossLink "Shader"}}Shaders{{/crossLink}} and {{#crossLink "Stage"}}Stages{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7092447/L.png"></img>

 ## Example

 This example creates
 <ul>
 <li>three {{#crossLink "Texture"}}{{/crossLink}}s,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}}s as diffuse, bump and specular maps,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

```` javascript
var scene = new XEO.Scene();

var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
});

var bumpMap = new XEO.Texture(scene, {
    src: "bumpMap.jpg"
});

var specularMap = new XEO.Texture(scene, {
    src: "specularMap.jpg"
});

var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess: 30,
    diffuseMap: diffuseMap,
    bumpMap: bumpMap,
    specularMap: specularMap
});

var light1 = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0]
});

var light2 = new XEO.AmbientLight(scene, {
    ambient: [0.5, 0.7, 0.5]
});

var lights = new XEO.Lights(scene, {
    lights: [
        light1,
        light2
    ]
});

var geometry = new XEO.Geometry(scene); // Geometry without parameters will default to a 2x2x2 box.

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
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Texture.
 @param [cfg.minFilter]
 @param [cfg.magFilter]
 @param [cfg.wrapS]
 @param [cfg.wrapT]
 @param [cfg.isDepth]
 @param [cfg.depthMode]
 @param [cfg.depthCompareMode]
 @param [cfg.flipY]
 @param [cfg.width]
 @param [cfg.height]
 @param [cfg.internalFormat]
 @param [cfg.sourceFormat]
 @param [cfg.sourceType]
 @param [cfg.translate]
 @param [cfg.scale]
 @param [cfg.rotate]
 @extends Component
 */
(function () {

    "use strict";

    XEO.Texture = XEO.Component.extend({

        className: "XEO.Texture",

        type: "texture",

        _init: function (cfg) {

            this._srcDirty = false;
            this._textureDirty = false;

            // Texture creation params

            this.minFilter = cfg.minFilter;
            this.magFilter = cfg.magFilter;
            this.wrapS = cfg.wrapS;
            this.wrapT = cfg.wrapT;
            this.isDepth = cfg.isDepth;
            this.depthMode = cfg.depthMode;
            this.depthCompareMode = cfg.depthCompareMode;
            this.depthCompareFunc = cfg.depthCompareFunc;
            this.flipY = cfg.flipY;
            this.width = cfg.width;
            this.height = cfg.height;
            this.internalFormat = cfg.internalFormat;
            this.sourceFormat = cfg.sourceFormat;
            this.sourceType = cfg.sourceType;

            // Texture application params

            this.translate = cfg.translate;
            this.scale = cfg.scale;
            this.rotate = cfg.rotate;

            // Texture source

            if (cfg.src) {
                this.src = cfg.src;

            } else if (cfg.target) {
                this.target = cfg.target;
            }

            // Create state state

            var state = this._state;

            state.waitForLoad = cfg.waitForLoad !== false;
            state.texture = null;
            state.matrix = null;

            state._matrixDirty = true;
            state._textureDirty = true;

            state.buildMatrix = function () {
                self._buildMatrix(state);
            };

            // Build transform matrix

            state.buildMatrix.call(state);

            // Initialise texture

            if (cfg.src) { // Load from URL
                this._state.src = cfg.src;
                this._loadTexture(cfg.src);

            } else if (cfg.image) { // Create from image
                this._state.image = cfg.image;
                this._initTexture(cfg.image);

            } else if (cfg.target) { // Render to this target
                this.scene.getComponent(cfg.target,
                    function (target) {
                        self.setTarget(target);
                    });
            }

            // Handle WebGL context restore

            this._webglContextRestored = this.scene.canvas.on(
                "webglContextRestored",
                function () {
                    if (self._state.src) {
                        self._loadTexture(self._state.src);

                    } else if (self._state.image) {
                        self._initTexture(self._state.image);

                    } else if (self._state.target) {
//                    self.getScene().getComponent(cfg.target,
//                        function (target) {
//                            self.setTarget(self._state.target);
//                        });
                    }
                });

            this.scene.stats.inc("textures");
        },

        _psops: {

            /**
             * Path to an image file to source this texture from.
             *
             * Sets the {{#crossLink "Texture/target:property"}}{{/crossLink}} and
             * {{#crossLink "Texture/image:property"}}{{/crossLink}} properties to null.
             *
             * Fires a {{#crossLink "Texture/src:event"}}{{/crossLink}} event on change.
             *
             * @property src
             * @default null
             * @type String
             */
            src: {

                set  function (value) {
                    this._state.image = null;
                    this._state.src = value;
                    this._state.target = null;
                    var self = this;
                    this.scene.once("tick", function () {
                        self._loadTexture(self._state.src);
                    });
                    this._srcDirty = true;

                    /**
                     * Fired whenever this Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type String
                     */
                    this.fire("src", value);
                },

                get  function () {
                    return this._state.src;
                }
            },

            /**
             * Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
             * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this texture from.
             *
             * Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} and
             * {{#crossLink "Texture/image:property"}}{{/crossLink}} properties to null.
             *
             * Fires a {{#crossLink "Texture/target:event"}}{{/crossLink}} event on change.
             *
             * @property target
             * @default null
             * @type String | XEO.ColorTarget | XEO.DepthTarget
             */
            target: {

                set  function (value) {
                    this._setChild("renderBuf", value); // Target is a render buffer
                    this._state.image = null;
                    this._state.src = null;
                    this._state.target = null;
                    this._targetDirty = true;
                    this._setDirty();

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/target:property"}}{{/crossLink}} property changes.
                     * @event target
                     * @param value The property's new value
                     * @type String | XEO.ColorTarget | XEO.DepthTarget
                     */
                    this.fire("target", value);
                },

                get  function () {
                    return this._children.renderBuf;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/translate:event"}}{{/crossLink}} event on change.
             *
             * @property translate
             * @default [0, 0, 0]
             * @type Array(Number)
             */
            translate: {

                set  function (value) {
                    value = value || [0, 0, 0];
                    this._state.translate = value;
                    this._state._matrixDirty = true;

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/translate:property"}}{{/crossLink}} property changes.
                     * @event translate
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("translate", value);
                },

                get: function () {
                    return this._state.translate;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/scale:event"}}{{/crossLink}} event on change.
             *
             * @property scale
             * @default [0, 0, 0]
             * @type Array(Number)
             */
            scale: {

                set: function (value) {
                    value = value || [1, 1, 1];
                    this._state.scale = value;
                    this._state._matrixDirty = true;
                    //...

                    /**
                     * Fired whenever this Texture's   {{#crossLink "Texture/scale:property"}}{{/crossLink}} property changes.
                     * @event scale
                     * @param value {Array(Number)} The property's new value
                     */
                    this.fire("scale", value);
                },

                get: function () {
                    return this._state.scale;
                }
            },

            /**
             * TODO
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
                    this._state.rotate = value;
                    this._state._matrixDirty = true;
                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/rotate:property"}}{{/crossLink}} property changes.
                     * @event rotate
                     * @param value {Number} The property's new value
                     */
                    this.fire("rotate", value);
                },

                get: function () {
                    return this._state.rotate;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/minFilter:event"}}{{/crossLink}} event on change.
             *
             * @property minFilter
             * @default "linearMipMapNearest"
             * @type String
             */
            minFilter: {

                set: function (value) {
                    value = value || "linearMipMapNearest";
                    this._state.minFilter = value;

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property changes.
                     * @event minFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("minFilter", value);
                },

                get: function () {
                    return this._state.minFilter;
                }
            },

            /**
             * TODO
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
                    this._state.magFilter = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property changes.
                     * @event magFilter
                     * @param value {String} The property's new value
                     */
                    this.fire("magFilter", value);
                },

                get: function () {
                    return this._state.magFilter;
                }
            },

            /**
             * TODO
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
                    this._state.wrapS = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property changes.
                     * @event wrapS
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapS", value);
                },

                get: function () {
                    return this._state.wrapS;
                }
            },

            /**
             * TODO
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
                    this._state.wrapT = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property changes.
                     * @event wrapT
                     * @param value {String} The property's new value
                     */
                    this.fire("wrapT", value);
                },

                get: function () {
                    return this._state.wrapT;
                }
            },

            /**
             * TODO
             *
             * Fires an {{#crossLink "Texture/isDepth:event"}}{{/crossLink}} event on change.
             *
             * @property isDepth
             * @default false
             * @type Boolean
             */
            isDepth: {

                set: function (value) {
                    value = value === true;
                    this._state.isDepth = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/isDepth:property"}}{{/crossLink}} property changes.
                     * @event isDepth
                     * @param value {Boolean} The property's new value
                     */
                    this.fire("isDepth", value);
                },

                get: function () {
                    return this._state.isDepth;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/depthMode:event"}}{{/crossLink}} event on change.
             *
             * @property depthMode
             * @default "luminance"
             * @type String
             */
            depthMode: {

                set: function (value) {
                    value = value || "luminance";
                    this._state.depthMode = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/depthMode:property"}}{{/crossLink}} property changes.
                     * @event depthMode
                     * @param value {String} The property's new value
                     */
                    this.fire("depthMode", value);
                },

                get: function () {
                    return this._state.depthMode;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/depthMode:event"}}{{/crossLink}} event on change.
             *
             * @property depthCompareMode
             * @default "compareRToTexture"
             * @type String
             */
            depthCompareMode: {

                set: function (value) {
                    value = value || "compareRToTexture";
                    this._state.depthCompareMode = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/depthCompareMode:property"}}{{/crossLink}} property changes.
                     * @event depthCompareMode
                     * @param value {String} The property's new value
                     */
                    this.fire("depthCompareMode", value);
                },

                get: function () {
                    return this._state.depthCompareMode;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/depthCompareFunc:event"}}{{/crossLink}} event on change.
             *
             * @property depthCompareFunc
             * @default "lequal"
             * @type String
             */
            depthCompareFunc: {

                set: function (value) {
                    value = value || "lequal";
                    this._state.depthCompareFunc = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/depthCompareFunc:property"}}{{/crossLink}} property changes.
                     * @event depthCompareFunc
                     * @param value {String} The property's new value
                     */
                    this.fire("depthCompareFunc", value);
                },

                get: function () {
                    return this._state.depthCompareFunc;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/flipY:event"}}{{/crossLink}} event on change.
             *
             * @property flipY
             * @default false
             * @type Boolean
             */
            flipY: {

                set: function (value) {
                    value = value !== false;
                    this._state.flipY = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/flipY:property"}}{{/crossLink}} property changes.
                     * @event flipY
                     * @param value {Boolean} The property's new value
                     */
                    this.fire("flipY", value);
                },

                get: function () {
                    return this._state.flipY;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/width:event"}}{{/crossLink}} event on change.
             *
             * @property width
             * @default false
             * @type Number
             */
            width: {

                set: function (value) {
                    value = value !== undefined ? value : 1.0;
                    this._state.width = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/width:property"}}{{/crossLink}} property changes.
                     * @event width
                     * @param value {Number} The property's new value
                     */
                    this.fire("width", value);
                },

                get: function () {
                    return this._state.width;
                }
            },

            /**
             * TODO
             *
             * Fires a {{#crossLink "Texture/height:event"}}{{/crossLink}} event on change.
             *
             * @property height
             * @default false
             * @type Number
             */
            height: {

                set: function (value) {
                    value = value !== undefined ? value : 1.0;
                    this._state.height = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/height:property"}}{{/crossLink}} property changes.
                     * @event height
                     * @param value {Number} The property's new value
                     */
                    this.fire("height", value);
                },

                get: function () {
                    return this._state.height;
                }
            },

            /**
             * TODO
             *
             * Fires an {{#crossLink "Texture/internalFormat:event"}}{{/crossLink}} event on change.
             *
             * @property internalFormat
             * @default "alpha"
             * @type String
             */
            internalFormat: {

                set: function (value) {
                    value = value || "alpha";
                    this._state.internalFormat = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/internalFormat:property"}}{{/crossLink}} property changes.
                     * @event internalFormat
                     * @param value {String} The property's new value
                     */
                    this.fire("internalFormat", value);
                },

                get: function () {
                    return this._state.internalFormat;
                }
            },

            /**
             * TODO
             *
             * Fires an {{#crossLink "Texture/sourceFormat:event"}}{{/crossLink}} event on change.
             *
             * @property sourceFormat
             * @default "alpha"
             * @type String
             */
            sourceFormat: {

                set: function (value) {
                    value = value || "alpha";
                    this._state.sourceFormat = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/sourceFormat:property"}}{{/crossLink}} property changes.
                     * @event sourceFormat
                     * @param value {String} The property's new value
                     */
                    this.fire("sourceFormat", value);
                },

                get: function () {
                    return this._state.sourceFormat;
                }
            },

            /**
             * TODO
             *
             * Fires an {{#crossLink "Texture/sourceType:event"}}{{/crossLink}} event on change.
             *
             * @property sourceType
             * @default "unsignedByte"
             * @type String
             */
            sourceType: {

                set: function (value) {
                    value = value || "unsignedByte";
                    this._state.sourceType = value;

                    //...

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/sourceType:property"}}{{/crossLink}} property changes.
                     * @event sourceType
                     * @param value {String} The property's new value
                     */
                    this.fire("sourceType", value);
                },

                get: function () {
                    return this._state.sourceType;
                }
            },

            /**
             * TODO
             *
             * Fires an {{#crossLink "Texture/image:event"}}{{/crossLink}} event on change.
             *
             * @property image
             * @default null
             * @type {HTML Image}
             */
            image: {

                set: function (value) {

                    /**
                     * Fired whenever this Texture's  {{#crossLink "Texture/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    this.fire("image", value);
                },

                get: function () {

                }
            }
        },

        /**
         * Rebuilds the texture transform matrix
         * @private
         */
        _buildMatrix: function () {
            var matrix;
            var t;
            if (this.translate.x !== 0 || this.translate.y !== 0) {
                matrix = XEO.math.translationMat4v([ this.translate.x || 0, this.translate.y || 0, 0]);
            }
            if (this.scale.x !== 1 || this.scale.y !== 1) {
                t = XEO.math.scalingMat4v([ this.scale.x || 1, this.scale.y || 1, 1]);
                matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
            }
            if (this.rotate !== 0) {
                t = XEO.math.rotationMat4v(this.rotate * 0.0174532925, [0, 0, 1]);
                matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
            }
            if (matrix) {
                this.matrix = matrix;
                if (!this.matrixAsArray) {
                    this.matrixAsArray = new Float32Array(this.matrix);
                } else {
                    this.matrixAsArray.set(this.matrix);
                }
            }
            this._matrixDirty = false;
        },

        /**
         * Initialises texture using image loaded from given URL
         * @param src
         * @private
         */
        _loadTexture: function (src) {
            var self = this;
            var task = this.scene.tasks.create({
                description: "Loading texture"
            });
            var image = new Image();
            image.onload = function () {
                self._initTexture(image);
                task.setCompleted();
            };
            image.onerror = function () {
                task.setFailed();
            };
            if (src.indexOf("data") === 0) {  // Image data
                image.src = src;
            } else { // Image file
                image.crossOrigin = "Anonymous";
                image.src = src;
            }
        },

        _initTexture: function (image) {
            var exists = !!this._state.texture;
            var gl = this.scene.canvas.gl;
            var texture = exists ? this._state.texture.texture : gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._ensureImageSizePowerOfTwo(image));
            if (!exists) {
                this._state.texture = new XEO.webgl.Texture2D(gl, {
                    texture: texture, // WebGL texture object
                    minFilter: this._getGLOption("minFilter", gl.LINEAR_MIPMAP_NEAREST),
                    magFilter: this._getGLOption("magFilter", gl.LINEAR),
                    wrapS: this._getGLOption("wrapS", gl.REPEAT),
                    wrapT: this._getGLOption("wrapT", gl.REPEAT),
                    isDepth: this._getOption(this._state.isDepth, false),
                    depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
                    depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
                    depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
                    flipY: this._getOption(this._state.flipY, true),
                    width: this._getOption(this._state.width, 1),
                    height: this._getOption(this._state.height, 1),
                    internalFormat: this._getGLOption("internalFormat", gl.LEQUAL),
                    sourceFormat: this._getGLOption("sourceType", gl.ALPHA),
                    sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
                    update: null
                });
                if (this.destroyed) { // component was destroyed while loading
                    this._state.texture.destroy();
                }
            }
            this._renderer.imageDirty = true;
        },

        _ensureImageSizePowerOfTwo: function (image) {
            if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {
                var canvas = document.createElement("canvas");
                canvas.width = this._nextHighestPowerOfTwo(image.width);
                canvas.height = this._nextHighestPowerOfTwo(image.height);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image,
                    0, 0, image.width, image.height,
                    0, 0, canvas.width, canvas.height);
                image = canvas;
                image.crossOrigin = "";
            }
            return image;
        },

        _isPowerOfTwo: function (x) {
            return (x & (x - 1)) === 0;
        },

        _nextHighestPowerOfTwo: function (x) {
            --x;
            for (var i = 1; i < 32; i <<= 1) {
                x = x | x >> i;
            }
            return x + 1;
        },

        _getGLOption: function (name, defaultVal) {
            var gl = this.scene.canvas.gl;
            var value = this._state[name];
            if (value === undefined) {
                return defaultVal;
            }
            var glName = XEO.webgl.enums[value];
            if (glName === undefined) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_COMPONENT_CONFIG,
                        "Unrecognised value for texture component property '" + name + "' value: '" + value + "'");
            }
            return gl[glName];
        },

        _getOption: function (value, defaultVal) {
            return (value === undefined) ? defaultVal : value;
        },

        _getJSON: function () {
            var json = {
                translate: this.translate,
                scale: this.scale,
                rotate: this.rotate,
                minFilter: this.minFilter,
                magFilter: this.magFilter,
                wrapS: this.wrapS,
                wrapT: this.wrapT,
                isDepth: this.isDepth,
                depthMode: this.depthMode,
                depthCompareMode: this.depthCompareMode,
                depthCompareFunc: this.depthCompareFunc,
                flipY: this.flipY,
                width: this.width,
                height: this.height,
                internalFormat: this.internalFormat,
                sourceFormat: this.sourceFormat,
                sourceType: this.sourceType
            };
            if (this.src) {
                json.src = this.src;
            } else if (this.target) {
                json.target = this.target.id;
            }
            //...
            return json;
        },

        _destroy: function () {
            this.scene.off(this._tick);
            this.scene.canvas.off(this._webglContextRestored);
            this.scene.stats.dec("textures");
        }
    });

})();