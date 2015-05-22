/**
 A **Canvas** manages a {{#crossLink "Scene"}}Scene{{/crossLink}}'s HTML canvas and its WebGL context.

 ## Overview

 <ul>

 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Canvas as a read-only property on itself.</li>

 <li>When a {{#crossLink "Scene"}}Scene{{/crossLink}} is configured with the ID of
 an existing <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a>, then
 the Canvas will bind to that, otherwise the Canvas will automatically create its own.</li>

 <li>A Canvas will fire a {{#crossLink "Canvas/resized:event"}}{{/crossLink}} event whenever
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a> resizes.</li>

 <li>A Canvas is responsible for obtaining a WebGL context from
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a>.</li>

 <li>A Canvas also fires a {{#crossLink "Canvas/webglContextLost:event"}}{{/crossLink}} event when the WebGL context is
 lost, and a {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} when it is restored again.</li>

 <li>The various components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}} will transparently recover on
 the {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} event.</li>

 </ul>

 <img src="../../../assets/images/Canvas.png"></img>

 ## Example

 In the example below, we're creating a {{#crossLink "Scene"}}Scene{{/crossLink}} without specifying an HTML canvas element
 for it. This causes the {{#crossLink "Scene"}}Scene{{/crossLink}}'s Canvas component to create its own default element
 within the page. Then we subscribe to various events fired by that Canvas component.

 ```` javascript
 var scene = new XEO.Scene();

 // Get the Canvas off the Scene
 // Since we did not configure the Scene with the ID of a DOM canvas element,
 // the Canvas will create its own canvas element in the DOM
 var canvas = scene.canvas;

 // Get the WebGL context off the Canvas
 var gl = canvas.gl;

 // Subscribe to Canvas resize events
 canvas.on("resize", function(e) {
        var width = e.width;
        var height = e.height;
        var aspect = e.aspect;
        //...
     });

 // Subscribe to WebGL context loss events on the Canvas
 canvas.on("webglContextLost", function() {
        //...
     });

 // Subscribe to WebGL context restored events on the Canvas
 canvas.on("webglContextRestored", function(gl) {
        var newContext = gl;
        //...
     });
 ````

 When we want to bind the Canvas to an existing HTML canvas element, configure the
 {{#crossLink "Scene"}}{{/crossLink}} with the ID of the element, like this:

 ```` javascript
 // Create a Scene, this time configuting it with the
 // ID of an existing DOM canvas element
 var scene = new XEO.Scene({
          canvasId: "myCanvas"
     });

 // ..and the rest of this example can be the same as the previous example.

 ````
 @class Canvas
 @module XEO
 @static
 @param {Scene} scene Parent scene
 @extends Component
 */
(function () {

    "use strict";

    XEO.Canvas = XEO.Component.extend({

        className: "XEO.Canvas",

        type: "canvas",

        // Names of recognised WebGL contexts
        _WEBGL_CONTEXT_NAMES: [
            "webgl",
            "experimental-webgl",
            "webkit-3d",
            "moz-webgl",
            "moz-glweb20"
        ],

        _init: function (cfg) {

            /**
             * The HTML canvas. When the {{#crossLink "Viewer"}}{{/crossLink}} was configured with the ID of an existing canvas within the DOM,
             * then this property will be that element, otherwise it will be a full-page canvas that this Canvas has
             * created by default.
             *
             * @property canvas
             * @type {HTMLCanvasElement}
             * @final
             */
            this.canvas = null;

            /**
             * The WebGL rendering context, obtained by this Canvas from the HTML 5 canvas.
             *
             * @property gl
             * @type {WebGLRenderingContext}
             * @final
             */
            this.gl = null;

            /**
             * Attributes for the WebGL context
             *
             * @type {{}|*}
             */
            this.contextAttr = cfg.contextAttr || {};

            if (!cfg.canvas) {

                // Canvas not supplied, create one automatically

                this._createCanvas();

            } else {

                // Canvas supplied

                if (XEO._isString(cfg.canvas)) {

                    // Canvas ID supplied - find the canvas

                    this.canvas = document.getElementById(cfg.canvas);

                    if (!this.canvas) {

                        // Canvas not found - create one automatically

                        this.error("Canvas element not found: '" + cfg.canvas + "' - creating one automatically.");
                        this._createCanvas();
                    }

                } else {

                    this.error("Config 'canvasId' should be a string.");
                }
            }

            if (!this.canvas) {
                return;
            }

            // If the canvas uses css styles to specify the sizes make sure the basic
            // width and height attributes match or the WebGL context will use 300 x 150

            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            // Get WebGL context

            this._initWebGL();

            // Bind context loss and recovery handlers

            var self = this;

            this.canvas.addEventListener("webglcontextlost",
                function () {

                    /**
                     * Fired wheneber the WebGL context has been lost
                     * @event webglContextLost
                     */
                    self.fire("webglContextLost");
                },
                false);

            this.canvas.addEventListener("webglcontextrestored",
                function () {
                    self._initWebGL();
                    if (self.gl) {

                        /**
                         * Fired whenever the WebGL context has been restored again after having previously being lost
                         * @event webglContextRestored
                         * @param value The WebGL context object
                         */
                        self.fire("webglContextRestored", self.gl);
                    }
                },
                false);

            // Publish canvas size changes on each scene tick

            var lastWidth = this.canvas.width;
            var lastHeight = this.canvas.height;

            this._tick = this.scene.on("tick",
                function () {

                    var canvas = self.canvas;

                    if (canvas.width !== lastWidth || canvas.height !== lastHeight) {

                        lastWidth = canvas.width;
                        lastHeight = canvas.height;

                        /**
                         * Fired whenever the canvas has resized
                         * @event resized
                         * @param width {Number} The new canvas width
                         * @param height {Number} The new canvas height
                         * @param aspect {Number} The new canvas aspect ratio
                         */
                        self.fire("resized", {
                            width: canvas.width,
                            height: canvas.height,
                            aspect: canvas.height / canvas.width
                        });
                    }
                });
        },

        /**
         * Attempts to pick a {{#crossLink "GameObject"}}GameObject{{/crossLink}} at the given Canvas-space coordinates within the
         * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * Ignores {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that are attached
         * to either a {{#crossLink "Stage"}}Stage{{/crossLink}} with {{#crossLink "Stage/pickable:property"}}pickable{{/crossLink}}
         * set *false* or a {{#crossLink "Modes"}}Modes{{/crossLink}} with {{#crossLink "Modes/picking:property"}}picking{{/crossLink}} set *false*.
         *
         * On success, will fire a {{#crossLink "Canvas/picked:event"}}{{/crossLink}} event on this Canvas, along with
         * a separate {{#crossLink "Object/picked:event"}}{{/crossLink}} event on the target {{#crossLink "GameObject"}}GameObject{{/crossLink}}.
         *
         * @method pick
         * @param {Number} canvasX X-axis Canvas coordinate.
         * @param {Number} canvasY Y-axis Canvas coordinate.
         * @param {*} [options] Pick options.
         * @param {Boolean} [options.rayPick=false] Whether to perform a 3D ray-intersect pick.
         */
        pick: function (canvasX, canvasY, options) {

            /**
             * Fired whenever the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method succeeds in picking
             * a {{#crossLink "GameObject"}}GameObject{{/crossLink}} in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
             * @event picked
             * @param {String} objectId The ID of the picked {{#crossLink "GameObject"}}GameObject{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
             * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
             * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
             */

        },

        /**
         * Creates a canvas
         * @private
         */
        _createCanvas: function () {
            var canvasId = "canvas-" + this.id;
            var body = document.getElementsByTagName("body")[0];
            var div = document.createElement('div');
            var style = div.style;
            style.height = "100%";
            style.width = "100%";
            style.padding = "0";
            style.margin = "0";
            style.left = "0";
            style.top = "0";
            style.position = "absolute";
            // style["z-index"] = "10000";
            div.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; margin: 0; padding: 0;"></canvas>';
            body.appendChild(div);
            this.canvas = document.getElementById(canvasId);
        },

        /**
         * Initialises the WebGL context
         */
        _initWebGL: function () {

            for (var i = 0; !this.gl && i < this._WEBGL_CONTEXT_NAMES.length; i++) {
                try {
                    this.gl = this.canvas.getContext(this._WEBGL_CONTEXT_NAMES[i], this.contextAttr);
                } catch (e) { // Try with next context name
                }
            }

            if (!this.gl) {

                this.error('Failed to get a WebGL context');

                /**
                 * Fired whenever the canvas failed to get a WebGL context, which probably means that WebGL
                 * is either unsupported or has been disabled.
                 * @event webglContextFailed
                 */
                this.fire("webglContextFailed", true, true);
            }
        },

        _destroy: function () {
            this.scene.off(this._tick);
        }
    });

})();