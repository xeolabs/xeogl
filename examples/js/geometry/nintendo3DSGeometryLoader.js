(function () {

    "use strict";

    xeogl.load3DSGeometry = function (scene, src, ok, error) {

        var spinner = scene.canvas.spinner;
        spinner.processes++;

        load(src, function (data) {

                if (!data.byteLength) {
                    spinner.processes--;
                    error("No data loaded");
                }

                if (!data.length) {
                    //    return;
                }

                var m = K3D.parse.from3DS(data);
                var mesh = m.edit.objects[0].mesh;
                var positions = mesh.vertices;
                var uv = mesh.uvt;
                var normals = null;
                var indices = mesh.indices;

                spinner.processes--;

                ok(new xeogl.Geometry(scene, {
                    primitive: "triangles",
                    positions: positions,
                    normals: normals && normals.length > 0 ? normals : null,
                    autoNormals: !normals || normals.length === 0,
                    uv: uv,
                    indices: indices
                }));
            },

            function (msg) {
                console.error("xeogl.loadOBJGeometry: " + msg);
                spinner.processes--;
                error(msg);
            });
    };

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