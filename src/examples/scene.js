var scene = new XEO.Scene();

var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
});

var bumpMap = new XEO.Texture(scene, {
    src: "bumpMap.jpg"
});

var specularMap = new XEO.Texture(scene, {
    src: "specularMap.jpg"
});

var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess:30,
    diffuseMap: diffuseMap,
    bumpMap: bumpMap,
    specularMap: specularMap
});

var light1 = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0]
});

var light2 = new XEO.AmbientLight(scene, {
    ambient: [0.5, 0.7, 0.5]
});

var lights = new XEO.Lights(scene, {
    lights: [
        light1,
        light2
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
