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

 <img src="http://www.gliffy.com/go/publish/image/7103669/L.png"></img>

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

// Offset the second GameObject slightly on the World-space
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
 @param [cfg.uv2] {Array of Number} Second UVs array, for a second UV level.
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

            if (!cfg.positions && !cfg.normals && !cfg.uv && cfg.uv2 && !cfg.indices) {

                // Default cube

                cfg.primitive = "triangles";

                cfg.positions = [

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
                ];

                // Vertex colors
                cfg.colors = [
                    1.0, 1.0, 1.0, 1.0,    // Front face: white
                    1.0, 0.0, 0.0, 1.0,    // Back face: red
                    0.0, 1.0, 0.0, 1.0,    // Top face: green
                    0.0, 0.0, 1.0, 1.0,    // Bottom face: blue
                    1.0, 1.0, 0.0, 1.0,    // Right face: yellow
                    1.0, 0.0, 1.0, 1.0     // Left face: purple
                ];

                // Vertex normals
                cfg.normals = [
                    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
                ];

                // UV coordinates
                cfg.uv = [
                    1, 1, 0, 1, 0, 0, 1, 0,
                    0, 1, 0, 0, 1, 0, 1, 1,
                    1, 0, 1, 1, 0, 1, 0, 0,
                    1, 1, 0, 1, 0, 0, 1, 0,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1
                ];

                // Triangle indices
                cfg.indices = [
                    0, 1, 2, 0, 2, 3,    // front
                    4, 5, 6, 4, 6, 7,    // back
                    8, 9, 10, 8, 10, 11,   // top
                    12, 13, 14, 12, 14, 15,   // bottom
                    16, 17, 18, 16, 18, 19,   // right
                    20, 21, 22, 20, 22, 23    // left
                ];
            }

            this.primitive = cfg.primitive;
            this.positions = cfg.positions;
            this.normals = cfg.normals;
            this.uv = cfg.uv;
            this.uv2 = cfg.uv2;
            this.colors = cfg.colors;
            this.indices = cfg.indices;

            this._webglContextRestored = this.scene.canvas.on(
                "webglContextRestored",
                function (gl) {

                });

            this.scene.stats.inc("geometries");
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
                    var gl = this.scene.canvas.gl;
                    var type;
                    switch (value) {
                        case "points":
                            type = gl.POINTS;
                            break;
                        case "lines":
                            type = gl.LINES;
                            break;
                        case "line-loop":
                            type = gl.LINE_LOOP;
                            break;
                        case "line-strip":
                            type = gl.LINE_STRIP;
                            break;
                        case "triangles":
                            type = gl.TRIANGLES;
                            break;
                        case "triangle-strip":
                            type = gl.TRIANGLE_STRIP;
                            break;
                        case "triangle-fan":
                            type = gl.TRIANGLE_FAN;
                            break;
                        default:
                            this.error("XEO.Geometry 'primitive' value is unsupported - should be either " +
                                "'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan' (defaulting to 'triangles')");
                            value = "triangles";
                            type = gl.TRIANGLES;
                    }
                    this._state.primitive = value;
                    this._state.primitiveEnum = type;
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property changes.
                     * @event primitive
                     * @type String
                     * @param value The property's new value
                     */
                    this.fire("primitive", type);
                },

                get: function () {
                    return this._state.primitive;
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

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} property changes.
                     * @event positions
                     * @param value The property's new value
                     */
                    this.fire("positions", value);
                },

                get: function () {
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

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/normals:property"}}{{/crossLink}} property changes.
                     * @event normals
                     * @param value The property's new value
                     */
                },

                get: function () {
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

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/uv:property"}}{{/crossLink}} property changes.
                     * @event uv
                     * @param value The property's new value
                     */
                },

                get: function () {

                }
            },

            /**
             * The Geometry's second UV coordinate array.
             *
             * Fires a {{#crossLink "Geometry/uv2:event"}}{{/crossLink}} event on change.
             *
             * @property uv2
             * @default null
             * @type {Array of Number}
             */
            uv2: {

                set: function (value) {

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/uv2:property"}}{{/crossLink}} property changes.
                     * @event uv2
                     * @param value The property's new value
                     */
                },

                get: function () {
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

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/colors:property"}}{{/crossLink}} property changes.
                     * @event colors
                     * @param value The property's new value
                     */
                },

                get: function () {
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

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}} property changes.
                     * @event indices
                     * @param value The property's new value
                     */
                },

                get: function () {
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

        },

        /** Builds normal vectors from positions and indices
         * @private
         */
        _buildNormals: function (data) {

            var positions = data.positions;
            var indices = data.indices;
            var nvecs = new Array(positions.length / 3);
            var j0;
            var j1;
            var j2;
            var v1;
            var v2;
            var v3;

            for (var i = 0, len = indices.length - 3; i < len; i += 3) {
                j0 = indices[i + 0];
                j1 = indices[i + 1];
                j2 = indices[i + 2];

                v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
                v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
                v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

                v2 = XEO.math.subVec4(v2, v1, [0, 0, 0, 0]);
                v3 = XEO.math.subVec4(v3, v1, [0, 0, 0, 0]);

                var n = XEO.math.normalizeVec4(XEO.math.cross3Vec4(v2, v3, [0, 0, 0, 0]), [0, 0, 0, 0]);

                if (!nvecs[j0]) nvecs[j0] = [];
                if (!nvecs[j1]) nvecs[j1] = [];
                if (!nvecs[j2]) nvecs[j2] = [];

                nvecs[j0].push(n);
                nvecs[j1].push(n);
                nvecs[j2].push(n);
            }

            var normals = new Array(positions.length);

            // now go through and average out everything
            for (var i = 0, len = nvecs.length; i < len; i++) {
                var count = nvecs[i].length;
                var x = 0;
                var y = 0;
                var z = 0;
                for (var j = 0; j < count; j++) {
                    x += nvecs[i][j][0];
                    y += nvecs[i][j][1];
                    z += nvecs[i][j][2];
                }
                normals[i * 3 + 0] = (x / count);
                normals[i * 3 + 1] = (y / count);
                normals[i * 3 + 2] = (z / count);
            }

            data.normals = normals;
        },


        /**
         * Builds vertex tangent vectors from positions, UVs and indices
         *
         * Based on code by @rollokb, in his fork of webgl-obj-loader:
         * https://github.com/rollokb/webgl-obj-loader
         *
         * @private
         **/
        _buildTangents: function (arrays) {

            var positions = arrays.positions;
            var indices = arrays.indices;
            var uv = arrays.uv;

            var tangents = [];

            // The vertex arrays needs to be calculated
            // before the calculation of the tangents

            for (var location = 0; location < indices.length; location += 3) {

                // Recontructing each vertex and UV coordinate into the respective vectors

                var index = indices[location];

                var v0 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
                var uv0 = [uv[index * 2], uv[(index * 2) + 1]];

                index = indices[location + 1];

                var v1 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
                var uv1 = [uv[index * 2], uv[(index * 2) + 1]];

                index = indices[location + 2];

                var v2 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
                var uv2 = [uv[index * 2], uv[(index * 2) + 1]];

                var deltaPos1 = XEO.math.subVec3(v1, v0, []);
                var deltaPos2 = XEO.math.subVec3(v2, v0, []);

                var deltaUV1 = XEO.math.subVec2(uv1, uv0, []);
                var deltaUV2 = XEO.math.subVec2(uv2, uv0, []);

                var r = 1.0 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

                var tangent = XEO.math.mulVec3Scalar(
                    XEO.math.subVec3(
                        XEO.math.mulVec3Scalar(deltaPos1, deltaUV2[1], []),
                        XEO.math.mulVec3Scalar(deltaPos2, deltaUV1[1], []),
                        []
                    ),
                    r,
                    []
                );

                // Average the value of the vectors outs
                for (var v = 0; v < 3; v++) {
                    var addTo = indices[location + v];
                    if (typeof tangents[addTo] !== "undefined") {
                        tangents[addTo] = XEO.math.addVec3(tangents[addTo], tangent, []);
                    } else {
                        tangents[addTo] = tangent;
                    }
                }
            }

            // Deconstruct the vectors back into 1D arrays for WebGL

            var tangents2 = [];

            for (var i = 0; i < tangents.length; i++) {
                tangents2 = tangents2.concat(tangents[i]);
            }

            return tangents2;
        },

        _getJSON: function () {
            var json = {
                primitive: this.primitive
            };
            if (this._state.positions) {
                json.positions = this.positions;
            }
            if (this._state.normals) {
                json.normals = this.normals;
            }
            if (this._state.uv) {
                json.uv = this.uv;
            }
            if (this._state.uv2) {
                json.uv2 = this.uv2;
            }
            if (this._state.colors) {
                json.colors = this.colors;
            }
            if (this._state.indices) {
                json.indices = this.indices;
            }
            return json;
        },

        _destroy: function () {
            this.scene.stats.dec("geometries");
            this.scene.canvas.off(this._webglContextRestored);
        }
    });

})();