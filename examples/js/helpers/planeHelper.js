/**

 Helper that visualizes the position and direction of a plane.

 @class PlaneHelper
 @constructor
 @param cfg {*} Configuration
 @param [cfg.pos=[0,0,0]] {Float32Array} World-space position.
 @param [cfg.dir=[0,0,1]] {Float32Array} World-space direction vector.
 @param [cfg.color=[0.4,0.4,0.4]] {Float32Array} Emmissive color
 @param [cfg.solid=true] {Boolean} Indicates whether or not this helper is filled with color or just wireframe.
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.
 @param [cfg.planeSize] {Float32Array} The width and height of the PlaneHelper plane indicator.
 @param [cfg.autoPlaneSize=false] {Boolean} Indicates whether or not this PlaneHelper's
 {{#crossLink "PlaneHelper/planeSize:property"}}{{/crossLink}} is automatically sized to fit within
 the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
 */

{
    const arrowPositions = new Float32Array(6);
    const zeroVec = new Float32Array([0, 0, -1]);
    const quat = new Float32Array(4);

    xeogl.PlaneHelper = class xeoglPlaneHelper extends xeogl.Component {

        init(cfg) {

            super.init(cfg);

            this._solid = false;
            this._visible = false;

            this._group = new xeogl.Group(this, {
                positions: [10, 10, 0],
                backfaces: false,
                clippable: false
            });

            this._planeWire = this._group.addChild(new xeogl.Mesh(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "lines",
                    positions: [
                        0.5, 0.5, 0.0, 0.5, -0.5, 0.0, // 0
                        -0.5, -0.5, 0.0, -0.5, 0.5, 0.0, // 1
                        0.5, 0.5, -0.0, 0.5, -0.5, -0.0, // 2
                        -0.5, -0.5, -0.0, -0.5, 0.5, -0.0 // 3
                    ],
                    indices: [0, 1, 0, 3, 1, 2, 2, 3]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [1, 0, 0],
                    diffuse: [0, 0, 0],
                    lineWidth: 2
                }),
                pickable: false,
                collidable: false,
                clippable: false
            }));

            this._planeSolid = this._group.addChild(new xeogl.Mesh(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "triangles",
                    positions: [
                        0.5, 0.5, 0.0, 0.5, -0.5, 0.0, // 0
                        -0.5, -0.5, 0.0, -0.5, 0.5, 0.0, // 1
                        0.5, 0.5, -0.0, 0.5, -0.5, -0.0, // 2
                        -0.5, -0.5, -0.0, -0.5, 0.5, -0.0 // 3
                    ],
                    indices: [0, 1, 2, 2, 3, 0]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [0, 0, 0],
                    diffuse: [0, 0, 0],
                    specular: [1, 1, 1],
                    shininess: 120,
                    alpha: 0.3,
                    alphaMode: "blend",
                    backfaces: true
                }),
                pickable: false,
                collidable: false,
                clippable: false,
                visible: false
            }));

            this._label = this._group.addChild(new xeogl.Mesh(this, {
                geometry: new xeogl.VectorTextGeometry(this, {
                    text: this.id,
                    size: 0.07,
                    origin: [0.02, 0.02, 0.0]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [0.3, 1, 0.3],
                    lineWidth: 2
                }),
                pickable: false,
                collidable: false,
                clippable: false,
                billboard: "spherical"
            }));

            this._arrow = new xeogl.Mesh(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "lines",
                    positions: [
                        1.0, 1.0, 1.0, 1.0, -1.0, 1.0
                    ],
                    indices: [0, 1]
                }),
                material: new xeogl.PhongMaterial(this, {
                    emissive: [1, 0, 0],
                    diffuse: [0, 0, 0],
                    lineWidth: 4
                }),
                pickable: false,
                collidable: false,
                clippable: false
            });

            this.planeSize = cfg.planeSize;
            this.autoPlaneSize = cfg.autoPlaneSize;
            this.pos = cfg.pos;
            this.dir = cfg.dir;
            this.color = cfg.color;
            this.solid = cfg.solid;
            this.visible = cfg.visible;
        }

        _update() {

            const pos = this._pos;
            const dir = this._dir;

            // Rebuild arrow geometry

            arrowPositions[0] = pos[0];
            arrowPositions[1] = pos[1];
            arrowPositions[2] = pos[2];
            arrowPositions[3] = pos[0] + dir[0];
            arrowPositions[4] = pos[1] + dir[1];
            arrowPositions[5] = pos[2] + dir[2];

            this._arrow.geometry.positions = arrowPositions;
        }

        /**
         * World-space position of this PlaneHelper.
         *
         * @property worldPos
         * @default [0,0,0]
         * @type {Float32Array}
         */
        set pos(value) {
            (this._pos = this._pos || xeogl.math.vec3()).set(value || [0, 0, 0]);
            this._group.position = this._pos;
            this._needUpdate(); // Need to rebuild arrow
        }

        get pos() {
            return this._pos;
        }

        /**
         * World-space direction of this PlaneHelper.
         *
         * @property dir
         * @default [0,0,1]
         * @type {Float32Array}
         */
        set dir(value) {
            (this._dir = this._dir || xeogl.math.vec3()).set(value || [0, 0, 1]);
            xeogl.math.vec3PairToQuaternion(zeroVec, this._dir, quat);
            this._group.quaternion = quat;
            this._needUpdate(); // Need to rebuild arrow
        }

        get dir() {
            return this._dir;
        }

        /**
         * The width and height of the PlaneHelper plane indicator.
         *
         * Values assigned to this property will be overridden by an auto-computed value when
         * {{#crossLink "PlaneHelper/autoPlaneSize:property"}}{{/crossLink}} is true.
         *
         * @property planeSize
         * @default [1,1]
         * @type {Float32Array}
         */
        set planeSize(value) {
            (this._planeSize = this._planeSize || xeogl.math.vec2()).set(value || [1, 1]);
            this._group.scale = [this._planeSize[0], this._planeSize[1], 1.0];
        }

        get planeSize() {
            return this._planeSize;
        }

        /**
         * Indicates whether this PlaneHelper's {{#crossLink "PlaneHelper/planeSize:property"}}{{/crossLink}} is automatically
         * generated or not.
         *
         * When auto-generated, {{#crossLink "PlaneHelper/planeSize:property"}}{{/crossLink}} will automatically size
         * to fit within the {{#crossLink "Scene/aabb:property"}}Scene's boundary{{/crossLink}}.
         *
         * @property autoPlaneSize
         * @default false
         * @type {Boolean}
         */
        set autoPlaneSize(value) {

            value = !!value;

            if (this._autoPlaneSize === value) {
                return;
            }

            this._autoPlaneSize = value;

            if (this._autoPlaneSize) {
                if (!this._onSceneAABB) {
                    this._onSceneAABB = this.scene.on("boundary", function () {
                        const aabbDiag = xeogl.math.getAABB3Diag(this.scene.aabb);
                        const clipSize = (aabbDiag * 0.50);
                        this.planeSize = [clipSize, clipSize];
                    }, this);
                }
            } else {
                if (this._onSceneAABB) {
                    this.scene.off(this._onSceneAABB);
                    this._onSceneAABB = null;
                }
            }
        }

        get color() {
            return this._autoPlaneSize;
        }

        /**
         * Emmissive color of this PlaneHelper.
         *
         * @property color
         * @default [0.4,0.4,0.4]
         * @type {Float32Array}
         */
        set color(value) {
            (this._color = this._color || xeogl.math.vec3()).set(value || [0.4, 0.4, 0.4]);
            this._planeWire.material.emissive = this._color;
            this._arrow.material.emissive = this._color;
        }

        get color() {
            return this._color;
        }

        /**
         Indicates whether this PlaneHelper is filled with color or just wireframe.

         @property solid
         @default true
         @type Boolean
         */
        set solid(value) {
            this._solid = value !== false;
            this._planeSolid.visible = this._solid && this._visible;
        }

        get solid() {
            return this._solid;
        }

        /**
         Indicates whether this PlaneHelper is visible or not.

         @property visible
         @default true
         @type Boolean
         */
        set visible(value) {
            this._visible = value !== false;
            this._planeWire.visible = this._visible;
            this._planeSolid.visible = this._solid && this._visible;
            this._arrow.visible = this._visible;
            this._label.visible = this._visible;
        }

        get visible() {
            return this._visible;
        }

        destroy() {
            super.destroy();
            if (this._onSceneAABB) {
                this.scene.off(this._onSceneAABB);
            }
        }
    };
}