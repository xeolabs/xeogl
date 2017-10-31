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

            var material = new xeogl.PhongMaterial(this, {
                emissive: [0.5, 1.0, 0.5],
                diffuse: [0, 0, 0]
            });

            this._label = new xeogl.Entity(this, {
                geometry: new xeogl.VectorTextGeometry(this, {
                    text: "",
                    origin: [0, 0],
                    size: .1
                }),
                transform: new xeogl.Translate(this, {
                    parent: new xeogl.Translate(this)
                }),
                material: material,
                billboard: "spherical"

            });

            this._wire = new xeogl.Entity(this, {
                geometry: new xeogl.Geometry(this, {
                    primitive: "lines",
                    positions: [0.0, 0.0, 0.0, 0.0, -1.3, 0.0],
                    indices: [0, 1]
                }),
                material: material,
                transform: new xeogl.Translate(this),
                billboard: "spherical"
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
                    this._label.geometry.size = value;
                },
                get: function () {
                    return this._label.geometry.size;
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
                this._wire.geometry.positions = [0, 0, 0, this._offset[0], this._offset[1], this._offset[2]];
                this._wire.transform.xyz = this._pos;
                this._label.transform.parent.xyz = this._pos;
                this._label.transform.xyz = [this._offset[0], this._offset[1], this._offset[2]];
            };
        })()
    });
})();
