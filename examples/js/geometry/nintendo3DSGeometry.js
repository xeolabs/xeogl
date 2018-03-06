/**
 A **Nintendo3DSGeometry** is a {{#crossLink "Geometry"}}{{/crossLink}} that's loaded from a
 <a href="https://en.wikipedia.org/wiki/Nintendo_3DS">Nintendo 3DS</a> file.

 <a href="../../examples/#importing_3ds_lexus"><img src="../../assets/images/screenshots/Nintendo3DSGeometry.png"></img></a>

 ## Overview

 * A Nintendo3DSGeometry mesh is defined by the .3DS file referenced by the Nintendo3DSGeometry's {{#crossLink "Nintendo3DSGeometry/src:property"}}{{/crossLink}} property.
 * Internally uses the <a href="http://k3d.ivank.net/">k3d.js</a> library for parsing .3DS files.

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

 var cameraFlight = new xeogl.CameraFlightAnimation();

 entity.geometry.on("loaded", function () {
     cameraFlight.flyTo({
         aabb: entity.aabb
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
 @param [cfg.autoNormals] {Boolean} Set true to automatically generate normal vectors from positions and indices.
 @extends Geometry
 */
(function () {

    "use strict";

    xeogl.Nintendo3DSGeometry = xeogl.Geometry.extend({

        type: "xeogl.Nintendo3DSGeometry",

        _init: function (cfg) {

            if (!cfg.src) {
                this.error("property required: 'src'");
                return;
            }

            var spinner = this.scene.canvas.spinner;
            spinner.processes++;

            var self = this;
            var _super = self._super;

            load(cfg.src, function (data) {

                    if (!data.length) {
                        //    return;
                    }

                    var m = K3D.parse.from3DS(data);
                    var mesh = m.edit.objects[0].mesh;
                    var positions = mesh.vertices;
                    var uv = mesh.uvt;
                    var normals = null;
                    var indices = mesh.indices;
                    var tangents = null;

                    _super.call(self, xeogl._apply(cfg, {
                        primitive: "triangles",
                        positions: positions,
                        normals: normals && normals.length > 0 ? normals : null,
                        autoNormals: !normals || normals.length === 0,
                        uv: uv,
                        indices: indices
                    }));

                    spinner.processes--;

                    self.fire("loaded", true);
                },

                function (msg) {

                    spinner.processes--;

                    self.error("Failed to load .3DS file: " + msg);

                    self.fire("failed", msg);
                });
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