var scene = new XEO.Scene();

var lookat = new XEO.Lookat(scene, {
     eye: [0, 0, -10],
    look: [0, 0, 0],
    up: [0, 1, 0]
});

var perspective = new XEO.Perspective(scene, {
    id: "myPerspective",
    fovy: 60,
    near: 0.1,
    far: 1000
});

var camera = new XEO.Camera(scene, {
    view: lookat,
    project: perspective
});

var geometry = new XEO.Geometry(scene, {
    id: "myGeometry"
});

var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
});

