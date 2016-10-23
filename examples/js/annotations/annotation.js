(function () {

    "use strict";

    /**
     An **Annotation** is a label that's attached to an {{#crossLink "Entity"}}{{/crossLink}}.

     ## Example

     ````javascript

     // Create an annotation manager

     var manager = new xeogl.AnnotationManager({
         occlusionCull: true // Hide annotations when their pins are occluded
     });

     // Create a couple of annotations

     var a1 = new xeogl.Annotation({
        manager: manager,
        entity: "6#n274017_gear_53t-node_1.entity.0",
        primIndex: 3081,
        bary: [0.11, 0.79, 0.08],
        title: "A big grey gear",
        desc: "This is a big grey gear. There's a couple of big grey gears in this gearbox. They're both quite big and grey.",
        visible: true,
        open: true
     });

     var a2 = new xeogl.Annotation({
         manager: manager,
         entity: "6#n273303_shaft-node.entity.0",
         primIndex: 14289,
         bary: [0.45, 0.74, -0.19],
         visible: true,
         title: "Gearbox shaft",
         desc: "This is the end of one of the gearbox's shafts.",
         visible: true,
         open: false
     });

     ````
     @class Annotation
     @module xeogl
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
    xeogl.Annotation = xeogl.Component.extend({

        type: "xeogl.Annotation",

        _init: function (cfg) {

            this.manager = cfg.manager;

            this._initScene(cfg);
            this._initHTML(cfg);

            // Lazy-evaluation flags

            this._localPosDirty = true;
            this._worldPosDirty = false;

            // Set public properties

            this.entity = cfg.entity;
            this.number = cfg.number;
            this.primIndex = cfg.primIndex;
            this.bary = cfg.bary;
            this.visible = cfg.visible;
            this.open = cfg.open;
            this.title = cfg.title;
            this.desc = cfg.desc;

            this.manager.addAnnotation(this);

            // Pin position update causes annotation re-layout

            this._pin.canvasBoundary.on("updated", this._updateLayout, this);
        },

        _initScene: function (cfg) {

            // Entity which renders a small dot which we use for occlusion culling
            // We also use its boundary to track the position of the Annotation

            this._pin = this.create(xeogl.Entity, {
                lights: this.create(xeogl.Lights, {}, "lights"),

                geometry: this.create(xeogl.Geometry, {
                        primitive: "points",
                        positions:[0,0,0],
                        indices: [0]
                    },
                    "pinGeometry"),
                visibility: this.create(xeogl.Visibility, {
                    visible: true
                }),
                material: this.create(xeogl.PhongMaterial, {
                        emissive: [1.0, 1.0, 0.0],
                        diffuse: [0,0,0],
                        pointSize: 3
                    },
                    "pinMaterial"),
                transform: this.create(xeogl.Translate, {
                    xyz: [0, 0, 0]
                })
            });
        },

        _initHTML: function (cfg) {

            var body = document.getElementsByTagName("body")[0];
            var text = cfg.desc;

            this._labelElement = document.createElement('div');

            this._labelElement.className = "label";

            var style = this._labelElement.style;
            style.position = "absolute";
            style.font = "bold 14px arial,serif";
            style["z-index"] = "2000001"; // In front of xeoEnine's overlay

            body.appendChild(this._labelElement);

            this._titleElement = document.createElement('div');
            this._labelElement.appendChild(this._titleElement);
            this._titleElement.innerText = text;
            this._titleElement.style["margin-bottom"] = "8px";

            this._descElement = document.createElement('div');
            this._descElement.style.font = "normal 12px arial,serif";
            this._labelElement.appendChild(this._descElement);
            this._descElement.innerText = text;

            this._pinElement = document.createElement('div');
            this._pinElement.innerText = "";
            style = this._pinElement.style;
            style["font-family"] = "'Open Sans', sans serif 12px;";
            style["line-height"] = "20px";
            style["text-align"] = "center";
            style.color = "#ffff00";
            style.position = "absolute";
            style.padding = "0px";
            style.margin = "0";
            style.background = "rgba(255,0,0,255)";
            style.border = "2px solid #ffff00";
            style.width = "20px";
            style.height = "20px";
            style["border-radius"] = "20px";
            //    style["z-index"] = "200001"; // In front of xeoEnine's overlay
            style["transition"] = "background .3s";
            style["margin-top"] = "-10px";
            style["margin-left"] = "-10px";
            style["cursor"] = "pointer";

            body.appendChild(this._pinElement);
        },

        _props: {

            /**
             * The {{#crossLink "Entity"}}{{/crossLink}} this Annotation is attached to.
             *
             * Fires an {{#crossLink "Annotation/entity:event"}}{{/crossLink}} event on change.
             *
             * @property entity
             * @type xeogl.Entity
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
                        type: "xeogl.Entity",
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
                    this._setLocalPosDirty();

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
                    this._bary = value || xeogl.math.vec3([.3, .3, .3]);
                    this._setLocalPosDirty();

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
             * The Annotation's number.
             *
             * Fires an {{#crossLink "Annotation/number:event"}}{{/crossLink}} event on change.
             *
             * @property number
             * @default ""
             * @type Number
             */
            number: {
                set: function (value) {
                    this._number = (value === undefined || value === null) ? -1 : value;

                    /**
                     * Fired whenever this Annotation's {{#crossLink "Annotation/number:property"}}{{/crossLink}} property changes.
                     * @event number
                     * @param value Number The property's new value
                     */
                    this._pinElement.innerText = this._number >= 0 ? ("" + this._number) : "";
                },

                get: function () {
                    return this._number;
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
                    this._titleElement.innerText = this._title;
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
                    this._descElement.innerText = this._desc;
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
            worldBoundary: {
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
             Indicates whether this Annotation is open or not.

             Fires a {{#crossLink "Annotation/open:event"}}{{/crossLink}} event on change.

             @property open
             @default true
             @type Boolean
             */
            open: {

                set: function (value) {
                    value = !!value;
                    if (this._open === value) {
                        return;
                    }
                    this._open = value;
                    this._labelElement.style.visibility = value && this._visible ? "visible" : "hidden";

                    /**
                     Fired whenever this Annotation's {{#crossLink "Annotation/open:property"}}{{/crossLink}} property changes.

                     @event open
                     @param value {Boolean} The property's new value
                     */
                    this.fire("open", value);
                },

                get: function () {
                    return this._open;
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
                    this._pinElement.style.visibility = value ? "visible" : "hidden";
                    this._labelElement.style.visibility = value && this._open ? "visible" : "hidden";

                    /**
                     Fired whenever this Annotation's {{#crossLink "Annotation/visible:property"}}{{/crossLink}} property changes.

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

            var math = xeogl.math;
            var a = math.vec3();
            var b = math.vec3();
            var c = math.vec3();
            var localPos = math.vec3();
            var worldPos = math.vec3();
            var normal = math.vec3();

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

                    math.barycentricToCartesian2(this._bary, a, b, c, localPos);

                    math.triangleNormal(a, b, c, normal);
                    math.mulVec3Scalar(normal, 0.05, normal);
                    math.addVec3(localPos, normal, localPos);

                    this._localPosDirty = false;
                    this._worldPosDirty = true;
                }

                if (this._worldPosDirty) {

                    // Transform the Local position into World space

                    var transform = entity.transform;
                    var pinWorldPos = transform ? math.transformPoint3(transform.leafMatrix, localPos, worldPos) : localPos;
                    this._pin.transform.xyz = pinWorldPos;
                    this._worldPosDirty = false;
                }
            };
        })(),

        _updateLayout: function () {

            var labelElement = this._labelElement;
            var pinElement = this._pinElement;

            // Label position

            var pinCanvasPos = this._pin.canvasBoundary.center;

            pinElement.style.left = pinCanvasPos[0] -2 + "px";
            pinElement.style.top = pinCanvasPos[1] - 2 + "px";

            var boundary = this.scene.canvas.boundary;
            var halfCanvasWidth = boundary[2] / 2;
            var halfCanvasHeight = boundary[3] / 2;

            var offsetX = pinCanvasPos[0] < halfCanvasWidth ? -10 : 40;
            var offsetY = pinCanvasPos[1] < halfCanvasHeight ? 13 : 40;

            offsetX = -10;
            offsetY = 8;

            labelElement.style.left = 27 + (pinCanvasPos[0] - offsetX) + "px";
            labelElement.style.top = (pinCanvasPos[1] - offsetY) - 19 + "px";

            // Pin Z-index

            var zIndex = 1000005 + Math.floor(this._pin.viewBoundary.center[2] * 10);

            //labelElement.style["z-index"] = zIndex;
            pinElement.style["z-index"] = zIndex + 1;
        },

        _getJSON: function () {
            var json = {
                number: this.number,
                title: this.title,
                desc: this.desc,
                primIndex: this.primIndex,
                bary: this.bary,
                visible: this.visible,
                open: this.open
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
