# xeoEngine

[http://xeoengine.org](http://xeoengine.org)

[![Codacy Badge](https://api.codacy.com/project/badge/grade/a834272d6bf448f7a77947d7b784f261)](https://www.codacy.com/app/lindsay-kay/xeoengine)

## About

**xeoEngine** is a data-driven WebGL-based engine for quick and easy 3D visualization on the Web. 

Find out more in the [Getting Started](https://github.com/xeolabs/xeoengine/wiki/Getting-Started) guide.

## Links 

 - [Website](http://xeoengine.org)
 - [Examples](http://xeoengine.org/examples)
 - [Features](http://xeoengine.org#features)
 - [API Docs](http://xeoengine.org/docs/index.html)
 - [Wiki](https://github.com/xeolabs/xeoengine/wiki)
 - [Download](https://github.com/xeolabs/xeoengine/archive/master.zip)
 - [MIT License](https://github.com/xeolabs/xeoengine/blob/master/MIT-LICENSE)
 
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
