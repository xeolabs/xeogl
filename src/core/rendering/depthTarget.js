/**
 A **DepthTarget** captures the Z-depths of the pixels that xeoEngine renders for the attached
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. These provide a virtual, software-based
 <a href="http://en.wikipedia.org/wiki/Render_Target" target="other">render target</a> that is typically used when
 performing *render-to-texture* as part of some post-processing effect that requires the pixel depth values.

 ## Overview

 <ul>
 <li>A DepthTarget provides the pixel depths as a dynamic color-encoded image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>DepthTarget is not to be confused with {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}}, which configures ***how*** the pixel depths are written with respect to the WebGL depth buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a DepthTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use DepthTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/DepthTarget.png"></img>

 ## Example

 In the example below, we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
 that renders its pixel Z-depth values to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied
 to a second {{#crossLink "GameObject"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a DepthTarget,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} fragment depth values to the DepthTarget,</li>
 <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the DepthTarget,</li>
 <li>a {{#crossLink "PhongMaterial"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
 <li>a second {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
 </ul>

 The pixel colours in the DepthTarget will be depths encoded into RGBA, so will look a little weird when applied directly to the second
 {{#crossLink "GameObject"}}{{/crossLink}} as a {{#crossLink "Texture"}}{{/crossLink}}. In practice the {{#crossLink "Texture"}}{{/crossLink}}
 would carry the depth values into a custom {{#crossLink "Shader"}}{{/crossLink}}, which would then be applied to the second {{#crossLink "GameObject"}}{{/crossLink}}.

 ````javascript
 var scene = new XEO.Scene();

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box.

 var depthTarget = new XEO.DepthTarget(scene);

 // First Object renders its pixel depth values to our DepthTarget
 var object1 = new XEO.GameObject(scene, {
    depthTarget: depthTarget
});

 // Texture consumes our DepthTarget
 var texture = new XEO.Texture(scene, {
    target: depthTarget
});

 // Material contains our Texture
 var material = new XEO.PhongMaterial(scene, {
    textures: [
        texture
    ]
});

 // Second Object is effectively textured with the color-encoded
 // pixel depths of the first Object
 var object2 = new XEO.GameObject(scene, {
    geometry: geometry,  // Reuse our simple box geometry
    material: material
});
 ````
 @class DepthTarget
 @module XEO
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this DepthTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DepthTarget.
 @param [cfg.active=true] {Boolean} Indicates if this DepthTarget is active or not.

 @extends Component
 */
(function () {

    "use strict";

    XEO.DepthTarget = XEO.Component.extend({

        type: "XEO.DepthTarget",

        _init: function (cfg) {

            this._state = new XEO.renderer.RenderTarget({
                type: XEO.renderer.RenderTarget.DEPTH,
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

            this.active = cfg.active;
        },

        _props: {

            /**
             * Indicates whether this DepthTarget is active or not.
             *
             * When active, the pixel depths of associated {{#crossLink "GameObjects"}}{{/crossLink}} will be rendered
             * to this DepthTarget. When inactive, the colors will be written to the default WebGL depth buffer instead.
             *
             * Fires a {{#crossLink "DepthTarget/active:event"}}{{/crossLink}} event on change.
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

                    this._active = value;
                    var state = this._state;

                    if (this._active) {

                        var canvas = this.scene.canvas;

                        state.renderBuf = new XEO.renderer.webgl.RenderBuffer({
                            canvas: canvas.canvas,
                            gl: canvas.gl
                        });

                        this._renderer.imageDirty = true;


                    } else {
                        if (state.renderBuf) {
                            state.renderBuf.destroy();
                            state.renderBuf = null;
                        }
                    }

                    /**
                     Fired whenever this DepthTarget's {{#crossLink "DepthTarget/active:property"}}{{/crossLink}} property changes.

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
            this._renderer.depthTarget = this._state;
        },

        _getJSON: function () {
            return {
                active: this._active
            };
        },

        _destroy: function () {

            this.scene.canvas.off(this._webglContextRestored);

            this._state.renderBuf.destroy();

            this._state.destroy();
        }
    });

})();
