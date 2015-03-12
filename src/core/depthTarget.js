(function () {

    "use strict";

    /**
     A **DepthTarget** captures the rendered pixel depths of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

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

     In this example we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
     that renders its fragment depth values to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied
     to a second {{#crossLink "GameObject"}}{{/crossLink}}.


     The scene contains:

     <ul>
     <li>a DepthTarget,</li>
     <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
     <li>a {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} fragment depth values to the DepthTarget,</li>
     <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the DepthTarget,</li>
     <li>a {{#crossLink "Material"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
     <li>a second {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
     </ul>

     The pixel colours in the DepthTarget will be depths encoded into RGBA, so will look a little weird when applied directly to the second
     {{#crossLink "GameObject"}}{{/crossLink}} as a {{#crossLink "Texture"}}{{/crossLink}}. In practice the {{#crossLink "Texture"}}{{/crossLink}}
     would carry the depth values into a custom {{#crossLink "Shader"}}{{/crossLink}}, which would then be applied to the second {{#crossLink "GameObject"}}{{/crossLink}}.

     ````javascript
     var scene = new XEO.Scene();


     var geometry = new XEO.Geometry(scene); // Default to a 2x2x2 box.


     var depthTarget = new XEO.DepthTarget(scene);


     var object1 = new XEO.GameObject(scene, {
        depthTarget: depthTarget
     });

     var texture = new XEO.Texture(scene, {
        target: depthTarget
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

        _init: function () {

            this._state.bufType = "depth";
            this._componentCoreMap[this._state.coreId] = this._state;
            this._state.renderBuf = new XEO.webgl.RenderBuffer({ canvas: this.scene.canvas });
        },

        _compile: function () {
            this._renderer.depthTarget = this._state;
        },

        _destroy: function () {
            if (this._state) {
                if (this._state.renderBuf) {
                    this._state.renderBuf.destroy();
                }
                delete this._componentCoreMap[this._state.coreId];
            }
        }
    });

})();

