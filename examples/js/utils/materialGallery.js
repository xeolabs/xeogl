function materialGallery(menuId, cfg) {

    //-----------------------------------------------------------------------------------------------------
    // Environment
    //-----------------------------------------------------------------------------------------------------

    var skybox = new xeogl.Skybox({
        src: "textures/skybox/uffizi_vert_cross.jpg",
        size: 1000, // Default
        active: false
    });

    //-----------------------------------------------------------------------------------------------------
    // Lighting applied to our spheres
    //-----------------------------------------------------------------------------------------------------


    skybox.scene.clearLights();

    new xeogl.DirLight({
        id: "keyLight",
        dir: [0.8, -0.6, -0.8],
        color: [0.8, 0.8, 0.8],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.DirLight({
        id: "fillLight",
        dir: [-0.8, -0.4, -0.4],
        color: [0.4, 0.4, 0.5],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.DirLight({
        id: "rimLight",
        dir: [0.2, -0.8, 0.8],
        color: [0.8, 0.8, 0.8],
        intensity: 1.0,
        space: "view"
    });

    new xeogl.LightMap({
        src: [
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
        ]
    });

    new xeogl.ReflectionMap({
        src: [
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
        ]
    });


    //-----------------------------------------------------------------------------------------------------
    // Meshes showing our materials, with labels on wires
    //-----------------------------------------------------------------------------------------------------

    (function () {
        var html = [""];
        for (var id in cfg) {
            if (cfg.hasOwnProperty(id)) {
                html.push("<a href='javascript:flyTo(\"" + id + "\")'>" + id + "</a><br>")
            }
        }
        //html.push("</ul>");
        document.getElementById(menuId).innerHTML = html.join("");
    })();

    var ids = Object.keys(cfg);
    var numMeshes = ids.length;
    var numSide = numMeshes;
    var entityWidth = 2.5;
    var width = numSide * entityWidth;
    var halfWidth = width / 2;
    var material = new xeogl.PhongMaterial({
        backfaces: true
    });
    var geometry = new xeogl.SphereGeometry({
        heightSegments: 60,
        widthSegments: 30
    });
    var wireGeometry = new xeogl.Geometry({
        primitive: "lines",
        positions: [0.0, 0.0, 0.0, 0.0, -1.3, 0.0],
        indices: [0, 1]
    });
    var textMaterial = new xeogl.PhongMaterial({
        emissive: [0.5, 1.0, 0.5],
        diffuse: [0, 0, 0],
        lineWidth: 2
    });

    var id;
    var entityCfg;
    var materialCfg;
    var geometryCfg;

    var i = 0;
    var y = 0;

    for (var x = -halfWidth; x < halfWidth; x += entityWidth) {

        id = ids[i++];
        entityCfg = cfg[id];
        materialCfg = entityCfg.material || material;
        geometryCfg = entityCfg.geometry || geometry;

        new xeogl.Mesh({
            id: id,
            geometry: geometryCfg,
            material: materialCfg,
            position: [x, 0, 0]
        });

        new xeogl.Mesh({
            geometry: new xeogl.VectorTextGeometry({
                text: id + "\n" + materialCfg.type.substring(6),
                origin: [0, y + -1.5, 0],
                size: .1
            }),
            material: textMaterial,
            position: [x, 0, 0],
            billboard: "spherical"
        });

        new xeogl.Mesh({
            geometry: wireGeometry,
            material: textMaterial,
            position: [x, 0, 0],
            billboard: "spherical"
        });
    }

    //-----------------------------------------------------------------------------------------------------
    // Camera control and animation
    //-----------------------------------------------------------------------------------------------------

    new xeogl.CameraControl();

    var cameraFlight = new xeogl.CameraFlightAnimation();

    var scene = cameraFlight.scene;

    cameraFlight.jumpTo({
        aabb: scene.aabb,
        fit: true,
        fitFOV: 40
    });

    window.flyTo = function (id) {
        var mesh = scene.meshes[id];
        if (mesh) {
            cameraFlight.flyTo({
                aabb: mesh.aabb,
                fit: true,
                fitFOV: 30
            });
        }
    };

    //---------------------------------------------------
    // Create a zSpace effect and stylus control
    //---------------------------------------------------
    //
    //new xeogl.ZSpaceEffect({canvasOffset: [310, 0]});
    //new xeogl.ZSpaceStylusControl();

}