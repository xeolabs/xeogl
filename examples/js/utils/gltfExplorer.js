var gltfExplorer = function (menuId, files) {

    window.onload = function () {
        var div = document.getElementById(menuId);
        Ps.initialize(div);
    };

    if (files.length === 0) {
        return;
    }

    var file = files[0];

    xeogl.scene.lights.lightMap = new xeogl.CubeTexture({
        src: [
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
        ]
    });

    xeogl.scene.lights.lights = [
        new xeogl.AmbientLight({
            color: [0.7, 0.7, 0.8]
        }),
        new xeogl.PointLight({
            pos: [-80, 60, 80],
            color: [1.0, 1.0, 1.0],
            space: "view"
        }),
        new xeogl.PointLight({
            pos: [80, 40, 40],
            color: [1.0, 1.0, 1.0],
            space: "view"
        }),
        new xeogl.PointLight({
            pos: [-20, 80, -80],
            color: [1.0, 1.0, 1.0],
            space: "view"
        })
    ];

    var model = new xeogl.GLTFModel({
        src: file.src
    });

    model.scene.camera.view.gimbalLockY = false;

    var cameraFlight = new xeogl.CameraFlightAnimation();

    model.scene.on("tick", function () {
        model.scene.camera.view.rotateEyeY(-0.1);
    });

    window.flyTo = (function () {

        var boundaryHelper = new xeogl.Entity({
            geometry: {type: "xeogl.OBBGeometry"},
            material: {
                type: "xeogl.PhongMaterial",
                diffuse: [0, 0, 0],
                ambient: [0, 0, 0],
                specular: [0, 0, 0],
                emissive: [1.0, 1.0, 0.5],
                lineWidth: 3
            },
            visibility: {
                visible: false
            },
            modes: {
                collidable: false
            }
        });

        var lastEntity;

        return function (id) {

            if (!id) {
                cameraFlight.flyTo();
                if (lastEntity) {
                    lastEntity.modes.transparent = true;
                    lastEntity = null;
                    boundaryHelper.visibility.visible = false;
                }
                return;
            }

            var entity = model.scene.entities[id];

            if (entity) {

                if (lastEntity) {
                    lastEntity.modes.transparent = true;
                }

                entity.modes.transparent = false;

                boundaryHelper.geometry.obb = entity.worldBoundary.obb;
                boundaryHelper.visibility.visible = true;

                cameraFlight.flyTo({
                    aabb: entity.worldBoundary.aabb,
                    fitFOV: 25,
                    duration: 1.0,
                    showAABB: false
                });

                lastEntity = entity;
            }
        };
    })();

    var cameraControl = new xeogl.CameraControl();
    cameraControl.mousePickEntity.active = false;

    var mousePickEntity = new xeogl.MousePickEntity({
        pickSurface: true
    });
    mousePickEntity.on("pick", function (e) {
        flyTo(e.entity.id);
    });

    mousePickEntity.on("nopick", function () {
        flyTo();
    });

    model.on("loaded", function () {

        var entities = model.types["xeogl.Entity"];
        var entity;

        var html = [""];

        for (var entityId in entities) {
            if (entities.hasOwnProperty(entityId)) {

                entity = entities[entityId];

                if (entity.material.type === "xeogl.PhongMaterial") {
                    entity.material = new xeogl.SpecularMaterial({ // For fun, convert Phong to Specular PBR
                        diffuse: entity.material.diffuse,
                        specular: entity.material.specular,
                        glossiness: 0.5,
                        opacity: 0.3
                    });
                } else {
                    entity.material = entity.material.clone();
                    entity.material.opacity = 0.3;
                }

                entity.modes = entity.modes.clone();
                entity.modes.transparent = true;

                // Add the Material and Modes to the GLTFModel
                // so that they get destroyed automatically

                model.add(entity.material);
                model.add(entity.modes);

                html.push("<a href='javascript:flyTo(\"" + entity.id + "\")'>" + ( entity.meta.name || "unnamed") + "</a><br>")
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
                worldBoundary: model.worldBoundary,
                fit: true,
                fitFOV: 50
            });
        }
    });
};