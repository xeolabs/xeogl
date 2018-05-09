/**
 An **Annotation** is a labeled {{#crossLink "Pin"}}{{/crossLink}} that's attached to the surface of an {{#crossLink "Mesh"}}{{/crossLink}}.

 <a href="../../examples/#annotations_tronTank"><img src="../../assets/images/screenshots/annotationsTank.png"></img></a>

 ## Overview

 #### Position

 An Annotation is positioned within one of the triangles of its {{#crossLink "Mesh"}}Mesh's{{/crossLink}} {{#crossLink "Geometry"}}{{/crossLink}}. Wherever that triangle goes within the 3D view, the Annotation will automatically follow. An Annotation specifies its position with two properties:

 * {{#crossLink "Pin/primIndex:property"}}{{/crossLink}}, which indicates the index of the triangle within the {{#crossLink "Geometry"}}{{/crossLink}} {{#crossLink "Geometry/indices:property"}}{{/crossLink}}, and
 * {{#crossLink "Pin/bary:property"}}{{/crossLink}}, the barycentric coordinates of the position within the triangle.

 From these, an Annotation dynamically calculates its Cartesian coordinates, which it provides in each xeogl coordinate space:

 * {{#crossLink "Pin/localPos:property"}}{{/crossLink}} - 3D position local to the coordinate space of the {{#crossLink "Geometry"}}{{/crossLink}},
 * {{#crossLink "Pin/worldPos:property"}}{{/crossLink}} - 3D World-space position,
 * {{#crossLink "Pin/viewPos:property"}}{{/crossLink}} - 3D View-space position, and
 * {{#crossLink "Pin/canvasPos:property"}}{{/crossLink}} - 2D Canvas-space position.

 An Annotation automatically recalculates these coordinates whenever its {{#crossLink "Mesh"}}{{/crossLink}} is replaced or transformed, the {{#crossLink "Geometry"}}{{/crossLink}} is replaced or modified, or the {{#crossLink "Camera"}}{{/crossLink}} is moved.

 #### Appearance

 As shown in the screen shot above, an Annotation is rendered as a dot with a label attached to it, using HTML elements.

 * {{#crossLink "Annotation/glyph:property"}}{{/crossLink}} specifies a character to appear in the dot,
 * {{#crossLink "Annotation/title:property"}}{{/crossLink}} and {{#crossLink "Annotation/desc:property"}}{{/crossLink}} specify a title and description to appear in the label, and
 * {{#crossLink "Annotation/pinShown:property"}}{{/crossLink}} and {{#crossLink "Annotation/labelShown:property"}}{{/crossLink}} specify whether the pin and label are shown.

 Use the stylesheet in <a href="/examples/js/annotations/annotation-style.css">annotation-style.css</a> to set the default appearance for Annotations. Use that stylesheet as a guide for your own custom styles.

 #### Visibility

 * {{#crossLink "Pin/occludable:property"}}{{/crossLink}} specifies whether the Annotation becomes invisible whenever its occluded by other objects in the 3D view, and
 * {{#crossLink "Pin/visible:property"}}{{/crossLink}} indicates if the Annotations is currently visible.

 #### Vantage points

 Each Annotation may be configured with a vantage point from which to view it, given as {{#crossLink "Annotation/eye:property"}}{{/crossLink}}, {{#crossLink "Annotation/look:property"}}{{/crossLink}} and {{#crossLink "Annotation/up:property"}}{{/crossLink}} properties.  To focus attention on an Annotation, you could set the {{#crossLink "Camera"}}Camera's{{/crossLink}} {{#crossLink "Lookat"}}{{/crossLink}} to that
 vantage point, or even fly to the vantage point using a {{#crossLink "CameraFlightAnimation"}}{{/crossLink}} (which we'll demonstrate in the usage example below).

 #### Interaction

 An Annotation fires a {{#crossLink "Annotation/pinClicked:event"}}"pinClicked"{{/crossLink}} event whenever you click its dot. In the usage example, we make that event show the Annotation's label and set the {{#crossLink "Camera"}}{{/crossLink}} to the vantage point.

 ## Examples

 * [Annotation demo](../../examples/#annotations_tronTank)
 * [AnnotationStory demo](../../examples/#annotations_annotationStory_tronTank)

 ## Usage

 In the example below, we use a {{#crossLink "GLTFModel"}}{{/crossLink}} to load a glTF model of a
 reciprocating saw. Once the {{#crossLink "GLTFModel"}}{{/crossLink}} has loaded, we'll then create Annotations on three of its {{#crossLink "Mesh"}}Meshes{{/crossLink}}. Finally, we wire
 a callback to the {{#crossLink "Annotation/pinClicked:event"}}"pinClicked"{{/crossLink}} event from
 each Annotation, so that when you click its {{#crossLink "Pin"}}{{/crossLink}}, its label is shown and the {{#crossLink "Camera"}}{{/crossLink}} is positioned at its vantage point.

 ````javascript
 <script src="../build/xeogl.js"></script>
 <script src="js/annotations/pin.js"></script>
 <script src="js/annotations/annotation.js"></script>

 <link href="js/annotations/annotation-style.css" rel="stylesheet"/>

 <script>

 var model = new xeogl.GLTFModel({
    src: "models/gltf/ReciprocatingSaw/PBR-SpecGloss/Reciprocating_Saw.gltf",
    transform: new xeogl.Rotate({
        xyz: [1, 0, 0],
        angle: 90
    })
 });

 model.on("loaded", function () {

    // Position the camera to look at the model

    var camera = model.scene.camera;
    camera.eye = [-110.89, -44.85, 276.65];
    camera.look = [-110.89, -44.85, -0.46];
    camera.up = [0, 1, 0];
    camera.zoom(20);

    // Create three annotations on meshes
    // within the model

    var a1 = new xeogl.Annotation({
        mesh: model.meshes[156], // Red handle
        primIndex: 125,
        bary: [0.3, 0.3, 0.3],
        occludable: true,
        glyph: "1",
        title: "Handle",
        desc: "This is the handle. It allows us to grab onto the saw so we can hold it and make things with it.",
        eye: [-355.481, -0.871, 116.711],
        look: [-227.456, -57.628, 5.428],
        up: [0.239, 0.948, -0.208],
        pinShown: true,
        labelShown: false
    });

    var a2 = new xeogl.Annotation({
        mesh: model.meshes[156], // Red handle and cover
        primIndex: 10260,
        bary: [0.333, 0.333, 0.333],
        occludable: true,
        glyph: "2",
        title: "Handle and cover",
        desc: "This is the handle and cover. It provides something grab the saw with, and covers the things inside.",
        eye: [-123.206, -4.094, 169.849],
        look: [-161.838, -37.875, 37.313],
        up: [-0.066, 0.971, -0.228],
        pinShown: true,
        labelShown: false
    });

    var a3 = new xeogl.Annotation({
        mesh: modelentities[796], // Barrel
        primIndex: 3783,
        bary: [0.3, 0.3, 0.3],
        occludable: true,
        glyph: "3",
        title: "Barrel",
        desc: "This is the barrel",
        eye: [80.0345, 38.255, 60.457],
        look: [35.023, -0.166, 8.679],
        up: [-0.320, 0.872, -0.368],
        pinShown: true,
        labelShown: false
    });

    // When each annotation's pin is clicked, we'll show the
    // annotation's label and fly the camera to the
    // annotation's vantage point

    var cameraFlight = new xeogl.CameraFlightAnimation();
    var lastAnnotation;

    function pinClicked(annotation) {
        if (lastAnnotation) {
            annotation.labelShown = false;
        }
        annotation.labelShown = true;
        cameraFlight.flyTo(annotation);
        lastAnnotation = annotation;
    }

    a1.on("pinClicked", pinClicked);
    a2.on("pinClicked", pinClicked);
    a3.on("pinClicked", pinClicked);

    // If desired, we can also dynamically track the Cartesian coordinates
    // of each annotation in Local and World coordinate spaces

    a1.on("localPos", function(localPos) {
        console.log("Local pos changed: " + JSON.stringify(localPos, null, "\t"));
    });

    a1.on("worldPos", function(worldPos) {
        console.log("World pos changed: " + JSON.stringify(worldPos, null, "\t"));
    });
 });
 </script>
 ````
 @class Annotation
 @module xeogl
 @submodule annotations
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Pin in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to the Annotation.
 @param [cfg.mesh] {Number|String|Mesh} ID or instance of the {{#crossLink "Mesh"}}{{/crossLink}} the Annotation is attached to.
 @param [cfg.bary=[0.3,0.3,0.3]] {Float32Array} Barycentric coordinates of the Annotation within its triangle.
 @param [cfg.primIndex=0] {Number} Index of the triangle containing the Annotation. Within the {{#crossLink "Mesh"}}{{/crossLink}} {{#crossLink "Geometry"}}{{/crossLink}}
 {{#crossLink "Geometry/indices:property"}}{{/crossLink}}, this is the index of the first
 element for that triangle.
 @param [cfg.offset=0.2] {Number} How far the Annotation is lifted out of its triangle, along the surface normal vector. This is used when occlusion culling, to ensure that the Annotation is not lost inside the surface it's attached to.
 @param [cfg.occludable=true] {Boolean} Indicates whether occlusion testing is performed for the Annotation, where it will be flagged invisible whenever it's hidden by something else in the 3D camera.
 @param [cfg.glyph=""] {String} Short piece of text to show inside the pin for the Annotation. Automatically truncated to 2 characters.
 @param [cfg.title=""] {String} Title text for the Annotation's label. Automatically truncated to 64 characters.
 @param [cfg.desc=""] {String} Description text for the Annotation's label. Automatically truncated to 1025 characters.
 @param [cfg.eye=[0,0,-10]] {Float32Array} Position of the eye when looking at the Annotation.
 @param [cfg.look=[0,0,0]] {Float32Array} Position of the look when looking at the Annotation.
 @param [cfg.up=[0,1,0]] {Float32Array} Direction of the "up" vector when looking at the Annotation.
 @param [cfg.pinShown=true] {Boolean} Specifies whether a UI element is shown at the Annotation's pin position (typically a circle).
 @param [cfg.labelShown=true] {Boolean} Specifies whether the Annotation's label is shown.
 @extends Pin
 */
xeogl.Annotation = xeogl.Pin.extend({

    type: "xeogl.Annotation",

    _init: function (cfg) {

        this._super(cfg);

        this._link = document.createElement("a");
        this._link.href = "javascript:xeogl.scenes[\"" + this.scene.id + "\"].components[\"" + this.id + "\"]._pinClicked()";
        document.body.appendChild(this._link);

        this._spotClickable = document.createElement("div");
        this._spotClickable.className = "xeogl-annotation-pinClickable";
        this._link.appendChild(this._spotClickable);

        this._spot = document.createElement("div");
        this._spot.innerText = "i";
        this._spot.className = "xeogl-annotation-pin";
        document.body.appendChild(this._spot);

        this._label = document.createElement('div');
        this._label.className = "xeogl-annotation-label";
        document.body.appendChild(this._label);

        this._titleElement = document.createElement('div');
        this._titleElement.className = "xeogl-annotation-title";
        this._titleElement.innerHTML = cfg.title || "";
        this._label.appendChild(this._titleElement);

        this._descElement = document.createElement('div');
        this._descElement.className = "xeogl-annotation-desc";
        this._descElement.innerHTML = cfg.desc || "";
        this._label.appendChild(this._descElement);

        this.glyph = cfg.glyph;
        this.title = cfg.title;
        this.desc = cfg.desc;
        this.eye = cfg.eye;
        this.look = cfg.look;
        this.up = cfg.up;

        this.pinShown = cfg.pinShown;
        this.labelShown = cfg.labelShown;

        this._tick = this.scene.on("tick", this._updateLayout, this);

        this.on("visible", this._updateVisibility, this);

        //  this._updateVisibility();
    },

    _pinClicked: function () {

        /**
         Fired whenever the mouse is clicked on this Annotation's {{#crossLink "Annotation/pin:property"}}{{/crossLink}}.

         @event pinClicked
         */
        this.fire("pinClicked", this)
    },

    _props: {

        /**
         Short piece of text to show inside the pin for the Annotation.

         Usually this would be a single number or letter.

         Automatically truncated to 2 characters.

         Fires a {{#crossLink "Annotation/glyph:event"}}{{/crossLink}} event on change.

         @property glyph
         @default ""
         @type {String}
         */
        glyph: {
            set: function (glyph) {

                if (this._glyph === glyph) {
                    return;
                }

                this._glyph = glyph || ""; // TODO: Limit to 2 chars
                this._spot.innerText = this._glyph;

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/glyph:property"}}{{/crossLink}} property changes.

                 @event glyph
                 @param value {Number} The property's new value
                 */
                this.fire("glyph", this._glyph);
            },
            get: function () {
                return this._glyph;
            }
        },

        /**
         Title text for the Annotation's label.

         Automatically truncated to 64 characters.

         Fires a {{#crossLink "Annotation/title:event"}}{{/crossLink}} event on change.

         @property title
         @default ""
         @type {String}
         */
        title: {
            set: function (title) {

                if (this._title === title) {
                    return;
                }

                this._title = title || ""; // TODO: Limit to 64 chars
                this._titleElement.innerHTML = this._title;

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/title:property"}}{{/crossLink}} property changes.

                 @event title
                 @param value {Number} The property's new value
                 */
                this.fire("title", this._title);
            },
            get: function () {
                return this._title;
            }
        },

        /**
         Description text for the Annotation's label.

         Automatically truncated to 1025 characters.

         Fires a {{#crossLink "Annotation/desc:event"}}{{/crossLink}} event on change.

         @property desc
         @default ""
         @type {String}
         */
        desc: {
            set: function (desc) {

                if (this._desc === desc) {
                    return;
                }

                this._desc = desc || ""; // TODO: Limit to 1025 chars
                this._descElement.innerHTML = this._desc;

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/desc:property"}}{{/crossLink}} property changes.

                 @event desc
                 @param value {Number} The property's new value
                 */
                this.fire("desc", this._desc);
            },
            get: function () {
                return this._desc;
            }
        },

        /**
         Position of the eye when looking at the Annotation.

         Fires a {{#crossLink "Annotation/eye:event"}}{{/crossLink}} event on change.

         @property eye
         @default [0,0,10]
         @type {Float32Array}
         */
        eye: {
            set: function (value) {

                value = value || [0, 0, 10];

                if (this._eye && this._eye[0] === value[0] && this._eye[1] === value[1] && this._eye[2] === value[2]) {
                    return;
                }

                (this._eye = this._eye || new xeogl.math.vec3()).set(value);

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/eye:property"}}{{/crossLink}} property changes.

                 @event eye
                 @param value {Number} The property's new value
                 */
                this.fire("eye", this._eye);
            },
            get: function () {
                return this._eye;
            }
        },

        /**
         Point-of-interest when looking at the Annotation.

         Fires a {{#crossLink "Annotation/look:event"}}{{/crossLink}} event on change.

         @property look
         @default [0,0,0]
         @type {Float32Array}
         */
        look: {
            set: function (value) {

                value = value || [0, 0, 0];

                if (this._look && this._look[0] === value[0] && this._look[1] === value[1] && this._look[2] === value[2]) {
                    return;
                }

                (this._look = this._look || new xeogl.math.vec3()).set(value);

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/look:property"}}{{/crossLink}} property changes.

                 @event look
                 @param value {Number} The property's new value
                 */
                this.fire("look", this._look);
            },
            get: function () {
                return this._look;
            }
        },

        /**
         "Up" vector when looking at the Annotation.

         Fires a {{#crossLink "Annotation/up:event"}}{{/crossLink}} event on change.

         @property up
         @default [0,1,0]
         @type {Float32Array}
         */
        up: {
            set: function (value) {

                value = value || [0, 1, 0];

                if (this._up && this._up[0] === value[0] && this._up[1] === value[1] && this._up[2] === value[2]) {
                    return;
                }

                (this._up = this._up || new xeogl.math.vec3()).set(value);

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/up:property"}}{{/crossLink}} property changes.

                 @event up
                 @param value {Number} The property's new value
                 */
                this.fire("up", this._up);
            },
            get: function () {
                return this._up;
            }
        },

        /**
         Specifies whether a UI element is shown at the Annotation's pin position (typically a circle).

         Fires a {{#crossLink "Annotation/pinShown:event"}}{{/crossLink}} event on change.

         @property pinShown
         @default true
         @type {Boolean}
         */
        pinShown: {
            set: function (shown) {

                shown = shown !== false;

                if (this._pinShown === shown) {
                    return;
                }

                this._pinShown = shown;
                this._spot.style.visibility = this._pinShown ? "visible" : "hidden";
                this._spotClickable.style.visibility = this._pinShown ? "visible" : "hidden";

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/pinShown:property"}}{{/crossLink}} property changes.

                 @event pinShown
                 @param value {Number} The property's new value
                 */
                this.fire("pinShown", this._pinShown);
            },
            get: function () {
                return this._pinShown;
            }
        },

        /**
         Specifies whether the label is shown for the Annotation.

         Fires a {{#crossLink "Annotation/labelShown:event"}}{{/crossLink}} event on change.

         @property labelShown
         @default true
         @type {Boolean}
         */
        labelShown: {
            set: function (shown) {

                shown = shown !== false;

                if (this._labelShown === shown) {
                    return;
                }

                this._labelShown = shown;
                this._label.style.visibility = this._labelShown && this.visible ? "visible" : "hidden";

                /**
                 Fired whenever this Annotation's {{#crossLink "Annotation/labelShown:property"}}{{/crossLink}} property changes.

                 @event labelShown
                 @param value {Number} The property's new value
                 */
                this.fire("labelShown", this._labelShown);
            },
            get: function () {
                return this._labelShown;
            }
        }
    },

    _updateVisibility: function () {
        var visible = this.visible;
        this._spotClickable.style.visibility = visible && this._pinShown ? "visible" : "hidden";
        this._spot.style.visibility = visible && this._pinShown ? "visible" : "hidden";
        this._label.style.visibility = visible && this._labelShown ? "visible" : "hidden";
    },

    _updateLayout: function () {
        var visible = this.visible;
        if (visible) {
            var canvas = this.scene.canvas.canvas;
            var left = canvas.offsetLeft;
            var top = canvas.offsetTop;
            var canvasPos = this.canvasPos;
            this._spot.style.left = (Math.floor(left + canvasPos[0]) - 12) + "px";
            this._spot.style.top = (Math.floor(top + canvasPos[1]) - 12) + "px";
            this._spotClickable.style.left = (Math.floor(left + canvasPos[0]) - 25 + 1) + "px";
            this._spotClickable.style.top = (Math.floor(top + canvasPos[1]) - 25 + 1) + "px";
            var offsetX = 20;
            var offsetY = -17;
            this._label.style.left = 20 + (canvasPos[0] + offsetX) + "px";
            this._label.style.top = (canvasPos[1] + offsetY) + "px";
            this._spot.style["z-index"] = 90005 + Math.floor(this.viewPos[2] * 10) + 1;
        }
    },

    _getJSON: function () {
        var math = xeogl.math;
        var json = {
            primIndex: this.primIndex,
            bary: math.vecToArray(this.bary),
            offset: this.offset,
            occludable: this.occludable,
            glyph: this._glyph,
            title: this._title,
            desc: this._desc,
            eye: math.vecToArray(this._eye),
            look: math.vecToArray(this._look),
            up: math.vecToArray(this._up),
            pinShown: this._pinShown,
            labelShown: this._labelShown
        };
        if (this._attached.mesh) {
            json.mesh = this._attached.mesh.id;
        }
        return json;
    },

    _destroy: function () {
        this._super();
        this.scene.off(this._tick);
        this._link.parentNode.removeChild(this._link);
        this._spot.parentNode.removeChild(this._spot);
        this._label.parentNode.removeChild(this._label);
    }
});