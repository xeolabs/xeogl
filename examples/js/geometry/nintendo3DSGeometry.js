(function () {

    "use strict";

    /**
     A **Nintendo3DSGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that's loaded from a
     <a href="https://en.wikipedia.org/wiki/Nintendo_3DS" target = "_other">Nintendo 3DS</a> file.

     <a href="../../examples/#geometry_Nintendo3DSGeometry_lexus"><img src="../../assets/images/screenshots/Nintendo3DSGeometry.png"></img></a>

     ## Overview

     * A Nintendo3DSGeometry mesh is determined by the .3DS file referenced by the Nintendo3DSGeometry's {{#crossLink "Nintendo3DSGeometry/src:property"}}{{/crossLink}} property.
     * Set the {{#crossLink "Nintendo3DSGeometry/src:property"}}{{/crossLink}} property to a different file at any time, to regenerate the Nintendo3DSGeometry's mesh from the new file.

     ## Examples

     <ul>
     <li>[Importing a Lexus from 3DS](../../examples/#importing_3ds_lexus)</li>
     </ul>

     ## Usage

     ````javascript
     var entity = new xeogl.Entity({

        geometry: new xeogl.Nintendo3DSGeometry({
            src: "models/3ds/lexus.3ds"
        }),

        material: new xeogl.PhongMaterial({
            diffuseMap: new xeogl.Texture({
                src: "models/3ds/lexus.jpg"
            }),
            specular: [0, 0, 0]
        }),

        // We need to rotate this particular .3DS model
        transform: new xeogl.Rotate({
            xyz: [1,0,0],
            angle: -90,
            parent: new xeogl.Rotate({
                xyz: [0,1,0],
                angle: 90
            })
        })
     });

     // When the Nintendo3DSGeometry has loaded,
     // fly the camera to fit the entity in view

     var cameraFlight = new xeogl.CameraFlight();

     entity.geometry.on("loaded", function () {

             cameraFlight.flyTo({
                 aabb: entity.worldBoundary.aabb
             });
         });
     ````

     @class Nintendo3DSGeometry
     @module xeogl
     @submodule geometry
     @constructor
     @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Nintendo3DSGeometry in the default
     {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     @param [cfg] {*} Configs
     @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
     generated automatically when omitted.
     @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Nintendo3DSGeometry.
     @param [cfg.src] {String} Path to the .3DS file.
     @extends Geometry
     */
    xeogl.Nintendo3DSGeometry = xeogl.Geometry.extend({

        type: "xeogl.Nintendo3DSGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to the .OBJ file.

             Fires a {{#crossLink "Nintendo3DSGeometry/src:event"}}{{/crossLink}} event on change.

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

                    //this._taskId = this.taskStarted("Loading .3DS");

                    this._src = value;

                    var self = this;

                    load(this._src, function (data) {

                            if (!data.length) {
                                //    return;
                            }

                            xeogl.scheduleTask(function () {

                                var m = K3D.parse.from3DS(data);

                                var mesh = m.edit.objects[0].mesh;

                                // Need to flip the UV coordinates on Y-axis for SceneJS geometry
                                if (mesh.uvt) {
                                    for (var i = 1, len = mesh.uvt.length; i < len; i += 2) {
                                        mesh.uvt[i] *= -1.0;
                                    }
                                }

                                self.primitive = "triangles";
                                self.positions = mesh.vertices;
                                self.uv = mesh.uvt;
                                self.normals = null;
                                self.autoNormals = false;
                                self.indices = mesh.indices;
                                self.tangents = null;

                                self.fire("loaded", true);
                            });
                        },

                        function (msg) {

                            self.error("Failed to load .3DS file: " + msg);

                            self.fire("failed", msg);

                            //self._taskId = self.taskFailed(self._taskId);
                        });

                    /**
                     Fired whenever this Nintendo3DSGeometry's  {{#crossLink "Nintendo3DSGeometry/src:property"}}{{/crossLink}} property changes.
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