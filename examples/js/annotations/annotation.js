(function () {

    "use strict";

    /**
     * Manages the Annotations within a Scene.
     *
     *
     */
    XEO.AnnotationManager = XEO.Component.extend({

        _init: function () {

            this.annotations = {};

            this._listDirty = true;

            this.visible = true;
        },

        _props: {

            /**
             * The visibility status of this AnnotationManager.
             *
             * Fires an {{#crossLink "AnnotationManager/visible:event"}}{{/crossLink}} event on change.
             *
             * @property visible
             * @type Boolean
             */
            visible: {

                set: function (value) {

                    value = value !== false;

                    if (this._visible !== value) {

                        this._visible = value;

                        if (this._visible) {
                            this._onRendered = this.scene.on("rendered", this._update, this);

                        } else {

                            // All Annotations currently invisible

                            this.scene.off(this._onRendered);
                            this._update();

                        }

                        this.fire("visible", this._visible);
                    }
                },

                get: function () {
                    return this._visible;
                }
            }
        },

        _update: (function () {

            var visibleList = [];
            var list = [];
            var listLen = 0;
            var pixels = [];
            var colors = [];

            return function () {

                var canvas = this.scene.canvas;
                var annotation;

                if (this._listDirty) { // Lazy-build Annotation list

                    listLen = 0;

                    for (var id in this.annotations) {
                        if (this.annotations.hasOwnProperty(id)) {
                            list[listLen++] = this.annotations[id];
                        }
                    }

                    this._listDirty = false;
                }

                if (!this._visible) {

                    // All Annotations currently invisible

                    for (i = 0; i < listLen; i++) {
                        annotation = list[i];
                        annotation.visible = false;
                    }

                    return;
                }

                var canvasPos;
                var canvasX;
                var canvasY;
                var lenPixels = 0;
                var i;
                var boundary = this.scene.canvas.boundary;
                var canvasWidth = boundary[2];
                var canvasHeight = boundary[2];
                var visibleListLen = 0;

                // Occlude Annotations that fall outside canvas

                for (i = 0; i < listLen; i++) {

                    annotation = list[i];
                    canvasPos = annotation.canvasBoundary.center;
                    canvasX = canvasPos[0];
                    canvasY = canvasPos[1];

                    if (!this._visible
                        || (canvasX + 5) < 0
                        || (canvasY + 5) < 0
                        || (canvasX - 5) > canvasWidth
                        || (canvasY - 5 ) > canvasHeight) {

                        annotation.visible = false;

                    } else {

                        // Occlude Annotations that are hidden by Entities

                        visibleList[visibleListLen++] = annotation;
                        pixels[lenPixels++] = canvasPos[0];
                        pixels[lenPixels++] = canvasPos[1];
                    }
                }

                var opaqueOnly = true;

                canvas.readPixels(pixels, colors, visibleListLen, opaqueOnly);

                for (i = 0; i < visibleListLen; i++) {
                    annotation = visibleList[i];
                    annotation.visible = (colors[i * 4] === 255 && colors[i * 4 + 1] === 255 && colors[i * 4 + 2] === 0);
                }
            };
        })(),

        addAnnotation: function (annotation) {
            this.annotations[annotation.id] = annotation;
            this._listDirty = true;
        },

        removeAnnotation: function (annotation) {
            delete this.annotations[annotation.id];
            this._listDirty = true;
        }
    });

    const PIN_COLOR = XEO.math.vec4([1.0, 1.0, 0.0]);

    // Converts XEO color to CSS
    function cssColor(color) {
        return "rgb(" +
            Math.floor(color[0] * 255) + "," +
            Math.floor(color[1] * 255) + "," +
            Math.floor(color[2] * 255) + ")";
    }

    /**
     An **Annotation** is a label that's attached to an {{#crossLink "Entity"}}{{/crossLink}}.

     ## Example

     ````javascript

     new XEO.Annotation({
        entity: "6#n273303_shaft-node.entity.0",
        primIndex: 14289,
        bary: [0.45, 0.74, -0.19],
        visible: true,
        title: "My first annotation",
        desc: "Description of first annotation"
    });

    new XEO.Annotation({
        entity: "6#n273303_shaft-node.entity.0",
        primIndex: 14249,
        bary: [0.45, 0.74, -0.19],
        visible: true,
        title: "My second annotation",
        desc: "Description of second annotation"
    });
    ````

    @class Annotation
    @module XEO
    @submodule annotations
    @constructor
    @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Annotation in the default
    {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
    @param [cfg] {*} Configs
    @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
    generated automatically when omitted.
    @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Annotation.
    @extends Component
    */
    XEO.Annotation = XEO.Component.extend({

        type: "XEO.Annotation",

        _init: function (cfg) {

            // Entity which renders a small dot which we use for occlusion culling
            // We also use its boundary to track the position of the Annotation

            this._pin = this.create(XEO.Entity, {

                lights: this.create(XEO.Lights, {}, "lights"),

                geometry: this.create(XEO.SphereGeometry, {
                        radius: 0.05,
                        heightSegments: 6,
                        widthSegments: 6
                    },
                    "pinGeometry"), // Geometry shared with all Annotations in this Scene

                visibility: this.create(XEO.Visibility, {
                    visible: true
                }),

                material: this.create(XEO.PhongMaterial, {
                        emissive: PIN_COLOR,
                        pointSize: 6
                    },
                    "pinMaterial"),

                transform: this.create(XEO.Translate, {
                    xyz: [0, 0, 0]
                })
            });

            // HTML elements

            var body = document.getElementsByTagName("body")[0];

            var fillColor = [1, 1, 0];
            var color = [0, 0, 0];
            var opacity = 0.5;
            var lineWidth = 1;
            var text = cfg.desc;

            this._boxDiv = document.createElement('div');
            this._boxDiv.innerText = text;
            var style = this._boxDiv.style;
            style.color = cssColor(color);
            style.position = "absolute";
            style.padding = "10px";
            style.margin = "0";
            style.background = fillColor ? cssColor(fillColor) : "black";
            style.opacity = opacity;
            style.border = lineWidth + "px solid " + cssColor(color);
            style["z-index"] = "10001";
            style.width = "auto";
            style.height = "auto";
            style["border-radius"] = "5px";
            style.font = "bold 12px arial,serif";
            body.appendChild(this._boxDiv);

            this._pointDiv = document.createElement('div');
            this._pointDiv.innerText = "3";
            style = this._pointDiv.style;
            style["font"] = "Helvetica 11px sans-serif";
            style["line-height"] = ".9";
            style.color = "black";
            style.background = "white";
            style.position = "absolute";
            style.padding = "2px";
            style.margin = "0";
            style.background = "white";
            style.opacity = 1.0;
            style.border = "2px solid gray";
            style.width = "13px";
            style.height = "13px";
            style["border-radius"] = "9px";
            style["z-index"] = "1001";
            body.appendChild(this._pointDiv);

            // Lazy-evaluation flags

            this._localPosDirty = true;
            this._worldPosDirty = false;

            // Set public properties

            this.entity = cfg.entity;
            this.primIndex = cfg.primIndex;
            this.bary = cfg.bary;
            this.visible = cfg.visible;
            this.title = cfg.title;
            this.desc = cfg.desc;

            /**
             * The AnnotationManager that manages this Annotation.
             *
             * @type {XEO.AnnotationManager}
             */
            this.manager = this.create(XEO.AnnotationManager, {}, "manager");

            this.manager.addAnnotation(this);

            this._pin.canvasBoundary.on("updated", this._updateLayout, this);
        },

        _props: {

            /**
             * The {{#crossLink "Entity"}}{{/crossLink}} this Annotation is attached to.
             *
             * Fires an {{#crossLink "Annotation/entity:event"}}{{/crossLink}} event on change.
             *
             * @property entity
             * @type XEO.Entity
             */
            entity: {

                set: function (value) {

                    /**
                     * Fired whenever this Annotation's {{#crossLink "Annotation/entity:property"}}{{/crossLink}} property changes.
                     * @event entity
                     * @param value The property's new value
                     */
                    this._attach({
                        name: "entity",
                        type: "XEO.Entity",
                        component: value,
                        sceneDefault: false,
                        onAttached: {
                            callback: this._entityAttached,
                            scope: this
                        },
                        onDetached: {
                            callback: this._entityDetached,
                            scope: this
                        }
                    });
                },

                get: function () {
                    return this._attached.entity;
                }
            },

            /**
             * Index of the triangle containing this pin.
             *
             * Fires an {{#crossLink "Annotation/triangle:event"}}{{/crossLink}} event on change.
             *
             * @property localPos
             * @default 0
             * @type Number
             */
            primIndex: {

                set: function (value) {

                    this._primIndex = value || 0;

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Annotation's {{#crossLink "Annotation/primIndex:property"}}{{/crossLink}} property changes.
                     *
                     * @event primIndex
                     * @param value Number The property's new value
                     */
                    this.fire("primIndex", this._primIndex);
                },

                get: function () {
                    return this._primIndex;
                }
            },

            /**
             * Barycentric coordinates of this Annotation within its triangle.
             *
             * Fires an {{#crossLink "Annotation/bary:event"}}{{/crossLink}} event on change.
             *
             * @property bary
             * @default [0.3,0.3,0.3]
             * @type Float32Array
             */
            bary: {

                set: function (value) {

                    this._bary = value || XEO.math.vec3([.3, .3, .3]);

                    this._scheduleUpdate();

                    /**
                     * Fired whenever this Annotation's {{#crossLink "Annotation/bary:property"}}{{/crossLink}} property changes.
                     * @event bary
                     * @param value Float32Array The property's new value
                     */
                    this.fire("bary", this._bary);
                },

                get: function () {
                    return this._bary;
                }
            },

            /**
             * The Annotation's title text.
             *
             * Fires an {{#crossLink "Annotation/title:event"}}{{/crossLink}} event on change.
             *
             * @property title
             * @default ""
             * @type String
             */
            title: {

                set: function (value) {

                    this._title = (value === undefined || value === null) ? "" : value;

                    this._boxDiv.innerText = this._title;
                },

                get: function () {
                    return this._title;
                }
            },


            /**
             * The Annotation's description text
             *
             * Fires an {{#crossLink "Annotation/desc:event"}}{{/crossLink}} event on change.
             *
             * @property desc
             * @default ""
             * @type String
             */
            desc: {

                set: function (value) {

                    this._desc = (value === undefined || value === null) ? "" : value;

                    this._boxDiv.innerText = this._desc;
                },

                get: function () {
                    return this._desc;
                }
            },

            /**
             * World-space boundary of this Annotation.
             *
             * @property worldBoundary
             * @type  {Boundary3D}
             * @final
             */
            worldboundary: {
                get: function () {
                    return this._pin.worldBoundary;
                }
            },

            /**
             * View-space boundary of this Annotation.
             *
             * @property viewBoundary
             * @type {Boundary3D}
             * @final
             */

            viewBoundary: {
                get: function () {
                    return this._pin.viewBoundary;
                }
            },

            /**
             * Canvas-space boundary of this Annotation.
             *
             * @property canvasBoundary
             * @type {Boundary2D}
             * @final
             */
            canvasBoundary: {
                get: function () {
                    return this._pin.canvasBoundary;
                }
            },

            /**
             Indicates whether this Annotation is visible or not.

             Fires a {{#crossLink "Annotation/visible:event"}}{{/crossLink}} event on change.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {

                    value = value !== false;

                    if (this._visible === value) {
                        return;
                    }

                    this._visible = value;

                    //this._pin.visibility.visible = value;

                    this._pointDiv.style.visibility = value ? "visible" : "hidden";
                    this._boxDiv.style.visibility = value ? "visible" : "hidden";

                    /**
                     Fired whenever this Visibility's {{#crossLink "Visibility/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", value);
                },

                get: function () {
                    return this._visible;
                }
            }
        },

        _entityAttached: function (entity) {
            this._onEntityLocalBoundary = entity.localBoundary.on("updated", this._setLocalPosDirty, this);
            this._onEntityWorldBoundary = entity.worldBoundary.on("updated", this._setWorldPosDirty, this);
            this._onEntityVisible = entity.visibility.on("visible", this._entityVisible, this);
            this._setLocalPosDirty();
        },

        _setLocalPosDirty: function () {
            this._localPosDirty = true;
            this._scheduleUpdate();
        },

        _setWorldPosDirty: function () {
            this._worldPosDirty = true;
            this._scheduleUpdate();
        },

        _entityVisible: function (visible) {
            //this._pin.visibility.visible = visible;
        },

        _entityDetached: function (entity) {
            entity.localBoundary.off(this._onEntityLocalBoundary);
            entity.worldBoundary.off(this._onEntityWorldBoundary);
            entity.visibility.off(this._onEntityVisible);
        },

        // Callback for _scheduleUpdate
        _update: (function () {

            var a = XEO.math.vec3();
            var b = XEO.math.vec3();
            var c = XEO.math.vec3();
            var localPos = XEO.math.vec3();
            var worldPos = XEO.math.vec3();

            return function () {

                var entity = this._attached.entity;

                if (!entity) {
                    return;
                }

                if (this._localPosDirty) {

                    // Derive the Local space position on the entity's Geometry
                    // from the primitive index and barycentric coordinate

                    var geometry = entity.geometry;
                    var indices = geometry.indices;
                    var positions = geometry.positions;

                    if (!indices || !positions) {
                        return;
                    }

                    var i = this._primIndex;

                    var ia = indices[i];
                    var ib = indices[i + 1];
                    var ic = indices[i + 2];

                    var ia3 = ia * 3;
                    var ib3 = ib * 3;
                    var ic3 = ic * 3;

                    a[0] = positions[ia3];
                    a[1] = positions[ia3 + 1];
                    a[2] = positions[ia3 + 2];

                    b[0] = positions[ib3];
                    b[1] = positions[ib3 + 1];
                    b[2] = positions[ib3 + 2];

                    c[0] = positions[ic3];
                    c[1] = positions[ic3 + 1];
                    c[2] = positions[ic3 + 2];

                    XEO.math.barycentricToCartesian2(this._bary, a, b, c, localPos);

                    this._localPosDirty = false;
                    this._worldPosDirty = true;
                }

                if (this._worldPosDirty) {

                    // Transform the Local position into World space

                    var transform = entity.transform;

                    var pinWorldPos = transform ? XEO.math.transformPoint3(transform.leafMatrix, localPos, worldPos) : localPos;

                    this._pin.transform.xyz = pinWorldPos;

                    this._worldPosDirty = false;
                }
            };
        })(),

        _updateLayout: function () {

            var boxDiv = this._boxDiv;
            var pointDiv = this._pointDiv;

            // Label position

            var pinCanvasPos = this._pin.canvasBoundary.center;

            pointDiv.style.left = pinCanvasPos[0] - 5 + "px";
            pointDiv.style.top = pinCanvasPos[1] - 5 + "px";

            var boundary = this.scene.canvas.boundary;
            var halfCanvasWidth = boundary[2] / 2;
            var halfCanvasHeight = boundary[3] / 2;

            var offsetX = pinCanvasPos[0] < halfCanvasWidth ? -10 : 40;
            var offsetY = pinCanvasPos[1] < halfCanvasHeight ? 13 : 40;

            offsetX = -10;
            offsetY = 10;

            boxDiv.style.left = (pinCanvasPos[0] - offsetX) + "px";
            boxDiv.style.top = (pinCanvasPos[1] - offsetY) + "px";

            // Label Z-index

            var zIndex = 10000 + Math.floor(this._pin.viewBoundary.center[2]);

            boxDiv.style["z-index"] = zIndex;
            pointDiv.style["z-index"] = zIndex + 1;
        },

        _getJSON: function () {

            var json = {
                primIndex: this.primIndex,
                bary: this.bary,
                visible: this.visible
            };

            if (this._attached.entity) {
                json.entity = this._attached.entity.id;
            }

            return json;
        },

        _destroy: function () {
            this.manager.removeAnnotation(this);
        }
    });
})();
