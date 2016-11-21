/**
 A **Reflect** specifies a reflect map.

 ## Overview

 * Reflects are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * To create a Reflect from an image file, set the Reflect's {{#crossLink "Reflect/src:property"}}{{/crossLink}}
 property to the image file path.
 * To create a Reflect from an HTML DOM Image object, set the Reflect's {{#crossLink "Reflect/image:property"}}{{/crossLink}}
 property to the entity.
 * To render color images of {{#crossLink "Entity"}}Entities{{/crossLink}} to a Reflect, set the Reflect's {{#crossLink "Reflect/target:property"}}{{/crossLink}}
 property to a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} that is attached to those {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * Similarly, to render depth images of {{#crossLink "Entity"}}Entities{{/crossLink}} to a Reflect, set the Reflect's {{#crossLink "Reflect/target:property"}}{{/crossLink}}
 property to a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} that is attached to those {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * For special effects, we often use rendered Reflects in combination with {{#crossLink "Shader"}}Shaders{{/crossLink}} and {{#crossLink "Stage"}}Stages{{/crossLink}}.

 <img src="../../../assets/images/Reflect.png"></img>

 ## Usage

 The example below has:

 * three Reflects,
 * a {{#crossLink "PhongMaterial"}}{{/crossLink}} which applies the {{#crossLink "Reflect"}}{{/crossLink}}s as diffuse, normal and specular maps,
 * a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}},
 * a {{#crossLink "Geometry"}}{{/crossLink}} that has the default box shape, and
 * an {{#crossLink "Entity"}}{{/crossLink}} attached to all of the above.


 ```` javascript
 var scene = new xeogl.Scene();

 var reflect1 = new xeogl.Reflect(scene, {
    src: "diffuseMap.jpg"
 });

 var reflect2 = new xeogl.Reflect(scene, {
    src: "normalMap.jpg"
 });

 var reflect3 = new xeogl.Reflect(scene, {
    src: "specularMap.jpg"
 });

 var material = new xeogl.PhongMaterial(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess: 30,
    diffuseMap: reflect1,
    normalMap: reflect2,
    specularMap: reflect3
 });

 var light1 = new xeogl.PointLight(scene, {
    pos: [0, 100, 100],
    color: [0.5, 0.7, 0.5]
 });

 var light2 = new xeogl.AmbientLight(scene, {
    color: [0.5, 0.7, 0.5]
 });

 var lights = new xeogl.Lights(scene, {
    lights: [
        light1,
        light2
    ]
 });

 // Geometry without parameters will default to a 2x2x2 box.
 var geometry = new xeogl.Geometry(scene);

 var entity = new xeogl.Entity(scene, {
    lights: lights,
    material: material,
    geometry: geometry
 });
 ````

 @module xeogl
 @submodule materials
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Reflect in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID for this Reflect, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Reflect.
 @param [cfg.src=null] {String} Path to image file to load into this Reflect. See the {{#crossLink "Reflect/src:property"}}{{/crossLink}} property for more info.
 @param [cfg.image=null] {HTMLImageElement} HTML Image object to load into this Reflect. See the {{#crossLink "Reflect/image:property"}}{{/crossLink}} property for more info.
 @param [cfg.target=null] {String | xeogl.ColorTarget | xeogl.DepthTarget} Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
 {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this Reflect from. See the {{#crossLink "Reflect/target:property"}}{{/crossLink}} property for more info.
 @param [cfg.minFilter="linearMipmapLinear"] {String} How the reflect is sampled when a texel covers less than one pixel. See the {{#crossLink "Reflect/minFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.magFilter="linear"] {String} How the reflect is sampled when a texel covers more than one pixel. See the {{#crossLink "Reflect/magFilter:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapS="repeat"] {String} Wrap parameter for reflect coordinate *S*. See the {{#crossLink "Reflect/wrapS:property"}}{{/crossLink}} property for more info.
 @param [cfg.wrapT="repeat"] {String} Wrap parameter for reflect coordinate *S*. See the {{#crossLink "Reflect/wrapT:property"}}{{/crossLink}} property for more info.
 @param [cfg.translate=[0,0]] {Array of Number} 2D translation vector that will be added to reflect's *S* and *T* coordinates.
 @param [cfg.scale=[1,1]] {Array of Number} 2D scaling vector that will be applied to reflect's *S* and *T* coordinates.
 @param [cfg.rotate=0] {Number} Rotation, in degrees, that will be applied to reflect's *S* and *T* coordinates.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Reflect = xeogl.Component.extend({

        type: "xeogl.Reflect",

        _init: function (cfg) {

            // Rendering state

            this._state = new xeogl.renderer.Reflect({
                texture: null
            });

            this._src = [];
            this._images = []; // HTMLImageElement

            // Dirty flags, processed in _buildReflect()

            this._srcDirty = false;
            this._imageDirty = false;

            // Handle WebGL context restore

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored", this._webglContextRestored, this);

            this.src = cfg.src;

            xeogl.stats.memory.textures++;
        },

        _webglContextRestored: function () {

            this._state.reflect = null;

            if (this._images) {
                this._imageDirty = true;

            } else if (this._src) {
                this._srcDirty = true;

            }

            this._scheduleUpdate();
        },

        _update: function () {

         //   var gl = this.scene.canvas.gl;

            var state = this._state;

            if (this._srcDirty) {

                if (this._src) {

                    this._loadSrc(this._src);

                    this._srcDirty = false;

                    // _imageDirty is set when the imagea have loaded

                    return;
                }
            }

            if (this._imageDirty) {

                if (this._images) {

                    state.reflect.setImage(this._image);

                    this._imageDirty = false;
                    this._propsDirty = true; // May now need to regenerate mipmaps etc
                }
            }

            this._renderer.imageDirty = true;
        },


        _loadSrc: function (src) {

            var self = this;

            var image = new Image();

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = xeogl.renderer.webgl.ensureImageSizePowerOfTwo(image);

                    self._imageDirty = true;
                    self._srcDirty = false;
                    self._targetDirty = false;

                    self._scheduleUpdate();

                    /**
                     * Fired whenever this Reflect's  {{#crossLink "Reflect/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    self.fire("image", self._image);

                    /**
                     * Fired whenever this Reflect has loaded the
                     * image file that its {{#crossLink "Reflect/src:property"}}{{/crossLink}} property currently points to.
                     * @event loaded
                     * @param value {HTML Image} The value of the {{#crossLink "Reflect/src:property"}}{{/crossLink}} property
                     */
                    self.fire("loaded", self._src);
                }

//                task.setCompleted();
            };

            image.onerror = function () {
                //              task.setFailed();
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
             * Indicates a path to an image file to source this Reflect from.
             *
             * Alternatively, you could indicate the source via either of properties
             * {{#crossLink "Reflect/image:property"}}{{/crossLink}} or {{#crossLink "Reflect/target:property"}}{{/crossLink}}.
             *
             * Fires a {{#crossLink "Reflect/src:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Reflect/image:property"}}{{/crossLink}} and
             * {{#crossLink "Reflect/target:property"}}{{/crossLink}} properties to null.
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
                     * Fired whenever this Reflect's {{#crossLink "Reflect/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type String
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _getJSON: function () {
            return {
                src: this._src.slice(0)
            };
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
