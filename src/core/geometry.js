/**
 A **Geometry** defines the geometric shape of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Contents

 <Ul>
 <li><a href="#overview">Overview</a></li>
 <li><a href="#defaultShape">Default box shape</a></li>
 <li><a href="#sceneDefault">Scene's default Geometry</a></li>
 <li><a href="#sharing">Sharing among GameObjects</a></li>
 <li><a href="#triangles">Defining a triangle mesh</a></li>
 <li><a href="#editing">Editing Geometry</a></li>
 <li><a href="#backfaces">Toggling backfaces on or off</li>
 <li><a href="#frontfaces">Setting frontface vertex winding</li>
 </ul>

 ## <a name="overview">Overview</a>

 <ul>
 <li>Like everything in xeoEngine, all properties on a Geometry are dynamically editable.</li>
 <li>A Geometry's {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} type can be 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' or 'triangle-fan'".</li>
 <li>Depending on the {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} type, a Geometry can have {{#crossLink "Geometry/positions:property"}}vertex positions{{/crossLink}},
 {{#crossLink "Geometry/colors:property"}}vertex colors{{/crossLink}}, {{#crossLink "Geometry/uv:property"}}UV coordinates{{/crossLink}},
 {{#crossLink "Geometry/normals:property"}}normal vectors{{/crossLink}}, as well as {{#crossLink "Geometry/indices:property"}}{{/crossLink}},
 which specify how the vertices connect together to form the primitives.</li>
 <li>When no shape is specified (ie. no primitive type, vertex arrays and indices), a Geometry will default to a 2x2x2 box
 made of triangles, with UV coordinates, vertex colors and normals. This default is used for most of the examples in this documentation.</li>
 <li>A {{#crossLink "Scene"}}{{/crossLink}} provides such a box as its default {{#crossLink "Scene/geometry:property"}}{{/crossLink}},
 for {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to fall back on, when they are not explicitly attached to a Geometry.</li>
 </ul>

 <img src="../../../assets/images/Geometry.png"></img>

 ## <a name="defaultShape">Default box shape</a>

 If you create a Geometry with no specified shape, it will default to a 2x2x2 box defined as a triangle mesh.

 ```` javascript
 var geometry = new XEO.Geometry(scene); // 2x2x2 box

 var object1 = new XEO.GameObject(scene, {
    geometry: geometry
});
 ````

 ## <a name="sceneDefault">Scene's default Geometry</a>

 If you create a {{#crossLink "GameObject"}}GameObject{{/crossLink}} with no Geometry, it will inherit its {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default {{#crossLink "Scene/geometry:property"}}{{/crossLink}}, which is also a 2x2x2 box:

 ```` javascript
 var scene = new XEO.Scene();

 var object1 = new XEO.GameObject(scene);
 ````

 ## <a name="sharing">Sharing among GameObjects</a>

 xeoEngine components can be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. For components like
 Geometry and {{#crossLink "Texture"}}{{/crossLink}}, this can provide significant memory
 and performance savings. To render the example below, xeoEngine will issue two draw WebGL calls, one for
 each {{#crossLink "GameObject"}}{{/crossLink}}, but will only need to bind the Geometry's arrays once on WebGL.

 ```` javascript
 var scene = new XEO.Scene();

 var geometry = new XEO.Geometry(scene); // 2x2x2 box by default

 // Create two GameObjects which share our Geometry

 var object1 = new XEO.GameObject(scene, {
    geometry: geometry
});

 // Offset the second Object slightly on the World-space
 // X-axis using a Translate modelling transform

 var translate = new XEO.Translate(scene, {
    xyz: [5, 0, 0
});

 var object2 = new XEO.GameObject(scene, {
    geometry: geometry,
    transform: translate
});
 ````

 ## <a name="triangles">Defining a triangle mesh</a>

 Finally, we'll create a {{#crossLink "GameObject"}}GameObject{{/crossLink}} with a Geometry that we've **explicitly**
 configured as a 2x2x2 box:

 ```` javascript
 var scene = new XEO.Scene();

 // Create a 2x2x2 box centered at the World-space origin
 var geometry = new XEO.Geometry(scene, {

        // Supported primitives are 'points', 'lines', 'line-loop', 'line-strip', 'triangles',
        // 'triangle-strip' and 'triangle-fan'.primitive: "triangles",
        primitive: "triangles",

        // Vertex positions
        positions : [

            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
             1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ],

        // Vertex colors
        colors: [
            1.0,  1.0,  1.0,  1.0,    // Front face: white
            1.0,  0.0,  0.0,  1.0,    // Back face: red
            0.0,  1.0,  0.0,  1.0,    // Top face: green
            0.0,  0.0,  1.0,  1.0,    // Bottom face: blue
            1.0,  1.0,  0.0,  1.0,    // Right face: yellow
            1.0,  0.0,  1.0,  1.0     // Left face: purple
        ],

        // Vertex normals
        normals: [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
        ],

        // UV coordinates
        uv: [
            1, 1, 0, 1, 0, 0, 1, 0,
            0, 1, 0, 0, 1, 0, 1, 1,
            1, 0, 1, 1, 0, 1, 0, 0,
            1, 1, 0, 1, 0, 0, 1, 0,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1
        ],

        // Triangle indices
        indices: [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ]
});

 var object = new XEO.GameObject(myScene, {
    geometry: geometry
});
 ````
 ## <a name="editing">Editing Geometry</a>

 Recall that everything in xeoEngine is dynamically editable, including Geometry. Let's remove the front and back faces
 from our triangle mesh Geometry by updating its **indices** array:

 ````javascript
 geometry2.indices = [
 8,  9,  10,     8,  10, 11,   // top
 12, 13, 14,     12, 14, 15,   // bottom
 16, 17, 18,     16, 18, 19,   // right
 20, 21, 22,     20, 22, 23    // left
 ];
 ````

 Now let's make it wireframe by changing its primitive type from **faces** to **lines**:

 ````javascript
 geometry2.primitive = "lines";
 ````

 ## <a name="backfaces">Toggling backfaces on or off</a>

 Now we'll attach a {{#crossLink "Modes"}}{{/crossLink}} to that last {{#crossLink "GameObject"}}{{/crossLink}}, so that
 we can show or hide its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} backfaces:

 ```` javascript
 var modes = new XEO.Modes(scene);

 object.modes = modes;

 // Hide backfaces

 modes.backfaces = false;

 ````

 ## <a name="frontfaces">Setting frontface vertex winding</a>

 The <a href="https://www.opengl.org/wiki/Face_Culling" target="other">vertex winding order</a> of each face determines
 whether it's a frontface or a backface.

 By default, xeoEngine considers faces to be frontfaces if they have a counter-clockwise
 winding order, but we can change that by setting the {{#crossLink "Modes"}}{{/crossLink}}
 {{#crossLink "Modes/frontface:property"}}{{/crossLink}} property, like so:

 ```` javascript
 // Set the winding order for frontfaces to clockwise
 // Options are "ccw" for counter-clockwise or "cw" for clockwise

 object.frontface = "cw";
 ````


 @class Geometry
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Geometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.positions] {Array of Number} Positions array.
 @param [cfg.normals] {Array of Number} Normals array.
 @param [cfg.uv] {Array of Number} UVs array.
 @param [cfg.colors] {Array of Number} Vertex colors.
 @param [cfg.indices] {Array of Number} Indices array.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Geometry = XEO.Component.extend({

        className: "XEO.Geometry",

        type: "geometry",

        _init: function (cfg) {

            this._state = this._renderer.createState({
                primitive: null, // WebGL enum
                positions: null, // VBOs
                colors: null,
                normals: null,
                uv: null,
                tangents: null,
                indices: null
            });

            this._primitive = null;  // String
            this._positions = null; // Typed data arrays
            this._colors = null;
            this._normals = null;
            this._uv = null;
            this._tangents = null;
            this._indices = null;

            this._dirty = true;
            this._positionsDirty = true;
            this._colorsDirty = true;
            this._normalsDirty = true;
            this._uvDirty = true;
            this._tangentsDirty = true;
            this._indicesDirty = true;


            var defaultGeometry = (!cfg.positions && !cfg.normals && !cfg.uv && cfg.uv2 && !cfg.indices);

            if (defaultGeometry) {

                this.primitive = "triangles";

                this.positions = [
                    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Front face
                    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Back face
                    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Top face
                    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Bottom face
                    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Right face
                    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 // Left face
                ];

                this.colors = [
                    1.0, 1.0, 1.0, 1.0,    // Front face: white
                    1.0, 0.0, 0.0, 1.0,    // Back face: red
                    0.0, 1.0, 0.0, 1.0,    // Top face: green
                    0.0, 0.0, 1.0, 1.0,    // Bottom face: blue
                    1.0, 1.0, 0.0, 1.0,    // Right face: yellow
                    1.0, 0.0, 1.0, 1.0     // Left face: purple
                ];

                this.normals = [
                    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
                ];

                this.uv = [
                    1, 1, 0, 1, 0, 0, 1, 0,
                    0, 1, 0, 0, 1, 0, 1, 1,
                    1, 0, 1, 1, 0, 1, 0, 0,
                    1, 1, 0, 1, 0, 0, 1, 0,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1
                ];

                // Tangents are lazy-computed from normals and UVs
                // for Normal mapping once we know we have texture

                this.tangents = null;

                this.indices = [
                    0, 1, 2, 0, 2, 3,    // front
                    4, 5, 6, 4, 6, 7,    // back
                    8, 9, 10, 8, 10, 11,   // top
                    12, 13, 14, 12, 14, 15,   // bottom
                    16, 17, 18, 16, 18, 19,   // right
                    20, 21, 22, 20, 22, 23    // left
                ];

            } else {

                // Custom geometry

                this.primitive = cfg.primitive;
                this.positions = cfg.positions;
                this.colors = cfg.colors;
                this.normals = cfg.normals;
                this.uv = cfg.uv;
                this.tangents = cfg.tangents;
                this.indices = cfg.indices;
            }

            var self = this;

            this._webglContextRestored = this.scene.canvas.on(
                "webglContextRestored",
                function () {
                    self._scheduleBuild();
                });

            this.scene.stats.inc("geometries");
        },

        _scheduleBuild: function () {
            if (!this._dirty) {
                this._dirty = true;
                var self = this;
                this.scene.once("tick",
                    function () {
                        self._build();
                    });
            }
        },

        _build: function () {

            var gl = this.scene.canvas.gl;

            switch (this._primitive) {

                case "points":
                    this._state.primitive = gl.POINTS;
                    break;

                case "lines":
                    this._state.primitive = gl.LINES;
                    break;

                case "line-loop":
                    this._state.primitive = gl.LINE_LOOP;
                    break;

                case "line-strip":
                    this._state.primitive = gl.LINE_STRIP;
                    break;

                case "triangles":
                    this._state.primitive = gl.TRIANGLES;
                    break;

                case "triangle-strip":
                    this._state.primitive = gl.TRIANGLE_STRIP;
                    break;

                case "triangle-fan":
                    this._state.primitive = gl.TRIANGLE_FAN;
                    break;

                default:
                    this._state.primitive = gl.TRIANGLES;
            }

            var usage = gl.STATIC_DRAW;

            if (this._positionsDirty) {
                if (this._state.positions) {
                    this._state.positions.destroy();
                }
                this._state.positions = this._positions ? new XEO.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._positions, this._positions.length, 3, usage) : null;
                this._positionsDirty = false;
            }

            if (this._colorsDirty) {
                if (this._state.colors) {
                    this._state.colors.destroy();
                }
                this._state.colors = this._colors ? new XEO.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._colors, this._colors.length, 4, usage) : null;
                this._colorsDirty = false;
            }

            if (this._normalsDirty) {
                if (this._state.normals) {
                    this._state.normals.destroy();
                }
                this._state.normals = this._normals ? new XEO.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._normals, this._normals.length, 3, usage) : null;
                this._normalsDirty = false;
            }

            if (this._uvDirty) {
                if (this._state.uv) {
                    this._state.uv.destroy();
                }
                this._state.uv = this._uv ? new XEO.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._uv, this._uv.length, 2, usage) : null;
                this._uv = false;
            }

            if (this._tangentsDirty) {
                if (this._state.tangents) {
                    this._state.tangents.destroy();
                }
                this._state.tangents = this._tangents ? new XEO.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._tangents, this._tangents.length, 4, usage) : null;
                this._tangentsDirty = false;
            }

            if (this._indicesDirty) {
                if (this._state.indices) {
                    this._state.indices.destroy();
                }
                this._state.indices = this._indices ? new XEO.webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this._indices, this._indices.length, 1, usage) : null;
                this._indicesDirty = false;
            }

            this._dirty = false;
        },

        _props: {

            /**
             * The Geometry's primitive type.
             *
             * Valid types are: 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
             *
             * Fires a {{#crossLink "Geometry/primitive:event"}}{{/crossLink}} event on change.
             *
             * @property primitive
             * @default "triangles"
             * @type String
             */
            primitive: {

                set: function (value) {

                    value = value || "triangles";

                    if (value !== "points" &&
                        value !== "lines" &&
                        value !== "line-loop" &&
                        value !== "line-strip" &&
                        value !== "triangles" &&
                        value !== "triangle-strip" &&
                        value !== "triangle-fan") {

                        this.error("XEO.Geometry 'primitive' value is unsupported - supported values are: " +
                            "'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and " +
                            "'triangle-fan' (defaulting to 'triangles')");

                        value = "triangles";
                    }

                    this._primitive = value;
                    this._dirty = true;

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property changes.
                     * @event primitive
                     * @type String
                     * @param value The property's new value
                     */
                    this.fire("primitive", this._primitive);

                    this._scheduleBuild();
                },

                get: function () {
                    return this._primitive;
                }
            },

            /**
             * The Geometry's positions array.
             *
             * Fires a {{#crossLink "Geometry/positions:event"}}{{/crossLink}} event on change.
             *
             * @property positions
             * @default null
             * @type {Array of Number}
             */
            positions: {

                set: function (value) {

                    this._positions = value;
                    this._positionsDirty = value;
                    this._dirty = true;

                    this._scheduleBuild();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} property changes.
                     * @event positions
                     * @param value The property's new value
                     */
                    this.fire("positions", this._positions);
                },

                get: function () {
                    return this._positions;
                }
            },

            /**
             * The Geometry's normal vectors array.
             *
             * Fires a {{#crossLink "Geometry/normals:event"}}{{/crossLink}} event on change.
             *
             * @property normals
             * @default null
             * @type {Array of Number}
             */
            normals: {

                set: function (value) {

                    this._normals = value;
                    this._normalsDirty = value;
                    this._dirty = true;

                    this._scheduleBuild();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/ normals:property"}}{{/crossLink}} property changes.
                     * @event  normals
                     * @param value The property's new value
                     */
                    this.fire(" normals", this._normals);
                },

                get: function () {
                    return this._normals;
                }
            },

            /**
             * The Geometry's UV coordinate array.
             *
             * Fires a {{#crossLink "Geometry/uv:event"}}{{/crossLink}} event on change.
             *
             * @property uv
             * @default null
             * @type {Array of Number}
             */
            uv: {

                set: function (value) {

                    this._uv = value;
                    this._uvBufDirty = value;
                    this._dirty = true;

                    this._scheduleBuild();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/uv:property"}}{{/crossLink}} property changes.
                     * @event uv
                     * @param value The property's new value
                     */
                    this.fire("uv", this._uv);
                },

                get: function () {
                    return this._uv;
                }
            },

            /**
             * The Geometry's vertex colors array.
             *
             * Fires a {{#crossLink "Geometry/colors:event"}}{{/crossLink}} event on change.
             *
             * @property colors
             * @default null
             * @type {Array of Number}
             */
            colors: {

                set: function (value) {

                    this._colors = value;
                    this._colorsDirty = value;
                    this._dirty = true;

                    this._scheduleBuild();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/colors:property"}}{{/crossLink}} property changes.
                     * @event colors
                     * @param value The property's new value
                     */
                    this.fire("colors", this._colors);
                },

                get: function () {
                    return this._colors;
                }
            },

            /**
             * The Geometry's indices array.
             *
             * Fires a {{#crossLink "Geometry/indices:event"}}{{/crossLink}} event on change.
             *
             * @property indices
             * @default null
             * @type {Array of Number}
             */
            indices: {

                set: function (value) {

                    this._indices = value;
                    this._indicesDirty = value;
                    this._dirty = true;

                    this._scheduleBuild();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}} property changes.
                     * @event indices
                     * @param value The property's new value
                     */
                    this.fire("indices", this._indices);
                },

                get: function () {
                    return this._indices;
                }
            },

            boundingBox: {

                get: function () {
                }
            },


            boundingSphere: {

                get: function () {
                }
            },

            center: {

                get: function () {
                }
            }
        },

        _compile: function () {

            if (this._dirty) {
                this._build();
            }

            this._renderer.geometry = this._state;
        },

        _getJSON: function () {

            return XEO._apply2({
                primitive: this._primitive,
                positions: this._positions,
                normals: this._normals,
                uv: this._uv,
                colors: this._colors,
                indices: this._indices
            });
        },

        _destroy: function () {

            this.scene.canvas.off(this._webglContextRestored);

            // Destroy VBOs

            if (this._state.positions) {
                this._state.positions.destroy();
            }

            if (this._state.colors) {
                this._state.colors.destroy();
            }

            if (this._state.normals) {
                this._state.normals.destroy();
            }

            if (this._state.uv) {
                this._state.uv.destroy();
            }

            if (this._state.tangents) {
                this._state.tangents.destroy();
            }

            if (this._state.indices) {
                this._state.indices.destroy();
            }

            // Destroy state

            this._renderer.destroyState(this._state);

            // Decrement geometry statistic

            this.scene.stats.dec("geometries");
        }
    });

})();