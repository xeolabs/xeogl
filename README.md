# xeoEngine

[http://xeoengine.org](http://xeoengine.org)

[![Codacy Badge](https://api.codacy.com/project/badge/grade/a834272d6bf448f7a77947d7b784f261)](https://www.codacy.com/app/lindsay-kay/xeoengine)

## About

**xeoEngine** is a WebGL-based 3D engine from [@xeolabs](http://xeolabs.com) that aims to provide tons of power and flexibility within a 
comprehensive [object-component-based](http://gameprogrammingpatterns.com/component.html) API.

This engine is based on lessons learned from the development and application of [SceneJS](http://scenejs.org).

It's currently at **beta** status, so stuff will change.

## Resources 

 - [Examples](http://xeoengine.org/examples) 
 - [API Documentation](http://xeoengine.org/docs/index.html)
 - [Wiki](https://github.com/xeolabs/xeoengine/wiki)
 
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
