/**
 A **Group** is an {{#crossLink "Object"}}{{/crossLink}} that groups other Objects.

 Group is subclassed by (at least) {{#crossLink "Model"}}{{/crossLink}}, which is the abstract base class for {{#crossLink "GLTFModel"}}{{/crossLink}}, {{#crossLink "STLModel"}}{{/crossLink}} etc.

 See {{#crossLink "Object"}}{{/crossLink}} for overall usage info.

 @class Group
 @module xeogl
 @submodule objects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Group.
 @param [cfg.parent] The parent Object.
 @param [cfg.children] {Array(Object)} Child Objects to attach to this Group.
 @param [cfg.visible=true] {Boolean}  Indicates if this Group is visible.
 @param [cfg.culled=true] {Boolean}  Indicates if this Group is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this Group is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this Group is clippable.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this Group.
 @param [cfg.ghosted=false] {Boolean} Whether this Group is rendered as ghosted.
 @param [cfg.highlighted=false] {Boolean} Whether this Group is rendered as highlighted.
 @param [cfg.selected=false] {Boolean} Whether this Group is rendered as selected.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.collidable=true] {Boolean} Whether this Group contributes to boundary calculations.
 @param [cfg.aabbVisible=false] {Boolean} Whether this Group's axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean} Whether this Group's oriented World-space bounding box is visible.
 @param [cfg.position=[0,0,0]] {Float32Array} The Group's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The Group's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The Group's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.

 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The Group's local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @extends Object
 */
xeogl.Group = xeogl.Object.extend({

    /**
     JavaScript class name for this xeogl.Group.

     @property type
     @type String
     @final
     */
    type: "xeogl.Group",

    // Constructor

    _init: function (cfg) {

        // Group class responsibilities:
        //  - connects to child objects
        //  - propagates state changes down to child objects
        //  - provides AABB & OBB of self and children

        this._super(cfg);

        this._childList = [];
        this._childMap = {};

        this._aabb = null;
        this._aabbDirty = true;
        this._obb = null;
        this._obbDirty = true;

        this.visible = cfg.visible;
        this.culled = cfg.culled;
        this.ghosted = cfg.ghosted;
        this.highlighted = cfg.highlighted;
        this.selected = cfg.selected;
        this.outlined = cfg.outlined;
        this.clippable = cfg.clippable;
        this.pickable = cfg.pickable;
        this.collidable = cfg.collidable;

        if (cfg.children) {
            var children = cfg.children;
            for (var i = 0, len = children.length; i < len; i++) {
                this.addChild(children[i]);
            }
        }
    },

    _setWorldMatrixDirty: function () {
        this._worldMatrixDirty = true;
        this._worldNormalMatrixDirty = true;
        if (this._childList) {
            for (var i = 0, len = this._childList.length; i < len; i++) {
                this._childList[i]._setWorldMatrixDirty();
            }
        }
        this.fire("boundary");
    },

    _setBoundaryDirty: function () {
        for (var object = this; object; object = object._parent) {
            object._aabbDirty = true;
            object._obbDirty = true;
        }
    },

    _updateAABB: function () {
        if (!this._aabb) {
            this._aabb = xeogl.math.AABB3();
            this._aabbDirty = true;
        }
        if (this._aabbDirty) {
            xeogl.math.collapseAABB3(this._aabb);
            for (var i = 0, len = this._childList.length; i < len; i++) {
                xeogl.math.expandAABB3(this._aabb, this._childList[i].aabb);
            }
            if (!this._aabbCenter) {
                this._aabbCenter = new Float32Array(3);
            }
            xeogl.math.getAABB3Center(this._aabb, this._aabbCenter);
            this._aabbDirty = false;
        }
    },

    _updateOBB: function () {
        if (!this._obb) {
            this._obb = xeogl.math.OBB3();
            this._obbDirty = true;
        }
        if (this._obbDirty) {
            if (this._childList.length === 1) {
                this._obb.set(this._childList[0].obb);
            } else {
                xeogl.math.AABB3ToOBB3(this.aabb, this._obb);
            }
            this._obbDirty = false;
        }
    },

    /**
     Adds a child {{#crossLink "Object"}}{{/crossLink}}.

     The child Object may be specified by ID, instance or JSON definition.

     The child Object must be in the same {{#crossLink "Scene"}}{{/crossLink}} as this Group, and may not be a parent of this Group.

     @method addChild
     @param {Number|String|*|Component} object ID, definition or instance of an Object type or subtype.
     */
    addChild: function (object) {
        if (xeogl._isNumeric(object) || xeogl._isString(object)) {
            var objectId = object;
            object = this.scene.objects[objectId];
            if (!object) {
                this.warn("Object not found: " + xeogl._inQuotes(objectId));
                return;
            }
        } else if (xeogl._isObject(object)) {
            var cfg = object;
            // object = new xeogl.Group(this.scene, cfg);
            if (!object) {
                return;
            }
        } else {
            if (!object.isType("xeogl.Object")) {
                this.error("Not a xeogl.Object: " + object.id);
                return;
            }
            if (object._parent) {
                if (object._parent.id === this.id) {
                    this.warn("Already a child object: " + object.id);
                    return;
                }
                object._parent.removeChild(object);
            }
        }
        var id = object.id;
        if (object.scene.id !== this.scene.id) {
            this.error("Object not in same Scene: " + id);
            return;
        }
        delete this.scene.rootObjects[id];
        this._childList.push(object);
        this._childMap[id] = object;
        object._parent = this;
        object.visible = this._visible;
        object.culled = this._culled;
        object.ghosted = this._ghosted;
        object.highlited = this._highlighted;
        object.selected = this._selected;
        object.outlined = this._outlined;
        object.clippable = this._clippable;
        object.pickable = this._pickable;
        object.collidable = this._collidable;
        object._setWorldMatrixDirty();
        this._setBoundaryDirty();
    },

    /**
     Removes a child {{#crossLink "Object"}}{{/crossLink}}.

     @method removeChild
     @param {Object} object An Object instance.
     */
    removeChild: function (object) {
        var id = object.id;
        for (var i = 0, len = this._childList.length; i < len; i++) {
            if (this._childList[i].id === id) {
                object._parent = null;
                this._childList = this._childList.splice(i, 1);
                delete this._childMap[id];
                this.scene.rootObjects[object.id] = object;
                object._setWorldMatrixDirty();
                this._setBoundaryDirty();
                return;
            }
        }
    },

    /**
     Removes all child {{#crossLink "Object"}}Objects{{/crossLink}}.

     @method removeChildren
     */
    removeChildren: function () {
        var object;
        for (var i = 0, len = this._childList.length; i < len; i++) {
            object = this._childList[i];
            object._parent = null;
            this.scene.rootObjects[object.id] = object;
            object._setWorldMatrixDirty();
        }
        this._childList = [];
        this._childMap = {};
        this._setBoundaryDirty();
    },

    _props: {


        /**
         * Convenience property containing the number of child {{#crossLink "Object"}}Objects{{/crossLink}}.
         *
         * @property numChildren
         * @final
         * @type Number
         */
        numChildren: {
            get: function () {
                return this._childList.length;
            }
        },

        /**
         Array of child {{#crossLink "Object"}}Objects{{/crossLink}}.

         @property children
         @final
         @type Array
         */
        children: {
            get: function () {
                return this._childList;
            }
        },

        /**
         Child {{#crossLink "Object"}}Objects{{/crossLink}} mapped to their IDs.

         @property childMap
         @final
         @type {*}
         */
        childMap: {
            get: function () {
                return this._childMap;
            }
        },

        /**
         The axis-aligned World-space boundary of this Group.

         This encloses all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the subtree.

         The AABB is represented by a six-element Float32Array containing the min/max extents of the
         axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

         @property aabb
         @final
         @type {Float32Array}
         */
        aabb: {
            get: function () {
                if (this._aabbDirty) {
                    this._updateAABB();
                }
                return this._aabb;
            }
        },

        /**
         World-space oriented 3D bounding box (OBB) of this Group.

         This encloses all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the subtree.

         The OBB is represented by a 32-element Float32Array containing the eight vertices of the box,
         where each vertex is a homogeneous coordinate having [x,y,z,w] elements.

         The OBB will only be properly object-aligned if the Object has exactly one Mesh within its subtree. When
         there are multiple Meshes, then the OBB will be set to the extents of the World-space axis-aligned boundary, equivalent
         to {{#crossLink "Object/aabb:property"}}{{/crossLink}}.

         @property obb
         @final
         @type {Float32Array}
         */
        obb: {
            get: function () {
                if (this._obbDirty) {
                    this._updateOBB();
                }
                return this._obb;
            }
        },

        /**
         The World-space center of this Group.

         This is the collective center of all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the subtree.

         @property center
         @final
         @returns {Float32Array}
         */
        center: function () {
            if (this._aabbDirty) {
                this._updateAABB();
            }
            return this._aabbCenter;
        },

        /**
         Indicates whether this Group is visible or not.

         This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
         {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

         @property visible
         @default true
         @type Boolean
         */
        visible: {
            set: function (visible) {
                visible = visible !== false;
                this._visible = visible;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].visible = visible;
                }
            },
            get: function () {
                return this._visible;
            }
        },

        /**
         Set true to show the axis-aligned bounding box (AABB) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property aabbHierarchyVisible
         @default false
         @type {Boolean}
         */
        aabbHierarchyVisible: {
            set: function (visible) {
                var child;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    child = this._childList[i];
                    if (child.children) {
                        child.aabbHierarchyVisible = visible;
                    } else {
                        child.aabbVisible = visible;
                    }
                }
            }
        },

        /**
         Set true to show the object-aligned bounding box (obb) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property obbHierarchyVisible
         @default false
         @type {Boolean}
         */
        obbHierarchyVisible: {
            set: function (visible) {
                var child;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    child = this._childList[i];
                    if (child.children) {
                        child.obbHierarchyVisible = visible;
                    } else {
                        child.obbVisible = visible;
                    }
                }
            }
        },

        /**
         Indicates whether this Group is highlighted.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The highlight effect is configured via the
         {{#crossLink "Mesh/highlightMaterial:property"}}highlightMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
         within this Group's subtree.

         @property highlighted
         @default false
         @type Boolean
         */
        highlighted: {
            set: function (highlighted) {
                highlighted = !!highlighted;
                this._highlighted = highlighted;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].highlighted = highlighted;
                }
            },
            get: function () {
                return this._highlighted;
            }
        },

        /**
         Indicates whether this Group appears selected.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The selected effect is configured via the
         {{#crossLink "Mesh/selectedMaterial:property"}}selectedMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
         within this Group's subtree.

         @property selected
         @default false
         @type Boolean
         */
        selected: {
            set: function (selected) {
                selected = !!selected;
                this._selected = selected;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].selected = selected;
                }
            },
            get: function () {
                return this._selected;
            }
        },

        /**
         Indicates whether or not this Group is currently culled from view.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
         {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

         @property culled
         @default false
         @type Boolean
         */
        culled: {
            set: function (culled) {
                culled = !!culled;
                this._culled = culled;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].culled = culled;
                }
            },
            get: function () {
                return this._culled;
            }
        },

        /**
         Indicates whether this Group is clippable.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         {{#crossLink "Mesh"}}Mesh{{/crossLink}}  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree are clipped by {{#crossLink "Clips"}}{{/crossLink}} components that are attached to them.

         @property clippable
         @default true
         @type Boolean
         */
        clippable: {
            set: function (clippable) {
                clippable = clippable !== false;
                this._clippable = clippable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].clippable = clippable;
                }
            },
            get: function () {
                return this._clippable;
            }
        },

        /**
         Indicates whether this Group is included in boundary calculations.

         This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property collidable
         @default true
         @type Boolean
         */
        collidable: {
            set: function (collidable) {
                collidable = collidable !== false;
                this._collidable = collidable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].collidable = collidable;
                }
            },
            get: function () {
                return this._collidable;
            }
        },

        /**
         Indicates whether this Group is pickable or not.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

         @property pickable
         @default true
         @type Boolean
         */
        pickable: {
            set: function (pickable) {
                pickable = pickable !== false;
                this._pickable = pickable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].pickable = pickable;
                }
            },
            get: function () {
                return this._pickable;
            }
        },

        /**
         RGB colorize color, multiplies by the rendered fragment color.

         This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}}  in the subtree.

         @property colorize
         @default [1.0, 1.0, 1.0]
         @type Float32Array
         */
        colorize: {
            set: function (rgb) {
                var colorize = this._colorize;
                if (!colorize) {
                    colorize = this._colorize = new Float32Array(4);
                    colorize[3] = 1.0;
                }
                if (rgb) {
                    colorize[0] = rgb[0];
                    colorize[1] = rgb[1];
                    colorize[2] = rgb[2];
                } else {
                    colorize[0] = 1;
                    colorize[1] = 1;
                    colorize[2] = 1;
                }
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].colorize = colorize;
                }
            },
            get: function () {
                return this._colorize.slice(0, 3);
            }
        },

        /**
         Opacity factor, multiplies by the rendered fragment alpha.

         This is a factor in range ````[0..1]````.

         @property opacity
         @default 1.0
         @type Number
         */
        opacity: {
            set: function (opacity) {
                var colorize = this._colorize;
                if (!colorize) {
                    colorize = this._colorize = new Float32Array(4);
                    colorize[0] = 1;
                    colorize[1] = 1;
                    colorize[2] = 1;
                }
                colorize[3] = opacity !== null && opacity !== undefined ? opacity : 1.0;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].opacity = opacity;
                }
            },
            get: function () {
                return this._colorize[3];
            }
        },

        /**
         Indicates whether this Group appears outlined.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The outlined effect is configured via the
         {{#crossLink "Mesh/outlineMaterial:property"}}outlineMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
         within this Group's subtree.

         @property outlined
         @default false
         @type Boolean
         */
        outlined: {
            set: function (outlined) {
                outlined = !!outlined;
                this._outlined = outlined;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].outlined = outlined;
                }
            },
            get: function () {
                return this._outlined;
            }
        },

        /**
         Indicates whether this Group appears ghosted.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         The ghosted effect is configured via the
         {{#crossLink "Mesh/ghostMaterial:property"}}ghostMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
         within this Group's subtree.

         @property outlined
         @default false
         @type Boolean
         */
        ghosted: {
            set: function (ghosted) {
                ghosted = !!ghosted;
                this._ghosted = ghosted;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].ghosted = ghosted;
                }
            },
            get: function () {
                return this._ghosted;
            }
        }

        //--------------------------------------------------------------------------------------------------------------
        // Redefining comments for base class properties to help with documentation navigation
        //--------------------------------------------------------------------------------------------------------------

        /**
         The parent Group/Model.

         The parent Group may also be set by passing this Object to the
         Group's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

         @property parent
         @type Group
         */

        /**
         The IFC type of this Group, if applicable.

         @property ifcType
         @default null
         @type String
         */

        /**
         The Local-space position of this Group.

         @property position
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         The Group's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.

         @property rotation
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         The Local-space rotation quaternion for this Group.

         @property quaternion
         @default [0,0,0, 1]
         @type {Float32Array}
         */

        /**
         The Local-space scale of this Group.

         @property scale
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         * This Group's local matrix.
         *
         * @property matrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */

        /**
         * This Group's World matrix.
         *
         * @property worldMatrix
         * @type {Float32Array}
         */

        /**
         * This Group's World normal matrix.
         *
         * @property worldNormalMatrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */

        /**
         Rotates this Group about the given Local-space axis by the given increment.

         @method rotate
         @paream {Float32Array} axis The Local-space axis about which to rotate.
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Group about the given World-space axis by the given increment.

         @method rotate
         @paream {Float32Array} axis The local axis about which to rotate.
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Group about the Local-space X-axis by the given increment.

         @method rotateX
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Group about the Local-space Y-axis by the given increment.

         @method rotateY
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Group about the Local-space Z-axis by the given increment.

         @method rotateZ
         @param {Number} angle Angle increment in degrees.
         */

        /**
         * Translates this Group in Local-space by the given increment.
         *
         * @method translate
         * @param {Float32Array} axis Normalized local space 3D vector along which to translate.
         * @param {Number} distance Distance to translate along  the vector.
         */

        /**
         * Translates this Group along the Local-space X-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the X-axis.
         */

        /**
         * Translates this Group along the Local-space Y-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the Y-axis.
         */

        /**
         * Translates this Group along the Local-space Z-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the Z-axis.
         */

        /**
         Whether this Group's axis-aligned bounding box (AABB) is visible.

         @property aabbVisible
         @default false
         @type {Boolean}
         */

        /**
         Whether this Group's object-aligned bounding box (OBB) is visible.

         @property obbVisible
         @default false
         @type {Boolean}
         */
    },

    _destroy: function () {
        this._super();
        this.removeChildren();
    }
});