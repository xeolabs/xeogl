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

    var dirLights = [
        new xeogl.DirLight({
            id: "keyLight",
            dir: [0.8, -0.6, -0.8],
            color: [0.8, 0.8, 0.8],
            intensity: 1.0,
            space: "view"
        }),

        new xeogl.DirLight({
            id: "fillLight",
            dir: [-0.8, -0.4, -0.4],
            color: [0.4, 0.4, 0.5],
            intensity: 1.0,
            space: "view"
        }),

        new xeogl.DirLight({
            id: "rimLight",
            dir: [0.2, -0.8, 0.8],
            color: [0.8, 0.8, 0.8],
            intensity: 1.0,
            space: "view"
        })
    ];

    var lightMap = new xeogl.CubeTexture({
        src: [
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NX.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NY.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_PZ.png",
            "textures/light/Uffizi_Gallery/Uffizi_Gallery_Irradiance_NZ.png"
        ]
    });

    var reflectionMap = new xeogl.CubeTexture({
        src: [
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NX.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NY.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_PZ.png",
            "textures/reflect/Uffizi_Gallery/Uffizi_Gallery_Radiance_NZ.png"
        ]
    });

    var lights = new xeogl.Lights({
        lights: dirLights,
     //  lightMap: lightMap,
        reflectionMap: reflectionMap
    });

    //-----------------------------------------------------------------------------------------------------
    // Entities showing our materials, with labels on wires
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
    var numEntities = ids.length;
    var numSide = numEntities;
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

        var transform = new xeogl.Translate({
            xyz: [x, 0, 0]
        });

        new xeogl.Entity({
            id: id,
            lights: lights,
            geometry: geometryCfg,
            material: materialCfg,
            transform: transform
        });

        new xeogl.Entity({
            geometry: new xeogl.VectorTextGeometry({
                text: id + "\n" + materialCfg.type.substring(6),
                origin: [0, y + -1.5, 0],
                size: .1
            }),
            material: textMaterial,
            transform: transform,
            billboard: "spherical"
        });

        new xeogl.Entity({
            geometry: wireGeometry,
            material: textMaterial,
            transform: transform,
            billboard: "spherical"
        });
    }

    //-----------------------------------------------------------------------------------------------------
    // Camera control and animation
    //-----------------------------------------------------------------------------------------------------

    new xeogl.CameraControl();

    var cameraFlight = new xeogl.CameraFlightAnimation();

    cameraFlight.jumpTo({
        aabb: xeogl.scene.aabb,
        fit: true,
        fitFOV: 40
    });

    window.flyTo = function (id) {
            var entity = xeogl.scene.entities[id];
            if (entity) {
                cameraFlight.flyTo({
                    aabb: entity.aabb,
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