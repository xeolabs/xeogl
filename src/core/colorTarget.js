"use strict";

/**
 Captures rendered pixel colors of associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>A ColorTarget provides the pixel colors as a dynamic color image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>ColorTarget is not to be confused with {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}}, which configures ***how*** the pixel colors are written with respect to the WebGL color buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a ColorTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use ColorTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096829/L.png"></img>

 ### Example

 Shown below is a minimal example of how to use ColorTargets, in which we create an
 {{#crossLink "GameObject"}}GameObject{{/crossLink}} that renders a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to a
 ColorTarget, then a second {{#crossLink "GameObject"}}GameObject{{/crossLink}} that has a {{#crossLink "Material"}}Material{{/crossLink}}
 with a {{#crossLink "Texture"}}Texture{{/crossLink}} that sources its pixels from the ColorTarget. The end effect is a box
 that is textured with view of another box.

 As with all our examples, we're creating only the essential components while falling back on
 the <a href="XEO.Scene.html#defaults" class="crosslink">Scene's default components</a> for everything else.

 ````javascript
 var scene = new XEO.Scene();

 // Geometry without parameters will default to a 2x2x2 box. Note that we could have
 // instead just used the Scene's default Geometry, but we'll create our own for this example.
 var geometry = new XEO.Geometry(scene);

 // Our ColorTarget
 var colorTarget = new XEO.ColorTarget(scene);

 // GameObject that is rendered to the ColorTarget
 var firstGameObject = new XEO.GameObject(scene, {
       geometry: geometry,
       colorTarget: colorTarget
  });

 // Texture that sources its pixels from the ColorTarget
 var texture = new XEO.Texture(scene, {
      target: colorTarget
  });

 // Material that contains the texture
 var material = new XEO.Material(scene, {
       textures: [
           texture
       ]
  });

 // Second GameObject uses the Material, and is therefore textured with the image of the first GameObject
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
XEO.ColorTarget = XEO.Component.extend({

    className: "XEO.ColorTarget",

    type: "renderBuf",

    // Map of  components to cores, for reallocation on WebGL context restore
    _componentCoreMap: {},

    _init: function (cfg) {
        this._core.bufType = "color";
        this._componentCoreMap[this._core.id] = this._core;
        this._core.renderBuf = new XEO.webgl.RenderBuffer({ canvas: this.scene.canvas });
    },

    _compile: function () {
        this._renderer.colorTarget = this._core;
    },

    _destroy: function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete this._componentCoreMap[this._core.id];
        }
    }
});


