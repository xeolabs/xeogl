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
    xeogl.Pin = xeogl.Component.extend({

        type: "xeogl.Pin",

        _init: function (cfg) {

            this.manager = cfg.manager;

            // Lazy-evaluation flags

            this._localPosDirty = true;
            this._worldPosDirty = false;

            // Set public properties

            this.entity = cfg.entity;
            this.number = cfg.number;
            this.primIndex = cfg.primIndex;
            this.bary = cfg.bary;

            this.manager.addPin(this);
        },

        _props: {

            /**
             * The {{#crossLink "Entity"}}{{/crossLink}} this Pin is attached to.
             *
             * Fires an {{#crossLink "Pin/entity:event"}}{{/crossLink}} event on change.
             *
             * @property entity
             * @type xeogl.Entity
             */
            entity: {
                set: function (value) {

                    /**
                     * Fired whenever this Pin's {{#crossLink "Pin/entity:property"}}{{/crossLink}} property changes.
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
             * Fires an {{#crossLink "Pin/triangle:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Pin's {{#crossLink "Pin/primIndex:property"}}{{/crossLink}} property changes.
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
             * Barycentric coordinates of this Pin within its triangle.
             *
             * Fires an {{#crossLink "Pin/bary:event"}}{{/crossLink}} event on change.
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
                     * Fired whenever this Pin's {{#crossLink "Pin/bary:property"}}{{/crossLink}} property changes.
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
             Indicates whether this Pin is visible or not.

             Fires a {{#crossLink "Pin/visible:event"}}{{/crossLink}} event on change.

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
                     Fired whenever this Pin's {{#crossLink "Pin/visible:property"}}{{/crossLink}} property changes.

                     @event visible
                     @param value {Boolean} The property's new value
                     */
                    this.fire("visible", value);
                },

                get: function () {
                    return this._visible;
                }
            },

            worldPos: {
                get: function() {
                    this._update();
                    return this._worldPos;
                }
            }
        },

        _entityAttached: function (entity) {
            this._onEntityLocalBoundary = entity.localBoundary.on("updated", this._setLocalPosDirty, this);
            this._onEntityWorldBoundary = entity.worldBoundary.on("updated", this._setWorldPosDirty, this);
            this._setLocalPosDirty();
        },

        _setLocalPosDirty: function () {
            if (!this._localPosDirty) {
                this._localPosDirty = true;
                this._scheduleUpdate();
            }
        },

        _setWorldPosDirty: function () {
            if (!this._worldPosDirty) {
                this._worldPosDirty = true;
                this._scheduleUpdate();
            }
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

                    math.barycentricToCartesian(this._bary, a, b, c, localPos);

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

            pinElement.style.left = pinCanvasPos[0] - 2 + "px";
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
            this.manager.removePin(this);
        }
    });
})();
