var box = new XEO.Object();

box.scene.material.alpha = 0.4;

box.scene.flags.transparent = true;

box.scene.lookat.on("eye", function () {

});


var obj = new XEO.Object({

    material: new XEO.Material({
        color: [1, 0, 0]
    }),

    camera: new XEO.Camera({

        view: new XEO.Lookat({
            eye: [0, 0, -10],
            look: [0, 0, 0]
        }),

        project: new XEO.Perspective({
            fovy: 45
        })
    })
});


new XEO.Orbit({
    camera: obj.camera
});

