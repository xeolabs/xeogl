/**
 A **Heightmap** defines spherical geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class Heightmap
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Heightmap in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Heightmap.
 @param [cfg.radius=1] {Number}
 @param [cfg.xSize=8] {Number}
 @param [cfg.zSegments=6] {Number}
 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.Heightmap = XEO.Geometry.extend({

        type: "XEO.Heightmap",

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

            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;
            this.zSize = cfg.zSize;

            this.xSegments = cfg.xSegments;
            this.zSegments = cfg.zSegments;

            this.lod = cfg.lod;

            this.autoNormals = cfg.autoNormals !==false;
        },

        _heightmapDirty: function () {
            if (!this.__dirty) {
                this.__dirty = true;
                var self = this;
                this.scene.once("tick2",
                    function () {
                        self._buildHeightmap();
                        self.__dirty = false;
                    });
            }
        },

        _buildHeightmap: function () {

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

            //if (this._geometryDirty) {
            //
            //    var imageWidth = this._image.width;
            //    var imageHeight = this._image.height;
            //
            //    var positions = [];
            //    var uvs = [];
            //    var indices = [];
            //
            //    var width = this._xSize;
            //    var height = this._zSize;
            //
            //    var xSegments = this._xSegments;
            //    var zSegments = this._zSegments;
            //
            //    var halfWidth = width / 2;
            //    var halfHeight = height / 2;
            //
            //    var gridX = xSegments;
            //    var gridZ = zSegments;
            //
            //    var gridX1 = gridX + 1;
            //    var gridZ1 = gridZ + 1;
            //
            //    var segWidth = width / gridX;
            //    var segHeight = height / gridZ;
            //
            //    var imgX;
            //    var imgY;
            //
            //    var x;
            //    var y;
            //    var z;
            //
            //    for (var px = 0; px <= gridZ; px++) {
            //        for (var py = 0; py <= gridX; py++) {
            //
            //            x = px * segWidth;
            //            y = py * segHeight;
            //
            //            imgX = Math.round((x / width) * (imageWidth - 1));
            //            imgY = Math.round((y / height) * (imageHeight - 1));
            //
            //            z = (this._imageData[(imageWidth * imgY + imgX) * 4]) / 255 * this._ySize;
            //
            //            if (z == undefined || isNaN(z)) {
            //                z = 0;
            //            }
            //
            //            positions.push(x - halfWidth);
            //            positions.push(-y + halfHeight);
            //            positions.push(-z);
            //
            //            uvs.push(py / gridX);
            //            uvs.push(1 - px / gridZ);
            //        }
            //    }
            //
            //    var a;
            //    var b;
            //    var c;
            //    var d;
            //
            //    for (var iz = 0; iz < gridZ; iz++) {
            //        for (var ix = 0; ix < gridX; ix++) {
            //
            //            a = ix + gridX1 * iz;
            //            b = ix + gridX1 * ( iz + 1 );
            //            c = ( ix + 1 ) + gridX1 * ( iz + 1 );
            //            d = ( ix + 1 ) + gridX1 * iz;
            //
            //            if (a >= positions.length || b >= positions.length || c >= positions.length || d >= positions.length) {
            //                continue;
            //            }
            //            indices.push(a);
            //            indices.push(b);
            //            indices.push(c);
            //
            //            indices.push(c);
            //            indices.push(d);
            //            indices.push(a);
            //        }
            //    }
            //
            //    this.positions = positions;
            //    this.normals = null;
            //    //this.normals = normals;
            //    this.uv = uvs;
            //    this.indices = indices;
            //
            //    this._geometryDirty = false;
            //}
            //
            //return;

            if (this._geometryDirty) {

                // Geometry needs rebuild

                if (!this._image || !this._imageData) {
                    return;
                }

                var imageWidth = this._image.width;
                var imageHeight = this._image.height;

                var xSize = this._xSize;
                var ySize = this._ySize;
                var zSize = this._zSize;

                var xSegments = Math.floor(this._lod * this._xSegments);
                var zSegments = Math.floor(this._lod * this._zSegments);

                if (xSegments < 4) {
                    xSegments = 4;
                }

                if (zSegments < 4) {
                    zSegments = 4;
                }

                var positions = [];
                var uvs = [];
                var indices = [];

                var halfXSize = xSize / 2;
                var halfYSize = zSize / 2;

                var xSegments1 = xSegments + 1;
                var zSegments1 = zSegments + 1;

                var segWidth = xSize / xSegments;
                var segHeight = zSize / zSegments;

                var imgX;
                var imgY;

                var x;
                var y;
                var z;

                for (var px = 0; px <= zSegments; px++) {
                    for (var py = 0; py <= xSegments; py++) {

                        x = px * segWidth;
                        y = py * segHeight;

                        imgX = Math.round((x / xSize) * (imageWidth - 1));
                        imgY = Math.round((y / zSize) * (imageHeight - 1));

                        z = (this._imageData[(imageWidth * imgY + imgX) * 4]) / 255 * ySize;

                        if (z == undefined || isNaN(z)) {
                            z = 0;
                        }

                        positions.push(x - halfXSize);
                        positions.push(-y + halfYSize);
                        positions.push(-z);

                        uvs.push(py / xSegments);
                        uvs.push(1 - px / zSegments);
                    }
                }

                var a;
                var b;
                var c;
                var d;

                for (var iz = 0; iz < zSegments; iz++) {
                    for (var ix = 0; ix < xSegments; ix++) {

                        a = ix + xSegments1 * iz;
                        b = ix + xSegments1 * ( iz + 1 );
                        c = ( ix + 1 ) + xSegments1 * ( iz + 1 );
                        d = ( ix + 1 ) + xSegments1 * iz;

                        indices.push(a);
                        indices.push(b);
                        indices.push(c);

                        indices.push(c);
                        indices.push(d);
                        indices.push(a);
                    }
                }

                this.positions = positions;
                this.normals = positions;

                this.uv = uvs;
                this.indices = indices;

                this._geometryDirty = false;
            }
        },

        _loadSrc: function (src) {

            //var task = this.scene.tasks.create({
            //    description: "Loading heightmap image"
            //});

            var self = this;

            var image = new Image();

            image.onload = function () {

                if (self._src === src) {

                    // Ensure data source was not changed while we were loading

                    // Keep self._src because that's where we loaded the image
                    // from, and we may need to save that in JSON later

                    self._image = XEO.renderer.webgl.ensureImageSizePowerOfTwo(image);

                    self._srcDirty = false;
                    self._imageDirty = true;
                    self._geometryDirty = true;

                    self._heightmapDirty();

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
            };

            if (src.indexOf("data") === 0) {

                // Image data
                image.src = src;

            } else {

                // Image file
                image.crossOrigin = "Anonymous";
                image.src = src;
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

                    this._heightmapDirty();

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

                    this._image = value ? XEO.renderer.webgl.ensureImageSizePowerOfTwo(value) : value;
                    this._src = null;

                    this._srcDirty = false;
                    this._imageDirty = true;
                    this._geometryDirty = true;

                    this._heightmapDirty();

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

                    this._image = null;
                    this._src = value;

                    this._srcDirty = true;
                    this._imageDirty = true;
                    this._geometryDirty = true;

                    this._heightmapDirty();

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
             * The Heightmap's dimension (width) on the X-axis.
             *
             * Fires a {{#crossLink "Sphere/xSize:event"}}{{/crossLink}} event on change.
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

                    this._heightmapDirty();

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/xSize:property"}}{{/crossLink}} property changes.
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
             * The Heightmap's dimension (height) on the Y-axis.
             *
             * Fires a {{#crossLink "Sphere/ySize:event"}}{{/crossLink}} event on change.
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

                    this._heightmapDirty();

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/ySize:property"}}{{/crossLink}} property changes.
                     * @event ySize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("ySize", this._ySize);
                },

                get: function () {
                    return this._ySize;
                }
            },

            /**
             * The Heightmap's dimension (depth) on the Z-axis.
             *
             * Fires a {{#crossLink "Sphere/zSize:event"}}{{/crossLink}} event on change.
             *
             * @property zSize
             * @default 1
             * @type Number
             */
            zSize: {

                set: function (value) {

                    value = value || 1;

                    if (this._zSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative zSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._zSize = value;

                    this._geometryDirty = true;

                    this._heightmapDirty();

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/zSize:property"}}{{/crossLink}} property changes.
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
             * The Heightmap's number of segments on the X-axis (width).
             *
             * Fires a {{#crossLink "Sphere/xSegments:event"}}{{/crossLink}} event on change.
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

                    this._heightmapDirty();

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/xSegments:property"}}{{/crossLink}} property changes.
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
             * The Heightmap's number of segments on the Z-axis (depth).
             *
             * Fires a {{#crossLink "Sphere/zSegments:event"}}{{/crossLink}} event on change.
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

                    this._heightmapDirty();

                    /**
                     * Fired whenever this Sphere's {{#crossLink "Sphere/zSegments:property"}}{{/crossLink}} property changes.
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
