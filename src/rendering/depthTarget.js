/**
 A **DepthTarget** is a  <a href="http://en.wikipedia.org/wiki/Render_Target" target="other">render target</a>  that
 captures the depths of the pixels rendered for the attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <ul>
 <li>DepthTargets are typically used when *rendering-to-texture*.</li>
 <li>A DepthTarget provides the pixel depths as a dynamic color-encoded image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>DepthTarget is not to be confused with {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}}, which configures ***how*** the pixel depths are written with respect to the WebGL depth buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a DepthTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use DepthTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/DepthTarget.png"></img>

 ## Example

 This example contains an {{#crossLink "Entity"}}{{/crossLink}} that renders its (RBGA-encoded) pixel depths to a DepthTarget, which is then
 piped into a {{#crossLink "Texture"}}{{/crossLink}} that's applied to a second {{#crossLink "Entity"}}{{/crossLink}}.</li>
 </ul>

 ````javascript
 var depthTarget = new XEO.DepthTarget();

 // First Entity renders to the DepthTarget

 var entity1 = new XEO.Entity({
    geometry: new XEO.BoxGeometry(),
    depthTarget: depthTarget
 });


 // Second Entity is textured with the
 // image of the first Entity

 var entity2 = new XEO.Entity({
     geometry: new XEO.BoxGeometry()
     material: new XEO.PhongMaterial({
         diffuseMap: new XEO.Texture({
            target: depthTarget
         })
     })
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
             * When active, the pixel depths of associated {{#crossLink "Entities"}}{{/crossLink}} will be rendered
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
