/**
 A **ColorTarget** is a  <a href="http://en.wikipedia.org/wiki/Render_Target" target="other">render target</a>  that
 captures the colors pixels rendered for associated {{#crossLink "Entity"}}Entities{{/crossLink}}.

 * ColorTargets are typically used when *rendering-to-texture*.
 * A ColorTarget provides the pixel colors as a dynamic color image that may be consumed by {{#crossLink "Texture"}}Textures{{/crossLink}}.
 * ColorTarget is not to be confused with {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}}, which configures ***how*** the pixel colors are written with respect to the WebGL color buffer.
 * Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a ColorTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.
 * For special effects, we often use ColorTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.

 <img src="../../../assets/images/ColorTarget.png"></img>

 ## Usage

 This example contains an {{#crossLink "Entity"}}{{/crossLink}} that renders its pixel colors to a ColorTarget, which is then
 piped into a {{#crossLink "Texture"}}{{/crossLink}} that's applied to a second {{#crossLink "Entity"}}{{/crossLink}}.

 ````javascript
 var colorTarget = new xeogl.ColorTarget();

 // First Entity renders to the ColorTarget

 var entity1 = new xeogl.Entity({
    geometry: new xeogl.BoxGeometry(),
    colorTarget: colorTarget
 });


 // Second Entity is textured with the
 // image of the first Entity

 var entity2 = new xeogl.Entity({
     geometry: new xeogl.BoxGeometry()
     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            target: colorTarget
         })
     })
});
 ````


 @module xeogl
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

    xeogl.ColorTarget = xeogl.Component.extend({

        type: "xeogl.ColorTarget",

        _init: function (cfg) {

            this._state = new xeogl.renderer.RenderTarget({
                type: xeogl.renderer.RenderTarget.COLOR,
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

                        state.renderBuf = new xeogl.renderer.webgl.RenderBuffer({
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

            if (this._state.renderBuf) {
                this._state.renderBuf.destroy();
            }

            this._state.destroy();
        }
    });

})();
