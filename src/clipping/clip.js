/**
 A **Clip** is an arbitrarily-aligned World-space clipping plane.

 <a href="../../examples/#effects_clipping"><img src="../../../assets/images/screenshots/Clips.png"></img></a>

 ## Overview

 * Used to slice portions off objects, to create cross-section views or reveal interiors.
 * Is contained within a {{#crossLink "Clips"}}{{/crossLink}} belonging to its {{#crossLink "Scene"}}{{/crossLink}}.
 * Has a World-space position in {{#crossLink "Clip/pos:property"}}{{/crossLink}} and orientation in {{#crossLink "Clip/dir:property"}}{{/crossLink}}.
 * Discards elements from the half-space in the direction of {{#crossLink "Clip/dir:property"}}{{/crossLink}}.
 * Can be be enabled or disabled via its {{#crossLink "Clip/active:property"}}{{/crossLink}} property.

 ## Usage

 In the example below, we have an {{#crossLink "Mesh"}}{{/crossLink}} that's attached by a {{#crossLink "Clips"}}{{/crossLink}}
 that contains two {{#crossLink "Clip"}}{{/crossLink}} components.  The first {{#crossLink "Clip"}}{{/crossLink}} is on the
 positive diagonal, while the second is on the negative diagonal. The {{#crossLink "Mesh"}}Mesh's{{/crossLink}} {{#crossLink "Geometry"}}{{/crossLink}}
 is a box, which will get two of its corners clipped off.

 ````javascript
 // Create a set of Clip planes in the default Scene
 scene.clips.clips = [

 // Clip plane on negative diagonal
 new xeogl.Clip({
         pos: [1.0, 1.0, 1.0],
         dir: [-1.0, -1.0, -1.0],
         active: true
     }),

 // Clip plane on positive diagonal
 new xeogl.Clip({
         pos: [-1.0, -1.0, -1.0],
         dir: [1.0, 1.0, 1.0],
         active: true
     })
 ];

 // Create a Mesh in the default Scene, that will be clipped by our Clip planes
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.SphereGeometry(),
     clippable: true // Enable clipping (default)
 });
 ````

 ### Switching clipping on and off for a Mesh

 An {{#crossLink "Mesh"}}{{/crossLink}}'s {{#crossLink "Mesh/clippable:property"}}{{/crossLink}} property indicates
 whether or not it is affected by Clip components.

 You can switch it at any time, like this:

 ```` javascript
 // Disable clipping for the Mesh
 mesh.clippable = false;

 // Enable clipping for the Mesh
 mesh.clippable = true;
 ````

 @class Clip
 @module xeogl
 @submodule clipping
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Clip configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Clip by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clip.
 @param [cfg.active=true] {Boolean} Indicates whether or not this Clip is active.
 @param [cfg.pos=[0,0,0]] {Array of Number} World-space position of the clipping plane.
 @param [cfg.dir=[0,0 -1]] {Array of Number} Vector perpendicular to the plane surface, indicating its orientation.
 @extends Component
 */
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Clip";

class Clip extends Component {

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
            active: true,
            pos: new Float32Array(3),
            dir: new Float32Array(3)
        });

        this.active = cfg.active;
        this.pos = cfg.pos;
        this.dir = cfg.dir;

        this.scene._clipCreated(this);
    }

    /**
     Indicates whether this Clip is active or not.

     @property active
     @default true
     @type Boolean
     */
    set active(value) {
        this._state.active = value !== false;
        this._renderer.imageDirty();
        /**
         Fired whenever this Clip's {{#crossLink "Clip/active:property"}}{{/crossLink}} property changes.

         @event active
         @param value {Boolean} The property's new value
         */
        this.fire("active", this._state.active);
    }

    get active() {
        return this._state.active;
    }

    /**
     The World-space position of this Clip's plane.

     @property pos
     @default [0, 0, 0]
     @type Float32Array
     */
    set pos(value) {
        this._state.pos.set(value || [0, 0, 0]);
        this._renderer.imageDirty();
        /**
         Fired whenever this Clip's {{#crossLink "Clip/pos:property"}}{{/crossLink}} property changes.

         @event pos
         @param value Float32Array The property's new value
         */
        this.fire("pos", this._state.pos);
    }

    get pos() {
        return this._state.pos;
    }

    /**
     Vector indicating the orientation of this Clip plane.

     The vector originates at {{#crossLink "Clip/pos:property"}}{{/crossLink}}. Elements on the
     same side of the vector are clipped.

     @property dir
     @default [0, 0, -1]
     @type Float32Array
     */
    set dir(value) {
        this._state.dir.set(value || [0, 0, -1]);
        this._renderer.imageDirty();
        /**
         Fired whenever this Clip's {{#crossLink "Clip/dir:property"}}{{/crossLink}} property changes.

         @event dir
         @param value {Float32Array} The property's new value
         */
        this.fire("dir", this._state.dir);
    }

    get dir() {
        return this._state.dir;
    }

    destroy() {
        this._state.destroy();
        this.scene._clipDestroyed(this);
        super.destroy();
    }
}

componentClasses[type] = Clip;

export{Clip};
