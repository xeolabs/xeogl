/**
 An **Ortho** defines an orthographic projection transform for a {{#crossLink "Camera"}}Camera{{/crossLink}}.

 ## Overview

 * A {{#crossLink "Camera"}}Camera{{/crossLink}} has an Ortho to configure its orthographic projection mode.
 * An Ortho works like Blender's orthographic projection, where the positions of the left, right, top and bottom planes are
 implicitly specified with a single {{#crossLink "Ortho/scale:property"}}{{/crossLink}} property, which causes the frustum to be symmetrical on X and Y axis, large enough to
 contain the number of units given by {{#crossLink "Ortho/scale:property"}}{{/crossLink}}.
 * An Ortho's {{#crossLink "Ortho/near:property"}}{{/crossLink}} and {{#crossLink "Ortho/far:property"}}{{/crossLink}} properties
 specify the distances to the WebGL clipping planes.


 ## Examples

 * [Camera with orthographic projection](../../examples/#camera_orthographic)

 ## Usage

 * See {{#crossLink "Camera"}}{{/crossLink}}

 @class Ortho
 @module xeogl
 @submodule camera
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Ortho.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.scale=1.0] {Number} Scale factor for this Ortho's extents on X and Y axis.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @author xeolabs / http://xeolabs.com
 @author Artur-Sampaio / https://github.com/Artur-Sampaio
 @extends Component
 */
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Ortho";

class Ortho extends Component {

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

        this._state = new State({
            matrix: math.mat4()
        });

        this.scale = cfg.scale;
        this.near = cfg.near;
        this.far = cfg.far;

        this._onCanvasBoundary = this.scene.canvas.on("boundary", this._needUpdate, this);
    }

    _update() {

        const WIDTH_INDEX = 2;
        const HEIGHT_INDEX = 3;

        const scene = this.scene;
        const scale = this._scale;
        const halfSize = 0.5 * scale;

        const boundary = scene.viewport.boundary;
        const boundaryWidth = boundary[WIDTH_INDEX];
        const boundaryHeight = boundary[HEIGHT_INDEX];
        const aspect = boundaryWidth / boundaryHeight;

        let left;
        let right;
        let top;
        let bottom;

        if (boundaryWidth > boundaryHeight) {
            left = -halfSize;
            right = halfSize;
            top = halfSize / aspect;
            bottom = -halfSize / aspect;

        } else {
            left = -halfSize * aspect;
            right = halfSize * aspect;
            top = halfSize;
            bottom = -halfSize;
        }

        math.orthoMat4c(left, right, bottom, top, this._near, this._far, this._state.matrix);

        this._renderer.imageDirty();

        this.fire("matrix", this._state.matrix);
    }


    /**
     Scale factor for this Ortho's extents on X and Y axis.

     Clamps to minimum value of ````0.01```.

     Fires a {{#crossLink "Ortho/scale:event"}}{{/crossLink}} event on change.

     @property scale
     @default 1.0
     @type Number
     */

    set scale(value) {
        if (value === undefined || value === null) {
            value = 1.0;
        }
        if (value <= 0) {
            value = 0.01;
        }
        this._scale = value;
        this._needUpdate();
        /**
         Fired whenever this Ortho's {{#crossLink "Ortho/scale:property"}}{{/crossLink}} property changes.

         @event scale
         @param value The property's new value
         */
        this.fire("scale", this._scale);
    }

    get scale() {
        return this._scale;
    }

    /**
     Position of this Ortho's near plane on the positive View-space Z-axis.

     Fires a {{#crossLink "Ortho/near:event"}}{{/crossLink}} event on change.

     @property near
     @default 0.1
     @type Number
     */
    set near(value) {
        this._near = (value !== undefined && value !== null) ? value : 0.1;
        this._needUpdate();
        /**
         Fired whenever this Ortho's  {{#crossLink "Ortho/near:property"}}{{/crossLink}} property changes.

         @event near
         @param value The property's new value
         */
        this.fire("near", this._near);
    }

    get near() {
        return this._near;
    }

    /**
     Position of this Ortho's far plane on the positive View-space Z-axis.

     Fires a {{#crossLink "Ortho/far:event"}}{{/crossLink}} event on change.

     @property far
     @default 10000.0
     @type Number
     */
    set far(value) {
        this._far = (value !== undefined && value !== null) ? value : 10000.0;
        this._needUpdate();
        /**
         Fired whenever this Ortho's {{#crossLink "Ortho/far:property"}}{{/crossLink}} property changes.

         @event far
         @param value The property's new value
         */
        this.fire("far", this._far);
    }

    get far() {
        return this._far;
    }

    /**
     The Ortho's projection transform matrix.

     Fires a {{#crossLink "Ortho/matrix:event"}}{{/crossLink}} event on change.

     @property matrix
     @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     @type {Float32Array}
     */
    get matrix() {
        if (this._updateScheduled) {
            this._doUpdate();
        }
        return this._state.matrix;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
        this.scene.canvas.off(this._onCanvasBoundary);
    }
}

componentClasses[type] = Ortho;

export{Ortho};