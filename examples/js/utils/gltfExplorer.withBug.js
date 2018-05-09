var gltfExplorer = function (menuId, files) {

    window.onload = function () {
        var div = document.getElementById(menuId);
        Ps.initialize(div);
    };

    if (files.length === 0) {
        return;
    }

    var file = files[0];


    //xeogl.scene.lights.lightMap = new xeogl.CubeTexture({
    //    src: [
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
    //        "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
    //    ]
    //});

    //xeogl.scene.lights.lights = [
    //    new xeogl.AmbientLight({
    //        color: [0.7, 0.7, 0.8]
    //    }),
    //    new xeogl.PointLight({
    //        pos: [-80, 60, 80],
    //        color: [1.0, 1.0, 1.0],
    //        space: "view"
    //    }),
    //    new xeogl.PointLight({
    //        pos: [80, 40, 40],
    //        color: [1.0, 1.0, 1.0],
    //        space: "view"
    //    }),
    //    new xeogl.PointLight({
    //        pos: [-20, 80, -80],
    //        color: [1.0, 1.0, 1.0],
    //        space: "view"
    //    })
    //];

    var model = new xeogl.GLTFModel({
        src: file.src
    });

    model.scene.camera.gimbalLock = false;

    var cameraFlight = new xeogl.CameraFlightAnimation();

    model.scene.on("tick", function () {
        //model.scene.camera.orbitYaw(-0.1);
    });

    window.flyTo = (function () {

        var lastMesh;

        return function (id) {

            if (!id) {
                cameraFlight.flyTo();
                if (lastMesh) {
                    lastMesh.material.alphaMode = "blend";
                    lastMesh.material.alpha = 0.4;
                    lastMesh.outlined = false;
                    lastMesh = null;
                }
                return;
            }

            var mesh = model.scene.meshes[id];

            if (mesh) {

                if (lastMesh) {
                    lastMesh.material.alphaMode = "blend";
                    lastMesh.material.alpha = 0.4;
                    lastMesh.outlined = false;
                }

                mesh.material.alphaMode = "opaque";
                mesh.material.alpha = 1.0;
                //mesh.outlined = true;

                cameraFlight.flyTo({
                    aabb: mesh.aabb,
                    fitFOV: 25,
                    duration: 1.0,
                    showAABB: false
                });

                lastMesh = mesh;
            }
        };
    })();

    var cameraControl = new xeogl.CameraControl();

    model.on("loaded", function () {

        var meshes = model.types["xeogl.Mesh"];
        var mesh;
        var material;

        var html = [""];
        var i = 0;

        for (var meshId in meshes) {
            if (meshes.hasOwnProperty(meshId)) {

                mesh = meshes[meshId];

               // mesh.material = mesh.material.clone();
               // mesh.material.alpha = 0.5;
               // mesh.material.alphaMode = "blend";

                // model.add(mesh.material);

                html.push("<a href='javascript:flyTo(\"" + mesh.id + "\")'>" + (mesh.meta.name || ("mesh." + i++)) + "</a><br>")
            }
        }

        //html.push("</ul>");

        document.getElementById(menuId).innerHTML = html.join("");

        if (file.eye && file.look) {

            cameraFlight.jumpTo({
                eye: file.eye,
                look: file.look,
                up: file.up
            });

        } else {

            cameraFlight.jumpTo({
                aabb: model.aabb,
                fit: true,
                fitFOV: 50
            });
        }
    });
};