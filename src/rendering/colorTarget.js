/**
 A **ColorTarget** is a  <a href="http://en.wikipedia.org/wiki/Render_Target" target="other">render target</a>  that
 captures the colors of the pixels rendered for the attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 <ul>
 <li>ColorTargets are typically used when *rendering-to-texture*.</li>
 <li>A ColorTarget provides the pixel colors as a dynamic color image that may be consumed by {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>ColorTarget is not to be confused with {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}}, which configures ***how*** the pixel colors are written with respect to the WebGL color buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a ColorTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use ColorTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/ColorTarget.png"></img>

 ## Example

 In this example we essentially have one {{#crossLink "Entity"}}{{/crossLink}}
 that's rendered to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied to a second {{#crossLink "Entity"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a ColorTarget,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
 <li>an {{#crossLink "Entity"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} pixel color values to the ColorTarget,</li>
 <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the ColorTarget,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
 <li>a second {{#crossLink "Entity"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
 </ul>


 ````javascript
 var scene = new XEO.Scene();

 var colorTarget = new XEO.ColorTarget(scene);

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 // First Entity renders to the ColorTarget

 var entity1 = new XEO.Entity(scene, {
    geometry: geometry,
    colorTarget: colorTarget
});

 var texture = new XEO.Texture(scene, {
    target: colorTarget
});

 var material = new XEO.PhongMaterial(scene, {
    textures: [
        texture
    ]
});

 // Second Entity is textured with the
 // image of the first Entity

 var entity2 = new XEO.Entity(scene, {
    geometry: geometry,  // Reuse our simple box geometry
    material: material
});
 ````

 @class ColorTarget
 @module XEO
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorTarget.
 @param [cfg.active=true] {Boolean} Indicates if this ColorTarget is active or not.
 @param [cfg.size=null] {Array of Number} Optional fixed size for the ColorTarget's pixel buffer. When this is null, the buffer
 will dynamically resize to the canvas.
 @extends Component
 */
(function () {

    "use strict";

    XEO.ColorTarget = XEO.Component.extend({

        type: "XEO.ColorTarget",

        _init: function (cfg) {

            this._state = new XEO.renderer.RenderTarget({
                type: XEO.renderer.RenderTarget.COLOR,
                renderBuf: null
            });

            var canvas = this.scene.canvas;
            var self = this;

            this._webglContextRestored = canvas.on("webglContextRestored",
                function () {
                    if (self._state.renderBuf) {
                        self._state.renderBuf.webglRestored(canvas.gl);
                    }
                });

            this.size = cfg.size;
            this.active = cfg.active;
        },

        _props: {

            /**
             * The resolution of this ColorTarget's pixel buffer.
             *
             * Fires an {{#crossLink "ColorTarget/size:event"}}{{/crossLink}} event on change.
             *
             * @property size
             * @default null
             * @type {Array of Number}
             */
            size: {

                set: function (value) {

                    value = value || null;

                    this._size = value;

                    if (this._active) {
                        this._state.renderBuf.setSize(this._size);
                    }

                    /**
                     Fired whenever this ColorTarget's {{#crossLink "ColorTarget/size:property"}}{{/crossLink}} property changes.
                     @event size
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("size", this._size);
                },

                get: function () {
                    return this._size;
                }
            },

            /**
             * Determines whether this ColorTarget is active or not.
             *
             * When active, the pixel colors of associated {{#crossLink "Entities"}}{{/crossLink}} will be rendered
             * to this ColorTarget. When inactive, the colors will be written to the default WebGL color buffer instead.
             *
             * Fires a {{#crossLink "ColorTarget/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @default true
             * @type Number
             */
            active: {

                set: function (value) {

                    value = value !== false;

                    if (this._active === value) {
                        return;
                    }

                    var state = this._state;
                    this._active = value;

                    if (this._active) {

                        var canvas = this.scene.canvas;

                        state.renderBuf = new XEO.renderer.webgl.RenderBuffer({
                            canvas: canvas.canvas,
                            gl: canvas.gl,
                            size: this._size
                        });

                        this._renderer.imageDirty = true;

                    } else {

                        if (state.renderBuf) {
                            state.renderBuf.destroy();
                            state.renderBuf = null;
                        }
                    }

                    /**
                     Fired whenever this ColorTarget's {{#crossLink "ColorTarget/active:property"}}{{/crossLink}} property changes.

                     @event active
                     @param value {Boolean} The property's new value
                     */
                    this.fire("active", this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _compile: function () {
            this._renderer.colorTarget = this._state;
        },

        _getJSON: function () {

            var json = {
                active: this._active
            };

            if (this._size) {
                json.size = this._size
            }

            return json;
        },

        _destroy: function () {

            this.scene.canvas.off(this._webglContextRestored);

            this._state.renderBuf.destroy();

            this._state.destroy();
        }
    });

})();
