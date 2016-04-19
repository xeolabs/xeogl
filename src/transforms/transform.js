/**
 A **Transform** defines a modelling matrix to transform attached {{#crossLink "Entity"}}Entities{{/crossLink}} or {{#crossLink "Model"}}Models{{/crossLink}}.

 <ul>
 <li>Sub-classes of Transform include: {{#crossLink "Translate"}}{{/crossLink}},
 {{#crossLink "Scale"}}{{/crossLink}}, {{#crossLink "Rotate"}}{{/crossLink}}, and {{#crossLink "Quaternion"}}{{/crossLink}}</li>
 <li>Instances of {{#crossLink "Transform"}}{{/crossLink}} and its sub-classes may be connected into hierarchies.</li>
 <li>When an {{#crossLink "Entity"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} is connected to a leaf {{#crossLink "Transform"}}{{/crossLink}}
 within a {{#crossLink "Transform"}}{{/crossLink}} hierarchy, it will be transformed by each {{#crossLink "Transform"}}{{/crossLink}}
 on the path up to the root, in that order.</li>
 <li>See <a href="./Shader.html#inputs">Shader Inputs</a> for the variables that Transform create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Transform.png"></img>

 ## Examples

 <ul>
 <li>[Transform hierarchy](../../examples/#transforms_hierarchy)</li>
 <li>[Attaching transforms to Models, via constructor](../../examples/#importing_gltf_techniques_configTransform)</li>
 <li>[Attaching transforms to Models, via property](../../examples/#importing_gltf_techniques_attachTransform)</li>
 </ul>

 ## Usage

 In this example we'll create the table shown below, which consists of five {{#crossLink "Entity"}}Entities{{/crossLink}}
 that share a {{#crossLink "BoxGeometry"}}{{/crossLink}} and each connect to a different leaf within a hierarchy of
 {{#crossLink "Translate"}}{{/crossLink}}, {{#crossLink "Rotate"}}{{/crossLink}} and {{#crossLink "Scale"}}{{/crossLink}}
 components. Each {{#crossLink "Entity"}}{{/crossLink}} also has its own {{#crossLink "PhongMaterial"}}{{/crossLink}} to
 give it a distinct color.

 <img src="../../../assets/images/transformHierarchy.png"></img>

 ````javascript
 // Shared Geometry
 var boxGeometry = new XEO.BoxGeometry();

 // Position of entire table
 var tablePos = new XEO.Translate({
    xyz: [0, 6, 0]
 });

 // Orientation of entire table
 var tableRotate = new XEO.Rotate({
    xyz: [1, 1, 1],
    angle: 0,
    parent: tablePos
 });

 // Red table leg
 var tableLeg1 = new XEO.Entity({
    geometry: boxGeometry,
    transform: new XEO.Scale({
        xyz: [1, 3, 1],
        parent: new XEO.Translate({
            xyz: [-4, -6, -4],
            parent: tableRotate
        })
    }),
    material: new XEO.PhongMaterial({
        diffuse: [1, 0.3, 0.3]
    })
 });

 // Green table leg
 var tableLeg2 = new XEO.Entity({
    geometry: boxGeometry,
    transform: new XEO.Scale({
        xyz: [1, 3, 1],
        parent: new XEO.Translate({
            xyz: [4, -6, -4],
            parent: tableRotate
        })
    }),
    material: new XEO.PhongMaterial({
        diffuse: [0.3, 1.0, 0.3]
    })
 });

 // Blue table leg
 var tableLeg3 = new XEO.Entity({
    geometry: boxGeometry,
    transform: new XEO.Scale({
        xyz: [1, 3, 1],
        parent: new XEO.Translate({
            xyz: [4, -6, 4],
            parent: tableRotate
        })
    }),
    material: new XEO.PhongMaterial({
        diffuse: [0.3, 0.3, 1.0]
    })
 });

 // Yellow table leg
 var tableLeg4 = new XEO.Entity({
    geometry: boxGeometry,
    transform: new XEO.Scale({
        xyz: [1, 3, 1],
        parent: new XEO.Translate({
            xyz: [-4, -6, 4],
            parent: tableRotate
        })
    }),
    material: new XEO.PhongMaterial({
        diffuse: [1.0, 1.0, 0.0]
    })
 });

 // Purple table top
 var tableTop = new XEO.Entity({
    geometry: boxGeometry,
    transform: new XEO.Scale({
        xyz: [6, 0.5, 6],
        parent: new XEO.Translate({
            xyz: [0, -3, 0],
            parent: tableRotate
        })
    }),
    material: new XEO.PhongMaterial({
        diffuse: [1.0, 0.3, 1.0]
    })
 });

 // Zoom camera out a bit
 // Get the Camera from one of the Entities
 tableTop.camera.view.zoom(10);

 // Spin the entire table

 var angle = 0;

 scene.on("tick", function () {
    angle += 0.5;
    tableRotate.angle = angle;
 });
 ````

 @class Transform
 @module XEO
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Transform in the
 default {{#crossLink "Scene"}}Scene{{/crossLink}}  when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Transform by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Transform.
 @param [cfg.parent] {String|Transform} ID or instance of a parent Transform within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.matrix=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Array of Number} One-dimensional, sixteen element array of elements for the Transform, an identity matrix by default.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Transform = XEO.Component.extend({

        type: "XEO.Transform",

        _init: function (cfg) {

            this._leafMatrixDirty = false;

            this._onParentUpdated = null;
            this._onParentDestroyed = null;

            var mat = XEO.math.identityMat4(XEO.math.mat4());
            var invMat = XEO.math.inverseMat4(mat, XEO.math.mat4());

            this._state = new XEO.renderer.ModelTransform({
                matrix: mat,
                normalMatrix: invMat
            });

            this.parent = cfg.parent;
            this.matrix = cfg.matrix;
        },

        _props: {

            /**
             * The parent Transform.
             *
             * Fires a {{#crossLink "Transform/parent:event"}}{{/crossLink}} event on change.
             *
             * @property parent
             * @type Transform
             */
            parent: {

                set: function (value) {

                    // Disallow cycle

                    if (value) {

                        var id = this.id;

                        for (var value2 = value; value2; value2 = value2._parent) {

                            if (id === value2.id) {
                                this.error("Not allowed to attach Transform as parent of itself - ignoring");
                                return;
                            }
                        }
                    }

                    // Unsubscribe from old parent's events

                    if (this._parent && (!value || value.id !== this._parent.id)) {
                        this._parent.off(this._onParentUpdated);
                        this._parent.off(this._onParentDestroyed);
                    }

                    this._parent = value;

                    /**
                     * Fired whenever this Transform's {{#crossLink "Transform/parent:property"}}{{/crossLink}} property changes.
                     * @event parent
                     * @param value The property's new value
                     */
                    this.fire("parent", this._parent);

                    if (this._parent) {
                        this._onParentUpdated = this._parent.on("updated", this._parentUpdated, this);
                        this._onParentDestroyed = this._parent.on("destroyed", this._parentUpdated, this);
                    }

                    this._parentUpdated();
                }
                ,

                get: function () {
                    return this._parent;
                }
            },

            /**
             * The Transform's local matrix.
             *
             * Fires a {{#crossLink "Transform/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             * @type {Array of Number}
             */
            matrix: {

                set: function (value) {

                    value = value || XEO.math.identityMat4();

                    if (!this._matrix) {
                        this._matrix = XEO.math.mat4();
                    }

                    this._matrix.set(value);

                    this._leafMatrixDirty = true;

                    /**
                     * Fired whenever this Transform's {{#crossLink "Transform/matrix:property"}}{{/crossLink}} property changes.
                     * @event matrix
                     * @param value The property's new value
                     */
                    this.fire("matrix", this._matrix);

                    this.fire("updated", true);
                },

                get: function () {
                    return this._matrix;
                }
            },


            /**
             * Returns the product of all {{#crossLink "Transform/matrix:property"}}{{/crossLink}}'s on Transforms
             * on the path via {{#crossLink "Transform/parent:property"}}{{/crossLink}} up to the root.
             *
             * The value of this property will have a fresh value after each
             * {{#crossLink "Transform/updated:property"}}{{/crossLink}} event, which is fired whenever any Transform
             * on the path receives an update for its {{#crossLink "Transform/matrix:property"}}{{/crossLink}} or
             * {{#crossLink "Transform/matrix:property"}}{{/crossLink}} property.
             *
             * @property matrix
             * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
             * @type {Array of Number}
             */
            leafMatrix: {

                get: function () {

                    if (this._leafMatrixDirty) {
                        this._buildLeafMatrix();
                    }

                    return this._state.matrix;
                }
            }
        },

        _parentUpdated: function () {

            this._leafMatrixDirty = true;

            /**
             * Fired whenever this Transform's {{#crossLink "Transform/leafMatrix:property"}}{{/crossLink}} property changes.
             *
             * This event does not carry the updated property value. Instead, subscribers will need to read
             * that property again to get its updated value (which may be lazy-computed then).
             *
             * @event updated
             */
            this.fire("updated", true);
        },

        // This is called if necessary when reading "leafMatrix", to update that property.
        // It's also called by Entity when the Transform is the leaf to which the
        // Entity is attached, in response to an "updated" event from the Transform.

        _buildLeafMatrix: function () {

            if (!this._leafMatrixDirty) {
                return;
            }

            this._state.matrix = this._state.matrix || XEO.math.identityMat4();

            if (!this._parent) {

                // No parent Transform;
                // copy matrix property into the render state's matrix

                var m1 = this._matrix;
                var m2 = this._state.matrix;

                for (var i = 0, len = m1.length; i < len; i++) {
                    m2[i] = m1[i];
                }

            } else {

                // Multiply parent's leaf matrix by this matrix,
                // store result in the render state's matrix

                XEO.math.mulMat4(this._parent.leafMatrix, this._matrix, this._state.matrix);
            }

            // Create normal matrix from inverse
            // of the state's matrix

            // TODO: only compute normal matrix on leaf!

            if (!this._state.normalMatrix) {
                this._state.normalMatrix = XEO.math.identityMat4();
            }

            XEO.math.inverseMat4(this._state.matrix, this._state.normalMatrix);
            XEO.math.transposeMat4(this._state.normalMatrix);

            this._renderer.imageDirty = true; //  TODO : Where should this go?

            this._leafMatrixDirty = false;
        },

        _compile: function () {
            this._renderer.modelTransform = this._state;
        },

        _getJSON: function () {
            return {
                matrix: Array.prototype.slice.call(this._matrix)
            };
        },

        _destroy: function () {
            if (this._parent) {
                this._parent.off(this._onParentUpdated);
                this._parent.off(this._onParentDestroyed);
            }
        }
    });

})();
