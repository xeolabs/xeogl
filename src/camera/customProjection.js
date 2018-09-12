/**
 A **CustomProjection** defines a projection for a {{#crossLink "Camera"}}Camera{{/crossLink}} as a custom 4x4 matrix..

 ## Overview

 * A {{#crossLink "Camera"}}Camera{{/crossLink}} has a CustomProjection to configure its custom projection mode.
 * A CustomProjection lets us explicitly set the elements of its 4x4 transformation matrix.

 ## Examples

 * [Camera with a CustomProjection](../../examples/#camera_customProjection)

 ## Usage

 * See {{#crossLink "Camera"}}{{/crossLink}}

 @class CustomProjection
 @module xeogl
 @submodule camera
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CustomProjection.
 @param [cfg.matrix=] {Float32Array} 4x4 transform matrix.
 @extends Component
 */
import {math} from '../math/math.js';
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.CustomProjection";

class CustomProjection extends Component {

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
        this.matrix = cfg.matrix;
    }


    /**
     The CustomProjection's projection transform matrix.

     Fires a {{#crossLink "CustomProjection/matrix:event"}}{{/crossLink}} event on change.

     @property matrix
     @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     @type {Float32Array}
     */
    set matrix(matrix) {

        this._state.matrix.set(matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

        /**
         Fired whenever this CustomProjection's {{#crossLink "CustomProjection/matrix:property"}}{{/crossLink}} property changes.

         @event matrix
         @param value The property's new value
         */
        this.fire("far", this._state.matrix);
    }

    get matrix() {
        return this._state.matrix;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = CustomProjection;

export{CustomProjection};
