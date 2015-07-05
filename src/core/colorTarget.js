/**
 A **ColorTarget** captures the colors of the pixels that xeoEngine renders for the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
 These provide a virtual, software-based <a href="http://en.wikipedia.org/wiki/Render_Target" target="other">render target</a> that is typically used when performing *render-to-texture*.

 ## Overview

 <ul>
 <li>A ColorTarget provides the pixel colors as a dynamic color image that may be consumed by {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>ColorTarget is not to be confused with {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}}, which configures ***how*** the pixel colors are written with respect to the WebGL color buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a ColorTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use ColorTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/ColorTarget.png"></img>

 ## Example

 In this example we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
 that's rendered to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied to a second {{#crossLink "GameObject"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a ColorTarget,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} pixel color values to the ColorTarget,</li>
 <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the ColorTarget,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
 <li>a second {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
 </ul>


 ````javascript
 var scene = new XEO.Scene();

 var colorTarget = new XEO.ColorTarget(scene);

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 // First Object renders to the ColorTarget

 var object1 = new XEO.GameObject(scene, {
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

 // Second Object is textured with the
 // image of the first Object

 var object2 = new XEO.GameObject(scene, {
    geometry: geometry,  // Reuse our simple box geometry
    material: material
});
 ````

 @class ColorTarget
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorTarget.
 @extends Component
 */
(function () {

    "use strict";

    XEO.ColorTarget = XEO.Component.extend({

        className: "XEO.ColorTarget",

        type: "renderBuf",

        _init: function () {

            this._state = new XEO.renderer.RenderTarget({
                type: XEO.renderer.RenderTarget.COLOR,
                renderBuf: new XEO.renderer.webgl.RenderBuffer({
                    canvas: this.scene.canvas
                })
            });

            var self = this;

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored",
                function () {
                    self._state.renderBuf.webglRestored();
                });
        },

        _compile: function () {
            this._renderer.colorTarget = this._state;
        },

        _destroy: function () {

            this.scene.canvas.off(this._webglContextRestored);

            this._state.renderBuf.destroy();

            this._state.destroy();
        }
    });

})();

