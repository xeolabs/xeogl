/**
 A **Pin** is a pinned position on the surface of a {{#crossLink "Mesh"}}{{/crossLink}}.

 ## Overview

 #### Position

 A Pin is positioned within one of the triangles of its {{#crossLink "Mesh"}}Mesh's{{/crossLink}} {{#crossLink "Geometry"}}{{/crossLink}}. Wherever that triangles goes within the 3D view, the Pin will automatically follow. An Pin specifies its position with two properties:

 * {{#crossLink "Pin/primIndex:property"}}{{/crossLink}}, which indicates the index of the triangle within the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/indices:property"}}{{/crossLink}}, and
 * {{#crossLink "Pin/bary:property"}}{{/crossLink}}, the barycentric coordinates of the position within the triangle.

 From these, an Pin dynamically calculates its Cartesian coordinates, which it provides in each xeogl coordinate space:

 * {{#crossLink "Pin/localPos:property"}}{{/crossLink}} - 3D position local to the coordinate space of the {{#crossLink "Geometry"}}{{/crossLink}},
 * {{#crossLink "Pin/worldPos:property"}}{{/crossLink}} - 3D World-space position,
 * {{#crossLink "Pin/viewPos:property"}}{{/crossLink}} - 3D View-space position, and
 * {{#crossLink "Pin/canvasPos:property"}}{{/crossLink}} - 2D Canvas-space position.

 An Pin automatically recalculates these coordinates whenever its {{#crossLink "Mesh"}}{{/crossLink}} is replaced or transformed, the {{#crossLink "Geometry"}}{{/crossLink}} is replaced or modified, or the {{#crossLink "Camera"}}{{/crossLink}} is moved.

 #### Visibility

 * {{#crossLink "Pin/occludable:property"}}{{/crossLink}} specifies whether the Pin becomes invisible whenever its occluded by other objects in the 3D view, and
 * {{#crossLink "Pin/visible:property"}}{{/crossLink}} indicates if the Pins is currently visible.

 * To determine if each Pin is occluded, xeogl renders the scene to a hidden framebuffer, along with a colored point for each Pin's position. Then xeogl determines each Pin to be occluded if the pixel at its position does not match the special pin color. The color is configured as some unusual color that is not used elsewhere in the scene.

 ## Example

 In the example below we'll create an {{#crossLink "Mesh"}}{{/crossLink}} with a {{#crossLink "TorusGeometry"}}{{/crossLink}}, then attach a Pin to it. Then we'll subscribe to changes to the Pin's position and visibility status.
 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TorusGeometry(),
    transform: new xeogl.Translate({
        xyz: [0,0,0]
    });
 });

 var pin = new xeogl.Pin({
    mesh: mesh,
    primIndex: 12,              // Triangle index in Geometry indices array
    bary: [0.11, 0.79, 0.08]    // Barycentric coordinates in the triangle
 });

 var localPos   = pin.localPos;     // 3D Local-space position
 var worldPos   = pin.worldPos;     // 3D World-space position
 var viewPos    = pin.viewPos;      // 3D View-space position
 var canvasPos  = pin.canvasPos;    // 2D Canvas-space position

 // Listen for change of the Pin's Local-space cartesian position,
 // which is caused by modification of Pin's Geometry or update to
 // the Pin's 'primIndex' or 'bary' properties.
 pin.on("localPos", function() {
    //...
 });

 // Listen for change of the Pin's World-space cartesian position,
 // which is caused by update of Pin's Local-space position or by
 // animation of the Mesh by its modelling Transform.
 pin.on("worldPos", function() {
    //...
 });

 // Listen for change of Pin visibility. The Pin becomes invisible when it
 // falls outside the canvas, or when an object occludes the Pin's position
 // in the 3D view.
 pin.on("visible", function(visible) { // Pin visibility has changed
    if (visible) {
        this.log("Pin is not occluded and within canvas.");
    } else {
        this.log("Pin is either occluded or is off the canvas.");
    }
 });
 ````
 @class Pin
 @module xeogl
 @submodule annotations
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Pin in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Pin.
 @param [cfg.mesh] {Number|String|Mesh} ID or instance of the {{#crossLink "Mesh"}}{{/crossLink}} the Pin is attached to.
 @param [cfg.primIndex=0] {Number} Index of the triangle containing the Pin. Within the {{#crossLink "Mesh"}}Mesh's{{/crossLink}} {{#crossLink "Geometry/indices:property"}}Geometry indices{{/crossLink}}, this is the index of the first vertex for the triangle.
 @param [cfg.bary=[0.3,0.3,0.3]] {Float32Array} Barycentric coordinates of the Pin within its triangle.
 @param [cfg.offset=0.2] {Number} How far the Pin is lifted out of its triangle, along the surface normal vector. This is used when occlusion culling, to ensure that the Pin is not lost inside the surface it's attached to.
 @param [cfg.occludable=false] {Boolean} Indicates whether occlusion testing is performed for the Pin, where it will be flagged invisible whenever it's hidden by something else in the 3D view.
 @extends Component
 */
{
    const math = xeogl.math;

    const tempVec3a = math.vec3();
    const tempVec3b = math.vec3();
    const tempVec3c = math.vec3();
    const tempVec3d = math.vec3();
    const tempVec4a = math.vec4([0, 0, 0, 1]);
    const tempVec4b = math.vec4();

    const PIN_COLOR = math.vec3([1.0, 1.0, 0.0]);

    // Do occlusion test per this number of ticks. Having a high-ish number
    // gives a nice hysteresis where, when occluded, the label remains visible
    // for a moment before disappearing, which feels smooth.
    const TEST_TICKS = 20;

    // Each Scene gets a VisibilityTester, which periodically tests if registered
    // pins are visible, which is when they are within the canvas boundary and
    // are not obscured by any objects in the 3D view.

    const VisibilityTester = function (scene) {

        this._scene = scene;
        this._pins = {};
        this._markers = {};
        this._testablePins = {};

        let countDown = TEST_TICKS;

        scene.on("tick", function () {
            if (--countDown <= 0) {
                this._runTest();
                countDown = TEST_TICKS;
            }
        }, this);
    };

    VisibilityTester.prototype._runTest = (function () {

        const testList = [];
        const pixels = [];
        const colors = [];

        return function () {

            const canvas = this._scene.canvas;
            let pin;
            let canvasPos;
            let canvasX;
            let canvasY;
            let lenPixels = 0;
            let i;
            const boundary = canvas.boundary;
            const canvasWidth = boundary[2];
            const canvasHeight = boundary[3];
            let testListLen = 0;

            // Hide pins that fall outside canvas

            for (const id in this._testablePins) {
                if (this._testablePins.hasOwnProperty(id)) {

                    pin = this._testablePins[id];

                    canvasPos = pin.canvasPos;

                    canvasX = canvasPos[0];
                    canvasY = canvasPos[1];

                    if ((canvasX + 10) < 0 ||
                        (canvasY + 10) < 0 ||
                        (canvasX - 10) > canvasWidth ||
                        (canvasY - 10) > canvasHeight) {

                        pin._setVisible(false);

                    } else if (pin.occludable) {

                        testList[testListLen++] = pin;

                        pixels[lenPixels++] = canvasX;
                        pixels[lenPixels++] = canvasY;

                    } else {
                        pin._setVisible(true);
                    }
                }
            }

            // Hide pins that are occluded by 3D objects

            const opaqueOnly = true;

            canvas.readPixels(pixels, colors, testListLen, opaqueOnly);

            const r = PIN_COLOR[0] * 255;
            const g = PIN_COLOR[1] * 255;
            const b = PIN_COLOR[2] * 255;

            for (i = 0; i < testListLen; i++) {
                pin = testList[i];
                pin._setVisible((colors[i * 4] === r) && (colors[i * 4 + 1] === g) && (colors[i * 4 + 2] === b));
            }
        };
    })();

    // Registers a Pin for visibility testing
    VisibilityTester.prototype.addPin = function (pin) {
        const pinId = pin.id;
        this._pins[pinId] = pin;

        // Mesh which renders a 3D point that we'll test for occlusion
        this._markers[pinId] = new xeogl.Mesh(this._scene, {
            geometry: this._scene.components["_pinMarkerGeometry"] || new xeogl.Geometry(this._scene, {
                id: "_pinMarkerGeometry",
                primitive: "points",
                positions: [0, 0, 0],
                indices: [0]
            }),
            material: this._scene.components["_pinMarkerMaterial"] || new xeogl.PhongMaterial(this._scene, {
                id: "_pinMarkerMaterial",
                emissive: PIN_COLOR,
                diffuse: [0, 0, 0],
                specular: [0, 0, 0],
                pointSize: 5
            }),
            visible: true
        });
        this._testablePins[pinId] = pin;
    };

    // Enables or disables occlusion testing for a Pin
    VisibilityTester.prototype.setPinTestable = function (pinId, testable) {
        const pin = this._pins[pinId];
        if (pin) {
            this._markers[pinId].visible = testable;
            testable ? this._testablePins[pinId] = pin : delete this._testablePins[pinId];
        }
    };

    // Updates the World-space position of a Pin
    VisibilityTester.prototype.setPinWorldPos = function (pinId, worldPos) {
        this._markers[pinId].position = worldPos;
    };

    // De-registers a Pin, so that it is not tested for visibility
    VisibilityTester.prototype.removePin = function (pinId) {
        const info = this._pins[pinId];
        if (info) {
            delete this._pins[pinId];
            this._markers[pinId].destroy();
            delete this._markers[pinId];
            delete this._testablePins[pinId];
        }
    };

    const visibilityTesters = {};

    function getVisibilityTester(scene) {
        let visibilityTester = visibilityTesters[scene.id];
        if (!visibilityTester) {
            visibilityTester = new VisibilityTester(scene);
            visibilityTesters[scene.id] = visibilityTester;
            scene.on("destroyed", function () {
                delete visibilityTesters[scene.id];
            })
        }
        return visibilityTester;
    }

    xeogl.Pin = class xeoglPin extends xeogl.Component {

        init(cfg) {

            super.init(cfg);

            this._visible = null;
            this._localPos = new Float32Array(3);
            this._worldPos = new Float32Array(3);
            this._viewPos = new Float32Array(3);
            this._canvasPos = new Float32Array(2);
            this._localNormal = new Float32Array(3);
            this._worldNormal = new Float32Array(3);

            this._localPosDirty = true;
            this._worldPosDirty = false;

            this.mesh = cfg.mesh;
            this.primIndex = cfg.primIndex;
            this.bary = cfg.bary;
            this.offset = cfg.offset;
            this.occludable = cfg.occludable;
        }

        /**
         The {{#crossLink "Mesh"}}{{/crossLink}} this Pin is attached to.

         You can attach a Pin to a different {{#crossLink "Mesh"}}{{/crossLink}} at any time.

         Note that {{#crossLink "Pin/primIndex:property"}}{{/crossLink}} should always
         be within the {{#crossLink "Geometry/indices:property"}}{{/crossLink}} of the {{#crossLink "Geometry"}}{{/crossLink}} belonging to the {{#crossLink "Mesh"}}Mesh{{/crossLink}}.

         Fires an {{#crossLink "Pin/mesh:event"}}{{/crossLink}} event on change.

         @property mesh
         @type {Number | String | xeogl.Mesh}
         */
        set mesh(value) {

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/mesh:property"}}{{/crossLink}} property changes.
             * @event mesh
             * @param value The property's new value
             */
            this._attach({
                name: "mesh",
                type: "xeogl.Mesh",
                component: value,
                sceneDefault: false,
                onAttached: {callback: this._meshAttached, scope: this},
                onDetached: {callback: this._meshDetached, scope: this}
            });
        }

        get mesh() {
            return this._attached.mesh;
        }

        /**
         Index of the triangle containing this pin.

         Within the {{#crossLink "Geometry/indices:property"}}{{/crossLink}} of the {{#crossLink "Geometry"}}{{/crossLink}} attached to the {{#crossLink "Mesh"}}{{/crossLink}}, this is the index of the first element for that triangle.

         Fires a {{#crossLink "Pin/primIndex:event"}}{{/crossLink}} event on change.

         @property primIndex
         @default 0
         @type Number
         */
        set primIndex(value) {

            value = value || 0;

            if (value === this._primIndex) {
                return;
            }

            this._primIndex = value;

            this._setLocalPosDirty();

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/primIndex:property"}}{{/crossLink}} property changes.
             *
             * @event primIndex
             * @param value Number The property's new value
             */
            this.fire("primIndex", this._primIndex);
        }

        get primIndex() {
            return this._primIndex;
        }

        /**
         Barycentric coordinates of this Pin within its triangle.

         A value of ````[0.3, 0.3, 0.3]```` is the center of the triangle.

         Fires a {{#crossLink "Pin/bary:event"}}{{/crossLink}} event on change.

         @property bary
         @default [0.3,0.3,0.3]
         @type Float32Array
         */
        set bary(value) {
            this._bary = value || xeogl.math.vec3([.3, .3, .3]);
            this._setLocalPosDirty();

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/bary:property"}}{{/crossLink}} property changes.
             * @event bary
             * @param value Float32Array The property's new value
             */
            this.fire("bary", this._bary);
        }

        get bary() {
            return this._bary;
        }

        /**
         How far the Pin is lifted out of its triangle, along the surface normal vector.

         This is used when occlusion culling, to ensure that the Pin is not lost inside
         the surface it's attached to.

         Fires a {{#crossLink "Pin/offset:event"}}{{/crossLink}} event on change.

         @property offset
         @default 0.2
         @type Number
         */
        set offset(value) {
            this._offset = value !== undefined ? value : 0.2;
            this._setWorldPosDirty();

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/offset:property"}}{{/crossLink}} property changes.
             *
             * @event offset
             * @param value Number The property's new value
             */
            this.fire("offset", this._offset);
        }

        get offset() {
            return this._offset;
        }

        /**
         Indicates whether occlusion testing is performed for this Pin.

         When this is true, then {{#crossLink "Pin/visible:property"}}{{/crossLink}} will
         be false whenever the Pin is hidden behind something else in the 3D view.

         Set this false if the Pin is to remain visible when hidden behind things while
         being within the canvas.

         Fires a {{#crossLink "Pin/occludable:event"}}{{/crossLink}} event on change.

         @property occludable
         @default false
         @type Float32Array
         */
        set occludable(value) {

            value = !!value;

            if (value === this._occludable) {
                return;
            }

            this._occludable = value;

            if (this._occludable) {
                if (!this._visTester) {
                    this._visTester = getVisibilityTester(this.scene);
                }
                this._visTester.addPin(this);
            } else {
                if (this._visTester) {
                    this._visTester.removePin(this);
                }
                this._setVisible(true);
            }

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/occludable:property"}}{{/crossLink}} property changes.
             * @event occludable
             * @param value Float32Array The property's new value
             */
            this.fire("occludable", this._occludable);
        }

        get occludable() {
            return this._occludable;
        }

        /**
         Local-space 3D coordinates of this Pin.

         This is read-only and is automatically calculated.

         Fires a {{#crossLink "Pin/localPos:event"}}{{/crossLink}} event on change.

         @property localPos
         @default [0,0,0]
         @type Float32Array
         @final
         */
        get localPos() {
            this.__update();
            return this._localPos;
        }

        /**
         World-space 3D coordinates of this Pin.

         This is read-only and is automatically calculated.

         Fires a {{#crossLink "Pin/worldPos:event"}}{{/crossLink}} event on change.

         @property worldPos
         @default [0,0,0]
         @type Float32Array
         @final
         */
        get worldPos() {
            this.__update();
            return this._worldPos;
        }

        /**
         View-space 3D coordinates of this Pin.

         This is read-only and is automatically calculated.

         @property viewPos
         @default [0,0,0]
         @type Float32Array
         @final
         */
        get viewPos() {
            this.__update();
            xeogl.math.transformPoint3(this.scene.camera.viewMatrix, this.worldPos, this._viewPos);
            return this._viewPos;
        }

        /**
         Canvas-space 2D coordinates of this Pin.

         This is read-only and is automatically calculated.

         @property canvasPos
         @default [0,0]
         @type Float32Array
         @final
         */
        get canvasPos() {

            tempVec4a.set(this.viewPos);

            xeogl.math.transformPoint4(this.scene.camera.projMatrix, tempVec4a, tempVec4b);

            const aabb = this.scene.canvas.boundary;

            this._canvasPos[0] = Math.floor((1 + tempVec4b[0] / tempVec4b[3]) * aabb[2] / 2);
            this._canvasPos[1] = Math.floor((1 - tempVec4b[1] / tempVec4b[3]) * aabb[3] / 2);

            return this._canvasPos;
        }

        /**
         World-space normal vector of this Pin.

         This is read-only and is automatically calculated.

         Fires a {{#crossLink "Pin/worldNormal:event"}}{{/crossLink}} event on change.

         @property worldNormal
         @default [0,0,1]
         @type Float32Array
         @final
         */
        get worldNormal() {
            this.__update();
            return this._worldNormal;
        }

        /**
         Indicates if this Pin is currently visible.

         This is read-only and is automatically calculated.

         The Pin is invisible whenever:

         * {{#crossLink "Pin/canvasPos:property"}}{{/crossLink}} is currently outside the canvas, or
         * {{#crossLink "Pin/occludable:property"}}{{/crossLink}} is true and the Pin is currently occluded by something in the 3D view.

         Fires a {{#crossLink "Pin/visible:event"}}{{/crossLink}} event on change.

         @property visible
         @default true
         @type Boolean
         @final
         */
        get visible() {
            return !!this._visible;
        }

        _meshAttached(mesh) {
            this._onGeometryBoundary = mesh.geometry.on("boundary", this._setLocalPosDirty, this);
            this._onMeshBoundary = mesh.on("boundary", this._setWorldPosDirty, this);
            this._onMeshVisible = mesh.on("visible", this._meshVisible, this);
            this._setLocalPosDirty();
        }

        _setLocalPosDirty() {
            if (!this._localPosDirty) {
                this._localPosDirty = true;
                this._needUpdate();
            }
        }

        _setWorldPosDirty() {
            if (!this._worldPosDirty) {
                this._worldPosDirty = true;
                this._needUpdate();
            }
        }

        _meshVisible(visible) {
            if (!visible) {
                this._setVisible(false);
            }
            if (this._visTester) {
                this._visTester.setPinTestable(this.id, visible);
            }
        }

        _meshDetached(mesh) {
            mesh.geometry.off(this._onGeometryBoundary);
            mesh.off(this._onMeshBoundary);
            mesh.off(this._onMeshVisible);
            this._meshVisible(false);
        }

        _update() {

            const localPosDirty = this._localPosDirty;
            const worldPosDirty = localPosDirty || this._worldPosDirty;

            this.__update();

            if (localPosDirty) {

                /**
                 * Fired whenever this Pin's {{#crossLink "Pin/localPos:property"}}{{/crossLink}} property changes.
                 * @event localPos
                 */
                this.fire("localPos", this._localPos);
            }

            if (worldPosDirty) {

                /**
                 * Fired whenever this Pin's {{#crossLink "Pin/worldPos:property"}}{{/crossLink}} property changes.
                 * @event worldPos
                 */
                this.fire("worldPos", this._worldPos);

                /**
                 * Fired whenever this Pin's {{#crossLink "Pin/worldNormal:property"}}{{/crossLink}} property changes.
                 * @event worldNormal
                 */
                this.fire("worldNormal", this._worldNormal);
            }
        }

        __update() {

            const math = xeogl.math;
            const mesh = this._attached.mesh;

            if (!mesh) {
                return;
            }

            if (this.destroyed) {
                return;
            }

            if (this._localPosDirty) {

                // Get Local position from mesh's Geometry, primitive index and barycentric coordinates

                const geometry = mesh.geometry;
                const indices = geometry.indices;
                const positions = geometry.positions;

                if (!indices || !positions) {
                    return;
                }

                const i = this._primIndex;

                const ia = indices[i];
                const ib = indices[i + 1];
                const ic = indices[i + 2];

                const ia3 = ia * 3;
                const ib3 = ib * 3;
                const ic3 = ic * 3;

                tempVec3a[0] = positions[ia3];
                tempVec3a[1] = positions[ia3 + 1];
                tempVec3a[2] = positions[ia3 + 2];

                tempVec3b[0] = positions[ib3];
                tempVec3b[1] = positions[ib3 + 1];
                tempVec3b[2] = positions[ib3 + 2];

                tempVec3c[0] = positions[ic3];
                tempVec3c[1] = positions[ic3 + 1];
                tempVec3c[2] = positions[ic3 + 2];

                math.barycentricToCartesian(this._bary, tempVec3a, tempVec3b, tempVec3c, this._localPos);

                // Lift the cartesian coords out of the plane of the triangle
                math.triangleNormal(tempVec3a, tempVec3b, tempVec3c, tempVec3d);
                math.mulVec3Scalar(tempVec3d, this._offset, tempVec3d);
                math.addVec3(this._localPos, tempVec3d, this._localPos);

                this._localPosDirty = false;
                this._worldPosDirty = true;
                this._worldNormalDirty = true;
            }

            if (this._worldPosDirty) {

                // Transform Local position into World space

                math.transformPoint3(mesh.worldMatrix, this._localPos, this._worldPos);

                if (this._visTester) {
                    this._visTester.setPinWorldPos(this.id, this._worldPos);
                }

                this._worldPosDirty = false;
            }

            if (this._worldNormalDirty) {

                // Transform Local normal into World space

                math.transformVec3(mesh.worldMatrix, this._localNormal, this._worldNormal);

                this._worldNormalDirty = false;
            }
        }

        _setVisible(value) { // Called by VisibilityTester

            if (this._visible === value) {
                return;
            }

            this._visible = value !== false;

            /**
             * Fired whenever this Pin's {{#crossLink "Pin/visible:property"}}{{/crossLink}} property changes.
             * @event visible
             * @param value Float32Array The property's new value
             */
            this.fire("visible", this._visible);
        }

        getJSON() {
            const json = {
                primIndex: this._primIndex,
                bary: xeogl.math.vecToArray(this._bary),
                offset: this._offset,
                occludable: this._occludable
            };
            if (this._attached.mesh) {
                json.mesh = this._attached.mesh.id;
            }
            return json;
        }

        destroy() {
            if (this._visTester) {
                this._visTester.removePin(this.id);
            }
            super.destroy();
        }
    };
}
    
