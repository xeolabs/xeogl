(function () {

    "use strict";

    /**
     An **ObjGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that's loaded from a
     <a href="https://en.wikipedia.org/wiki/Wavefront_.obj_file" target = "_other">Wavefront .OBJ</a> file.

     ## Examples

     <ul>
     <li>[Importing a Raptor from OBJ](../../examples/#importing_obj_raptor)</li>
     </ul>

     ## Usage

     ````javascript
     var entity = new XEO.Entity({

        geometry: new XEO.OBJGeometry({
            src: "models/obj/raptor.obj"
        }),

        material: new XEO.PhongMaterial({
            diffuseMap: new XEO.Texture({
                src: "models/obj/raptor.jpg"
            })
        }),

        transform: new XEO.Rotate({
            xyz: [1, 0, 0],
            angle: 0,

            parent: new XEO.Translate({
                xyz: [10, 3, 10]
            })
        })
     });

     // When the OBJGeometry has loaded,
     // fly the camera to fit the entity in view

     var cameraFlight = new XEO.CameraFlight();

     entity.geometry.on("loaded", function () {

             cameraFlight.flyTo({
                 aabb: entity.worldBoundary.aabb
             });
         });
     ````

     @class OBJGeometry
     @module XEO
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
    XEO.OBJGeometry = XEO.Geometry.extend({

        type: "XEO.OBJGeometry",

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

                    if (!XEO._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    //this._taskId = this.taskStarted("Loading .OBJ");

                    this._src = value;

                    var self = this;

                    load(this._src, function (data) {

                            if (!data.length) {
                                //    return;
                            }

                            XEO.scheduleTask(function () {

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

                                // Need to flip the UV coordinates on Y-axis for SceneJS geometry

                                for (var i = 1, len = uv.length; i < len; i += 2) {
                                    uv[i] *= -1.0;
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

                                self.fire("loaded", true);
                            });
                        },

                        function (msg) {

                            self.error("Failed to load .OBJ file: " + msg);

                            self.fire("failed", msg);

                            //self._taskId = self.taskFailed(self._taskId);
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