(function () {

    "use strict";

    /**
     Quick-and-dirty utility for debugging XEO {{#crossLink "Scene"}}Scenes{{/crossLink}}.

     The utility has fluent builder API that lets you create and update simple entities to help you
     debug or demo things on XEO.

     The utility does not clean up any components it created with your {{#crossLink "Scene"}}Scenes{{/crossLink}}.

     ## Example

     Drawing a red triangle:

     ```` javascript
     XEO.debug
     .id("myTriangle")  // Supply an ID when you want to update the line if already existing
     .color([1,0,0])
     .pos([-10, -10, 0])
     .pos([10, -10, 0])
     .pos([0, -4, 0])
     .line();

     ````

     Updating the triangle to change it's color and position:

     ```` javascript
     XEO.debug
     .id("myTriangle")
     .pos([-15, -15, 0])
     .pos([15, -15, 0])
     .pos([0, 5, 0])
     .color([0,1,0])
     .line();

     ````

     Creating a label at a Given World position:

     ```` javascript
     XEO.debug
     .pos([-10, 34, 2])
     .text("Check this out!")
     .label();

     ````
     @class XEO.debug
     @static
     @author xeolabs / http://xeolabs.com/
     */
    XEO.debug = new (function () {

        // Converts XEO color to CSS
        function cssColor(color) {
            return "rgb(" +
                Math.floor(color[0] * 255) + "," +
                Math.floor(color[1] * 255) + "," +
                Math.floor(color[2] * 255) + ")";
        }

        var scene;
        var id;
        var color;
        var fillColor;
        var opacity;
        var lineWidth;
        var diffuse;
        var pos;
        var posi;
        var dir;
        var height;
        var text;
        var radius;

        this.scene = function (_scene) {
            scene = _scene;
            return this;
        };

        function getScene() {
            return scene || XEO.scene;
        }

        this.id = function (value) {
            id = value;
            return this;
        };

        this.color = function (value) {
            color = [value[0], value[1], value[2]];
            return this;
        };

        this.fillColor = function (value) {
            fillColor = [value[0], value[1], value[2]];
            return this;
        };

        this.opacity = function (value) {
            opacity = value;
            return this;
        };

        this.lineWidth = function (value) {
            lineWidth = value;
            return this;
        };

        this.pos = function (value) {
            pos[posi++] = [value[0], value[1], value[2]];
            return this;
        };

        this.dir = function (value) {
            dir = [value[0], value[1], value[2]];
            return this;
        };

        this.height = function (value) {
            height = value;
            return this;
        };

        this.text = function (value) {
            text = value;
            return this;
        };

        this.radius = function (value) {
            radius = value;
            return this;
        };

        this.show = function (id) {
            var object = getScene().entities[id];
            if (object) {
                object.visibility.visible = true;
            }
            return this;
        };

        this.hide = function (id) {
            var object = getScene().entities[id];
            if (object) {
                object.visibility.visible = false;
            }
            return this;
        };

        this._reset = function () {
            scene = undefined;
            color = [1, 0.4, 0.4];
            fillColor = [0, 0, 0];
            diffuse = [1, 0.4, 0.4];
            opacity = 1.0;
            lineWidth = 2.0;
            id = undefined;
            pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            posi = 0;
            dir = [0, 1, 0];
            height = 1;
            text = "";
            radius = 1.0;
        };


        this.line = function () {

            if (posi < 2) {
                console.error("[XEO.debug.line] Not enough calls to XEO.debug.pos() for XEO.debug.line() - need at least two.");
                return;
            }

            var _id = id || "__debugLine";

            var positions = [];
            var indices = [];

            for (var i = 0; i < posi; i++) {
                positions.push(pos[i][0]);
                positions.push(pos[i][1]);
                positions.push(pos[i][2]);

                indices.push(i);
                if (i < (posi - 1)) {
                    indices.push(i + 1);
                }
            }

            var object = getScene().entities[_id];

            if (!object) {

                new XEO.Entity(getScene(), {
                    id: _id,
                    geometry: new XEO.Geometry({
                        primitive: "lines",
                        positions: positions,
                        indices: indices
                    }),
                    material: new XEO.PhongMaterial({
                        emissive: color,
                        opacity: opacity,
                        lineWidth: lineWidth
                    }),
                    modes: new XEO.Modes({  // This Entity should not be pickable
                        pickable: false,
                        transparent: opacity < 1.0
                    }),
                    visibility: new XEO.Visibility({  // This Entity should not be pickable
                        visible: true
                    })
                    //,
                    //transform: new XEO.Matrix({
                    //    matrix: matrix
                    //})
                });
            } else {
                object.geometry.positions = positions;
                object.geometry.indices = indices;
                object.material.emissive = color;
                object.material.opacity = opacity;
                object.modes.transparency = opacity < 1.0;
                object.material.lineWidth = lineWidth;
                object.visibility.visible = true;
                //           object.transform.matrix = matrix;
            }

            this._reset();

            return this;
        };

        this.label = function () {

            var _id = id || "__debugLabel";

            var object = getScene().entities[_id];

            if (!object) {

                object = new XEO.Entity(getScene(), {
                    id: _id,
                    transform: new XEO.Translate({
                        xyz: pos[0]
                    }),
                    geometry: new XEO.SphereGeometry({
                        radius: 0.1
                    }),
                    modes: new XEO.Modes({  // This Entity should not be pickable
                        pickable: false,
                        transparent: true
                    }),
                    material: new XEO.PhongMaterial({ // Hides the sphere while still rendering it
                        opacity: 0
                    }),
                    visibility: new XEO.Visibility({  // This Entity should not be pickable
                        visible: true
                    })
                });

                var body = document.getElementsByTagName("body")[0];

                var boxDiv = document.createElement('div');
                boxDiv.innerText = text;
                var style = boxDiv.style;
                style.color = cssColor(color);
                style.position = "absolute";
                style.padding = "10px";
                style.margin = "0";
                style.background = fillColor ? cssColor(fillColor) : "black";
                style.opacity = opacity;
                style.border = lineWidth + "px solid " + cssColor(color);
                style["z-index"] = "10001";
                style.width = "auto";
                style.height = "auto";
                style["border-radius"] = "5px";
                style.font = "bold 12px arial,serif";
                body.appendChild(boxDiv);

                var pointDiv = document.createElement('div');
                style = pointDiv.style;
                style.color = "white";
                style.background = "white";
                style.position = "absolute";
                style.padding = "3px";
                style.margin = "0";
                style.background = "white";
                style.opacity = 1.0;
                style.border = lineWidth + "px solid " + cssColor(color);
                style.width = "2px";
                style.height = "2px";
                style["border-radius"] = "5px";
                style["z-index"] = "1001";
                body.appendChild(pointDiv);

                // Synch visibility of HTML elements with the Entity
                object.visibility.on("visible",
                    function (visible) {
                        boxDiv.style.visibility = visible ? "visible" : "hidden";
                        pointDiv.style.visibility = visible ? "visible" : "hidden";
                    });

                object.canvasBoundary.on("updated",
                    function () {

                        var center = object.canvasBoundary.center;

                        boxDiv.style.left = center[0] - 3 + "px";
                        boxDiv.style.top = center[1] - 3 + "px";

                        pointDiv.style.left = center[0] - 5 + "px";
                        pointDiv.style.top = center[1] - 5 + "px";

                        var zIndex = 10000 + Math.floor(object.viewBoundary.center[2]);

                        boxDiv.style["z-index"] = zIndex;
                        pointDiv.style["z-index"] = zIndex + 1;
                    });

                object.boxDiv = boxDiv; // Dirty, but all is encapsulated by the debug utility
                object.pointDiv = boxDiv;

            } else {
                object.transform.xyz = pos[0];

                object.boxDiv.innerText = text;
                object.boxDiv.style.opacity = opacity;
                object.boxDiv.style.background = cssColor(fillColor);
                object.boxDiv.style.color = cssColor(color);

                var border = lineWidth + "px solid " + cssColor(color);
                object.boxDiv.style.border = border;
                object.pointDiv.style.border = border;
            }

            this._reset();

            return this;
        };


        this.sphere = function () {

            var _id = id || "__debugSphere";

            var object = getScene().entities[_id];

            if (!object) {

                new XEO.Entity(getScene(), {
                    id: _id,
                    transform: new XEO.Translate({
                        xyz: pos[0]
                    }),
                    geometry: new XEO.SphereGeometry({
                        radius: radius
                    }),
                    modes: new XEO.Modes({  // This Entity should not be pickable
                        pickable: false,
                        transparent: opacity < 1.0,
                        backfaces: false
                    }),
                    material: new XEO.PhongMaterial({ // Hides the sphere while still rendering it
                        diffuse: color,
                        emissive: color,
                        opacity: opacity,
                        specular: [1, 1, 1]
                    }),
                    visibility: new XEO.Visibility({  // This Entity should not be pickable
                        visible: true
                    })
                });

            } else {
                object.transform.xyz = pos[0];
                object.geometry.radius = radius;
                object.material.color = color;
                object.material.emissive = color;
                object.material.opacity = opacity;
                object.modes.transparency = opacity < 1.0;
                object.visibility.visible = true;
            }

            this._reset();

            return this;
        };


        this.cone = function () {

            var _id = id || "__debugStylus";

            var object = getScene().entities[_id];

            if (!object) {

                new XEO.Entity({
                    id: _id,
                    geometry: new XEO.CylinderGeometry({
                        radiusTop: radius,
                        radiusBottom: 0.0,
                        height: 1.0,
                        radialSegments: 20,
                        heightSegments: 1,
                        openEnded: false
                    }),
                    transform: new XEO.Translate({
                        xyz: [0, height / 2.0, 0],
                        parent: new XEO.Transform({
                            parent: new XEO.Translate({
                                xyz: pos[0]
                            })
                        })
                    }),
                    material: new XEO.PhongMaterial({
                        diffuse: [1, .2, .2],
                        specular: [1, 1, 1],
                        shininess: 90
                    }),
                    modes: new XEO.Modes({
                        pickable: false
                    }),
                    visibility: new XEO.Visibility({  // This Entity should not be pickable
                        visible: true
                    })
                });

            } else {
                object.geometry.radius = radius;
                object.geometry.height = height;
                object.transform.xyz = [0, height / 2.0, 0];
                object.transform.parent.parent.xyz = pos[0];
                object.transform.parent.matrix = XEO.math.quaternionToMat4(
                    XEO.math.vec3PairToQuaternion(dir, [0, -1, 0]));
                object.visibility.visible = true;
            }

            this._reset();

            return this;
        };

        //---------------------------
        // Work in progress
        //---------------------------
        this.label3d = function () {

            var _id = id || "__debugLabel3d";

            var object = getScene().entities[_id];

            if (!object) {

                object = new XEO.Entity(getScene(), {
                    id: _id,
                    transform: new XEO.Translate({
                        xyz: pos[0]
                    }),
                    geometry: new XEO.VectorTextGeometry({
                        text: text
                    }),
                    modes: new XEO.Modes({  // This Entity should not be pickable
                        pickable: false,
                        transparent: true
                    }),
                    material: new XEO.PhongMaterial({ // Hides the sphere while still rendering it
                        emissive: color,
                        opacity: opacity,
                        lineWidth: lineWidth
                    }),
                    billboard: new XEO.Billboard({
                        spherical: true
                    }),
                    visbility: new XEO.Visibility({  // This Entity should not be pickable
                        visible: true
                    })
                });

            } else {
                object.transform.xyz = pos[0];
                object.geometry.text = text;
                object.material.emissive = color;
                object.material.opacity = opacity;
                object.modes.transparency = opacity < 1.0;
                object.material.lineWidth = lineWidth;
                object.visibility.visible = true;
            }

            this._reset();

            return this;
        };

        this._reset();
    })();

})();
