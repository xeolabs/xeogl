/**
 A **DirLight** is a directional light source that illuminates all {{#crossLink "Mesh"}}Meshes{{/crossLink}} equally
 from a given direction.

 ## Overview

 * DirLights have a direction, but no position.
 * The direction is the **direction that the light is emitted in**.
 * DirLights may be defined in either **World** or **View** coordinate space. When in World-space, their direction
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their direction is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 * A DirLight can also have a {{#crossLink "Shadow"}}{{/crossLink}} component, to configure it to cast a shadow.
 * {{#crossLink "AmbientLight"}}{{/crossLink}}, {{#crossLink "DirLight"}}{{/crossLink}},
 {{#crossLink "SpotLight"}}{{/crossLink}} and {{#crossLink "PointLight"}}{{/crossLink}} instances are registered by ID
 on {{#crossLink "Scene/lights:property"}}Scene#lights{{/crossLink}} for convenient access.

 ## Examples

 * [View-space directional three-point lighting](../../examples/#lights_directional_view_threePoint)
 * [World-space directional three-point lighting](../../examples/#lights_directional_world_threePoint)

 ## Usage

 In the example below we'll customize the default Scene's light sources, defining an AmbientLight and a couple of
 DirLights, then create a Phong-shaded box mesh.

 ````javascript
 new xeogl.AmbientLight({
        color: [0.8, 0.8, 0.8],
        intensity: 0.5
     });

 new xeogl.DirLight({
        dir: [1, 1, 1],     // Direction the light is shining in
        color: [0.5, 0.7, 0.5],
        intensity: 1.0,
        space: "view",      // Other option is "world", for World-space
        shadow: false       // Default
     });

 new xeogl.DirLight({
        dir: [0.2, -0.8, 0.8],
        color: [0.8, 0.8, 0.8],
        intensity: 0.5,
        space: "view",
        shadow: false
     });

 // Create box mesh
 new xeogl.Mesh({
    material: new xeogl.PhongMaterial({
        ambient: [0.5, 0.5, 0.5],
        diffuse: [1,0.3,0.3]
    }),
    geometry: new xeogl.BoxGeometry()
 });
 ````

 @class DirLight
 @module xeogl
 @submodule lighting
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} The DirLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DirLight.
 @param [cfg.dir=[1.0, 1.0, 1.0]] {Float32Array} A unit vector indicating the direction that the light is shining,
 given in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.color=[0.7, 0.7, 0.8 ]] {Float32Array} The color of this DirLight.
 @param [cfg.intensity=1.0 ] {Number} The intensity of this DirLight, as a factor in range ````[0..1]````.
 @param [cfg.space="view"] {String} The coordinate system the DirLight is defined in - "view" or "space".
 @param [cfg.shadow=false] {Boolean} Flag which indicates if this DirLight casts a shadow.
 @extends Component
 */
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {RenderBuffer} from '../renderer/renderBuffer.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.DirLight";

class DirLight extends Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {

        super.init(cfg);

        const self = this;

        this._shadowRenderBuf = null;
        this._shadowViewMatrix = null;
        this._shadowProjMatrix = null;
        this._shadowViewMatrixDirty = true;
        this._shadowProjMatrixDirty = true;

        this._state = new State({
            type: "dir",
            dir: math.vec3([1.0, 1.0, 1.0]),
            color: math.vec3([0.7, 0.7, 0.8]),
            intensity: 1.0,
            space: cfg.space || "view",
            shadow: false,
            shadowDirty: true,

            getShadowViewMatrix: (function () {
                const look = math.vec3();
                const up = math.vec3([0, 1, 0]);
                return function () {
                    if (self._shadowViewMatrixDirty) {
                        if (!self._shadowViewMatrix) {
                            self._shadowViewMatrix = math.identityMat4();
                        }
                        const dir = self._state.dir;
                        math.lookAtMat4v([-dir[0], -dir[1], -dir[2]], [0, 0, 0], up, self._shadowViewMatrix);
                        self._shadowViewMatrixDirty = false;
                    }
                    return self._shadowViewMatrix;
                };
            })(),

            getShadowProjMatrix: function () {
                if (self._shadowProjMatrixDirty) { // TODO: Set when canvas resizes
                    if (!self._shadowProjMatrix) {
                        self._shadowProjMatrix = math.identityMat4();
                    }
                    math.orthoMat4c(-10, 10, -10, 10, 0, 500.0, self._shadowProjMatrix);
                    self._shadowProjMatrixDirty = false;
                }
                return self._shadowProjMatrix;
            },

            getShadowRenderBuf: function () {
                if (!self._shadowRenderBuf) {
                    self._shadowRenderBuf = new RenderBuffer(self.scene.canvas.canvas, self.scene.canvas.gl, { size: [1024, 1024]});
                }
                return self._shadowRenderBuf;
            }
        });

        this.dir = cfg.dir;
        this.color = cfg.color;
        this.intensity = cfg.intensity;
        this.shadow = cfg.shadow;
        this.scene._lightCreated(this);
    }

    /**
     The direction in which the light is shining.

     @property dir
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set dir(value) {
        this._state.dir.set(value || [1.0, 1.0, 1.0]);
        this._shadowViewMatrixDirty = true;
        this._renderer.shadowsDirty();
    }

    get dir() {
        return this._state.dir;
    }

    /**
     The color of this DirLight.

     @property color
     @default [0.7, 0.7, 0.8]
     @type Float32Array
     */
    set color(value) {
        this._state.color.set(value || [0.7, 0.7, 0.8]);
        this._renderer.imageDirty();
    }

    get color() {
        return this._state.color;
    }

    /**
     The intensity of this DirLight.

     Fires a {{#crossLink "DirLight/intensity:event"}}{{/crossLink}} event on change.

     @property intensity
     @default 1.0
     @type Number
     */
    set intensity(value) {
        value = value !== undefined ? value : 1.0;
        this._state.intensity = value;
        this._renderer.imageDirty();
    }

    get intensity() {
        return this._state.intensity;
    }

    /**
     Flag which indicates if this DirLight casts a shadow.

     @property shadow
     @default false
     @type Boolean
     */
    set shadow(value) {
        value = !!value;
        if (this._state.shadow === value) {
            return;
        }
        this._state.shadow = value;
        this._shadowViewMatrixDirty = true;
        this._renderer.shadowsDirty();
    }

    get shadow() {
        return this._state.shadow;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
        if (this._shadowRenderBuf) {
            this._shadowRenderBuf.destroy();
        }
        this.scene._lightDestroyed(this);
        this._renderer.shadowsDirty();
    }
}

componentClasses[type] = DirLight;

export {DirLight};
