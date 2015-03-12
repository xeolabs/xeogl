
var scene = new XEO.Scene();

var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    diffuse: [1, 1, 1],
    specular: [1.1, 1],
    shininess: 30
});

var pointLight = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0],
    space: "view"
});

var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.5, 0.7, 0.5]
});

var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        pointLight
    ]
});

var geometry = new XEO.Geometry(scene, {
    //..
});

var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
