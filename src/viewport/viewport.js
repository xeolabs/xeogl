/**
 A **Viewport** controls the canvas viewport for a {{#crossLink "Scene"}}{{/crossLink}}.

 <a href="../../examples/#effects_stereo_custom"><img src="../../../assets/images/screenshots/StereoEffect.png"></img></a>

 ## Overview

 * One Viewport per scene.
 * You can configure a Scene to render multiple times per frame, while setting the Viewport to different extents on each render.
 * Make a Viewport automatically size to its {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}
 by setting its {{#crossLink "Viewport/autoBoundary:property"}}{{/crossLink}} property ````true```` (default is ````false````).

 ## Examples

 * [Stereo effect using alternating viewports](../../examples/#effects_stereo_custom)

 ## Usage

 Configuring the Scene to render twice on each frame, each time to a separate viewport:

 ````Javascript
 // Load glTF model
 var model = new xeogl.GLTFModel({
    src: "models/gltf/GearboxAssy/glTF-MaterialsCommon/GearboxAssy.gltf"
 });

 var scene = model.scene;
 var viewport = scene.viewport;

 // Configure Scene to render twice for each frame
 scene.passes = 2; // Default is 1
 scene.clearEachPass = false; // Default is false

 // Render to a separate viewport on each render

 var viewport = scene.viewport;
 viewport.autoBoundary = false;

 scene.on("rendering", function (e) {
     switch (e.pass) {
         case 0:
             viewport.boundary = [0, 0, 200, 200]; // xmin, ymin, width, height
             break;

         case 1:
             viewport.boundary = [200, 0, 200, 200];
             break;
     }
 });
 ````

 @class Viewport
 @module xeogl
 @submodule rendering
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Viewport configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent
 {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Viewport.
 @param [cfg.boundary] {Array of Number} Canvas-space Viewport boundary, given as
 (min, max, width, height). Defaults to the size of the parent
 {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.
 @param [cfg.autoBoundary=false] {Boolean} Indicates whether this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}}
 automatically synchronizes with the size of the parent {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

 @extends Component
 */
import {Component} from '../component.js';
import {State} from '../renderer/state.js';
import {componentClasses} from "./../componentClasses.js";

const type = "xeogl.Viewport";

class Viewport extends Component {

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
            boundary: [0, 0, 100, 100]
        });

        this.boundary = cfg.boundary;
        this.autoBoundary = cfg.autoBoundary;
    }


    /**
     The canvas-space boundary of this Viewport, indicated as [min, max, width, height].

     Defaults to the size of the parent
     {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

     Ignores attempts to set value when {{#crossLink "Viewport/autoBoundary:property"}}{{/crossLink}} is ````true````.

     Fires a {{#crossLink "Viewport/boundary:event"}}{{/crossLink}} event on change.

     @property boundary
     @default [size of Scene Canvas]
     @type {Array of Number}
     */
    set boundary(value) {

        if (this._autoBoundary) {
            return;
        }

        if (!value) {

            const canvasBoundary = this.scene.canvas.boundary;

            const width = canvasBoundary[2];
            const height = canvasBoundary[3];

            value = [0, 0, width, height];
        }

        this._state.boundary = value;

        this._renderer.imageDirty();

        /**
         Fired whenever this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} property changes.

         @event boundary
         @param value {Boolean} The property's new value
         */
        this.fire("boundary", this._state.boundary);
    }

    get boundary() {
        return this._state.boundary;
    }

    /**
     Indicates whether this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} automatically
     synchronizes with the size of the parent {{#crossLink "Scene"}}Scene's{{/crossLink}} {{#crossLink "Canvas"}}{{/crossLink}}.

     When set true, then this Viewport will fire a {{#crossLink "Viewport/boundary/event"}}{{/crossLink}} whenever
     the {{#crossLink "Canvas"}}{{/crossLink}} resizes. Also fires that event as soon as this ````autoBoundary````
     property is changed.

     Fires a {{#crossLink "Viewport/autoBoundary:event"}}{{/crossLink}} event on change.

     @property autoBoundary
     @default false
     @type Boolean
     */
    set autoBoundary(value) {

        value = !!value;

        if (value === this._autoBoundary) {
            return;
        }

        this._autoBoundary = value;

        if (this._autoBoundary) {
            this._onCanvasSize = this.scene.canvas.on("boundary",
                function (boundary) {

                    const width = boundary[2];
                    const height = boundary[3];

                    this._state.boundary = [0, 0, width, height];

                    this._renderer.imageDirty();

                    /**
                     Fired whenever this Viewport's {{#crossLink "Viewport/boundary:property"}}{{/crossLink}} property changes.

                     @event boundary
                     @param value {Boolean} The property's new value
                     */
                    this.fire("boundary", this._state.boundary);

                }, this);

        } else if (this._onCanvasSize) {
            this.scene.canvas.off(this._onCanvasSize);
            this._onCanvasSize = null;
        }

        /**
         Fired whenever this Viewport's {{#crossLink "autoBoundary/autoBoundary:property"}}{{/crossLink}} property changes.

         @event autoBoundary
         @param value The property's new value
         */
        this.fire("autoBoundary", this._autoBoundary);
    }

    get autoBoundary() {
        return this._autoBoundary;
    }

    _getState() {
        return this._state;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = Viewport;

export{Viewport};