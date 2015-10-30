/**
 A **Picker** configures the WebGL color buffer for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>A Picker configures **the way** that pixels are written to the WebGL color buffer.</li>
 <li>Picker is not to be confused with {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, which stores rendered pixel
 colors for consumption by {{#crossLink "Texture"}}Textures{{/crossLink}}, used when performing *render-to-texture*.</li>

 </ul>

 <img src="../../../assets/images/Picker.png"></img>

 ## Example

 In this example we're configuring the WebGL color buffer for a {{#crossLink "GameObject"}}{{/crossLink}}.

 This example scene contains:

 <ul>
 <li>a Picker that enables blending and sets the color mask,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var picker = new XEO.Picker(scene, {
    blendEnabled: true,
    colorMask: [true, true, true, true]
});

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var gameObject = new XEO.GameObject(scene, {
    picker: picker,
    geometry: geometry
});
 ````

 @class Picker
 @module XEO
 @submodule rendering
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Picker within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Picker configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Picker.
 @param [cfg.blendEnabled=false] {Boolean} Indicates if blending is enabled.
 @param [cfg.colorMask=[true, true, true, true]] {Array of Boolean} The color mask,
 @extends Component
 */
(function () {

    "use strict";

    XEO.Picker = XEO.Component.extend({

        type: "XEO.Picker",

        _init: function (cfg) {

            this._object = null;
            this._canvasCoords = [];
            this._origin = null;
            this._dir = null;

            this._a = XEO.math.vec3();
            this._b = XEO.math.vec3();
            this._c = XEO.math.vec3();

            this._indices = null;
            this._position = null;
            this._worldPos = null;
            this._barycentric = null;
            this._primitiveIndex = null;

            this._na = XEO.math.vec3();
            this._nb = XEO.math.vec3();
            this._nc = XEO.math.vec3();

            this._uva = XEO.math.vec3();
            this._uvb = XEO.math.vec3();
            this._uvc = XEO.math.vec3();

            this._tempMat4 = XEO.math.mat4();
            this._tempMat4b = XEO.math.mat4();

            this._tempVec4 = XEO.math.vec4();
            this._tempVec4b = XEO.math.vec4();
            this._tempVec4c = XEO.math.vec4();

            this._tempVec3 = XEO.math.vec3();
            this._tempVec3b = XEO.math.vec3();
            this._tempVec3c = XEO.math.vec3();
            this._tempVec3d = XEO.math.vec3();
            this._tempVec3e = XEO.math.vec3();
            this._tempVec3f = XEO.math.vec3();
            this._tempVec3g = XEO.math.vec3();
            this._tempVec3h = XEO.math.vec3();
            this._tempVec3i = XEO.math.vec3();
            this._tempVec3j = XEO.math.vec3();

            this._objectDirty = false;
            this._triangleDirty = false;
            this._positionDirty = false;
            this._barycentricDirty = false;
            this._normalDirty = false;
            this._uvDirty = false;

            if (cfg.canvasPos !== undefined) {
                this.canvasPos = cfg.canvasPos;
            }

            if (cfg.origin !== undefined) {
                this.origin = cfg.origin;
            }

            if (cfg.dir !== undefined) {
                this.dir = cfg.dir;
            }
        },

        _setObjectDirty: function () {
            this._objectDirty = true;
            this._triangleDirty = true;
            this._positionDirty = true;
            this._barycentricDirty = true;
            this._normalDirty = true;
            this._uvDirty = true;
        },

        _updateObject: function () {

            // TODO

            this._objectDirty = false;
        },

        _updateTriangle: function () {

            if (this._objectDirty) {
                this._updateObject();
            }

            // TODO

            this._triangleDirty = false;
        },

        _updatePosition: function () {

            if (this._triangleDirty) {
                this._updateTriangle();
            }

            this._positionDirty = false;
        },

        _updateBarycentric: function () {

            if (this._positionDirty) {
                this._updatePosition();
            }

            // TODO: Calc bary

            this._barycentricDirty = false;
        },

        _updateNormal: function () {

            if (this._barycentricDirty) {
                this._updateBarycentric();
            }

            var normals = this._object.geometry.normals;

            if (normals) {

                this._na[0] = normals[(this._ia * 3)];
                this._na[1] = normals[(this._ia * 3) + 1];
                this._na[2] = normals[(this._ia * 3) + 2];

                this._nb[0] = normals[(this._ib * 3)];
                this._nb[1] = normals[(this._ib * 3) + 1];
                this._nb[2] = normals[(this._ib * 3) + 2];

                this._nc[0] = normals[(this._ic * 3)];
                this._nc[1] = normals[(this._ic * 3) + 1];
                this._nc[2] = normals[(this._ic * 3) + 2];

                var math = XEO.math;

                this._normal = math.addVec3(math.addVec3(
                        math.mulVec3Scalar(this._na, barycentric[0], this._tempVec3),
                        math.mulVec3Scalar(this._nb, barycentric[1], this._tempVec3b), this._tempVec3c),
                    math.mulVec3Scalar(this._nc, barycentric[2], this._tempVec3d), this._tempVec3e);

            } else {

                this._normal = null;
            }

            this._normalDirty = false;
        },

        _updateUV: function () {

            if (this._barycentricDirty) {
                this._updateBarycentric();
            }

            this._uvDirty = false;
        },


        // Given a GameObject and camvas coordinates, gets a ray
        // originating at the World-space eye position that passes
        // through the perspective projection plane. The ray is
        // returned via the origin and dir arguments.

        _getLocalRay: function (object, canvasCoords, origin, dir) {

            var math = XEO.math;

            var canvas = object.scene.canvas.canvas;

            var modelMat = object.transform.matrix;
            var viewMat = object.camera.view.matrix;
            var projMat = object.camera.project.matrix;

            var vmMat = math.mulMat4(viewMat, modelMat, this._tempMat4);
            var pvMat = math.mulMat4(projMat, vmMat, this._tempMat4b);
            var pvMatInverse = math.inverseMat4(pvMat, this._tempMat4b);

            //var modelMatInverse = math.inverseMat4(modelMat, tempMat4c);

            // Calculate clip space coordinates, which will be in range
            // of x=[-1..1] and y=[-1..1], with y=(+1) at top

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            var clipX = (canvasCoords[0] - canvasWidth / 2) / (canvasWidth / 2);  // Calculate clip space coordinates
            var clipY = -(canvasCoords[1] - canvasHeight / 2) / (canvasHeight / 2);

            var local1 = math.transformVec4(pvMatInverse, [clipX, clipY, -1, 1], this._tempVec4);
            local1 = math.mulVec4Scalar(local1, 1 / local1[3]);

            var local2 = math.transformVec4(pvMatInverse, [clipX, clipY, 1, 1], this._tempVec4b);
            local2 = math.mulVec4Scalar(local2, 1 / local2[3]);

            origin[0] = local1[0];
            origin[1] = local1[1];
            origin[2] = local1[2];

            math.subVec3(local2, local1, dir);
        },

        _props: {

            /**
             * Canvas coordinates.
             *
             * @property canvasCoords
             * @default null
             * @type {Array of Number}
             */
            canvasCoords: {

                set: function (value) {

                    this._canvasCoords = value;

                    this._origin = null;
                    this._dir = null;

                    this._setObjectDirty();
                },

                get: function () {
                    return this._canvasCoords;
                }
            },

            /**
             * Ray-pick origin.
             *
             * Fires an {{#crossLink "Picker/origin:event"}}{{/crossLink}} event on change.
             *
             * @property origin
             * @default null
             * @type {Array of Number}
             */
            origin: {

                set: function (value) {

                    this._origin = value;

                    this._canvasCoords = null;

                    this._setObjectDirty();
                },

                get: function () {
                    return this._origin;
                }
            },

            /**
             * Ray-pick direction.
             *
             * Fires an {{#crossLink "Picker/dir:event"}}{{/crossLink}} event on change.
             *
             * @property dir
             * @default null
             * @type {Array of Number}
             */
            dir: {

                set: function (value) {

                    this._dir = value;

                    this._canvasCoords = null;

                    this._setObjectDirty();
                },

                get: function () {
                    return this._dir;
                }
            },

            /**
             * The current picked object.
             *
             * @property object
             * @default null
             * @type Number
             */
            object: {

                get: function () {

                    if (this._objectDirty) {
                        this._updateObject();
                    }

                    return this._object;
                }
            },

            /**
             * The current picked primitiveIndex.
             *
             * @property primitiveIndex
             * @default null
             * @type Number
             */
            primitiveIndex: {

                get: function () {

                    if (this._triangleDirty) {
                        this._updateTriangle();
                    }

                    return this._primitiveIndex;
                }
            },

            /**
             * The current picked primitive type.
             *
             * @property primitive
             * @default null
             * @type String
             */
            primitive: {

                get: function () {

                    if (this._triangleDirty) {
                        this._updateTriangle();
                    }

                    return this._primitive;
                }
            },

            /**
             * The current picked indices.
             *
             * @property indices
             * @default null
             * @type {Array of Number}
             */
            indices: {

                get: function () {

                    if (this._triangleDirty) {
                        this._updateTriangle();
                    }

                    return this._indices;
                }
            },

            /**
             * The current picked position.
             *
             * @property position
             * @default null
             * @type {Array of Number}
             */
            position: {

                get: function () {

                    if (this._positionDirty) {
                        this._updatePosition();
                    }

                    return this._position;
                }
            },

            /**
             * The current picked worldPos.
             *
             * @property worldPos
             * @default null
             * @type {Array of Number}
             */
            worldPos: {

                get: function () {

                    if (this._worldPosDirty) {
                        this._updateWorldPos();
                    }

                    return this._worldPos;
                }
            },

            /**
             * The current picked viewPos.
             *
             * @property viewPos
             * @default null
             * @type {Array of Number}
             */
            viewPos: {

                get: function () {

                    if (this._viewPosDirty) {
                        this._updateViewPos();
                    }

                    return this._viewPos;
                }
            },

            /**
             * The current picked barycentric.
             *
             * @property barycentric
             * @default null
             * @type {Array of Number}
             */
            barycentric: {

                get: function () {

                    if (this._barycentricDirty) {
                        this._updateBarycentric();
                    }

                    return this._barycentric;
                }
            },

            /**
             * The current picked normal.
             *
             * @property normal
             * @default null
             * @type {Array of Number}
             */
            normal: {

                get: function () {

                    if (this._normalDirty) {
                        this._updateNormal();
                    }

                    return this._normal;
                }
            },

            /**
             * The current picked uv.
             *
             * @property uv
             * @default null
             * @type {Array of Number}
             */
            uv: {

                get: function () {

                    if (this._uvDirty) {
                        this._updateUV();
                    }

                    return this._uv;
                }
            }
        },

        _getJSON: function () {
            var json = {};
            if (this._canvasCoords) {
                json.canvasCoords = this._canvasCoords;
            }
            if (this._origin) {
                json.origin = this._origin;
            }
            if (this._dir) {
                json.dir = this._dir;
            }
            return json;
        }
    });

})();
