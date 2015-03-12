(function () {

    "use strict";

    /**
     A **Lookat** defines a viewing transform as an {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} position, a
     {{#crossLink "Lookat/look:property"}}look{{/crossLink}} position and an {{#crossLink "Lookat/up:property"}}up{{/crossLink}}
     vector.

     <ul>
     <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with projection transforms such as
     {{#crossLink "Perspective"}}Perspective{{/crossLink}}, to define viewpoints on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
     </ul>

     <img src="http://www.gliffy.com/go/publish/image/6895163/L.png"></img>

     ### Example

     In this example we have a Lookat that positions the eye at -10 on the World-space Z-axis, while looking at the origin.
     Then we'll add that to a {{#crossLink "Camera"}}{{/crossLink}}. which we associate with a {{#crossLink "GameObject"}}{{/crossLink}}.

     ````Javascript
     var scene = new XEO.Scene();

     var myLookat = new XEO.Lookat(scene, {
        eye: [0,0,-10],
        look: [0,0,0],
        up: [0,1,0]
    });

     var camera = new XEO.Camera(scene, {
        view: myLookat
    });

     var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

     var object = new XEO.GameObject(scene, {
        camera: camera,
        geometry: geometry
    });

     // Subscribe to changes on a camera property
     lookat.on("eye", function(value) {
        console.log("eye updated: " + value[0] + ", " + value[1] + ", " + value[2]);
    });

     // Set the value of a camera property, which fires the event we just subscribed to
     lookat.eye = [-5, 0, -10];

     // Get the value of a camera property
     var value = lookat.eye;

     // Destroy ths lookat, causing the camera to fall back on the scene's default viewing transform
     lookat.destroy();
     ````

     @class Lookat
     @module XEO
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lookat in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lookat.
     @param [cfg.eye=[0,0,-10]] {Array of Number} Eye position.
     @param [cfg.look=[0,0,0]] {Array of Number} The position of the point-of-interest we're looking at.
     @param [cfg.up=[0,1,0]] {Array of Number} The "up" vector.
     @extends Component
     @author xeolabs / http://xeolabs.com/
     */
    XEO.Lookat = XEO.Component.extend({

        className: "XEO.Lookat",

        type: "view",

        _init: function (cfg) {

            this.eye = cfg.eye;
            this.look = cfg.look;
            this.up = cfg.up;

            var state = this._state;

            var self = this;

            state.rebuild = function () {

                // Build matrix values

                state.matrix = XEO.math.lookAtMat4c(
                    state.eye[0], state.eye[1], state.eye[2],
                    state.look[0], state.look[1], state.look[2],
                    state.up[0], state.up[1], state.up[2]);

                state.lookAt = {
                    eye: state.eye,
                    look: state.look,
                    up: state.up
                };

                // Build typed arrays for view matrix and normal matrix
                // Avoid reallocating those if possible

                if (!state.mat) {

                    // Create arrays

                    state.mat = new Float32Array(state.matrix);
                    state.normalMat = new Float32Array(
                        XEO.math.transposeMat4(XEO.math.inverseMat4(state.matrix, XEO.math.mat4())));

                } else {

                    // Insert into existing arrays

                    state.mat.set(state.matrix);
                    state.normalMat.set(
                        XEO.math.transposeMat4(XEO.math.inverseMat4(state.matrix, XEO.math.mat4())));
                }

                /**
                 * Fired whenever this Lookat's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is regenerated.
                 * @event matrix
                 * @param value The property's new value
                 */
                self.fire("matrix", state.matrix);

                state.dirty = false;
            };

            this._state.dirty = true;
        },

        _props: {

            /**
             * Position of the eye.
             * Fires an {{#crossLink "Lookat/eye:event"}}{{/crossLink}} event on change.
             * @property eye
             * @default [0,0,-10]
             * @type Array(Number)
             */
            eye: {

                set: function (value) {
                    value = value || [0, 0, -10];
                    this._state.eye = value;
                    this._state.dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/eye:property"}}{{/crossLink}} property changes.
                     * @event eye
                     * @param value The property's new value
                     */
                    this.fire("eye", value);
                },

                get: function () {
                    return this._state.eye;
                }
            },

            /**
             * Position of the point-of-interest.
             * Fires a {{#crossLink "Lookat/look:event"}}{{/crossLink}} event on change.
             * @property look
             * @default [0,0,0]
             * @type Array(Number)
             */
            look: {

                set: function (value) {
                    value = value || [0, 0, 0];
                    this._state.look = value;
                    this._state.dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/look:property"}}{{/crossLink}} property changes.
                     * @event look
                     * @param value The property's new value
                     */
                    this.fire("look", value);
                },

                get: function () {
                    return this._state.look;
                }
            },

            /**
             * Direction of the "up" vector.
             * Fires an {{#crossLink "Lookat/up:event"}}{{/crossLink}} event on change.
             * @property up
             * @default [0,1,0]
             * @type Array(Number)
             */
            up: {

                set: function (value) {
                    value = value || [0, 1, 0];
                    this._state.up = value;
                    this._state.dirty = true;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/up:property"}}{{/crossLink}} property changes.
                     * @event up
                     * @param value The property's new value
                     */
                    this.fire("up", value);
                },

                get: function () {
                    return this._state.up;
                }
            },

            /**
             * The matrix for this viewing transform (read only). After any update to the
             * {{#crossLink "Lookat/look:event"}}{{/crossLink}}, {{#crossLink "Lookat/eye:event"}}{{/crossLink}} or
             * {{#crossLink "Lookat/up:event"}}{{/crossLink}} properties, this will be lazy-regenerated when next read, or
             * on the next {{#crossLink "Scene/tick:event"}}{{/crossLink}} event from the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}, whichever happens first. Whever this property is regenerated, it is
             * fired in a {{#crossLink "Lookat/matrix:event"}}{{/crossLink}} event.
             * @property matrix
             * @type Array(Number)
             */
            matrix: {

                get: function () {
                    if (this._state.dirty) {
                        this._state.rebuild();
                    }
                    return this._state.matrix.slice(0);
                }
            }
        },

        _compile: function () {
            this._renderer.viewTransform = this._state;
        },

        _getJSON: function () {
            return {
                eye: this.eye,
                look: this.look,
                up: this.up
            };
        }
    });

})();

