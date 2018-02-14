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

        var lastEntity;

        return function (id) {

            if (!id) {
                cameraFlight.flyTo();
                if (lastEntity) {
                    lastEntity.material.alphaMode = "blend";
                    lastEntity.material.alpha = 0.4;
                    lastEntity.outlined = false;
                    lastEntity = null;
                }
                return;
            }

            var entity = model.scene.entities[id];

            if (entity) {

                if (lastEntity) {
                    lastEntity.material.alphaMode = "blend";
                    lastEntity.material.alpha = 0.4;
                    lastEntity.outlined = false;
                }

                entity.material.alphaMode = "opaque";
                entity.material.alpha = 1.0;
                //entity.outlined = true;

                cameraFlight.flyTo({
                    aabb: entity.aabb,
                    fitFOV: 25,
                    duration: 1.0,
                    showAABB: false
                });

                lastEntity = entity;
            }
        };
    })();

    var cameraControl = new xeogl.CameraControl();

    model.on("loaded", function () {

        var entities = model.types["xeogl.Entity"];
        var entity;
        var material;

        var html = [""];
        var i = 0;

        for (var entityId in entities) {
            if (entities.hasOwnProperty(entityId)) {

                entity = entities[entityId];

               // entity.material = entity.material.clone();
               // entity.material.alpha = 0.5;
               // entity.material.alphaMode = "blend";

                // model.add(entity.material);

                html.push("<a href='javascript:flyTo(\"" + entity.id + "\")'>" + (entity.meta.name || ("entity." + i++)) + "</a><br>")
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