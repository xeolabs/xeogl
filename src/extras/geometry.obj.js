/**

 A Geometry imported from a Wavefront .OBJ file.

 ```` javascript
 var geometry = new XEO.Geometry.OBJ(scene, {
    src: "file.obj"
 });

 var object = new XEO.GameObject(myScene, {
    geometry: geometry
 });
 ````

 @class Geometry.OBJ
 @module XEO
 @extends Geometry
 */
XEO.Geometry.OBJ = XEO.Geometry.extend({

    type: "XEO.Geometry.OBJ",

    // Constructor

    _init: function (cfg) {

        // Call XEO.Component's init method
        this._super(cfg);

        // Now load .OBJ and update arrays

    },

    _getJSON: function () {
        return {};
    }
});