"use strict";

/**
 A **ColorTarget** captures rendered pixel colors of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

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

 In the example below we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
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

 var firstGameObject = new XEO.GameObject(scene, {
       geometry: geometry,
       colorTarget: colorTarget
  });

 var texture = new XEO.Texture(scene, {
      target: colorTarget
  });

 var material = new XEO.Material(scene, {
       textures: [
           texture
       ]
  });

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


