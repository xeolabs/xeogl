function glTFGallery(models) {



    //--------------------------------------------------
    // Environment
    //--------------------------------------------------

    var skybox = new xeogl.Skybox({
        src: "textures/skybox/uffizi_vert_cross.jpg",
        size: 1000, // Default
        active: false
    });

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

    var lights = xeogl.scene.lights;

    lights.lights = dirLights;
    lights.lightMap = lightMap;
    lights.reflectionMap = reflectionMap;

    //---------------------------------------------------
    // Camera control
    //---------------------------------------------------

    var spinning = true;

    var camera = xeogl.scene.camera;

    xeogl.scene.on("tick", function () { // Slowly orbit the camera
        if (spinning) {
            camera.orbitYaw(-0.1);
        }
    });

    new xeogl.CameraControl();

    //---------------------------------------------------
    // glTF model
    //---------------------------------------------------

    var model = new xeogl.GLTFModel();

    var cameraFlight = new xeogl.CameraFlightAnimation();

    model.on("loaded", function () { // Auto-fit model to view
        cameraFlight.jumpTo({
            aabb: model.aabb,
            fit: true,
            fitFOV: 50
        });
    });

    //--------------------------------------------------
    // Screenshot menu
    //--------------------------------------------------

    (function () {

        // Init perfect scrollbar plugin
        window.onload = function () {
            var div = document.getElementById("screenshotMenu");
            Ps.initialize(div);
        };

        var log = document.getElementById("modelInfo");
        var screenshots = document.getElementById("screenshots");
        var modelInfo;
        var div;
        var a;
        var img;
        for (var i = 0, len = models.length; i < len; i++) {
            modelInfo = models[i];
            div = document.createElement('div');
            screenshots.appendChild(div);
            a = document.createElement('a');
            a.href = "javascript:loadModel(" + i + ")";
            div.appendChild(a);
            img = document.createElement('img');
            img.src = modelInfo.screenshot;
            a.appendChild(img);
        }

        var n = 0;

        window.loadModel = function (id) {
            var modelInfo = models[id];
            var src = modelInfo.src;
            model.log("loading: " + src);
            model.src = src;
            var name = modelInfo.src;
            var html = ["<ul>"];
            if (modelInfo.src) {
                //ccccccccc    html.push("<li>" + modelInfo.src + "</li>");
            }
            if (modelInfo.desc) {
                html.push("<li>" + modelInfo.desc + "</li>");
            }
            if (modelInfo.readme) {
                html.push("<li><a href='" + modelInfo.readme + "' target='_parent'>README.md</a></li>");
            }
            html.push("</ul>");
            log.innerHTML = html.join("");
            //var viewInfo = modelInfo.view;
            //if (viewInfo) {
            //    camera.eye = viewInfo.eye;
            //    camera.look = viewInfo.look;
            //    camera.up = viewInfo.up;
            //}

            model.transform = modelInfo.transform ? modelInfo.transform : null;
        };
    })();

    //--------------------------------------------------
    // Environmental control GUI
    //--------------------------------------------------

    var Menu = function () {

        this.message = "Environment";

        this["lightMap"] = !!lights.lightMap;
        this["reflectionMap"] = !!lights.reflectionMap;
        this["dirLights"] = !!(lights.lights && lights.lights.length > 0);
        this["skybox"] = !!skybox.active;
        this["spinning"] = spinning;

        var self = this;

        var update = function () {
            if (self["lightMap"] !== !!lights.lightMap) {
                lights.lightMap = self["lightMap"] ? lightMap : null;
            }
            if (self["reflectionMap"] !== !!lights.reflectionMap) {
                lights.reflectionMap = self["reflectionMap"] ? reflectionMap : null;
            }
            if (self["dirLights"] !== !!(lights.lights && lights.lights.length > 0)) {
                lights.lights = self["dirLights"] ? dirLights : [];
            }
            if (self["skybox"] !== skybox.active) {
                skybox.active = self["skybox"];
            }
            if (self["spinning"] !== spinning) {
                spinning = self["spinning"];
            }

            requestAnimationFrame(update);
        };

        update();
    };

    var gui = new dat.GUI({autoPlace: false, width: 350});
    document.getElementById('dat-gui-container').appendChild(gui.domElement);
    var menu = new Menu();
    var folder = gui.addFolder("Environment");
    folder.add(menu, 'lightMap', true);
    folder.add(menu, 'reflectionMap', true);
    folder.add(menu, 'dirLights', true);
    folder.add(menu, 'skybox', true);
    folder.add(menu, 'spinning', true);
    folder.open();

}
