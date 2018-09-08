/**
 An **AnnotationStory** is a  {{#crossLink "Story"}}{{/crossLink}} that contains a list
 of {{#crossLink "Annotation"}}Annotations{{/crossLink}} accompanied by a panel of text containing links that activate them.

 <a href="../../examples/#annotations_stories_tronTank"><img src="../../assets/images/screenshots/tronTankStory.jpg"></img></a>

 * AnnotationStory text is provided as markdown.
 * Words in the text can be linked to xeogl storytelling functions, to fly the camera to Annotation vantage points, show labels etc.

 ## Authoring Mode

 * SHIFT-click to place an Annotation
 * ESC to clear
 * ENTER to dump

 ## Examples

 * [Tron Tank Program AnnotationStory](../../examples/#annotations_stories_tronTank)

 ## Usage

 ````javascript
 // Load a Tron Tank model from SceneJS format. Give the model an ID - this
 // gets prefixed to the IDs of it's Meshes.

 var model = new xeogl.SceneJSModel({
            id: "tank",
            src: "models/scenejs/tronTank/tronTank.json"
        });

 model.scene.camera.eye = [15, 20, -25];

 // When the model has loaded, create a story with annotations

 model.on("loaded", function () {

        new xeogl.AnnotationStory({
            speaking: false, // Set true to have a voice announce each annotation
            authoring: true, // Set true to author the annotations
            text: [
                "# [Stories](../docs/classes/AnnotationStory.html) : Tron Tank Program",
                "This is a Light Tank from the 1982 Disney movie *Tron*.",
                "The [orange tracks](focusAnnotation(0)) on this tank indicate that ....",
                "![](./images/Clu_Program.png)",
                "The [cannon](focusAnnotation(1)) is the tank's main armament, which  ....",
                "The [pilot hatch](focusAnnotation(2)) is where Clu enters and exits the tank.",
                "At the back of the tank is the [antenna](focusAnnotation(3)) through ....",
                "*\"I fight for the users!\" -- Clu*"
            ],
            annotations: [
                {
                    primIndex: 204,
                    bary: [0.05, 0.16, 0.79],
                    occludable: true,
                    glyph: "A",
                    title: "Orange tracks",
                    desc: "Indicates that the pilot is the rebel hacker, Clu",
                    eye: [14.69, 17.89, -26.88],
                    look: [5.35, 4.14, -15.44],
                    up: [-0.09, 0.99, 0.11],
                    pinShown: true,
                    labelShown: true,
                    mesh: "tank.entity2"
                },
                {
                    primIndex: 468,
                    bary: [0.05, 0.16, 0.79],
                    occludable: true,
                    glyph: "B",
                    title: "Cannon",
                    desc: "Fires chevron-shaped bolts of de-rezzing energy",
                    eye: [-0.66, 20.84, -21.59],
                    look: [-0.39, 6.84, -9.18],
                    up: [0.01, 0.97, 0.24],
                    pinShown: true,
                    labelShown: true,
                    mesh: "tank.entity9"
                },
                {
                    primIndex: 216,
                    bary: [0.05, 0.16, 0.79],
                    occludable: true,
                    glyph: "C",
                    title: "Pilot hatch",
                    desc: "Clu hops in and out of the tank program here",
                    eye: [1.48, 11.79, -15.13],
                    look: [1.62, 5.04, -9.14],
                    up: [0.01, 0.97, 0.24],
                    pinShown: true,
                    labelShown: true,
                    mesh: "tank.entity6"
                },
                {
                    primIndex: 4464,
                    bary: [0.05, 0.16, 0.79],
                    occludable: true,
                    glyph: "D",
                    title: "Antenna",
                    desc: "Links the tank program to the Master Control Program",
                    eye: [13.63, 16.79, 13.87],
                    look: [1.08, 7.72, 3.07],
                    up: [0.08, 0.99, 0.07],
                    pinShown: true,
                    labelShown: true,
                    mesh: "tank.entity9"
                }
            ]
        });
     });
 ````

 @class AnnotationStory
 @module xeogl
 @submodule stories
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this AnnotationStory in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AnnotationStory.

 @extends Story
 */
{

    var speak = (function () {
        if (undefined === SpeechSynthesisUtterance) {
            return;
        }
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.voice = voices[10]; // Note: some voices don't support altering params
        msg.voiceURI = 'native';
        msg.volume = 1.0; // 0 to 1
        msg.rate = 1.0; // 0.1 to 10
        msg.pitch = 1.0; //0 to 2
        msg.text = 'Hello World';
        msg.lang = 'en-US';
        return function (text) {
            msg.text = text;
            speechSynthesis.speak(msg);
        };
    })();

    var getDummyText = (function () {
        const dummyText = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egone non intellego, quid sit don Graece, Latine voluptas?.",
            "An est aliquid per se ipsum flagitiosum, etiamsi nulla comitetur infamia?",
            "Cur igitur easdem res, inquam, Peripateticis dicentibus verbum nullum est, quod non intellegatur?",
            "Nec enim, omnes avaritias si aeque avaritias esse dixerimus, sequetur ut etiam aequas esse dicamus. Quid enim de amicitia statueris utilitatis causa expetenda vides.",
            "Quis animo aequo videt eum, quem inpure ac flagitiose putet vivere?",
            "Quod cum accidisset ut alter alterum necopinato videremus, surrexit statim. Quis non odit sordidos, vanos, leves, futtiles?",
            "Cupit enim dícere nihil posse ad beatam vitam deesse sapienti."
        ];
        var i = 0;
        return function () {
            var text = dummyText[i];
            if (++i >= dummyText.length) {
                i = 0;
            }
            return text;
        };
    })();

    xeogl.AnnotationStory = class xeoglAnnotationsStory extends xeogl.Story {

        init(cfg) {

            super.init(xeogl._apply({
                actions: {
                    focusAnnotation: function (i) {
                        var annotation = this._annotations[i];
                        if (!annotation) {
                            return;
                        }
                        if (this._lastAnnotation) {
                            this._lastAnnotation.labelShown = false;
                        }
                        annotation.labelShown = true;
                        var self = this;
                        this._cameraFlight.flyTo(annotation, function () {
                            if (self._speaking) {
                                speak(annotation.title);
                                speak(annotation.desc);
                            }
                        });
                        this._lastAnnotation = annotation;
                    }
                }
            }, cfg));

            var self = this;

            this._speaking = !!cfg.speaking;
            this._authoring = !!cfg.authoring;
            this._annotations = [];

            if (cfg.annotations) {
                var annotation;
                var annotations = cfg.annotations;
                for (var i = 0, len = annotations.length; i < len; i++) {
                    annotation = new xeogl.Annotation(this, annotations[i]);
                    //annotation.pinShown = true;
                    annotation.labelShown = false;
                    this._annotations.push(annotation);
                    annotation.on("pinClicked", (function () {
                        var i2 = i;
                        return function () {
                            self._actions.focusAnnotation.call(self, i2);
                        };
                    })());
                }
            }

            this._cameraFlight = new xeogl.CameraFlightAnimation(this, {duration: 1});
            this._cameraControl = new xeogl.CameraControl(this);

            //-------------------------------------------------------------------
            // Authoring mode
            //-------------------------------------------------------------------

            if (this._authoring) {

                var input = this.scene.input;
                var shiftDown = false;

                // SHIFT enables clicks to create annotations
                // ESC clears annotations
                // ENTER generates JS code for the AnnotationStory in a new browser tab

                input.on("keydown", function (keyCode) {
                    switch (keyCode) {
                        case this.KEY_SHIFT:
                            shiftDown = true;
                            self._cameraControl.mousePickMesh.active = false;
                            break;
                        case this.KEY_ESCAPE:
                            self._clear();
                            break;
                        case this.KEY_ENTER:
                            self._dump();
                            break;
                    }
                });

                input.on("keyup", function (keyCode) {
                    switch (keyCode) {
                        case this.KEY_SHIFT:
                            shiftDown = false;
                            self._cameraControl.mousePickMesh.active = true;
                            break;
                    }
                });

                // Click while SHIFT is down creates a new Annotation

                this._onMouseClicked = input.on("mouseclicked", function (coords) {

                    if (!shiftDown) {
                        return;
                    }

                    var hit = self.scene.pick({
                        canvasPos: coords,
                        pickSurface: true
                    });

                    if (hit) {

                        var mesh = hit.mesh;
                        var camera = mesh.scene.camera;

                        var i = self._annotations.length;
                        var num = i + 1;
                        var glyph = "" + num;

                        var dummyText = getDummyText();

                        var annotation = new xeogl.Annotation(self.scene, {
                            mesh: hit.mesh.id,
                            primIndex: hit.primIndex,
                            bary: hit.bary,
                            glyph: glyph,
                            title: "Annotation " + num,
                            desc: dummyText,
                            eye: camera.eye,
                            look: camera.look,
                            up: camera.up,
                            pinShown: true,
                            labelShown: true
                        });

                        annotation.on("pinClicked", function () {
                            self._actions.focusAnnotation.call(self, i);
                        });

                        self._annotations.push(annotation);

                        var text = self.text;
                        text.push("[Annotation " + glyph + "](focusAnnotation(" + i + ")) - " + dummyText);
                        text.push("");
                        self.text = text;
                    }
                });
            }
        }

        _clear() {
            for (var i = 0, len = this._annotations.length; i < len; i++) {
                this._annotations[i].destroy();
            }
            this._annotations = [];
            this.text = [];
        }

        _dump() {
            var w = window.open("");
            w.document.write("<pre>" + this.js + "</pre>");
        }

        getJSON() {
            var annotationJSON;
            var annotations = [];
            for (var i = 0, len = this._annotations.length; i < len; i++) {
                annotationJSON = this._annotations[i].json;
                delete annotationJSON["id"]; // Story manages IDs
                annotations.push(annotationJSON);
            }
            return {
                text: this.text.slice(),
                annotations: annotations,
                authoring: this._authoring,
                speaking: this._speaking
            };
        }

        destroy() {
            super.destroy();
            this.scene.input.off(this._onMouseClicked);
        }
    };
}
