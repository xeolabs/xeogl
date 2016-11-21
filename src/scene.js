/**
 A **Scene** models a 3D scene as a fully-editable and serializable <a href="http://gameprogrammingpatterns.com/component.html" target="_other">component-entity</a> graph.

 ## Scene Structure

 A Scene contains a soup of instances of various {{#crossLink "Component"}}Component{{/crossLink}} subtypes, such as
 {{#crossLink "Entity"}}Entity{{/crossLink}}, {{#crossLink "Camera"}}Camera{{/crossLink}}, {{#crossLink "Material"}}Material{{/crossLink}},
 {{#crossLink "Lights"}}Lights{{/crossLink}} etc.  Each {{#crossLink "Entity"}}Entity{{/crossLink}} has a link to one of each of the other types,
 and the same component instances can be shared among many {{#crossLink "Entity"}}Entities{{/crossLink}}.

 *** Under the hood:*** Within xeogl, each {{#crossLink "Entity"}}Entity{{/crossLink}} represents a draw call,
 while its components define all the WebGL state that will be bound for that call. To render a Scene, xeogl traverses
 the graph to bind the states and make the draw calls, while using many optimizations for efficiency (eg. draw list caching and GL state sorting).

 <img src="../../../assets/images/Scene.png"></img>

 #### Default Components

 A Scene provides its own default *flyweight* instance of each component type
 (except for {{#crossLink "Entity"}}Entity{{/crossLink}}). Each {{#crossLink "Entity"}}Entity{{/crossLink}} you create
 will implicitly link to a default instance for each type of component that you don't explicitly link it to. For example, when you create an {{#crossLink "Entity"}}Entity{{/crossLink}} without
 a {{#crossLink "Lights"}}Lights{{/crossLink}}, the {{#crossLink "Entity"}}Entity{{/crossLink}} will link to the
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}{{/crossLink}}. This mechanism
 provides ***training wheels*** to help you learn the API, and also helps keep examples simple, where many of the examples in this
 documentation are implicitly using those defaults when they are not central to discussion.

 At the bottom of the diagram above, the blue {{#crossLink "Material"}}Material{{/crossLink}},
 {{#crossLink "Geometry"}}Geometry{{/crossLink}} and {{#crossLink "Camera"}}Camera{{/crossLink}} components
 represent some of the defaults provided by our Scene. For brevity, the diagram only shows those three
 types of component (there are actually around two dozen).

 Note that we did not link the second {{#crossLink "Entity"}}Entity{{/crossLink}} to a
 {{#crossLink "Material"}}Material{{/crossLink}}, causing it to be implicitly linked to our Scene's
 default {{#crossLink "Material"}}Material{{/crossLink}}. That {{#crossLink "Material"}}Material{{/crossLink}}
 is the only default our {{#crossLink "Entity"}}Entities{{/crossLink}} are falling back on in this example, with other
 default component types, such as the {{#crossLink "Geometry"}}Geometry{{/crossLink}} and the {{#crossLink "Camera"}}Camera{{/crossLink}},
 hanging around dormant until an {{#crossLink "Entity"}}Entity{{/crossLink}} is linked to them.

 Note also how the same {{#crossLink "Camera"}}Camera{{/crossLink}} is linked to both of our
 {{#crossLink "Entity"}}Entities{{/crossLink}}. Whenever we update that
 {{#crossLink "Camera"}}Camera{{/crossLink}}, it's going to affect both of those
 {{#crossLink "Entity"}}Entities{{/crossLink}} in one shot. Think of the defaults as the Scene's ***global*** component
 instances, which you may optionally override on a per-{{#crossLink "Entity"}}Entity{{/crossLink}} basis with your own
 component instances. In many Scenes, for example, you might not even bother to create your own {{#crossLink "Camera"}}Camera{{/crossLink}} and just
 let all your {{#crossLink "Entity"}}Entities{{/crossLink}} fall back on the default one.

 ## Usage

 Here's the JavaScript for the diagram above. As mentioned earlier, note that we only provide components for our {{#crossLink "Entity"}}Entities{{/crossLink}} when we need to
 override the default components that the Scene would have provided them, and that the same component instances may be shared among multiple Entities.

 ```` javascript
 var scene = new xeogl.Scene({
       id: "myScene"   // ID is optional on all components
  });

 var material = new xeogl.PhongMaterial(myScene, {
       id: "myMaterial",         // We'll use this ID to show how to find components by ID
       diffuse: [ 0.6, 0.6, 0.7 ],
       specular: [ 1.0, 1.0, 1.0 ]
   });

 var geometry = new xeogl.Geometry(myScene, {
       primitive: "triangles",
       positions: [...],
       normals: [...],
       uvs: [...],
       indices: [...]
  });

 var camera = new xeogl.Camera(myScene);

 var entity1 = new xeogl.Entity(myScene, {
       material: myMaterial,
       geometry: myGeometry,
       camera: myCamera
  });

 // Second entity uses Scene's default Material
 var entity3 = new xeogl.Entity(myScene, {
       geometry: myGeometry,
       camera: myCamera
  });
 ````

 ## <a name="sceneCanvas">The Scene Canvas</a>

 See the {{#crossLink "Canvas"}}{{/crossLink}} component.

 ## <a name="findingByID">Finding Scenes and Components by ID</a>

 We can have as many Scenes as we want, and can find them by ID on the {{#crossLink "xeogl"}}xeogl{{/crossLink}} entity's {{#crossLink "xeogl/scenes:property"}}scenes{{/crossLink}} map:

 ````javascript
 var theScene = xeogl.scenes["myScene"];
 ````

 Likewise we can find a Scene's components within the Scene itself, such as the {{#crossLink "Material"}}Material{{/crossLink}} we
 created earlier:

 ````javascript
 var theMaterial = myScene.components["myMaterial"];
 ````

 ## <a name="defaults">The Default Scene</a>

 When you create components without specifying a Scene for them, xeogl will put them in its default Scene.

 For example:

 ```` javascript

 var material2 = new xeogl.PhongMaterial({
    diffuse: { r: 0.6, g: 0.6, b: 0.7 },
    specular: { 1.0, 1.0, 1.0 }
 });

 var geometry2 = new xeogl.Geometry({
     primitive: "triangles",
     positions: [...],
     normals: [...],
     uvs: [...],
     indices: [...]
 });

 var camera = new xeogl.Camera();

 var entity1 = new xeogl.Entity({
     material: material2,
     geometry: geometry2,
     camera: camera2
 });
 ````

 You can then obtain the default Scene from the {{#crossLink "xeogl"}}xeogl{{/crossLink}} entity's
 {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} property:

 ````javascript
 var theScene = xeogl.scene;
 ````

 or from one of the components we just created:
 ````javascript
 var theScene = material2.scene;
 ````

 ***Note:*** xeogl creates the default Scene as soon as you either
 create your first Sceneless {{#crossLink "Entity"}}Entity{{/crossLink}} or reference the
 {{#crossLink "xeogl"}}xeogl{{/crossLink}} entity's {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} property. Expect to
 see the HTML canvas for the default Scene magically appear in the page when you do that.

 ## <a name="webgl2">WebGL 2</a>

 By default, our Scene will attempt to use WebGL 2. If that's not supported then it will fall back on WebGL 1, if available.
 You can force the Scene to use WebGL 1 by supplying this property to teh Scene's constructor:

 ````javascript
 var scene = new xeogl.Scene({
     webgl2: false // Default is true
 });

 // We can then check this property on the Canvas to see if WebGL 2 is supported:
 var gotWebGL2 = scene.canvas.webgl2; // True if we have WebGL 2
 ````

 ## <a name="savingAndLoading">Saving and Loading Scenes</a>

 The entire runtime state of a Scene can be serialized and deserialized to and from JSON. This means you can create a
 Scene, then save it and restore it again to exactly how it was when you saved it.

 ````javascript
 // Serialize the scene to JSON
 var json = myScene.json;

 // Create another scene from that JSON, in a fresh canvas:
 var myOtherScene = new xeogl.Scene({
      json: json
 });

 ***Note:*** this will save your {{#crossLink "Geometry"}}Geometry{{/crossLink}}s' array properties
 ({{#crossLink "Geometry/positions:property"}}positions{{/crossLink}}, {{#crossLink "Geometry/normals:property"}}normals{{/crossLink}},
 {{#crossLink "Geometry/indices:property"}}indices{{/crossLink}} etc) as JSON arrays, which may stress your browser
 if those arrays are huge.

 @class Scene
 @module xeogl
 @constructor
 @param [cfg] Scene parameters
 @param [cfg.id] {String} Optional ID, unique among all Scenes in xeogl, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Scene.
 @param [cfg.canvasId] {String} ID of existing HTML5 canvas in the DOM - creates a full-page canvas automatically if this is omitted
 @param [cfg.webgl2=true] {Boolean} Set this false when we **don't** want to use WebGL 2 for our Scene; the Scene will fall
 back on WebGL 1 if not available. This property will be deprecated when WebGL 2 is supported everywhere.
 @param [cfg.components] {Array(Object)} JSON array containing parameters for {{#crossLink "Component"}}Component{{/crossLink}} subtypes to immediately create within the Scene.
 @param [cfg.passes=1] The number of times this Scene renders per frame.
 @param [cfg.clearEachPass=false] When doing multiple passes per frame, specifies whether to clear the
 canvas before each pass (true) or just before the first pass (false).
 @param [cfg.transparent=false] {Boolean} Whether or not the canvas is transparent.
 @param [cfg.backgroundColor] {Float32Array} RGBA color for canvas background, when canvas is not transparent. Overridden by backgroundImage.
 @param [cfg.backgroundImage] {String} URL of an image to show as the canvas background, when canvas is not transparent. Overrides backgroundImage.
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
    xeogl.Scene = xeogl.Component.extend({

        type: "xeogl.Scene",

        _init: function (cfg) {

            var self = this;

            var transparent = !!cfg.transparent;

            this._componentIDMap = new xeogl.utils.Map();

            /**
             * The epoch time (in milliseconds since 1970) when this Scene was instantiated.
             *
             * @property timeCreated
             * @type {Number}
             */
            this.startTime = (new Date()).getTime();

            /**
             * The {{#crossLink "Component"}}Component{{/crossLink}}s within
             * this Scene, mapped to their IDs.
             *
             * Will also contain the {{#crossLink "Entity"}}{{/crossLink}}s
             * contained in {{#crossLink "Entity/components:property"}}{{/crossLink}}.
             *
             * @property components
             * @type {String:xeogl.Component}
             */
            this.components = {};

            /**
             * For each {{#crossLink "Component"}}Component{{/crossLink}} type, a map of
             * IDs to instances.
             *
             * @property types
             * @type {String:{String:xeogl.Component}}
             */
            this.types = {};

            /**
             * The {{#crossLink "Entity"}}{{/crossLink}}s within
             * this Scene, mapped to their IDs.
             *
             * The {{#crossLink "Entity"}}{{/crossLink}}s in this map
             * will also be contained in {{#crossLink "Entity/components:property"}}{{/crossLink}}.
             *
             * @property entities
             * @type {String:xeogl.Entity}
             */
            this.entities = {};

            // Map of components created with #getSharedComponent, mapped to their "share IDs"
            this._sharedComponents = {};

            // Map of components created with #getSharedComponent, mapped to thei component IDs
            this._sharedComponentIDs = {};

            // Count of references to components created with #getSharedComponent
            this._sharedCounts = {};

            // Contains xeogl.Entities that need to be recompiled back into this._renderer
            this._dirtyEntities = {};

            /**
             * Configurations for this Scene. Set whatever properties on here
             * that will be useful to the components within the Scene.
             * @final
             * @property configs
             * @type {Configs}
             */
            this.configs = new xeogl.Configs(this, cfg.configs);

            /**
             * Manages the HTML5 canvas for this Scene.
             * @final
             * @property canvas
             * @type {Canvas}
             */
            this.canvas = new xeogl.Canvas(this, {
                canvas: cfg.canvas, // Can be canvas ID, canvas element, or null
                transparent: transparent,
                backgroundColor: cfg.backgroundColor,
                backgroundImage: cfg.backgroundImage,
                webgl2: cfg.webgl2 !== false,
                contextAttr: cfg.contextAttr || {}
            });

            // Redraw as canvas resized
            this.canvas.on("boundary",
                function () {
                    self._renderer.imageDirty = true;
                });

            this.canvas.on("webglContextFailed",
                function () {
                    alert("xeogl failed to find WebGL!");
                });

            this._renderer = new xeogl.renderer.Renderer(xeogl.stats, this.canvas.canvas, this.canvas.gl, {
                transparent: transparent
            });

            /**
             * Publishes input events that occur on this Scene's canvas.
             * @final
             * @property input
             * @type {Input}
             * @final
             */
            this.input = new xeogl.Input(this, {
                element: this.canvas.overlay
            });

            // Register Scene on engine
            // Do this BEFORE we add components below
            xeogl._addScene(this);

            // Add components specified as JSON
            // This will also add the default components for this Scene,
            // if this JSON was serialized from a xeogl.Scene instance.

            var componentJSONs = cfg.components;

            if (componentJSONs) {

                var componentJSON;
                var type;
                var constr;

                for (var i = 0, len = componentJSONs.length; i < len; i++) {

                    componentJSON = componentJSONs[i];
                    type = componentJSON.type;

                    if (type) {

                        constr = window[type];

                        if (constr) {
                            new constr(this, componentJSON);
                        }
                    }
                }
            }

            // Create the default components if not already created.
            // These may have already been created in the JSON above.

            this._initDefaults();

            this.passes = cfg.passes;
            this.clearEachPass = cfg.clearEachPass;
        },

        _initDefaults: function () {

            // Call this Scene's property accessors to lazy-init their properties

            var dummy; // Keeps Codacy happy

            dummy = this.view;
            dummy = this.project;
            dummy = this.camera;
            dummy = this.clips;
            dummy = this.colorTarget;
            dummy = this.colorBuf;
            dummy = this.depthTarget;
            dummy = this.depthBuf;
            dummy = this.visibility;
            dummy = this.cull;
            dummy = this.modes;
            dummy = this.geometry;
            dummy = this.layer;
            dummy = this.lights;
            dummy = this.material;
            dummy = this.morphTargets;
            dummy = this.reflect;
            dummy = this.shader;
            dummy = this.shaderParams;
            dummy = this.stage;
            dummy = this.transform;
            dummy = this.viewport;
        },

        // Called by each component that is created with this Scene as parent.
        // Registers the component within this scene.
        _addComponent: function (c) {

            if (c.id) {

                // User-supplied ID

                if (this.components[c.id]) {
                    this.error("Component " + xeogl._inQuotes(c.id) + " already exists in Scene");
                    return;
                }
            } else {

                // Auto-generated ID

                c.id = this._componentIDMap.addItem(c);
            }

            this.components[c.id] = c;

            // Register for class type

            //var type = c.type.indexOf("xeogl.") > -1 ? c.type.substring(4) : c.type;
            var type = c.type;

            var types = this.types[c.type];

            if (!types) {
                types = this.types[type] = {};
            }

            types[c.id] = c;


            c.on("destroyed", function () {
                this._componentDestroyed(c);
            }, this);

            if (c.isType("xeogl.Entity")) {

                // Component is a xeogl.Entity, or a subtype thereof

                c.on("dirty", this._entityDirty, this);

                this.entities[c.id] = c;

                if (this._worldBoundary) {

                    // If we currently have a World-space Scene boundary, then invalidate
                    // it whenever Entity's World-space boundary updates

                    c.worldBoundary.on("updated", this._setWorldBoundaryDirty, this);
                }

                // Update scene statistics

                xeogl.stats.components.entities++;
            }

            /**
             * Fired whenever a component has been created within this Scene.
             * @event componentCreated
             * @param {Component} value The component that was created
             */
            this.fire("componentCreated", c, true);

            //self.log("Created " + c.type + " " + xeogl._inQuotes(c.id));
        },

        // Callbacks as members to reduce GC churn

        _componentDestroyed: function (c) {

            this._componentIDMap.removeItem(c.id);

            delete this.components[c.id];

            var types = this.types[c.type];

            if (types) {

                delete types[c.id];

                if (xeogl._isEmptyObject(types)) {
                    delete this.types[c.type];
                }
            }

            if (c.isType("xeogl.Entity")) {

                // Component is a xeogl.Entity, or a subtype thereof

                // Update scene statistics,
                // Unschedule any pending recompilation of
                // the Entity into the renderer

                xeogl.stats.components.entities--;

                delete this.entities[c.id];

                delete this._dirtyEntities[c.id];
            }

            /**
             * Fired whenever a component within this Scene has been destroyed.
             * @event componentDestroyed
             * @param {Component} value The component that was destroyed
             */
            this.fire("componentDestroyed", c, true);

            //this.log("Destroyed " + c.type + " " + xeogl._inQuotes(c.id));
        },

        _entityDirty: function (entity) {

            // Whenever the Entity signals dirty,
            // schedule its recompilation into the renderer

            var self = this;

            if (!this._dirtyEntities[entity.id]) {

                this._dirtyEntities[entity.id] = entity;

                // TODO: Getting 'location is not from current program' when this is
                // uncommented on chrome/windows

                //xeogl.scheduleTask(function () {
                //    if (self._dirtyEntities[entity.id]) {
                //        if (entity._valid()) {
                //            entity._compile();
                //            delete self._dirtyEntities[entity.id];
                //        }
                //    }
                //});
            }
        },

        /**
         * Renders a single frame of this Scene.
         *
         * The Scene will automatically call this method on itself to render after any updates, but you
         * can call this method to force a render if required. This method is typically used when we want
         * to synchronously take a snapshot of the canvas and need everything rendered right at that moment.
         *
         * @method render
         * @param {Boolean} [forceRender=false] Forces a render when true, otherwise only renders if something has changed in this Scene
         * since the last render.
         */
        render: (function () {

            var renderEvent = {
                sceneId: null,
                pass: null
            };

            return function (forceRender) {

                renderEvent.sceneId = this.id;

                var passes = this._passes;
                var clearEachPass = this._clearEachPass;
                var pass;
                var clear;

                for (pass = 0; pass < passes; pass++) {

                    renderEvent.pass = pass;

                    /**
                     * Fired when about to render a frame for a Scene.
                     *
                     * @event rendering
                     * @param {String} sceneID The ID of this Scene.
                     * @param {Number} pass Index of the pass we are about to render (see {{#crossLink "Scene/passes:property"}}{{/crossLink}}).
                     */
                    this.fire("rendering", renderEvent, true);

                    clear = clearEachPass || (pass === 0);

                    this._compile(pass, clear, forceRender);

                    /**
                     * Fired when we have just rendered a frame for a Scene.
                     *
                     * @event rendering
                     * @param {String} sceneID The ID of this Scene.
                     * @param {Number} pass Index of the pass we rendered (see {{#crossLink "Scene/passes:property"}}{{/crossLink}}).
                     */
                    this.fire("rendered", renderEvent, true);
                }
            }
        })(),

        _props: {

            /**
             * The number of times this Scene renders per frame.
             *
             * @property passes
             * @default 1
             * @type Number
             */
            passes: {

                set: function (value) {

                    if (value === undefined || value === null) {
                        value = 1;

                    } else if (!xeogl._isNumeric(value) || value <= 0) {

                        this.error("Unsupported value for 'passes': '" + value +
                            "' - should be an integer greater than zero.");

                        value = 1;
                    }

                    if (value === this._passes) {
                        return;
                    }

                    this._passes = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Scene's {{#crossLink "Scene/passes:property"}}{{/crossLink}} property changes.

                     @event passes
                     @param value {Boolean} The property's new value
                     */
                    this.fire("passes", this._passes);
                },

                get: function () {
                    return this._passes;
                }
            },

            /**
             * When doing multiple passes per frame, specifies whether to clear the
             * canvas before each pass (true) or just before the first pass (false).
             *
             * @property clearEachPass
             * @default false
             * @type Boolean
             */
            clearEachPass: {

                set: function (value) {

                    value = !!value;

                    if (value === this._clearEachPass) {
                        return;
                    }

                    this._clearEachPass = value;

                    this._renderer.imageDirty = true;

                    /**
                     Fired whenever this Scene's {{#crossLink "Scene/clearEachPass:property"}}{{/crossLink}} property changes.

                     @event clearEachPass
                     @param value {Boolean} The property's new value
                     */
                    this.fire("clearEachPass", this._clearEachPass);
                },

                get: function () {
                    return this._clearEachPass;
                }
            },


            /**
             * The default projection transform provided by this Scene, which is
             * a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
             *
             * This {{#crossLink "Perspective"}}Perspective{{/crossLink}} has an
             * {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to
             * "default.project", with all other properties set to their default
             * values.
             *
             * {{#crossLink "Camera"}}Cameras{{/crossLink}} within this Scene
             * are attached to this {{#crossLink "Perspective"}}Perspective{{/crossLink}}
             * by default.
             *
             * @property project
             * @final
             * @type Perspective
             */
            project: {

                get: function () {
                    return this.components["default.project"] ||
                        new xeogl.Perspective(this, {
                            id: "default.project",
                            isDefault: true
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
                        new xeogl.Lookat(this, {
                            id: "default.view",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Camera"}}Camera{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Camera"}}Camera{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.camera",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Camera"}}Camera{{/crossLink}} by default.
             * @property camera
             * @final
             * @type Camera
             */
            camera: {

                get: function () {
                    return this.components["default.camera"] ||
                        new xeogl.Camera(this, {
                            id: "default.camera",
                            isDefault: true,
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
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to
             * this {{#crossLink "Transform"}}{{/crossLink}} by default.
             *
             * @property transform
             * @final
             * @type Transform
             */
            transform: {

                get: function () {
                    return this.components["default.transform"] ||
                        new xeogl.Transform(this, {
                            id: "default.transform",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Billboard"}}Billboard{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Billboard"}}Billboard{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.billboard"
             * and an {{#crossLink "Billboard/active:property"}}{{/crossLink}} property set to false, to disable it.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Billboard"}}Billboard{{/crossLink}} by default.
             *
             * @property billboard
             * @final
             * @type Billboard
             */
            billboard: {
                get: function () {
                    return this.components["default.billboard"] ||
                        new xeogl.Billboard(this, {
                            id: "default.billboard",
                            active: false,
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Stationary"}}Stationary{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Stationary"}}Stationary{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.stationary"
             * and an {{#crossLink "Stationary/active:property"}}{{/crossLink}} property set to false, to disable it.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Stationary"}}Stationary{{/crossLink}} by default.
             *
             * @property stationary
             * @final
             * @type Stationary
             */
            stationary: {
                get: function () {
                    return this.components["default.stationary"] ||
                        new xeogl.Stationary(this, {
                            id: "default.stationary",
                            active: false,
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Clips"}}Clips{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Clips"}}Clips{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.clips",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Clips"}}Clips{{/crossLink}} by default.
             * @property clips
             * @final
             * @type Clips
             */
            clips: {

                get: function () {
                    return this.components["default.clips"] ||
                        new xeogl.Clips(this, {
                            id: "default.clips",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.colorBuf",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} by default.
             * @property colorBuf
             * @final
             * @type ColorBuf
             */
            colorBuf: {

                get: function () {
                    return this.components["default.colorBuf"] ||
                        new xeogl.ColorBuf(this, {
                            id: "default.colorBuf",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} provided by this Scene.
             *
             * The {{#crossLink "ColorTarget"}}DepthTarget{{/crossLink}} is
             * {{#crossLink "ColorTarget/active:property"}}inactive{{/crossLink}} by default and will have an
             * {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthTarget".
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} by default.
             * @property colorTarget
             * @private
             * @final
             * @type ColorTarget
             */
            colorTarget: {
                get: function () {
                    return this.components["default.colorTarget"] ||
                        new xeogl.ColorTarget(this, {
                            id: "default.colorTarget",
                            isDefault: true,
                            active: false
                        })
                }
            },

            /**
             * The default {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthBuf",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} by default.
             *
             * @property depthBuf
             * @final
             * @type DepthBuf
             */
            depthBuf: {
                get: function () {
                    return this.components["default.depthBuf"] ||
                        new xeogl.DepthBuf(this, {
                            id: "default.depthBuf",
                            isDefault: true,
                            active: true
                        });
                }
            },

            /**
             * The default {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} provided by this Scene.
             *
             * The {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} is
             * {{#crossLink "DepthTarget/active:property"}}inactive{{/crossLink}} by default and has an
             * {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthTarget".
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} by default.
             * @property depthTarget
             * @private
             * @final
             * @type DepthTarget
             */
            depthTarget: {
                get: function () {
                    return this.components["default.depthTarget"] ||
                        new xeogl.DepthTarget(this, {
                            id: "default.depthTarget",
                            isDefault: true,
                            active: false
                        });
                }
            },

            /**
             * The default {{#crossLink "Visibility"}}Visibility{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Visibility"}}Visibility{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.visibility",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Visibility"}}Visibility{{/crossLink}} by default.
             * @property visibility
             * @final
             * @type Visibility
             */
            visibility: {
                get: function () {
                    return this.components["default.visibility"] ||
                        new xeogl.Visibility(this, {
                            id: "default.visibility",
                            isDefault: true,
                            visible: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Cull"}}{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Cull"}}cull{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.cull",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Cull"}}{{/crossLink}} by default.
             * @property cull
             * @final
             * @type cull
             */
            cull: {
                get: function () {
                    return this.components["default.cull"] ||
                        new xeogl.Cull(this, {
                            id: "default.cull",
                            isDefault: true,
                            culled: false
                        });
                }
            },

            /**
             * The default {{#crossLink "Modes"}}Modes{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Modes"}}Modes{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.modes",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Modes"}}Modes{{/crossLink}} by default.
             * @property modes
             * @final
             * @type Modes
             */
            modes: {
                get: function () {
                    return this.components["default.modes"] ||
                        new xeogl.Modes(this, {
                            id: "default.modes",
                            isDefault: true
                        });
                }
            },

            /**
             * The default geometry provided by this Scene, which is a {{#crossLink "BoxGeometry"}}BoxGeometry{{/crossLink}}.
             *
             * This {{#crossLink "BoxGeometry"}}BoxGeometry{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.geometry".
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Geometry"}}Geometry{{/crossLink}} by default.
             * @property geometry
             * @final
             * @type BoxGeometry
             */
            geometry: {
                get: function () {
                    return this.components["default.geometry"] ||
                        new xeogl.BoxGeometry(this, {
                            id: "default.geometry",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Layer"}}Layer{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Layer"}}Layer{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.layer",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Layer"}}Layer{{/crossLink}} by default.
             * @property layer
             * @final
             * @type Layer
             */
            layer: {
                get: function () {
                    return this.components["default.layer"] ||
                        new xeogl.Layer(this, {
                            id: "default.layer",
                            isDefault: true,
                            priority: 0
                        });
                }
            },

            /**
             * The default {{#crossLink "Lights"}}Lights{{/crossLink}} provided
             * by this Scene.
             *
             * This {{#crossLink "Lights"}}Lights{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to *````"default.lights"````*,
             * with all other properties initialised to their default values (ie. the default set of light sources for a {{#crossLink "Lights"}}Lights{{/crossLink}}).
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Lights"}}Lights{{/crossLink}} by default.
             *
             * @property lights
             * @final
             * @type Lights
             */
            lights: {
                get: function () {
                    return this.components["default.lights"] ||
                        new xeogl.Lights(this, {
                            id: "default.lights",
                            isDefault: true,

                            // By default a xeogl.Lights has an empty lights
                            // property, so we must provide some lights

                            lights: [

                                // Ambient light source #0
                                new xeogl.AmbientLight(this, {
                                    id: "default.light0",
                                    color: [0.45, 0.45, 0.5],
                                    intensity: 0.9
                                }),

                                // Directional light source #1
                                new xeogl.DirLight(this, {
                                    id: "default.light1",
                                    dir: [-0.5, 0.5, -0.6],
                                    color: [0.8, 0.8, 0.7],
                                    intensity: 1.0,
                                    space: "view"
                                }),
                                //
                                // Directional light source #2
                                new xeogl.DirLight(this, {
                                    id: "default.light2",
                                    dir: [0.5, -0.5, -0.6],
                                    color: [0.8, 0.8, 0.8],
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
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}} by default.
             * @property material
             * @final
             * @type PhongMaterial
             */
            material: {
                get: function () {
                    return this.components["default.material"] ||
                        new xeogl.PhongMaterial(this, {
                            id: "default.material",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.morphTargets",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} by default.
             * @property morphTargets
             * @private
             * @final
             * @type MorphTargets
             */
            morphTargets: {
                get: function () {
                    return this.components["default.morphTargets"] ||
                        new xeogl.MorphTargets(this, {
                            id: "default.morphTargets",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Reflect"}}Reflect{{/crossLink}} provided by this Scene,
             * (which is initially an empty {{#crossLink "Reflect"}}Reflect{{/crossLink}} that has no effect).
             *
             * This {{#crossLink "Reflect"}}Reflect{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.reflect",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Reflect"}}Reflect{{/crossLink}} by default.
             * @property reflect
             * @final
             * @type Reflect
             */
            reflect: {
                get: function () {
                    return this.components["default.reflect"] ||
                        new xeogl.Reflect(this, {
                            id: "default.reflect",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Shader"}}Shader{{/crossLink}} provided by this Scene
             * (which is initially an empty {{#crossLink "Shader"}}Shader{{/crossLink}} that has no effect).
             *
             * This {{#crossLink "Shader"}}Shader{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shader",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Shader"}}Shader{{/crossLink}} by default.
             * @property shader
             * @final
             * @private
             * @type Shader
             */
            shader: {
                get: function () {
                    return this.components["default.shader"] ||
                        this.components["default.shader"] || new xeogl.Shader(this, {
                            id: "default.shader",
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shaderParams",
             * with all other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "ShaderParams"}}{{/crossLink}} by default.
             *
             * @property shaderParams
             * @final
             * @private
             * @type ShaderParams
             */
            shaderParams: {
                get: function () {
                    return this.components["default.shaderParams"] ||
                        new xeogl.ShaderParams(this, {
                            id: "default.shaderParams",
                            isDefault: true
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
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Stage"}}Stage{{/crossLink}} by default.
             * @property stage
             * @final
             * @type Stage
             */
            stage: {
                get: function () {
                    return this.components["default.stage"] ||
                        new xeogl.Stage(this, {
                            id: "default.stage",
                            priority: 0,
                            isDefault: true
                        });
                }
            },

            /**
             * The default {{#crossLink "Viewport"}}{{/crossLink}} provided by this Scene.
             *
             * This {{#crossLink "Viewport"}}{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.viewport" and
             * {{#crossLink "Viewport/autoBoundary:property"}}{{/crossLink}} set ````true````.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "Viewport"}}{{/crossLink}} by default.
             *
             * @property viewport
             * @final
             * @type Viewport
             */
            viewport: {
                get: function () {
                    return this.components["default.viewport"] ||
                        new xeogl.Viewport(this, {
                            id: "default.viewport",
                            autoBoundary: true,
                            isDefault: true
                        });
                }
            },

            /**
             * The World-space 3D boundary of this Scene.
             *
             * The {{#crossLink "Boundary3D"}}{{/crossLink}} will be lazy-initialized the first time
             * you reference this property, and will persist on this Scene until you
             * call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on the {{#crossLink "Boundary3D"}}{{/crossLink}}
             * again. The property will then be set to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance
             * next time you reference it.
             *
             * <h4>Performance</h4>
             *
             * To minimize performance overhead, only reference this property if you need it, and destroy
             * the {{#crossLink "Boundary3D"}}{{/crossLink}} as soon as you don't need it anymore.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._worldBoundary) {

                        var self = this;
                        var aabb = xeogl.math.AABB3();

                        this._worldBoundary = new xeogl.Boundary3D(this.scene, {

                            getDirty: function () {
                                return self._worldBoundaryDirty;
                            },

                            getAABB: function () {

                                xeogl.math.collapseAABB3(aabb);

                                var entities = self.entities;
                                var entity;

                                for (var entityId in entities) {
                                    if (entities.hasOwnProperty(entityId)) {

                                        entity = entities[entityId];

                                        if (entity.modes.collidable) {

                                            // Only include boundaries of entities that are allowed
                                            // to contribute to the size of an enclosing boundary

                                            xeogl.math.expandAABB3(aabb, entity.worldBoundary.aabb);
                                        }
                                    }
                                }

                                return aabb;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {

                                // Now #._setWorldBoundaryDirty won't fire "update"
                                // events on the #._worldBoundary every time its called

                                self._worldBoundary = null;
                            });

                        this._setWorldBoundaryDirty();
                    }

                    return this._worldBoundary;
                }
            }
        },

        _setWorldBoundaryDirty: function () {
            this._worldBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
        },

        /**
         * Attempts to pick an {{#crossLink "Entity"}}Entity{{/crossLink}} in this Scene.
         *
         * Ignores {{#crossLink "Entity"}}Entities{{/crossLink}} that are attached
         * to either a {{#crossLink "Stage"}}Stage{{/crossLink}} with {{#crossLink "Stage/pickable:property"}}pickable{{/crossLink}}
         * set *false* or a {{#crossLink "Modes"}}Modes{{/crossLink}} with {{#crossLink "Modes/pickable:property"}}pickable{{/crossLink}} set *false*.
         *
         * Picking the {{#crossLink "Entity"}}{{/crossLink}} at the given canvas coordinates:
         *
         * ````javascript
         * var hit = scene.pick({
         *     canvasPos: [23, 131]
         *  });
         *
         * if (hit) { // Picked an Entity
         *     var entity = hit.entity;
         * }
         * ````
         *
         * **Usage:**
         *
         * Picking the {{#crossLink "Entity"}}{{/crossLink}} that intersects a ray cast through the canvas:
         *
         * ````javascript
         * var hit = scene.pick({
         *     pickSurface: true,
         *     canvasPos: [23, 131]
         *  });
         *
         * if (hit) { // Picked an Entity
         *
         *     var entity = hit.entity;
         *
         *     // These properties are only on the hit result when we do a ray-pick:
         *
         *     var primitive = hit.primitive; // Type of primitive that was picked, usually "triangles"
         *     var primIndex = hit.primIndex; // Position of triangle's first index in the picked Entity's Geometry's indices array
         *     var indices = hit.indices; // UInt32Array containing the triangle's vertex indices
         *     var localPos = hit.localPos; // Float32Array containing the picked Local-space position on the triangle
         *     var worldPos = hit.worldPos; // Float32Array containing the picked World-space position on the triangle
         *     var viewPos = hit.viewPos; // Float32Array containing the picked View-space position on the triangle
         *     var bary = hit.bary; // Float32Array containing the picked barycentric position within the triangle
         *     var normal = hit.normal; // Float32Array containing the interpolated normal vector at the picked position on the triangle
         *     var uv = hit.uv; // Float32Array containing the interpolated UV coordinates at the picked position on the triangle
         * }
         * ````
         *
         * Picking the {{#crossLink "Entity"}}{{/crossLink}} that intersects an arbitrarily-aligned World-space ray:
         *
         * ````javascript
         * var hit = scene.pick({
         *     pickSurface: true,       // Picking with arbitrarily-positioned ray
         *     origin: [0,0,-5],    // Ray origin
         *     direction: [0,0,1]   // Ray direction
         * });
         *
         * if (hit) { // Picked an Entity with the ray
         *
         *     var entity = hit.entity;
         *
         *     var primitive = hit.primitive; // Type of primitive that was picked, usually "triangles"
         *     var primIndex = hit.primIndex; // Position of triangle's first index in the picked Entity's Geometry's indices array
         *     var indices = hit.indices; // UInt32Array containing the triangle's vertex indices
         *     var localPos = hit.localPos; // Float32Array containing the picked Local-space position on the triangle
         *     var worldPos = hit.worldPos; // Float32Array containing the picked World-space position on the triangle
         *     var viewPos = hit.viewPos; // Float32Array containing the picked View-space position on the triangle
         *     var bary = hit.bary; // Float32Array containing the picked barycentric position within the triangle
         *     var normal = hit.normal; // Float32Array containing the interpolated normal vector at the picked position on the triangle
         *     var uv = hit.uv; // Float32Array containing the interpolated UV coordinates at the picked position on the triangle
         *     var origin = hit.origin; // Float32Array containing the World-space ray origin
         *     var direction = hit.direction; // Float32Array containing the World-space ray direction
         * }
         * ````
         * @method pick
         *
         * @param {*} params Picking parameters.
         * @param {Boolean} [params.pickSurface=false] Whether to find the picked position on the surface of the Entity.
         * @param {Float32Array} [params.canvasPos] Canvas-space coordinates. When ray-picking, this will override the
         * **origin** and ** direction** parameters and will cause the ray to be fired through the canvas at this position,
         * directly along the negative View-space Z-axis.
         * @param {Float32Array} [params.origin] World-space ray origin when ray-picking. Ignored when canvasPos given.
         * @param {Float32Array} [params.direction] World-space ray direction when ray-picking. Also indicates the length of the ray. Ignored when canvasPos given.
         * @returns {*} Hit record, returned when an {{#crossLink "Entity"}}{{/crossLink}} is picked, else null. See
         * method comments for description.
         */
        pick: (function () {

            // Cached vectors to avoid garbage collection

            var math = xeogl.math;

            var localRayOrigin = math.vec3();
            var localRayDir = math.vec3();

            var a = math.vec3();
            var b = math.vec3();
            var c = math.vec3();

            var triangleVertices = math.vec3();
            var position = math.vec4();
            var worldPos = math.vec3();
            var viewPos = math.vec3();
            var bary = math.vec3();

            var na = math.vec3();
            var nb = math.vec3();
            var nc = math.vec3();

            var uva = math.vec3();
            var uvb = math.vec3();
            var uvc = math.vec3();

            var tempVec4a = math.vec4();
            var tempVec4b = math.vec4();
            var tempVec4c = math.vec4();
            var tempVec4d = math.vec4();
            var tempVec4e = math.vec4();

            var tempVec3 = math.vec3();
            var tempVec3b = math.vec3();
            var tempVec3c = math.vec3();
            var tempVec3d = math.vec3();
            var tempVec3e = math.vec3();
            var tempVec3f = math.vec3();
            var tempVec3g = math.vec3();
            var tempVec3h = math.vec3();
            var tempVec3i = math.vec3();
            var tempVec3j = math.vec3();
            var tempVec3k = math.vec3();

            var tempMat4 = math.mat4();
            var tempMat4b = math.mat4();
            var tempMat4c = math.mat4();

            // Given a Entity and canvas coordinates, gets a Local-space ray.
            function canvasPosToLocalRay(entity, canvasPos, localRayOrigin, localRayDir) {

                var canvas = entity.scene.canvas.canvas;

                var modelMat = entity.transform.leafMatrix;
                var viewMat = entity.camera.view.matrix;
                var projMat = entity.camera.project.matrix;

                var vmMat = math.mulMat4(viewMat, modelMat, tempMat4);
                var pvMat = math.mulMat4(projMat, vmMat, tempMat4b);
                var pvMatInverse = math.inverseMat4(pvMat, tempMat4c);

                // Calculate clip space coordinates, which will be in range
                // of x=[-1..1] and y=[-1..1], with y=(+1) at top

                var canvasWidth = canvas.width;
                var canvasHeight = canvas.height;

                var clipX = (canvasPos[0] - canvasWidth / 2) / (canvasWidth / 2);  // Calculate clip space coordinates
                var clipY = -(canvasPos[1] - canvasHeight / 2) / (canvasHeight / 2);

                tempVec4a[0] = clipX;
                tempVec4a[1] = clipY;
                tempVec4a[2] = -1;
                tempVec4a[3] = 1;

                math.transformVec4(pvMatInverse, tempVec4a, tempVec4b);
                math.mulVec4Scalar(tempVec4b, 1 / tempVec4b[3]);

                tempVec4c[0] = clipX;
                tempVec4c[1] = clipY;
                tempVec4c[2] = 1;
                tempVec4c[3] = 1;

                math.transformVec4(pvMatInverse, tempVec4c, tempVec4d);
                math.mulVec4Scalar(tempVec4d, 1 / tempVec4d[3]);

                localRayOrigin[0] = tempVec4d[0];
                localRayOrigin[1] = tempVec4d[1];
                localRayOrigin[2] = tempVec4d[2];

                math.subVec3(tempVec4d, tempVec4b, localRayDir);

                math.normalizeVec3(localRayDir);
            }

            // Transforms a ray from World-space to Local-space
            function worldRayToLocalRay(entity, worldRayOrigin, worldRayDir, localRayOrigin, localRayDir) {

                var modelMat = entity.transform.leafMatrix;
                var modelMatInverse = math.inverseMat4(modelMat, tempMat4);

                tempVec4a[0] = worldRayOrigin[0];
                tempVec4a[1] = worldRayOrigin[1];
                tempVec4a[2] = worldRayOrigin[2];
                tempVec4a[3] = 1;

                math.transformVec4(modelMatInverse, tempVec4a, tempVec4b);

                localRayOrigin[0] = tempVec4b[0];
                localRayOrigin[1] = tempVec4b[1];
                localRayOrigin[2] = tempVec4b[2];

                math.transformVec3(modelMatInverse, worldRayDir, localRayDir);
            }

            return function (params) {

                params = params || {};

                params.pickSurface = params.pickSurface || params.rayPick; // Backwards compatibility

                if (!params.canvasPos && (!params.origin || !params.direction)) {
                    this.warn("picking without canvasPos or ray origin and direction");
                }

                var hit = this._renderer.pick(params);

                if (hit) {

                    var entity = this.entities[hit.entity];

                    hit.entity = entity; // Swap string ID for xeogl.Entity

                    if (params.pickSurface) {

                        if (hit.primIndex !== undefined && hit.primIndex > -1) {

                            var geometry = entity.geometry;

                            if (geometry.primitive === "triangles") {

                                // Triangle picked; this only happens when the
                                // Entity has a Geometry that has primitives of type "triangle"

                                hit.primitive = "triangle";

                                // Get the World-space positions of the triangle's vertices

                                var i = hit.primIndex; // Indicates the first triangle index in the indices array

                                var indices = geometry.indices;
                                var positions = geometry.positions;

                                var ia = indices[i];
                                var ib = indices[i + 1];
                                var ic = indices[i + 2];

                                var ia3 = ia * 3;
                                var ib3 = ib * 3;
                                var ic3 = ic * 3;

                                //
                                triangleVertices[0] = ia;
                                triangleVertices[1] = ib;
                                triangleVertices[2] = ic;

                                hit.indices = triangleVertices;

                                a[0] = positions[ia3];
                                a[1] = positions[ia3 + 1];
                                a[2] = positions[ia3 + 2];

                                b[0] = positions[ib3];
                                b[1] = positions[ib3 + 1];
                                b[2] = positions[ib3 + 2];

                                c[0] = positions[ic3];
                                c[1] = positions[ic3 + 1];
                                c[2] = positions[ic3 + 2];

                                // Attempt to ray-pick the triangle; in World-space, fire a ray
                                // from the eye position through the mouse position
                                // on the perspective projection plane

                                var canvasPos;

                                if (params.canvasPos) {
                                    canvasPos = params.canvasPos;
                                    hit.canvasPos = params.canvasPos;
                                    canvasPosToLocalRay(entity, canvasPos, localRayOrigin, localRayDir);

                                } else if (params.origin && params.direction) {
                                    worldRayToLocalRay(entity, params.origin, params.direction, localRayOrigin, localRayDir);
                                }

                                math.normalizeVec3(localRayDir);
                                math.rayPlaneIntersect(localRayOrigin, localRayDir, a, b, c, position);

                                // Get Local-space cartesian coordinates of the ray-triangle intersection

                                hit.localPos = position;
                                hit.position = position;

                                // Get interpolated World-space coordinates

                                // Need to transform homogeneous coords

                                tempVec4a[0] = position[0];
                                tempVec4a[1] = position[1];
                                tempVec4a[2] = position[2];
                                tempVec4a[3] = 1;

                                // Get World-space cartesian coordinates of the ray-triangle intersection

                                math.transformVec4(entity.transform.leafMatrix, tempVec4a, tempVec4b);

                                worldPos[0] = tempVec4b[0];
                                worldPos[1] = tempVec4b[1];
                                worldPos[2] = tempVec4b[2];

                                hit.worldPos = worldPos;

                                // Get View-space cartesian coordinates of the ray-triangle intersection

                                math.transformVec4(entity.camera.view.matrix, tempVec4b, tempVec4c);

                                viewPos[0] = tempVec4c[0];
                                viewPos[1] = tempVec4c[1];
                                viewPos[2] = tempVec4c[2];

                                hit.viewPos = viewPos;

                                // Get barycentric coordinates of the ray-triangle intersection

                                math.cartesianToBarycentric(position, a, b, c, bary);

                                hit.bary = bary;

                                // Get interpolated normal vector

                                var normals = geometry.normals;

                                if (normals) {

                                    na[0] = normals[ia3];
                                    na[1] = normals[ia3 + 1];
                                    na[2] = normals[ia3 + 2];

                                    nb[0] = normals[ib3];
                                    nb[1] = normals[ib3 + 1];
                                    nb[2] = normals[ib3 + 2];

                                    nc[0] = normals[ic3];
                                    nc[1] = normals[ic3 + 1];
                                    nc[2] = normals[ic3 + 2];

                                    var normal = math.addVec3(math.addVec3(
                                        math.mulVec3Scalar(na, bary[0], tempVec3),
                                        math.mulVec3Scalar(nb, bary[1], tempVec3b), tempVec3c),
                                        math.mulVec3Scalar(nc, bary[2], tempVec3d), tempVec3e);

                                    hit.normal = math.transformVec3(entity.transform.leafMatrix, normal, tempVec3f);
                                }

                                // Get interpolated UV coordinates

                                var uvs = geometry.uv;

                                if (uvs) {

                                    uva[0] = uvs[(ia * 2)];
                                    uva[1] = uvs[(ia * 2) + 1];

                                    uvb[0] = uvs[(ib * 2)];
                                    uvb[1] = uvs[(ib * 2) + 1];

                                    uvc[0] = uvs[(ic * 2)];
                                    uvc[1] = uvs[(ic * 2) + 1];

                                    hit.uv = math.addVec3(
                                        math.addVec3(
                                            math.mulVec2Scalar(uva, bary[0], tempVec3g),
                                            math.mulVec2Scalar(uvb, bary[1], tempVec3h), tempVec3i),
                                        math.mulVec2Scalar(uvc, bary[2], tempVec3j), tempVec3k);
                                }
                            }
                        }
                    }

                    return hit;
                }
            };
        })(),

        /**
         * Resets this Scene to its default state.
         *
         * References to any components in this Scene will become invalid.
         *
         * @method clear
         */
        clear: function () {  // FIXME: should only clear user-created components

            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {

                    // Each component fires "destroyed" as it is destroyed,
                    // which this Scene handles by removing the component

                    this.components[id].destroy();
                }
            }

            // Reinitialise defaults

            this._initDefaults();

            this._dirtyEntities = {};
        },

        /**
         * Convenience method for creating or reusing a Component within this Scene.
         *
         * You would typically use this method to conveniently instantiate components that you'd want to
         * share (ie. "instance") among your {{#crossLink "Entity"}}Entities{{/crossLink}}.
         *
         * The method is given a component type, share ID and constructor attributes, like so:
         *
         * ````javascript
         * var material = myScene.getComponent("xeogl.PhongMaterial", "myMaterial", { diffuse: [1,0,0] });
         * ````
         *
         * The first time you call this method for the given ````type```` and ````instanceId````, this method will create the
         * {{#crossLink "PhongMaterial"}}{{/crossLink}}, passing the given  attributes to the component's constructor.
         *
         * If you call this method again, specifying the same ````type```` and ````instanceId````, the method will return the same
         * component instance that it returned the first time, and will ignore the attributes:
         *
         * ````javascript
         * var material2 = myScene.getComponent("xeogl.PhongMaterial", "myMaterial", { specular: [1,1,0] });
         * ````
         *
         * Each time you call this method with the same ````type```` and ````instanceId````, the Scene will internally increment a
         * reference count for the component instance. You can release the shared component instance with a call to
         * {{#crossLink "Scene/putSharedComponent:method"}}{{/crossLink}}, and once you have released it as many
         * times as you got it, the Scene will destroy the component.
         *
         * @method _getSharedComponent
         * @private
         * @param {*} [cfg] Attributes for the component instance - only used if this is the first time you are getting
         * the component, ignored when reusing an existing shared component.
         * @param {String|Number} instanceId Identifies the shared component instance. Note that this is not used as the ID of the
         * component - you can specify the component ID in the ````cfg```` parameter.
         * @returns {*}
         */
        _getSharedComponent: function (cfg, instanceId) {

            var type;
            var claz;

            if (xeogl._isObject(cfg)) { // Component config given

                type = cfg.type || "xeogl.Component";
                claz = xeogl[type.substring(6)];

            } else if (xeogl._isString(cfg)) {

                type = cfg;
                claz = xeogl[type.substring(6)];

            } else {

                claz = cfg;
                type = cfg.prototype.type;

                // TODO: catch unknown component class
            }

            if (!claz) {
                this.error("Component type not found: " + type);
                return;
            }

            if (!xeogl._isComponentType(type, "xeogl.Component")) {
                this.error("Expected a xeogl.Component type or subtype");
                return;
            }

            var component;

            var fullShareId;

            if (instanceId !== undefined) {

                fullShareId = "__shared." + type + "." + instanceId;

                component = this._sharedComponents[fullShareId];

                if (component) {

                    // Component already exists;
                    // ignore constructor attributes, bump share count and return component

                    this._sharedCounts[fullShareId]++;
                    return component;
                }
            }

            // Component does not yet exist

            if (cfg && cfg.id && this.components[cfg.id]) {
                this.error("Component " + xeogl._inQuotes(cfg.id) + " already exists in Scene");
                return null;
            }

            component = new claz(this, cfg);

            if (instanceId !== undefined) {

                this._sharedComponents[fullShareId] = component;
                this._sharedComponentIDs[component.id] = fullShareId;
                this._sharedCounts[fullShareId] = 1;

                component.on("destroyed", function () {
                    if (this._sharedComponentIDs[component.id] !== undefined) {
                        this._putSharedComponent(component);
                    }
                }, this);
            }

            return component;
        },

        /**
         * Releases a shared component instance that was got earlier
         * with {{#crossLink "Scene/getSharedComponent:method"}}{{/crossLink}}.
         *
         * @param {Component} component The shared component instance.
         *
         */
        _putSharedComponent: function (component) {

            var instanceId = this._sharedComponentIDs[component.id];

            if (instanceId !== undefined) {

                if (--this._sharedCounts[instanceId] > 0) {

                    // Releasing a reference; other references remain

                    return;
                }

                delete this._sharedComponents[instanceId];
                delete this._sharedComponentIDs[component.id];
                delete this._sharedCounts[instanceId];
            }

            component.destroy();
        },

        /**
         * Compiles and renders this Scene
         * @private
         */
        _compile: function (pass, clear, forceRender) {

            // Compile dirty entities into this._renderer

            var countCompiledEntities = 0;
            var entity;

            for (var id in this._dirtyEntities) {
                if (this._dirtyEntities.hasOwnProperty(id)) {
                    entity = this._dirtyEntities[id];
                    if (entity._valid()) {
                        entity._compile();
                        delete this._dirtyEntities[id];
                        countCompiledEntities++;
                    }
                }
            }

            if (countCompiledEntities > 0) {
                //    this.log("Compiled " + countCompiledEntities + " xeogl.Entity" + (countCompiledEntities > 1 ? "s" : ""));
            }

            // Render a frame
            // Only renders if there was a state update

            this._renderer.render({
                pass: pass,
                clear: clear, // Clear buffers?
                force: forceRender
            });

            // If the canvas is not transparent and has no background image or color assigned,
            // then set its color to whatever ambient color the renderer just rendered

            var canvas = this.canvas;

            if (!canvas.transparent && !canvas.backgroundImage && !canvas.backgroundColor) {

                var ambientColor = this._renderer.ambientColor;

                if (!this._lastAmbientColor ||
                    this._lastAmbientColor[0] !== ambientColor[0] ||
                    this._lastAmbientColor[1] !== ambientColor[1] ||
                    this._lastAmbientColor[2] !== ambientColor[2] ||
                    this._lastAmbientColor[3] !== ambientColor[3]) {

                    canvas.backgroundColor = ambientColor;

                    if (!this._lastAmbientColor) {
                        this._lastAmbientColor = xeogl.math.vec4();
                    }

                    this._lastAmbientColor.set(ambientColor);
                }
            } else {
                this._lastAmbientColor = null;
            }
        },

        _getJSON: function () {

            // Get list of component JSONs, in ascending order of component
            // creation. We need them in that order so that any dependencies
            // that exist between them are resolved correctly as the
            // components are instantiawhen when we load the JSON again.

            var components = [];
            var component;

            for (var id in this.components) {
                if (this.components.hasOwnProperty(id)) {

                    component = this.components[id];

                    // Don't serialize service components that
                    // will always be created on this Scene

                    if (!component._getJSON) {
                        continue;
                    }

                    // Serialize in same order as creation
                    // in order to resolve inter-component dependencies

                    components.unshift(component);
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
                passes: this._passes,
                clearEachPass: this._clearEachPass,
                components: componentJSONs
            };
        }
        ,

        _destroy: function () {
            this.clear();
        }
    });

})();
