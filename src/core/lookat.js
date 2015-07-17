/**
 A **Lookat** defines a viewing transform as an {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} position, a
 {{#crossLink "Lookat/look:property"}}look{{/crossLink}} position and an {{#crossLink "Lookat/up:property"}}up{{/crossLink}}
 vector.

 ## Overview

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with projection transforms such as
 {{#crossLink "Perspective"}}Perspective{{/crossLink}}, to define viewpoints on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>See <a href="Shader.html#inputs">Shader Inputs</a> for the variables that Lookat components create within xeoEngine's shaders.</li>
 </ul>

 <img src="../../../assets/images/Lookat.png"></img>

 ## Example

 In this example we have a Lookat that positions the eye at -10 on the World-space Z-axis, while looking at the origin.
 Then we aattach our Lookat to a {{#crossLink "Camera"}}{{/crossLink}}. which we attach to a {{#crossLink "GameObject"}}{{/crossLink}}.

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
(function () {

    "use strict";

    XEO.Lookat = XEO.Component.extend({

        className: "XEO.Lookat",

        type: "view",

        _init: function (cfg) {

            this._state = new XEO.renderer.ViewTransform({
                matrix: null,
                normalMatrix: null,
                eye: [0, 0, -10.0],
                look: [0, 0, 0.0 ],
                up: [0, 1, 0.0 ]
            });

            this._dirty = true;

            this.eye = cfg.eye;
            this.look = cfg.look;
            this.up = cfg.up;
        },

        // Schedules a call to #_build on the next "tick"
        _scheduleBuild: function () {

            if (!this._dirty) {

                this._dirty = true;

                var self = this;

                this.scene.once("tick",
                    function () {
                        self._build();
                    });
            }
        },

        // Rebuilds rendering state
        _build: function () {

            this._state.matrix = XEO.math.lookAtMat4c(
                this._state.eye[0], this._state.eye[1], this._state.eye[2],
                this._state.look[1], this._state.look[1], this._state.look[2],
                this._state.up[0], this._state.up[1], this._state.up[2],
                this._state.matrix);

            this._state.normalMat = XEO.math.transposeMat4(
                XEO.math.inverseMat4(this._state.matrix, this._state.normalMat));

            this._dirty = false;

            /**
             * Fired whenever this Lookat's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is updated.
             *
             * @event matrix
             * @param value The property's new value
             */
            this.fire("matrix", this._state.matrix);
        },

        _props: {

            /**
             * Position of this Lookat's eye.
             *
             * Fires an {{#crossLink "Lookat/eye:event"}}{{/crossLink}} event on change.
             *
             * @property eye
             * @default [0,0,-10]
             * @type Array(Number)
             */
            eye: {

                set: function (value) {

                    this._state.eye = value || [0, 0, -10];

                    this._renderer.imageDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/eye:property"}}{{/crossLink}} property changes.
                     *
                     * @event eye
                     * @param value The property's new value
                     */
                    this.fire("eye", this._state.eye);
                },

                get: function () {
                    return this._state.eye;
                }
            },

            /**
             * Position of this Lookat's point-of-interest.
             *
             * Fires a {{#crossLink "Lookat/look:event"}}{{/crossLink}} event on change.
             *
             * @property look
             * @default [0,0,0]
             * @type Array(Number)
             */
            look: {

                set: function (value) {

                    this._state.look = value || [0, 0, 0];

                    this._renderer.imageDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/look:property"}}{{/crossLink}} property changes.
                     *
                     * @event look
                     * @param value The property's new value
                     */
                    this.fire("look", this._state.look);
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

                    this._state.up = value || [0, 1, 0];

                    this._renderer.imageDirty = true;

                    this._scheduleBuild();

                    /**
                     * Fired whenever this Lookat's  {{#crossLink "Lookat/up:property"}}{{/crossLink}} property changes.
                     *
                     * @event up
                     * @param value The property's new value
                     */
                    this.fire("up", this._state.up);
                },

                get: function () {
                    return this._state.up;
                }
            },

            /**
             * The elements of this Lookat's view transform matrix.
             *
             * Fires a {{#crossLink "Lookat/matrix:event"}}{{/crossLink}} event on change.
             *
             * @property matrix
             * @type {Float64Array}
             */
            matrix: {

                get: function () {

                    if (this._dirty) {
                        this._build();
                    }

                    return this._state.matrix.slice(0);
                }
            }
        },

        _compile: function () {

            if (this._dirty) {
                this._build();
            }

            this._renderer.viewTransform = this._state;
        },

        _getJSON: function () {
            return {
                eye: this._state.eye,
                look: this._state.look,
                up: this._state.up
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
