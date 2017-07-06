/**
 A **Geometry** defines a mesh for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_triangles_texture"><img src="../../assets/images/screenshots/BoxGeometry.png"></img></a>

 ## Overview

 * Like everything in xeogl, all properties on a Geometry are dynamically editable.
 * Set a Geometry's {{#crossLink "Geometry/autoNormals:property"}}{{/crossLink}} ````true```` to make the Geometry automatically generate it's vertex normal vectors from its {{#crossLink "Geometry/positions:property"}}{{/crossLink}} and {{#crossLink "Geometry/indices:property"}}{{/crossLink}}.
 * When no shape is specified, a Geometry will be a 2x2x2 box by default.
 * A {{#crossLink "Scene"}}{{/crossLink}} provides a 2x2x2 box for {{#crossLink "Entity"}}Entities{{/crossLink}}
 by default when they are not configured with a Geometry.
 * A Geometry provides its local-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 <img src="../../../assets/images/Geometry.png"></img>

 ## Examples

 * [Simple triangle mesh](../../examples/#geometry_triangles)
 * [Triangle mesh with diffuse texture](../../examples/#geometry_triangles_texture)
 * [Triangle mesh with vertex colors](../../examples/#geometry_triangles_vertexColors)
 * [Wireframe box](../../examples/#geometry_lines)
 * [Dynamically modifying a TorusGeometry](../../examples/#geometry_modifying)

 ## Usage

 ### Default shape</a>

 If you create a Geometry with no specified shape, it will default to a box-shaped triangle mesh with dimensions 2x2x2:

 ```` javascript
 var entity = new xeogl.Entity({
    geometry: new xeogl.Geometry() // 2x2x2 box
 });
 ````

 ### Scene's default Geometry

 If you create an {{#crossLink "Entity"}}{{/crossLink}} with no Geometry, it will inherit its {{#crossLink "Scene"}}Scene's{{/crossLink}}
 default {{#crossLink "Scene/geometry:property"}}{{/crossLink}}, which is a 2x2x2 triangle mesh box:

 ```` javascript
 var entity2 = new xeogl.Entity();
 ````

 ### Sharing among Entities

 xeogl components can be shared among multiple {{#crossLink "Entity"}}Entities{{/crossLink}}. For components like
 Geometry and {{#crossLink "Texture"}}{{/crossLink}}, this can provide significant memory
 and performance savings. To render the example below, xeogl will issue two draw WebGL calls, one for
 each {{#crossLink "Entity"}}{{/crossLink}}, but will only need to bind the Geometry's arrays once on WebGL.

 ```` javascript
 var boxGeometry = new xeogl.BoxGeometry();

 new xeogl.Entity({
    geometry: boxGeometry
 });

 new xeogl.Entity({
    geometry: boxGeometry,
    transform:  new xeogl.Translate({
        xyz: [5, 0, 0
    })
 });
 ````

 ### Creating a custom Geometry

 Let's create an {{#crossLink "Entity"}}{{/crossLink}} with a custom Geometry that's a quad-shaped triangle mesh:

 ```` javascript
 var quadGeometry = new xeogl.Geometry({

        // Supported primitives are 'points', 'lines', 'line-loop', 'line-strip', 'triangles',
        // 'triangle-strip' and 'triangle-fan'.primitive: "triangles",
        primitive: "triangles",

        // Vertex positions
        positions : [
            -1.0, -1.0, 1.0,  // 0
             1.0, -1.0, 1.0,  // 1
             1.0,  1.0, 1.0,  // 2
            -1.0,  1.0, 1.0   // 3
        ],

        // Vertex colors
        colors: [
            1.0,  1.0,  1.0,  1.0, // 0
            1.0,  0.0,  0.0,  1.0, // 1
            0.0,  1.0,  0.0,  1.0, // 2
            0.0,  0.0,  1.0,  1.0  // 3
        ],

        // Vertex normals
        normals: [
            0, 0, 1, // 0
            0, 0, 1, // 1
            0, 0, 1, // 2
            0, 0, 1  // 3
        ],

        // UV coordinates
        uv: [
            0, 0, // 0
            1, 0, // 1
            1, 1, // 2
            1, 0  // 3
        ],

        // Triangle indices
        indices: [
            0,  1,  2,
            0,  2,  3
        ]
});

 var quadEntity = new xeogl.Entity({
    geometry: quadGeometry
 });
 ````
 ## Editing Geometry

 Recall that everything in xeogl is dynamically editable. Let's update the
 {{#crossLink "Geometry/indices:property"}}{{/crossLink}} to reverse the direction of the triangles:

 ````javascript
 customGeometry.indices = [ 2, 1, 0, 3, 2, 0 ];
 ````

 Now let's make it wireframe by changing its primitive type from ````triangles```` to ````lines````:

 ````javascript
 quadGeometry.primitive = "lines";
 ````

 ````javascript
 ````

 ### Toggling back-faces on and off

 Now we'll attach a {{#crossLink "Modes"}}{{/crossLink}} to that last {{#crossLink "Entity"}}{{/crossLink}}, so that
 we can show or hide its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} backfaces:

 ```` javascript
 var modes = new xeogl.Modes();

 quadEntity.modes = modes;

 // Hide backfaces

 modes.backfaces = false;
 ````

 ### Setting front-face vertex winding

 The <a href="https://www.opengl.org/wiki/Face_Culling" target="other">vertex winding order</a> of each face determines
 whether it's a front-face or a back-face.

 By default, xeogl considers faces to be front-faces if they have a counter-clockwise
 winding order, but we can change that by setting the {{#crossLink "Modes"}}{{/crossLink}}
 {{#crossLink "Modes/frontface:property"}}{{/crossLink}} property:

 ```` javascript
 // Set the winding order for front-faces to clockwise
 // Options are "ccw" for counter-clockwise or "cw" for clockwise

 modes.frontface = "cw";
 ````

 ### Getting the Local-space boundary

 We can get a Geometry's Local-space {{#crossLink "Boundary3D"}}{{/crossLink}} like so:

 ````javascript
 var localBoundary = quadGeometry.localBoundary;

 localBoundary.on("updated", function() {

        obb = localBoundary.obb;
        aabb = localBoundary.aabb;
        center = localBoundary.center;

        //...
    });
 ````

 @class Geometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Geometry.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.usage="statis"] {String} The Geometry's usage type. Accepted values are 'static', 'dynamic' and 'stream'.
 @param [cfg.positions] {Array of Number} Positions array.
 @param [cfg.normals] {Array of Number} Vertex normal vectors array.
 @param [cfg.uv] {Array of Number} UVs array.
 @param [cfg.colors] {Array of Number} Vertex colors.
 @param [cfg.tangents] {Array of Number} Vertex tangents.
 @param [cfg.indices] {Array of Number} Indices array.
 @param [cfg.autoNormals=false] {Boolean} Set true to automatically generate normal vectors from the positions and indices, if those are supplied.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Geometry = xeogl.Component.extend({

        type: "xeogl.Geometry",

        _init: function (cfg) {

            var self = this;

            this._state = new xeogl.renderer.Geometry({

                usage: null,

                primitive: null, // WebGL enum
                primitiveName: null, // String

                // VBOs 

                positions: null,
                colors: null,
                normals: null,
                uv: null,
                tangents: null,
                indices: null,
                autoNormals: false,

                hash: "",

                // Getters for VBOs that are only created on demand

                // Tangents for normal mapping

                getTangents: function () {
                    if (self._tangentsDirty) {
                        self._buildTangents();
                    }
                    return self._tangents;
                },

                // Arrays modified to support primitive-picking

                getPickPositions: function () {
                    if (self._pickVBOsDirty) {
                        self._buildPickVBOs();
                    }
                    return self._pickPositions;
                },

                getPickColors: function () {
                    if (self._pickVBOsDirty) {
                        self._buildPickVBOs();
                    }
                    return self._pickColors;
                }
            });

            // Typed arrays

            this._positions = null;
            this._positionsUpdate = null;
            this._positionsUpdateOffset = 0;

            this._normals = null;
            this._normalsUpdate = null;
            this._normalsUpdateOffset = 0;

            this._colors = null;
            this._colorsUpdate = null;
            this._colorsUpdateOffset = 0;

            this._uvs = null;
            this._uvsUpdate = null;
            this._uvsUpdateOffset = 0;

            this._tangentsData = null;
            this._tangentsUpdate = null;
            this._tangentsUpdateOffset = 0;

            this._indices = null;

            // Lazy-generated VBOs

            this._tangents = null;
            this._pickPositions = null;
            this._pickColors = null;

            // Flags for work pending

            this._updateScheduled = false;
            this._geometryUpdateScheduled = false;
            this._hashDirty = true;
            this._positionsDirty = true;
            this._colorsDirty = true;
            this._normalsDirty = true;
            this._uvDirty = true;
            this._tangentsDirty = true;
            this._indicesDirty = true;
            this._pickVBOsDirty = true;

            // Local-space Boundary3D

            this._localBoundary = null;
            this._boundaryDirty = true;

            var defaultGeometry = (!cfg.positions && !cfg.normals && !cfg.uv && !cfg.indices);

            if (defaultGeometry) { // Default geometry is a box-shaped triangle mesh

                this.primitive = cfg.primitive;

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

            this.autoNormals = cfg.autoNormals;

            this.usage = cfg.usage;

            this._webglContextRestored = this.scene.canvas.on("webglContextRestored", this._scheduleGeometryUpdate, this);

            xeogl.stats.memory.meshes++;
        },

        /**
         * Protected method, called by sub-classes to queue a call to _update(), to rebuild geometry data arrays.
         *
         * @protected
         */
        _needUpdate: function () {
            if (!this._updateScheduled) {
                this._updateScheduled = true;
                xeogl.scheduleTask(this._doUpdate, this);
            }
        },

        _doUpdate: function () {

            if (this._updateScheduled) {

                this._geometryUpdateScheduled = true; // Prevents needless scheduling within _update()

                if (this._update) { // Template method from xeogl.Component
                    this._update();
                }

                this._updateScheduled = false;
            }

            if (this._geometryUpdateScheduled) {
                this._updateGeometry();
            }
        },

        _scheduleGeometryUpdate: function () {
            if (!this._geometryUpdateScheduled) {
                this._geometryUpdateScheduled = true;
                xeogl.scheduleTask(this._updateGeometry, this);
            }
        },

        _updateGeometry: function () {

            var state = this._state;

            if (this._updateScheduled) {

                if (this._update) {
                    this._geometryUpdateScheduled = true; // Prevents needless scheduling within _update()
                    this._update();
                }

                this._updateScheduled = false;
                this._geometryUpdateScheduled = true;

            } else if (!this._geometryUpdateScheduled) {
                return;
            }

            var gl = this.scene.canvas.gl;
            var memoryStats = xeogl.stats.memory;
            var boundaryDirty = false;

            if (this._positionsDirty) {
                if (!this._positionsUpdate) {
                    if (state.positions) {
                        memoryStats.positions -= state.positions.numItems;
                        state.positions.destroy();
                    }
                } else if (!state.positions) {
                    state.positions = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._positions, this._positions.length, 3, state.usage);
                    memoryStats.positions += state.positions.numItems;
                } else if (this._positionsUpdateOffset === null && this._positionsUpdate.length === state.positions.length) {
                    state.positions.setData(this._positionsUpdate);
                } else if (this._positionsUpdateOffset === null) {
                    if (state.positions) {
                        memoryStats.positions -= state.positions.numItems;
                        state.positions.destroy();
                    }
                    state.positions = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._positions, this._positions.length, 3, state.usage);
                    memoryStats.positions += state.positions.numItems;
                } else if ((this._positionsUpdateOffset + this._positionsUpdate.length) <= state.positions.length) {
                    state.positions.setData(this._positionsUpdate, this._positionsUpdateOffset);
                } else {
                    memoryStats.positions -= state.positions.numItems;
                    state.positions.destroy();
                    state.positions = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._positions, this._positions.length, 3, state.usage);
                    memoryStats.positions += state.positions.numItems;
                }
                this._positionsDirty = false;
                this._tangentsDirty = true;
                this._pickVBOsDirty = true;
                if (state.autoNormals) {
                    this._normalsDirty = true;
                }
                boundaryDirty = true;
            }

            if (this._colorsDirty) {
                if (!this._colorsUpdate) {
                    if (state.colors) {
                        memoryStats.colors -= state.colors.numItems;
                        state.colors.destroy();
                    }
                } else if (!state.colors) {
                    state.colors = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._colors, this._colors.length, 4, state.usage);
                    memoryStats.colors += state.colors.numItems;
                } else if (this._colorsUpdateOffset === null && this._colorsUpdate.length === state.colors.length) {
                    state.colors.setData(this._colorsUpdate);
                } else if (this._colorsUpdateOffset === null) {
                    if (state.colors) {
                        memoryStats.colors -= state.colors.numItems;
                        state.colors.destroy();
                    }
                    state.colors = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._colors, this._colors.length, 4, state.usage);
                    memoryStats.colors += state.colors.numItems;
                } else if ((this._colorsUpdateOffset + this._colorsUpdate.length) <= state.colors.length) {
                    state.colors.setData(this._colorsUpdate, this._colorsUpdateOffset);
                } else {
                    memoryStats.colors -= state.colors.numItems;
                    state.colors.destroy();
                    state.colors = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._colors, this._colors.length, 4, state.usage);
                    memoryStats.colors += state.colors.numItems;
                }
                this._colorsDirty = false;
            }

            if (this._uvsDirty) {
                if (!this._uvsUpdate) {
                    if (state.uv) {
                        memoryStats.uvs -= state.uv.numItems;
                        state.uv.destroy();
                    }
                } else if (!state.uv) {
                    state.uv = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._uvs, this._uvs.length, 2, state.usage);
                    memoryStats.uvs += state.uv.numItems;
                } else if (this._uvsUpdateOffset === null && this._uvsUpdate.length === state.uv.length) {
                    state.uv.setData(this._uvsUpdate);
                } else if (this._uvsUpdateOffset === null) {
                    if (state.uv) {
                        memoryStats.uvs -= state.uv.numItems;
                        state.uv.destroy();
                    }
                    state.uv = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._uvs, this._uvs.length, 2, state.usage);
                    memoryStats.uvs += state.uv.numItems;
                } else if ((this._uvsUpdateOffset + this._uvsUpdate.length) <= state.uv.length) {
                    state.uv.setData(this._uvsUpdate, this._uvsUpdateOffset);
                } else {
                    memoryStats.uvs -= state.uv.numItems;
                    state.uv.destroy();
                    state.uv = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._uvs, this._uvs.length, 2, state.usage);
                    memoryStats.uvs += state.uv.numItems;
                }
                this._uvsDirty = false;
                this._tangentsDirty = true;
            }

            if (this._indicesDirty) {
                if (!this._indicesUpdate) {
                    if (state.indices) {
                        memoryStats.indices -= state.indices.numItems;
                        state.indices.destroy();
                    }
                } else if (!state.indices) {
                    state.indices = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this._indices, this._indices.length, 1, state.usage);
                    memoryStats.indices += state.indices.numItems;
                } else if (this._indicesUpdateOffset === null && this._indicesUpdate.length === state.indices.length) {
                    state.indices.setData(this._indicesUpdate);
                } else if (this._indicesUpdateOffset === null) {
                    if (state.indices) {
                        memoryStats.indices -= state.indices.numItems;
                        state.indices.destroy();
                    }
                    state.indices = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this._indices, this._indices.length, 1, state.usage);
                    memoryStats.indices += state.indices.numItems;
                } else if ((this._indicesUpdateOffset + this._indicesUpdate.length) <= state.indices.length) {
                    state.indices.setData(this._indicesUpdate, this._indicesUpdateOffset);
                } else {
                    memoryStats.indices -= state.indices.numItems;
                    state.indices.destroy();
                    state.indices = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this._indices, this._indices.length, 1, state.usage);
                    memoryStats.indices += state.indices.numItems;
                }
                this._indicesDirty = false;
                this._tangentsDirty = true;
                this._pickVBOsDirty = true;
                if (state.autoNormals) {
                    this._normalsDirty = true;
                }
                boundaryDirty = true;
            }

            if (this._normalsDirty) {
                if (state.autoNormals) {
                    if (this._positions && this._indices) {
                        this._normals = xeogl.math.buildNormals(this._positions, this._indices, this._normals);
                        this._normalsDirty = false;
                        this._tangentsDirty = true;
                        this._normalsUpdate = this._normals;
                        this._normalsUpdateOffset = null;
                    }
                }
                if (!this._normalsUpdate) {
                    if (state.normals) {
                        memoryStats.normals -= state.normals.numItems;
                        state.normals.destroy();
                    }
                } else if (!state.normals) {
                    state.normals = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._normals, this._normals.length, 3, state.usage);
                    memoryStats.normals += state.normals.numItems;
                } else if (this._normalsUpdateOffset === null && this._normalsUpdate.length === state.normals.length) {
                    state.normals.setData(this._normalsUpdate);
                } else if (this._normalsUpdateOffset === null) {
                    if (state.normals) {
                        memoryStats.normals -= state.normals.numItems;
                        state.normals.destroy();
                    }
                    state.normals = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._normals, this._normals.length, 3, state.usage);
                    memoryStats.normals += state.normals.numItems;
                } else if ((this._normalsUpdateOffset + this._normalsUpdate.length) <= state.normals.length) {
                    state.normals.setData(this._normalsUpdate, this._normalsUpdateOffset);
                } else {
                    memoryStats.normals -= state.normals.numItems;
                    state.normals.destroy();
                    state.normals = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._normals, this._normals.length, 3, state.usage);
                    memoryStats.normals += state.normals.numItems;
                }
                this._normalsDirty = false;
                this._tangentsDirty = true;
                boundaryDirty = true;
            }

            this._geometryUpdateScheduled = false;

            if (boundaryDirty) {
                this._setBoundaryDirty();
            }
        },

        _buildTangents: function () {

            if (!this._tangentsDirty) {
                return;
            }

            if (this._updateScheduled || this._geometryUpdateScheduled) {
                this._doUpdate();
            }

            var memoryStats = xeogl.stats.memory;

            if (this._tangents) {
                memoryStats.tangents -= this._tangents.numItems;
                this._tangents.destroy();
            }

            if (!this._positions || !this._indices || !this._uvs) {
                return null;
            }

            this._tangentsData = xeogl.math.buildTangents(this._positions, this._indices, this._uvs);

            var gl = this.scene.canvas.gl;

            this._tangents = this._tangentsData ?
                new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._tangentsData, this._tangentsData.length, 3, this._state.usage) : null;

            if (this._tangents) {
                memoryStats.tangents += this._tangents.numItems;
            }

            this._tangentsDirty = false;
        },

        _buildPickVBOs: function () {

            if (!this._pickVBOsDirty) {
                return;
            }

            if (this._updateScheduled || this._geometryUpdateScheduled) {
                this._doUpdate();
            }

            this._destroyPickVBOs();

            if (this._positions && this._indices) {

                var gl = this.scene.canvas.gl;

                var arrays = xeogl.math.buildPickTriangles(this._positions, this._indices);

                var pickPositions = arrays.positions;
                var pickColors = arrays.colors;

                this._pickPositions = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickPositions, pickPositions.length, 3, this._state.usage);
                this._pickColors = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickColors, pickColors.length, 4, this._state.usage);

                var memoryStats = xeogl.stats.memory;

                memoryStats.positions += this._pickPositions.numItems;
                memoryStats.colors += this._pickColors.numItems;
            }

            this._pickVBOsDirty = false;
        },

        _destroyPickVBOs: function () {

            var memoryStats = xeogl.stats.memory;

            if (this._pickPositions) {
                this._pickPositions.destroy();
                memoryStats.positions -= this._pickPositions.numItems;
                this._pickPositions = null;
            }

            if (this._pickColors) {
                this._pickColors.destroy();
                memoryStats.colors -= this._pickColors.numItems;
                this._pickColors = null;
            }

            this._pickVBOsDirty = true;
        },


        _props: {

            /**
             * The Geometry's usage type.
             *
             * Accepted values are 'static', 'dynamic' and 'stream'.
             *
             * Fires a {{#crossLink "Geometry/usage:event"}}{{/crossLink}} event on change.
             *
             * @property usage
             * @default "triangles"
             * @type String
             */
            usage: {

                set: function (value) {

                    value = value || "static";

                    if (value === this._state.usageName) {
                        return;
                    }

                    var gl = this.scene.canvas.gl;

                    switch (value) {

                        case "static":
                            this._state.usage = gl.STATIC_DRAW;
                            break;

                        case "dynamic":
                            this._state.usage = gl.DYNAMIC_DRAW;
                            break;

                        case "stream":
                            this._state.usage = gl.STREAM_DRAW;
                            break;

                        default:
                            this.error("Unsupported value for 'usage': '" + value +
                                "' - supported values are 'static', 'dynamic' and 'stream'.");
                            this._state.usage = gl.STREAM_DRAW;
                            value = "static";
                    }

                    this._state.usageName = value;

                    this._positionsDirty = true;
                    this._colorsDirty = true;
                    this._normalsDirty = true;
                    this._uvDirty = true;
                    this._tangentsDirty = true;
                    this._indicesDirty = true;

                    this._scheduleGeometryUpdate();

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/usage:property"}}{{/crossLink}} property changes.
                     * @event usage
                     * @type String
                     * @param value The property's new value
                     */
                    this.fire("usage", this._state.usageName);
                },

                get: function () {
                    return this._state.usageName;
                }
            },

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

                    var state = this._state;
                    var gl = this.scene.canvas.gl;

                    if (value === state.primitiveName) {
                        return;
                    }

                    switch (value) {

                        case "points":
                            state.primitive = gl.POINTS;
                            break;

                        case "lines":
                            state.primitive = gl.LINES;
                            break;

                        case "line-loop":
                            state.primitive = gl.LINE_LOOP;
                            break;

                        case "line-strip":
                            state.primitive = gl.LINE_STRIP;
                            break;

                        case "triangles":
                            state.primitive = gl.TRIANGLES;
                            break;

                        case "triangle-strip":
                            state.primitive = gl.TRIANGLE_STRIP;
                            break;

                        case "triangle-fan":
                            state.primitive = gl.TRIANGLE_FAN;
                            break;

                        default:
                            this.error("Unsupported value for 'primitive': '" + value +
                                "' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', " +
                                "'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.");

                            state.primitive = gl.TRIANGLES;

                            value = "triangles";
                    }

                    this._state.primitiveName = value;

                    this._hashDirty = true;
                    this._renderer.imageDirty = true;

                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property changes.
                     * @event primitive
                     * @type String
                     * @param value The property's new value
                     */
                    this.fire("primitive", this._state.primitiveName);
                },

                get: function () {
                    return this._state.primitiveName;
                }
            },

            /**
             * The Geometry's positions array.
             *
             * This property is a one-dimensional, flattened array - use  {{#crossLink "xeogl.math/flatten:method"}}{{/crossLink}} to
             * convert two-dimensional arrays for assignment to this property.
             *
             * Fires a {{#crossLink "Geometry/positions:event"}}{{/crossLink}} event on change.
             *
             * @property positions
             * @default null
             * @type Float32Array
             */
            positions: {

                set: function (value) {
                    this.setPositions(value, 0);
                },

                get: function () {
                    if (this._updateScheduled) {
                        this._doUpdate();
                    }
                    return this._positions;
                }
            },

            /**
             * The Geometry's vertex normal vectors array.
             *
             * Fires a {{#crossLink "Geometry/normals:event"}}{{/crossLink}} event on change.
             *
             * @property normals
             * @default null
             * @type Float32Array
             */
            normals: {

                set: function (value) {
                    this.setNormals(value, 0);
                },

                get: function () {
                    if (this._updateScheduled) {
                        this._doUpdate();
                    }
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
             * @type Float32Array
             */
            uv: {

                set: function (value) {
                    this.setUVs(value, 0);
                },

                get: function () {
                    if (this._updateScheduled) {
                        this._doUpdate();
                    }
                    return this._uvs;
                }
            },

            /**
             * The Geometry's vertex colors array.
             *
             * Fires a {{#crossLink "Geometry/colors:event"}}{{/crossLink}} event on change.
             *
             * @property colors
             * @default null
             * @type Float32Array
             */
            colors: {

                set: function (value) {
                    this.setColors(value, 0);
                },

                get: function () {
                    if (this._updateScheduled) {
                        this._doUpdate();
                    }
                    return this._colors;
                }
            },

            /**
             * The Geometry's indices array.
             *
             * If ````xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]```` is true, then this can be
             * a ````Uint32Array````, otherwise it needs to be a ````Uint16Array````.
             *
             * Fires a {{#crossLink "Geometry/indices:event"}}{{/crossLink}} event on change.
             *
             * @property indices
             * @default null
             * @type Uint16Array | Uint32Array
             */
            indices: {

                set: function (value) {
                    this.setIndices(value, 0);
                },

                get: function () {
                    if (this._updateScheduled) {
                        this._doUpdate();
                    }
                    return this._indices;
                }
            },

            /**
             * Local-space 3D boundary enclosing the {{#crossLink "Geometry/positions:property"}}{{/crossLink}} of this Geometry.
             *
             * The a {{#crossLink "Boundary3D"}}{{/crossLink}} is lazy-instantiated the first time that this
             * property is referenced. If {{#crossLink "Component/destroy:method"}}{{/crossLink}} is then called on it,
             * then this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time it's referenced.
             *
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} will fire an {{#crossLink "Boundary3D/updated:event"}}{{/crossLink}}
             * event whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} are updated.
             *
             * @property localBoundary
             * @type Boundary3D
             * @final
             */
            localBoundary: {

                get: function () {

                    if (!this._localBoundary) {

                        var self = this;

                        //this._setBoundaryDirty();

                        this._localBoundary = new xeogl.Boundary3D(this.scene, {

                            // Inject callbacks through which this Geometry
                            // can manage caching for the boundary

                            getDirty: function () {
                                if (self._boundaryDirty) {
                                    self._boundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getPositions: function () {

                                if (self._updateScheduled || self._geometryUpdateScheduled) {
                                    self._doUpdate();
                                }

                                return self._positions;
                            }
                        });

                        this._localBoundary.on("destroyed",
                            function () {
                                self._localBoundary = null;
                            });
                    }

                    return this._localBoundary;
                }
            },

            /**
             * Set true to make this Geometry automatically generate {{#crossLink "Geometry/normals:property"}}{{/crossLink}} from
             * {{#crossLink "Geometry/positions:property"}}{{/crossLink}} and {{#crossLink "Geometry/indices:property"}}{{/crossLink}}.
             *
             * When true, causes this Geometry to auto-generate its {{#crossLink "Geometry/normals:property"}}{{/crossLink}} on the
             * next {{#crossLink "Scene"}}{{/crossLink}} {{#crossLink "Scene/tick:event"}}{{/crossLink}} event.
             *
             * Fires an {{#crossLink "Geometry/autoNormals:event"}}{{/crossLink}} event on change.
             *
             * @property autoNormals
             * @default  false
             * @type Boolean
             */
            autoNormals: {

                set: function (value) {

                    value = !!value;

                    if (this._state.autoNormals === value) {
                        return;
                    }

                    this._state.autoNormals = value;

                    this._normalsDirty = true;

                    this._scheduleGeometryUpdate();

                    this._hashDirty = true;
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/autoNormals:property"}}{{/crossLink}} property changes.
                     * @event autoNormals
                     * @type Boolean
                     * @param value The property's new value
                     */
                    this.fire("autoNormals", this._state.autoNormals);
                },

                get: function () {
                    return this._state.autoNormals;
                }
            }
        },

        /**
         Sets this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}}.

         @param positions {Float32Array} Flattened array of updated positions.
         @param [offset=0] {Number}
         */
        setPositions: function (positions, offset) {

            var dirty = (!this._positions !== !positions);

            if (positions && positions.length === 0) {
                positions = null;
            }

            if (!positions) {
                this._positions = null;

            } else {

                positions = positions.constructor === Float32Array ? positions : new Float32Array(positions);

                if (offset !== null && offset !== undefined) {

                    if (offset < 0) {
                        this.error("setPositions - negative offset not allowed");
                        return;
                    }

                    if (this._positions && (offset + positions.length) <= this._positions.length) {
                        this._positions.set(positions, offset);

                    } else {
                        if (!this._positions) {
                            this._positions = positions;

                        } else {
                            this._positions = (offset === 0) ? positions : xeogl._concat(this._positions.slice(0, offset), positions);
                        }
                    }

                } else {
                    this._positions = positions;
                }
            }

            this._positionsUpdate = positions;
            this._positionsUpdateOffset = offset;
            this._positionsDirty = true;

            this._scheduleGeometryUpdate();

            //    this._setBoundaryDirty();

            if (dirty) {
                this._hashDirty = true;
                this.fire("dirty", true);
            }

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} property changes.
             * @event positions
             * @param value The property's new value
             */
            this.fire("positions", this._positions);

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/localBoundary:property"}}{{/crossLink}} property changes.
             *
             * Note that this event does not carry the value of the property. In order to avoid needlessly
             * calculating unused values for this property, it will be lazy-calculated next time it's referenced
             * on this Geometry.
             *
             * @event positions
             * @param value The property's new value
             */
            this.fire("localBoundary", true);

            this._renderer.imageDirty = true;
        },

        /**
         * Fast method to insert elements into this Geometry's {{#crossLink "Geometry/normals:property"}}{{/crossLink}}.
         *
         * @param normals
         * @param offset
         */
        setNormals: function (normals, offset) {

            var dirty = (!this._normals !== !normals);

            if (normals && normals.length === 0) {
                normals = null;
            }

            if (!normals) {
                this._normals = null;

            } else {

                normals = normals.constructor === Float32Array ? normals : new Float32Array(normals);

                if (offset !== null && offset !== undefined) {

                    if (offset < 0) {
                        this.error("setNormals - negative offset not allowed");
                        return;
                    }

                    if (this._normals && (offset + normals.length) <= this._normals.length) {
                        this._normals.set(normals, offset);

                    } else {
                        if (!this._normals) {
                            this._normals = normals;

                        } else {
                            this._normals = (offset === 0) ? normals : xeogl._concat(this._normals.slice(0, offset), normals);
                        }
                    }

                } else {
                    this._normals = normals;
                }
            }

            this._normalsUpdate = normals;
            this._normalsUpdateOffset = offset;
            this._normalsDirty = true;

            this._scheduleGeometryUpdate();

            if (dirty) {
                this._hashDirty = true;
                this.fire("dirty", true);
            }

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/normals:property"}}{{/crossLink}} property changes.
             * @event normals
             * @param value The property's new value
             */
            this.fire("normals", this._normals);

            this._renderer.imageDirty = true;
        },

        /**
         * Fast method to insert elements into this Geometry's {{#crossLink "Geometry/uvs:property"}}{{/crossLink}}.
         *
         * @param uvs
         * @param offset
         */
        setUVs: function (uvs, offset) {

            var dirty = (!this._uvs !== !uvs);

            if (uvs && uvs.length === 0) {
                uvs = null;
            }

            if (!uvs) {
                this._uvs = null;

            } else {

                uvs = uvs.constructor === Float32Array ? uvs : new Float32Array(uvs);

                if (offset !== null && offset !== undefined) {

                    if (offset < 0) {
                        this.error("setUvs - negative offset not allowed");
                        return;
                    }

                    if (this._uvs && (offset + uvs.length) <= this._uvs.length) {
                        this._uvs.set(uvs, offset);

                    } else {
                        if (!this._uvs) {
                            this._uvs = uvs;

                        } else {
                            this._uvs = (offset === 0) ? uvs : xeogl._concat(this._uvs.slice(0, offset), uvs);
                        }
                    }

                } else {
                    this._uvs = uvs;
                }
            }

            this._uvsUpdate = uvs;
            this._uvsUpdateOffset = offset;
            this._uvsDirty = true;

            this._scheduleGeometryUpdate();

            if (dirty) {
                this._hashDirty = true;
                this.fire("dirty", true);
            }

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/uvs:property"}}{{/crossLink}} property changes.
             * @event uvs
             * @param value The property's new value
             */
            this.fire("uvs", this._uvs);

            this._renderer.imageDirty = true;
        },

        /**
         * Fast method to insert elements into this Geometry's {{#crossLink "Geometry/colors:property"}}{{/crossLink}}.
         *
         * @param colors
         * @param offset
         */
        setColors: function (colors, offset) {

            var dirty = (!this._colors !== !colors);

            if (colors && colors.length === 0) {
                colors = null;
            }

            if (!colors) {
                this._colors = null;

            } else {

                colors = colors.constructor === Float32Array ? colors : new Float32Array(colors);

                if (offset !== null && offset !== undefined) {

                    if (offset < 0) {
                        this.error("setColors - negative offset not allowed");
                        return;
                    }

                    if (this._colors && (offset + colors.length) <= this._colors.length) {
                        this._colors.set(colors, offset);

                    } else {
                        if (!this._colors) {
                            this._colors = colors;

                        } else {
                            this._colors = (offset === 0) ? colors : xeogl._concat(this._colors.slice(0, offset), colors);
                        }
                    }

                } else {
                    this._colors = colors;
                }
            }

            this._colorsUpdate = colors;
            this._colorsUpdateOffset = offset;
            this._colorsDirty = true;

            this._scheduleGeometryUpdate();

            if (dirty) {
                this._hashDirty = true;
                this.fire("dirty", true);
            }

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/colors:property"}}{{/crossLink}} property changes.
             * @event colors
             * @param value The property's new value
             */
            this.fire("colors", this._colors);

            this._renderer.imageDirty = true;
        },

        /**
         Sets this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}}.

         @param indices {Int16Array} Flattened array of updated indices.
         @param [offset=0] {Number}
         */
        setIndices: function (indices, offset) {

            if (indices && indices.length === 0) {
                indices = undefined;
            }

            var bigIndicesSupported = xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];

            if (indices) {
                if (!bigIndicesSupported && indices.constructor === Uint32Array) {
                    this.error("This WebGL implementation does not support Uint32Array");
                    return;
                }
            }

            var IndexArrayType = bigIndicesSupported ? Uint32Array : Uint16Array;

            var dirty = (!this._indices !== !indices);

            if (!indices) {
                this._indices = null;

            } else {

                indices = (indices.constructor === Uint32Array || indices.constructor === Uint16Array) ? indices : new IndexArrayType(indices);

                if (offset !== null && offset !== undefined) {

                    if (offset < 0) {
                        this.error("setIndices - negative offset not allowed");
                        return;
                    }

                    if (this._indices && (offset + indices.length) <= this._indices.length) {
                        this._indices.set(indices, offset);

                    } else {
                        if (!this._indices) {
                            this._indices = indices;

                        } else {
                            this._indices = (offset === 0) ? indices : xeogl._concat(this._indices.slice(0, offset), indices);
                        }
                    }

                } else {
                    this._indices = indices;
                }
            }

            this._indicesUpdate = indices;
            this._indicesUpdateOffset = offset;
            this._indicesDirty = true;

            this._scheduleGeometryUpdate();

            // this._setBoundaryDirty();

            if (dirty) {
                this._hashDirty = true;
                this.fire("dirty", true);
            }

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}} property changes.
             * @event indices
             * @param value The property's new value
             */
            this.fire("indices", this._indices);

            /**
             * Fired whenever this Geometry's {{#crossLink "Geometry/localBoundary:property"}}{{/crossLink}} property changes.
             *
             * Note that this event does not carry the value of the property. In order to avoid needlessly
             * calculating unused values for this property, it will be lazy-calculated next time it's referenced
             * on this Geometry.
             *
             * @event indices
             * @param value The property's new value
             */
            this.fire("localBoundary", true);

            this._renderer.imageDirty = true;
        },

        _setBoundaryDirty: function () {

            if (this._boundaryDirty) {
                return;
            }

            this._boundaryDirty = true;

            if (this._localBoundary) {
                this._localBoundary.fire("updated", true);
            }
        },

        _compile: function () {

            if (this._updateScheduled || this._geometryUpdateScheduled) {
                this._doUpdate();
            }

            if (this._hashDirty) {
                this._makeHash();
                this._hashDirty = false;
            }

            this._renderer.geometry = this._state;
        },

        _makeHash: function () {

            var state = this._state;

            var hash = ["/g"];

            hash.push("/" + state.primitive + ";");

            if (state.positions) {
                hash.push("p");
            }

            if (state.colors) {
                hash.push("c");
            }

            if (state.normals || state.autoNormals) {
                hash.push("n");
            }

            if (state.uv) {
                hash.push("u");
            }

            // TODO: Tangents

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            if (this._updateScheduled || this._geometryUpdateScheduled) {
                this._doUpdate();
            }

            var json = {
                primitive: this._state.primitiveName
            };

            var vecToArray = xeogl.math.vecToArray;

            if (this._positions) {
                json.positions =  vecToArray(this._positions);
            }

            if (this._uvs) {
                json.uv =  vecToArray(this._uvs);
            }

            if (this._colors) {
                json.colors =  vecToArray(this._colors);
            }

            if (this._indices) {
                json.indices =  vecToArray(this._indices);
            }

            if (this._state.autoNormals) {
                json.autoNormals = true;
            } else {
                json.normals = vecToArray(this._normals);
            }

            return json;
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

            if (this._state.indices) {
                this._state.indices.destroy();
            }

            // Destroy lazy-generated VBOs

            if (this._tangents) {
                this._tangents.destroy();
            }

            if (this._pickPositions) {
                this._pickPositions.destroy();
            }

            if (this._pickColors) {
                this._pickColors.destroy();
            }

            // Destroy boundary

            if (this._localBoundary) {
                this._localBoundary.destroy();
            }

            // Destroy state

            this._state.destroy();

            // Decrement geometry statistic

            xeogl.stats.memory.meshes--;
        }
    });
})();