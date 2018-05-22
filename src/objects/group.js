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

 @param [cfg.ifcType] {String} The Group's IFC type, if applicable.

 @param [cfg.parent] The parent Object.
 @param [cfg.children] {Array(Object)} Child Objects to attach to this Group.

 @param [cfg.position=[0,0,0]] {Float32Array} The Group's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The Group's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The Group's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The Group's local modelling transform matrix. Overrides the position, scale and rotation parameters.

 @param [cfg.visible=true] {Boolean}  Indicates if this Group is visible.
 @param [cfg.culled=false] {Boolean}  Indicates if this Group is culled from view.
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

    _init: function (cfg) {
        this._super(cfg); // Call xeogl.Object._init()
    }

    /**
     The IFC type of this Group, if applicable.

     @property ifcType
     @default null
     @type String
     */

    //------------------------------------------------------------------------------------------------------------------
    // Children and parent
    //------------------------------------------------------------------------------------------------------------------

    /**
     The parent Group/Model.

     The parent Group may also be set by passing this Object to the
     Group's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

     @property parent
     @type Group
     */

    /**
     Adds a child {{#crossLink "Object"}}{{/crossLink}}.

     The child Object may be specified by ID, instance or JSON definition.

     The child Object must be in the same {{#crossLink "Scene"}}{{/crossLink}} as this Group, and may not be a parent of this Group.

     The child object's transforms will become relative to this Group.

     Unless overridden (see params), the child will automatically inherit the values of these properties of this Group:

     * {{#crossLink "Group/visible:property"}}{{/crossLink}}
     * {{#crossLink "Group/culled:property"}}{{/crossLink}}
     * {{#crossLink "Group/ghosted:property"}}{{/crossLink}}
     * {{#crossLink "Group/highlighted:property"}}{{/crossLink}}
     * {{#crossLink "Group/selected:property"}}{{/crossLink}}
     * {{#crossLink "Group/outlined:property"}}{{/crossLink}}
     * {{#crossLink "Group/clippable:property"}}{{/crossLink}}
     * {{#crossLink "Group/pickable:property"}}{{/crossLink}}
     * {{#crossLink "Group/collidable:property"}}{{/crossLink}}

     @method addChild
     @param {Number|String|*|Object} object ID, definition or instance of an Object type or subtype.
     @param {Boolean} [inheritStates] Option to prevent the Object from inheriting values of this Group's properties.
     @returns {Object} The child Object.
     */

    /**
     * Convenience property containing the number of child {{#crossLink "Object"}}Objects{{/crossLink}}.
     *
     * @property numChildren
     * @final
     * @type Number
     */

    /**
     Array of child {{#crossLink "Object"}}Objects{{/crossLink}}.

     @property children
     @final
     @type Array
     */

    /**
     Child {{#crossLink "Object"}}Objects{{/crossLink}} mapped to their IDs.

     @property childMap
     @final
     @type {*}
     */

    //------------------------------------------------------------------------------------------------------------------
    // Transform properties
    //------------------------------------------------------------------------------------------------------------------

    /**
     The Group's Local-space position.

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
     The Group's Local-space rotation quaternion.

     @property quaternion
     @default [0,0,0, 1]
     @type {Float32Array}
     */

    /**
     The Group's Local-space scale.

     @property scale
     @default [0,0,0]
     @type {Float32Array}
     */

    /**
     * The Group's local matrix.
     *
     * @property matrix
     * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     * @type {Float32Array}
     */

    /**
     * The Group's World matrix.
     *
     * @property worldMatrix
     * @type {Float32Array}
     */

    /**
     * The Group's World normal matrix.
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

    //------------------------------------------------------------------------------------------------------------------
    // Boundaries
    //------------------------------------------------------------------------------------------------------------------

    /**
     The Group's axis-aligned World-space boundary.

     This encloses all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the subtree.

     The AABB is represented by a six-element Float32Array containing the min/max extents of the
     axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

     @property aabb
     @final
     @type {Float32Array}
     */

    /**
     The Group's World-space oriented 3D bounding box (OBB).

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

    /**
     The Group's World-space center.

     This is the collective center of all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the subtree.

     @property center
     @final
     @returns {Float32Array}
     */

    //------------------------------------------------------------------------------------------------------------------
    // States
    //------------------------------------------------------------------------------------------------------------------

    /**
     Indicates whether this Group is visible or not.

     This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

     @property visible
     @default true
     @type Boolean
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

    /**
     Set true to show the axis-aligned bounding box (AABB) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     @property aabbHierarchyVisible
     @default false
     @type {Boolean}
     */

    /**
     Set true to show the object-aligned bounding box (obb) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     @property obbHierarchyVisible
     @default false
     @type {Boolean}
     */

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

    /**
     Indicates whether or not this Group is currently culled from view.

     This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

     @property culled
     @default false
     @type Boolean
     */

    /**
     Indicates whether this Group is clippable.

     This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     {{#crossLink "Mesh"}}Mesh{{/crossLink}}  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree are clipped by {{#crossLink "Clips"}}{{/crossLink}} components that are attached to them.

     @property clippable
     @default true
     @type Boolean
     */

    /**
     Indicates whether this Group is included in boundary calculations.

     This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     @property collidable
     @default true
     @type Boolean
     */

    /**
     Indicates whether this Group is pickable or not.

     This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

     Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

     @property pickable
     @default true
     @type Boolean
     */

    /**
     RGB colorize color, multiplies by the rendered fragment color.

     This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}}  in the subtree.

     @property colorize
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */

    /**
     Opacity factor, multiplies by the rendered fragment alpha.

     This is a factor in range ````[0..1]````.

     @property opacity
     @default 1.0
     @type Number
     */

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

    /**
     The parent Group/Model.

     The parent Group may also be set by passing this Object to the
     Group's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

     @property parent
     @type Group
     */
});