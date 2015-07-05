/**
 A **Scene** models a 3D scene as a fully-editable and serializable <a href="http://gameprogrammingpatterns.com/component.html" target="_other">component-object</a> graph.

 ## Contents

 <Ul>
    <li><a href="#sceneStructure">Scene Structure</a></li>
    <li><a href="#sceneCanvas">The Scene Canvas</a></li>
    <li><a href="#findingByID">Finding Scenes and Components by ID</a></li>
    <li><a href="#defaults">The Default Scene</a></li>
    <li><a href="#savingAndLoading">Saving and Loading Scenes</a></li>
 </ul>

 ## <a name="sceneStructure">Scene Structure</a>

 A Scene contains a soup of instances of various {{#crossLink "Component"}}Component{{/crossLink}} subtypes, such as
 {{#crossLink "GameObject"}}GameObject{{/crossLink}}, {{#crossLink "Camera"}}Camera{{/crossLink}}, {{#crossLink "Material"}}Material{{/crossLink}},
 {{#crossLink "Lights"}}Lights{{/crossLink}} etc.  Each {{#crossLink "GameObject"}}GameObject{{/crossLink}} has a link to one of each of the other types,
 and the same component instances can be shared among many {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 *** Under the hood:*** Within xeoEngine, each {{#crossLink "GameObject"}}GameObject{{/crossLink}} represents a draw call,
 while its components define all the WebGL state that will be bound for that call. To render a Scene, xeoEngine traverses
 the graph to bind the states and make the draw calls, while using many optimizations for efficiency (eg. draw list caching and GL state sorting).

 <img src="../../../assets/images/Scene.png"></img>

 #### Default Components

 A Scene provides its own default *flyweight* instance of each component type
 (except for {{#crossLink "GameObject"}}GameObject{{/crossLink}}). Each {{#crossLink "GameObject"}}GameObject{{/crossLink}} you create
 will implicitly link to a default instance for each type of component that you don't explicitly link it to. For example, when you create a {{#crossLink "GameObject"}}GameObject{{/crossLink}} without
 a {{#crossLink "Lights"}}Lights{{/crossLink}}, the {{#crossLink "GameObject"}}GameObject{{/crossLink}} will link to the
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}{{/crossLink}}. This mechanism
 provides ***training wheels*** to help you learn the API, and also helps keep examples simple, where many of the examples in this
 documentation are implicitly using those defaults when they are not central to discussion.

 At the bottom of the diagram above, the blue {{#crossLink "Material"}}Material{{/crossLink}},
 {{#crossLink "Geometry"}}Geometry{{/crossLink}} and {{#crossLink "Camera"}}Camera{{/crossLink}} components
 represent some of the defaults provided by our Scene. For brevity, the diagram only shows those three
 types of component (there are actually around two dozen).

 Note that we did not link the second {{#crossLink "GameObject"}}GameObject{{/crossLink}} to a
 {{#crossLink "Material"}}Material{{/crossLink}}, causing it to be implicitly linked to our Scene's
 default {{#crossLink "Material"}}Material{{/crossLink}}. That {{#crossLink "Material"}}Material{{/crossLink}}
 is the only default our {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are falling back on in this example, with other
 default component types, such as the {{#crossLink "Geometry"}}Geometry{{/crossLink}} and the {{#crossLink "Camera"}}Camera{{/crossLink}},
 hanging around dormant until a {{#crossLink "GameObject"}}GameObject{{/crossLink}} is linked to them.

 Note also how the same {{#crossLink "Camera"}}Camera{{/crossLink}} is linked to both of our
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. Whenever we update that
 {{#crossLink "Camera"}}Camera{{/crossLink}}, it's going to affect both of those
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in one shot. Think of the defaults as the Scene's ***global*** component
 instances, which you may optionally override on a per-{{#crossLink "GameObject"}}GameObject{{/crossLink}} basis with your own
 component instances. In many Scenes, for example, you might not even bother to create your own {{#crossLink "Camera"}}Camera{{/crossLink}} and just
 let all your {{#crossLink "GameObject"}}GameObjects{{/crossLink}} fall back on the default one.

 ## Example

 Here's the JavaScript for the diagram above. As mentioned earlier, note that we only provide components for our {{#crossLink "GameObject"}}GameObjects{{/crossLink}} when we need to
 override the default components that the Scene would have provided them, and that the same component instances may be shared among multiple Objects.

 ```` javascript
 var scene = new XEO.Scene({
       id: "myScene"   // ID is optional on all components
  });

 var material = new XEO.PhongMaterial(myScene, {
       id: "myMaterial",         // We'll use this ID to show how to find components by ID
       diffuse: [ 0.6, 0.6, 0.7 ],
       specular: [ 1.0, 1.0, 1.0 ]
   });

 var geometry = new XEO.Geometry(myScene, {
       primitive: "triangles",
       positions: [...],
       normals: [...],
       uvs: [...],
       indices: [...]
  });

 var camera = new XEO.Camera(myScene);

 var object1 = new XEO.GameObject(myScene, {
       material: myMaterial,
       geometry: myGeometry,
       camera: myCamera
  });

 // Second object uses Scene's default Material
 var object1 = new XEO.GameObject(myScene, {
       geometry: myGeometry,
       camera: myCamera
  });
 ````

 ## <a name="sceneCanvas">The Scene Canvas</a>

 See the {{#crossLink "Canvas"}}{{/crossLink}} component.

 ## <a name="findingByID">Finding Scenes and Components by ID</a>

 We can have as many Scenes as we want, and can find them by ID on the {{#crossLink "XEO"}}XEO{{/crossLink}} object's {{#crossLink "XEO/scenes:property"}}scenes{{/crossLink}} map:

 ````javascript
 var theScene = XEO.scenes["myScene"];
 ````

 Likewise we can find a Scene's components within the Scene itself, such as the {{#crossLink "Material"}}Material{{/crossLink}} we
 created earlier:

 ````javascript
 var theMaterial = myScene.components["myMaterial"];
 ````

 ## <a name="defaults">The Default Scene</a>

 When you create components without specifying a Scene for them, xeoEngine will put them in its default Scene.

 For example:

 ```` javascript
 var material2 = new XEO.PhongMaterial({
    diffuse: { r: 0.6, g: 0.6, b: 0.7 },
    specular: { 1.0, 1.0, 1.0 }
});

 var geometry2 = new XEO.Geometry({
     primitive: "triangles",
     positions: [...],
     normals: [...],
     uvs: [...],
     indices: [...]
});

 var camera = new XEO.Camera();

 var object1 = new XEO.GameObject({
     material: material2,
     geometry: geometry2,
     camera: camera2
});
 ````

 You can then obtain the default Scene from the {{#crossLink "XEO"}}XEO{{/crossLink}} object's
 {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} property:

 ````javascript
 var theScene = XEO.scene;
 ````

 or from one of the components we just created:
 ````javascript
 var theScene = material2.scene;
 ````

 ***Note:*** xeoEngine creates the default Scene as soon as you either
 create your first Sceneless {{#crossLink "GameObject"}}GameObject{{/crossLink}} or reference the
 {{#crossLink "XEO"}}XEO{{/crossLink}} object's {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} property. Expect to
 see the HTML canvas for the default Scene magically appear in the page when you do that.

 ## <a name="savingAndLoading">Saving and Loading Scenes</a>

 The entire runtime state of a Scene can be serialized and deserialized to and from JSON. This means you can create a
 Scene, then save it and restore it again to exactly how it was when you saved it.

 ````javascript
 // Serialize the scene to JSON
 var json = myScene.json;

 // Create another scene from that JSON, in a fresh canvas:
 var myOtherScene = new XEO.Scene({
      json: json
  });

 ````

 ***Note:*** this will save your {{#crossLink "Geometry"}}Geometry{{/crossLink}}s' array properties
 ({{#crossLink "Geometry/positions:property"}}positions{{/crossLink}}, {{#crossLink "Geometry/normals:property"}}normals{{/crossLink}},
 {{#crossLink "Geometry/indices:property"}}indices{{/crossLink}} etc) as JSON arrays, which may stress your browser
 if those arrays are huge.

 @class Scene
 @module XEO
 @constructor
 @param [cfg] Scene parameters
 @param [cfg.id] {String} Optional ID, unique among all Scenes in xeoEngine, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Scene.
 @param [cfg.canvasId] {String} ID of existing HTML5 canvas in the DOM - creates a full-page canvas automatically if this is omitted
 @param [cfg.components] {Array(Object)} JSON array containing parameters for {{#crossLink "Component"}}Component{{/crossLink}} subtypes to immediately create within the Scene.
 @extends Component
 */
(function () {

    "use strict";

    /**
     * Fired whenever a debug message logged on a component within this Scene.
     * @event log
     * @param {String} value The debug message
     */

    /**
     * Fired whenever an error is logged on a component within this Scene.
     * @event error
     * @param {String} value The error message
     */

    /**
     * Fired whenever a warning is logged on a component within this Scene.
     * @event warn
     * @param {String} value The warning message
     */


    XEO.Scene = XEO.Component.extend({

        className: "XEO.Scene",

        type: "scene",

        _init: function (cfg) {

            var self = this;

            this._componentIDMap = new XEO.utils.Map();

            /**
             * The {{#crossLink "Component"}}Component{{/crossLink}}s within this Scene, mapped to their IDs.
             * @property components
             * @type {String:XEO.Component}
             */
            this.components = {};

            this._dirtyObjects = {};

            /**
             * Configurations for this Scene. Set whatever properties on here that will be
             * useful to the components within the Scene.
             * @final
             * @property configs
             * @type {Configs}
             */
            this.configs = new XEO.Configs(this, cfg.configs);

            /**
             * Manages the HTML5 canvas for this Scene.
             * @final
             * @property canvas
             * @type {Canvas}
             */
            this.canvas = new XEO.Canvas(this, {
                canvas: cfg.canvas, // Can be canvas ID, canvas element, or null
                contextAttr: cfg.contextAttr || {}
            });

            this.canvas.on("webglContextFailed",
                function () {
                    alert("XeoEngine failed to find WebGL");
                });

            this._renderer = new XEO.renderer.Renderer({
                canvas: this.canvas,
                transparent: cfg.transparent
            });

            /**
             * Publishes input events that occur on this Scene's canvas.
             * @final
             * @property input
             * @type {Input}
             */
            this.input = new XEO.Input(this, {
                canvas: this.canvas.canvas
            });

            /**
             * Tracks any asynchronous tasks that occur within this Scene.
             * @final
             * @property tasks
             * @type {Tasks}
             */
            this.tasks = new XEO.Tasks(this);

            /**
             * Tracks statistics within this Scene, such as numbers of textures, geometries etc.
             * @final
             * @property stats
             * @type {Stats}
             */
            this.stats = new XEO.Stats(this, {
                objects: 0,
                geometries: 0,
                textures: 0
            });

            // Register Scene on engine
            // Do this BEFORE we add components below
            XEO._addScene(this);

            // Add components specified as JSON
            // This may also add the default components for this Scene
            var components = cfg.components;
            if (components) {
                var component;
                var className;
                var constructor;
                for (var i = 0, len = components.length; i < len; i++) {
                    component = components[i];
                    className = component.className;
                    if (className) {
                        constructor = window[className];
                        if (constructor) {
                            new constructor(this, component);
                        }
                    }
                }
            }

            // Create the default components if not already created.
            // These may have already been created in the JSON above.

            this.view;
            this.project;

            this.camera;

            this.clips;
            this.colorTarget;
            this.colorBuf;
            this.depthTarget;
            this.depthBuf;
            this.visibility;
            this.modes;
            this.geometry;
            this.layer;
            this.lights;
            this.material;
            this.morphTargets;
            this.reflect;
            this.shader;
            this.shaderParams;
            this.stage;
            this.transform;

        },

        _addComponent: function (c) {

            if (c.id) {
                if (this.components[c.id]) {
                    this.error("A component with this ID already exists in this Scene: " + c.id);
                    return;
                }
            } else {
                c.id = this._componentIDMap.addItem({});
            }

            this.components[c.id] = c;

            var isGameObject = c.type === "object";

            var self = this;

            c.on("destroyed",
                function () {

                    self._componentIDMap.removeItem(c.id);
                    delete self.components[c.id];

                    if (isGameObject) {
                        self.stats.dec("objects");
                        delete self._dirtyObjects[c.id];
                        self.fire("dirty", true);
                    }

                    /**
                     * Fired whenever a component within this Scene has been destroyed.
                     * @event componentDestroyed
                     * @param {Component} value The component that was destroyed
                     */
                    self.fire("componentDestroyed", c, true);
                });

            if (isGameObject) {

                this.stats.inc("objects");

                c.on("dirty",
                    function () {
                        if (!self._dirtyObjects[c.id]) {
                            self._dirtyObjects[c.id] = object;
                        }
                        self.fire("dirty", true);
                    });
            }

            /**
             * Fired whenever a component has been created within this Scene.
             * @event componentCreated
             * @param {Component} value The component that was created
             */
            this.fire("componentCreated", c, true);
        },

        _props: {

            /**
             * The default projection transform provided by this Scene, which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
             *
             * This {{#crossLink "Perspective"}}Perspective{{/crossLink}} has an
             * {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.project", with all other properties set to
             * their default values.
             *
             * {{#crossLink "Camera"}}Cameras{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Perspective"}}Perspective{{/crossLink}} by default.
             * @property project
             * @final
             * @type Perspective
             */
            project: {

                get: function () {
                    return this.components["default.project"] ||
                        new XEO.Perspective(this, {
                            id: "default.project"
                        });
                }
            },

            /**
             * The default viewing transform provided by this Scene, which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
             *
             * This {{#crossLink "Lookat"}}Lookat{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.view",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Camera"}}Cameras{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Lookat"}}Lookat{{/crossLink}} by default.
             * @property view
             * @final
             * @type Lookat
             */
            view: {

                get: function () {
                    return this.components["default.view"] ||
                        new XEO.Lookat(this, {
                            id: "default.view"
                        });
                }
            },

            /**
             * The default {{#crossLink "Camera"}}Camera{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Camera"}}Camera{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.camera",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Camera"}}Camera{{/crossLink}} by default.
             * @property camera
             * @final
             * @type Camera
             */
            camera: {

                get: function () {
                    return this.components["default.camera"] ||
                        new XEO.Camera(this, {
                            id: "default.camera",
                            project: "default.project",
                            view: "default.view"
                        });
                }
            },

            /**
             * The default modelling {{#crossLink "Transform"}}{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Transform"}}{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.transform",
             * with all other properties initialised to their default values (ie. an identity matrix).
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Transform"}}{{/crossLink}} by default.
             *
             * @property transform
             * @final
             * @type Transform
             */
            transform: {

                get: function () {
                    return this.components["default.transform"] ||
                        new XEO.Transform(this, {
                            id: "default.transform"
                        });
                }
            },

            /**
             * The default {{#crossLink "Clips"}}Clips{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Clips"}}Clips{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.clips",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Clips"}}Clips{{/crossLink}} by default.
             * @property clips
             * @final
             * @type Clips
             */
            clips: {

                get: function () {
                    return this.components["default.clips"] ||
                        new XEO.Clips(this, {
                            id: "default.clips"
                        });
                }
            },

            /**
             * The default {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.colorBuf",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} by default.
             * @property colorBuf
             * @final
             * @type ColorBuf
             */
            colorBuf: {

                get: function () {
                    return this.components["default.colorBuf"] ||
                        new XEO.ColorBuf(this, {
                            id: "default.colorBuf"
                        });
                }
            },

            /**
             * The default {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.colorTarget",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} by default.
             * @property colorTarget
             * @final
             * @type ColorTarget
             */
            colorTarget: {
                get: function () {
                    return this.components["default.colorTarget"] ||
                        new XEO.ColorTarget(this, {
                            id: "default.colorTarget"
                        })
                }
            },

            /**
             * The default {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthBuf",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} by default.
             *
             * @property depthBuf
             * @final
             * @type DepthBuf
             */
            depthBuf: {
                get: function () {
                    return this.components["default.depthBuf"] ||
                        new XEO.DepthBuf(this, {
                            id: "default.depthBuf"
                        });
                }
            },

            /**
             * The default {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthTarget",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} by default.
             * @property depthTarget
             * @final
             * @type DepthTarget
             */
            depthTarget: {
                get: function () {
                    return this.components["default.depthTarget"] ||
                        new XEO.DepthTarget(this, {
                            id: "default.depthTarget"
                        });
                }
            },

            /**
             * The default {{#crossLink "Visibility"}}Visibility{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Visibility"}}Visibility{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.visibility",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Visibility"}}Visibility{{/crossLink}} by default.
             * @property visibility
             * @final
             * @type Visibility
             */
            visibility: {
                get: function () {
                    return this.components["default.visibility"] ||
                        new XEO.Visibility(this, {
                            id: "default.visibility",
                            enabled: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Modes"}}Modes{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Modes"}}Modes{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.modes",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Modes"}}Modes{{/crossLink}} by default.
             * @property modes
             * @final
             * @type Modes
             */
            modes: {
                get: function () {
                    return this.components["default.modes"] ||
                        new XEO.Modes(this, {
                            id: "default.modes"
                        });
                }
            },

            /**
             * The default {{#crossLink "Geometry"}}Geometry{{/crossLink}} provided by this Scene, which is a 2x2x2 box centered at the World-space origin.
             *
             * This {{#crossLink "Geometry"}}Geometry{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.geometry".
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Geometry"}}Geometry{{/crossLink}} by default.
             * @property geometry
             * @final
             * @type Geometry
             */
            geometry: {
                get: function () {
                    return this.components["default.geometry"] ||
                        new XEO.Geometry(this, {
                            id: "default.geometry"
                        });
                }
            },

            /**
             * The default {{#crossLink "Layer"}}Layer{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Layer"}}Layer{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.layer",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Layer"}}Layer{{/crossLink}} by default.
             * @property layer
             * @final
             * @type Layer
             */
            layer: {
                get: function () {
                    return this.components["default.layer"] ||
                        new XEO.Layer(this, {
                            id: "default.layer",
                            priority: 0
                        });
                }
            },

            /**
             * The default {{#crossLink "Lights"}}Lights{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Lights"}}Lights{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to *````"default.lights"````*,
             * with all other properties initialised to their default values (ie. the default set of light sources for a {{#crossLink "Lights"}}Lights{{/crossLink}}).
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Lights"}}Lights{{/crossLink}} by default.
             * @property lights
             * @final
             * @type Lights
             */
            lights: {
                get: function () {
                    return this.components["default.lights"] ||
                        new XEO.Lights(this, {
                            id: "default.lights",
                            lights: [

                                // Ambient light source #0
                                new XEO.AmbientLight(this, {
                                    id: "default.light0",
                                    color: [0.7, 0.7, 0.7],
                                    intensity: 1.0
                                }),

                                // Directional light source #1
                                new XEO.DirLight(this, {
                                    id: "default.light1",
                                    dir: [-0.5, -0.5, -1.0 ],
                                    color: [1.0, 1.0, 1.0 ],
                                    intensity: 1.0,
                                    space: "view"
                                }),

                                // Directional light source #2
                                new XEO.DirLight(this, {
                                    id: "default.light2",
                                    dir: [1.0, -0.9, -0.7 ],
                                    color: [1.0, 1.0, 1.0 ],
                                    intensity: 1.0,
                                    space: "view"
                                })
                            ]
                        });
                }
            },

            /**
             * The {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}} provided as the default material by this Scene.
             *
             * This {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.material", with all
             * other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}} by default.
             * @property material
             * @final
             * @type PhongMaterial
             */
            material: {
                get: function () {
                    return this.components["default.material"] ||
                        new XEO.PhongMaterial(this, {
                            id: "default.material"
                        });
                }
            },

            /**
             * The default {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.morphTargets",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} by default.
             * @property morphTargets
             * @final
             * @type MorphTargets
             */
            morphTargets: {
                get: function () {
                    return this.components["default.morphTargets"] ||
                        new XEO.MorphTargets(this, {
                            id: "default.morphTargets"
                        });
                }
            },

            /**
             * The default {{#crossLink "Reflect"}}Reflect{{/crossLink}} provided by this Scene,
             * (which is a neutral {{#crossLink "Reflect"}}Reflect{{/crossLink}} that has no effect).
             *
             * This {{#crossLink "Reflect"}}Reflect{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.reflect",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Reflect"}}Reflect{{/crossLink}} by default.
             * @property reflect
             * @final
             * @type Reflect
             */
            reflect: {
                get: function () {
                    return this.components["default.reflect"] ||
                        new XEO.Reflect(this, {
                            id: "default.reflect"
                        });
                }
            },

            /**
             * The default {{#crossLink "Shader"}}Shader{{/crossLink}} provided by this Scene
             * (which is a neutral {{#crossLink "Shader"}}Shader{{/crossLink}} that has no effect).
             *
             * This {{#crossLink "Shader"}}Shader{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shader",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Shader"}}Shader{{/crossLink}} by default.
             * @property shader
             * @final
             * @type Shader
             */
            shader: {
                get: function () {
                    return this.components["default.shader"] ||
                        this.components["default.shader"] || new XEO.Shader(this, {
                        id: "default.shader"
                    });
                }
            },

            /**
             * The default {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shaderParams",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ShaderParams"}}{{/crossLink}} by default.
             * @property shaderParams
             * @final
             * @type ShaderParams
             */
            shaderParams: {
                get: function () {
                    return this.components["default.shaderParams"] ||
                        new XEO.ShaderParams(this, {
                            id: "default.shaderParams"
                        });
                }
            },

            /**
             * The default {{#crossLink "Stage"}}Stage{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Stage"}}Stage{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.stage" and
             * a {{#crossLink "Stage/priority:property"}}priority{{/crossLink}} equal to ````0````.
             *
             * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Stage"}}Stage{{/crossLink}} by default.
             * @property stage
             * @final
             * @type Stage
             */
            stage: {
                get: function () {
                    return this.components["default.stage"] ||
                        new XEO.Stage(this, {
                            id: "default.stage",
                            priority: 0
                        });
                }
            }
        },

        /**
         * Destroys all components in this Scene
         */
        clear: function () {
            var component;
            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {
                    component = this.components[id];
                    if (!component.id !== this.id) { // This Scene is also in the component map
                        component.destroy();
                    }
                }
            }
            this._dirtyObjects = {};
        },

        /**
         * Compiles and renders this Scene
         * @private
         */
        _compile: function () {

            // Compile dirty objects, if any

            for (var id in this._dirtyObjects) {
                if (this._dirtyObjects.hasOwnProperty(id)) {
                    this._dirtyObjects[i]._compile();
                }
            }

            this._dirtyObjects = {};

            this._renderer.render({
                clear: i === 0
            });

        },

        _getJSON: function () {

            // Get list of component JSONs, in ascending order of component creation
            var components = [];
            var priorities = [];
            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {
                    components.push(this.components[id]);
                }
            }
            components.sort(function (a, b) {
                return a._componentOrder - b._componentOrder
            });
            var componentJSONs = [];
            for (var i = 0, len = components.length; i < len; i++) {
                componentJSONs.push(components[i].json);
            }
            return {
                components: componentJSONs
            };
        },

        _destroy: function () {
            this.clear();
        }
    });

})();