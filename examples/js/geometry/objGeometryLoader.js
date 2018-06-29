(function () {

    "use strict";

    xeogl.loadOBJGeometry = function (scene, src, ok, error) {

        var spinner = scene.canvas.spinner;
        spinner.processes++;

        load(src, function (data) {

                if (!data.byteLength) {
                    spinner.processes--;
                    error("No data loaded");
                }
                var m = K3D.parse.fromOBJ(data);	// done !

                // unwrap simply duplicates some values, so they can be indexed with indices [0,1,2,3 ... ]
                // In some rendering engines, you can have only one index value for vertices, UVs, normals ...,
                // so "unwrapping" is a simple solution.
                var positions = K3D.edit.unwrap(m.i_verts, m.c_verts, 3);
                var normals = K3D.edit.unwrap(m.i_norms, m.c_norms, 3);
                var uv = K3D.edit.unwrap(m.i_uvt, m.c_uvt, 2);
                var indices = new Int32Array(m.i_verts.length);

                for (var i = 0; i < m.i_verts.length; i++) {
                    indices[i] = i;
                }

                spinner.processes--;

                ok(new xeogl.Geometry(scene, {
                    primitive: "triangles",
                    positions: positions,
                    normals: normals.length > 0 ? normals : null,
                    autoNormals: normals.length === 0,
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