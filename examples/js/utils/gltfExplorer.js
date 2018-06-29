var gltfExplorer = function (menuId, files) {

    window.onload = function () {
        var div = document.getElementById(menuId);
        Ps.initialize(div);
    };

    if (files.length === 0) {
        return;
    }

    var file = files[0];

    new xeogl.AmbientLight({
        color: [.7, .9, 1.0],
        intensity: 0.5
    });
    new xeogl.DirLight({
        dir: [0.8, -0.6, -0.8],
        color: [1.0, 1.0, 1.0],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.DirLight({
        dir: [-0.8, -0.4, -0.4],
        color: [1.0, 1.0, 1.0],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.DirLight({
        dir: [0.2, -0.8, 0.8],
        color: [0.6, 0.6, 0.6],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.CubeTexture({
        src: [
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
        ]
    });

    new xeogl.CubeTexture({
        src: [
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
        ]
    });

    var model = new xeogl.GLTFModel({
        id: "turbine",
        src: file.src,
        ghosted: true,
        edgeThreshold: 20,
        lambertMaterials: true,
        objects: true,
        scale: [100, 100, 100]
    });

    //  model.scene.camera.gimbalLock = false;

    var cameraFlight = new xeogl.CameraFlightAnimation();

    window.selectObject = (function () {

        var lastObject;

        return function (id) {

            if (!id) {
                cameraFlight.flyTo();
                if (lastObject) {
                    lastObject.ghosted = true;
                    lastObject.highlighted = false;
                    lastObject = null;
                }
                return;
            }

            var object = model.scene.objects[id];
            if (object) {
                if (lastObject) {
                    lastObject.ghosted = true;
                    lastObject.highlighted = false;
                }
                object.ghosted = false;
                object.highlighted = true;
                cameraFlight.flyTo({
                    aabb: object.aabb,
                    fitFOV: 25,
                    duration: 1.0,
                    showAABB: false
                });
                lastObject = object;
            }
        };
    })();

    model.on("loaded", function () {

        var html = [""];
        var i = 0;
        for (var objectId in model.objects) {
            if (model.objects.hasOwnProperty(objectId)) {
                var object = model.objects[objectId];
                html.push("<a href='javascript:selectObject(\"" + object.id + "\")'>" + (object.meta.name || object.id) + "</a><br>")
            }
        }
        document.getElementById(menuId).innerHTML = html.join("");

        cameraFlight.jumpTo({
            aabb: model.aabb,
            fit: true,
            fitFOV: 50
        });
    });

    var cameraControl = new xeogl.CameraControl();
};