/**
 A **Heightmap** extends {{#crossLink "Geometry"}}{{/crossLink}} to define a height mapped geometry for attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <a href="../../examples/#geometry_primitives_heightmap"><img src="../../assets/images/screenshots/HeightmapGeometry.png"></img></a>

 ## Overview

 * A HeightmapGeometry is a grid shape, to which the Y-axis is perpendicular.
 * The height of each vertex on the Y-axis is determined by the image file referenced by the HeightmapGeometry's {{#crossLink "HeightmapGeometry/src:property"}}{{/crossLink}} property.
 * Set the {{#crossLink "HeightmapGeometry/src:property"}}{{/crossLink}} property to a different image file at any time, to regenerate the HeightmapGeometry's mesh from the new image.
 * Also dynamically modify it's shape at any time by updating its {{#crossLink "HeightmapGeometry/center:property"}}{{/crossLink}}, {{#crossLink "HeightmapGeometry/xSize:property"}}{{/crossLink}}, {{#crossLink "HeightmapGeometry/ySize:property"}}{{/crossLink}}, {{#crossLink "HeightmapGeometry/zSize:property"}}{{/crossLink}}, {{#crossLink "HeightmapGeometry/xSegments:property"}}{{/crossLink}},  {{#crossLink "HeightmapGeometry/zSegments:property"}}{{/crossLink}} and
 {{#crossLink "Geometry/autoNormals:property"}}{{/crossLink}} properties.
 * Dynamically switch its primitive type between ````"points"````, ````"lines"```` and ````"triangles"```` at any time by
 updating its {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property.
 * Leave its {{#crossLink "Geometry/autoNormals:property"}}{{/crossLink}} property ````true```` to make it automatically generate its vertex normal vectors.

 ## Examples

 * [Textured HeightmapGeometry](../../examples/#geometry_primitives_heightmap)

 ## Usage

 ````javascript
 new xeogl.Entity({
     geometry: new xeogl.HeightmapGeometry({
         primitive: "triangles",
         src: "textures/height/mountain.png",
         center: [0,0,0],
         xSize: 10,
         ySize: 5,
         zSize: 10,
         xSegments: 70,
         zSegments: 70,
         lod: 1.0, // Default
         autoNormals: true // Default
     }),
     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
             src: "textures/diffuse/uvGrid2.jpg"
         }),
         backfaces: true // So that we can see the faces from underneath
     })
 });
 ````

 @class HeightmapGeometry
 @module xeogl
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Heightmap in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Heightmap.
 @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
 @param [cfg.src=undefined] {String} Path to an image file to source this Heightmap from.
 @param [cfg.image=undefined] {HTMLImageElement} An HTML DOM Image object to source this Heightmap from.
 @param [cfg.center] {Float32Array} 3D point indicating the center position of the BoxGeometry.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.ySize=0.25] {Number} Dimension on the Y-axis.
 @param [cfg.zSize=1] {Number} Dimension (height) on the Z-axis.
 @param [cfg.xSegments=1] {Number} Number of segments on the X-axis (width).
 @param [cfg.zSegments=1] {Number} Number of segments on the Z-axis (depth).
 @param [cfg.autoNormals=true] {Boolean} Automatically generate vertex normal vectors when true.
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.HeightmapGeometry = xeogl.Geometry.extend({

        type: "xeogl.HeightmapGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this._image = null; // Cached HTML image element
            this._imageData = null; // Cached image data

            this._srcDirty = false;
            this._imageDirty = false;
            this._geometryDirty = false;

            // Set component properties

            //  this.autoNormals = true;

            if (cfg.src) {
                this.src = cfg.src;

            } else if (cfg.image) {
                this.image = cfg.image;
            }

            this.center = cfg.center;

            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;
            this.zSize = cfg.zSize;

            this.xSegments = cfg.xSegments;
            this.zSegments = cfg.zSegments;

            this.lod = cfg.lod;

            this.autoNormals = cfg.autoNormals !== false;
        },

        /**
         * Implement protected virtual template method {{#crossLink "Geometry/method:_update"}}{{/crossLink}},
         * to generate geometry data arrays.
         *
         * @protected
         */
        _update: function () {

            if (this._srcDirty) {

                // src has updated

                if (this._src) {

                    // Load new image file

                    this._loadSrc(this._src);

                    // Now need to get image data

                    this._srcDirty = false;
                    this._imageDirty = true;

                    return;
                }
            }

            if (this._imageDirty) {

                // Image data has updated

                if (!this._image) {
                    return;
                }

                var element = window.document.createElement('canvas');
                element.width = this._image.width;
                element.height = this._image.height;
                var ctx = element.getContext("2d");
                ctx.drawImage(this._image, 0, 0);
                this._imageData = ctx.getImageData(0, 0, this._image.width, this._image.height).data;
                //   element.parentNode.removeChild(element);

                // Now need to rebuild geometry

                this._imageDirty = false;
                this._geometryDirty = true;
            }

            if (this._geometryDirty) {

                // Geometry needs rebuild

                if (!this._image || !this._imageData) {
                    return;
                }

                var xCenter = this._center[0];
                var yCenter = this._center[1];
                var zCenter = this._center[2];

                var imageWidth = this._image.width;
                var imageHeight = this._image.height;

                var xSegments = Math.floor(this._lod * this._xSegments);
                var zSegments = Math.floor(this._lod * this._zSegments);

                if (xSegments < 4) {
                    xSegments = 4;
                }

                if (zSegments < 4) {
                    zSegments = 4;
                }

                var width = this._xSize;
                var height = this._ySize;
                var depth = this._zSize;

                var halfWidth = width / 2;
                var halfDepth = depth / 2;

                var gridX = Math.floor(xSegments) || 1;
                var gridZ = Math.floor(zSegments) || 1;

                var gridX1 = gridX + 1;
                var gridZ1 = gridZ + 1;

                var segmentWidth = width / gridX;
                var segmentDepth = depth / gridZ;

                var positions = new Float32Array(gridX1 * gridZ1 * 3);
                var normals = new Float32Array(gridX1 * gridZ1 * 3);
                var uvs = new Float32Array(gridX1 * gridZ1 * 2);

                var offset = 0;
                var offset2 = 0;

                var imgX;
                var imgZ;

                var x;
                var y;
                var z;

                var ix;
                var iz;

                for (iz = 0; iz < gridZ1; iz++) {

                    z = iz * segmentDepth - halfDepth;

                    for (ix = 0; ix < gridX1; ix++) {

                        x = ix * segmentWidth - halfWidth;

                        var x2 = ix * segmentWidth;
                        var z2 = iz * segmentDepth;

                        imgX = Math.round((x2 / width) * (imageWidth - 1));
                        imgZ = Math.round((z2 / depth) * (imageHeight - 1));

                        y = (this._imageData[(imageWidth * imgZ + imgX) * 4]) / 255 * height;

                        if (y == undefined || isNaN(y)) {
                            y = 0;
                        }

                        positions[offset] = x + xCenter;
                        positions[offset + 1] = y + yCenter;
                        positions[offset + 2] = -z + zCenter;

                        normals[offset + 1] = -1;

                        uvs[offset2] = (gridX - ix) / gridX;
                        uvs[offset2 + 1] = 1 - ( iz / gridZ );

                        offset += 3;
                        offset2 += 2;

                    }
                }

                offset = 0;

                var indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Array : Uint16Array )(gridX * gridZ * 6);

                for (iz = 0; iz < gridZ; iz++) {

                    for (ix = 0; ix < gridX; ix++) {

                        var a = ix + gridX1 * iz;
                        var b = ix + gridX1 * ( iz + 1 );
                        var c = ( ix + 1 ) + gridX1 * ( iz + 1 );
                        var d = ( ix + 1 ) + gridX1 * iz;

                        indices[offset] = d;
                        indices[offset + 1] = b;
                        indices[offset + 2] = a;

                        indices[offset + 3] = d;
                        indices[offset + 4] = c;
                        indices[offset + 5] = b;

                        offset += 6;
                    }
                }

                this.positions = positions;
                this.normals = null;
                this.uv = uvs;
                this.indices = indices;

                this._geometryDirty = false;

                /**
                 * Fired whenever this HeightmapGeometry has rebuilt itself after an update to the
                 * {{#crossLink "Heightmap/src:property"}}{{/crossLink}} or {{#crossLink "Heightmap/image:property"}}{{/crossLink}} properties.
                 * @event loaded
                 * @param value {Heightmap} This Heightmap
                 */
                this.fire("updated", this);
            }
        },

        _loadSrc: function (src) {

            //var task = this.scene.tasks.create({
            //    description: "Loading heightmap image"
            //});

            var self = this;

            var image = new Image();

            var spinner = this.scene.canvas.spinner;
            var spinnerTextures = spinner.textures;

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = xeogl.renderer.ensureImageSizePowerOfTwo(image);

                    self._srcDirty = false;
                    self._imageDirty = true;
                    self._geometryDirty = true;

                    if (spinnerTextures) {
                        spinner.processes--;
                    }

                    self._needUpdate();

                    /**
                     * Fired whenever this Heightmap's  {{#crossLink "Heightmap/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    self.fire("image", self._image);
                }

                ///    task.setCompleted();
            };

            image.onerror = function () {
                //task.setFailed();
                if (spinnerTextures) {
                    spinner.processes--;
                }
            };

            if (src.indexOf("data") === 0) {

                // Image data
                image.src = src;

                if (spinnerTextures) {
                    spinner.processes++;
                }

            } else {

                // Image file
                image.crossOrigin = "Anonymous";
                image.src = src;

                if (spinnerTextures) {
                    spinner.processes++;
                }
            }
        },

        _props: {

            /**
             * The Heightmap's level-of-detail factor.
             *
             * Fires a {{#crossLink "Heightmap/lod:event"}}{{/crossLink}} event on change.
             *
             * @property lod
             * @default 1
             * @type Number
             */
            lod: {

                set: function (value) {

                    value = value !== undefined ? value : 1;

                    if (this._lod === value) {
                        return;
                    }

                    if (value < 0 || value > 1) {
                        this.warn("clamping lod to [0..1]");
                        value = value < 0 ? 0 : 1;
                    }

                    this._lod = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/lod:property"}}{{/crossLink}} property changes.
                     * @event lod
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("lod", this._lod);
                },

                get: function () {
                    return this._lod;
                }
            },

            /**
             * Indicates an HTML DOM Image object to source this Heightmap from.
             *
             * Alternatively, you could indicate the source via the
             * {{#crossLink "Heightmap/src:property"}}{{/crossLink}} property.
             *
             * Fires an {{#crossLink "Heightmap/image:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Heightmap/src:property"}}{{/crossLink}} to null.
             *
             * @property image
             * @default null
             * @type {HTMLImageElement}
             */
            image: {

                set: function (value) {

                    this._image = value ? xeogl.renderer.ensureImageSizePowerOfTwo(value) : value;
                    this._src = null;

                    this._srcDirty = false;
                    this._imageDirty = true;
                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's  {{#crossLink "Heightmap/image:property"}}{{/crossLink}} property changes.
                     * @event image
                     * @param value {HTML Image} The property's new value
                     */
                    this.fire("image", this._image);
                },

                get: function () {
                    return this._state.image;
                }
            },

            /**
             * Indicates a path to an image file to source this Heightmap from.
             *
             * Alternatively, you could indicate the source via the
             * {{#crossLink "Heightmap/image:property"}}{{/crossLink}} property.
             *
             * Fires a {{#crossLink "Heightmap/src:event"}}{{/crossLink}} event on change.
             *
             * Sets the {{#crossLink "Heightmap/image:property"}}{{/crossLink}} to null.
             *
             * @property src
             * @default null
             * @type String
             */
            src: {

                set: function (value) {

                    if (this._src && this._src === value) {
                        return;
                    }

                    this._image = null;
                    this._src = value;

                    this._srcDirty = true;
                    this._imageDirty = true;
                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/src:property"}}{{/crossLink}} property changes.
                     * @event src
                     * @param value The property's new value
                     * @type String
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            },

            /**
             * 3D point indicating the center position of this HeightmapGeometry.
             *
             * Fires an {{#crossLink "HeightmapGeometry/center:event"}}{{/crossLink}} event on change.
             *
             * @property center
             * @default [0,0,0]
             * @type {Float32Array}
             */
            center: {

                set: function (value) {

                    value = value || [0, 0, 0];

                    if (this._center) {
                        if (this._center[0] === value[0] && this._center[1] === value[1] && this._center[2] === value[2]) {
                            return;
                        }
                    }

                    (this._center = this._center || new xeogl.math.vec3()).set(value);

                    this._needUpdate();

                    /**
                     Fired whenever this HeightmapGeometry's {{#crossLink "HeightmapGeometry/center:property"}}{{/crossLink}} property changes.
                     @event center
                     @param value {Float32Array} The property's new value
                     */
                    this.fire("center", this._center);
                },

                get: function () {
                    return this._center;
                }
            },

            /**
             * The Heightmap's dimension on the X-axis.
             *
             * Fires a {{#crossLink "Heightmap/xSize:event"}}{{/crossLink}} event on change.
             *
             * @property xSize
             * @default 1
             * @type Number
             */
            xSize: {

                set: function (value) {

                    value = value || 1;

                    if (this._xSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSize = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/xSize:property"}}{{/crossLink}} property changes.
                     * @event xSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSize", this._xSize);
                },

                get: function () {
                    return this._xSize;
                }
            },

            /**
             * The Heightmap's dimension on the Y-axis.
             *
             * Fires a {{#crossLink "Heightmap/ySize:event"}}{{/crossLink}} event on change.
             *
             * @property ySize
             * @default 0.25
             * @type Number
             */
            ySize: {

                set: function (value) {

                    value = value || 0.25;

                    if (this._ySize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative ySize not allowed - will invert");
                        value = value * -1;
                    }

                    this._ySize = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/ySize:property"}}{{/crossLink}} property changes.
                     * @event ySize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSize", this._ySize);
                },

                get: function () {
                    return this._ySize;
                }
            },

            /**
             * The Heightmap's dimension (height) on the Z-axis.
             *
             * Fires a {{#crossLink "Heightmap/zSize:event"}}{{/crossLink}} event on change.
             *
             * @property zSize
             * @default 1.0
             * @type Number
             */
            zSize: {

                set: function (value) {

                    value = value || 1.0;

                    if (this._zSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative zSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._zSize = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/zSize:property"}}{{/crossLink}} property changes.
                     * @event zSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSize", this._zSize);
                },

                get: function () {
                    return this._zSize;
                }
            },

            /**
             * The Heightmap's number of segments on the X-axis.
             *
             * Fires a {{#crossLink "Heightmap/xSegments:event"}}{{/crossLink}} event on change.
             *
             * @property xSegments
             * @default 100
             * @type Number
             */
            xSegments: {

                set: function (value) {

                    value = value || 100;

                    if (this._xSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSegments = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/xSegments:property"}}{{/crossLink}} property changes.
                     * @event xSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSegments", this._xSegments);
                },

                get: function () {
                    return this._xSegments;
                }
            },

            /**
             * The Heightmap's number of segments on the Z-axis.
             *
             * Fires a {{#crossLink "Heightmap/zSegments:event"}}{{/crossLink}} event on change.
             *
             * @property zSegments
             * @default 100
             * @type Number
             */
            zSegments: {

                set: function (value) {

                    value = value || 100;

                    if (this._zSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative zSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._zSegments = value;

                    this._geometryDirty = true;

                    this._needUpdate();

                    /**
                     * Fired whenever this Heightmap's {{#crossLink "Heightmap/zSegments:property"}}{{/crossLink}} property changes.
                     * @event zSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("zSegments", this._zSegments);
                },

                get: function () {
                    return this._zSegments;
                }
            }
        },

        _getJSON: function () {

            var json = {

                center: this._center.slice(),

                xSize: this._xSize,
                ySize: this._ySize,
                zSize: this._zSize,

                xSegments: this._xSegments,
                zSegments: this._zSegments
            };

            if (this._src) {
                json.src = this._src;

            } else if (this._image) {
                // TODO: json._image = <image data>
            }

            return json;
        }
    });

})();
