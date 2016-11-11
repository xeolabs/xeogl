/**
 A **Geometry** defines the geometric shape of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_triangles_texture"><img src="../../assets/images/screenshots/BoxGeometry.png"></img></a>

 ## Overview

 <ul>
 <li>Like everything in xeogl, all properties on a Geometry are dynamically editable.</li>
 <li>When no shape is specified, a Geometry will be a 2x2x2 box by default.</li>
 <li>A {{#crossLink "Scene"}}{{/crossLink}} provides a 2x2x2 box for {{#crossLink "Entity"}}Entities{{/crossLink}}
 default to when they are not configured with a Geometry.</li>
  <li>A Geometry provides its local-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/Geometry.png"></img>

 ## Examples

 <ul>
 <li>[Simple triangle mesh](../../examples/#geometry_triangles)</li>
 <li>[Triangle mesh with diffuse texture](../../examples/#geometry_triangles_texture)</li>
 <li>[Triangle mesh with vertex colors](../../examples/#geometry_triangles_vertexColors)</li>
 <li>[Wireframe box](../../examples/#geometry_lines)</li>
 <li>[Dynamically modifying a TorusGeometry](../../examples/#geometry_modifying)</li>
 </ul>

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
 customGeometry.indices = [
 2, 1, 0,
 3, 2, 0
 ];
 ````

 Now let's make it wireframe by changing its primitive type from ````triangles```` to ````lines````:

 ````javascript
 quadGeometry.primitive = "lines";
 ````

 ### Toggling back-faces on and off

 Now we'll attach a {{#crossLink "Modes"}}{{/crossLink}} to that last {{#crossLink "Entity"}}{{/crossLink}}, so that
 we can show or hide its {{#crossLink "Geometry"}}Geometry's{{/crossLink}} back-faces:

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

 ### Getting boundary

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
 @param [cfg.positions] {Array of Number} Positions array.
 @param [cfg.normals] {Array of Number} Normals array.
 @param [cfg.uv] {Array of Number} UVs array.
 @param [cfg.colors] {Array of Number} Vertex colors.
 @param [cfg.tangents] {Array of Number} Vertex tangents.
 @param [cfg.indices] {Array of Number} Indices array.
 @param [cfg.autoNormals] {Boolean} Set true to automatically generate normal vectors from positions and indices.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Geometry = xeogl.Component.extend({

        type: "xeogl.Geometry",

        _init: function (cfg) {

            var self = this;

            this._state = new xeogl.renderer.Geometry({

                primitive: null, // WebGL enum
                primitiveName: null, // String

                // VBOs 

                positions: null,
                colors: null,
                normals: null,
                uv: null,
                tangents: null,
                indices: null,

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

            this._positionsData = null;
            this._colorsData = null;
            this._normalsData = null;
            this._uvData = null;
            this._tangentsData = null;
            this._indicesData = null;

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

            if (defaultGeometry) {

                this.primitive = cfg.primitive;

            } else {

                var defaultLineStripGeometry = ((!cfg.primitive || cfg.primitive === "line-strip") && cfg.positions && !cfg.indices);

                if (defaultLineStripGeometry) {

                    // Line strip when only positions are given and no primitive

                    var indices = [];
                    for (var i = 0, len = cfg.positions.length / 3; i < len; i++) {
                        indices.push(i);
                    }

                    this.primitive = "line-strip";
                    this.positions = cfg.positions;
                    this.indices = indices;

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
        _scheduleUpdate: function () {
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

            switch (this._state.primitiveName) {

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

            var memoryStats = xeogl.stats.memory;

            if (this._positionsDirty) {
                if (this._state.positions) {
                    memoryStats.positions -= this._state.positions.numItems;
                    this._state.positions.destroy();
                }
                this._state.positions = this._positionsData ? new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._positionsData, this._positionsData.length, 3, usage) : null;
                if (this._state.positions) {
                    memoryStats.positions += this._state.positions.numItems;
                }
                this._positionsDirty = false;

                // Need to rebuild pick mesh now
                this._pickVBOsDirty = true;
            }

            if (this._colorsDirty) {

                if (this._state.colors) {
                    memoryStats.colors -= this._state.colors.numItems;
                    this._state.colors.destroy();
                }
                this._state.colors = this._colorsData ? new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._colorsData, this._colorsData.length, 4, usage) : null;
                if (this._state.colors) {
                    memoryStats.colors += this._state.colors.numItems;
                }
                this._colorsDirty = false;
            }

            if (this._normalsDirty) {
                if (this._state.normals) {
                    memoryStats.normals -= this._state.normals.numItems;
                    this._state.normals.destroy();
                }

                // Automatic normal generation

                if (this._autoNormals && this._positionsData && this._indicesData) {
                    this._normalsData = xeogl.math.buildNormals(this._positionsData, this._indicesData);
                }

                this._state.normals = this._normalsData ? new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._normalsData, this._normalsData.length, 3, usage) : null;
                if (this._state.normals) {
                    memoryStats.normals += this._state.normals.numItems;
                }
                this._normalsDirty = false;

                // Need to rebuild tangents
                // next time the renderer gets them from the state

                this._tangentsDirty = true;
            }

            if (this._uvDirty) {
                if (this._state.uv) {
                    memoryStats.uvs -= this._state.uv.numItems;
                    this._state.uv.destroy();
                }
                this._state.uv = this._uvData ? new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._uvData, this._uvData.length, 2, usage) : null;
                if (this._state.uv) {
                    memoryStats.uvs += this._state.uv.numItems;
                }
                this._uvDirty = false;

                // Need to rebuild tangents
                // next time the renderer gets them from the state

                this._tangentsDirty = true;
            }

            if (this._indicesDirty) {
                if (this._state.indices) {
                    memoryStats.indices -= this._state.indices.numItems;
                    this._state.indices.destroy();
                }

                this._state.indices = this._indicesData ? new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this._indicesData, this._indicesData.length, 1, usage) : null;
                if (this._state.indices) {
                    memoryStats.indices += this._state.indices.numItems;
                }
                this._indicesDirty = false;

                // Need to rebuild pick mesh next time the
                // renderer gets it from the state

                this._pickVBOsDirty = true;
            }

            this._geometryUpdateScheduled = false;

            this._setBoundaryDirty();
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

            if (!this._positionsData || !this._indicesData || !this._uvData) {
                return null;
            }

            this._tangentsData = xeogl.math.buildTangents(this._positionsData, this._indicesData, this._uvData);

            var gl = this.scene.canvas.gl;

            var usage = gl.STATIC_DRAW;

            this._tangents = this._tangentsData ?
                new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, this._tangentsData, this._tangentsData.length, 3, usage) : null;

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

            if (this._positionsData && this._indicesData) {

                var gl = this.scene.canvas.gl;

                var usage = gl.STATIC_DRAW;

                var arrays = xeogl.math.buildPickTriangles(this._positionsData, this._indicesData);

                var pickPositions = arrays.positions;
                var pickColors = arrays.colors;

                this._pickPositions = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickPositions, pickPositions.length, 3, usage);
                this._pickColors = new xeogl.renderer.webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickColors, pickColors.length, 4, usage);

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
             * Valid types are: 'static', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
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

                    if (value !== "static" && value !== "dynamic" && value !== "stream") {

                        this.error("Unsupported value for 'usage': '" + value +
                            "' - supported values are 'static', 'dynamic' and 'stream'.");

                        value = "static";
                    }

                    this._state.usageName = value;

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

                    if (value !== "points" &&
                        value !== "lines" &&
                        value !== "line-loop" &&
                        value !== "line-strip" &&
                        value !== "triangles" &&
                        value !== "triangle-strip" &&
                        value !== "triangle-fan") {

                        this.error("Unsupported value for 'primitive': '" + value +
                            "' - supported values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', " +
                            "'triangle-strip' and 'triangle-fan'. Defaulting to 'triangles'.");

                        value = "triangles";
                    }

                    if (this._state.primitiveName === value) {
                        return;
                    }

                    this._state.primitiveName = value;

                    this._scheduleGeometryUpdate();

                    this._hashDirty = true;

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
             * This property is a one-dimensional array - use  {{#crossLink "xeogl.math/flatten:method"}}{{/crossLink}} to
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

                    // Only recompile when adding or removing this property, not when modifying
                    var dirty = (!this._positionsData !== !value);

                    if (value && value.constructor != Float32Array) {
                        value = new Float32Array(value);
                    }

                    this._positionsData = value;
                    this._positionsDirty = true;

                    this._scheduleGeometryUpdate();

                    if (dirty) {
                        this._hashDirty = true;
                        this.fire("dirty", true);
                    }

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} property changes.
                     * @event positions
                     * @param value The property's new value
                     */
                    this.fire("positions", this._positionsData);

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

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._positionsData;
                }
            },

            /**
             * The Geometry's normal vectors array.
             *
             * Fires a {{#crossLink "Geometry/normals:event"}}{{/crossLink}} event on change.
             *
             * @property normals
             * @default null
             * @type Float32Array
             */
            normals: {

                set: function (value) {

                    // Only recompile when adding or removing this property, not when modifying
                    var dirty = (!this._normalsData !== !value);

                    if (value && value.constructor != Float32Array) {
                        value = new Float32Array(value);
                    }

                    this._normalsData = value;
                    this._normalsDirty = true;

                    this._scheduleGeometryUpdate();

                    if (dirty) {
                        this._hashDirty = true;
                        this.fire("dirty", true);
                    }

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/ normals:property"}}{{/crossLink}} property changes.
                     * @event  normals
                     * @param value The property's new value
                     */
                    this.fire(" normals", this._normalsData);

                    this._renderer.imageDirty = true;
                },

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._normalsData;
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

                    // Only recompile when adding or removing this property, not when modifying
                    var dirty = (!this._uvData !== !value);

                    if (value && value.constructor != Float32Array) {
                        value = new Float32Array(value);
                    }

                    this._uvData = value;
                    this._uvDirty = true;

                    this._scheduleGeometryUpdate();

                    if (dirty) {
                        this._hashDirty = true;
                        this.fire("dirty", true);
                    }

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/uv:property"}}{{/crossLink}} property changes.
                     * @event uv
                     * @param value The property's new value
                     */
                    this.fire("uv", this._uvData);

                    this._renderer.imageDirty = true;
                },

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._uvData;
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

                    // Only recompile when adding or removing this property, not when modifying
                    var dirty = (!this._colorsData !== !value);

                    if (value && value.constructor != Float32Array) {
                        value = new Float32Array(value);
                    }

                    this._colorsData = value;
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
                    this.fire("colors", this._colorsData);

                    this._renderer.imageDirty = true;
                },

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._colorsData;
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

                    // Only recompile when adding or removing this property, not when modifying
                    var dirty = (!this._indicesData && !value);

                    if (value) {

                        var bigIndicesSupported = xeogl.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"];

                        if (!bigIndicesSupported && value.constructor === Uint32Array) {
                            this.error("This WebGL implementation does not support Uint32Array");
                            return;
                        }

                        var IndexArrayType = bigIndicesSupported ? Uint32Array : Uint16Array;

                        if (value.constructor != Uint16Array && value.constructor != Uint32Array) {
                            value = new IndexArrayType(value);
                        }
                    }

                    this._indicesData = value;
                    this._indicesDirty = true;

                    this._scheduleGeometryUpdate();

                    if (dirty) {
                        this._hashDirty = true;
                        this.fire("dirty", true);
                    }

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}} property changes.
                     * @event indices
                     * @param value The property's new value
                     */
                    this.fire("indices", this._indicesData);

                    this._renderer.imageDirty = true;
                },

                get: function () {

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

                    return this._indicesData;
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

                                return self._positionsData;
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

                    if (this._autoNormals === value) {
                        return;
                    }

                    this._autoNormals = value;

                    this._normalsDirty = true;

                    this._scheduleGeometryUpdate();

                    /**
                     * Fired whenever this Geometry's {{#crossLink "Geometry/autoNormals:property"}}{{/crossLink}} property changes.
                     * @event autoNormals
                     * @type Boolean
                     * @param value The property's new value
                     */
                    this.fire("autoNormals", this._autoNormals);
                },

                get: function () {
                    return this._autoNormals;
                }
            }
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
                hash.push("0");
            }

            if (state.colors) {
                hash.push("1");
            }

            if (state.normals) {
                hash.push("2");
            }

            if (state.uv) {
                hash.push("3");
            }

            // TODO: Tangents

            hash.push(";");

            state.hash = hash.join("");
        },

        _getJSON: function () {

            if (this._updateScheduled || this._geometryUpdateScheduled) {
                this._doUpdate();
            }

            return {
                primitive: this._state.primitiveName,
                positions: this._positionsData,
                normals: this._normalsData,
                uv: this._uvData,
                colors: this._colorsData,
                indices: this._indicesData
            };
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

            if (this._tangentsData) {
                this._tangentsData.destroy();
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
