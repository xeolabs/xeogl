/**
 An **Object** is a 3D element within a xeogl {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 Object is an abstract base class that's subclassed by:

 * {{#crossLink "Mesh"}}{{/crossLink}}, which represents a drawable 3D primitive.
 * {{#crossLink "Group"}}{{/crossLink}}, which is a composite Object that represents a group of child Objects.
 * {{#crossLink "Model"}}{{/crossLink}}, which is a Group and is subclassed by {{#crossLink "GLTFModel"}}{{/crossLink}},
 {{#crossLink "STLModel"}}{{/crossLink}}, {{#crossLink "OBJModel"}}{{/crossLink}} etc. A Model can contain child Groups
 and Meshes that represent its component parts.

 As shown in the examples below, these component types can be connected into flexible scene hierarchies that contain
 content loaded from multiple sources and file formats. Since a Group implements the *[Composite](https://en.wikipedia.org/wiki/Composite_pattern)* pattern,
 property updates on a Group will apply recursively to all the Objects within it.

 ## Usage

 * [Creating an Object hierarchy](#creating-an-object-hierarchy)
   * [Accessing Objects](#accessing-objects)
   * [Updating Objects](#updating-objects)
   * [Adding and removing Objects](#updating-objects)
 * [Models within Groups](#models-within-groups)
 * [Objects within Models](#objects-within-models)
 * [Destroying Objects](#destroying-objects)

 ### Creating an Object hierarchy

 Let's create a Group that represents a table, with five child {{#crossLink "Mesh"}}{{/crossLink}}es for its top and legs:

 <a href="../../examples/#objects_hierarchy"><img src="../../assets/images/screenshots/objectHierarchy.png"></img></a>

 ````javascript
 var boxGeometry = new xeogl.BoxGeometry(); // We'll reuse the same geometry for all our Meshes

 var table = new xeogl.Group({

     id: "table",
     rotation: [0, 50, 0],
     position: [0, 0, 0],
     scale: [1, 1, 1],

     objects: [

         new xeogl.Mesh({ // Red table leg
             id: "redLeg",
             position: [-4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1, 0.3, 0.3]
             })
         }),

         new xeogl.Mesh({ // Green table leg
             id: "greenLeg",
             position: [4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 1.0, 0.3]
             })
         }),

         new xeogl.Mesh({// Blue table leg
             id: "blueLeg",
             position: [4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 0.3, 1.0]
             })
         }),

         new xeogl.Mesh({  // Yellow table leg
             id: "yellowLeg",
             position: [-4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 1.0, 0.0]
             })
         })

         new xeogl.Mesh({ // Purple table top
             id: "tableTop",
             position: [0, -3, 0],
             scale: [6, 0.5, 6],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 0.3, 1.0]
             })
         })
     ]
 });
 ````

 ### Accessing Objects

 We can then get those Mesh Objects by index from the Group's children property:

 ````javascript
 var blueLeg = table.children[2];
 blueLeg.highlighted = true;
 ````

 We can also get them by ID from the Group's childMap property:

 ````javascript
 var blueLeg = table.childMap["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or by ID from the Scene's components map:

 ````javascript
 var blueLeg = table.scene.components["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or from the Scene's objects map (only Objects are in this map, and Meshes are Objects):

 ````javascript
 var blueLeg = table.scene.objects["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or from the Scene's meshes map (only Meshes are in that map):

 ````javascript
 var blueLeg = table.scene.meshes["blueLeg"];
 blueLeg.highlighted = true;
 ````

 For convenience, the Scene's objects map explicitly registers what Objects exist within the Scene, while its meshes map
 explicitly registers what Meshes exist.

 ### Updating Objects

 As mentioned earlier, property updates on a Group will apply recursively to all the Objects within it. Let's highlight
 the whole table in one shot:

 ````javascript
 table.highlighted = true;
 ````

 and just for fun, let's rotate the table, then lift the table top up a bit:

 ````javascript
 table.rotation = [0, 45, 0]; // (X,Y,Z)
 table.childMap["tableTop"].position = [0, -10, 0]; // (X,Y,Z)
 ````

 We can also query the World-space axis-aligned boundary of the whole table:

 ````javascript
 var aabb = table.aabb;

 var cameraFlight = new xeogl.CameraFlightAnimation(); // Fit the boundary in view
 cameraFlight.flyTo(aabb);
 ````

 and we can also query its World-space object-aligned boundary:

 ````javascript
 var obb = table.obb;
 ````

 Those boundaries will automatically update whenever we add or remove child Meshes, or update the Meshes' Geometries
 or transforms.

 We can subscribe to boundary updates on our Group, like this:

 ````javascript
 table.on("boundary", function() {
     var aabb = table.aabb;
     var obb = table.obb;
 });
 ````

 ### Adding and removing Objects

 Let's add another Mesh to our table Group, a sort of spherical ornament sitting on the table top:

 ````javascript
 table.addChild(new xeogl.Mesh({
     id: "myExtraObject",
     geometry: new xeogl.SphereGeometry({ radius: 1.0 }),
     position: [2, -3, 0],
     geometry: boxGeometry,
     material: new xeogl.PhongMaterial({
         diffuse: [0.3, 0.3, 1.0]
     })
 });
 ````

 That's going to update the Group's boundary, as mentioned earlier.

 To remove it, we just destroy it:

 ````javascript
 table.childMap["myExtraObject"].destroy();
 ````

 ### Models within Groups

 Now let's create a Group that contains three Models. Recall that Models are Groups, which are Objects.

 <a href="../../examples/#objects_hierarchy_models"><img src="../../assets/images/screenshots/modelHierarchy.png"></img></a>

 ````javascript
 var myModels = new xeogl.Group({

     rotation: [0, 0, 0],
     position: [0, 0, 0],
     scale: [1, 1, 1],

     children: [

         new xeogl.GLTFModel({
             id: "engine",
             src: "models/gltf/2CylinderEngine/glTF/2CylinderEngine.gltf",
             scale: [.2, .2, .2],
             position: [-110, 0, 0],
             rotation: [0, 90, 0],
             objectTree: true // <<----------------- Loads Object tree from glTF scene node graph
         }),

         new xeogl.GLTFModel({
             id: "hoverBike",
             src: "models/gltf/hover_bike/scene.gltf",
             scale: [.5, .5, .5],
             position: [0, -40, 0]
         }),

         new xeogl.STLModel({
             id: "f1Car",
             src: "models/stl/binary/F1Concept.stl",
             smoothNormals: true,
             scale: [3, 3, 3],
             position: [110, -20, 60],
             rotation: [0, 90, 0]
         })
     ]
 });
 ````

 Like with the {{#crossLink "Mesh"}}{{/crossLink}} Objects in the previous example, we can then get those Models by index from the Group's children property:

 ````javascript
 var hoverBike = myModels.children[1];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 or by ID from the Group's childMap property:

 ````javascript
 var hoverBike = myModels.childMap["hoverBike"];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 or by ID from the Scene's components map:

 ````javascript
 var hoverBike = myModels.scene.components["hoverBike"];
 hoverBike.scale = [0.75, 0.75, 0.75];
 ````

 or from the Scene's objects map (only Objects are in this map, and Models are Objects):

 ````javascript
 var hoverBike = myModels.scene.objects["hoverBike"];
 hoverBike.scale = [0.75, 0.75, 0.75];
 ````

 or from the Scene's models map (which only contains Models):

 ````javascript
 var hoverBike = myModels.scene.models["hoverBike"];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 For convenience, the Scene's objects map explicitly registers what Objects exist within the Scene, while its models map
 explicitly registers what Models exist.

 As mentioned earlier, property updates on a Group will apply recursively to all the Objects within it. Let's highlight
 all the Models in the Group, in one shot:

 ````javascript
 myModels.highlighted = true;
 ````

 and just for fun, let's scale the Group down, then rotate one of the Models, relative to the Group:

 ````javascript
 myModels.scale = [0.5, 0.5, 0.5]; // (X,Y,Z)
 myModels.childMap["engine"].rotation = [0, 45, 0]; // (X,Y,Z)
 ````

 ### Objects within Models

 Notice the ````objectTree```` configuration on the first child {{#crossLink "GLTFModel"}}{{/crossLink}} in the previous
 example. That's going to cause the GLTFModel (which is a Group) to create one or more subtrees of child Objects from the
 glTF scene node graph. The root Objects of the subtrees will be available in the GLTFModel's {{#crossLink "GLTFModel/children:property"}}{{/crossLink}} and {{#crossLink "GLTFModel/childMap:property"}}{{/crossLink}}
 properties, while all the Objects in the subtrees will be available in the GLTFModel's objects property, and all the {{#crossLink "Mesh"}}{{/crossLink}}es at the
 leaves of the subtrees will be available in the GLTFModel's objects property.


 {{#crossLink "Component/id:property"}}{{/crossLink}}

 TODO:

 ````javascript
 models.childMap["engine"].childMap["engine#0"].highlighted = true;
 ````

 ````javascript
 models.childMap["engine"].objects["engine#3.0"].highlighted=true;
 ````

 ````javascript
 models.childMap["engine"].meshes["engine#3.0"].highlighted=true;
 ````

 ### Destroying Objects

 Call an Object's {{#crossLink "Component/destroy:method"}}destroy(){{/crossLink}} method to destroy it:

 ````JavaScript
 myObject.destroy();
 ````

 That will also destroy all Objects in its subtree.

 @class Object
 @module xeogl
 @submodule objects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this xeogl.Object.
 @param [cfg.objects] {Array(Object)} Child Objects to attach to this Object.
 @param [cfg.parent] The parent Object.
 @param [cfg.visible=true] {Boolean}  Indicates if this Object is visible.
 @param [cfg.culled=true] {Boolean}  Indicates if this Object is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this Object is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this Object is clippable.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this Object.
 @param [cfg.ghosted=false] {Boolean} Whether this Object is rendered as ghosted.
 @param [cfg.highlighted=false] {Boolean} Whether this Object is rendered as highlighted.
 @param [cfg.selected=false] {Boolean} Whether this Object is rendered as selected.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.aabbVisible=false] {Boolean} Whether this Object's axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean} Whether this Object's oriented World-space bounding box is visible.
 @param [cfg.position=[0,0,0]] {Float32Array} The Object's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The Object's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The Object's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The Object's local modelling transform matrix. Overrides the position, scale and rotation parameters.

 @extends Component
 */
xeogl.Object = xeogl.Component.extend({

    /**
     JavaScript class name for this xeogl.Object.

     @property type
     @type String
     @final
     */
    type: "xeogl.Object",

    _init: function (cfg) {

        // Object base class responsibilities
        //  - connects to parent
        //  - builds Local matrix
        //  - builds World matrix

        this._parent = null;

        var math = xeogl.math;

        this._scale = math.vec3();
        this._quaternion = math.identityQuaternion();
        this._rotation = math.vec3();
        this._position = math.vec3();

        this._localMatrix = math.identityMat4();
        this._worldMatrix = math.identityMat4();
        this._worldNormalMatrix = math.identityMat4();

        this._localMatrixDirty = true;
        this._worldMatrixDirty = true;
        this._worldNormalMatrixDirty = true;

        if (cfg.matrix) {
            this.matrix = cfg.matrix;
        } else {
            this.scale = cfg.scale;
            this.position = cfg.position;
            if (cfg.quaternion) {
            } else {
                this.rotation = cfg.rotation;
            }
        }

        this.ifcType = cfg.ifcType;
        this.aabbVisible = cfg.aabbVisible;
        this.obbVisible = cfg.obbVisible;

        if (cfg.parent) {
            cfg.parent.addChild(this);
        }
    },

    _setLocalMatrixDirty: function () { // Redefined by xeogl.Group to include child Objects
        this._localMatrixDirty = true;
        this._setWorldMatrixDirty();
    },

    _setWorldMatrixDirty: function () {
        this._worldMatrixDirty = true;
        this._worldNormalMatrixDirty = true;
    },

    _buildLocalMatrix: function () {
        xeogl.math.composeMat4(this._position, this._quaternion, this._scale, this._localMatrix);
        this._localMatrixDirty = false;
    },

    _buildWorldMatrix: function () {
        if (this._localMatrixDirty) {
            this._buildLocalMatrix();
        }
        if (!this._parent) {
            for (var i = 0, len = this._localMatrix.length; i < len; i++) {
                this._worldMatrix[i] = this._localMatrix[i];
            }
        } else {
            xeogl.math.mulMat4(this._parent.worldMatrix, this._localMatrix, this._worldMatrix);
          //  xeogl.math.mulMat4(this._localMatrix, this._parent.worldMatrix, this._worldMatrix);
        }
        this._worldMatrixDirty = false;
    },

    _buildWorldNormalMatrix: function () {
        if (this._worldMatrixDirty) {
            this._buildWorldMatrix();
        }
        if (!this._worldNormalMatrix) {
            this._worldNormalMatrix = xeogl.math.mat4();
        }
        xeogl.math.inverseMat4(this._worldMatrix, this._worldNormalMatrix);
        xeogl.math.transposeMat4(this._worldNormalMatrix);
        this._worldNormalMatrixDirty = false;
    },

    _props: {

        /**
         The IFC type of this Object, if applicable.

         @property ifcType
         @default null
         @type String
         */
        ifcType: {
            set: function (ifcType) {
                ifcType = ifcType || "DEFAULT";
                if (this._ifcType !== ifcType) {
                    var ifcTypeObjects = this.scene.ifcTypes;
                    if (this._ifcType) {
                        var objectsOfType = ifcTypeObjects[this._ifcType];
                        if (objectsOfType) {
                            delete objectsOfType[this.id];
                            // TODO remove submap if now empty
                        }
                    }
                    this._ifcType = ifcType;
                    objectsOfType = ifcTypeObjects[this._ifcType];
                    if (!objectsOfType) {
                        objectsOfType = {};
                        ifcTypeObjects[this._ifcType] = objectsOfType;
                    }
                    objectsOfType[this.id] = this;
                }
            },
            get: function () {
                return this._ifcType;
            }
        },

        /**
         The parent Group/Model.

         The parent Group may also be set by passing this Object to the
         Group's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

         @property parent
         @type Group
         */
        parent: {
            set: function (object) {
                if (xeogl._isNumeric(object) || xeogl._isString(object)) {
                    var objectId = object;
                    object = this.scene.objects[objectId];
                    if (!object) {
                        this.warn("Group not found: " + xeogl._inQuotes(objectId));
                        return;
                    }
                }
                if (object.scene.id !== this.scene.id) {
                    this.error("Group not in same Scene: " + object.id);
                    return;
                }
                if (this._parent && this._parent.id === object.id) {
                    this.warn("Already a child of Group: " + object.id);
                    return;
                }
                object.addChild(this);
            },
            get: function () {
                return this._parent;
            }
        },

        /**
         The Local-space position of this Object.

         @property position
         @default [0,0,0]
         @type {Float32Array}
         */
        position: {
            set: function (value) {
                this._position.set(value || [0, 0, 0]);
                this._setLocalMatrixDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._position;
            }
        },

        /**
         The Object's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.

         @property rotation
         @default [0,0,0]
         @type {Float32Array}
         */
        rotation: {
            set: function (value) {
                this._rotation.set(value || [0, 0, 0]);
                xeogl.math.eulerToQuaternion(this._rotation, "XYZ", this._quaternion);
                this._setLocalMatrixDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._rotation;
            }
        },

        /**
         The Local-space rotation quaternion for this Object.

         @property quaternion
         @default [0,0,0, 1]
         @type {Float32Array}
         */
        quaternion: {
            set: function (value) {
                this._quaternion.set(value || [0, 0, 0, 1]);
                xeogl.math.quaternionToEuler(this._quaternion, "XYZ", this._rotation);
                this._setLocalMatrixDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._quaternion;
            }
        },

        /**
         The Local-space scale of this Object.

         @property scale
         @default [0,0,0]
         @type {Float32Array}
         */
        scale: {
            set: function (value) {
                this._scale.set(value || [1, 1, 1]);
                this._setLocalMatrixDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._scale;
            }
        },

        /**
         * This Object's local matrix.
         *
         * @property matrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */
        matrix: {
            set: (function () {
                var identityMat = xeogl.math.identityMat4();
                return function (value) {
                    this._localMatrix.set(value || identityMat);
                    xeogl.math.decomposeMat4(this._localMatrix, this._position, this._quaternion, this._scale);
                    this._localMatrixDirty = false;
                    this._setWorldMatrixDirty();
                    this._renderer.imageDirty();
                };
            })(),
            get: function () {
                if (this._localMatrixDirty) {
                    this._buildLocalMatrix();
                }
                return this._localMatrix;
            }
        },

        /**
         * This Object's World matrix.
         *
         * @property worldMatrix
         * @type {Float32Array}
         */
        worldMatrix: {
            get: function () {
                if (this._worldMatrixDirty) {
                    this._buildWorldMatrix();
                }
                return this._worldMatrix;
            }
        },

        /**
         * This Object's World normal matrix.
         *
         * @property worldNormalMatrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */
        worldNormalMatrix: {
            get: function () {
                if (this._worldNormalMatrixDirty) {
                    this._buildWorldNormalMatrix();
                }
                return this._worldNormalMatrix;
            }
        },

        // worldPosition: {
        //     get: function (optionalTarget) {
        //         var result = optionalTarget || new Vector3();
        //         this.updateMatrixWorld(true);
        //         return result.setFromMatrixPosition(this.matrixWorld);
        //     }
        // },
        //
        // worldQuaternion: {
        //     get: function () {
        //         var position = new Vector3();
        //         var scale = new Vector3();
        //         return function getWorldQuaternion(optionalTarget) {
        //             var result = optionalTarget || new Quaternion();
        //             this.updateMatrixWorld(true);
        //             this.matrixWorld.decompose(position, result, scale);
        //             return result;
        //         };
        //     }()
        // },
        //
        // worldRotation: {
        //     get: function () {
        //         var quaternion = new Quaternion();
        //         return function getWorldRotation(optionalTarget) {
        //             var result = optionalTarget || new Euler();
        //             this.getWorldQuaternion(quaternion);
        //             return result.setFromQuaternion(quaternion, this.rotation.order, false)
        //         };
        //     }
        // }(),
        //
        // worldScale: {
        //     get: (function () {
        //         var position = new Float32Array(3);
        //         var quaternion = new Float32Array(4);
        //         return function getWorldScale(optionalTarget) {
        //             var result = optionalTarget || new Float32Array(3);
        //             xeogl.math.decomposeMat4(this.worldMatrix, position, quaternion, result);
        //             return result;
        //         };
        //     })()
        // },
        //
        // worldDirection: {
        //     get: (function () {
        //         var quaternion = new Quaternion();
        //         return function getWorldDirection(optionalTarget) {
        //             var result = optionalTarget || new Vector3();
        //             this.getWorldQuaternion(quaternion);
        //             return result.set(0, 0, 1).applyQuaternion(quaternion);
        //         };
        //     })()
        // },

        /**
         Whether this Object's axis-aligned bounding box (AABB) is visible.

         @property aabbVisible
         @default false
         @type {Boolean}
         */
        aabbVisible: {
            set: function (show) {
                if (!show && !this._aabbHelper) {
                    return;
                }
                if (!this._aabbHelper) {
                    this._aabbHelper = new xeogl.Mesh(this, {
                        geometry: new xeogl.AABBGeometry(this, {
                            target: this
                        }),
                        material: new xeogl.PhongMaterial(this, {
                            diffuse: [0.5, 1.0, 0.5],
                            emissive: [0.5, 1.0, 0.5],
                            lineWidth: 2
                        })
                    });
                }
                this._aabbHelper.visible = show;
            },
            get: function () {
                return this._aabbHelper ? this._aabbHelper.visible : false;
            }
        },

        /**
         Whether this Object's object-aligned bounding box (OBB) is visible.

         @property obbVisible
         @default false
         @type {Boolean}
         */
        obbVisible: {
            set: function (show) {
                if (!show && !this._obbHelper) {
                    return;
                }
                if (!this._obbHelper) {
                    this._obbHelper = new xeogl.Mesh(this, {
                        geometry: new xeogl.OBBGeometry(this, {
                            target: this
                        }),
                        material: new xeogl.PhongMaterial(this, {
                            diffuse: [0.5, 1.0, 0.5],
                            emissive: [0.5, 1.0, 0.5],
                            lineWidth: 2
                        })
                    });
                }
                this._obbHelper.visible = show;
            },
            get: function () {
                return this._obbHelper ? this._obbHelper.visible : false;
            }
        }

        /**
         Set true to show the axis-aligned bounding box (AABB) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property aabbHierarchyVisible
         @type {Boolean}
         */

        /**
         Set true to show the object-aligned bounding box (obb) of all {{#crossLink "Object"}}Objects{{/crossLink}} in the subtree.

         @property obbHierarchyVisible
         @type {Boolean}
         */
    },

    /**
     Rotates this Object about the given Local-space axis by the given increment.

     @method rotate
     @paream {Float32Array} axis The Local-space axis about which to rotate.
     @param {Number} angle Angle increment in degrees.
     */
    rotate: (function () {
        // rotate object on axis in world space
        // axis is assumed to be normalized
        // method assumes no rotated parent
        var angleAxis = new Float32Array(4);
        var q1 = new Float32Array(4);
        var q2 = new Float32Array(4);
        return function rotateOnWorldAxis(axis, angle) {
            angleAxis[0] = axis[0];
            angleAxis[1] = axis[1];
            angleAxis[2] = axis[2];
            angleAxis[3] = angle * xeogl.math.DEGTORAD;
            xeogl.math.angleAxisToQuaternion(angleAxis, q1);
            xeogl.math.mulQuaternions(this.quaternion, q1, q2);
            this.quaternion = q2;
            this._setWorldMatrixDirty();
            this._renderer.imageDirty();
            return this;
        };
    })(),

    /**
     Rotates this Object about the given World-space axis by the given increment.

     @method rotate
     @paream {Float32Array} axis The local axis about which to rotate.
     @param {Number} angle Angle increment in degrees.
     */
    rotateOnWorldAxis: (function () {
        // rotate object on axis in world space
        // axis is assumed to be normalized
        // method assumes no rotated parent
        var angleAxis = new Float32Array(4);
        var q1 = new Float32Array(4);
        return function rotateOnWorldAxis(axis, angle) {
            angleAxis[0] = axis[0];
            angleAxis[1] = axis[1];
            angleAxis[2] = axis[2];
            angleAxis[3] = angle * xeogl.math.DEGTORAD;
            xeogl.math.angleAxisToQuaternion(angleAxis, q1);
            xeogl.math.mulQuaternions(q1, this.quaternion, q1);
            //this.quaternion.premultiply(q1);
            return this;
        };
    })(),

    /**
     Rotates this Object about the Local-space X-axis by the given increment.
     
     @method rotateX
     @param {Number} angle Angle increment in degrees. 
     */
    rotateX: (function () {
        var axis = new Float32Array([1, 0, 0]);
        return function rotateX(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     Rotates this Object about the Local-space Y-axis by the given increment.

     @method rotateY
     @param {Number} angle Angle increment in degrees.
     */
    rotateY: (function () {
        var axis = new Float32Array([0, 1, 0]);
        return function rotateY(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     Rotates this Object about the Local-space Z-axis by the given increment.

     @method rotateZ
     @param {Number} angle Angle increment in degrees.
     */
    rotateZ: (function () {
        var axis = new Float32Array([0, 0, 1]);
        return function rotateZ(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     * Translates this Object in Local-space by the given increment.
     *
     * @method translate
     * @param {Float32Array} axis Normalized local space 3D vector along which to translate.
     * @param {Number} distance Distance to translate along  the vector.
     */
    translate: (function () {
        var veca = new Float32Array(3);
        var vecb = new Float32Array(3);
        return function (axis, distance) {
            xeogl.math.vec3ApplyQuaternion(this.quaternion, axis, veca);
            xeogl.math.mulVec3Scalar(veca, distance, vecb);
            xeogl.math.addVec3(this.position, vecb, this.position);
            this._setWorldMatrixDirty();
            this._renderer.imageDirty();
            return this;
        };
    })(),

    /**
     * Translates this Object along the Local-space X-axis by the given increment.
     *
     * @method translateX
     * @param {Number} distance Distance to translate along  the X-axis.
     */
    translateX: (function () {
        var v1 = new Float32Array([1, 0, 0]);
        return function translateX(distance) {
            return this.translate(v1, distance);
        };
    })(),

    /**
     * Translates this Object along the Local-space Y-axis by the given increment.
     *
     * @method translateX
     * @param {Number} distance Distance to translate along  the Y-axis.
     */
    translateY: (function () {
        var v1 = new Float32Array([0, 1, 0]);
        return function translateY(distance) {
            return this.translate(v1, distance);
        };
    })(),

    /**
     * Translates this Object along the Local-space Z-axis by the given increment.
     *
     * @method translateX
     * @param {Number} distance Distance to translate along  the Z-axis.
     */
    translateZ: (function () {
        var v1 = new Float32Array([0, 0, 1]);
        return function translateZ(distance) {
            return this.translate(v1, distance);
        };
    })(),

    _destroy: function () {
        if (this._parent) {
            this._parent.removeChild(this);
        }
        var objectsOfType = this.scene.ifcTypes[this._ifcType];
        if (objectsOfType) {
            delete objectsOfType[this.id];
            // TODO remove submap if now empty
        }
    }

    /**
     The axis-aligned World-space boundary of this Object.

     This encloses all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The AABB is represented by a six-element Float32Array containing the min/max extents of the
     axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

     @property aabb
     @final
     @type {Float32Array}
     */

    /**
     Whether this Object's axis-aligned bounding box (AABB) is visible.

     @property aabbVisible
     @default false
     @type {Boolean}
     */

    /**
     World-space oriented 3D bounding box (OBB) of this object.

     This encloses all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

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
     Whether this Object's object-aligned bounding box (OBB) is visible.

     @property obbVisible
     @default false
     @type {Boolean}
     */

    /**
     The World-space center of this Object.

     This is the collective center of all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     @final
     @returns {Float32Array}
     */

    /**
     Indicates whether this Object is visible or not.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

     @property visible
     @default true
     @type Boolean
     */

    /**
     Indicates whether this Object is highlighted.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The highlight effect is configured via the
     {{#crossLink "Mesh/highlightMaterial:property"}}highlightMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
     within this Object's subtree.

     @property highlighted
     @default false
     @type Boolean
     */

    /**
     Indicates whether this Object appears selected.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The selected effect is configured via the
     {{#crossLink "Mesh/selectedMaterial:property"}}selectedMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
     within this Object's subtree.

     @property selected
     @default false
     @type Boolean
     */

    /**
     Indicates whether or not this Object is currently culled from view.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The Object is only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

     @property culled
     @default false
     @type Boolean
     */

    /**
     Indicates whether this Object is clippable.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     Meshes are clipped by {{#crossLink "Clips"}}{{/crossLink}} components that are attached to them.

     @property clippable
     @default true
     @type Boolean
     */

    /**
     Indicates whether this Object is pickable or not.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

     @property pickable
     @default true
     @type Boolean
     */

    /**
     Indicates whether this Object appears outlined.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The outlined effect is configured via the
     {{#crossLink "Mesh/outlineMaterial:property"}}outlineMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
     within this Object's subtree.

     @property outlined
     @default false
     @type Boolean
     */

    /**
     Indicates whether this Object appears ghosted.

     This is applied to all the {{#crossLink "Mesh"}}Meshes{{/crossLink}} within the Object's subtree.

     The ghosted effect is configured via the
     {{#crossLink "Mesh/ghostMaterial:property"}}ghostMaterial{{/crossLink}} on the {{#crossLink "Mesh"}}Meshes{{/crossLink}}
     within this Object's subtree.

     @property outlined
     @default false
     @type Boolean
     */

    /**
     RGB colorize color, multiplies by the rendered fragment colors.

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

});