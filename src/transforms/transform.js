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
 @param [cfg.matrix=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Float32Array} One-dimensional, sixteen element array of elements for the Transform, an identity matrix by default.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Transform = XEO.Component.extend({

        type: "XEO.Transform",

        _init: function (cfg) {

            this._onParentUpdated = null;
            this._onParentDestroyed = null;

            this._matrix = XEO.math.identityMat4(XEO.math.mat4());
            this._leafMatrix = XEO.math.mat4();
            this._leafNormalMatrix = XEO.math.mat4();

            this._leafMatrixDirty = true;
            this._leafNormalMatrixDirty = true;

            var self = this;

            this._state = new XEO.renderer.Transform({

                // Lazy-generate leaf matrices as we render because it's only
                // at this point that we actually know that we need them.

                getMatrix: function () {
                    if (self._leafMatrixDirty) { // TODO: Or schedule matrix rebuild to task queue if not urgent?
                        self._buildLeafMatrix();
                    }
                    return self._leafMatrix;
                },

                getNormalMatrix: function () {
                    if (self._leafNormalMatrixDirty) {
                        self._buildLeafNormalMatrix();
                    }
                    return self._leafNormalMatrix;
                }
            });

            this.parent = cfg.parent;
            this.matrix = cfg.matrix;
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

            if (this._build && this._buildScheduled) {
                this._build();
                this._buildScheduled = false;
            }

            if (!this._parent) {

                // No parent Transform

                for (var i = 0, len = this._matrix.length; i < len; i++) {
                    this._leafMatrix[i] = this._matrix[i];
                }

            } else {

                // Multiply parent's leaf matrix by this matrix,
                // store result in this leaf matrix

                XEO.math.mulMat4(this._parent.leafMatrix, this._matrix, this._leafMatrix);
            }

            this._renderer.imageDirty = true;

            this._leafMatrixDirty = false;
            this._leafNormalMatrixDirty = true;
        },

        _buildLeafNormalMatrix: function () {

            if (this._leafMatrixDirty) {
                this._buildLeafMatrix();
            }

            XEO.math.inverseMat4(this._leafMatrix, this._leafNormalMatrix);
            XEO.math.transposeMat4(this._leafNormalMatrix);

            this._renderer.imageDirty = true;

            this._leafNormalMatrixDirty = false;
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
                },

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
             * @type {Float32Array}
             */
            matrix: {

                set: function (value) {

                    this._matrix.set(value || XEO.math.identityMat4());

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

                    if (this._updateScheduled) {
                        this._doUpdate();
                    }

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
             * @type {Float32Array}
             */
            leafMatrix: {

                get: function () {

                    if (this._leafMatrixDirty) {
                        this._buildLeafMatrix();
                    }

                    return this._leafMatrix;
                }
            }
        },

        _getJSON: function () {
            var json = {
                matrix: Array.prototype.slice.call(this._matrix)
            };
            if (this._parent) {
                json.parent = this._parent.id;
            }
            return json;
        },

        _destroy: function () {
            if (this._parent) {
                this._parent.off(this._onParentUpdated);
                this._parent.off(this._onParentDestroyed);
            }
        }
    });

})();
