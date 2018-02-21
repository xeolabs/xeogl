# xeogl

[http://xeogl.org](http://xeogl.org)

[![Codacy Badge](https://api.codacy.com/project/badge/grade/a834272d6bf448f7a77947d7b784f261)](https://www.codacy.com/app/lindsay-kay/xeogl)
[![status](https://img.shields.io/badge/glTF-2%2E0-green.svg?style=flat)](https://github.com/KhronosGroup/glTF)

## About

**xeogl** is a data-driven WebGL-based engine for 3D visualization in the browser without using plugins.

Find out more in the [Getting Started](https://github.com/xeolabs/xeogl/wiki/Getting-Started) guide.

[![screenshot from 2018-02-01 02-02-50](http://xeogl.org/assets/images/screenshots/officePlan.png)](http://xeogl.org/examples/#importing_gltf_OfficePlan)

## Links 

 - [Website](http://xeogl.org)
 - [Examples](http://xeogl.org/examples)
 - [Features](http://xeogl.org#features)
 - [API Docs](http://xeogl.org/docs/index.html)
 - [Wiki](https://github.com/xeolabs/xeogl/wiki)
 - [Download](https://github.com/xeolabs/xeogl/archive/master.zip)
 - [MIT License](https://github.com/xeolabs/xeogl/blob/master/MIT-LICENSE)
 
## Building
 
 Install node (Ubuntu):
 
 ````
 sudo apt-get install nodejs
 ````
 
 Install Grunt task runner:
 
 ````
 npm install grunt --save-dev
 npm install grunt-cli --save-dev
 ````
 
 Install Grunt task plugins:
 
 ````
 npm install grunt-contrib-concat --save-dev
 npm install grunt-contrib-uglify --save-dev
 npm install grunt-contrib-jshint --save-dev
 npm install grunt-contrib-qunit --save-dev
 npm install grunt-contrib-clean --save-dev
 npm install grunt-contrib-yuidoc --save-dev
 npm install grunt-contrib-copy --save-dev


 ````

Build all:

````
grunt
````
