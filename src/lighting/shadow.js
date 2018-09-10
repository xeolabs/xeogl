/**
 A **Shadow** defines a shadow cast by a {{#crossLink "DirLight"}}{{/crossLink}} or a {{#crossLink "SpotLight"}}{{/crossLink}}.

 Work in progress!

 ## Overview

 * Shadows are attached to {{#crossLink "DirLight"}}{{/crossLink}} and {{#crossLink "SpotLight"}}{{/crossLink}} components.

 TODO

 ## Examples

 TODO

 ## Usage

 ```` javascript
 var mesh = new xeogl.Mesh(scene, {

        lights: new xeogl.Lights({
            lights: [

                new xeogl.SpotLight({
                    pos: [0, 100, 100],
                    dir: [0, -1, 0],
                    color: [0.5, 0.7, 0.5],
                    intensity: 1
                    constantAttenuation: 0,
                    linearAttenuation: 0,
                    quadraticAttenuation: 0,
                    space: "view",

                    shadow: new xeogl.Shadow({
                        resolution: [1000, 1000],
                        intensity: 0.7,
                        sampling: "stratified" // "stratified" | "poisson" | "basic"
                    });
                })
            ]
        }),
 ,
        material: new xeogl.PhongMaterial({
            diffuse: [0.5, 0.5, 0.0]
        }),

        geometry: new xeogl.BoxGeometry()
  });
 ````

 @class Shadow
 @module xeogl
 @submodule lighting
 @constructor
 @extends Component
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} The Shadow configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Shadow.
 @param [cfg.resolution=[1000,1000]] {Uint16Array} Resolution of the texture map for this Shadow.
 @param [cfg.intensity=1.0] {Number} Intensity of this Shadow.
 */
import {Component} from '../component.js';
import {math} from '../math/math.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Shadow";

class Shadow extends Component {

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
        this._state = {
            resolution: math.vec3([1000, 1000]),
            intensity: 1.0
        };
        this.resolution = cfg.resolution;
        this.intensity = cfg.intensity;
    }

    /**
     The resolution of the texture map for this Shadow.

     This will be either World- or View-space, depending on the value of {{#crossLink "Shadow/space:property"}}{{/crossLink}}.

     Fires a {{#crossLink "Shadow/resolution:event"}}{{/crossLink}} event on change.

     @property resolution
     @default [1000, 1000]
     @type Uint16Array
     */
    set resolution(value) {

        this._state.resolution.set(value || [1000.0, 1000.0]);

        this._renderer.imageDirty();

        /**
         Fired whenever this Shadow's  {{#crossLink "Shadow/resolution:property"}}{{/crossLink}} property changes.
         @event resolution
         @param value The property's new value
         */
        this.fire("resolution", this._state.resolution);
    }

    get resolution() {
        return this._state.resolution;
    }

    /**
     The intensity of this Shadow.

     Fires a {{#crossLink "Shadow/intensity:event"}}{{/crossLink}} event on change.

     @property intensity
     @default 1.0
     @type Number
     */
    set intensity(value) {

        value = value !== undefined ? value : 1.0;

        this._state.intensity = value;

        this._renderer.imageDirty();

        /**
         * Fired whenever this Shadow's  {{#crossLink "Shadow/intensity:property"}}{{/crossLink}} property changes.
         * @event intensity
         * @param value The property's new value
         */
        this.fire("intensity", this._state.intensity);
    }

    get intensity() {
        return this._state.intensity;
    }

    destroy() {
        super.destroy();
        //this._state.destroy();
    }
}

componentClasses[type] = Shadow;

export{Shadow};
