(function () {

    "use strict";

    /**
     An **OBJGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that's loaded from a
     <a href="https://en.wikipedia.org/wiki/Wavefront_.obj_file">Wavefront .OBJ</a> file.

     <a href="../../examples/#importing_obj_raptor"><img src="../../assets/images/screenshots/OBJGeometry.png"></img></a>

     ## Overview

     * An OBJGeometry mesh is defined by the Wavefront .OBJ file referenced by the OBJGeometry's {{#crossLink "OBJGeometry/src:property"}}{{/crossLink}} property.
     * An OBJGeometry only parses the geometry data from the .OBJ file and ignores any associated .MTL file.
     * Set the {{#crossLink "OBJGeometry/src:property"}}{{/crossLink}} property to a different file at any time, to regenerate the OBJGeometry's mesh from the new file.
     * Internally uses the <a href="http://k3d.ivank.net/">k3d.js</a> library for parsing .OBJ files.

     ## Examples

     <ul>
     <li>[Importing a Raptor from OBJ](../../examples/#importing_obj_raptor)</li>
     </ul>

     ## Usage

     ````javascript
     var entity = new xeogl.Entity({

        geometry: new xeogl.OBJGeometry({
            src: "models/obj/raptor.obj"
        }),

        material: new xeogl.PhongMaterial({
            diffuseMap: new xeogl.Texture({
                src: "models/obj/raptor.jpg"
            })
        }),

        transform: new xeogl.Rotate({
            xyz: [1, 0, 0],
            angle: 0,

            parent: new xeogl.Translate({
                xyz: [10, 3, 10]
            })
        })
     });

     // When the OBJGeometry has loaded,
     // fly the camera to fit the entity in view

     var cameraFlight = new xeogl.CameraFlightAnimation();

     entity.geometry.on("loaded", function () {

             cameraFlight.flyTo({
                 aabb: entity.worldBoundary.aabb
             });
         });
     ````

     @class OBJGeometry
     @module xeogl
     @submodule geometry
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this OBJGeometry in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
     generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this OBJGeometry.
     @param [cfg.src] {String} Path to the .OBJ file.
     @extends Geometry
     */
    xeogl.OBJGeometry = xeogl.Geometry.extend({

        type: "xeogl.OBJGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to the .OBJ file.

             Fires a {{#crossLink "OBJGeometry/src:event"}}{{/crossLink}} event on change.

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

                    // Increment processes represented by loading spinner
                    // Spinner appears as soon as count is non-zero

                    var spinner = this.scene.canvas.spinner;
                    spinner.processes++;

                    this._src = value;

                    var self = this;

                    load(this._src, function (data) {

                            if (!data.length) {
                                //    return;
                            }

                            xeogl.scheduleTask(function () {

                                var m = K3D.parse.fromOBJ(data);	// done !

                                // unwrap simply duplicates some values, so they can be indexed with indices [0,1,2,3 ... ]
                                // In some rendering engines, you can have only one index value for vertices, UVs, normals ...,
                                // so "unwrapping" is a simple solution.

                                var positions = K3D.edit.unwrap(m.i_verts, m.c_verts, 3);
                                var normals = K3D.edit.unwrap(m.i_norms, m.c_norms, 3);
                                var uv = K3D.edit.unwrap(m.i_uvt, m.c_uvt, 2);

                                var indices = [];

                                for (var i = 0; i < m.i_verts.length; i++) {
                                    indices.push(i);
                                }

                                self.primitive = "triangles";
                                self.positions = positions;
                                if (uv.length > 0) {
                                    self.uv = uv;
                                }
                                if (normals.length > 0) {
                                    self.normals = normals;
                                    self.autoNormals = false;
                                } else {
                                    self.autoNormals = true;
                                }

                                self.indices = indices;

                                spinner.processes--;

                                self.fire("loaded", true);
                            });
                        },

                        function (msg) {

                            spinner.processes--;

                            self.error("Failed to load .OBJ file: " + msg);

                            self.fire("failed", msg);
                        });

                    /**
                     Fired whenever this OBJGeometry's  {{#crossLink "OBJGeometry/src:property"}}{{/crossLink}} property changes.
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

        _getJSON: function () {
            return {
                src: this._src
            };
        }
    });

    function load(url, ok, error) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
//            xhr.addEventListener('progress',
//                function (event) {
//                    // TODO: Update the task? { type:'progress', loaded:event.loaded, total:event.total }
//                }, false);
        xhr.addEventListener('load',
            function (event) {
                if (event.target.response) {
                    ok(event.target.response);
                } else {
                    error('Invalid file [' + url + ']');
                }
            }, false);
        xhr.addEventListener('error',
            function () {
                error('Couldn\'t load URL [' + url + ']');
            }, false);
        xhr.open('GET', url, true);
        xhr.send(null);
    }

})();