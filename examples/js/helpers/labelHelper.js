(function () {

    "use strict";

    /**

     Helper widget that shows a label.

     @class LabelHelper
     @constructor
     @param cfg {*} Configuration
     */
    xeogl.LabelHelper = xeogl.Component.extend({

        type: "xeogl.LabelHelper",

        _init: function (cfg) {

            var material = this.create({
                type: "xeogl.PhongMaterial",
                emissive: [0.5, 1.0, 0.5],
                diffuse: [0, 0, 0]
            });

            var billboard = this.create({
                type: "xeogl.Billboard"
            });

            this._label = this.create({
                type: "xeogl.Entity",
                geometry: {
                    type: "xeogl.VectorTextGeometry",
                    text: "",
                    origin: [0, 0],
                    size: .1
                },
                transform: {
                    type: "xeogl.Translate"
                },
                material: material,
                billboard: billboard
            });

            this._wire = this.create({
                type: "xeogl.Entity",
                geometry: {
                    primitive: "lines",
                    positions: [0.0, 0.0, 0.0, 0.0, -1.3, 0.0],
                    indices: [0, 1]
                },
                material: material,
                billboard: billboard
            });

            this.text = cfg.text;
            this.textSize = cfg.textSize;
            this.pos = cfg.pos;
            this.offset = cfg.offset;
        },

        _props: {

            text: {
                set: function (value) {
                    this._label.geometry.text = value;
                },
                get: function () {
                    return this._label.geometry.text;
                }
            },

            textSize: {
                set: function (value) {
                    (this._textSize = this._textSize || new xeogl.math.vec3()).set(value || [1, 1]);

                    //this._label.geometry.text = value;
                },
                get: function () {
                    // return this._label.geometry.text;
                }
            },

            pos: {
                set: function (value) {
                    (this._pos = this._pos || new xeogl.math.vec3()).set(value || [0, 0, 0]);
                    this._needUpdate();
                },
                get: function () {
                    return this._pos;
                }
            },

            offset: {
                set: function (value) {
                    (this._offset = this._offset || new xeogl.math.vec3()).set(value || [0, 0, 0]);
                    this._needUpdate();
                },
                get: function () {
                    return this._offset;
                }
            }
        },

        _update: (function () {
            var offset = new Float32Array(3);
            return function () {
                offset[0] = this._pos[0] + this._offset[0];
                offset[1] = this._pos[1] + this._offset[1];
                offset[2] = this._pos[2] + this._offset[2];
                this._wire.geometry.positions = [
                    this._pos[0], this._pos[1], this._pos[2],
                    offset[0], offset[1], offset[2]
                ];
                this._label.transform.xyz = offset;
            };
        })()

    });
})();
