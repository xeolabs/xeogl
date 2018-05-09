/**
 A **Model** is a {{#crossLink "Group"}}{{/crossLink}} of {{#crossLink "Component"}}Components{{/crossLink}}.

 Model is an abstract base class that's subclassed by (at least):

 * {{#crossLink "GLTFModel"}}{{/crossLink}}, which loads its components from glTF files.
 * {{#crossLink "OBJModel"}}{{/crossLink}}, which loads its components from .OBJ and .MTL files.
 * {{#crossLink "STLModel"}}{{/crossLink}}, which loads its components from .STL files.
 * {{#crossLink "SceneJSModel"}}{{/crossLink}}, which loads its components from SceneJS scene definitions.
 * {{#crossLink "BuildableModel"}}{{/crossLink}}, which provides a fluent API for building its components.


 @class Model
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ModelModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ModelModel.
 @param [cfg.parent] The parent Object.
 @param [cfg.visible=true] {Boolean}  Indicates if this Model is visible.
 @param [cfg.culled=true] {Boolean}  Indicates if this Model is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this Model is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this Model is clippable.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this Model.
 @param [cfg.ghosted=false] {Boolean} Whether this Model is rendered as ghosted.
 @param [cfg.highlighted=false] {Boolean} Whether this Model is rendered as highlighted.
 @param [cfg.selected=false] {Boolean} Whether this Model is rendered as selected.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.position=[0,0,0]] {Float32Array} The Model's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The Model's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The Model's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The Model's local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @extends Group
 */
(function () {

    "use strict";

    /**
     Child {{#crossLink "Object"}}Objects{{/crossLink}} mapped to their IDs.

     @property childMap
     @final
     @type {*}
     */

    /**
     Array of child {{#crossLink "Object"}}Objects{{/crossLink}}.

     @property childList
     @final
     @type Array
     */

    xeogl.Model = xeogl.Group.extend({

        /**
         JavaScript class name for this Component.

         @property type
         @type String
         @final
         */
        type: "xeogl.Model",

        _init: function (cfg) {

            this._super(cfg);

            /**
             * The {{#crossLink "Components"}}{{/crossLink}} within this Model, mapped to their IDs.
             *
             * @property components
             * @type {{String:Component}}
             */
            this.components = {};

            /**
             * The number of {{#crossLink "Components"}}{{/crossLink}} within this Model.
             *
             * @property numComponents
             * @type Number
             */
            this.numComponents = 0;

            /**
             * A map of maps; for each {{#crossLink "Component"}}{{/crossLink}} type in this Model,
             * a map to IDs to {{#crossLink "Component"}}{{/crossLink}} instances, eg.
             *
             * ````
             * "xeogl.Geometry": {
             *   "alpha": <xeogl.Geometry>,
             *   "beta": <xeogl.Geometry>
             * },
             * "xeogl.Rotate": {
             *   "charlie": <xeogl.Rotate>,
             *   "delta": <xeogl.Rotate>,
             *   "echo": <xeogl.Rotate>,
             * },
             * //...
             * ````
             *
             * @property types
             * @type {String:{String:xeogl.Component}}
             */
            this.types = {};

            /**
             * The {{#crossLink "Object"}}Objects{{/crossLink}} in this Model, mapped to their IDs.
             *
             * @property objects
             * @final
             * @type {{String:Object}}
             */
            this.objects = {};

            /**
             * The {{#crossLink "Mesh"}}Meshes{{/crossLink}} in this Model, mapped to their IDs.
             **
             * @property meshes
             * @final
             * @type {String:xeogl.Mesh}
             */
            this.meshes = {};
        },

        _addComponent: function (component) {
            var componentId;
            var types;
            if (xeogl._isNumeric(component) || xeogl._isString(component)) { // Component ID
                component = this.scene.components[component];
                if (!component) {
                    this.warn("Component not found: " + xeogl._inQuotes(component));
                    return;
                }
            } else if (xeogl._isObject(component)) { // Component config
                var type = component.type || "xeogl.Component";
                if (!xeogl._isComponentType(type)) {
                    this.error("Not a xeogl component type: " + type);
                    return;
                }
                component = new window[type](this.scene, component);
            }
            if (component.scene !== this.scene) { // Component in wrong Scene
                this.error("Attempted to add component from different xeogl.Scene: " + xeogl._inQuotes(component.id));
                return;
            }
            if (this.components[component.id]) { // Component already in this Model
                return;
            }
            if (component.model && component.model.id !== this.id) { // Component in other Model
                component.model.remove(component); // Transferring to this Model
            }
            this.components[component.id] = component;
            types = this.types[component.type];
            if (!types) {
                types = this.types[component.type] = {};
            }
            types[component.id] = component;
            if (component.isType("xeogl.Mesh")) {
                this.meshes[component.id] = component;
            }
            if (component.isType("xeogl.Object")) {
                this.objects[component.id] = component;
            }
            this.numComponents++;
            component._addedToModel(this);
        },
        //
        // _addComponentOLD: function (component) {
        //     var types;
        //     if (component.scene !== this.scene) { // Component in wrong Scene
        //         this.warn("Attempted to add component from different xeogl.Scene: " + xeogl._inQuotes(component.id));
        //         return;
        //     }
        //     if (this.components[component.id]) {
        //         return;
        //     }
        //     if (component.model && component.model.id !== this.id) {
        //         component.model.remove(component);
        //     }
        //     this.components[component.id] = component;
        //     types = this.types[component.type];
        //     if (!types) {
        //         types = this.types[component.type] = {};
        //     }
        //     types[component.id] = component;
        //     if (component.isType("xeogl.Mesh")) {
        //         this.meshes[component.id] = component;
        //     }
        //     if (component.isType("xeogl.Object")) {
        //         this.objects[component.id] = component;
        //     }
        //     this.numComponents++;
        //     component._addedToModel(this);
        // },

        /**
         Destroys all {{#crossLink "Component"}}Components{{/crossLink}} in this Model.
         @method clear
         */
        clear: function () {
            // For efficiency, destroy Meshes first to avoid
            // xeogl's automatic default component substitutions
            // for (var id in this.meshes) {
            //     if (this.meshes.hasOwnProperty(id)) {
            //         this.meshes[id].off(this._onDestroyed[id]);
            //         this.meshes[id].off(this._onBoundary[id]);
            //         this.meshes[id].destroy();
            //     }
            // }
            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {
                    this.components[id].destroy(); // Groups in this Model will remove themselves when they're destroyed
                }
            }
            this.components = {};
            this.numComponents = 0;
            this.types = {};
            this.objects = {};
            this.meshes = {};
        },

        /**
         * @deprecated
         */
        destroyAll: function () {
            this.clear();
        },

        _destroy: function () {
            this._super();
            this.clear();
        }

        //--------------------------------------------------------------------------------------------------------------
        // Redefining comments for base class properties to help with documentation navigation
        //--------------------------------------------------------------------------------------------------------------

        /**
         The parent Group.

         The parent Group may also be set by passing this Model to the
         Group's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

         @property parent
         @type Group
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

        /**
         The axis-aligned World-space boundary of this Model.

         The AABB is represented by a six-element Float32Array containing the min/max extents of the
         axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

         @property aabb
         @final
         @type {Float32Array}
         */

        /**
         World-space oriented 3D bounding box (OBB) of this Model.

         The OBB is represented by a 32-element Float32Array containing the eight vertices of the box,
         where each vertex is a homogeneous coordinate having [x,y,z,w] elements.
         
         @property obb
         @final
         @type {Float32Array}
         */

        /**
         The World-space center of this Model.

         @final
         @returns {Float32Array}
         */

        /**
         Indicates whether this Model is visible or not.
         
         @property visible
         @default true
         @type Boolean
         */

        /**
         Indicates whether this Model appears selected.
         
         @property selected
         @default false
         @type Boolean
         */

        /**
         Indicates whether this Model is highlighted.
         
         @property highlighted
         @default false
         @type Boolean
         */

        /**
         Indicates whether or not this Model is currently culled from view.

         @property culled
         @default false
         @type Boolean
         */

        /**
         Indicates whether this Model is clippable.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         {{#crossLink "Mesh"}}Mesh{{/crossLink}}  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree are clipped by {{#crossLink "Clips"}}{{/crossLink}} components that are attached to them.

         @property clippable
         @default true
         @type Boolean
         */

        /**
         Indicates whether this Model is pickable or not.

         This is applied to all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

         @property pickable
         @default true
         @type Boolean
         */

        /**
         Indicates whether this Model is included in boundary calculations.

         This is applied to all  {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property collidable
         @default true
         @type Boolean
         */
        
        /**
         The IFC type of this Model, if applicable.

         @property ifcType
         @default null
         @type String
         */

        /**
         The Local-space position of this Model.

         @property position
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         The Model's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.

         @property rotation
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         The Local-space rotation quaternion for this Model.

         @property quaternion
         @default [0,0,0, 1]
         @type {Float32Array}
         */

        /**
         The Local-space scale of this Model.

         @property scale
         @default [0,0,0]
         @type {Float32Array}
         */

        /**
         * This Model's local matrix.
         *
         * @property matrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */

        /**
         * This Model's World matrix.
         *
         * @property worldMatrix
         * @type {Float32Array}
         */

        /**
         * This Model's World normal matrix.
         *
         * @property worldNormalMatrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */

        /**
         Rotates this Model about the given Local-space axis by the given increment.

         @method rotate
         @paream {Float32Array} axis The Local-space axis about which to rotate.
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Model about the given World-space axis by the given increment.

         @method rotate
         @paream {Float32Array} axis The local axis about which to rotate.
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Model about the Local-space X-axis by the given increment.

         @method rotateX
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Model about the Local-space Y-axis by the given increment.

         @method rotateY
         @param {Number} angle Angle increment in degrees.
         */

        /**
         Rotates this Model about the Local-space Z-axis by the given increment.

         @method rotateZ
         @param {Number} angle Angle increment in degrees.
         */

        /**
         * Translates this Model in Local-space by the given increment.
         *
         * @method translate
         * @param {Float32Array} axis Normalized local space 3D vector along which to translate.
         * @param {Number} distance Distance to translate along  the vector.
         */

        /**
         * Translates this Model along the Local-space X-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the X-axis.
         */

        /**
         * Translates this Model along the Local-space Y-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the Y-axis.
         */

        /**
         * Translates this Model along the Local-space Z-axis by the given increment.
         *
         * @method translateX
         * @param {Number} distance Distance to translate along  the Z-axis.
         */

        /**
         Whether this Model's axis-aligned bounding box (AABB) is visible.

         @property aabbVisible
         @default false
         @type {Boolean}
         */

        /**
         Whether this Model's object-aligned bounding box (OBB) is visible.

         @property obbVisible
         @default false
         @type {Boolean}
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
         Indicates whether this Model appears outlined.

         @property outlined
         @default false
         @type Boolean
         */

        /**
         Indicates whether this Model appears ghosted.

         @property outlined
         @default false
         @type Boolean
         */
    });

})();