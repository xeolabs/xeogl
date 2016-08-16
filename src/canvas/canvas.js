/**
 A **Canvas** manages a {{#crossLink "Scene"}}Scene{{/crossLink}}'s HTML canvas and its WebGL context.

 <ul>
 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Canvas as a read-only property on itself.</li>
 <li>When a {{#crossLink "Scene"}}Scene{{/crossLink}} is configured with the ID of
 an existing <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a>, then
 the Canvas will bind to that, otherwise the Canvas will automatically create its own.</li>
 <li>A Canvas will fire a {{#crossLink "Canvas/size:event"}}{{/crossLink}} event whenever
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a> resizes.</li>
 <li>A Canvas is responsible for obtaining a WebGL context from
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a>.</li>
 <li>A Canvas also fires a {{#crossLink "Canvas/webglContextLost:event"}}{{/crossLink}} event when the WebGL context is
 lost, and a {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} when it is restored again.</li>
 <li>The various components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}} will transparently recover on
 the {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} event.</li>
 </ul>

 <img src="../../../assets/images/Canvas.png"></img>

 <br><br>
 Note that a Canvas also has a {{#crossLink "Spinner"}}{{/crossLink}}, which shows a
 busy spinner when a {{#crossLink "Model"}}{{/crossLink}} is loading, or when directed by application logic.

 ## Examples

 <ul>
 <li>[Multiple canvases](../../examples/#scene_multipleScenes)</li>
 </ul>

 ## Usage

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

 // Subscribe to Canvas size updates
 canvas.on("size", function(e) {
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
 // Create a Scene, this time configuring it with the
 // ID of an existing DOM canvas element
 var scene = new XEO.Scene({
          canvasId: "myCanvas"
     });

 // ..and the rest of this example can be the same as the previous example.

 ````
 @class Canvas
 @module XEO
 @submodule canvas
 @static
 @param {Scene} scene Parent scene
 @extends Component
 */
(function () {

    "use strict";

    XEO.Canvas = XEO.Component.extend({

        type: "XEO.Canvas",

        serializable: false,

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
             * created by default, with a z-index of -10000.
             *
             * @property canvas
             * @type {HTMLCanvasElement}
             * @final
             */
            this.canvas = null;

            /**
             * A transparent HTML DIV overlaid over the {{#crossLink "Canvas/canvas:property"}}{{/crossLink}}, with a z-index
             * of 100000.
             *
             * The parent {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Input"}}{{/crossLink}} will relay mouse
             * events from this DIV, instead of from the {{#crossLink "Canvas/canvas:property"}}{{/crossLink}}.
             *
             * When you need to have various HTML elements floating around over
             * the {{#crossLink "Canvas/canvas:property"}}{{/crossLink}}, then if you give those a z-index that lies between
             * that of the {{#crossLink "Canvas/canvas:property"}}{{/crossLink}} and this DIV, your elements will not
             * interfere with those events.
             *
             * @property canvas
             * @type {HTMLCanvasElement}
             * @final
             */
            this.overlay = null;

            /**
             * The WebGL rendering context.
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

            this.contextAttr.alpha = true;

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

                        this.error("Canvas element not found: " + XEO._inQuotes(cfg.canvas)
                            + " - creating default canvas instead.");

                        this._createCanvas();
                    }

                } else {

                    this.canvas = cfg.canvas;
                }
            }

            if (!this.canvas) {

                this.error("Faied to create canvas");

                return;
            }

            // If the canvas uses css styles to specify the sizes make sure the basic
            // width and height attributes match or the WebGL context will use 300 x 150

            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            /**
             * Boundary of the Canvas in absolute browser window coordinates.
             *
             * ### Usage:
             *
             * ````javascript
             * var boundary = myScene.canvas.boundary;
             *
             * var xmin = boundary[0];
             * var ymin = boundary[1];
             * var width = boundary[2];
             * var height = boundary[3];
             * ````
             *
             * @property boundary
             * @type {{Array of Number}}
             * @final
             */
            this.boundary = [
                this.canvas.offsetLeft, this.canvas.offsetTop,
                this.canvas.clientWidth, this.canvas.clientHeight
            ];

            this._createOverlay();
            this._resizeOverlay();

            // Get WebGL context

            this._initWebGL();

            // Bind context loss and recovery handlers

            var self = this;

            this.canvas.addEventListener("webglcontextlost",
                function () {

                    /**
                     * Fired whenever the WebGL context has been lost
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

            // Publish canvas size and position changes on each scene tick

            var lastWindowWidth = null;
            var lastWindowHeight = null;

            var lastCanvasWidth = null;
            var lastCanvasHeight = null;

            this._tick = this.scene.on("tick",
                function () {

                    var canvas = self.canvas;

                    var newPosition = (window.innerWidth !== lastWindowWidth || window.innerHeight !== lastWindowHeight);
                    var newSize = (canvas.clientWidth !== lastCanvasWidth || canvas.clientHeight !== lastCanvasHeight);

                    if (newPosition || newSize) {

                        self._spinner._adjustPosition();
                        self._resizeOverlay();

                        if (newSize) {

                            var newWidth = canvas.clientWidth;
                            var newHeight = canvas.clientHeight;

                            // TODO: Wasteful to re-count pixel size of each canvas on each canvas' resize
                            var countPixels = 0;
                            var scene;
                            for (var sceneId in XEO.scenes) {
                                if (XEO.scenes.hasOwnProperty(sceneId)) {
                                    scene = XEO.scenes[sceneId];
                                    countPixels += scene.canvas.canvas.clientWidth * scene.canvas.canvas.clientHeight;
                                }
                            }
                            XEO.stats.memory.pixels = countPixels;

                            canvas.width = canvas.clientWidth;
                            canvas.height = canvas.clientHeight;

                            var boundary = self.boundary;

                            boundary[0] = canvas.offsetLeft;
                            boundary[1] = canvas.offsetTop;
                            boundary[2] = newWidth;
                            boundary[3] = newHeight;

                            /**
                             * Fired whenever this Canvas's {{#crossLink "Canvas/boundary:property"}}{{/crossLink}} property changes.
                             *
                             * @event boundary
                             * @param value The property's new value
                             */
                            self.fire("boundary", boundary);

                            lastCanvasWidth = newWidth;
                            lastCanvasHeight = newHeight;

                            lastWindowWidth = window.innerWidth;
                            lastWindowHeight = window.innerHeight;
                        }
                    }
                });

            this.canvas.oncontextmenu = function (e) {
                e.preventDefault();
            };

            /**
             *
             */
            this._spinner = new XEO.Spinner(this.scene, {
                canvas: this.canvas
            });
        },

        /**
         * Creates a default canvas in the DOM.
         * @private
         */
        _createCanvas: function () {

            var canvasId = "XEO-canvas-" + XEO.math.createUUID();
            var body = document.getElementsByTagName("body")[0];
            var div = document.createElement('div');

            var style = div.style;
            style.height = "100%";
            style.width = "100%";
            style.padding = "0";
            style.margin = "0";
            style.background = "black";
            style.float = "left";
            style.left = "0";
            style.top = "0";
            style.position = "absolute";
            style["z-index"] = "-10000";

            div.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; float: left; margin: 0; padding: 0;"></canvas>';

            body.appendChild(div);

            this.canvas = document.getElementById(canvasId);
        },

        /**
         * Creates an invisible DIV over the canvas, for purpose of catching
         * input events without interfering with app-lever UI bits floating underneath.
         * @private
         */
        _createOverlay: function () {

            var overlayId = "XEO-overlay-" + XEO.math.createUUID();
            var body = document.getElementsByTagName("body")[0];
            var div = document.createElement('div');

            var style = div.style;
            //style.height = this.canvas.height + "px";
            //style.width = "100%";
            style.padding = "0";
            style.margin = "0";
            style.background = "black";
            style.float = "left";
            style.left = "0";
            style.top = "0";
            style.position = "absolute";
            style.opacity = 0;
            style["z-index"] = "100000";

            //div.innerHTML += '<div id="' + overlayId + '" style="width: 100%; height: 100%; float: left; margin: 0; padding: 0; opacity: 0;"></overlay>';

            body.appendChild(div);

            //this.overlay = document.getElementById(overlayId);
            this.overlay = div;
        },

        /** (Re)sizes the overlay DIV to the canvas size
         * @private
         */
        _resizeOverlay: function () {

            if (!this.canvas || !this.overlay) {
                return;
            }

            var canvas = this.canvas;
            var overlay = this.overlay;
            var overlayStyle = overlay.style;

            var xy = this._getElementXY(canvas);
            overlayStyle["left"] = xy.x + "px";
            overlayStyle["top"] = xy.y + "px";
            overlayStyle["width"] = canvas.clientWidth + "px";
            overlayStyle["height"] = canvas.clientHeight + "px";
        },

        _getElementXY: function (e) {
            var x = 0, y = 0;
            while (e) {
                x += e.offsetLeft;
                y += e.offsetTop;
                e = e.offsetParent;
            }
            return {x: x, y: y};
        },

        /**
         * Initialises the WebGL context
         * @private
         */
        _initWebGL: function () {

            // Default context attribute values

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

        /**
         Returns a snapshot of this Canvas as a Base64-encoded image.

         #### Usage:
         ````javascript
         imageElement.src = myScene.canvas.getSnapshot({
             width: 500, // Defaults to size of canvas
             height: 500,
             format: "png" // Options are "jpeg" (default), "png" and "bmp"
         });
         ````

         @method getSnapshot
         @param {*} [params] Capture options.
         @param {Number} [params.width] Desired width of result in pixels - defaults to width of canvas.
         @param {Number} [params.height] Desired height of result in pixels - defaults to height of canvas.
         @param {String} [params.format="jpeg"] Desired format; "jpeg", "png" or "bmp".
         @returns {String} String-encoded image data.
         */
        getSnapshot: function (params) {

            if (!this.canvas) {
                this.error("Can't get snapshot - no canvas.");
                return;
            }

            // Force-render a frame
            this.scene.render();

            params = params || {};

            var width = params.width || this.canvas.width;
            var height = params.height || this.canvas.height;
            var format = params.format || "jpeg";
            var image;

            switch (format) {
                case "jpeg":
                    image = Canvas2Image.saveAsJPEG(this.canvas, true, width, height);
                    break;

                case "png":
                    image = Canvas2Image.saveAsPNG(this.canvas, true, width, height);
                    break;

                case "bmp":
                    image = Canvas2Image.saveAsBMP(this.canvas, true, width, height);
                    break;

                default:
                    this.error("Unsupported snapshot format: '" + format
                        + "' - supported types are 'jpeg', 'bmp' and 'png' - defaulting to 'jpeg'");
                    image = Canvas2Image.saveAsJPEG(this.canvas, true, width, height);
            }

            return image.src;
        },

        /**
         Reads colors of pixels from the last rendered frame.

         <p>Call this method like this:</p>

         ````JavaScript

         // Ignore transparent pixels (default is false)
         var opaqueOnly = true;

         var colors = new Float32Array(8);

         myCanvas.readPixels([ 100, 22, 12, 33 ], colors, 2, opaqueOnly);
         ````

         Then the r,g,b components of the colors will be set to the colors at those pixels.

         @param {Float32Array} pixels
         @param {Float32Array} colors
         @param {Number} size
         @param {Boolean} opaqueOnly
         */
        readPixels: function (pixels, colors, size, opaqueOnly) {
            return this.scene._renderer.readPixels(pixels, colors, size, opaqueOnly);
        },

        _props: {

            /**
             The busy {{#crossLink "Spinner"}}{{/crossLink}} for this Canvas.

             @property spinner
             @type Spinner
             @final
             */
            spinner: {

                get: function () {
                    return this._spinner;
                }
            }
        },

        _destroy: function () {
            this.scene.off(this._tick);
        }
    });

})();
