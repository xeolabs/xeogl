"use strict";

/**
 *
 Captures rendered pixel depths of associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
    <li>A DepthTarget provides the pixel depths as a dynamic color-encoded image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
    <li>DepthTarget is not to be confused with {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}}, which configures ***how*** the pixel depths are written with respect to the WebGL depth buffer.</li>
    <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a DepthTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use DepthTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "ColorTarget"}}ColorTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895849/L.png"></img>

 ### Example

 Shown below is a minimal and not particularly practical example of how to use DepthTargets. We're creating only the
 essential components here, while falling back on the <a href="XEO.Scene.html#defaults"  class="crosslink">Scene's default components</a>
 for everything else. In practice, you would be using the {{#crossLink "Material"}}Material{{/crossLink}} with
 a {{#crossLink "Shader"}}Shader{{/crossLink}} in order to perform some sort of post-effect.


 ````javascript

 var scene = new XEO.Scene();

 // Geometry without parameters will default to a 2x2x2 box. Note that we could have
 // instead just used the Scene's default Geometry, but we'll create our own for this example.
 var geometry = new XEO.Geometry(scene);

 // Our DepthTarget
 var depthTarget = new XEO.DepthTarget(scene);

 // GameObject whose pixel depths are rendered to the ColorTarget.
 // The depth values are actually encoded into the pixel colors of the ColorTarget.
 var object1 = new XEO.GameObject(scene, {
       depthTarget: depthTarget
   });

 // Texture that sources its pixels from the ColorTarget. Remember that the pixel colours
 // will be encoded depths, so will look a little weird. As mentioned earlier, in practice
 // this texture would not be rendered directly, where it would instead be used to carry
 // the depth values into a Shader.
 var texture = new XEO.Texture(scene, {
      target: depthTarget
  });

 // Create a material that applies the texture
 var material = new XEO.Material(scene, {
       textures: [
           texture
       ]
  });

 // Material that contains the texture
 var myShader = new XEO.Shaderl(scene, {
       vertex: "",
       fragment: ""
  });

 // Second GameObject uses the Material, and is therefore textured with the color-encoded
 // pixel depths rendered from the first GameObject
 var object2 = new XEO.GameObject(scene, {
        geometry: geometry,  // Reuse our simple box geometry
       material: material,
       shader: myShader
   });

 ````
 @class DepthTarget
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this DepthTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DepthTarget.

 @extends Component
 */
XEO.DepthTarget = XEO.Component.extend({

    className: "XEO.DepthTarget",

    type: "renderBuf",

    // Map of  components to cores, for reallocation on WebGL context restore
    _componentCoreMap: {},

    _init: function (cfg) {

        this._core.bufType = "depth";
        this._componentCoreMap[this._core.coreId] = this._core;
        this._core.renderBuf = new XEO.webgl.RenderBuffer({ canvas: this.scene.canvas });
    },

    _compile: function (ctx) {
        this._renderer.depthTarget = this._core;
    },

    _destroy: function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete this._componentCoreMap[this._core.coreId];
        }
    }
});


