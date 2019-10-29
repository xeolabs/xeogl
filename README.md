# xeogl

[http://xeogl.org](http://xeogl.org)

[![Codacy Badge](https://api.codacy.com/project/badge/grade/a834272d6bf448f7a77947d7b784f261)](https://www.codacy.com/app/lindsay-kay/xeogl)
[![status](https://img.shields.io/badge/glTF-2%2E0-green.svg?style=flat)](https://github.com/KhronosGroup/glTF)

## About

**xeogl** is a data-driven WebGL-based engine created by [xeolabs](http://xeolabs.com) for 3D visualization in the browser 
without using plugins. 

Follow xeolabs on Twitter for updates: [@xeolabs](https://twitter.com/xeolabs)  

> Need more performance than xeogl? Consider using [xeokit](http://xeokit.io), the next-generation WebGL SDK from xeolabs.

[![screenshot from 2018-02-01 02-02-50](http://xeogl.org/assets/images/screenshots/officePlan.png)](http://xeogl.org/examples/#importing_gltf_OfficePlan)

````JavaScript
var model = new xeogl.GLTFModel({
    id: "office",
    src: "models/gltf/office/scene.gltf",
    scale: [.01, .01, .01],
    position: [100, 0, 0]
});
    
var camera = model.scene.camera;
    
camera.eye = [-180.21, 248.69, -262.17];
camera.look = [-79.57, -23.08, 2.36];
camera.up = [0.24, 0.72, 0.64];
````

[[Run demo](http://xeogl.org/examples/#importing_gltf_OfficePlan)]

## Links 

 - [Website](http://xeogl.org)
 - [Examples](http://xeogl.org/examples)
 - [Features](http://xeogl.org#features)
 - [API Docs](http://xeogl.org/docs/index.html)
 - [Wiki](https://github.com/xeolabs/xeogl/wiki)
 - [Download](https://github.com/xeolabs/xeogl/archive/master.zip)
 - [MIT License](https://github.com/xeolabs/xeogl/blob/master/LICENSE)
 
## Release notes

 - [v0.9](https://github.com/xeolabs/xeogl/wiki/Updates-in-xeogl-V0.9)
 - [v0.8](https://github.com/xeolabs/xeogl/wiki/Updates-in-xeogl-V0.8)
 - [v0.7](https://github.com/xeolabs/xeogl/wiki/Updates-in-xeogl-V0.7)
 - [v0.6](https://github.com/xeolabs/xeogl/wiki/API-Changes-7-Sep-2017)
 
## Building
 
This project requires [Node.js](https://nodejs.org/en/download/) to be installed.

````
git clone git@github.com:xeolabs/xeogl.git
cd xeogl
npm install
npm run build 
````
