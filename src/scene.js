/**
 A Scene represents a 3D world.

 ## Usage

 * [Creating a Scene](#creating-a-scene)
 * [Creating entities](#creating-entities)
 * [Loading models](#loading-models)
 * [Accessing content](#accessing-content)
 * [Controlling the camera](#controlling-the-camera)
 * [Taking snapshots](#taking-snapshots)
 * [Lighting](#lighting)
 * [Clipping](#clipping)
 * [Emphasis effects](#emphasis-effects)
 * [Picking](#picking)
 * [Pick masking](#pick-masking)
 * [Getting the World-space boundary](#getting-the-world-space-boundary)
 * [Controlling the viewport](#controlling-the-viewport)
 * [Controlling rendering](#controlling-rendering)
 * [Gamma correction](#gamma-correction)

 ### Creating a Scene

 Creating a Scene with its own default canvas:

 ````javascript
 var scene = new xeogl.Scene();
 ````

 Creating a Scene with an existing canvas.

 ````javascript
 var scene2 = new xeogl.Scene({
    canvas: "myCanvas"
 });

 var scene3 = new xeogl.Scene({
    canvas: document.getElementById("myCanvas");
 });
 ````

 ### Creating entities

 Creating an {{#crossLink "Entity"}}{{/crossLink}} within a Scene:

 <a href="../../examples/#geometry_primitives_teapot"><img src="../../assets/images/screenshots/Scene/teapot.png"></img></a>

 ````javascript
 var entity = new xeogl.Entity(scene, {
    geometry: new xeogl.TeapotGeometry(scene),
    material: new xeogl.PhongMaterial(scene, {
        diffuse: [0.2, 0.2, 1.0]
    })
 });
 ````

 Creating an entity within the default Scene (which will be automatically created if not yet existing):
 ````javascript
 entity = new xeogl.Entity({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    })
 });

 entity.scene.camera.eye = [45, 45, 45];
 ````

 The default Scene can be got from either the Entity or the xeogl namespace:

 ````javascript
 scene = entity.scene;
 scene = xeogl.scene;
 ````

 ### Loading models

 Use {{#crossLink "GLTFModel"}}{{/crossLink}} components to load glTF models into a Scene:

 ````javascript
 var model = new xeogl.GLTFModel(scene, { // If we don't provide the Scene, will create in default Scene
    id: "gearbox",
    src: "models/gltf/gearbox/gearbox_assy.gltf"
 });
 ````

 ### Accessing content

 Find components by ID in their Scene's {{#crossLink "Scene/components:property"}}{{/crossLink}} map:

 ````javascript
 var gear1 = scene.components["gearbox#gear99"];
 gear1.visible = false;
 //...
 ````

 A Scene also has a map of component instances for each {{#crossLink "Component"}}{{/crossLink}} subtype:

 ````javascript
 var entities = scene.types["xeogl.Entity"];
 var gear = entities["gearbox#gear99"];
 gear.ghost = true;
 //...

 var glTFModels = scene.types["xeogl.GLTFModel"];
 var gearbox = glTFModels["gearbox"];
 gearbox.visible = false;
 //...
 ````
 a map containing just the {{#crossLink "Model"}}{{/crossLink}} instances:

 ````javascript
 gearbox = scene.models["gearbox"];
 ````

 and a map containing just the {{#crossLink "Entity"}}{{/crossLink}} instances:

 ````javascript
 gear = scene.entities["gearbox#gear99"];
 ````

 ### Controlling the camera

 Use the Scene's {{#crossLink "Camera"}}{{/crossLink}} to control the current viewpoint and projection:

 ````javascript
 var camera = myScene.camera;

 camera.eye = [-10,0,0];
 camera.look = [-10,0,0];
 camera.up = [0,1,0];

 camera.projection = "perspective";
 camera.perspective.fov = 45;
 //...
 ````

 ### Managing the canvas, taking snapshots

 The Scene's {{#crossLink "Canvas"}}{{/crossLink}} component provides various conveniences relevant to the WebGL canvas, such
 as getting getting snapshots, firing resize events etc:

 ````javascript
 var canvas = scene.canvas;

 canvas.on("boundary", function(boundary) {
    //...
 });

 var imageData = canvas.getSnapshot({
    width: 500,
    height: 500,
    format: "png"
 });
 ````

 ### Lighting

 The Scene's {{#crossLink "Lights"}}{{/crossLink}} component manages lighting:

 ````javascript
 var lights = scene.lights;
 lights[1].color = [0.9, 0.9, 0.9];
 //...
 ````

 ### Clipping

 The Scene's {{#crossLink "Clips"}}{{/crossLink}} component manages clipping planes for custom cross-sections:

 ````javascript
 var clips = scene.clips;
 clips.clips = [
 new xeogl.Clip({  // Clip plane on negative diagonal
        pos: [1.0, 1.0, 1.0],
        dir: [-1.0, -1.0, -1.0],
        active: true
    }),
 new xeogl.Clip({ // Clip plane on positive diagonal
        pos: [-1.0, -1.0, -1.0],
        dir: [1.0, 1.0, 1.0],
        active: true
    }),
 //...
 ];
 ````

 ### Emphasis effects

 The Scene's {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}} provides the default {{#crossLink "EmphasisMaterial"}}{{/crossLink}}
 for controlling ghost effects:

 ````javascript
 var ghostMaterial = scene.ghostMaterial;
 ghostMaterial.edgeColor = [0.9, 0.9, 0.0];
 //...
 ````

 The Scene's {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}} provides the default {{#crossLink "EmphasisMaterial"}}{{/crossLink}}
 for controlling highlight effects:

 ````javascript
 var highlightMaterial = scene.highlightMaterial;
 highlightMaterial.color = [0.9, 0.9, 0.0];
 //...
 ````

 The Scene's {{#crossLink "Scene/outlineMaterial:property"}}{{/crossLink}} provides the default {{#crossLink "OutlineMaterial"}}{{/crossLink}}
 for controlling outline effects:


 ````javascript
 var outlineMaterial = scene.outlineMaterial;
 outlineMaterial.edgeWidth = 6;
 ````

 ### Picking entities

 Use the Scene's {{#crossLink "Scene/pick:method"}}pick(){{/crossLink}} method to pick and raycast entities.

 For example, to pick a point on the surface of the closest entity at the given canvas coordinates:

 ````javascript
 var hit = scene.pick({
     pickSurface: true,
     canvasPos: [23, 131]
 });

 if (hit) { // Picked an Entity

      var entity = hit.entity;

      var primitive = hit.primitive; // Type of primitive that was picked, usually "triangles"
      var primIndex = hit.primIndex; // Position of triangle's first index in the picked Entity's Geometry's indices array
      var indices = hit.indices; // UInt32Array containing the triangle's vertex indices
      var localPos = hit.localPos; // Float32Array containing the picked Local-space position on the triangle
      var worldPos = hit.worldPos; // Float32Array containing the picked World-space position on the triangle
      var viewPos = hit.viewPos; // Float32Array containing the picked View-space position on the triangle
      var bary = hit.bary; // Float32Array containing the picked barycentric position within the triangle
      var normal = hit.normal; // Float32Array containing the interpolated normal vector at the picked position on the triangle
      var uv = hit.uv; // Float32Array containing the interpolated UV coordinates at the picked position on the triangle
 }
 ````

 ### Pick masking

 We can use the {{#crossLink "Scene/pick:method"}}pick(){{/crossLink}} method's ````include```` and ````exclude````
 options to mask which Entities we attempt to pick.

 This is useful for picking <em>through</em> things, to pick only the Entities of interest.

 #### Including entities

 To pick only Entities ````"gearbox#77.0"```` and ````"gearbox#79.0"````, picking through any other Entities that are
 in the way, as if they weren't there:

 ````javascript
 var hit = scene.pick({
     canvasPos: [23, 131],
     include: ["gearbox#77.0", "gearbox#79.0"]
 });

 if (hit) {
      // Entity will always be either "gearbox#77.0" or "gearbox#79.0"
      var entity = hit.entity;
 }
 ````

 #### Excluding entities

 To pick any pickable Entity, except for ````"gearbox#77.0"```` and ````"gearbox#79.0"````, picking through those
 Entities if they happen to be in the way:

 ````javascript
 var hit = scene.pick({
     canvasPos: [23, 131],
     exclude: ["gearbox#77.0", "gearbox#79.0"]
 });

 if (hit) {
      // Entity will never be "gearbox#77.0" or "gearbox#79.0"
      var entity = hit.entity;
 }
 ````

 See {{#crossLink "Scene/pick:method"}}pick(){{/crossLink}} for more info on picking.

 ### Getting the World-space boundary

 Getting a Scene's World-space boundary as an AABB:

 ````javascript
 var aabb = scene.aabb; // [xmin, ymin, zmin, xmax, ymax, zmax]
 ````

 Subscribing to updates to the World-space boundary, which occur whenever Entities are Transformed, or their Geometries have been updated.

 ````javascript
 scene.on("boundary", function() {
     var aabb = scene.aabb;
     var obb = scene.obb;
 });
 ````

 Getting the collective World-space axis-aligned boundary of the {{#crossLink "Entity"}}Entities{{/crossLink}}
 and/or {{#crossLink "Model"}}Models{{/crossLink}} with the given IDs:

 ````JavaScript
 scene.getAABB(); // Gets collective boundary of all entities in the scene
 scene.getAABB("saw"); // Gets collective boundary of all entities in saw model
 scene.getAABB(["saw", "gearbox"]); // Gets collective boundary of all entities in saw and gearbox models
 scene.getAABB("saw#0.1"); // Get boundary of an entity in the saw model
 scene.getAABB(["saw#0.1", "saw#0.2"]); // Get collective boundary of two entities in saw model
 ````

 ### Managing the viewport

 The Scene's {{#crossLink "Viewport"}}{{/crossLink}} component manages the WebGL viewport:

 ````javascript
 var viewport = scene.viewport
 viewport.boundary = [0, 0, 500, 400];;
 ````

 ### Controlling rendering

 You can configure a Scene to perform multiple "passes" (renders) per frame. This is useful when we want to render the
 scene to multiple viewports, such as for stereo effects.

 In the example, below, we'll configure the Scene to render twice on each frame, each time to different viewport. We'll do this
 with a callback that intercepts the Scene before each render and sets its {{#crossLink "Viewport"}}{{/crossLink}} to a
 different portion of the canvas. By default, the Scene will clear the canvas only before the first render, allowing the
 two views to be shown on the canvas at the same time.

 ````Javascript
 // Load glTF model
 var model = new xeogl.GLTFModel({
    src: "models/gltf/GearboxAssy/glTF-MaterialsCommon/GearboxAssy.gltf"
 });

 var scene = model.scene;
 var viewport = scene.viewport;

 // Configure Scene to render twice for each frame
 scene.passes = 2; // Default is 1
 scene.clearEachPass = false; // Default is false

 // Render to a separate viewport on each render

 var viewport = scene.viewport;
 viewport.autoBoundary = false;

 scene.on("rendering", function (e) {
     switch (e.pass) {
         case 0:
             viewport.boundary = [0, 0, 200, 200]; // xmin, ymin, width, height
             break;

         case 1:
             viewport.boundary = [200, 0, 200, 200];
             break;
     }
 });

 // We can also intercept the Scene after each render,
 // (though we're not using this for anything here)
 scene.on("rendered", function (e) {
     switch (e.pass) {
         case 0:
             break;

         case 1:
             break;
     }
 });
 ````

 ### Gamma correction

 Within its shaders, xeogl performs shading calculations in linear space.

 By default, the Scene expects color textures (ie. {{#crossLink "PhongMaterial/diffuseMap:property"}}{{/crossLink}},
 {{#crossLink "MetallicMaterial/baseColorMap:property"}}{{/crossLink}} and {{#crossLink "SpecularMaterial/diffuseMap:property"}}{{/crossLink}}) to
 be in pre-multipled gamma space, so will convert those to linear space before they are used in shaders. Other textures are
 always expected to be in linear space.

 By default, the Scene will also gamma-correct its rendered output.

 You can configure the Scene to expect all those color textures to be linear space, so that it does not gamma-correct them:

 ````javascript
 scene.gammaInput = false;
 ````

 You would still need to gamma-correct the output, though, if it's going straight to the canvas, so normally we would
 leave that enabled:

 ````javascript
 scene.gammaOutput = true;
 ````

 See {{#crossLink "Texture"}}{{/crossLink}} for more information on texture encoding and gamma.

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
 @param [cfg.ticksPerRender=1] {Number} The number of {{#crossLink "Scene/tick:event"}}{{/crossLink}} that happen between each render or this Scene.
 @param [cfg.passes=1] {Number} The number of times this Scene renders per frame.
 @param [cfg.clearEachPass=false] {Boolean} When doing multiple passes per frame, specifies whether to clear the
 canvas before each pass (true) or just before the first pass (false).
 @param [cfg.transparent=false] {Boolean} Whether or not the canvas is transparent.
 @param [cfg.backgroundColor] {Float32Array} RGBA color for canvas background, when canvas is not transparent. Overridden by backgroundImage.
 @param [cfg.backgroundImage] {String} URL of an image to show as the canvas background, when canvas is not transparent. Overrides backgroundImage.
 @param [cfg.gammaInput=false] {Boolean} When true, expects that all textures and colors are premultiplied gamma.
 @param [cfg.gammaOutput=true] {Boolean} Whether or not to render with pre-multiplied gama.
 @param [cfg.gammaFactor=2.2] {Number} The gamma factor to use when rendering with pre-multiplied gamma.
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

            /**
             * The number of models currently loading.
             *
             * @property loading
             * @type {Number}
             */
            this.loading = 0;

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

            /**
             * The {{#crossLink "Model"}}{{/crossLink}}s within
             * this Scene, mapped to their IDs.
             *
             * @property entities
             * @type {String:xeogl.Model}
             */
            this.models = {};

            // Contains xeogl.Entities that need to be recompiled back into this._renderer
            this._dirtyEntities = {};

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
                    self._renderer.imageDirty();
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
                element: this.canvas.canvas
            });

            // Register Scene on engine
            // Do this BEFORE we add components below
            xeogl._addScene(this);

            // Add components specified as JSON

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

            // Init default components

            this._initDefaults();

            // Global components

            this._viewport = new xeogl.Viewport(this, {
                id: "default.viewport",
                autoBoundary: true
            });

            this._camera = new xeogl.Camera(this, {
                id: "default.camera"
            });

            this._clips = new xeogl.Clips(this, {
                id: "default.clips"
            });

            this._lights = new xeogl.Lights(this, {
                id: "default.lights",
                lights: [
                    new xeogl.DirLight(this, {
                        dir: [0.8, -0.6, -0.8],
                        color: [1.0, 1.0, 1.0],
                        intensity: 1.0,
                        space: "view"
                    }),

                    new xeogl.DirLight(this, {
                        dir: [-0.8, -0.4, -0.4],
                        color: [1.0, 1.0, 1.0],
                        intensity: 1.0,
                        space: "view"
                    }),

                    new xeogl.DirLight(this, {
                        dir: [0.2, -0.8, 0.8],
                        color: [0.6, 0.6, 0.6],
                        intensity: 1.0,
                        space: "view"
                    })
                ]
            });

            // Plug global components into renderer

            var viewport = this._viewport;
            var renderer = this._renderer;
            var camera = this._camera;
            var clips = this._clips;
            var lights = this._lights;

            renderer.viewport = viewport._state;
            renderer.projTransform = camera[camera.projection]._state;
            renderer.viewTransform = camera._state;
            renderer.lights = lights._getState();
            renderer.clips = clips._getState();

            camera.on("dirty", function () {
                renderer.projTransform = camera.project._state;
                renderer.viewTransform = camera._state;
                renderer.imageDirty();
            });

            clips.on("dirty", function () { // TODO: Buffer so we're not doing for every light
                renderer.clips = clips._getState();
                for (var entityId in self.entities) {
                    if (self.entities.hasOwnProperty(entityId)) {
                        self._entityDirty(self.entities[entityId]);
                    }
                }
            });

            lights.on("dirty", function () {
                renderer.lights = lights._getState();
                var updated = false;
                for (var entityId in self.entities) {
                    if (self.entities.hasOwnProperty(entityId)) {
                        self._entityDirty(self.entities[entityId]);
                        updated = true;
                    }
                }
                // if (!updated || self.loading > 0 || self.canvas.spinner.processes > 0) {
                //     renderer.clear({}); // TODO: multiple passes
                // }
            });

            this.ticksPerRender = cfg.ticksPerRender;
            this.passes = cfg.passes;
            this.clearEachPass = cfg.clearEachPass;
            this.gammaInput = cfg.gammaInput;
            this.gammaOutput = cfg.gammaOutput;
            this.gammaFactor = cfg.gammaFactor;
        },

        _initDefaults: function () {

            // Call this Scene's property accessors to lazy-init their properties

            var dummy; // Keeps Codacy happy

            dummy = this.geometry;
            dummy = this.material;
            dummy = this.ghostMaterial;
            dummy = this.outlineMaterial;
            dummy = this.transform;
        },

        // Called by each component that is created with this Scene as parent.
        // Registers the component within this scene.

        _addComponent: function (c) {

            if (c.id) {

                // User-supplied ID

                if (this.components[c.id]) {
                    this.error("Component " + xeogl._inQuotes(c.id) + " already exists in Scene - ignoring ID, will randomly-generate instead");
                    //        c.id = this._componentIDMap.addItem(c);
                    return;
                }
            } else {

                // Auto-generated ID

                if (window.nextID === undefined) {
                    window.nextID = 0;
                }
                //c.id = xeogl.math.createUUID();
                c.id = "_" + window.nextID++;

                while (this.components[c.id]) {
                    c.id = xeogl.math.createUUID();
                }
            }

            this.components[c.id] = c;

            // Register for class type

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

                // Component is a xeogl.Entity or subtype

                c.on("dirty", this._entityDirty, this);

                this.entities[c.id] = c;

                // If we currently have a World-space Scene boundary, then invalidate
                // it whenever Entity's World-space boundary updates

                c.on("boundary", this._setBoundaryDirty, this);

                // Update scene statistics

                xeogl.stats.components.entities++;
            }

            if (c.isType("xeogl.Model")) {

                this.models[c.id] = c;

                // Update scene statistics

                xeogl.stats.components.models++;
            }

            //self.log("Created " + c.type + " " + xeogl._inQuotes(c.id));
        },

        // Callbacks as members to reduce GC churn

        _componentDestroyed: function (c) {

            delete this.components[c.id];

            var types = this.types[c.type];

            if (types) {

                delete types[c.id];

                if (xeogl._isEmptyObject(types)) {
                    delete this.types[c.type];
                }
            }

            if (c.isType("xeogl.Entity")) {

                // Component is a xeogl.Entity or subtype

                // Update scene statistics,
                // Unschedule any pending recompilation of
                // the Entity into the renderer

                xeogl.stats.components.entities--;
                delete this.entities[c.id];
                delete this._dirtyEntities[c.id];
                xeogl.stats.components.entities--;
            }

            if (c.isType("xeogl.Model")) {
                delete this.models[c.id];
                xeogl.stats.components.models--;
            }

            //this.log("Destroyed " + c.type + " " + xeogl._inQuotes(c.id));
        },

        _entityDirty: function (entity) {
            this._dirtyEntities[entity.id] = entity;
        },

        /**
         * Renders a single frame of this Scene.
         *
         * The Scene will periodically render itself after any updates, but you can call this method to force a render
         * if required. This method is typically used when we want to synchronously take a snapshot of the canvas and
         * need everything rendered right at that moment.
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

                // The renderer is suspended while a model loads, and when a Scene is made to load something
                // as soon as it's instantiated, that means that its lights may not get a chance to set the
                // canvas background until the model is loaded and the renderer is unsuspended again. Therefore,
                // we have a special imageForceDirty flag that bypasses the suspension, which lights set when
                // their properties are updated.

                var imageForceDirty = this._renderer.imageForceDirty;

                if (this.loading > 0 && !forceRender && !imageForceDirty) {
                    this._compileDirtyEntities(100);
                    return;
                }

                if (this.canvas.spinner.processes > 0 && !imageForceDirty) {
                    this._compileDirtyEntities(100);
                    return;
                }

                this._compileDirtyEntities(15);

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

                    this._renderer.render({pass: pass, clear: clear, force: forceRender});

                    /**
                     * Fired when we have just rendered a frame for a Scene.
                     *
                     * @event rendering
                     * @param {String} sceneID The ID of this Scene.
                     * @param {Number} pass Index of the pass we rendered (see {{#crossLink "Scene/passes:property"}}{{/crossLink}}).
                     */
                    this.fire("rendered", renderEvent, true);
                }

                this._saveAmbientColor();
            }
        })(),

        _compileDirtyEntities: function (timeBudget) {
            var time1 = (new Date()).getTime();
            var entity;
            for (var id in this._dirtyEntities) {
                if (this._dirtyEntities.hasOwnProperty(id)) {
                    entity = this._dirtyEntities[id];
                    if (entity._valid()) {
                        entity._compile();
                        delete this._dirtyEntities[id];
                    }
                    var time2 = (new Date()).getTime();
                    if (time2 - time1 > timeBudget) {
                        return;
                    }
                }
            }
        },

        _saveAmbientColor: function () {
            var canvas = this.canvas;
            if (!canvas.transparent && !canvas.backgroundImage && !canvas.backgroundColor) {
                var ambientColor = this._renderer.getAmbientColor();
                if (!this._lastAmbientColor ||
                    this._lastAmbientColor[0] !== ambientColor[0] ||
                    this._lastAmbientColor[1] !== ambientColor[1] ||
                    this._lastAmbientColor[2] !== ambientColor[2] ||
                    this._lastAmbientColor[3] !== ambientColor[3]) {
                    canvas.backgroundColor = ambientColor;
                    if (!this._lastAmbientColor) {
                        this._lastAmbientColor = xeogl.math.vec4([0, 0, 0, 1]);
                    }
                    this._lastAmbientColor.set(ambientColor);
                }
            } else {
                this._lastAmbientColor = null;
            }
        },

        _props: {

            /**
             * The number of {{#crossLink "Scene/tick:property"}}{{/crossLink}} that happen between each render or this Scene.
             *
             * @property ticksPerRender
             * @default 1
             * @type Number
             */
            ticksPerRender: {

                set: function (value) {

                    if (value === undefined || value === null) {
                        value = 1;

                    } else if (!xeogl._isNumeric(value) || value <= 0) {

                        this.error("Unsupported value for 'ticksPerRender': '" + value +
                            "' - should be an integer greater than zero.");

                        value = 1;
                    }

                    if (value === this._ticksPerRender) {
                        return;
                    }

                    this._ticksPerRender = value;
                },

                get: function () {
                    return this._ticksPerRender;
                }
            },

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

                    this._renderer.imageDirty();
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

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._clearEachPass;
                }
            },

            /**
             * When true, expects all textures and colors are premultiplied gamma.
             *
             * @property gammaInput
             * @default false
             * @type Boolean
             */
            gammaInput: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._renderer.gammaInput) {
                        return;
                    }

                    this._renderer.gammaInput = value;

                    for (var entityId in this.entities) { // Needs all shaders recompiled
                        if (this.entities.hasOwnProperty(entityId)) {
                            this._entityDirty(this.entities[entityId]);
                        }
                    }
                },

                get: function () {
                    return this._renderer.gammaInput;
                }
            },

            /**
             * Whether or not to render pixels with pre-multiplied gama.
             *
             * @property gammaOutput
             * @default true
             * @type Boolean
             */
            gammaOutput: {

                set: function (value) {

                    value = value !== false;

                    if (value === this._renderer.gammaOutput) {
                        return;
                    }

                    this._renderer.gammaOutput = value;

                    for (var entityId in this.entities) { // Needs all shaders recompiled
                        if (this.entities.hasOwnProperty(entityId)) {
                            this._entityDirty(this.entities[entityId]);
                        }
                    }
                },

                get: function () {
                    return this._renderer.gammaOutput;
                }
            },

            /**
             * The gamma factor to use when {{#crossLink "Scene/property:gammaOutput"}}{{/crossLink}} is set true.
             *
             * @property gammaOutput
             * @default 1.0
             * @type Number
             */
            gammaFactor: {

                set: function (value) {

                    value = (value === undefined || value === null) ? 2.2 : value;

                    if (value === this._renderer.gammaFactor) {
                        return;
                    }

                    this._renderer.gammaFactor = value;

                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._renderer.gammaFactor;
                }
            },

            /**
             * The default modelling {{#crossLink "Transform"}}{{/crossLink}} for this Scene.
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
             * The default geometry for this Scene, which is a {{#crossLink "BoxGeometry"}}BoxGeometry{{/crossLink}}.
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
             * The default drawing material for this Scene, which is a {{#crossLink "PhongMaterial"}}PhongMaterial{{/crossLink}}.
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
                            isDefault: true,
                            emissive: [0.4, 0.4, 0.4] // Visible by default on geometry without normals
                        });
                }
            },

            /**
             * The Scene's default {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} for the appearance of {{#crossLink "Entities"}}Entities{{/crossLink}} when they are ghosted.
             *
             * This {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.ghostMaterial", with all
             * other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} by default.
             * @property ghostMaterial
             * @final
             * @type EmphasisMaterial
             */
            ghostMaterial: {
                get: function () {
                    return this.components["default.ghostMaterial"] ||
                        new xeogl.EmphasisMaterial(this, {
                            id: "default.ghostMaterial",
                            preset: "sepia",
                            isDefault: true
                        });
                }
            },

            /**
             * The Scene's default {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} for the appearance of {{#crossLink "Entities"}}Entities{{/crossLink}} when they are highlighted.
             *
             * This {{#crossLink "HighlightMaterial"}}HighlightMaterial{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.highlightMaterial", with all
             * other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "HighlightMaterial"}}HighlightMaterial{{/crossLink}} by default.
             * @property highlightMaterial
             * @final
             * @type HighlightMaterial
             */
            highlightMaterial: {
                get: function () {
                    return this.components["default.highlightMaterial"] ||
                        new xeogl.EmphasisMaterial(this, {
                            id: "default.highlightMaterial",
                            preset: "yellowHighlight",
                            isDefault: true
                        });
                }
            },

            /**
             * The Scene's default {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} for the appearance of {{#crossLink "Entities"}}Entities{{/crossLink}} when they are selected.
             *
             * This {{#crossLink "SelectedMaterial"}}SelectedMaterial{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.selectedMaterial", with all
             * other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "SelectedMaterial"}}SelectedMaterial{{/crossLink}} by default.
             * @property selectedMaterial
             * @final
             * @type SelectedMaterial
             */
            selectedMaterial: {
                get: function () {
                    return this.components["default.selectedMaterial"] ||
                        new xeogl.EmphasisMaterial(this, {
                            id: "default.selectedMaterial",
                            preset: "greenSelected",
                            isDefault: true
                        });
                }
            },

            /**
             * The Scene's default {{#crossLink "OutlineMaterial"}}OutlineMaterial{{/crossLink}} for the appearance of {{#crossLink "Entities"}}Entities{{/crossLink}} when they are outlined.
             *
             * This {{#crossLink "OutlineMaterial"}}OutlineMaterial{{/crossLink}} has
             * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.outlineMaterial", with all
             * other properties initialised to their default values.
             *
             * {{#crossLink "Entity"}}Entities{{/crossLink}} within this Scene are attached to this
             * {{#crossLink "OutlineMaterial"}}OutlineMaterial{{/crossLink}} by default.
             * @property outlineMaterial
             * @final
             * @type OutlineMaterial
             */
            outlineMaterial: {
                get: function () {
                    return this.components["default.outlineMaterial"] ||
                        new xeogl.OutlineMaterial(this, {
                            id: "default.outlineMaterial",
                            isDefault: true
                        });
                }
            },

            /**
             * The {{#crossLink "Viewport"}}{{/crossLink}} belonging to this Scene.
             *
             * @property viewport
             * @final
             * @type Viewport
             */
            viewport: {
                get: function () {
                    return this._viewport;
                }
            },

            /**
             * The {{#crossLink "Lights"}}Lights{{/crossLink}} belonging to this Scene.
             *
             * @property lights
             * @final
             * @type Lights
             */
            lights: {
                get: function () {
                    return this._lights;
                }
            },

            /**
             * The {{#crossLink "Camera"}}Camera{{/crossLink}} belonging to this Scene.
             *
             * @property camera
             * @final
             * @type Camera
             */
            camera: {
                get: function () {
                    return this._camera;
                }
            },

            /**
             * The {{#crossLink "Clips"}}Clips{{/crossLink}} belonging to this Scene.
             *
             * @property clips
             * @final
             * @type Clips
             */
            clips: {
                get: function () {
                    return this._clips;
                }
            },

            /**
             * World-space 3D center of this Scene.
             *
             * @property center
             * @final
             * @type {Float32Array}
             */
            center: {

                get: function () {

                    if (this._aabbDirty) {

                        if (!this._center) {
                            this._center = xeogl.math.AABB3();
                        }

                        var aabb = this.aabb;

                        this._center[0] = (aabb[0] + aabb[3] ) / 2;
                        this._center[1] = (aabb[1] + aabb[4] ) / 2;
                        this._center[2] = (aabb[2] + aabb[5] ) / 2;
                    }

                    return this._center;
                }
            },

            /**
             * World-space axis-aligned 3D boundary (AABB) of this Scene.
             *
             * The AABB is represented by a six-element Float32Array containing the min/max extents of the
             * axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.
             *
             * @property aabb
             * @final
             * @type {Float32Array}
             */
            aabb: {

                get: function () {

                    if (this._aabbDirty) {

                        if (!this._aabb) {
                            this._aabb = xeogl.math.AABB3();
                        }

                        var xmin = xeogl.math.MAX_DOUBLE;
                        var ymin = xeogl.math.MAX_DOUBLE;
                        var zmin = xeogl.math.MAX_DOUBLE;
                        var xmax = -xeogl.math.MAX_DOUBLE;
                        var ymax = -xeogl.math.MAX_DOUBLE;
                        var zmax = -xeogl.math.MAX_DOUBLE;

                        var aabb;

                        var entities = this.entities;
                        var entity;

                        for (var entityId in entities) {
                            if (entities.hasOwnProperty(entityId)) {

                                entity = entities[entityId];

                                if (!entity.collidable) {
                                    continue;
                                }

                                aabb = entity.aabb;

                                if (!aabb) {
                                    this.error("internal error: entity without aabb: " + entityId);
                                    continue;
                                }

                                if (aabb[0] < xmin) {
                                    xmin = aabb[0];
                                }
                                if (aabb[1] < ymin) {
                                    ymin = aabb[1];
                                }
                                if (aabb[2] < zmin) {
                                    zmin = aabb[2];
                                }
                                if (aabb[3] > xmax) {
                                    xmax = aabb[3];
                                }
                                if (aabb[4] > ymax) {
                                    ymax = aabb[4];
                                }
                                if (aabb[5] > zmax) {
                                    zmax = aabb[5];
                                }
                            }
                        }

                        this._aabb[0] = xmin;
                        this._aabb[1] = ymin;
                        this._aabb[2] = zmin;
                        this._aabb[3] = xmax;
                        this._aabb[4] = ymax;
                        this._aabb[5] = zmax;

                        this._aabbDirty = false;
                    }

                    return this._aabb;
                }
            }
        },

        _setBoundaryDirty: function () {
            if (!this._aabbDirty) {
                this._aabbDirty = true;
                this.fire("boundary");
            }
        },

        /**
         * Attempts to pick an {{#crossLink "Entity"}}Entity{{/crossLink}} in this Scene.
         *
         * Ignores {{#crossLink "Entity"}}Entities{{/crossLink}} with {{#crossLink "Entity/pickable:property"}}pickable{{/crossLink}}
         * set *false*.
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
         * @param {Array} [params.include] IDs of {{#crossLink "Entity"}}Entities{{/crossLink}} to pick from amongst. When given, ignores {{#crossLink "Entity"}}Entities{{/crossLink}} whose IDs are not in this list.
         * @param {Array} [params.exclude] IDs of {{#crossLink "Entity"}}Entities{{/crossLink}} to ignore. When given, will pick *through* these {{#crossLink "Entity"}}Entities{{/crossLink}}, as if they were not there.
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

            function entityIDsToObjectIDs(scene, entityIds) {
                var objectIds = {};
                var entityId;
                var entity;
                for (var i = 0, len = entityIds.length; i < len; i++) {
                    entityId = entityIds[i];
                    entity = scene.entities[entityId];
                    if (!entity) {
                        scene.warn("pick(): Entity not found: " + entityId);
                        continue;
                    }
                    objectIds[entity._objectId] = true;
                }
                return objectIds;
            }

            return function (params) {

                if (this.canvas.boundary[2] === 0 || this.canvas.boundary[3] === 0) {
                    this.error("Picking not allowed while canvas has zero width or height");
                    return null;
                }

                params = params || {};

                params.pickSurface = params.pickSurface || params.rayPick; // Backwards compatibility

                if (!params.canvasPos && (!params.origin || !params.direction)) {
                    this.warn("picking without canvasPos or ray origin and direction");
                }

                if (params.include) {
                    params.includeObjects = entityIDsToObjectIDs(this, params.include)
                }

                if (params.exclude) {
                    params.excludeObjects = entityIDsToObjectIDs(this, params.exclude)
                }

                var hit = this._renderer.pick(params);

                if (hit) {

                    var entity = this.entities[hit.entity];

                    hit.entity = entity; // Swap string ID for xeogl.Entity

                    if (params.pickSurface) {

                        if (hit.primIndex !== undefined && hit.primIndex > -1) {

                            var geometry = entity.geometry._state;

                            if (geometry.primitiveName === "triangles") {

                                // Triangle picked; this only happens when the
                                // Entity has a Geometry that has primitives of type "triangle"

                                hit.primitive = "triangle";

                                // Get the World-space positions of the triangle's vertices

                                var i = hit.primIndex; // Indicates the first triangle index in the indices array

                                var indices = geometry.indices; // Indices into geometry arrays, not into shared VertexBufs
                                var positions = geometry.positions;

                                var ia3;
                                var ib3;
                                var ic3;

                                if (indices) {

                                    var ia = indices[i + 0];
                                    var ib = indices[i + 1];
                                    var ic = indices[i + 2];

                                    triangleVertices[0] = ia;
                                    triangleVertices[1] = ib;
                                    triangleVertices[2] = ic;

                                    hit.indices = triangleVertices;

                                    ia3 = ia * 3;
                                    ib3 = ib * 3;
                                    ic3 = ic * 3;

                                } else {

                                    ia3 = i * 3;
                                    ib3 = ia3 + 3;
                                    ic3 = ib3 + 3;
                                }

                                a[0] = positions[ia3 + 0];
                                a[1] = positions[ia3 + 1];
                                a[2] = positions[ia3 + 2];

                                b[0] = positions[ib3 + 0];
                                b[1] = positions[ib3 + 1];
                                b[2] = positions[ib3 + 2];

                                c[0] = positions[ic3 + 0];
                                c[1] = positions[ic3 + 1];
                                c[2] = positions[ic3 + 2];

                                if (geometry.quantized) {

                                    // Decompress vertex positions

                                    var positionsDecodeMatrix = geometry.positionsDecodeMatrix;
                                    if (positionsDecodeMatrix) {
                                        math.decompressPosition(a, positionsDecodeMatrix, a);
                                        math.decompressPosition(b, positionsDecodeMatrix, b);
                                        math.decompressPosition(c, positionsDecodeMatrix, c);
                                    }
                                }

                                // Attempt to ray-pick the triangle in local space

                                var canvasPos;

                                if (params.canvasPos) {
                                    canvasPos = params.canvasPos;
                                    hit.canvasPos = params.canvasPos;
                                    math.canvasPosToLocalRay(this.camera, entity, canvasPos, localRayOrigin, localRayDir);

                                } else if (params.origin && params.direction) {
                                    math.worldRayToLocalRay(entity, params.origin, params.direction, localRayOrigin, localRayDir);
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

                                math.transformVec4(entity.scene.camera.matrix, tempVec4b, tempVec4c);

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

                                    if (geometry.quantized) {

                                        // Decompress vertex normals

                                        var ia2 = ia * 2;
                                        var ib2 = ib * 2;
                                        var ic2 = ic * 2;

                                        math.octDecodeVec2(normals.subarray(ia2, ia2 + 2), na);
                                        math.octDecodeVec2(normals.subarray(ib2, ib2 + 2), nb);
                                        math.octDecodeVec2(normals.subarray(ic2, ic2 + 2), nc);

                                    } else {

                                        na[0] = normals[ia3];
                                        na[1] = normals[ia3 + 1];
                                        na[2] = normals[ia3 + 2];

                                        nb[0] = normals[ib3];
                                        nb[1] = normals[ib3 + 1];
                                        nb[2] = normals[ib3 + 2];

                                        nc[0] = normals[ic3];
                                        nc[1] = normals[ic3 + 1];
                                        nc[2] = normals[ic3 + 2];
                                    }

                                    var normal = math.addVec3(math.addVec3(
                                        math.mulVec3Scalar(na, bary[0], tempVec3),
                                        math.mulVec3Scalar(nb, bary[1], tempVec3b), tempVec3c),
                                        math.mulVec3Scalar(nc, bary[2], tempVec3d), tempVec3e);

                                    hit.normal = math.transformVec3(entity.transform.leafNormalMatrix, normal, tempVec3f);
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

                                    if (geometry.quantized) {

                                        // Decompress vertex UVs

                                        var uvDecodeMatrix = geometry.uvDecodeMatrix;
                                        if (uvDecodeMatrix) {
                                            math.decompressUV(uva, uvDecodeMatrix, uva);
                                            math.decompressUV(uvb, uvDecodeMatrix, uvb);
                                            math.decompressUV(uvc, uvDecodeMatrix, uvc);
                                        }
                                    }

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
         Convenience method which returns the collective axis-aligned boundary of the {{#crossLink "Entity"}}Entities{{/crossLink}}
         and/or {{#crossLink "Model"}}Models{{/crossLink}} with the given IDs.

         When no arguments are given, returns the total boundary of all objects in the scene.

         Only {{#crossLink "Entity"}}Entities{{/crossLink}} with {{#crossLink "Entity/collidable:property"}}collidable{{/crossLink}}
         set ````true```` are included in the boundary.
         
         ## Usage
         
         ````JavaScript
         scene.getAABB(); // Gets collective boundary of all objects in the scene
         scene.getAABB("saw"); // Gets collective boundary of all objects in saw model
         scene.getAABB(["saw", "gearbox"]); // Gets collective boundary of all objects in saw and gearbox models
         scene.getAABB("saw#0.1"); // Get boundary of an object in the saw model
         scene.getAABB(["saw#0.1", "saw#0.2"]); // Get collective boundary of two objects in saw model
         ````

         @method getAABB
         @param {String|String[]} target IDs of models, objects and/or annotations
         @returns {[Number, Number, Number, Number, Number, Number]} An axis-aligned World-space bounding box, given as elements ````[xmin, ymin, zmin, xmax, ymax, zmax]````.
         */
        getAABB: function (target) {
            if (arguments.length === 0 || target === undefined) {
                return this.aabb;
            }
            if (xeogl._isArray(target) && (!xeogl._isString(target[0]))) {
                return target; // AABB
            }
            if (xeogl._isString(target)) {
                target = [target];
            }
            if (target.length === 0) {
                return this.aabb;
            }
            var id;
            var component;
            if (target.length === 1) {
                id = target[0];
                component = this.components[id];
                if (!component) {
                    return this.aabb;
                }
                return component.aabb || this.aabb;
            }
            // Many ids given
            var i;
            var len;
            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;
            var aabb;
            var valid = false;
            for (i = 0, len = target.length; i < len; i++) {
                id = target[i];
                component = this.components[id];
                if (component) {
                    aabb = component.aabb;
                    if (!aabb) {
                        continue;
                    }
                }
                if (aabb[0] < xmin) {
                    xmin = aabb[0];
                }
                if (aabb[1] < ymin) {
                    ymin = aabb[1];
                }
                if (aabb[2] < zmin) {
                    zmin = aabb[2];
                }
                if (aabb[3] > xmax) {
                    xmax = aabb[3];
                }
                if (aabb[4] > ymax) {
                    ymax = aabb[4];
                }
                if (aabb[5] > zmax) {
                    zmax = aabb[5];
                }
                valid = true;
            }
            if (valid) {
                var aabb2 = new xeogl.math.AABB3();
                aabb2[0] = xmin;
                aabb2[1] = ymin;
                aabb2[2] = zmin;
                aabb2[3] = xmax;
                aabb2[1 + 3] = ymax;
                aabb2[2 + 3] = zmax;
                return aabb2;
            } else {
                return this.aabb;
            }
        },

        /**
         Resets this Scene to its default state.

         References to any components in this Scene will become invalid.

         @method clear
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

        _destroy: function () {
            this.clear();
        }
    });

})();
