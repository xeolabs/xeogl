(function () {

    "use strict";

    /**
     An **SceneJSModel** is a {{#crossLink "Model"}}{{/crossLink}} that's loaded from the
     JSON-based <a href="http://scenejs.org">SceneJS</a> scene definition format.

     <a href="../../examples/#models_SceneJSModel_tronTank"><img src="http://i.giphy.com/l3vR50pFTpEbJTztS.gif"></img></a>

     ## Overview

     * A SceneJSModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from SceneJS JSON.
     * It begins loading as soon as you set its {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}}
     property to the location of a valid SceneJS JSON file.
     * You can set {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}} to a new file path at any time, which causes
     the SceneJSModel to clear itself and load components from the new file.
     * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
     * Provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

     <img src="../../../assets/images/SceneJSModel.png"></img>

     ## Examples

     * [Importing the SceneJS Tron Tank model](../../examples/#models_SceneJSModel_tronTank)

     ## Usage

     Importing a <a href="../../examples/models/scenejs/tronTank.json">SceneJS JSON model</a> into the default xeogl {{#crossLink "Scene"}}{{/crossLink}}:

     ````javascript
     // Import SceneJS JSON model
     var tank = new xeogl.SceneJSModel({
        id: "tank",
        src: "models/scenejs/tronTank.min.json",
        transform: new xeogl.Rotate({ // Tank direction
            xyz: [0, 1, 0],
            angle: 0,
            parent: new xeogl.Translate({ // Tank position
                xyz: [0, 0, 0]
            })
        })
     });

     // Set camera position
     var view = tank.scene.camera.view;
     view.eye = [0, 0, -70];
     view.look = [0, 0, 0];
     view.up = [0, 1, 0];
     ````

     @class SceneJSModel
     @module xeogl
     @submodule model
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this SceneJSModel in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
     generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SceneJSModel.
     @param [cfg.src] {String} Path to the JSON file.
     @extends Geometry
     */
    xeogl.SceneJSModel = xeogl.Model.extend({

        type: "xeogl.SceneJSModel",

        _init: function (cfg) {

            this._super(cfg);

            this._src = null;

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to the SceneJS JSON scene description file.

             Update this at any time to load a different file.

             Fires a {{#crossLink "SceneJSModel/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (!xeogl._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    if (value === this._src) { // Already loaded this SceneJSModel

                        /**
                         Fired whenever this SceneJSModel has finished loading the SceneJS JSON file
                         specified by {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}}.
                         @event loaded
                         */
                        this.fire("loaded");

                        return;
                    }

                    this.destroyAll();

                    this._src = value;

                    // Increment processes represented by loading spinner
                    // Spinner appears as soon as count is non-zero

                    var spinner = this.scene.canvas.spinner;
                    spinner.processes++;

                    var self = this;

                    load(this._src, function (node) {

                            self._parse(node, null, null, null);

                            // Decrement processes represented by loading spinner
                            // Spinner disappears if the count is now zero
                            spinner.processes--;

                            xeogl.scheduleTask(function () {
                                self.fire("loaded", true);
                            });
                        },

                        function (msg) {

                            spinner.processes--;

                            self.error("Failed to load JSON file: " + msg);

                            self.fire("failed", msg);
                        });

                    /**
                     Fired whenever this SceneJSModel's  {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        //---------------------------------------------------------------------------------------------------------------
        // A simple recursive descent parser that loads SceneJS JSON into a xeogl.Model.
        // This is just the bare essentials to prove the concept - just transforms, diffuse material and geometry.
        //---------------------------------------------------------------------------------------------------------------

        _parse: function (node, transform, material, modes) {

            switch (node.type) {

                case "material":

                    var scenejsBaseColor = node.baseColor;
                    var scenejsSpecular = node.specular;
                    var scenejsEmit = node.emit;

                    var diffuse = scenejsBaseColor ? [scenejsBaseColor.r, scenejsBaseColor.g, scenejsBaseColor.b] : null;
                    var specular = (scenejsSpecular && diffuse) ? [scenejsSpecular * diffuse[0], scenejsSpecular * diffuse[1], scenejsSpecular * diffuse[2]] : null;
                    var emissive = (scenejsEmit && diffuse) ? [scenejsEmit * diffuse[0], scenejsEmit * diffuse[1], scenejsEmit * diffuse[2]] : null;

                    material = this.add({
                        type: "xeogl.PhongMaterial",
                        id: this._createID(node),
                        diffuse: diffuse,
                        specular: specular,
                        emissive: emissive,
                        opacity: node.alpha
                    });

                    break;

                case "translate":

                    transform = this.add({
                        type: "xeogl.Translate",
                        id: this._createID(node),
                        xyz: [node.x, node.y, node.z],
                        parent: transform
                    });

                    break;

                case "scale":

                    transform = this.add({
                        type: "xeogl.Scale",
                        id: this._createID(node),
                        xyz: [node.x, node.y, node.z],
                        parent: transform
                    });

                    break;

                case "rotate":

                    transform = this.add({
                        type: "xeogl.Rotate",
                        id: this._createID(node),
                        xyz: [node.x, node.y, node.z],
                        angle: node.angle,
                        parent: transform
                    });

                    break;

                case "flags":

                    modes = this.add({
                        type: "xeogl.Modes",
                        id: this._createID(node),
                        transparent: flags.transparent
                    });

                    break;


                case "geometry":

                    var geometry = this.add({
                        type: "xeogl.Geometry",
                        id: this._createID(node),
                        primitive: node.primitive,
                        positions: node.positions,
                        normals: node.normals,
                        uv: node.uv,
                        indices: node.indices
                    });

                    this.add({
                        type: "xeogl.Entity",
                        id: this._createID(node),
                        geometry: geometry,
                        transform: transform,
                        material: material,
                        modes: modes
                    });

                    break;
            }

            var nodes = node.nodes;

            if (nodes) {
                for (var i = 0, len = nodes.length; i < len; i++) {
                    this._parse(nodes[i], transform, material, modes);
                }
            }
        },

        _createID: function (node) {
            return (node.id !== null && node.id !== undefined) ? ("" + this.id + "." + node.id) : null;
        },

        _getJSON: function () {
            return {
                src: this._src
            };
        }
    });

    function load(url, ok, error) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.addEventListener('load', function (event) {
            if (event.target.responseText) {
                try {
                    ok(JSON.parse(event.target.responseText));
                } catch (e) {
                    error('Invalid file [' + url + ']: ' + e);
                }
            } else {
                error('Invalid file [' + url + ']');
            }
        }, false);
        xhr.addEventListener('error', function () {
            error('Couldn\'t load URL [' + url + ']');
        }, false);
        xhr.open('GET', url, true);
        xhr.send(null);
    }

})();