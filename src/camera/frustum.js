/**
 A **Frustum** defines a perspective projection as a frustum-shaped view volume for a {{#crossLink "Camera"}}Camera{{/crossLink}}.

 ## Overview

 * A {{#crossLink "Camera"}}Camera{{/crossLink}} has a Frustum to configure its frustum-based perspective projection mode.
 * A Frustum lets us explicitly set the positions of the left, right, top, bottom, near and far planes, which is useful
 for asymmetrical view volumes, such as those used for stereo viewing.
 * A Frustum's {{#crossLink "Frustum/near:property"}}{{/crossLink}} and {{#crossLink "Frustum/far:property"}}{{/crossLink}} properties
 specify the distances to the WebGL clipping planes.

 ## Examples

 * [Camera with frustum projection](../../examples/#camera_frustum)
 * [Stereo viewing with frustum projection](../../examples/#effects_stereo)

 ## Usage

 * See {{#crossLink "Camera"}}{{/crossLink}}

 @class Frustum
 @module xeogl
 @submodule camera
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Frustum.
 @param [cfg.left=-1] {Number} Position of the Frustum's left plane on the View-space X-axis.
 @param [cfg.right=1] {Number} Position of the Frustum's right plane on the View-space X-axis.
 @param [cfg.bottom=-1] {Number} Position of the Frustum's bottom plane on the View-space Y-axis.
 @param [cfg.top=1] {Number} Position of the Frustum's top plane on the View-space Y-axis.
 @param [cfg.near=0.1] {Number} Position of the Frustum's near plane on the View-space Z-axis.
 @param [cfg.far=1000] {Number} Position of the Frustum's far plane on the positive View-space Z-axis.
 @extends Component
 */
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Frustum";

class Frustum extends Component {

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

        this._left = -1.0;
        this._right = 1.0;
        this._bottom = -1.0;
        this._top = 1.0;
        this._near = 0.1;
        this._far = 5000.0;

        // Set component properties

        this.left = cfg.left;
        this.right = cfg.right;
        this.bottom = cfg.bottom;
        this.top = cfg.top;
        this.near = cfg.near;
        this.far = cfg.far;
    }

    _update() {
        math.frustumMat4(this._left, this._right, this._bottom, this._top, this._near, this._far, this._state.matrix);
        this._renderer.imageDirty();
        this.fire("matrix", this._state.matrix);
    }

    /**
     Position of this Frustum's left plane on the View-space X-axis.

     Fires a {{#crossLink "Frustum/left:event"}}{{/crossLink}} event on change.

     @property left
     @default -1.0
     @type Number
     */

    set left(value) {
        this._left = (value !== undefined && value !== null) ? value : -1.0;
        this._needUpdate();
        /**
         Fired whenever this Frustum's {{#crossLink "Frustum/left:property"}}{{/crossLink}} property changes.

         @event left
         @param value The property's new value
         */
        this.fire("left", this._left);
    }

    get left() {
        return this._left;
    }

    /**
     Position of this Frustum's right plane on the View-space X-axis.

     Fires a {{#crossLink "Frustum/right:event"}}{{/crossLink}} event on change.

     @property right
     @default 1.0
     @type Number
     */
    set right(value) {
        this._right = (value !== undefined && value !== null) ? value : 1.0;
        this._needUpdate();
        /**
         Fired whenever this Frustum's {{#crossLink "Frustum/right:property"}}{{/crossLink}} property changes.

         @event right
         @param value The property's new value
         */
        this.fire("right", this._right);
    }

    get right() {
        return this._right;
    }

    /**
     Position of this Frustum's top plane on the View-space Y-axis.

     Fires a {{#crossLink "Frustum/top:event"}}{{/crossLink}} event on change.

     @property top
     @default 1.0
     @type Number
     */
    set top(value) {
        this._top = (value !== undefined && value !== null) ? value : 1.0;
        this._needUpdate();
        /**
         Fired whenever this Frustum's   {{#crossLink "Frustum/top:property"}}{{/crossLink}} property changes.

         @event top
         @param value The property's new value
         */
        this.fire("top", this._top);
    }

    get top() {
        return this._top;
    }

    /**
     Position of this Frustum's bottom plane on the View-space Y-axis.

     Fires a {{#crossLink "Frustum/bottom:event"}}{{/crossLink}} event on change.

     @property bottom
     @default -1.0
     @type Number
     */
    set bottom(value) {
        this._bottom = (value !== undefined && value !== null) ? value : -1.0;
        this._needUpdate();
        /**
         Fired whenever this Frustum's   {{#crossLink "Frustum/bottom:property"}}{{/crossLink}} property changes.

         @event bottom
         @param value The property's new value
         */
        this.fire("bottom", this._bottom);
    }

    get bottom() {
        return this._bottom;
    }

    /**
     Position of this Frustum's near plane on the positive View-space Z-axis.

     Fires a {{#crossLink "Frustum/near:event"}}{{/crossLink}} event on change.

     @property near
     @default 0.1
     @type Number
     */
    set near(value) {
        this._near = (value !== undefined && value !== null) ? value : 0.1;
        this._needUpdate();
        /**
         Fired whenever this Frustum's {{#crossLink "Frustum/near:property"}}{{/crossLink}} property changes.

         @event near
         @param value The property's new value
         */
        this.fire("near", this._near);
    }

    get near() {
        return this._near;
    }

    /**
     Position of this Frustum's far plane on the positive View-space Z-axis.

     Fires a {{#crossLink "Frustum/far:event"}}{{/crossLink}} event on change.

     @property far
     @default 10000.0
     @type Number
     */
    set far(value) {
        this._far = (value !== undefined && value !== null) ? value : 10000.0;
        this._needUpdate();
        /**
         Fired whenever this Frustum's  {{#crossLink "Frustum/far:property"}}{{/crossLink}} property changes.

         @event far
         @param value The property's new value
         */
        this.fire("far", this._far);
    }

    get far() {
        return this._far;
    }

    /**
     The Frustum's projection transform matrix.

     Fires a {{#crossLink "Frustum/matrix:event"}}{{/crossLink}} event on change.

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
        super.destroy();
    }
}

componentClasses[type] = Frustum;

export{Frustum};