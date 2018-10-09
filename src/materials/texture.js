/**
 A **Texture** specifies a texture map.

 ## Overview

 * Textures are grouped within {{#crossLink "Material"}}Materials{{/crossLink}}, which are attached to
 {{#crossLink "Mesh"}}Meshes{{/crossLink}}.
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

 In this example we have a Mesh with

 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies diffuse and specular {{#crossLink "Texture"}}Textures{{/crossLink}}, and
 * a {{#crossLink "TorusGeometry"}}{{/crossLink}}.

 Note that xeogl will ignore the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} properties, since we assigned {{#crossLink "Texture"}}Textures{{/crossLink}} to the {{#crossLink "PhongMaterial"}}PhongMaterial's{{/crossLink}} {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}} and
 {{#crossLink "PhongMaterial/specularMap:property"}}{{/crossLink}} properties. The {{#crossLink "Texture"}}Textures'{{/crossLink}} pixel
 colors directly provide the diffuse and specular components for each fragment across the {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var mesh = new xeogl.Mesh({

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
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
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
import {core} from "./../core.js";
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {Texture2D} from '../renderer/texture2d.js';
import {math} from '../math/math.js';
import {stats} from './../stats.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Texture";

function ensureImageSizePowerOfTwo(image) {
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
        const canvas = document.createElement("canvas");
        canvas.width = nextHighestPowerOfTwo(image.width);
        canvas.height = nextHighestPowerOfTwo(image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
}

function isPowerOfTwo(x) {
    return (x & (x - 1)) === 0;
}

function nextHighestPowerOfTwo(x) {
    --x;
    for (let i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

class Texture extends Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

        super.init(cfg);

        this._state = new State({
            texture: new Texture2D(this.scene.canvas.gl),
            matrix: math.identityMat4(),   // Float32Array
            hasMatrix: (cfg.translate && (cfg.translate[0] !== 0 || cfg.translate[1] !== 0)) || (!!cfg.rotate) || (cfg.scale && (cfg.scale[0] !== 0 || cfg.scale[1] !== 0)),
            minFilter: this._checkMinFilter(cfg.minFilter),
            magFilter: this._checkMagFilter(cfg.magFilter),
            wrapS: this._checkWrapS(cfg.wrapS),
            wrapT: this._checkWrapT(cfg.wrapT),
            flipY: this._checkFlipY(cfg.flipY),
            encoding: this._checkEncoding(cfg.encoding)
        });

        // Data source

        this._src = null;
        this._image = null;

        // Transformation

        this._translate = math.vec2([0, 0]);
        this._scale = math.vec2([1, 1]);
        this._rotate = math.vec2([0, 0]);

        this._matrixDirty = false;

        // Transform

        this.translate = cfg.translate;
        this.scale = cfg.scale;
        this.rotate = cfg.rotate;

        // Data source

        if (cfg.src) {
            this.src = cfg.src; // Image file
        } else if (cfg.image) {
            this.image = cfg.image; // Image object
        }

        stats.memory.textures++;
    }

    _checkMinFilter(value) {
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
        return value;
    }

    _checkMagFilter(value) {
        value = value || "linear";
        if (value !== "linear" && value !== "nearest") {
            this.error("Unsupported value for 'magFilter': '" + value +
                "' - supported values are 'linear' and 'nearest'. Defaulting to 'linear'.");
            value = "linear";
        }
        return value;
    }

    _checkFilter(value) {
        value = value || "linear";
        if (value !== "linear" && value !== "nearest") {
            this.error("Unsupported value for 'magFilter': '" + value +
                "' - supported values are 'linear' and 'nearest'. Defaulting to 'linear'.");
            value = "linear";
        }
        return value;
    }

    _checkWrapS(value) {
        value = value || "repeat";
        if (value !== "clampToEdge" && value !== "mirroredRepeat" && value !== "repeat") {
            this.error("Unsupported value for 'wrapS': '" + value +
                "' - supported values are 'clampToEdge', 'mirroredRepeat' and 'repeat'. Defaulting to 'repeat'.");
            value = "repeat";
        }
        return value;
    }

    _checkWrapT(value) {
        value = value || "repeat";
        if (value !== "clampToEdge" && value !== "mirroredRepeat" && value !== "repeat") {
            this.error("Unsupported value for 'wrapT': '" + value +
                "' - supported values are 'clampToEdge', 'mirroredRepeat' and 'repeat'. Defaulting to 'repeat'.");
            value = "repeat";
        }
        return value;
    }

    _checkFlipY(value) {
        return !!value;
    }

    _checkEncoding(value) {
        value = value || "linear";
        if (value !== "linear" && value !== "sRGB" && value !== "gamma") {
            this.error("Unsupported value for 'encoding': '" + value + "' - supported values are 'linear', 'sRGB', 'gamma'. Defaulting to 'linear'.");
            value = "linear";
        }
        return value;
    }

    _webglContextRestored() {
        this._state.texture = new Texture2D(this.scene.canvas.gl);
        if (this._image) {
            this.image = this._image;
        } else if (this._src) {
            this.src = this._src;
        }
    }

    _update() {
        const state = this._state;
        if (this._matrixDirty) {
            let matrix;
            let t;
            if (this._translate[0] !== 0 || this._translate[1] !== 0) {
                matrix = math.translationMat4v([this._translate[0], this._translate[1], 0], this._state.matrix);
            }
            if (this._scale[0] !== 1 || this._scale[1] !== 1) {
                t = math.scalingMat4v([this._scale[0], this._scale[1], 1]);
                matrix = matrix ? math.mulMat4(matrix, t) : t;
            }
            if (this._rotate !== 0) {
                t = math.rotationMat4v(this._rotate * 0.0174532925, [0, 0, 1]);
                matrix = matrix ? math.mulMat4(matrix, t) : t;
            }
            if (matrix) {
                state.matrix = matrix;
            }
            this._matrixDirty = false;
        }
        this._renderer.imageDirty();
    }


    /**
     Indicates an HTML DOM Image object to source this Texture from.

     Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} property to null.

     @property image
     @default null
     @type {HTMLImageElement}
     */
    set image(value) {
        this._image = ensureImageSizePowerOfTwo(value);
        this._image.crossOrigin = "Anonymous";
        this._state.texture.setImage(this._image, this._state);
        this._state.texture.setProps(this._state); // Generate mipmaps
        this._src = null;
        this._renderer.imageDirty();
    }

    get image() {
        return this._image;
    }

    /**
     Indicates a path to an image file to source this Texture from.

     Sets the {{#crossLink "Texture/image:property"}}{{/crossLink}} property to null.

     @property src
     @default null
     @type String
     */
    set src(src) {
        this.scene.loading++;
        this.scene.canvas.spinner.processes++;
        const self = this;
        let image = new Image();
        image.onload = function () {
            image = ensureImageSizePowerOfTwo(image);
            //self._image = image; // For faster WebGL context restore - memory inefficient?
            self._state.texture.setImage(image, self._state);
            self._state.texture.setProps(self._state); // Generate mipmaps
            self.scene.loading--;
            self.scene.canvas.spinner.processes--;
            self._renderer.imageDirty();
        };
        image.src = src;
        this._src = src;
        this._image = null;
    }

    get src() {
        return this._src;
    }

    /**
     2D translation vector that will be added to this Texture's *S* and *T* coordinates.

     @property translate
     @default [0, 0]
     @type Array(Number)
     */
    set translate(value) {
        this._translate.set(value || [0, 0]);
        this._matrixDirty = true;
        this._needUpdate();
    }

    get translate() {
        return this._translate;
    }

    /**
     2D scaling vector that will be applied to this Texture's *S* and *T* coordinates.

     @property scale
     @default [1, 1]
     @type Array(Number)
     */
    set scale(value) {
        this._scale.set(value || [1, 1]);
        this._matrixDirty = true;
        this._needUpdate();
    }

    get scale() {
        return this._scale;
    }

    /**
     Rotation, in degrees, that will be applied to this Texture's *S* and *T* coordinates.

     @property rotate
     @default 0
     @type Number
     */
    set rotate(value) {
        value = value || 0;
        if (this._rotate === value) {
            return;
        }
        this._rotate = value;
        this._matrixDirty = true;
        this._needUpdate();
    }

    get rotate() {
        return this._rotate;
    }

    /**
     How this Texture is sampled when a texel covers less than one pixel.

     Options are:

     * **"nearest"** - Uses the value of the texture element that is nearest
     (in Manhattan distance) to the center of the pixel being textured.

     * **"linear"** - Uses the weighted average of the four texture elements that are
     closest to the center of the pixel being textured.

     * **"nearestMipmapNearest"** - Chooses the mipmap that most closely matches the
     size of the pixel being textured and uses the "nearest" criterion (the texture
     element nearest to the center of the pixel) to produce a texture value.

     * **"linearMipmapNearest"** - Chooses the mipmap that most closely matches the size of
     the pixel being textured and uses the "linear" criterion (a weighted average of the
     four texture elements that are closest to the center of the pixel) to produce a
     texture value.

     * **"nearestMipmapLinear"** - Chooses the two mipmaps that most closely
     match the size of the pixel being textured and uses the "nearest" criterion
     (the texture element nearest to the center of the pixel) to produce a texture
     value from each mipmap. The final texture value is a weighted average of those two
     values.

     * **"linearMipmapLinear"** - **(default)** - Chooses the two mipmaps that most closely match the size
     of the pixel being textured and uses the "linear" criterion (a weighted average
     of the four texture elements that are closest to the center of the pixel) to
     produce a texture value from each mipmap. The final texture value is a weighted
     average of those two values.

     @property minFilter
     @default "linearMipmapLinear"
     @type String
     @final
     */
    get minFilter() {
        return this._state.minFilter;
    }

    /**
     How this Texture is sampled when a texel covers more than one pixel.

     Options are:

     * **"nearest"** - Uses the value of the texture element that is nearest
     (in Manhattan distance) to the center of the pixel being textured.
     * **"linear"** - **(default)** - Uses the weighted average of the four texture elements that are
     closest to the center of the pixel being textured.

     @property magFilter
     @default "linear"
     @type String
     @final
     */
    get magFilter() {
        return this._state.magFilter;
    }

    /**
     Wrap parameter for this Texture's *S* coordinate.

     Options are:

     * **"clampToEdge"** -  causes *S* coordinates to be clamped to the size of the texture.
     * **"mirroredRepeat"** - causes the *S* coordinate to be set to the fractional part of the texture coordinate
     if the integer part of *S* is even; if the integer part of *S* is odd, then the *S* texture coordinate is
     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *S*.
     * **"repeat"** - **(default)** - causes the integer part of the *S* coordinate to be ignored; xeogl uses only the
     fractional part, thereby creating a repeating pattern.

     @property wrapS
     @default "repeat"
     @type String
     @final
     */
    get wrapS() {
        return this._state.wrapS;
    }

    /**
     Wrap parameter for this Texture's *T* coordinate.

     Options are:

     * **"clampToEdge"** -  Causes *T* coordinates to be clamped to the size of the texture.
     * **"mirroredRepeat"** - Causes the *T* coordinate to be set to the fractional part of the texture coordinate
     if the integer part of *T* is even; if the integer part of *T* is odd, then the *T* texture coordinate is
     set to *1 - frac ⁡ S* , where *frac ⁡ S* represents the fractional part of *T*.
     * **"repeat"** - **(default)** - Causes the integer part of the *T* coordinate to be ignored; xeogl uses only the
     fractional part, thereby creating a repeating pattern.

     @property wrapT
     @default "repeat"
     @type String
     @final
     */
    get wrapT() {
        return this._state.wrapT;
    }

    /**
     Flips this Texture's source data along its vertical axis when true.

     @property flipY
     @type Boolean
     @final
     */
    get flipY() {
        return this._state.flipY;
    }

    /**
     The Texture's encoding format.

     @property encoding
     @type String
     @final
     */
    get encoding() {
        return this._state.encoding;
    }

    destroy() {
        super.destroy();
        if (this._state.texture) {
            this._state.texture.destroy();
        }
        this._state.destroy();
        stats.memory.textures--;
    }
}

componentClasses[type] = Texture;

export{Texture};
