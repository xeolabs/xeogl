/*
 * xeoEngine V0.0.1
 *
 * A WebGL-based 3D engine from xeoLabs
 * http://xeoengine.org/
 *
 * Built on 2015-03-01
 *
 * MIT License
 * Copyright 2015, Lindsay Kay
 * http://xeolabs.com/
 *
 */

"use strict";

/**
 * The XeoEngine namespace
 * @class XEO
 * @main XEO
 * @static
 * @author xeolabs / http://xeolabs.com/
 */
(function () {

    var XEO = function () {

        // Default singleton Scene, lazy-initialized in getter
        this._scene = null;

        /**
         * Existing  {{#crossLink "Scene"}}Scene{{/crossLink}}s , mapped to their IDs
         * @property scenes
         * @namespace XEO
         * @type {{String:XEO.Scene}}
         */
        this.scenes = {};

        // Map of Scenes needing recompilation
        this._dirtyScenes = {};

        var self = this;

        // Called on each animation frame
        // fires a "tick" on each scene, recompiles scenes as needed
        var frame = function () {

            var tick = {}; // Publish this on every scene
            var scene;

            for (var id in self.scenes) {
                if (self.scenes.hasOwnProperty(id)) {

                    scene = self.scenes[id];

                    scene.fire("tick", tick);

                    // If scene dirty, then recompile it
                    if (self._dirtyScenes[id]) {
                        scene._compile();
                        self._dirtyScenes[id] = false;
                    }
                }
            }

            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    };

    XEO.prototype = {

        constructor: XEO,

        /**
         The default {{#crossLink "Scene"}}Scene{{/crossLink}}.

         Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
         {{#crossLink "Scene"}}Scene{{/crossLink}} by default.

         xeoEngine creates the default {{#crossLink "Scene"}}Scene{{/crossLink}} as soon as you either
         reference this property for the first time, or create your first {{#crossLink "GameObject"}}GameObject{{/crossLink}} without
         a specified {{#crossLink "Scene"}}Scene{{/crossLink}}.

         @property scene
         @namespace XEO
         @final
         @type Scene
         */
        get scene() {
            return this._scene || (this._scene = new XEO.Scene());
        },

        /**
         * Registers a scene on xeoEngine
         * @method _addScene
         * @param {Scene} scene The scene
         * @private
         */
        _addScene: function (scene) {

            this.scenes[scene.id] = scene;

            var self = this;

            // Unregister destroyed scenes
            scene.on("destroyed",
                function () {
                    delete self.scenes[scene.id];
                    delete self._dirtyScenes[scene.id];
                });

            // Schedule recompilation of dirty scenes for next animation frame
            scene.on("dirty",
                function () {
                    self._dirtyScenes[scene.id] = true;
                });
        },

        /**
         * Destroys all scenes
         * @method clear
         */
        clear: function () {
            for (var id in this.scenes) {
                if (this.scenes.hasOwnProperty(id)) {
                    this.scenes[id].destroy();
                }
            }
            this.scenes = {};
            this._dirtyScenes = {};
        },

        /**
         * Tests if the given object is an array
         * @private
         */
        _isArray: function (testGameObject) {
            return testGameObject && !(testGameObject.propertyIsEnumerable('length'))
                && typeof testGameObject === 'object' && typeof testGameObject.length === 'number';
        },

        /**
         * Tests if the given value is a string
         * @param value
         * @returns {boolean}
         * @private
         */
        _isString: function (value) {
            return (typeof value == 'string' || value instanceof String);
        },

        /** Returns a shallow copy
         */
        _copy: function (o) {
            return this._apply(o, {});
        },

        /** Add properties of o to o2, overwriting them on o2 if already there
         */
        _apply: function (o, o2) {
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    o2[name] = o[name];
                }
            }
            return o2;
        },

        /**
         * Add properties of o to o2 where undefined or null on o2
         * @private
         */
        _applyIf: function (o, o2) {
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    if (o2[name] == undefined || o2[name] == null) {
                        o2[name] = o[name];
                    }
                }
            }
            return o2;
        },

        /**
         * Create a new component type
         * @param cfg
         * @returns {Component.prototype}
         * @private
         */
        _createType: function (cfg) {
            var claz = XEO.Component;
            for (var key in cfg) {
                claz.prototype[key] = key;
            }
            return claz;
        }
    };

    window.XEO = new XEO();

})();


;"use strict";

/**
 **Component* is the base class for all xeoEngine components.

 <hr>
  *Contents*

  <Ul>
  <li><a href="#ids">Component IDs</a></li>
  <li><a href="#props">Properties</a></li>
  <li><a href="#metadata">Metadata</a></li>
  <li><a href="#logging">Logging</a></li>
  <li><a href="#destruction">Destruction</a></li>
  </ul>
  <hr>

 <br>
 ### <a name="ids">Component IDs</a>

 Every Component has an ID that's unique within the parent {{#crossLink "Scene"}}{{/crossLink}}.

 xeoEngine generates the IDs automatically by default, however you can also specify them yourself:

 ```` javascript
 var scene = new XEO.Scene({
       id: "myScene"
  });

 var material = new XEO.Material(scene, {
        id: "myMaterial"
   });

 var geometry = new XEO.Geometry(scene, {
        id: "myGeometry"
  });

 var object = new XEO.GameObject(scene, {
        material: material,
        geometry: geometry
  });

 ````

 Then you can find your components like this:

 ```` javascript
 var theScene = XEO.scenes["myScene"];

 var theMaterial = theScene.components["myMaterial"];

 ````

 <br>
 ### <a name="props">Properties</a>

 Almost every property on a xeoEngine Component fires a change event when you update it.

 For example, we can subscribe to the {{#crossLink "Material/diffuse:event"}}diffuse{{/crossLink}} event that a
 {{#crossLink "Material"}}Material{{/crossLink}} fires when its {{#crossLink "Material/diffuse:property"}}diffuse{{/crossLink}}
 property is updated, like so:

 ```` javascript
 // Bind a change callback to a property
 var handle = material.on("diffuse", function(diffuse) {
      console.log("Material diffuse color has changed to: [" + diffuse[0] + ", " + diffuse[1] + "," + diffuse[2] + "]");
  });

 // Change the property value, which fires the callback
 material.diffuse = [ 0.0, 0.5, 0.5 ];

 // Unsubscribe from the property change event
 material.off(handle);
 ````

 We can also subscribe to changes in component structure, since components are properties of other components. For example, we can
 subscribe to the "{{#crossLink "GameObject/material:event"}}material{{/crossLink}}" event that an
 {{#crossLink "GameObject"}}GameObject{{/crossLink}} fires when its {{#crossLink "GameObject/material:property"}}material{{/crossLink}}
 property is linked to a different {{#crossLink "Material"}}Material{{/crossLink}}, like so:

 ```` javascript
 // Bind a change callback to the GameObject's Material
 object1.on("material", function(material) {
      console.log("GameObject's Material has changed to: " + material.id);
  });

 // Now replace that Material with another
 object1.material = new XEO.Material({
       id: "myOtherMaterial",
       diffuse: [ 0.3, 0.3, 0.6 ]
       //..
   });
 ````

 <br>
 ### <a name="metadata">Metadata</a>

 You can set optional ***metadata*** on your Components, which can be anything you like. These are intended
 to help manage your components within your application code or content pipeline.

 You could use metadata to attach authoring or version information, like this:

 ```` javascript
 var scene = new XEO.Scene({
        id: "myScene",
        metadata: {
            title: "My awesome 3D scene",
            author: "@xeolabs",
 date: "February 13 2015"
 }
 });

 var material = new XEO.Material(scene, {
        id: "myMaterial",
        diffuse: [1, 0, 0],
        metadata: {
            description: "Bright red color with no textures",
            version: "0.1",
            foo: "bar"
        }
   });
 ````

 As with all properties, you can subscribe and change the metadata like this:

 ```` javascript
 material.on("metadata", function(value) {
        console.log("Metadata changed: " + JSON.stringify(value));
 });

 material.metadata = {
        description: "Bright red color with no textures",
        version: "0.2",
        foo: "baz"
 };
 ````

 <br>
 ### <a name="logging">Logging</a>

 Components have methods to log ID-prefixed messages to the JavaScript console:

 ```` javascript
 material.log("Everything is fine, situation normal.");
 material.warn("Wait, whats that red light?");
 material.error("Aw, snap!");
 ````

 The logged messages will look like this:

 ```` text
 [LOG]   myMaterial: Everything is fine, situation normal.
 [WARN]  myMaterial: Wait, whats that red light..
 [ERROR] myMaterial: Aw, snap!
 ````
 <br>
 ### <a name="destruction">Destruction</a>

 Get notification of destruction directly on the Components:

 ```` javascript
 material.on("destroyed", function() {
        this.log("Component was destroyed: " + this.id);
 });
 ````

 Or get notification of destruction of any Component within its {{#crossLink "Scene"}}{{#crossLink}}, indiscriminately:

 ```` javascript
 scene.on("componentDestroyed", function(component) {
        this.log("Component was destroyed: " + component.id);
 });
 ````

 Then destroy a component like this:

 ```` javascript
 material.destroy();
 ````

 Other Components that are linked to it will fall back on a default of some sort. For example, any
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that were linked to our {{#crossLink "Material"}}{{/crossLink}}
 will then automatically link to the {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/material:property"}}{{/crossLink}}.

 @class Component
 @module XEO
 @constructor
 @param {Scene} [parent] Parent {Scene}.
 @param {Object} cfg Configs for this component
 */
XEO.Component = function () {

    /**
     The parent {{#crossLink "Scene"}}{{/crossLink}} that contains this Component.

     @property scene
     @type {Scene}
     @final
     */

    var cfg = {};
    var arg1 = arguments[0];
    var arg2 = arguments[1];

    switch (arguments.length) {

        case 0:
            this.scene = XEO.scene; // Default Scene
            this._renderer = this.scene._renderer;
            break;

        case 1:
            if (arg1.type == "scene") {
                this.scene = arg1;
                this._renderer = this.scene._renderer;
            } else {
                this.scene = XEO.scene; // Default Scene
                this._renderer = this.scene._renderer;
                cfg = arg1;
            }
            break;

        case 2:
            this.scene = arg1;
            cfg = arg2;
            break;
    }

    /**
     Metadata on this component.

     Fires a {{#crossLink "Component/metadata:event"}}{{/crossLink}} event on this Component when changed.

     @property metadata
     @type Object
     */
    this.metadata = cfg.metadata || {};


    /**
     JavaScript class name for this Component.

     For example: "XEO.AmbientLight", "XEO.ColorTarget", "XEO.Lights" etc.

     @property className
     @type String
     @final
     */
    this.className = cfg.className;


    /**
     Type code for this Component.

     For example: "ambientLight", "colorTarget", "lights" etc.

     @property type
     @type String
     @final
     @public
     */
    this.type = cfg.type || "component";


    /**
     Unique ID for this Component within its parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

     @property id
     @type String
     @final
     */
    this.id = cfg.id;

    /**
     True as soon as this Component has been destroyed

     @property destroyed
     @type Boolean
     */
    this.destroyed = false;


    // Child components, one of each type
    this._children = {};

    // Subscriptions for child component destructions
    this._childDestroySubs = {};

    // Subscriptions to child components needing recompilation
    this._childDirtySubs = {};

    // Pub/sub
    this._handleMap = new XEO.utils.Map(); // Subscription handle pool
    this._locSubs = {}; // A [handle -> callback] map for each location name
    this._handleLocs = {}; // Maps handles to loc names
    this.props = {}; // Maps locations to publications

    // Unique state ID
    var stateId = XEO.Component._stateIDMap.addItem({});

    // State core
    this._core = {
        type: this.type, // Core type
        stateId: stateId, // GL state ID
        hash: "" + stateId // Default state hash
    };

    // Initialize
    if (this._init) {
        this._init(cfg);
    }

    if (this.scene) {
        // Register this component on its scene
        // Assigns this component an automatic ID if not yet assigned
        this.scene._addComponent(this);
    }
};

XEO.Component._stateIDMap = new XEO.utils.Map({});

/**
 * Initializes this component
 * @param cfg
 * @private
 */
XEO.Component.prototype._init = function (cfg) {
};

/**
 * Fires an event on this component.
 *
 * Notifies existing subscribers to the event, retains the event to give to
 * any subsequent notifications on that location as they are made.
 *
 * @method fire
 * @param {String} event The event type name
 * @param {GameObject} value The event
 * @param {Boolean} [forget=false] When true, does not retain for subsequent subscribers
 */
XEO.Component.prototype.fire = function (event, value, forget) {
    if (forget !== true) {
        this.props[event] = value; // Save notification
    }
    var subsForLoc = this._locSubs[event];
    if (subsForLoc) { // Notify subscriptions
        for (var handle in subsForLoc) {
            if (subsForLoc.hasOwnProperty(handle)) {
                subsForLoc[handle].call(this, value);
            }
        }
    }
};

/**
 * Subscribes to an event on this component.
 *
 * This is the primary way to read data from SceneHub. Your callback will be triggered for
 * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
 *
 * The callback is be called with this component as scope.
 *
 * @method on
 * @param {String} event Publication event
 * @param {Function} callback Called when fresh data is available at the event
 * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
 */
XEO.Component.prototype.on = function (event, callback) {
    var subsForLoc = this._locSubs[event];
    if (!subsForLoc) {
        subsForLoc = {};
        this._locSubs[event] = subsForLoc;
    }
    var handle = this._handleMap.addItem(); // Create unique handle
    subsForLoc[handle] = callback;
    this._handleLocs[handle] = event;
    var value = this.props[event];
    if (value) { // A publication exists, notify callback immediately
        callback.call(this, value);
    }
    return handle;
};

/**
 * Cancels an event subscription that was previously made with {{#crossLink "Component/on:method"}}{{/crossLink}} or
 * {{#crossLink "Component/once:method"}}{{/crossLink}}.
 *
 * @method off
 * @param {String} handle Publication handle
 */
XEO.Component.prototype.off = function (handle) {
    var event = this._handleLocs[handle];
    if (event) {
        delete this._handleLocs[handle];
        var locSubs = this._locSubs[event];
        if (locSubs) {
            delete locSubs[handle];
        }
        this._handleMap.removeItem(handle); // Release handle
    }
};

/**
 * Subscribes to the next occurrence of the given event, then un-subscribes as soon as the event is handled.
 *
 * This is equivalent to calling {{#crossLink "Component/on:method"}}{{/crossLink}}, and then calling
 * {{#crossLink "Component/off:method"}}{{/crossLink}} inside the callback function.
 *
 * @method once
 * @param {String} event Data event to listen to
 * @param {Function(data)} callback Called when fresh data is available at the event
 */
XEO.Component.prototype.once = function (event, callback) {
    var self = this;
    var handle = this.on(event,
        function (value) {
            self.off(handle);
            callback(value);
        });
};

/**
 * Logs a console debugging message for this component.
 *
 * The console message will have this format: *````[LOG] <component id>: <message>````*
 *
 * Also fires the message as a {{#crossLink "Scene/log:event"}}{{/crossLink}} event on the
 * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 *
 * @method log
 * @param {String} message The message to log
 */
XEO.Component.prototype.log = function (message) {
    console.log("[LOG] " + this.id + ": " + message);

    this.scene.fire("log", message);
};

/**
 * Logs an error for this component to the JavaScript console.
 *
 * The console message will have this format: *````[ERROR] <component id>: <message>````*
 *
 * Also fires the message as an {{#crossLink "Scene/error:event"}}{{/crossLink}} event on the
 * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 *
 * @method error
 * @param {String} message The message to log
 */
XEO.Component.prototype.error = function (message) {
    console.error("[ERROR] " + this.id + ": " + message);

    this.scene.fire("error", message);
};

/**
 * Logs a warning for this component to the JavaScript console.
 *
 * The console message will have this format: *````[WARN] <component id>: <message>````*
 *
 * Also fires the message as a {{#crossLink "Scene/warn:event"}}{{/crossLink}} event on the
 * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 *
 * @method warn
 * @param {String} message The message to log
 */
XEO.Component.prototype.warn = function (message) {
    console.warn("[WARN] " + this.id + ": " + message);

    this.scene.fire("warn", message);
};

/**
 * Adds a child component to this.
 * When component not given, attaches the scene's default instance for the given type.
 * Publishes the new child component on this component, keyed to the given type.
 *
 * @param {string} type component type
 * @param {Component} child The component
 * @private
 */
XEO.Component.prototype._setChild = function (type, child) {

    if (!child) {

        // No child given, fall back on default component class for the given type

        child = this.scene[type];

        if (!child) {
            this.error("Default component not found for type '" + type + "'");
            return;
        }

    } else {

        // Child ID or instance given

        if (XEO._isString(child)) {

            // Child ID given

            var id = child;

            child = this.scene.components[id];

            if (!child) {
                this.error("component not found for ID: '" + id + "'");
                return;
            }
        }

        if (!child.type || child.type != type) {
            this.error("Failed to add component '" + child.id + "' to object - component expected to be a '" + type + "' type");
            return;
        }
    }

    var oldChild = this._children[type];

    if (oldChild) { // child of given type already attached

        if (oldChild.id == child.id) { // Attempt to reattach same child
            return;
        }

        // Unsubscribe from old child's destruction

        oldChild.off(this._childDestroySubs[type]);
        oldChild.off(this._childDirtySubs[type]);
    }

    // Set and publish new child on this object

    this._children[type] = child;

    var self = this;

    // Bind destruct listener to new child to remove it from this one when destroyed
    this._childDestroySubs[type] = child.on("destroyed",
        function () {

            // child destroyed
            delete self._children[type];

            // Try to fall back on default child
            var defaultComponent = self.scene[type];
            if (child.id == defaultComponent.id) {

                // Old child was the default,
                // so publish null child and bail
                self.set(type, null);
                return;
            }

            // Set default child
            self._setChild(type, defaultComponent);

            // TODO: Flag object recompile
        });

    this._childDirtySubs[type] = child.on("dirty",
        function () {
            self.fire("dirty", true);
        });

    this.fire("dirty", true);

    this.set(type, child);
};


XEO.Component.prototype._compile = function () {
};

/**
 * Returns a JSON representation of this component
 * @return {{}} JSON representation, which can just be handed
 */
GameObject.defineProperty(XEO.Component.prototype, "json", {
    get: function () {
        // Return component's type-specific properties,
        // augmented with the base component properties
        var props = {
            id: this.id, // Only output user-defined IDs
            className: this.className,
            type: this.type,
            metadata: this.metadata
        };
        return this._getJSON ? XEO._apply(props, this._getJSON()) : props;
    }
});

/**
 * Destroys this component.
 *
 * Fires a {{#crossLink "Component/destroyed:event"}}{{/crossLink}} event on this Component.
 *
 * Automatically disassociates this component from other components, causing them to fall back on any
 * defaults that this component overrode on them.
 *
 * @method destroy
 */
XEO.Component.prototype.destroy = function () {

    // Unsubscribe from child components
    var child;
    for (var type in this._children) {
        if (this._children.hasOwnProperty(type)) {
            child = this._children[type];
            child.off(this._childDestroySubs[type]);
            child.off(this._childDirtySubs[type]);
        }
    }

    // Destroy state core
    XEO.Component._stateIDMap.removeItem(this._core.stateId);

    // Execute subclass behaviour
    if (this._destroy) {
        this._destroy();
    }

    /**
     * Fired when this Component is destroyed.
     * @event destroyed
     */

    this.fire("destroyed", this.destroyed = true);
};

XEO.Component.prototype._destroy = function () {
};


///**
// * Create a new component type
// * @param cfg
// * @returns {component}
// * @private
// */
//XEO.Component._extend = function (cfg) {
//    var claz = XEO.Component;
//    for (var key in cfg) {
//        claz.prototype[key] = key;
//    }
//    return claz;
//};

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {

    var initializing = false;
    var fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // Create a new Class that inherits from this class
    XEO.Component.extend = function (prop) {

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {

            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?

                (function (name, fn) {

                    return function () {

                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);

                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name])

                : prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();;"use strict";

/**
 An **AmbientLight** defines a light source of fixed intensity and color that affects all attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 equally.

 <ul>

 <li>AmbientLights are grouped, along with other light source types, within
 {{#crossLink "Lights"}}Lights{{/crossLink}} components, which are attached to {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Within xeoEngine's Phong shading calculations, AmbientLight {{#crossLink "AmbientLight/ambient:property"}}ambient{{/crossLink}} is
 multiplied by {{#crossLink "Material"}}Material{{/crossLink}} {{#crossLink "Material/ambient:property"}}{{/crossLink}}.</li>

 <li>Ambient lighting may be toggled for specific {{#crossLink "GameObject"}}GameObjects{{/crossLink}} via
 the {{#crossLink "Modes/ambient:property"}}{{/crossLink}} property on attached {{#crossLink "Modes"}}{{/crossLink}} components.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7092465/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "Material"}}{{/crossLink}},</li>
 <li>an AmbientLight,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing the AmbientLight,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    diffuse: [1, 1, 1],
    specular: [1.1, 1],
    shininess: 30
 });

 // Within xeoEngine's lighting calculations, the AmbientLight's
 // ambient color will be multiplied by the Material's ambient color

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight
    ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});

 ````

 As with all components, we can observe and change properties on AmbientLights like so:

 ````Javascript

 var handle = ambientLight.on("ambient", // Attach a change listener to a property
 function(value) {
        // Property value has changed
    });

 ambientLight.ambient = [0.6, 0.6, 0.6]; // Fires the change listener

 ambientLight.off(handle); // Detach the change listener
 ````

 @class AmbientLight
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this AmbientLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} AmbientLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AmbientLight.
 @param [cfg.ambient=[0.7, 0.7, 0.8]] {Array(Number)} The color of this AmbientLight.
 @extends Component
 */
XEO.AmbientLight = XEO.Component.extend({

    className: "XEO.AmbientLight",

    type: "light",

    _init: function (cfg) {
        this.mode = "ambient";
        this.ambient = cfg.ambient;
    },

    /**
     The color of this AmbientLight.

     Fires an {{#crossLink "AmbientLight/ambient:event"}}{{/crossLink}} event on change.

     @property ambient
     @default [0.7, 0.7, 0.8]
     @type Array(Number)
     */
    set ambient(value) {
        value = value || [ 0.7, 0.7, 0.8 ];
        this._core.ambient = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this AmbientLight's {{#crossLink "AmbientLight/ambient:property"}}{{/crossLink}} property changes.

         @event ambient
         @param value The property's new value
         */
        this.fire("ambient", value);
    },

    get ambient() {
        return this._core.ambient;
    },

    _getJSON: function () {
        return {
            color: this.color
        };
    }
});

;"use strict";

/**
 A **Camera** component defines a viewpoint on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li> A Camera is composed of a viewing transform and a projection transform.</li>

 <li>The viewing transform may be a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.</li>

 <li>The projection transform may be an {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}}
 or {{#crossLink "Perspective"}}Perspective{{/crossLink}}.</li>

 <li> By default, each Camera gets its parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}},
 which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}, and default
 {{#crossLink "Scene/project:property"}}{{/crossLink}}, which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
 You would override those with your own transform components as necessary.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6891059/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "Lookat"}}{{/crossLink}} view transform,</li>
 <li>a {{#crossLink "Perspective"}}{{/crossLink}} projection transform,</li>
 <li>a Camera attached to the {{#crossLink "Lookat"}}{{/crossLink}} and {{#crossLink "Perspective"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>


 ```` javascript
 var scene = new XEO.Scene();

 var lookat = new XEO.Lookat(scene, {
    eye: [0,0,-10],
    look: [0,0,0],
    up: [0,1,0]
 });

 var perspective = new XEO.Lookat(scene, {
    fovy: 60,
    near: 0.1,
    far: 1000
 });

 var camera = new XEO.Camera(scene, {
    view: lookat,
    project: perspective
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 ````
 @class Camera
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Camera within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Camera by ID within its parent {{#crossLink "Scene"}}Scene{{/crossLink}} later.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Camera.
 @param [cfg.view] {String|XEO.Lookat} ID or instance of a view transform within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/view:property"}}{{/crossLink}},
 which is a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
 @param [cfg.project] {String|XEO.Perspective|XEO.Ortho|XEO.Frustum} ID or instance of a projection transform
 within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}. Defaults to the parent
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/project:property"}}{{/crossLink}},
 which is a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
 @extends Component
 */
XEO.Camera = XEO.Component.extend({

    className: "XEO.Camera",

    type: "camera",

    _init: function (cfg) {
        this.project = cfg.project;
        this.view = cfg.view;
    },

    /**
     * The projection transform for this Camera.
     *
     * When set to a null or undefined value, will default to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
     * default {{#crossLink "Scene/project:property"}}project{{/crossLink}}, which is
     * a {{#crossLink "Perspective"}}Perspective{{/crossLink}}.
     *
     * Fires a {{#crossLink "Camera/project:event"}}{{/crossLink}} event on change.
     *
     * @property project
     * @type Perspective|XEO.Ortho|XEO.Frustum
     */
    set project(value) {

        /**
         * Fired whenever this Camera's {{#crossLink "Camera/project:property"}}{{/crossLink}} property changes.
         * @event project
         * @param value The property's new value
         */
        this._setChild("project", value);
    },

    get project() {
        return this._children.project;
    },

    /**
     * The viewing transform for this Camera.
     *
     * When set to a null or undefined value, will default to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
     * default {{#crossLink "Scene/view:property"}}view{{/crossLink}}, which is
     * a {{#crossLink "Lookat"}}Lookat{{/crossLink}}.
     *
     * Fires a {{#crossLink "Camera/view:event"}}{{/crossLink}} event on change.
     *
     * @property view
     * @type Lookat
     */
    set view(value) {

        /**
         * Fired whenever this Camera's {{#crossLink "Camera/view:property"}}{{/crossLink}} property changes.
         *
         * @event view
         * @param value The property's new value
         */
        this._setChild("view", value);
    },

    get view() {
        return this._children.view;
    },

    _compile: function () {
        this._children.project._compile();
        this._children.view._compile();
    },

    _getJSON: function () {
        return {
            project: this.project.id,
            view: this.view.id
        };
    }
});

XEO.Scene.prototype.newCamera = function (cfg) {
    return new XEO.Camera(this, cfg);
};
;"use strict";

/**
 Manages a {{#crossLink "Scene"}}Scene{{/crossLink}}'s HTML canvas and its WebGL context.

 <ul>

 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Canvas as a final property on itself.</li>

 <li>When a {{#crossLink "Scene"}}Scene{{/crossLink}} is configured with the ID of
 a <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a> that already
 exists in the document, then the Canvas will bind to that, otherwise the Canvas will automatically create its own.</li>

 <li>A Canvas will fire a {{#crossLink "Canvas/resized:event"}}{{/crossLink}} event whenever
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a> resizes.</li>

 <li>A Canvas is responsible for obtaining a WebGL context from
 the <a href="http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element">HTMLCanvasElement</a>.</li>

 <li>A Canvas also fires a {{#crossLink "Canvas/webglContextLost:event"}}{{/crossLink}} event when the WebGL context is
 lost, and a {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} when it is restored again.</li>

 <li>The various components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}} will transparently recover on
 the {{#crossLink "Canvas/webglContextRestored:event"}}{{/crossLink}} event.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7103211/L.png"></img>

 ### Example

 In the example below, we're creating a {{#crossLink "Scene"}}Scene{{/crossLink}} without specifying an HTML canvas element
 for it. This causes the {{#crossLink "Scene"}}Scene{{/crossLink}}'s Canvas component to create its own default element
 within the page. Then we subscribe to various events fired by that Canvas component.

 ```` javascript
 // Create a Scene
 var scene = new XEO.Scene();

 // Get the Canvas off the Scene
 // Since we did not configure the Scene with the ID of a DOM canvas element,
 // the Canvas will create its own canvas element in the DOM
 var canvas = scene.canvas;

 // Get the WebGL context off the Canvas
 var gl = canvas.gl;

 // Subscribe to Canvas resize events
 canvas.on("resize", function(e) {
      var width = e.width;
      var height = e.height;
      var aspect = e.aspect;
      //...
  });

 // Subscribe to WebGL context loss events on the Canvas
 canvas.on("webglContextLost", function() {
       //...
  });

 // Subscribe to WebGL context restored events on the Canvas
 canvas.on("webglContextRestored", function(gl) {
       var newContext = gl;
       //...
  });

 ````

 When we want to bind the Canvas to an existing HTML canvas element, pass the element's ID into the
 {{#crossLink "Scene"}}Scene{{/crossLink}} like this:

 ```` javascript
 // Create a Scene, this time configuting it with the
 // ID of an existing DOM canvas element
 var scene = new XEO.Scene({
       canvasId: "myCanvas"
  });

 // ..and the rest of this example can be the same as the previous example.

 ````
 @class Canvas
 @module XEO
 @static
 @param {Scene} scene Parent scene
 @extends Component
 */
XEO.Canvas = XEO.Component.extend({

    className: "XEO.Canvas",

    type: "canvas",

    /**
     * Names of recognised WebGL contexts
     */
    _WEBGL_CONTEXT_NAMES: [
        "webgl",
        "experimental-webgl",
        "webkit-3d",
        "moz-webgl",
        "moz-glweb20"
    ],

    _init: function (cfg) {

        /**
         * The HTML canvas. When this XEO.Canvas was configured with the ID of an existing canvas within the DOM,
         * this property will be that element, otherwise it will be a full-page canvas that this Canvas has
         * created by default.
         * @property canvas
         * @type {HTMLCanvasElement}
         * @final
         */
        this.canvas = null;

        /**
         * The WebGL rendering context, obtained by this Canvas from the HTML 5 canvas.
         * @property gl
         * @type {WebGLRenderingContext}
         * @final
         */
        this.gl = null;

        /**
         * Attributes for the WebGL context
         *
         * @type {{}|*}
         */
        this.contextAttr = cfg.contextAttr || {};

        if (!cfg.canvas) {

            // Canvas not supplied, create one automatically

            this._createCanvas();

        } else {

            // Canvas supplied

            if (XEO._isString(cfg.canvas)) {

                // Canvas ID supplied - find the canvas

                this.canvas = document.getElementById(cfg.canvas);

                if (!this.canvas) {

                    // Canvas not found - create one automatically

                    this.error("Canvas element not found: '" + cfg.canvas + "' - creating one automatically.");
                    this._createCanvas();
                }

            } else {

                this.error("Config 'canvasId' should be a string.");
            }
        }

        if (!this.canvas) {
            return;
        }

        // If the canvas uses css styles to specify the sizes make sure the basic
        // width and height attributes match or the WebGL context will use 300 x 150

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Get WebGL context

        this._initWebGL();

        // Bind context loss and recovery handlers

        var self = this;

        this.canvas.addEventListener("webglcontextlost",
            function () {

                /**
                 * Fired wheneber the WebGL context has been lost
                 * @event webglContextLost
                 */
                self.fire("webglContextLost")
            },
            false);

        this.canvas.addEventListener("webglcontextrestored",
            function () {
                self._initWebGL();
                if (self.gl) {

                    /**
                     * Fired whenever the WebGL context has been restored again after having previously being lost
                     * @event webglContextRestored
                     * @param value The WebGL context object
                     */
                    self.fire("webglContextRestored", self.gl);
                }
            },
            false);

        // Publish canvas size changes on each scene tick

        var lastWidth = this.canvas.width;
        var lastHeight = this.canvas.height;
        this._tick = this.scene.on("tick",
            function () {
                var canvas = self.canvas;
                if (canvas.width != lastWidth || canvas.height != lastHeight) {
                    lastWidth = canvas.width;
                    lastHeight = canvas.height;

                    /**
                     * Fired whenever the canvas has resized
                     * @event resized
                     * @param width {Number} The new canvas width
                     * @param height {Number} The new canvas height
                     * @param aspect {Number} The new canvas aspect ratio
                     */
                    self.fire("resized", {
                        width: canvas.width,
                        height: canvas.height,
                        aspect: canvas.height / canvas.width
                    });
                }
            });
    },

    /**
     * Attempts to pick a {{#crossLink "GameObject"}}GameObject{{/crossLink}} at the given Canvas-space coordinates within the
     * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
     *
     * Ignores {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that are attached
     * to either a {{#crossLink "Stage"}}Stage{{/crossLink}} with {{#crossLink "Stage/pickable:property"}}pickable{{/crossLink}}
     * set *false* or a {{#crossLink "Modes"}}Modes{{/crossLink}} with {{#crossLink "Modes/picking:property"}}picking{{/crossLink}} set *false*.
     *
     * On success, will fire a {{#crossLink "Canvas/picked:event"}}{{/crossLink}} event on this Canvas, along with
     * a separate {{#crossLink "GameObject/picked:event"}}{{/crossLink}} event on the target {{#crossLink "GameObject"}}GameObject{{/crossLink}}.
     *
     * @method pick
     * @param {Number} canvasX X-axis Canvas coordinate.
     * @param {Number} canvasY Y-axis Canvas coordinate.
     * @param {*} [options] Pick options.
     * @param {Boolean} [options.rayPick=false] Whether to perform a 3D ray-intersect pick.
     */
    pick: function (canvasX, canvasY, options) {

        /**
         * Fired whenever the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method succeeds in picking
         * a {{#crossLink "GameObject"}}GameObject{{/crossLink}} in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         * @event picked
         * @param {String} objectId The ID of the picked {{#crossLink "GameObject"}}GameObject{{/crossLink}} within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
         * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
         */
    },

    /**
     * Creates a canvas
     * @private
     */
    _createCanvas: function () {
        var canvasId = "canvas-" + this.id;
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.height = "100%";
        style.width = "100%";
        style.padding = "0";
        style.margin = "0";
        style.left = "0";
        style.top = "0";
        style.position = "absolute";
        // style["z-index"] = "10000";
        div.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; margin: 0; padding: 0;"></canvas>';
        body.appendChild(div);
        this.canvas = document.getElementById(canvasId);
    },

    /**
     * Initialises the WebGL context
     */
    _initWebGL: function () {
        for (var i = 0; !this.gl && i < this._WEBGL_CONTEXT_NAMES.length; i++) {
            try {
                this.gl = this.canvas.getContext(this._WEBGL_CONTEXT_NAMES[i], this.contextAttr);
            } catch (e) { // Try with next context name
            }
        }
        if (!this.gl) {
            this.error('Failed to get a WebGL context');

            /**
             * Fired whenever the canvas failed to get a WebGL context, which probably means that WebGL
             * is either unsupported or has been disabled.
             * @event webglContextFailed
             */
            this.fire("webglContextFailed", true, true);
        }
    },

    _destroy: function () {
        this.scene.off(this._tick);
    }
});
;"use strict";

/**
 A **Clip** is an arbitrarily-aligned World-space clip plane.

 <ul>

 <li>These are grouped within {{#crossLink "Clips"}}Clips{{/crossLink}} components, which are attached to
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. See the {{#crossLink "Clips"}}Clips{{/crossLink}} documentation
 for a usage example.</li>

 <li>A Clip is specified in World-space, as being perpendicular to a vector {{#crossLink "Clip/dir:property"}}{{/crossLink}}
 that emanates from the origin, offset at a distance {{#crossLink "Clip/dist:property"}}{{/crossLink}} along that vector. </li>

 <li>You can move a Clip back and forth along its vector by varying {{#crossLink "Clip/dist:property"}}{{/crossLink}}.</li>

 <li>Likewise, you can rotate a Clip about the origin by rotating {{#crossLink "Clip/dir:property"}}{{/crossLink}}.</li>

 <li>A Clip is has a {{#crossLink "Clip/mode:property"}}{{/crossLink}},  which indicates whether it is disabled
 ("disabled"), discarding fragments that fall on the origin-side of the plane ("inside"), or clipping fragments that
 fall on the other side of the plane from the origin ("outside").</li>

 <li>You can update the {{#crossLink "Clip/mode:property"}}{{/crossLink}} of a Clip to activate or deactivate it, or to
 switch which side it discards fragments from.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096963/L.png"></img>

 @class Clip
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Clip in the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Clip configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Clip by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clip.
 @param [cfg.mode="disabled"] {String} Clipping mode - "disabled" to clip nothing, "inside" to reject points inside the plane, "outside" to reject points outside the plane.
 @param [dir= [1, 0, 0]] {Array of Number} The direction of the clipping plane from the World-space origin.
 @param [dist=1.0] {Number} Distance to the clipping plane along the direction vector.

 @extends Component
 */
XEO.Clip = XEO.Component.extend({

    className: "XEO.Clip",

    type: "clip",

    _init: function (cfg) {
        this.mode = cfg.mode;
        this.dir = cfg.dir;
        this.dist = cfg.dist;
    },

    /**
     The current mode of this Clip.

     Possible states are:

     <ul>
     <li>"disabled" - inactive</li>
     <li>"inside" - clipping fragments that fall within the half-space on the origin-side of the Clip plane</li>
     <li>"outside" - clipping fragments that fall on the other side of the Clip plane from the origin</li>
     </ul>

     Fires a {{#crossLink "Clip/mode:event"}}{{/crossLink}} event on change.

     @property mode
     @default "disabled"
     @type String
     */
    set mode(value) {
        value = value || "disabled";
        this._core.mode = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this Clip's {{#crossLink "Clip/mode:property"}}{{/crossLink}} property changes.

          @event mode
          @param value {String} The property's new value
         */
        this.fire("mode", value);
    },

    get mode() {
        return this._core.mode;
    },

    /**
     A vector emanating from the World-space origin that indicates the orientation of this Clip plane.

     The Clip plane will be oriented perpendicular to this vector.

     Fires a {{#crossLink "Clip/dir:event"}}{{/crossLink}} event on change.

     @property dir
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set dir(value) {
        value = value || [1, 0, 0];
        this._core.dir = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this Clip's {{#crossLink "Clip/dir:property"}}{{/crossLink}} property changes.

          @event dir
          @param  value  {Array(Number)} The property's new value
         */
        this.fire("dir", value);
    },

    get dir() {
        return this._core.dir;
    },

    /**
     The position of this Clip along the vector indicated by {{#crossLink "Clip/dir:property"}}{{/crossLink}}.

     This is the distance of the Clip plane from the World-space origin.

     Fires a {{#crossLink "Clip/dist:event"}}{{/crossLink}} event on change.

     @property dist
     @default 1.0
     @type Number
     */
    set dist(value) {
        value = value != undefined ? value : 1.0;
        this._core.dist = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this Clip's {{#crossLink "Clip/dist:property"}}{{/crossLink}} property changes.

          @event dist
          @param  value Number The property's new value
         */
        this.fire("dist", value);
    },

    get dist() {
        return this._core.dist;
    },

    _getJSON: function () {
        return {
            mode: this.mode,
            dir: this.dir,
            dist: this.dist
        };
    }
});

;"use strict";

/**
 A **Clips** is a group of arbitrarily-aligned {{#crossLink "Clip"}}Clip{{/crossLink}} planes that clip fragments of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>Each {{#crossLink "Clip"}}Clip{{/crossLink}} is specified in World-space, as being perpendicular to a vector
 {{#crossLink "Clip/dir:property"}}{{/crossLink}} that emanates from the origin, offset at a
 distance {{#crossLink "Clip/dist:property"}}{{/crossLink}} along that vector. </li>

 <li>You can move each {{#crossLink "Clip"}}Clip{{/crossLink}} back and forth along its vector by varying
 its {{#crossLink "Clip/dist:property"}}{{/crossLink}}.</li>

 <li>Likewise, you can rotate each {{#crossLink "Clip"}}Clip{{/crossLink}} about the origin by rotating
 its {{#crossLink "Clip/dir:property"}}{{/crossLink}}.</li>

 <li>Each {{#crossLink "Clip"}}Clip{{/crossLink}} is has a {{#crossLink "Clip/mode:property"}}{{/crossLink}}, which indicates whether it is disabled ("disabled"), discarding fragments that fall on the origin-side of the plane ("inside"), or clipping fragments that fall on the other side of the plane from the origin ("outside").</li>

 <li>You can update each {{#crossLink "Clip"}}Clip{{/crossLink}}'s {{#crossLink "Clip/mode:property"}}{{/crossLink}} to
 activate or deactivate it, or to switch which side it discards fragments from.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6890347/L.png"></img>

 ### Example

 <ul>

 <li>The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that's clipped by a {{#crossLink "Clips"}}{{/crossLink}}
 that contains two {{#crossLink "Clip"}}{{/crossLink}} planes.</li>

 <li>The first {{#crossLink "Clip"}}{{/crossLink}} plane is on the
 positive diagonal, while the second is on the negative diagonal.</li>

 <li>The {{#crossLink "GameObject"}}GameObject's{{/crossLink}}
 {{#crossLink "Geometry"}}{{/crossLink}} is the default 2x2x2 box, and the planes will clip off two of the box's corners.</li>

 </ul>

 ````javascript
 var scene = new XEO.Scene();

 // Clip plane on negative diagonal
 var clip1 = new XEO.Clip(scene, {
       dir: [-1.0, -1.0, -1.0], // Direction of Clip from World space origin
       dist: 2.0,               // Distance along direction vector
       mode: "outside"          // Clip fragments that fall beyond the plane
 });

 // Clip plane on positive diagonal
 var clip2 = new XEO.Clip(scene, {
      dir: [1.0, 1.0, 1.0],
      dist: 2.0,
      mode: "outside"
  });

 // Group the planes in a Clips
 var clips = new XEO.Clip(scene, {
       clips: [
            clip1,
            clip2
        ]
  });

 // Geometry defaults to a 2x2x2 box
 var geometry = new XEO.Geometry(scene);

 // Create an GameObject, which is a box sliced by our clip planes
 var object = new XEO.GameObject(scene, {
       clips: clips,
       geometry: geometry
   });

 // Subscribe to change of a clip plane's distance
 clip1.on("dist",
 function(value) {
        // Property value has changed
    });

 // Subscribe to change of a clip plane's direction
 clip2.on("dir",
 function(dir) {
        // Property value has changed
    });

 // Set a clip plane's distance, firing the first change handler
 clip1.dist = 3.0;

 // Set a clip plane's direction, firing the second change handler
 clip1.dir = [1.0, -1.0, -1.0];

 // When we destroy a Clip, it gets automatically removed from its Clips
 clip1.destroy();

 // When we destroy a Clips, the GameObject will fall back on the Scene's default (empty) Clips
 clips.destroy();
 ````

 @class Clips
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Clips in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clips.
 @param [cfg.clips] {Array(String)|Array(XEO.Clip)} Array containing either IDs or instances of
 {{#crossLink "Clip"}}Clip{{/crossLink}} components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @extends Component
 */
XEO.Clips = XEO.Component.extend({

    className: "XEO.Clips",

    type: "clips",

    _init: function (cfg) {

        this._clips = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        this.clips = cfg.clips;
    },

    /**
     * The clipping planes contained within this Clips.
     *
     * Fires a {{#crossLink "Clips/clips:event"}}{{/crossLink}} event on change.
     *
     * @property clips
     * @default []
     * @type Array(XEO.Clip)
     */
    set clips(value) {

        var clip;

        // Unsubscribe from events on old clips        
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clip = this._clips[i];
            clip.off(this._dirtySubs[i]);
            clip.off(this._destroyedSubs[i]);
        }

        this._clips = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        var clips = [];
        var self = this;

        for (var i = 0, len = value.length; i < len; i++) {

            clip = value[i];

            if (XEO._isString(clip)) {

                // ID given for clip - find the clip component

                var id = clip;
                clip = this.components[id];
                if (!clip) {
                    this.error("Clip not found for ID: '" + id + "'");
                    continue;
                }
            }

            if (clip.type != "clip") {
                this.error("Component is not a clip: '" + clip.id + "'");
                continue;
            }

            this._clips.push(clip);

            this._dirtySubs.push(clip.on("dirty",
                function () {
                    self.fire("dirty", true);
                }));

            this._destroyedSubs.push(clip.on("destroyed",
                function () {
                    var id = this.id; // Clip ID
                    for (var i = 0, len = self._clips.length; i < len; i++) {
                        if (self._clips[i].id == id) {
                            self._clips = self._clips.slice(i, i + 1);
                            self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                            self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);
                            self.fire("dirty", true);
                            self.fire("clips", self._clips);
                            return;
                        }
                    }
                }));

            clips.push(clip);
        }

        /**
         Fired whenever this Clips' {{#crossLink "Clips/clips:property"}}{{/crossLink}} property changes.
         @event clips
         @param value {Array of XEO.Clip} The property's new value
         */
        this.fire("dirty", true);
        this.fire("clips", this._clips);
    },

    get clips() {
        return this._clips.slice(0, this._clips.length);
    },

    _compile: function () {
        var clips = [];
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clips.push(this._clips[i]._core)
        }
        var core = {
            type: "clips",
            clips: clips,
            hash: this._makeHash(clips)
        };
        this._renderer.clips = core;
    },

    _makeHash: function (clips) {
        if (clips.length == 0) {
            return "";
        }
        var parts = [];
        var clip;
        for (var i = 0, len = clips.length; i < len; i++) {
            clip = clips[i];
            parts.push(clip.mode);
            if (clip.specular) {
                parts.push("s");
            }
            if (clip.diffuse) {
                parts.push("d");
            }
            parts.push((clip.space == "world") ? "w" : "v");
        }
        return parts.join("");
    },

    _getJSON: function () {
        var clipIds = [];
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clipIds.push(this._clips[i].id);
        }
        return {
            clips: clipIds
        };
    }
});;"use strict";

/**
 A **ColorBuf** configures the WebGL color buffer for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>A ColorBuf configures **the way** that pixels are written to the WebGL color buffer, and is not to be confused
 with {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, which holds the final pixel colors so that they may be
 fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7104987/L.png"></img>

 ### Example

 In the example below we're configuring the WebGL color buffer for a {{#crossLink "GameObject"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a ColorBuf that enables blending and sets the color mask,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var depthBuf = new XEO.ColorTarget(scene, {
     clearDepth: 0.5,
     depthFunc: "less"
 });

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var gameObject = new XEO.GameObject(scene, {
     depthBuf: depthBuf,
     geometry: geometry
 });
 ````

 @class ColorBuf
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorBuf within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorBuf.
 @param [cfg.blendEnabled=true] {Boolean} Indicates if blending is enabled.
 @param [cfg.colorMask=[true, true, true, true]] {Array of Boolean} The color mask,
 @extends Component
 */
XEO.ColorBuf = XEO.Component.extend({

    className: "XEO.ColorBuf",

    type: "colorbuf",

    _init: function (cfg) {
        this.blendEnabled = cfg.blendEnabled;
        this.colorMask = cfg.colorMask;
    },

    /**
     * Indicates if blending is enabled for this ColorBuf.
     *
     * Fires a {{#crossLink "ColorBuf/blendEnabled:event"}}{{/crossLink}} event on change.
     *
     * @property blendEnabled
     * @default true
     * @type Boolean
     */
    set blendEnabled(value) {
        value = value !== false;
        this._core.blendEnabled = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this ColorBuf's {{#crossLink "ColorBuf/blendEnabled:property"}}{{/crossLink}} property changes.

          @event blendEnabled
          @param value {Boolean} The property's new value
         */
        this.fire("blendEnabled", value);
    },

    get blendEnabled() {
        return this._core.blendEnabled;
    },

    /**
     * Specifies whether red, green, blue, and alpha can or cannot be written into the frame buffer.
     *
     * Fires a {{#crossLink "ColorBuf/colorMask:event"}}{{/crossLink}} event on change.
     *
     * @property colorMask
     * @default [true, true, true, true]
     * @type {Four element array of Boolean}
     */
    set colorMask(value) {
        value = value || [true, true, true, true];
        this._core.colorMask = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this ColorBuf's {{#crossLink "ColorBuf/colorMask:property"}}{{/crossLink}} property changes.

          @event colorMask
          @param value {Four element array of Boolean} The property's new value
         */
        this.fire("colorMask", value);
    },

    get colorMask() {
        return this._core.colorMask;
    },

    _compile: function () {
        this._renderer.colorBuf = this._core;
    },

    _getJSON: function () {
        return {
            blendEnabled: this.blendEnabled,
            colorMask: this.colorMask
        };
    }
});


;"use strict";

/**
 A **ColorTarget** captures rendered pixel colors of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>A ColorTarget provides the pixel colors as a dynamic color image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>ColorTarget is not to be confused with {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}}, which configures ***how*** the pixel colors are written with respect to the WebGL color buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a ColorTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use ColorTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "DepthTarget"}}DepthTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096829/L.png"></img>

 ### Example

 In the example below we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
 that's rendered to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied to a second {{#crossLink "GameObject"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a ColorTarget,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} pixel color values to the ColorTarget,</li>
 <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the ColorTarget,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
 <li>a second {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
 </ul>


 ````javascript
 var scene = new XEO.Scene();

 var colorTarget = new XEO.ColorTarget(scene);

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var firstGameObject = new XEO.GameObject(scene, {
       geometry: geometry,
       colorTarget: colorTarget
  });

 var texture = new XEO.Texture(scene, {
      target: colorTarget
  });

 var material = new XEO.Material(scene, {
       textures: [
           texture
       ]
  });

 var object2 = new XEO.GameObject(scene, {
       geometry: geometry,  // Reuse our simple box geometry
       material: material
   });
 ````

 @class ColorTarget
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this ColorTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} ColorTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ColorTarget.
 @extends Component
 */
XEO.ColorTarget = XEO.Component.extend({

    className: "XEO.ColorTarget",

    type: "renderBuf",

    // Map of  components to cores, for reallocation on WebGL context restore
    _componentCoreMap: {},

    _init: function (cfg) {
        this._core.bufType = "color";
        this._componentCoreMap[this._core.id] = this._core;
        this._core.renderBuf = new XEO.webgl.RenderBuffer({ canvas: this.scene.canvas });
    },

    _compile: function () {
        this._renderer.colorTarget = this._core;
    },

    _destroy: function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete this._componentCoreMap[this._core.id];
        }
    }
});


;"use strict";

/**
 Holds configuration properties for the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <ul>

 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Configs instance on itself.</li>

 <li>A Configs is just a plain {{#crossLink "Component"}}{{/crossLink}} with no extras.</li>

 <li>Config property values are set on a Configs using its {{#crossLink "Component/fire:method"}}{{/crossLink}} method,
 and may be subscribed to with {{#crossLink "Component/on:method"}}{{/crossLink}}.</li>

 <li>You can define your own properties in a Configs, but take care not to clobber those used by the
 {{#crossLink "Scene"}}{{/crossLink}} (see table below).</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7123181/L.png"></img>


 ### Configurations used by the Scene

 Don't use the following names for your own properties, because these are already used by xeoEngine:

 | Name  | Description  |
 |---|---|
 | foo  | foo property  |
 | bar  | bar property  |


 ### Example

 ````Javascript

 var scene = new XEO.Scene();

 var configs = scene.configs;

 // Subscribe to change of a Config property.
 // The subscriber is also immediately notified of the current value via the callback.
 configs.on("foo", function(value) {
       console.log("foo = " + value);
  });

 // Change a Configs property
 configs.fire("foo", "Hello!");

 // Read the current value of a Configs property.
 // Normally we would asynchronously subscribe with #on though, to be sure that
 // we're getting the latest changes to the property.
 var bar = configs.props["bar"];
 ````

 @class Configs
 @module XEO
 @constructor
 @param [scene] {Scene} Parent scene - creates this component in the default scene when omitted.
 @param {GameObject} [cfg]  Config values.
 @extends Component
 */
XEO.Configs = XEO.Component.extend({

    className: "XEO.Configs",

    type: "configs",

    _init: function (cfg) {
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                this.fire(key, cfg[key]);
            }
        }
    },

    _toJSON: function () {
        return  XEO._copy(this.props);
    }
});


;"use strict";

/**
  A **DepthMap** configures the WebGL depth buffer for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 A DepthBuf configures **the way** that pixel depths are written to the WebGL depth buffer, and is not to be confused
 with {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}}, which holds the final pixel depths as a color-encoded image
 so that they may be fed into depth {{#crossLink "Texture"}}Textures{{/crossLink}}.

  <img src="http://www.gliffy.com/go/publish/image/7104991/L.png"></img>

 ### Example

 In the example below we're configuring the WebGL depth buffer for a {{#crossLink "GameObject"}}{{/crossLink}}.

 The scene contains:

 <ul>
 <li>a DepthBuf that configures the clear depth and depth comparison function,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var depthBuf = new XEO.ColorTarget(scene, {
     clearDepth: 0.5,
     depthFunc: "less"
 });

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var gameObject = new XEO.GameObject(scene, {
     depthBuf: depthBuf,
     geometry: geometry
 });
 ````

 @class DepthBuf
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this DepthBuf
  within the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DepthBuf.
 @param [cfg.clearDepth=1.0] {Number} The clear depth.
 @param [cfg.depthFunc="less"] {String} The depth function.
 @extends Component
 */
XEO.DepthBuf = XEO.Component.extend({

    className: "XEO.DepthBuf",

    type: "DepthBuf",

    _init: function (cfg) {
        this.clearDepth = cfg.clearDepth;
        this.depthFunc = cfg.depthFunc;
    },

    /**
     * The clear depth for this DepthBuf.
     *
     * Fires a {{#crossLink "DepthBuf/clearDepth:event"}}{{/crossLink}} event on change.
     *
     * @property clearDepth
     * @default 1.0
     * @type Number
     */
    set clearDepth(value) {
        value = value != undefined ? value : 1.0;
        this._core.clearDepth = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this DepthBuf's {{#crossLink "DepthBuf/clearDepth:property"}}{{/crossLink}} property changes.

          @event clearDepth
          @param value {Number} The property's new value
         */
        this.fire("clearDepth", value);
    },

    get clearDepth() {
        return this._core.clearDepth;
    },

    /**
     * The depth function for this DepthBuf.
     *
     * Accepted values are:
     *
     * <ul>
     *     <li>"less"</li>
     *     <li>"equal"</li>
     *     <li>"lequal"</li>
     *     <li>"greater"</li>
     *     <li>"notequal"</li>
     *     <li>"gequal"</li>
     * </ul>
     *
     * Fires a {{#crossLink "DepthBuf/depthFunc:event"}}{{/crossLink}} event on change.
     *
     * @property depthFunc
     * @default "less"
     * @type Number
     */
    set depthFunc(value) {
        value = value || "less";
        var enumName = this._depthFuncNames[value];
        if (enumName == undefined) {
            this.error("unsupported value for 'clearFunc' attribute on depthBuf component: '" + value
                + "' - supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'");
            return;
        }
        this._core.depthFunc = this.scene.canvas.gl[enumName];
        this._core.depthFuncName = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this DepthBuf's {{#crossLink "DepthBuf/depthFunc:property"}}{{/crossLink}} property changes.
          @event depthFunc
          @param value {String} The property's new value
         */
        this.fire("depthFunc", value);
    },

    /**
     * Lookup GL depth function enums
     * @private
     */
    _depthFuncNames: {
        less: "LESS",
        equal: "EQUAL",
        lequal: "LEQUAL",
        greater: "GREATER",
        notequal: "NOTEQUAL",
        gequal: "GEQUAL"
    },

    get depthFunc() {
        return this._core.depthFuncName;
    },

    _compile: function () {
        this._renderer.depthBuf = this._core;
    },

    _getJSON: function () {
        return {
            clearDepth: this.clearDepth,
            depthFunc: this.depthFunc
        };
    }
});

;"use strict";

/**
 A **DepthTarget** captures the rendered pixel depths of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>A DepthTarget provides the pixel depths as a dynamic color-encoded image that may be fed into {{#crossLink "Texture"}}Textures{{/crossLink}}.</li>
 <li>DepthTarget is not to be confused with {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}}, which configures ***how*** the pixel depths are written with respect to the WebGL depth buffer.</li>
 <li>Use {{#crossLink "Stage"}}Stages{{/crossLink}} when you need to ensure that a DepthTarget is rendered before
 the {{#crossLink "Texture"}}Textures{{/crossLink}} that consume it.</li>
 <li>For special effects, we often use DepthTargets and {{#crossLink "Texture"}}Textures{{/crossLink}} in combination
 with {{#crossLink "ColorTarget"}}ColorTargets{{/crossLink}} and {{#crossLink "Shader"}}Shaders{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895849/L.png"></img>

 ### Example

 In the example below we essentially have one {{#crossLink "GameObject"}}{{/crossLink}}
 that renders its fragment depth values to a {{#crossLink "Texture"}}{{/crossLink}}, which is then applied
 to a second {{#crossLink "GameObject"}}{{/crossLink}}.


 The scene contains:

 <ul>
 <li>a DepthTarget,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape,
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}} fragment depth values to the DepthTarget,</li>
 <li>a {{#crossLink "Texture"}}{{/crossLink}} that sources its pixels from the DepthTarget,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} that includes the {{#crossLink "Texture"}}{{/crossLink}}, and</li>
 <li>a second {{#crossLink "GameObject"}}{{/crossLink}} that renders the {{#crossLink "Geometry"}}{{/crossLink}}, with the {{#crossLink "Material"}}{{/crossLink}} applied to it.</li>
 </ul>

 The pixel colours in the DepthTarget will be depths encoded into RGBA, so will look a little weird when applied directly to the second
 {{#crossLink "GameObject"}}{{/crossLink}} as a {{#crossLink "Texture"}}{{/crossLink}}. In practice the {{#crossLink "Texture"}}{{/crossLink}}
 would carry the depth values into a custom {{#crossLink "Shader"}}{{/crossLink}}, which would then be applied to the second {{#crossLink "GameObject"}}{{/crossLink}}.

 ````javascript
 var scene = new XEO.Scene();


 var geometry = new XEO.Geometry(scene); // Default to a 2x2x2 box.


 var depthTarget = new XEO.DepthTarget(scene);


 var object1 = new XEO.GameObject(scene, {
    depthTarget: depthTarget
 });

 var texture = new XEO.Texture(scene, {
    target: depthTarget
 });


 var material = new XEO.Material(scene, {
    textures: [
        texture
    ]
 });


 var object2 = new XEO.GameObject(scene, {
    geometry: geometry,  // Reuse our simple box geometry
    material: material
 });
 ````
 @class DepthTarget
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this DepthTarget within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthTarget configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DepthTarget.

 @extends Component
 */
XEO.DepthTarget = XEO.Component.extend({

    className: "XEO.DepthTarget",

    type: "renderBuf",

    // Map of  components to cores, for reallocation on WebGL context restore
    _componentCoreMap: {},

    _init: function (cfg) {

        this._core.bufType = "depth";
        this._componentCoreMap[this._core.coreId] = this._core;
        this._core.renderBuf = new XEO.webgl.RenderBuffer({ canvas: this.scene.canvas });
    },

    _compile: function (ctx) {
        this._renderer.depthTarget = this._core;
    },

    _destroy: function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete this._componentCoreMap[this._core.coreId];
        }
    }
});


;"use strict";

/**
 A **DirLight** is a light source that illuminates all attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally
 from a given direction.

 <ul>

 <li>DirLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Within xeoEngine's Phong lighting calculations, DirLight {{#crossLink "DirLight/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "DirLight/specular:property"}}{{/crossLink}} are multiplied by {{#crossLink "Material"}}Material{{/crossLink}}
 {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and {{#crossLink "Material/specular:property"}}{{/crossLink}},
 respectively.</li>

 <li>Diffuse, specular and ambient lighting may also be enabled or disabled for specific {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 via {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}, {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "Modes/ambient:property"}}{{/crossLink}} flags on {{#crossLink "Modes"}}Modes{{/crossLink}} components.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096639/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "material"}}{{/crossLink}},</li>
 <li>a DirLight,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing the DirLight,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        dirLight
    ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
 });
 ````

 As with all components, we can <a href="XEO.Component.html#changeEvents" class="crosslink">observe and change properties</a> on DirLights like so:

 ````Javascript

 var handle = dirLight.on("diffuse", // Attach a change listener to a property
 function(value) {
        // Property value has changed
    });

 dirLight.diffuse = [0.0, 0.3, 0.3]; // Fires the change listener

 dirLight.off(handle); // Detach the change listener
 ````

 @class DirLight
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this DirLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The DirLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this DirLight.
 @param [cfg.dir=[1.0, 1.0, 1.0]] {Array(Number)} A unit vector indicating the direction of illumination, given in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.diffuse=[0.7, 0.7, 0.8 ]] {Array(Number)} The diffuse color of this DirLight.
 @param [cfg.specular=[1.0, 1.0, 1.0 ]] {Array(Number)} The specular color of this DirLight.
 @param [cfg.space="view"] {String} The coordinate system the DirLight is defined in - "view" or "space".

 @extends Component
 */
XEO.DirLight = XEO.Component.extend({

    className: "XEO.DirLight",

    type: "light",

    _init: function (cfg) {

        this.mode = "dir";

        this._core.mode = this.mode;

        this.dir = cfg.dir;
        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.space = cfg.space;
    },

    /**
     The direction of this DirLight.

     Fires a {{#crossLink "DirLight/dir:event"}}{{/crossLink}} event on change.

     @property dir
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set dir(value) {
        value = value || [1.0, 1.0, 1.0 ];
        this._core.dir = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this DirLight's  {{#crossLink "DirLight/dir:property"}}{{/crossLink}} property changes.
         * @event dir
         * @param value The property's new value
         */
        this.fire("dir", value);
    },

    get dir() {
        return this._core.dir;
    },

    /**
     The diffuse color of this DirLight.

     Fires a {{#crossLink "DirLight/diffuse:event"}}{{/crossLink}} event on change.

     @property diffuse
     @default [0.7, 0.7, 0.8]
     @type Array(Number)
     */
    set diffuse(value) {
        value = value || [0.7, 0.7, 0.8 ];
        this._core.diffuse = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this DirLight's  {{#crossLink "DirLight/diffuse:property"}}{{/crossLink}} property changes.
         * @event diffuse
         * @param value The property's new value
         */
        this.fire("diffuse", value);
    },

    get diffuse() {
        return this._core.diffuse;
    },

    /**
     The specular color of this DirLight.

     Fires a {{#crossLink "DirLight/specular:event"}}{{/crossLink}} event on change.

     @property specular
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set specular(value) {
        value = value || [1.0, 1.0, 1.0 ];
        this._core.specular = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this DirLight's  {{#crossLink "DirLight/specular:property"}}{{/crossLink}} property changes.
         * @event specular
         * @param value The property's new value
         */
        this.fire("specular", value);
    },

    get specular() {
        return this._core.specular;
    },

    /**
     Specifies which coordinate space this DirLight is in.

     Supported values are:

     <ul>
     <li>"view" - View space, aligned within the view volume as if fixed to the viewer's head</li>
     <li>"world" - World space, fixed within the world, moving within the view volume with respect to camera</li>
     </ul>

     Fires a {{#crossLink "DirLight/space:event"}}{{/crossLink}} event on change.

     @property space
     @default "view"
     @type String
     */
    set space(value) {
        value = value || "view";
        if (value == this._core.space) {
            return;
        }
        this._core.space = value;
        this.fire("dirty", true); // Need to rebuild shader

        /**
         * Fired whenever this DirLight's {{#crossLink "DirLight/space:property"}}{{/crossLink}} property changes.
         * @event space
         * @param value The property's new value
         */
        this.fire("space", value);
    },

    get space() {
        return this._core.space;
    },

    _getJSON: function () {
        return {
            mode: this.mode,
            dir: this.dir,
            color: this.color,
            diffuse: this.diffuse,
            specular: this.specular,
            space: this.space
        };
    }
});

;"use strict";

/**
 A **Visibility** toggles the visibility of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>A Visibility may be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to toggle
 their visibility as a group.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7103687/L.png"></img>

 ### Example

 The following example creates a Visibility that toggles the visibility of
 two {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ````javascript
 // Create a scene
 var scene = new XEO.Scene();

 // Create a Visibility
 var visibility = new XEO.Visibility(scene, {
      visible: true
  });

 // Create two GameObjects whose visibility will be controlled by our Visibility

 var object1 = new XEO.GameObject(scene, {
       visibility: visibility
  });

 var object2 = new XEO.GameObject(scene, {
       visibility: visibility
  });

 // Subscribe to change on the Visibility's "visible" property
 var handle = visibility.on("visible", function(value) {
       //...
  });

 // Hide our GameObjects by flipping the Visibility's "visible" property,
 // which will also call our handler
 visibility.visible = false;

 // Unsubscribe from the Visibility again
 visibility.off(handle);

 // When we destroy our Visibility, the GameObjects will fall back
 // on the Scene's default Visibility instance
 visibility.destroy();
 ````
 @class Visibility
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Visibility in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Visibility.
 @param [cfg.visible=true] {Boolean} Flag which controls visibility of the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 @extends Component
 */
XEO.Visibility = XEO.Component.extend({

    className: "XEO.Visibility",

    type: "enable",

    _init: function (cfg) {
        this.visible = cfg.visible;
    },

    /**
      Indicates whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are visible or not.

      Fires a {{#crossLink "Visibility/visible:event"}}{{/crossLink}} event on change.

      @property visible
      @default true
      @type Boolean
     */
    set visible(value) {
        value = value !== false;
        this._core.visible = value;
        this._renderer.imageDirty = true;

        /**
          Fired whenever this Visibility's  {{#crossLink "Visibility/visible:property"}}{{/crossLink}} property changes.

          @event visible
          @param value {Boolean} The property's new value
         */
        this.fire("visible", value);
    },

    get visible() {
        return this._core.visible;
    },

    _compile: function () {
        this._renderer.enable = this._core;
    },

    _getJSON: function () {
        return {
            visible: this.visible
        };
    }
});



;"use strict";

/**
 A **Modes** toggles xeoEngine's rendering modes for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>Though the rendering modes are defined by various different components attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}},
 Modes components provide a single point through which you can toggle them on or off.</li>

 <li>A Modes may be shared among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to toggle
 rendering modes for them as a group.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7123073/L.png"></img>

 ### Example

 The following example creates a Modes that toggles rendering modes for
 two {{#crossLink "GameObject"}}GameObjects{{/crossLink}}. The properties of the Modes are initialised to their
 default values.

 ````javascript

 // Create a scene
 var scene = new XEO.Scene();

 // Create a Modes with default properties
 var modes = new XEO.Modes(scene, {
        picking: true,              // Enable picking
        clipping true,              // Enable effect of XEO.Clip components
        transparent : false,        // Disable transparency
        backfaces : true,           // Render backfaces
        frontface : "ccw",          // Frontfaces have counter-clockwise vertex
        backfaceLighting : true,    // Enable backface lighting
        backfaceTexturing : true,   // Enable backfaces texturing
        diffuse : true,             // Enable diffuse lighting
        specular : true,            // Enable specular lighting
        ambient : true,             // Enable ambient lighting
        reflection : true           // Enable reflections
  });

 // Create two GameObjects whose rendering modes will be controlled by our Modes

 var object1 = new XEO.GameObject(scene, {
       modes: modes
  });

 var object2 = new XEO.GameObject(scene, {
       modes: modes
  });

 // Subscribe to change on the Modes' "specular" property
 var handle = modes.on("specular", function(value) {
       //...
  });

 // Disable specular lighting on our GameObjects by flipping the Modes' "specular" property,
 // which will also call our handler
 modes.specular = false;

 // Unsubscribe from the Modes again
 modes.off(handle);

 // When we destroy our Modes, the GameObjects will fall back
 // on the Scene's default Modes instance
 modes.destroy();

 ````

 @class Modes
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Modes in the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Modes.
 @param [cfg.picking=true] {Boolean}  Whether to enable picking.
 @param [cfg.clipping=true] {Boolean} Whether to enable clipping by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.transparent=false] {Boolean} Whether to enable the transparency effect created by {{#crossLink "Material"}}Material{{/crossLink}}s when they have
 {{#crossLink "Material/opacity:property"}}{{/crossLink}} < 1.0. This mode will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
 transparency pass with blending enabled etc), while
 the {{#crossLink "Material/opacity:property"}}{{/crossLink}} will indicate the **degree** of their transparency
 (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).
 @param [cfg.backfaces=true] {Boolean} Whether to render {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces.
 @param [cfg.frontface="ccw"] {Boolean} The winding order for {{#crossLink "Geometry"}}Geometry{{/crossLink}} front faces - "cw" for clockwise, or "ccw" for counter-clockwise.
 @param [cfg.backfaceLighting=true] {Boolean} Whether to apply {{#crossLink "Lights"}}Lights{{/crossLink}} to {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces
 @param [cfg.backfaceTexturing=true] {Boolean} Whether to apply {{#crossLink "Texture"}}Textures{{/crossLink}} to {{#crossLink "Geometry"}}Geometry{{/crossLink}} backfaces
 @param [cfg.diffuse=true] {Boolean} Whether to enable diffuse contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
 @param [cfg.specular=true] {Boolean} Whether to enable specular contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
 @param [cfg.ambient=true] {Boolean} Whether to enable ambient contributions from {{#crossLink "Lights"}}Lights{{/crossLink}}
 @param [cfg.reflection=true] {Boolean} Whether to enable reflections created by {{#crossLink "Reflection"}}{{/crossLink}}s
 @extends Component
 */
XEO.Modes = XEO.Component.extend({

    className: "XEO.Modes",

    type: "modes",

    _init: function (cfg) {

        this.picking = cfg.picking;
        this.clipping = cfg.clipping;
        this.transparent = cfg.transparent;
        this.backfaces = cfg.backfaces;
        this.frontface = cfg.frontface;
        this.backfaceLighting = cfg.backfaceLighting;
        this.backfaceTexturing = cfg.backfaceTexturing;
        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.ambient = cfg.ambient;
        this.reflection = cfg.reflection;
    },

    /**
     Whether this Modes enables picking of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Picking is performed via calls to {{#crossLink "Canvas/pick:method"}}Canvas pick{{/crossLink}}.

     Fires a {{#crossLink "Modes/picking:event"}}{{/crossLink}} event on change.
     @property picking
     @default true
     @type Boolean
     */
    set picking(value) {
        value = value !== false;
        this._core.picking = value;
        this._renderer.drawListDirty = true;

        /**
         * Fired whenever this Modes'' {{#crossLink "Modes/picking:property"}}{{/crossLink}} property changes.
         * @event picking
         * @param value The property's new value
         */
        this.fire("picking", value);
    },

    get picking() {
        return this._core.picking;
    },

    /**
     Whether this Modes enables clipping of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Clipping is done by {{#crossLink "Clips"}}{{/crossLink}} that are also attached to
     the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/clipping:event"}}{{/crossLink}} event on change.

     @property clipping
     @default true
     @type Boolean
     */
    set clipping(value) {
        value = value !== false;
        this._core.clipping = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/clipping:property"}}{{/crossLink}} property changes.
         @event clipping
         @param value The property's new value
         */
        this.fire("clipping", value);
    },

    get clipping() {
        return this._core.clipping;
    },

    /**
     Whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are transparent.

     When true. this property will set attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} transparent (ie. to be rendered in a
     transparency pass with blending enabled etc), while
     the {{#crossLink "Material/opacity:property"}}{{/crossLink}} will be used to indicate the **degree** of their transparency
     (ie. where opacity of 0.0 indicates maximum translucency and opacity of 1.0 indicates minimum translucency).

     Fires a {{#crossLink "Modes/transparent:event"}}{{/crossLink}} event on change.

     @property transparent
     @default false
     @type Boolean
     */
    set transparent(value) {
        value = !!value;
        this._core.transparent = value;
        this._renderer.stateOrderDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/transparent:property"}}{{/crossLink}} property changes.
         @event transparent
         @param value The property's new value
         */
        this.fire("transparent", value);
    },

    get transparent() {
        return this._core.transparent;
    },

    /**
     Whether this Modes enables backfaces to be visible on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The backfaces will belong to {{#crossLink "Geometry"}}{{/crossLink}} compoents that are also attached to
     the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/backfaces:event"}}{{/crossLink}} event on change.

     @property backfaces
     @default true
     @type Boolean
     */
    set backfaces(value) {
        value = value !== false;
        this._core.backfaces = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/backfaces:property"}}{{/crossLink}} property changes.
         @event backfaces
         @param value The property's new value
         */
        this.fire("backfaces", value);
    },

    get backfaces() {
        return this._core.backfaces;
    },

    /**
     Indicates the winding direction of front faces on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The faces will belong to {{#crossLink "Geometry"}}{{/crossLink}} components that are also attached to
     the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/frontface:event"}}{{/crossLink}} event on change.

     @property frontface
     @default "ccw"
     @type String
     */
    set frontface(value) {
        value = value || "ccw";
        this._core.frontface = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/frontface:property"}}{{/crossLink}} property changes.
         @event frontface
         @param value The property's new value
         */
        this.fire("frontface", value);
    },

    get frontface() {
        return this._core.frontface;
    },

    /**
     Whether this Modes enables lighting on the backfaces of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The lights and geometry will be defined by {{#crossLink "Lights"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
     that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/backfaceLighting:event"}}{{/crossLink}} event on change.

     @property backfaceLighting
     @default true
     @type Boolean
     */
    set backfaceLighting(value) {
        value = value !== false;
        this._core.backfaceLighting = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/backfaceLighting:property"}}{{/crossLink}} property changes.
         @event backfaceLighting
         @param value The property's new value
         */
        this.fire("backfaceLighting", value);
    },

    get backfaceLighting() {
        return this._core.backfaceLighting;
    },

    /**
     Whether this Modes enables textures to be applied to the backfaces of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The textures and geometry will be defined by {{#crossLink "Texture"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
     that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/backfaceTexturing:event"}}{{/crossLink}} event on change.

     @property backfaceTexturing
     @default true
     @type Boolean
     */
    set backfaceTexturing(value) {
        value = value !== false;
        this._core.backfaceTexturing = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/backfaceTexturing:property"}}{{/crossLink}} property changes.
         @event backfaceTexturing
         @param value The property's new value
         */
        this.fire("backfaceTexturing", value);
    },

    get backfaceTexturing() {
        return this._core.backfaceTexturing;
    },

    /**
     Whether this Modes enables diffuse lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Lighting will be defined by {{#crossLink "Lights"}}{{/crossLink}} and {{#crossLink "Geometry"}}{{/crossLink}} components
     that are also attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/diffuse:event"}}{{/crossLink}} event on change.

     @property diffuse
     @default true
     @type Boolean
     */
    set diffuse(value) {
        value = value !== false;
        this._core.diffuse = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/diffuse:property"}}{{/crossLink}} property changes.
         @event diffuse
         @param value The property's new value
         */
        this.fire("diffuse", value);
    },

    get diffuse() {
        return this._core.diffuse;
    },

    /**
     Whether this Modes enables specular lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Lighting will be defined by {{#crossLink "Lights"}}{{/crossLink}} components that are also attached to
     the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/specular:event"}}{{/crossLink}} event on change.

     @property specular
     @default true
     @type Boolean
     */
    set specular(value) {
        value = value !== false;
        this._core.specular = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/specular:property"}}{{/crossLink}} property changes.
         @event specular
         @param value The property's new value
         */
        this.fire("specular", value);
    },

    get specular() {
        return this._core.specular;
    },

    /**
     Whether this Modes enables ambient lighting of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The ambient lighting will be provided by {{#crossLink "AmbientLight"}}{{/crossLink}} components that are also
     attached to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/ambient:event"}}{{/crossLink}} event on change.

     @property ambient
     @default true
     @type Boolean
     */
    set ambient(value) {
        value = value !== false;
        this._core.ambient = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/ambient:property"}}{{/crossLink}} property changes.
         @event ambient
         @param value The property's new value
         */
        this.fire("ambient", value);
    },

    get ambient() {
        return this._core.ambient;
    },

    /**
     Whether this Modes enables reflections on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     The reflections will be defined by {{#crossLink "CubeMap"}}{{/crossLink}} components that are also attached
     to the {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

     Fires a {{#crossLink "Modes/reflection:event"}}{{/crossLink}} event on change.

     @property reflection
     @default true
     @type Boolean
     */
    set reflection(value) {
        value = value !== false;
        this._core.reflection = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Modes'' {{#crossLink "Modes/reflection:property"}}{{/crossLink}} property changes.
         @event reflection
         @param value The property's new value
         */
        this.fire("reflection", value);
    },

    get reflection() {
        return this._core.reflection;
    },

    _compile: function () {
        this._renderer.flags = this._core;
    },

    /**
     * JSON representation of this component
     * @property json
     * @type GameObject
     */

    _getJSON: function () {
        return {
            picking: this.picking,
            clipping: this.clipping,
            transparent: this.transparent,
            backfaces: this.backfaces,
            frontface: this.frontface,
            backfaceLighting: this.backfaceLighting,
            backfaceTexturing: this.backfaceTexturing,
            diffuse: this.diffuse,
            specular: this.specular,
            ambient: this.ambient,
            reflection: this.reflection
        };
    }
});



;"use strict";

/**
  A **Frustum** defines a perspective projection as a frustum-shaped view volume.

  {{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
  {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

  <img src="http://www.gliffy.com/go/publish/image/7103657/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Frustum
 projection transform.

 ````Javascript
 var scene = new XEO.Scene(engine);

 var frustum = new XEO.Frustum(scene, {
    left:       1.0,    // Position of the left plane on the View-space X-axis
    right:      1.0,    // Position of the right plane on the View-space X-axis
    top:        1.0,    // Position of the top plane on the View-space Y-axis.
    bottom :   -1.0,    // Position of the bottom plane on the View-space Y-axis.
    near:       0.1,    // Position of the near plane on the View-space Z-axis.
    far:        10000   // Position of the far plane on the positive View-space Z-axis.
 });

 var camera = new XEO.Camera(scene, {
       project: frustum
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 // Subscribe to changes on a property of our Frustum component
 frustum.on("near", function(value) {
       console.log("Frustum 'near' updated: " + value);
   });

 // Set the value of a property on our Frustum component, which fires the event we just subscribed to
 frustum.near = 45.0;

 // Get the value of a property on our Frustum component
 var value = frustum.near;

 // Destroy ths Frustum component, causing the camera to fall back on the scene's default projection transform
 frustum.destroy();
 ````

 @class Frustum
  @module XEO
  @constructor
  @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Frustum within the
  default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
  @param [cfg] {*} Configs
  @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
  @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Frustum.
  @param [cfg.left=-1] {Number} Position of the left plane on the View-space X-axis.
  @param [cfg.right=1] {Number} Position of the right plane on the View-space X-axis.
  @param [cfg.top=1] {Number} Position of the top plane on the View-space Y-axis.
  @param [cfg.bottom=-1] {Number} Position of the bottom plane on the View-space Y-axis.
  @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
  @param [cfg.far=1000] {Number} Position of the far plane on the positive View-space Z-axis.
  @extends Component
 */
XEO.Frustum = XEO.Component.extend({

    className: "XEO.Frustum",

    type: "project",

    _init: function (cfg) {

        this.mode = "frustum";

        this.left = cfg.left;
        this.right = cfg.right;
        this.top = cfg.top;
        this.bottom = cfg.bottom;
        this.near = cfg.near;
        this.far = cfg.far;

        var self = this;

        // Lazy-rebuild matrix on each scene tick
        this._onTick = this.scene.on("tick",
            function (c) {
                if (self._dirty) {
                    self._rebuild();
                }
            });
    },

    _rebuild: function () {

        var core = this._core;

        // Build matrix values
        core.matrix = XEO.math.frustumMat4c(core.left, core.right, core.bottom, core.top, core.near, core.far, []);

        // Build typed array, avoid reallocating
        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }

        this.fire("matrix", core.matrix);

        this._dirty = false;
    },

    /**
      Position of the left plane on the View-space X-axis.

      Fires a {{#crossLink "Frustum/left:event"}}{{/crossLink}} event on change.

      @property left
      @default -1.0
      @type Number
     */
    set left(value) {
        value = value || -1.0;
        this._core.left = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/left:property"}}{{/crossLink}} property changes.
         * @event left
         * @param value The property's new value
         */
        this.fire("left", value);
    },

    get left() {
        return this._core.left;
    },

    /**
     * Position of the right plane on the View-space X-axis.
     * Fires a {{#crossLink "Frustum/right:event"}}{{/crossLink}} event on change.
     * @property right
     * @default 1.0
     * @type Number
     */
    set right(value) {
        value = value || 1.0;
        this._core.right = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         this Frustum's          * @event right
         * @param value The property's new value
         */
        this.fire("right", value);
    },

    get right() {
        return this._core.right;
    },

    /**
     * Position of the top plane on the View-space Y-axis.
     * Fires a {{#crossLink "Frustum/top:event"}}{{/crossLink}} event on change.
     * @property top
     * @default 1.0
     * @type Number
     */
    set top(value) {
        value = value || 1.0;
        this._core.top = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/top:property"}}{{/crossLink}} property changes.
         * @event top
         * @param value The property's new value
         */
        this.fire("top", value);
    },

    get top() {
        return this._core.top;
    },

    /**
     * Position of the bottom plane on the View-space Y-axis.
     * Fires a {{#crossLink "Frustum/bottom:event"}}{{/crossLink}} event on change.
     * @property bottom
     * @default -1.0
     * @type Number
     */
    set bottom(value) {
        value = value || -1.0;
        this._core.bottom = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/bottom:property"}}{{/crossLink}} property changes.
         * @event bottom
         * @param value The property's new value
         */
        this.fire("bottom", value);
    },

    get bottom() {
        return this._core.bottom;
    },

    /**
     * Position of the near plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Frustum/near:event"}}{{/crossLink}} event on change.
     * @property near
     * @default 0.1
     * @type Number
     */
    set near(value) {
        value = value || 0.1;
        this._core.near = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's   {{#crossLink "Frustum/near:property"}}{{/crossLink}} property changes.
         * @event near
         * @param value The property's new value
         */
        this.fire("near", value);
    },

    get near() {
        return this._core.near;
    },

    /**
     * Position of the far plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Frustum/far:event"}}{{/crossLink}} event on change.
     * @property far
     * @default 10000.0
     * @type Number
     */
    set far(value) {
        value = value || 10000.0;
        this._core.far = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Frustum's  {{#crossLink "Frustum/far:property"}}{{/crossLink}} property changes.
         * @event far
         * @param value The property's new value
         */
        this.fire("far", value);
    },

    get far() {
        return this._core.far;
    },

    get matrix() {
        if (this._dirty) {
            this._core.rebuild();
        }
        return this._core.matrix.slice(0);
    },

    _compile: function () {
        this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
            near: this.near,
            far: this.far
        };
    },

    _destroy: function () {
        this.scene.off(this._onTick);
    }
});

;"use strict";

/**
  A **Geometry** defines the geometric shape of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

  <img src="http://www.gliffy.com/go/publish/image/7103669/L.png"></img>

 ### Example 1

 If you create a Geometry with no specified shape, it will be a 2x2x2 box by default:

 ```` javascript
 var geometry = new XEO.Geometry(scene); // 2x2x2 box

 var object2 = new XEO.GameObject(scene, {
    geometry: geometry
 });
 ````

 ### Example 2

 If you create a {{#crossLink "GameObject"}}GameObject{{/crossLink}} with no Geometry, it will inherit its {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default {{#crossLink "Scene/geometry:property"}}{{/crossLink}}, which is also a 2x2x2 box:

 ```` javascript
 var scene = new XEO.Scene();

 var object1 = new XEO.GameObject(scene);
 ````

 ### Example 3

 Finally, we'll create a {{#crossLink "GameObject"}}GameObject{{/crossLink}} with a Geometry that we have **explicitly**
 configured to be a 2x2x2 box:

 ```` javascript
 // Create a 2x2x2 box centered at the World-space origin
 var geometry2 = new XEO.Geometry(scene, {

        // Supported primitives are 'points', 'lines', 'line-loop', 'line-strip', 'triangles',
        // 'triangle-strip' and 'triangle-fan'.primitive: "triangles",
        primitive: "triangles",

        // Vertex positions
        positions : [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
             1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ],

        // Vertex colors
        colors: [
            1.0,  1.0,  1.0,  1.0,    // Front face: white
            1.0,  0.0,  0.0,  1.0,    // Back face: red
            0.0,  1.0,  0.0,  1.0,    // Top face: green
            0.0,  0.0,  1.0,  1.0,    // Bottom face: blue
            1.0,  1.0,  0.0,  1.0,    // Right face: yellow
            1.0,  0.0,  1.0,  1.0     // Left face: purple
        ],

        // Vertex normals
        normals: [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
        ],

        // UV coordinates
        uv: [
            1, 1, 0, 1, 0, 0, 1, 0,
            0, 1, 0, 0, 1, 0, 1, 1,
            1, 0, 1, 1, 0, 1, 0, 0,
            1, 1, 0, 1, 0, 0, 1, 0,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1
        ],

        // Triangle indices
        indices: [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ]
  });

  var object = new XEO.GameObject(myScene, {
        geometry: geometry2
  });
 ````

 @class Geometry
  @module XEO
  @constructor
  @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
  {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
  @param [cfg] {*} Configs
  @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
  generated automatically when omitted.
  @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Geometry.
  @param [cfg.primitive="triangles"] {String} The primitive type. Accepted values are 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
  @param [cfg.positions] {Array of Number} Positions array.
  @param [cfg.normals] {Array of Number} Normals array.
  @param [cfg.uv] {Array of Number} UVs array.
  @param [cfg.uv2] {Array of Number} Second UVs array, for a second UV level.
  @param [cfg.colors] {Array of Number} Vertex colors.
  @param [cfg.indices] {Array of Number} Indices array.
  @extends Component
 */
XEO.Geometry = XEO.Component.extend({

    className: "XEO.Geometry",

    type: "geometry",

    _init: function (cfg) {

        if (!cfg.positions && !cfg.normals && !cfg.uv && cfg.uv2 && !cfg.indices) {

            // Default cube

            cfg.primitive = "triangles";

            cfg.positions = [

                // Front face
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,

                // Back face
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,

                // Top face
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,

                // Bottom face
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0,

                // Right face
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,

                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0, -1.0
            ];

            // Vertex colors
            cfg.colors = [
                1.0,  1.0,  1.0,  1.0,    // Front face: white
                1.0,  0.0,  0.0,  1.0,    // Back face: red
                0.0,  1.0,  0.0,  1.0,    // Top face: green
                0.0,  0.0,  1.0,  1.0,    // Bottom face: blue
                1.0,  1.0,  0.0,  1.0,    // Right face: yellow
                1.0,  0.0,  1.0,  1.0     // Left face: purple
            ];

            // Vertex normals
            cfg.normals = [
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
            ];

            // UV coordinates
            cfg.uv = [
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 1, 0, 0, 1, 0, 1, 1,
                1, 0, 1, 1, 0, 1, 0, 0,
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1
            ];

            // Triangle indices
            cfg.indices = [
                0,  1,  2,      0,  2,  3,    // front
                4,  5,  6,      4,  6,  7,    // back
                8,  9,  10,     8,  10, 11,   // top
                12, 13, 14,     12, 14, 15,   // bottom
                16, 17, 18,     16, 18, 19,   // right
                20, 21, 22,     20, 22, 23    // left
            ];
        }

        this.primitive = cfg.primitive;
        this.positions = cfg.positions;
        this.normals = cfg.normals;
        this.uv = cfg.uv;
        this.uv2 = cfg.uv2;
        this.colors = cfg.colors;
        this.indices = cfg.indices;

        this._webglContextRestored = this.scene.canvas.on(
            "webglContextRestored",
            function (gl) {

            });

        this.scene.stats.inc("geometries");
    },

    /**
     * The Geometry's primitive type.
     *
     * Valid types are: 'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'.
     *
     * Fires a {{#crossLink "Geometry/primitive:event"}}{{/crossLink}} event on change.
     *
     * @property primitive
     * @default "triangles"
     * @type String
     */
    set primitive(value) {
        value = value || "triangles";
        var gl = this.scene.canvas.gl;
        var type;
        switch (value) {
            case "points":
                type = gl.POINTS;
                break;
            case "lines":
                type = gl.LINES;
                break;
            case "line-loop":
                type = gl.LINE_LOOP;
                break;
            case "line-strip":
                type = gl.LINE_STRIP;
                break;
            case "triangles":
                type = gl.TRIANGLES;
                break;
            case "triangle-strip":
                type = gl.TRIANGLE_STRIP;
                break;
            case "triangle-fan":
                type = gl.TRIANGLE_FAN;
                break;
            default:
                this.error("XEO.Geometry 'primitive' value is unsupported - should be either " +
                    "'points', 'lines', 'line-loop', 'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan' (defaulting to 'triangles')");
                value = "triangles";
                type = gl.TRIANGLES;
        }
        this._core.primitive = value;
        this._core.primitiveEnum = type;
        this.fire("dirty", true);

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/primitive:property"}}{{/crossLink}} property changes.
         * @event primitive
         * @type String
         * @param value The property's new value
         */
        this.fire("primitive", type);
    },

    get primitive() {
        return this._core.primitive;
    },

    /**
     * The Geometry's positions array.
     *
     * Fires a {{#crossLink "Geometry/positions:event"}}{{/crossLink}} event on change.
     *
     * @property positions
     * @default null
     * @type {Array of Number}
     */
    set positions(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/positions:property"}}{{/crossLink}} property changes.
         * @event positions
         * @param value The property's new value
         */
        this.fire("positions", value);
    },

    get positions() {
    },

    /**
     * The Geometry's normal vectors array.
     *
     * Fires a {{#crossLink "Geometry/normals:event"}}{{/crossLink}} event on change.
     *
     * @property normals
     * @default null
     * @type {Array of Number}
     */
    set normals(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/normals:property"}}{{/crossLink}} property changes.
         * @event normals
         * @param value The property's new value
         */
    },

    get normals() {
    },

    /**
     * The Geometry's UV coordinate array.
     *
     * Fires a {{#crossLink "Geometry/uv:event"}}{{/crossLink}} event on change.
     *
     * @property uv
     * @default null
     * @type {Array of Number}
     */
    set uv(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/uv:property"}}{{/crossLink}} property changes.
         * @event uv
         * @param value The property's new value
         */
    },

    get uv() {

    },

    /**
     * The Geometry's second UV coordinate array.
     *
     * Fires a {{#crossLink "Geometry/uv2:event"}}{{/crossLink}} event on change.
     *
     * @property uv2
     * @default null
     * @type {Array of Number}
     */
    set uv2(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/uv2:property"}}{{/crossLink}} property changes.
         * @event uv2
         * @param value The property's new value
         */
    },

    get uv2() {
    },

    /**
     * The Geometry's vertex colors array.
     *
     * Fires a {{#crossLink "Geometry/colors:event"}}{{/crossLink}} event on change.
     *
     * @property colors
     * @default null
     * @type {Array of Number}
     */
    set colors(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/colors:property"}}{{/crossLink}} property changes.
         * @event colors
         * @param value The property's new value
         */
    },

    get colors() {
    },

    /**
     * The Geometry's indices array.
     *
     * Fires a {{#crossLink "Geometry/indices:event"}}{{/crossLink}} event on change.
     *
     * @property indices
     * @default null
     * @type {Array of Number}
     */
    set indices(value) {

        /**
         * Fired whenever this Geometry's {{#crossLink "Geometry/indices:property"}}{{/crossLink}} property changes.
         * @event indices
         * @param value The property's new value
         */
    },

    get indices() {
    },

    get boundingBox() {
    },

    get boundingSphere() {
    },

    get center() {
    },

    _compile: function () {

    },

    /** Builds normal vectors from positions and indices
     * @private
     */
    _buildNormals: function (data) {

        var positions = data.positions;
        var indices = data.indices;
        var nvecs = new Array(positions.length / 3);
        var j0;
        var j1;
        var j2;
        var v1;
        var v2;
        var v3;

        for (var i = 0, len = indices.length - 3; i < len; i += 3) {
            j0 = indices[i + 0];
            j1 = indices[i + 1];
            j2 = indices[i + 2];

            v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
            v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
            v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

            v2 = SceneJS_math_subVec4(v2, v1, [0, 0, 0, 0]);
            v3 = SceneJS_math_subVec4(v3, v1, [0, 0, 0, 0]);

            var n = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(v2, v3, [0, 0, 0, 0]), [0, 0, 0, 0]);

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Array(positions.length);

        // now go through and average out everything
        for (var i = 0, len = nvecs.length; i < len; i++) {
            var count = nvecs[i].length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvecs[i][j][0];
                y += nvecs[i][j][1];
                z += nvecs[i][j][2];
            }
            normals[i * 3 + 0] = (x / count);
            normals[i * 3 + 1] = (y / count);
            normals[i * 3 + 2] = (z / count);
        }

        data.normals = normals;
    },


    /**
     * Builds vertex tangent vectors from positions, UVs and indices
     *
     * Based on code by @rollokb, in his fork of webgl-obj-loader:
     * https://github.com/rollokb/webgl-obj-loader
     *
     * @private
     **/
    _buildTangents: function (arrays) {

        var positions = arrays.positions;
        var indices = arrays.indices;
        var uv = arrays.uv;

        var tangents = [];

        // The vertex arrays needs to be calculated
        // before the calculation of the tangents

        for (var location = 0; location < indices.length; location += 3) {

            // Recontructing each vertex and UV coordinate into the respective vectors

            var index = indices[location];

            var v0 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv0 = [uv[index * 2], uv[(index * 2) + 1]];

            index = indices[location + 1];

            var v1 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv1 = [uv[index * 2], uv[(index * 2) + 1]];

            index = indices[location + 2];

            var v2 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv2 = [uv[index * 2], uv[(index * 2) + 1]];

            var deltaPos1 = SceneJS_math_subVec3(v1, v0, []);
            var deltaPos2 = SceneJS_math_subVec3(v2, v0, []);

            var deltaUV1 = SceneJS_math_subVec2(uv1, uv0, []);
            var deltaUV2 = SceneJS_math_subVec2(uv2, uv0, []);

            var r = 1.0 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

            var tangent = SceneJS_math_mulVec3Scalar(
                SceneJS_math_subVec3(
                    SceneJS_math_mulVec3Scalar(deltaPos1, deltaUV2[1], []),
                    SceneJS_math_mulVec3Scalar(deltaPos2, deltaUV1[1], []),
                    []
                ),
                r,
                []
            );

            // Average the value of the vectors outs
            for (var v = 0; v < 3; v++) {
                var addTo = indices[location + v];
                if (typeof tangents[addTo] != "undefined") {
                    tangents[addTo] = SceneJS_math_addVec3(tangents[addTo], tangent, []);
                } else {
                    tangents[addTo] = tangent;
                }
            }
        }

        // Deconstruct the vectors back into 1D arrays for WebGL

        var tangents2 = [];

        for (var i = 0; i < tangents.length; i++) {
            tangents2 = tangents2.concat(tangents[i]);
        }

        return tangents2;
    },

    _getJSON: function () {
        var json = {
            primitive: this.primitive
        };
        if (this._core.positions) {
            json.positions = this.positions;
        }
        if (this._core.normals) {
            json.normals = this.normals;
        }
        if (this._core.uv) {
            json.uv = this.uv;
        }
        if (this._core.uv2) {
            json.uv2 = this.uv2;
        }
        if (this._core.colors) {
            json.colors = this.colors;
        }
        if (this._core.indices) {
            json.indices = this.indices;
        }
        return json;
    },

    _destroy: function () {
        this.scene.stats.dec("geometries");
        this.scene.canvas.off(this._webglContextRestored);
    }
});;"use strict";

/**
 Publishes any key and mouse events that occur on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.

 <img src="http://www.gliffy.com/go/publish/image/7123123/L.png"></img>

 ### Example

 ````javascript
 var myScene = new XEO.Scene();

 var input = myScene.input;

 input.on("mousedown", function(coords) {
       console.log("Mouse down at: x=" + coords[0] + ", y=" + coords[1]);
  });

 input.on("mouseup", function(coords) {
       console.log("Mouse up at: x=" + coords[0] + ", y=" + coords[1]);
  });

 input.on("mouseclicked", function(coords) {
       console.log("Mouse clicked at: x=" + coords[0] + ", y=" + coords[1]);
  });

 input.on("dblclick", function(coords) {
       console.log("Double-click at: x=" + coords[0] + ", y=" + coords[1]);
  });

 input.on("keydown", function(keyCode) {
       switch (keyCode) {

           case this.KEY_A:
               console.log("The 'A' key is down");
               break;

           case this.KEY_B:
               console.log("The 'B' key is down");
               break;

           case this.KEY_C:
               console.log("The 'C' key is down");
               break;

            default:
               console.log("Some other key is down");
       }
  });

 input.on("keyup", function(keyCode) {
     switch (keyCode) {

           case this.KEY_A:
               console.log("The 'A' key is up");
               break;

           case this.KEY_B:
               console.log("The 'B' key is up");
               break;

           case this.KEY_C:
               console.log("The 'C' key is up");
               break;

            default:
               console.log("Some other key is up");
       }
  });

 // TODO: ALT and CTRL keys etc
 ````
 @class Input
 @module XEO
 @constructor
 @extends Component
 */
XEO.Input = XEO.Component.extend({

    className: "XEO.Input",

    type: "input",

    _init: function (cfg) {

        var self = this;

        // True when ALT down
        this.altDown = false;

        /** True whenever CTRL is down
         *
         * @type {boolean}
         */
        this.ctrlDown = false;

        /** True whenever left mouse button is down
         *
         * @type {boolean}
         */
        this.mouseDownLeft = false;

        /** True whenever middle mouse button is down
         *
         * @type {boolean}
         */
        this.mouseDownMiddle = false;

        /** True whenever right mouse button is down
         *
         * @type {boolean}
         */
        this.mouseDownRight = false;

        /** Flag for each key that's down
         *
         * @type {boolean}
         */
        this.keyDown = [];

        /** True while input enabled
         *
         * @type {boolean}
         */
        this.enabled = true;

        // Capture input events and publish them on this component

        document.addEventListener("keydown",
            this._keyDownListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                    if (e.ctrlKey) {
                        self.ctrlDown = true;
                    } else if (e.altKey) {
                        self.altDown = true;
                    } else {
                        self.keyDown[e.keyCode] = true;

                        /**
                         * Fired whenever a key is pressed while the parent
                         * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}} has input focus.
                         * @event keydown
                         * @param value {Number} The key code, for example {{#crossLink "Input/KEY_LEFT_ARROW:property"}}{{/crossLink}},
                         */
                        self.fire("keydown", e.keyCode, true);
                    }
                }
            }, true);


        document.addEventListener("keyup",
            this._keyUpListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                    if (e.ctrlKey) {
                        self.ctrlDown = false;
                    } else if (e.altKey) {
                        self.altDown = false;
                    } else {
                        self.keyDown[e.keyCode] = false;

                        /**
                         * Fired whenever a key is released while the parent
                         * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}} has input focus.
                         * @event keyup
                         * @param value {Number} The key code, for example {{#crossLink "Input/KEY_LEFT_ARROW:property"}}{{/crossLink}},
                         */
                        self.fire("keyup", e.keyCode, true);
                    }
                }
            });

        cfg.canvas.mousedown(
            this._mouseDownListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                switch (e.which) {
                    case 1:// Left button
                        self.mouseDownLeft = true;
                        break;
                    case 2:// Middle/both buttons
                        self.mouseDownMiddle = true;
                        break;
                    case 3:// Right button
                        self.mouseDownRight = true;
                        break;
                    default:
                        break;
                }
                var coords = self._getClickCoordsWithinElement(e);

                /**
                 * Fired whenever the mouse is pressed over the parent
                 * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                 * @event mousedown
                 * @param value {[Number, Number]} The mouse coordinates within the {{#crossLink "Canvas"}}Canvas{{/crossLink}},
                 */
                self.fire("mousedown", coords, true);
            });

        cfg.canvas.mouseup(
            this._mouseUpListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                switch (e.which) {
                    case 1:// Left button
                        self.mouseDownLeft = false;
                        break;
                    case 2:// Middle/both buttons
                        self.mouseDownMiddle = false;
                        break;
                    case 3:// Right button
                        self.mouseDownRight = false;
                        break;
                    default:
                        break;
                }
                var coords = self._getClickCoordsWithinElement(e);

                /**
                 * Fired whenever the mouse is released over the parent
                 * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                 * @event mouseup
                 * @param value {[Number, Number]} The mouse coordinates within the {{#crossLink "Canvas"}}Canvas{{/crossLink}},
                 */
                self.fire("mouseup", coords, true);
            });

        cfg.canvas.dblclick(
            this._dblClickListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                switch (e.which) {
                    case 1:// Left button
                        self.mouseDownLeft = false;
                        self.mouseDownRight = false;
                        break;
                    case 2:// Middle/both buttons
                        self.mouseDownMiddle = false;
                        break;
                    case 3:// Right button
                        self.mouseDownLeft = false;
                        self.mouseDownRight = false;
                        break;
                    default:
                        break;
                }
                var coords = self._getClickCoordsWithinElement(e);

                /**
                 * Fired whenever the mouse is double-clicked over the parent
                 * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                 * @event dblclick
                 * @param value {[Number, Number]} The mouse coordinates within the {{#crossLink "Canvas"}}Canvas{{/crossLink}},
                 */
                self.fire("dblclick", coords, true);
            });

        cfg.canvas.mousemove(
            this._mouseMoveListener = function (e) {
                if (!self.enabled) {
                    return;
                }
                var coords = self._getClickCoordsWithinElement(e);

                /**
                 * Fired whenever the mouse is moved over the parent
                 * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                 * @event mousedown
                 * @param value {[Number, Number]} The mouse coordinates within the {{#crossLink "Canvas"}}Canvas{{/crossLink}},
                 */
                self.fire("mousedown", coords, true);
            });

        cfg.canvas.bind("mousewheel",
            this._mouseWheelListener = function (event, d) {
                if (!self.enabled) {
                    return;
                }

                /**
                 * Fired whenever the mouse wheel is moved over the parent
                 * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                 * @event mousewheel
                 * @param event The mouse wheeel event,
                 * @param d {Number} The mouse wheel delta,
                 */
                self.fire("mousewheel", { event: event, d: d }, true);
            });

        // mouseclicked

        (function () {
            var downX;
            var downY;
            self.on("mousedown",
                function (params) {
                    downX = params.x;
                    downY = params.y;
                });

            self.on("mouseup",
                function (params) {
                    if (downX == params.x && downY == params.y) {

                        /**
                         * Fired whenever the mouse is clicked over the parent
                         * {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas{{/crossLink}}.
                         * @event mouseclicked
                         * @param value {[Number, Number]} The mouse coordinates within the {{#crossLink "Canvas"}}Canvas{{/crossLink}},
                         */
                        self.fire("mouseclicked", params, true);
                    }
                });
        })();
    },

    _getClickCoordsWithinElement: function (event) {
        var coords = { x: 0, y: 0 };
        if (!event) {
            event = window.event;
            coords.x = event.x;
            coords.y = event.y;
        }
        else {
            var element = event.target;
            var totalOffsetLeft = 0;
            var totalOffsetTop = 0;

            while (element.offsetParent) {
                totalOffsetLeft += element.offsetLeft;
                totalOffsetTop += element.offsetTop;
                element = element.offsetParent;
            }
            coords.x = event.pageX - totalOffsetLeft;
            coords.y = event.pageY - totalOffsetTop;
        }
        return coords;
    },

    /**
     * Enable or disable all input handlers
     *
     * @param enable
     */
    setEnabled: function (enable) {
        if (this.enabled != enable) {
            this.fire("enabled", this.enabled = enable);
        }
    },

    // Key codes

    /**
     * Code for the BACKSPACE key.
     * @property KEY_BACKSPACE
     * @final
     * @type Number
     */
    KEY_BACKSPACE: 8,

    /**
     * Code for the TAB key.
     * @property KEY_TAB
     * @final
     * @type Number
     */
    KEY_TAB: 9,

    /**
     * Code for the ENTER key.
     * @property KEY_ENTER
     * @final
     * @type Number
     */
    KEY_ENTER: 13,

    /**
     * Code for the SHIFT key.
     * @property KEY_SHIFT
     * @final
     * @type Number
     */
    KEY_SHIFT: 16,

    /**
     * Code for the CTRL key.
     * @property KEY_CTRL
     * @final
     * @type Number
     */
    KEY_CTRL: 17,

    /**
     * Code for the ALT key.
     * @property KEY_ALT
     * @final
     * @type Number
     */
    KEY_ALT: 18,

    /**
     * Code for the PAUSE_BREAK key.
     * @property KEY_PAUSE_BREAK
     * @final
     * @type Number
     */
    KEY_PAUSE_BREAK: 19,

    /**
     * Code for the CAPS_LOCK key.
     * @property KEY_CAPS_LOCK
     * @final
     * @type Number
     */
    KEY_CAPS_LOCK: 20,

    /**
     * Code for the ESCAPE key.
     * @property KEY_ESCAPE
     * @final
     * @type Number
     */
    KEY_ESCAPE: 27,

    /**
     * Code for the PAGE_UP key.
     * @property KEY_PAGE_UP
     * @final
     * @type Number
     */
    KEY_PAGE_UP: 33,

    /**
     * Code for the PAGE_DOWN key.
     * @property KEY_PAGE_DOWN
     * @final
     * @type Number
     */
    KEY_PAGE_DOWN: 34,

    /**
     * Code for the END key.
     * @property KEY_END
     * @final
     * @type Number
     */
    KEY_END: 35,

    /**
     * Code for the HOME key.
     * @property KEY_HOME
     * @final
     * @type Number
     */
    KEY_HOME: 36,

    /**
     * Code for the LEFT_ARROW key.
     * @property KEY_LEFT_ARROW
     * @final
     * @type Number
     */
    KEY_LEFT_ARROW: 37,

    /**
     * Code for the UP_ARROW key.
     * @property KEY_UP_ARROW
     * @final
     * @type Number
     */
    KEY_UP_ARROW: 38,

    /**
     * Code for the RIGHT_ARROW key.
     * @property KEY_RIGHT_ARROW
     * @final
     * @type Number
     */
    KEY_RIGHT_ARROW: 39,

    /**
     * Code for the DOWN_ARROW key.
     * @property KEY_DOWN_ARROW
     * @final
     * @type Number
     */
    KEY_DOWN_ARROW: 40,

    /**
     * Code for the INSERT key.
     * @property KEY_INSERT
     * @final
     * @type Number
     */
    KEY_INSERT: 45,

    /**
     * Code for the DELETE key.
     * @property KEY_DELETE
     * @final
     * @type Number
     */
    KEY_DELETE: 46,

    /**
     * Code for the 0 key.
     * @property KEY_NUM_0
     * @final
     * @type Number
     */
    KEY_NUM_0: 48,

    /**
     * Code for the 1 key.
     * @property KEY_NUM_1
     * @final
     * @type Number
     */
    KEY_NUM_1: 49,

    /**
     * Code for the 2 key.
     * @property KEY_NUM_2
     * @final
     * @type Number
     */
    KEY_NUM_2: 50,

    /**
     * Code for the 3 key.
     * @property KEY_NUM_3
     * @final
     * @type Number
     */
    KEY_NUM_3: 51,

    /**
     * Code for the 4 key.
     * @property KEY_NUM_4
     * @final
     * @type Number
     */
    KEY_NUM_4: 52,

    /**
     * Code for the 5 key.
     * @property KEY_NUM_5
     * @final
     * @type Number
     */
    KEY_NUM_5: 53,

    /**
     * Code for the 6 key.
     * @property KEY_NUM_6
     * @final
     * @type Number
     */
    KEY_NUM_6: 54,

    /**
     * Code for the 7 key.
     * @property KEY_NUM_7
     * @final
     * @type Number
     */
    KEY_NUM_7: 55,

    /**
     * Code for the 8 key.
     * @property KEY_NUM_8
     * @final
     * @type Number
     */
    KEY_NUM_8: 56,

    /**
     * Code for the 9 key.
     * @property KEY_NUM_9
     * @final
     * @type Number
     */
    KEY_NUM_9: 57,

    /**
     * Code for the A key.
     * @property KEY_A
     * @final
     * @type Number
     */
    KEY_A: 65,

    /**
     * Code for the B key.
     * @property KEY_B
     * @final
     * @type Number
     */
    KEY_B: 66,

    /**
     * Code for the C key.
     * @property KEY_C
     * @final
     * @type Number
     */
    KEY_C: 67,

    /**
     * Code for the D key.
     * @property KEY_D
     * @final
     * @type Number
     */
    KEY_D: 68,

    /**
     * Code for the E key.
     * @property KEY_E
     * @final
     * @type Number
     */
    KEY_E: 69,

    /**
     * Code for the F key.
     * @property KEY_F
     * @final
     * @type Number
     */
    KEY_F: 70,

    /**
     * Code for the G key.
     * @property KEY_G
     * @final
     * @type Number
     */
    KEY_G: 71,

    /**
     * Code for the H key.
     * @property KEY_H
     * @final
     * @type Number
     */
    KEY_H: 72,

    /**
     * Code for the I key.
     * @property KEY_I
     * @final
     * @type Number
     */
    KEY_I: 73,

    /**
     * Code for the J key.
     * @property KEY_J
     * @final
     * @type Number
     */
    KEY_J: 74,

    /**
     * Code for the K key.
     * @property KEY_K
     * @final
     * @type Number
     */
    KEY_K: 75,

    /**
     * Code for the L key.
     * @property KEY_L
     * @final
     * @type Number
     */
    KEY_L: 76,

    /**
     * Code for the M key.
     * @property KEY_M
     * @final
     * @type Number
     */
    KEY_M: 77,

    /**
     * Code for the N key.
     * @property KEY_N
     * @final
     * @type Number
     */
    KEY_N: 78,

    /**
     * Code for the O key.
     * @property KEY_O
     * @final
     * @type Number
     */
    KEY_O: 79,

    /**
     * Code for the P key.
     * @property KEY_P
     * @final
     * @type Number
     */
    KEY_P: 80,

    /**
     * Code for the Q key.
     * @property KEY_Q
     * @final
     * @type Number
     */
    KEY_Q: 81,

    /**
     * Code for the R key.
     * @property KEY_R
     * @final
     * @type Number
     */
    KEY_R: 82,

    /**
     * Code for the S key.
     * @property KEY_S
     * @final
     * @type Number
     */
    KEY_S: 83,

    /**
     * Code for the T key.
     * @property KEY_T
     * @final
     * @type Number
     */
    KEY_T: 84,

    /**
     * Code for the U key.
     * @property KEY_U
     * @final
     * @type Number
     */
    KEY_U: 85,

    /**
     * Code for the V key.
     * @property KEY_V
     * @final
     * @type Number
     */
    KEY_V: 86,

    /**
     * Code for the W key.
     * @property KEY_W
     * @final
     * @type Number
     */
    KEY_W: 87,

    /**
     * Code for the X key.
     * @property KEY_X
     * @final
     * @type Number
     */
    KEY_X: 88,

    /**
     * Code for the Y key.
     * @property KEY_Y
     * @final
     * @type Number
     */
    KEY_Y: 89,

    /**
     * Code for the Z key.
     * @property KEY_Z
     * @final
     * @type Number
     */
    KEY_Z: 90,

    /**
     * Code for the LEFT_WINDOW key.
     * @property KEY_LEFT_WINDOW
     * @final
     * @type Number
     */
    KEY_LEFT_WINDOW: 91,

    /**
     * Code for the RIGHT_WINDOW key.
     * @property KEY_RIGHT_WINDOW
     * @final
     * @type Number
     */
    KEY_RIGHT_WINDOW: 92,

    /**
     * Code for the SELECT key.
     * @property KEY_SELECT
     * @final
     * @type Number
     */
    KEY_SELECT_KEY: 93,

    /**
     * Code for the number pad 0 key.
     * @property KEY_NUMPAD_0
     * @final
     * @type Number
     */
    KEY_NUMPAD_0: 96,

    /**
     * Code for the number pad 1 key.
     * @property KEY_NUMPAD_1
     * @final
     * @type Number
     */
    KEY_NUMPAD_1: 97,

    /**
     * Code for the number pad 2 key.
     * @property KEY_NUMPAD 2
     * @final
     * @type Number
     */
    KEY_NUMPAD_2: 98,

    /**
     * Code for the number pad 3 key.
     * @property KEY_NUMPAD_3
     * @final
     * @type Number
     */
    KEY_NUMPAD_3: 99,

    /**
     * Code for the number pad 4 key.
     * @property KEY_NUMPAD_4
     * @final
     * @type Number
     */
    KEY_NUMPAD_4: 100,

    /**
     * Code for the number pad 5 key.
     * @property KEY_NUMPAD_5
     * @final
     * @type Number
     */
    KEY_NUMPAD_5: 101,

    /**
     * Code for the number pad 6 key.
     * @property KEY_NUMPAD_6
     * @final
     * @type Number
     */
    KEY_NUMPAD_6: 102,

    /**
     * Code for the number pad 7 key.
     * @property KEY_NUMPAD_7
     * @final
     * @type Number
     */
    KEY_NUMPAD_7: 103,

    /**
     * Code for the number pad 8 key.
     * @property KEY_NUMPAD_8
     * @final
     * @type Number
     */
    KEY_NUMPAD_8: 104,

    /**
     * Code for the number pad 9 key.
     * @property KEY_NUMPAD_9
     * @final
     * @type Number
     */
    KEY_NUMPAD_9: 105,

    /**
     * Code for the MULTIPLY key.
     * @property KEY_MULTIPLY
     * @final
     * @type Number
     */
    KEY_MULTIPLY: 106,

    /**
     * Code for the ADD key.
     * @property KEY_ADD
     * @final
     * @type Number
     */
    KEY_ADD: 107,

    /**
     * Code for the SUBTRACT key.
     * @property KEY_SUBTRACT
     * @final
     * @type Number
     */
    KEY_SUBTRACT: 109,

    /**
     * Code for the DECIMAL POINT key.
     * @property KEY_DECIMAL_POINT
     * @final
     * @type Number
     */
    KEY_DECIMAL_POINT: 110,

    /**
     * Code for the DIVIDE key.
     * @property KEY_DIVIDE
     * @final
     * @type Number
     */
    KEY_DIVIDE: 111,

    /**
     * Code for the F1 key.
     * @property KEY_F1
     * @final
     * @type Number
     */
    KEY_F1: 112,

    /**
     * Code for the F2 key.
     * @property KEY_F2
     * @final
     * @type Number
     */
    KEY_F2: 113,

    /**
     * Code for the F3 key.
     * @property KEY_F3
     * @final
     * @type Number
     */
    KEY_F3: 114,

    /**
     * Code for the F4 key.
     * @property KEY_F4
     * @final
     * @type Number
     */
    KEY_F4: 115,

    /**
     * Code for the F5 key.
     * @property KEY_F5
     * @final
     * @type Number
     */
    KEY_F5: 116,

    /**
     * Code for the F6 key.
     * @property KEY_F6
     * @final
     * @type Number
     */
    KEY_F6: 117,

    /**
     * Code for the F7 key.
     * @property KEY_F7
     * @final
     * @type Number
     */
    KEY_F7: 118,

    /**
     * Code for the F8 key.
     * @property KEY_F8
     * @final
     * @type Number
     */
    KEY_F8: 119,

    /**
     * Code for the F9 key.
     * @property KEY_F9
     * @final
     * @type Number
     */
    KEY_F9: 120,

    /**
     * Code for the F10 key.
     * @property KEY_F10
     * @final
     * @type Number
     */
    KEY_F10: 121,

    /**
     * Code for the F11 key.
     * @property KEY_F11
     * @final
     * @type Number
     */
    KEY_F11: 122,

    /**
     * Code for the F12 key.
     * @property KEY_F12
     * @final
     * @type Number
     */
    KEY_F12: 123,

    /**
     * Code for the NUM_LOCK key.
     * @property KEY_NUM_LOCK
     * @final
     * @type Number
     */
    KEY_NUM_LOCK: 144,

    /**
     * Code for the SCROLL_LOCK key.
     * @property KEY_SCROLL_LOCK
     * @final
     * @type Number
     */
    KEY_SCROLL_LOCK: 145,

    /**
     * Code for the SEMI_COLON key.
     * @property KEY_SEMI_COLON
     * @final
     * @type Number
     */
    KEY_SEMI_COLON: 186,

    /**
     * Code for the EQUAL_SIGN key.
     * @property KEY_EQUAL_SIGN
     * @final
     * @type Number
     */
    KEY_EQUAL_SIGN: 187,

    /**
     * Code for the COMMA key.
     * @property KEY_COMMA
     * @final
     * @type Number
     */
    KEY_COMMA: 188,

    /**
     * Code for the DASH key.
     * @property KEY_DASH
     * @final
     * @type Number
     */
    KEY_DASH: 189,

    /**
     * Code for the PERIOD key.
     * @property KEY_PERIOD
     * @final
     * @type Number
     */
    KEY_PERIOD: 190,

    /**
     * Code for the FORWARD_SLASH key.
     * @property KEY_FORWARD_SLASH
     * @final
     * @type Number
     */
    KEY_FORWARD_SLASH: 191,

    /**
     * Code for the GRAVE_ACCENT key.
     * @property KEY_GRAVE_ACCENT
     * @final
     * @type Number
     */
    KEY_GRAVE_ACCENT: 192,

    /**
     * Code for the OPEN_BRACKET key.
     * @property KEY_OPEN_BRACKET
     * @final
     * @type Number
     */
    KEY_OPEN_BRACKET: 219,

    /**
     * Code for the BACK_SLASH key.
     * @property KEY_BACK_SLASH
     * @final
     * @type Number
     */
    KEY_BACK_SLASH: 220,

    /**
     * Code for the CLOSE_BRACKET key.
     * @property KEY_CLOSE_BRACKET
     * @final
     * @type Number
     */
    KEY_CLOSE_BRACKET: 221,

    /**
     * Code for the SINGLE_QUOTE key.
     * @property KEY_SINGLE_QUOTE
     * @final
     * @type Number
     */
    KEY_SINGLE_QUOTE: 222,

    /**
     * Code for the SPACE key.
     * @property KEY_SPACE
     * @final
     * @type Number
     */
    KEY_SPACE: 32,


    _destroy: function () {
        document.removeEventListener("keydown", this._keyDownListener);
        document.removeEventListener("keyup", this._keyUpListener);
    }
});


;"use strict";

/**
 A **Layer** specifies the render order of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within their {{#crossLink "Stage"}}Stages{{/crossLink}}.

 <ul>
 <li>When the parent {{#crossLink "Scene"}}Scene{{/crossLink}} renders, each {{#crossLink "Stage"}}Stage{{/crossLink}} will render its bin
 of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in turn, from the lowest priority {{#crossLink "Stage"}}Stage{{/crossLink}} to the highest.</li>

 <li>{{#crossLink "Stage"}}Stages{{/crossLink}} are typically used for ordering the render-to-texture steps in posteffects pipelines.</li>

 <li>You can control the render order of the individual {{#crossLink "GameObject"}}GameObjects{{/crossLink}} ***within*** a {{#crossLink "Stage"}}Stage{{/crossLink}}
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.</li>

 <li>{{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within {{#crossLink "Stage"}}Stages{{/crossLink}}.</li>


 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} not explicitly attached to a Layer are implicitly
 attached to the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}. which has
 a {{#crossLink "Layer/priority:property"}}{{/crossLink}} value of zero.</li>

 <li>You can use Layers without defining any {{#crossLink "Stage"}}Stages{{/crossLink}} if you simply let your
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} fall back on the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105071/L.png"></img>

 ### Example

 ````javascript

 TODO

 ````

 @class Layer
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Geometry in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Layer.
 @param [cfg.priority=0] {Number} The rendering priority,
 @extends Component
 */
XEO.Layer = XEO.Component.extend({

    className: "XEO.Layer",

    type: "layer",

    _init: function (cfg) {
        this.priority = cfg.priority;
    },

    /**
     * Indicates a *layer* rendering priority for the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
     *
     * Each GameObject is also attached to a {{#crossLink "Stage"}}Stage{{/crossLink}}, which sets a *stage* rendering
     * priority via its {{#crossLink "Stage/priority:property"}}priority{{/crossLink}} property.
     *
     * Fires a {{#crossLink "Layer/priority:event"}}{{/crossLink}} event on change.
     *
     * @property priority
     * @default 0
     * @type Number
     */
    set priority(value) {
        value = value || 0;
        this._core.priority = value;
        this._renderer.stateOrderDirty = true;

        /**
         * Fired whenever this Layer's  {{#crossLink "Layer/priority:property"}}{{/crossLink}} property changes.
         * @event priority
         * @param value The property's new value
         */
        this.fire("priority", value);
    },

    get priority() {
        return this._core.priority;
    },

    _compile: function (ctx) {
        this._renderer.layer = this._core;
    },

    _getJSON: function () {
        return {
            priority: this.priority
        };
    }
});
;"use strict";

/**
 A **Lights** is a group of light sources to apply to attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 A Lights may contain a virtually unlimited number of three types of light source:

 <ul>
 <li>{{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}s, which are fixed-intensity and fixed-color, and
 affect all the {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally,</li>
 <li>{{#crossLink "PointLight"}}PointLight{{/crossLink}}s, which emit light that
 originates from a single point and spreads outward in all directions, and </li>
 <li>{{#crossLink "DirLight"}}DirLight{{/crossLink}}s, which illuminate all the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally from a given direction</li>
 </ul>

 Within xeoEngine's <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model, the ambient,
 diffuse and specular components of light sources are multiplied by the
 {{#crossLink "Material/ambient:property"}}{{/crossLink}}, {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "Material/specular:property"}}{{/crossLink}} properties on attached  {{#crossLink "Material"}}Materials{{/crossLink}}.


 <img src="http://www.gliffy.com/go/publish/image/7092459/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that has a {{#crossLink "Geometry"}}{{/crossLink}},
 a {{#crossLink "Material"}}{{/crossLink}} and a {{#crossLink "Lights"}}{{/crossLink}}. The {{#crossLink "Lights"}}{{/crossLink}}
 contains an {{#crossLink "AmbientLight"}}{{/crossLink}}, a {{#crossLink "DirLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}}.


 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
 });

 // Within xeoEngine's lighting calculations, the AmbientLight's ambient color
 // will be multiplied by the Material's ambient color, while the DirLight and PointLight's
 // diffuse and specular colors will be multiplied by the Material's diffuse and specular colors

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"
 });

 var pointLight = new XEO.PointLight(scene, {
        pos: [0, 100, 100],
        diffuse: [0.5, 0.7, 0.5],
        specular: [1.0, 1.0, 1.0],
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        dirLight,
        pointLight
    ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
 });
 ````

 @class Lights
 @constructor
 @module XEO
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lights in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lights.
 @extends Component
 */
XEO.Lights = XEO.Component.extend({

    className: "XEO.Lights",

    type: "lights",

    _init: function (cfg) {

        this._lights = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        this.lights = cfg.lights;
    },

    set lights(value) {

        var light;

        // Unsubscribe from events on old lights        
        for (var i = 0, len = this._lights.length; i < len; i++) {
            light = this._lights[i];
            light.off(this._dirtySubs[i]);
            light.off(this._destroyedSubs[i]);
        }

        this._lights = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        var lights = [];
        var self = this;

        for (var i = 0, len = value.length; i < len; i++) {

            light = value[i];

            if (XEO._isString(light)) {

                // ID given for light - find the light component

                var id = light;
                light = this.components[id];
                if (!light) {
                    this.error("Light not found for ID: '" + id + "'");
                    continue;
                }
            }

            if (light.type != "light") {
                this.error("Component is not a light: '" + light.id + "'");
                continue;
            }

            this._lights.push(light);

            this._dirtySubs.push(light.on("dirty",
                function () {
                    self.fire("dirty", true);
                }));

            this._destroyedSubs.push(light.on("destroyed",
                function () {
                    var id = this.id; // Light ID
                    for (var i = 0, len = self._lights.length; i < len; i++) {
                        if (self._lights[i].id == id) {
                            self._lights = self._lights.slice(i, i + 1);
                            self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                            self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);
                            self.fire("dirty", true);
                            self.fire("lights", self._lights);
                            return;
                        }
                    }
                }));

            lights.push(light);
        }

        this.fire("dirty", true);
        this.fire("lights", this._lights);
    },

    get lights() {
        return this._lights.slice(0, this._lights.length);
    },

    _compile: function () {
        var lights = [];
        for (var i = 0, len = this._lights.length; i < len; i++) {
            lights.push(this._lights[i]._core)
        }
        var core = {
            type: "lights",
            lights: lights,
            hash: this._makeHash(lights)
        };
        this._renderer.lights = core;
    },

    _makeHash: function (lights) {
        if (lights.length == 0) {
            return "";
        }
        var parts = [];
        var light;
        for (var i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            parts.push(light.mode);
            if (light.specular) {
                parts.push("s");
            }
            if (light.diffuse) {
                parts.push("d");
            }
            parts.push((light.space == "world") ? "w" : "v");
        }
        return parts.join("");
    },

    _getJSON: function () {
        var lightIds = [];
        for (var i = 0, len = this._lights.length; i < len; i++) {
            lightIds.push(this._lights[i].id);
        }
        return {
            lights: lightIds
        };
    }
});;"use strict";

/**
 A **Lookat** defines a viewing transform as an {{#crossLink "Lookat/eye:property"}}eye{{/crossLink}} position, a
 {{#crossLink "Lookat/look:property"}}look{{/crossLink}} position and an {{#crossLink "Lookat/up:property"}}up{{/crossLink}}
 vector.

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with projection transforms such as
 {{#crossLink "Perspective"}}Perspective{{/crossLink}}, to define viewpoints on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895163/L.png"></img>

 ### Example

 In this example, we'll create a Lookat that positions the eye at -10 on the World-space Z-axis, while looking at the origin.
 Then we'll add that to a {{#crossLink "Camera"}}{{/crossLink}}. which we associate with a {{#crossLink "GameObject"}}{{/crossLink}}.

 ````Javascript
 var scene = new XEO.Scene();

 var myLookat = new XEO.Lookat(scene, {
       eye: [0,0,-10],
       look: [0,0,0],
       up: [0,1,0]
   });

 var camera = new XEO.Camera(scene, {
       view: myLookat
   });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });

 // Subscribe to changes on a camera property
 lookat.on("eye", function(value) {
       console.log("eye updated: " + value[0] + ", " + value[1] + ", " + value[2]);
   });

 // Set the value of a camera property, which fires the event we just subscribed to
 lookat.eye = [-5, 0, -10];

 // Get the value of a camera property
 var value = lookat.eye;

 // Destroy ths lookat, causing the camera to fall back on the scene's default viewing transform
 lookat.destroy();
 ````

 @class Lookat
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lookat in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lookat.
 @param [cfg.eye=[0,0,-10]] {Array of Number} Eye position.
 @param [cfg.look=[0,0,0]] {Array of Number} The position of the point-of-interest we're looking at.
 @param [cfg.up=[0,1,0]] {Array of Number} The "up" vector.
 @extends Component
 @author xeolabs / http://xeolabs.com/
 */
XEO.Lookat = XEO.Component.extend({

    className: "XEO.Lookat",

    type: "lookat",

    _init: function (cfg) {

        this.eye = cfg.eye;
        this.look = cfg.look;
        this.up = cfg.up;

        var core = this._core;

        var self = this;

        core.rebuild = function () {

            // Build matrix values

            core.matrix = XEO.math.lookAtMat4c(
                core.eye[0], core.eye[1], core.eye[2],
                core.look[0], core.look[1], core.look[2],
                core.up[0], core.up[1], core.up[2]);

            core.lookAt = {
                eye: core.eye,
                look: core.look,
                up: core.up
            };

            // Build typed arrays for view matrix and normal matrix
            // Avoid reallocating those if possible

            if (!core.mat) {

                // Create arrays

                core.mat = new Float32Array(core.matrix);
                core.normalMat = new Float32Array(
                    XEO.math.transposeMat4(XEO.math.inverseMat4(core.matrix, XEO.math.mat4())));

            } else {

                // Insert into existing arrays

                core.mat.set(core.matrix);
                core.normalMat.set(
                    XEO.math.transposeMat4(XEO.math.inverseMat4(core.matrix, XEO.math.mat4())));
            }

            /**
             * Fired whenever this Lookat's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is regenerated.
             * @event matrix
             * @param value The property's new value
             */
            self.fire("matrix", core.matrix);

            core.dirty = false;
        };

        this._core.dirty = true;
    },

    /**
     * Position of the eye.
     * Fires an {{#crossLink "Lookat/eye:event"}}{{/crossLink}} event on change.
     * @property eye
     * @default [0,0,-10]
     * @type Array(Number)
     */
    set eye(value) {
        value = value || [0, 0, -10];
        this._core.eye = value;
        this._core.dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Lookat's  {{#crossLink "Lookat/eye:property"}}{{/crossLink}} property changes.
         * @event eye
         * @param value The property's new value
         */
        this.fire("eye", value);
    },

    get eye() {
        return this._core.eye;
    },

    /**
     * Position of the point-of-interest.
     * Fires a {{#crossLink "Lookat/look:event"}}{{/crossLink}} event on change.
     * @property look
     * @default [0,0,0]
     * @type Array(Number)
     */
    set look(value) {
        value = value || [0, 0, 0];
        this._core.look = value;
        this._core.dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Lookat's  {{#crossLink "Lookat/look:property"}}{{/crossLink}} property changes.
         * @event look
         * @param value The property's new value
         */
        this.fire("look", value);
    },

    get look() {
        return this._core.look;
    },

    /**
     * Direction of the "up" vector.
     * Fires an {{#crossLink "Lookat/up:event"}}{{/crossLink}} event on change.
     * @property up
     * @default [0,1,0]
     * @type Array(Number)
     */
    set up(value) {
        value = value || [0, 1, 0];
        this._core.up = value;
        this._core.dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Lookat's  {{#crossLink "Lookat/up:property"}}{{/crossLink}} property changes.
         * @event up
         * @param value The property's new value
         */
        this.fire("up", value);
    },

    get up() {
        return this._core.up;
    },

    /**
     * The matrix for this viewing transform (read only). After any update to the
     * {{#crossLink "Lookat/look:event"}}{{/crossLink}}, {{#crossLink "Lookat/eye:event"}}{{/crossLink}} or
     * {{#crossLink "Lookat/up:event"}}{{/crossLink}} properties, this will be lazy-regenerated when next read, or
     * on the next {{#crossLink "Scene/tick:event"}}{{/crossLink}} event from the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}, whichever happens first. Whever this property is regenerated, it is
     * fired in a {{#crossLink "Lookat/matrix:event"}}{{/crossLink}} event.
     * @property matrix
     * @type Array(Number)
     */
    get matrix() {
        if (this._core.dirty) {
            this._core.rebuild();
        }
        return this._core.matrix.slice(0);
    },

    _compile: function () {
        this._renderer.viewTransform = this._core;
    },

    _getJSON: function () {
        return {
            eye: this.eye,
            look: this.look,
            up: this.up
        };
    }
});


XEO.Scene.prototype.newLookat = function (cfg) {
    return new XEO.Lookat(this, cfg);
};


;"use strict";

/**
 A **Matrix** defines a modelling transform as a 4x4 matrix, to apply to attached
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <img src="http://www.gliffy.com/go/publish/image/7123375/L.png"></img>

 ### Example

 @class Matrix
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Matrix in the
 default {{#crossLink "Scene"}}Scene{{/crossLink}}  when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 You only need to supply an ID if you need to be able to find the Matrix by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Matrix.
 @param [cfg.elements=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] {Array of Number} One-dimensional, sixteen element array of elements for the Matrix, an identity matrix by default.
 @extends Component
 */
XEO.Matrix = XEO.Component.extend({

    className: "XEO.Matrix",

    type: "transform",

    _init: function (cfg) {

        this.elements = cfg.elements;
    },

    /**
     * Sets the Matrix elements.
     *
     * Fires an {{#crossLink "Matrix/elements:event"}}{{/crossLink}} event on change.
     *
     * @property elements
     * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     * @type {Array of Number}
     */
    set elements(value) {
        value = value || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this._core.elements = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Matrix's  {{#crossLink "Matrix/elements:property"}}{{/crossLink}} property changes.
         * @event elements
         * @param value The property's new value
         */
        this.fire("elements", value);
    },

    get elements() {
        return this._core.elements;
    },

    _compile: function () {
        //this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            elements: this._core.elements
        };
    }
});

;"use strict";

/**
 A **Material** defines the surface appearance of attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>Materials interact with {{#crossLink "Lights"}}{{/crossLink}} using the <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model.</li>

 <li>Within xeoEngine's shading calculations, a Material's {{#crossLink "Material/ambient:property"}}{{/crossLink}}, {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "Material/specular:property"}}{{/crossLink}} properties are multiplied by corresponding color properties on attached
 {{#crossLink "PointLight"}}AmbientLights{{/crossLink}}, {{#crossLink "PointLight"}}PointLights{{/crossLink}} and {{#crossLink "DirLight"}}DirLights{{/crossLink}}.</li>

 <li>These Material properties, along with {{#crossLink "Material/emissive:property"}}{{/crossLink}},
 {{#crossLink "Material/opacity:property"}}{{/crossLink}} and {{#crossLink "Material/reflectivity:property"}}{{/crossLink}},
 specify attributes that are to be **applied uniformly** across the surface of attached {{#crossLink "Geometry"}}Geometries{{/crossLink}}.</li>

 <li>Most of those attributes can be textured, **effectively replacing the values set for those properties**, by
 assigning {{#crossLink "Texture"}}Textures{{/crossLink}} to the Material's
 {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}}, {{#crossLink "Material/specularMap:property"}}{{/crossLink}},
 {{#crossLink "Material/emissiveMap:property"}}{{/crossLink}}, {{#crossLink "Material/opacityMap:property"}}{{/crossLink}}
 and  {{#crossLink "Material/reflectivityMap:property"}}{{/crossLink}} properties</li>

 <li>For example, the value of {{#crossLink "Material/diffuse:property"}}{{/crossLink}} will be ignored if your
 Material also has a {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} set to a {{#crossLink "Texture"}}Texture{{/crossLink}}.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface, ie. they are not multiplied by
 the {{#crossLink "Material/diffuse:property"}}{{/crossLink}} for each pixel, as is done in many shading systems.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6921713/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "Texture"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}} as a diffuse map,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "DirLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 Note that the value for the {{#crossLink "Material"}}Material's{{/crossLink}} {{#crossLink "Material/diffuse:property"}}{{/crossLink}}
 property is ignored and redundant, since we assign a {{#crossLink "Texture"}}{{/crossLink}} to the
 {{#crossLink "Material"}}Material's{{/crossLink}} {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} property.
 The {{#crossLink "Texture"}}Texture's{{/crossLink}} pixel colors directly provide the diffuse color of each fragment across the
 {{#crossLink "Geometry"}}{{/crossLink}} surface.

 ```` javascript
 var scene = new XEO.Scene();

 var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
 });

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.5, 0.5, 0.0],   // Ignored, since we have assigned a Texture to diffuseMap, below
    diffuseMap: diffuseMap,
    specular:   [1. 1, 1],
    shininess:  30
});

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        dirLight
    ]
 });

 var geometry = new XEO.Geometry(scene); // Geometry without parameters will default to a 2x2x2 box.

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````

 @class Material
 @module XEO
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Material within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The Material configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this Material.
 @param [cfg.ambient=[0.7, 0.7, 0.8 ]] {Array of Number} Material ambient color. Multiplied by {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}} {{#crossLink "AmbientLight/ambient:property"}}color{{/crossLink}}.
 @param [cfg.diffuse=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material diffuse color. Multiplied by {{#crossLink "PointLight"}}PointLight{{/crossLink}} {{#crossLink "PointLight/diffuse:property"}}diffuse{{/crossLink}} and {{#crossLink "DirLight"}}DirLight{{/crossLink}} {{#crossLink "DirLight/diffuse:property"}}diffuse{{/crossLink}}
 @param [cfg.specular=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material specular color. Multiplied by {{#crossLink "PointLight"}}PointLight{{/crossLink}} {{#crossLink "PointLight/specular:property"}}specular{{/crossLink}} and {{#crossLink "DirLight"}}DirLight{{/crossLink}} {{#crossLink "DirLight/specular:property"}}specular{{/crossLink}}
 @param [cfg.emissive=[ 1.0, 1.0, 1.0 ]] {Array of Number} Material emissive color.
 @param [cfg.opacity=1] {Number} Scalar in range 0-1 that controls opacity, where 0 is completely transparent and 1 is completely opaque.
 Only applies while {{#crossLink "Modes"}}Modes{{/crossLink}} {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}} equals ````true````.
 @param [cfg.shininess=30] {Number} Scalar in range 0-70 that determines the size and sharpness of specular highlights.
 @param [cfg.reflectivity=1] {Number} Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected.
 @param [cfg.diffuseMap=null] {Texture} A diffuse map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the diffuse property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 @param [cfg.specularMap=null] {Texture} A specular map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the specular property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 @param [cfg.emissiveMap=null] {Texture} An emissive map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the emissive property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 @param [cfg.bumpMap=null] {Texture} A bump map {{#crossLink "Texture"}}Texture{{/crossLink}}. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 @param [cfg.opacityMap=null] {Texture} An opacity map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the opacity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 @param [cfg.reflectivityMap=null] {Texture} A reflectivity control map {{#crossLink "Texture"}}Texture{{/crossLink}}, which will override the effect of the reflectivity property. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Material.
 */
XEO.Material = XEO.Component.extend({


    className: "XEO.Material",

    type: "material",

    _init: function (cfg) {

        this._textures = [];
        this._dirtyTextureSubs = [];
        this._destroyedTextureSubs = [];

        this.ambient = cfg.ambient;
        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.emissive = cfg.emissive;

        this.opacity = cfg.opacity;
        this.shininess = cfg.shininess;
        this.reflectivity = cfg.reflectivity;

        this.bumpMap = cfg.bumpMap;
        this.diffuseMap = cfg.diffuseMap;
        this.specularMap = cfg.specularMap;
        this.emissiveMap = cfg.emissiveMap;
        this.opacityMap = cfg.opacityMap;
        this.reflectivityMap = cfg.reflectivityMap;
    },

    /**
     The Material's ambient color, which is multiplied by the {{#crossLink "AmbientLight/ambient:property"}}{{/crossLink}}
     property of the {{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}.

     Fires a {{#crossLink "Material/ambient:event"}}{{/crossLink}} event on change.

     @property ambient
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set ambient(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.ambient = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/ambient:property"}}{{/crossLink}} property changes.
         * @event ambient
         * @param value {Array(Number)} The property's new value
         */
        this.fire("ambient", value);
    },

    get ambient() {
        return this._core.ambient;
    },

    /**
     The Material's diffuse color.

     This property may be overridden by {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}}.

     Fires a {{#crossLink "Material/diffuse:event"}}{{/crossLink}} event on change.

     @property diffuse
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set diffuse(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.diffuse = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/diffuse:property"}}{{/crossLink}} property changes.
         * @event diffuse
         * @param value {Array(Number)} The property's new value
         */
        this.fire("diffuse", value);
    },

    get diffuse() {
        return this._core.diffuse;
    },

    /**
     The material's specular color.

     This property may be overridden by {{#crossLink "Material/specularMap:property"}}{{/crossLink}}.

     Fires a {{#crossLink "Material/specular:event"}}{{/crossLink}} event on change.

     @property specular
     @default [0.3, 0.3, 0.3]
     @type Array(Number)
     */
    set specular(value) {
        value = value || [ 0.3, 0.3, 0.3 ];
        this._core.specular = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Material's {{#crossLink "Material/specular:property"}}{{/crossLink}} property changes.
         @event specular
         @param value {Array(Number)} The property's new value
         */
        this.fire("specular", value);
    },

    get specular() {
        return this._core.specular;
    },

    /**
     The Material's emissive color.

     This property may be overridden by {{#crossLink "Material/emissiveMap:property"}}{{/crossLink}}.

     Fires a {{#crossLink "Material/emissive:event"}}{{/crossLink}} event on change.

     @property emissive
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set emissive(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.emissive = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Material's {{#crossLink "Material/emissive:property"}}{{/crossLink}} property changes.
         @event emissive
         @param value {Array(Number)} The property's new value
         */
        this.fire("emissive", value);
    },

    get emissive() {
        return this._core.emissive;
    },

    /**
     Factor in the range [0..1] indicating how transparent the Material is.

     A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

     Attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} will appear transparent only if they are also attached
     to {{#crossLink "Modes"}}Modes{{/crossLink}} that have {{#crossLink "Modes/transparent:property"}}transparent{{/crossLink}}
     set to **true**.

     This property may be overridden by {{#crossLink "Material/opacityMap:property"}}{{/crossLink}}.

     Fires an {{#crossLink "Material/opacity:event"}}{{/crossLink}} event on change.

     @property opacity
     @default 1.0
     @type Number
     */
    set opacity(value) {
        value = value != undefined ? value : 1;
        this._core.opacity = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Material's {{#crossLink "Material/opacity:property"}}{{/crossLink}} property changes.
         * @event opacity
         * @param value {Number} The property's new value
         */
        this.fire("opacity", value);
    },

    get opacity() {
        return this._core.opacity;
    },

    /**
     A factor in range [0..128] that determines the size and sharpness of the specular highlights create by this Material.

     Larger values produce smaller, sharper highlights. A value of 0.0 gives very large highlights that are almost never
     desirable. Try values close to 10 for a larger, fuzzier highlight and values of 100 or more for a small, sharp
     highlight.

     Fires a {{#crossLink "Material/shininess:event"}}{{/crossLink}} event on change.

     @property shininess
     @default 30.0
     @type Number
     */
    set shininess(value) {
        value = value != undefined ? value : 30;
        this._core.shininess = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Material's {{#crossLink "Material/shininess:property"}}{{/crossLink}} property changes.
         @event shininess
         @param value Number The property's new value
         */
        this.fire("shininess", value);
    },

    get shininess() {
        return this._core.shininess;
    },

    /**
     Scalar in range 0-1 that controls how much {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} is reflected by this Material.

     The surface will be non-reflective when this is 0, and completely mirror-like when it is 1.0.

     This property may be overridden by {{#crossLink "Material/reflectivityMap:property"}}{{/crossLink}}.

     Fires a {{#crossLink "Material/reflectivity:event"}}{{/crossLink}} event on change.

     @property reflectivity
     @default 1.0
     @type Number
     */
    set reflectivity(value) {
        value = value != undefined ? value : 1.0;
        this._core.reflectivity = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this Material's {{#crossLink "Material/reflectivity:property"}}{{/crossLink}} property changes.
         @event reflectivity
         @param value Number The property's new value
         */
        this.fire("reflectivity", value);
    },

    get reflectivity() {
        return this._core.reflectivity;
    },

    /**
     A diffuse {{#crossLink "Texture"}}{{/crossLink}} attached to this Material.

     This property overrides {{#crossLink "Material/diffuseMap:property"}}{{/crossLink}} when not null or undefined.

     Fires a {{#crossLink "Material/diffuseMap:event"}}{{/crossLink}} event on change.

     @property diffuseMap
     @default null
     @type {Texture}
     */
    set diffuseMap(texture) {
        this._attachTexture("diffuseMap", texture);

        /**
         Fired whenever this Material's {{#crossLink "Material/diffuse:property"}}{{/crossLink}} property changes.
         @event diffuseMap
         @param value Number The property's new value
         */
    },

    get diffuseMap() {
        return this._textures["diffuseMap"];
    },

    /**
     A specular {{#crossLink "Texture"}}{{/crossLink}} attached to this Material.

     This property overrides {{#crossLink "Material/specular:property"}}{{/crossLink}} when not null or undefined.

     Fires a {{#crossLink "Material/specularMap:event"}}{{/crossLink}} event on change.

     @property specularMap
     @default null
     @type {Texture}
     */
    set specularMap(texture) {
        this._attachTexture("specularMap", texture);

        /**
         Fired whenever this Material's {{#crossLink "Material/specularMap:property"}}{{/crossLink}} property changes.
         @event specularMap
         @param value Number The property's new value
         */
    },

    get specularMap() {
        return this._textures["specularMap"];
    },

    /**
     An emissive {{#crossLink "Texture"}}{{/crossLink}} attached to this Material.

     This property overrides {{#crossLink "Material/emissive:property"}}{{/crossLink}} when not null or undefined.

     Fires an {{#crossLink "Material/emissiveMap:event"}}{{/crossLink}} event on change.

     @property emissiveMap
     @default null
     @type {Texture}
     */
    set emissiveMap(texture) {
        this._attachTexture("emissiveMap", texture);

        /**
         Fired whenever this Material's {{#crossLink "Material/emissiveMap:property"}}{{/crossLink}} property changes.
         @event emissiveMap
         @param value Number The property's new value
         */
    },

    get emissiveMap() {
        return this._textures["emissiveMap"];
    },

    /**
     An opacity {{#crossLink "Texture"}}{{/crossLink}} attached to this Material.

     This property overrides {{#crossLink "Material/opacity:property"}}{{/crossLink}} when not null or undefined.

     Fires an {{#crossLink "Material/opacityMap:event"}}{{/crossLink}} event on change.

     @property opacityMap
     @default null
     @type {Texture}
     */
    set opacityMap(texture) {
        this._attachTexture("opacityMap", texture);

        /**
         Fired whenever this Material's {{#crossLink "Material/opacityMap:property"}}{{/crossLink}} property changes.
         @event opacityMap
         @param value Number The property's new value
         */
    },

    get opacityMap() {
        return this._textures["opacityMap"];
    },

    /**
     A reflectivity {{#crossLink "Texture"}}{{/crossLink}} attached to this Material.

     This property overrides {{#crossLink "Material/reflectivity:property"}}{{/crossLink}} when not null or undefined.

     Fires a {{#crossLink "Material/reflectivityMap:event"}}{{/crossLink}} event on change.

     @property reflectivityMap
     @default null
     @type {Texture}
     */
    set reflectivityMap(texture) {
        this._attachTexture("reflectivityMap", texture);

        /**
         Fired whenever this Material's {{#crossLink "Material/reflectivityMap:property"}}{{/crossLink}} property changes.
         @event reflectivityMap
         @param value Number The property's new value
         */
    },

    get reflectivityMap() {
        return this._textures["reflectivityMap"];
    },

    _attachTexture: function (type, texture) {

        if (XEO._isString(texture)) {

            // ID given for texture - find the texture component
            var id = texture;

            texture = this.scene.components[id];

            if (!texture) {
                this.error("Texture not found for ID: '" + id + "'");
                return;
            }
        }

        if (texture.type != "texture") {
            this.error("Component is not a texture: '" + id + "'");
            return;
        }

        var oldTexture = this._textures[type];

        if (oldTexture) {

            // Replacing old texture

            oldTexture.off(this._dirtyTextureSubs[type]);
            oldTexture.off(this._destroyedTextureSubs[type]);
        }

        var self = this;

        this._dirtyTextureSubs[type] = texture.on("dirty", function () {
            self.fire("dirty", true);
        });

        this._dirtyTextureSubs[type] = texture.on("destroyed",
            function () {
                delete self._dirtyTextureSubs[type];
                delete self._destroyedTextureSubs[type];
                self.fire("dirty", true);
                self.fire(type, null);
            });

        this._textures[type] = texture;

        this.fire(type, texture);
    },

    _compile: function () {
        // Set material state on renderer
        this._renderer.material = this._core;
        // Set texture state on renderer
        var layers = [];
        for (var i = 0, len = this._textures.length; i < len; i++) {
            layers.push(this._textures[i]._core);
        }
        var core = {
            type: "texture",
            bumpMap: this.bumpMap ? this.bumpMap._core : null,
            diffuseMap: this.diffuseMap ? this.diffuseMap._core : null,
            specularMap: this.specularMap ? this.specularMap._core : null,
            emissiveMap: this.emissiveMap ? this.emissiveMap._core : null,
            opacityMap: this.opacityMap ? this.opacityMap._core : null,
            reflectivityMap: this.reflectivityMap ? this.reflectivityMap._core : null,
            hash: this._makeTexturesHash()
        };

        this._renderer.texture = core;
    },

    // Texture hash helps reuse pooled shaders
    _makeTexturesHash: function (layers) {
        var hash = [];
        if (this.bumpMap) {
            hash.push("/b");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.diffuseMap) {
            hash.push("/d");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.specularMap) {
            hash.push("/s");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.emissiveMap) {
            hash.push("/e");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.opacityMap) {
            hash.push("/o");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        if (this.reflectivityMap) {
            hash.push("/r");
            if (this.bumpMap.matrix) {
                hash.push("/anim");
            }
        }
        return  hash.join("");
    },

    _getJSON: function () {

        var json = {

            // Colors

            ambient: this.ambient,
            diffuse: this.diffuse,
            specular: this.specular,
            emissive: this.emissive,

            // Factors

            opacity: this.opacity,
            shininess: this.shininess,
            reflectivity: this.reflectivity
        };

        // Textures

        if (this.bumpMap) {
            json.bumpMap = this.bumpMap.id;
        }
        if (this.diffuseMap) {
            json.diffuseMap = this.diffuseMap.id;
        }
        if (this.specularMap) {
            json.specularMap = this.specularMap.id;
        }
        if (this.emissiveMap) {
            json.emissiveMap = this.emissiveMap.id;
        }
        if (this.opacityMap) {
            json.opacityMap = this.opacityMap.id;
        }
        if (this.reflectivityMap) {
            json.reflectivityMap = this.reflectivityMap.id;
        }

        return json;
    }
});;"use strict";

/**
 A **GameObject** is an entity within a xeoEngine {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <ul>
 <li>See the {{#crossLink "Scene"}}Scene{{/crossLink}} class for more information on GameObjects.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7122967/L.png"></img>

 @class GameObject
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this GameObject within xeoEngine's default {{#crossLink "XEO/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GameObject.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} to attach to this GameObject.  Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.clips] {String|Clips} ID or instance of a {{#crossLink "Clips"}}Clips{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/clips:property"}}clips{{/crossLink}}.
 @param [cfg.colorTarget] {String|ColorTarget} ID or instance of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}}.
 @param [cfg.depthTarget] {String|DepthTarget} ID or instance of a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}}.
 @param [cfg.depthBuf] {String|DepthBuf} ID or instance of a {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, depth {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}}.
 @param [cfg.visibility] {String|Visibility} ID or instance of a {{#crossLink "Visibility"}}Visibility{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}}.
 @param [cfg.modes] {String|Modes} ID or instance of a {{#crossLink "Modes"}}Modes{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/modes:property"}}modes{{/crossLink}}.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.layer] {String|Layer} ID or instance of a {{#crossLink "Layer"}}Layer{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/layer:property"}}layer{{/crossLink}}.
 @param [cfg.lights] {String|Lights} ID or instance of a {{#crossLink "Lights"}}Lights{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/lights:property"}}lights{{/crossLink}}.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.morphTargets] {String|MorphTargets} ID or instance of a {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s
 default instance, {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}}.
 @param [cfg.reflect] {String|Reflect} ID or instance of a {{#crossLink "CubeMap"}}CubeMap{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/reflect:property"}}reflection{{/crossLink}}.
 @param [cfg.shader] {String|Shader} ID or instance of a {{#crossLink "Shader"}}Shader{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shader:property"}}shader{{/crossLink}}.
 @param [cfg.shaderParams] {String|ShaderParams} ID or instance of a {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}}.
 @param [cfg.stage] {String|Stage} ID or instance of of a {{#crossLink "Stage"}}Stage{{/crossLink}} to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this GameObject. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @extends Component
 */

/**
 * Fired when this GameObject is *picked* via a call to the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method
 * on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas {{/crossLink}}.
 * @event picked
 * @param {String} objectId The ID of this GameObject.
 * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
 * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
 */

XEO.GameObject = XEO.Component.extend({

    className: "XEO.GameObject",

    type: "object",

    _init: function (cfg) {

        this.camera = cfg.camera;
        this.clips = cfg.clips;
        this.colorTarget = cfg.colorTarget;
        this.colorBuf = cfg.colorBuf;
        this.depthTarget = cfg.depthTarget;
        this.depthBuf = cfg.depthBuf;
        this.visibility = cfg.visibility;
        this.modes = cfg.modes;
        this.geometry = cfg.geometry;
        this.layer = cfg.layer;
        this.lights = cfg.lights;
        this.material = cfg.material;
        this.morphTargets = cfg.morphTargets;
        this.reflect = cfg.reflect;
        this.shader = cfg.shader;
        this.shaderParams = cfg.shaderParams;
        this.stage = cfg.stage;
        this.transform = cfg.transform;
    },

    /**
     * The {{#crossLink "Camera"}}Camera{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/camera:property"}}camera{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/camera:event"}}{{/crossLink}} event on change.
     * @property camera
     * @type Camera
     */
    set camera(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/camera:property"}}{{/crossLink}} property changes.
         * @event camera
         * @param value The property's new value
         */
        this._setChild("camera", value);
    },

    get camera() {
        return this._children.camera;
    },

    /**
     * The {{#crossLink "Clips"}}Clips{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/clips:property"}}clips{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/clips:event"}}{{/crossLink}} event on change.
     * @property clips
     * @type Clips
     */
    set clips(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/clips:property"}}{{/crossLink}} property changes.
         * @event clips
         * @param value The property's new value
         */
        this._setChild("clips", value);
    },

    get clips() {
        return this._children.clips;
    },

    /**
     * The {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorTarget:property"}}colorTarget{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/colorTarget:event"}}{{/crossLink}} event on change.
     * @property colorTarget
     * @type ColorTarget
     */
    set colorTarget(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/colorTarget:property"}}{{/crossLink}} property changes.
         * @event colorTarget
         * @param value The property's new value
         */
        this._setChild("colorTarget", value);
    },

    get colorTarget() {
        return this._children.colorTarget;
    },

    /**
     * The {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/colorBuf:property"}}colorBuf{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/colorBuf:event"}}{{/crossLink}} event on change.
     * @property colorBuf
     * @type ColorBuf
     */
    set colorBuf(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/colorBuf:property"}}{{/crossLink}} property changes.
         * @event colorBuf
         * @param value The property's new value
         */
        this._setChild("colorBuf", value);
    },

    get colorBuf() {
        return this._children.colorBuf;
    },

    /**
     * The {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthTarget:property"}}depthTarget{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/depthTarget:event"}}{{/crossLink}} event on change.
     * @property depthTarget
     * @type DepthTarget
     */
    set depthTarget(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/depthTarget:property"}}{{/crossLink}} property changes.
         * @event depthTarget
         * @param value The property's new value
         */
        this._setChild("depthTarget", value);
    },

    get depthTarget() {
        return this._children.depthTarget;
    },

    /**
     * The {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the
     * parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/depthBuf:property"}}depthBuf{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/depthBuf:event"}}{{/crossLink}} event on change.
     * @property depthBuf
     * @type DepthBuf
     */
    set depthBuf(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/depthBuf:property"}}{{/crossLink}} property changes.
         * @event depthBuf
         * @param value The property's new value
         */
        this._setChild("depthBuf", value);
    },

    get depthBuf() {
        return this._children.depthBuf;
    },

    /**
     * The {{#crossLink "Visibility"}}Visibility{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/visibility:property"}}visibility{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/visibility:event"}}{{/crossLink}} event on change.
     * @property visibility
     * @type Visibility
     */
    set visibility(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/visibility:property"}}{{/crossLink}} property changes.
         * @event visibility
         * @param value The property's new value
         */
        this._setChild("visibility", value);
    },

    get visibility() {
        return this._children.visibility;
    },

    /**
     * The {{#crossLink "Modes"}}Modes{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/modes:property"}}modes{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/modes:event"}}{{/crossLink}} event on change.
     * @property modes
     * @type Modes
     */
    set modes(value) {

        /**
         * Fired whenever this GameObject's {{#crossLink "GameObject/modes:property"}}{{/crossLink}} property changes.
         * @event modes
         * @param value The property's new value
         */
        this._setChild("modes", value);
    },

    get modes() {
        return this._children.modes;
    },

    /**
     * The {{#crossLink "Geometry"}}Geometry{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/geometry:property"}}camera{{/crossLink}}
     * (a simple box) when set to a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/geometry:event"}}{{/crossLink}} event on change.
     * @property geometry
     * @type Geometry
     */
    set geometry(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/geometry:property"}}{{/crossLink}} property changes.
         * @event visibility
         * @param value The property's new value
         */
        this._setChild("geometry", value);
    },

    get geometry() {
        return this._children.geometry;
    },

    /**
     * The {{#crossLink "Layer"}}Layer{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/layer:property"}}layer{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/layer:event"}}{{/crossLink}} event on change.
     * @property layer
     * @type Layer
     */
    set layer(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/layer:property"}}{{/crossLink}} property changes.
         * @event layer
         * @param value The property's new value
         */
        this._setChild("layer", value);
    },

    get layer() {
        return this._children.layer;
    },

    /**
     * The {{#crossLink "Lights"}}Lights{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/lights:property"}}lights{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/lights:event"}}{{/crossLink}} event on change.
     * @property lights
     * @type Lights
     */
    set lights(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/lights:property"}}{{/crossLink}} property changes.
         * @event lights
         * @param value The property's new value
         */
        this._setChild("lights", value);
    },

    get lights() {
        return this._children.lights;
    },

    /**
     * The {{#crossLink "Material"}}Material{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/material:property"}}material{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/material:event"}}{{/crossLink}} event on change.
     * @property material
     * @type Material
     */
    set material(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/material:property"}}{{/crossLink}} property changes.
         * @event material
         * @param value The property's new value
         */
        this._setChild("material", value);
    },

    get material() {
        return this._children.material;
    },

    /**
     * The {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/morphTargets:property"}}morphTargets{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/morphTargets:event"}}{{/crossLink}} event on change.
     * @property morphTargets
     * @type MorphTargets
     */
    set morphTargets(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/morphTargets:property"}}{{/crossLink}} property changes.
         * @event morphTargets
         * @param value The property's new value
         */
        this._setChild("morphTargets", value);
    },

    get morphTargets() {
        return this._children.morphTargets;
    },

    /**
     * The {{#crossLink "Reflect"}}Reflect{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/reflect:property"}}reflect{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/reflect:event"}}{{/crossLink}} event on change.
     * @property reflect
     * @type Reflect
     */
    set reflect(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/reflect:property"}}{{/crossLink}} property changes.
         * @event reflect
         * @param value The property's new value
         */
        this._setChild("reflect", value);
    },

    get reflect() {
        return this._children.reflect;
    },

    /**
     * The {{#crossLink "Shader"}}Shader{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shader:property"}}shader{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/shader:event"}}{{/crossLink}} event on change.
     * @property shader
     * @type Shader
     */
    set shader(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/shader:property"}}{{/crossLink}} property changes.
         * @event shader
         * @param value The property's new value
         */
        this._setChild("shader", value);
    },

    get shader() {
        return this._children.shader;
    },

    /**
     * The {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/shaderParams:property"}}shaderParams{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/shaderParams:event"}}{{/crossLink}} event on change.
     * @property shaderParams
     * @type ShaderParams
     */
    set shaderParams(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/shaderParams:property"}}{{/crossLink}} property changes.
         * @event shaderParams
         * @param value The property's new value
         */
        this._setChild("shaderParams", value);
    },

    get shaderParams() {
        return this._children.shaderParams;
    },

    /**
     * The {{#crossLink "Stage"}}Stage{{/crossLink}} attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/stage:property"}}stage{{/crossLink}} when set to
     * a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/stage:event"}}{{/crossLink}} event on change.
     * @property stage
     * @type Stage
     */
    set stage(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/stage:property"}}{{/crossLink}} property changes.
         * @event stage
         * @param value The property's new value
         */
        this._setChild("stage", value);
    },

    get stage() {
        return this._children.stage;
    },

    /**
     * The modelling transform attached to this GameObject.
     *
     * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GameObject. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/transform:property"}}transform{{/crossLink}}
     * (an identity matrix) when set to a null or undefined value.
     *
     * Fires a {{#crossLink "GameObject/transform:event"}}{{/crossLink}} event on change.
     *
     * @property transform
     * @type Component
     */
    set transform(value) {

        /**
         * Fired whenever this GameObject's  {{#crossLink "GameObject/transform:property"}}{{/crossLink}} property changes.
         * @event transform
         * @param value The property's new value
         */
        this._setChild("transform", value);
    },

    get transform() {
        return this._children.transform;
    },

    _compile: function () {

        // Set states attached to this GameObject on the renderer

        var children = this._children;

        children.camera._compile();
        children.clips._compile();
        children.colorTarget._compile();
        children.colorBuf._compile();
        children.depthTarget._compile();
        children.depthBuf._compile();
        children.visibility._compile();
        children.modes._compile();
        children.geometry._compile();
        children.layer._compile();
        children.lights._compile();
        children.material._compile();
        children.morphTargets._compile();
        children.reflect._compile();
        children.shader._compile();
        children.shaderParams._compile();
        children.stage._compile();
        children.transform._compile();

        // (Re)build this GameObject in the renderer

        this._renderer.buildGameObject(this.id);
    },

    _getJSON: function () {
        return {
            camera: this.camera.id,
            clips: this.clips.id,
            colorTarget: this.colorTarget.id,
            colorBuf: this.colorBuf.id,
            depthTarget: this.depthTarget.id,
            depthBuf: this.depthBuf.id,
            visibility: this.visibility.id,
            modes: this.modes.id,
            geometry: this.geometry.id,
            layer: this.layer.id,
            lights: this.lights.id,
            material: this.material.id,
            morphTargets: this.morphTargets.id,
            reflect: this.reflect.id,
            shader: this.shader.id,
            shaderParams: this.shaderParams.id,
            stage: this.stage.id,
            transform: this.transform.id
        };
    },

    _destroy: function () {

        this._renderer.removeGameObject(this.id);
    }
});





;"use strict";

/**
 An **Ortho** component defines an orthographic projection transform.

 <ul>
 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7097089/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and an Ortho
 projection transform.

 ````Javascript
 var scene = new XEO.Scene();

 var ortho = new XEO.Ortho(scene, {
    left:       1.0,    // Position of the left plane on the View-space X-axis
    right:      1.0,    // Position of the right plane on the View-space X-axis
    top:        1.0,    // Position of the top plane on the View-space Y-axis.
    bottom :   -1.0,    // Position of the bottom plane on the View-space Y-axis.
    near:       0.1,    // Position of the near plane on the View-space Z-axis.
    far:        10000   // Position of the far plane on the positive View-space Z-axis.
 });

 var camera = new XEO.Camera(scene, {
       project: ortho
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });
 ````

 @class Ortho
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Ortho within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Ortho.
 @param [cfg.left=-1.0] {Number} Position of the left plane on the View-space X-axis.
 @param [cfg.right=1.0] {Number} Position of the right plane on the View-space X-axis.
 @param [cfg.top=1.0] {Number} Position of the top plane on the View-space Y-axis.
 @param [cfg.bottom=-1.0] {Number} Position of the bottom plane on the View-space Y-axis.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @extends Component
 */
XEO.Ortho = XEO.Component.extend({

    className: "XEO.Ortho",

    type: "project",

    _init: function (cfg) {

        this.mode = "ortho";

        this.left = cfg.left;
        this.right = cfg.right;
        this.top = cfg.top;
        this.bottom = cfg.bottom;
        this.near = cfg.near;
        this.far = cfg.far;

        var self = this;

        // Lazy-rebuild matrix on each scene tick
        this._onTick = this.scene.on("tick",
            function (c) {
                if (self._dirty) {
                    self._rebuild();
                }
            });
    },

    _rebuild: function () {

        var core = this._core;

        // Build matrix values
        core.matrix = XEO.math.orthoMat4c(core.left, core.right, core.bottom, core.top, core.near, core.far, []);

        // Build typed array, avoid reallocating
        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }

        this.fire("matrix", core.matrix);

        this._dirty = false;
    },

    /**
     * Position of the left plane on the View-space X-axis.
     * Fires a {{#crossLink "Ortho/left:event"}}{{/crossLink}} event on change.
     * @property left
     * @default -1.0
     * @type Number
     */
    set left(value) {
        value = value || -1.0;
        this._core.left = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/left:property"}}{{/crossLink}} property changes.
         * @event left
         * @param value The property's new value
         */
        this.fire("left", value);
    },

    get left() {
        return this._core.left;
    },

    /**
     * Position of the right plane on the View-space X-axis.
     * Fires a {{#crossLink "Ortho/right:event"}}{{/crossLink}} event on change.
     * @property right
     * @default 1.0
     * @type Number
     */
    set right(value) {
        value = value || 1.0;
        this._core.right = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/right:property"}}{{/crossLink}} property changes.
         * @event right
         * @param value The property's new value
         */
        this.fire("right", value);
    },

    get right() {
        return this._core.right;
    },

    /**
     * Position of the top plane on the View-space Y-axis.
     * Fires a {{#crossLink "Ortho/top:event"}}{{/crossLink}} event on change.
     * @property top
     * @default 1.0
     * @type Number
     */
    set top(value) {
        value = value || 1.0;
        this._core.top = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/top:property"}}{{/crossLink}} property changes.
         * @event top
         * @param value The property's new value
         */
        this.fire("top", value);
    },

    get top() {
        return this._core.top;
    },

    /**
     * Position of the bottom plane on the View-space Y-axis.
     * Fires a {{#crossLink "Ortho/bottom:event"}}{{/crossLink}} event on change.
     * @property bottom
     * @default -1.0
     * @type Number
     */
    set bottom(value) {
        value = value || -1.0;
        this._core.bottom = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/bottom:property"}}{{/crossLink}} property changes.
         * @event bottom
         * @param value The property's new value
         */
        this.fire("bottom", value);
    },

    get bottom() {
        return this._core.bottom;
    },

    /**
     * Position of the near plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Ortho/near:event"}}{{/crossLink}} event on change.
     * @property near
     * @default 0.1
     * @type Number
     */
    set near(value) {
        value = value || 0.1;
        this._core.near = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's  {{#crossLink "Ortho/near:property"}}{{/crossLink}} property changes.
         * @event near
         * @param value The property's new value
         */
        this.fire("near", value);
    },

    get near() {
        return this._core.near;
    },

    /**
     * Position of the far plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Ortho/far:event"}}{{/crossLink}} event on change.
     * @property far
     * @default 10000.0
     * @type Number
     */
    set far(value) {
        value = value || 10000.0;
        this._core.far = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Ortho's {{#crossLink "Ortho/far:property"}}{{/crossLink}} property changes.
         * @event far
         * @param value The property's new value
         */
        this.fire("far", value);
    },

    get far() {
        return this._core.far;
    },

    get matrix() {
        if (this._dirty) {
            this._core.rebuild();
        }
        return this._core.matrix.slice(0);
    },

    _compile: function () {
        this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
            near: this.near,
            far: this.far
        };
    },

    _destroy: function () {
        this.scene.off(this._onTick);
    }
});

;"use strict";

/**
 A **Perspective** component defines a perspective projection transform.

 <ul>

 <li>{{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6895185/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}GameObject{{/crossLink}} that's attached to a
 {{#crossLink "Camera"}}Camera{{/crossLink}} that has a {{#crossLink "Lookat"}}Lookat{{/crossLink}} view transform and a Perspective
 projection transform.

 ````Javascript
 var scene = new XEO.Scene();

 var perspective = new XEO.Perspective(scene, {
       fovy: 60,
       near: 0.1,
       far: 1000
   });

 var camera = new XEO.Camera(scene, {
       project: perspective
   });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    camera: camera,
    geometry: geometry
 });
 ````

 @class Perspective
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Perspective within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Perspective.
 @param [cfg.fovy=60.0] {Number} Field-of-view angle on Y-axis.
 @param [cfg.aspect=1.0] {Number} Aspect ratio.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the positive View-space Z-axis.
 @extends Component
 */
XEO.Perspective = XEO.Component.extend({

    className: "XEO.Perspective",

    type: "project",

    _init: function (cfg) {

        this.mode = "perspective";

        var canvas = this.scene.canvas;

        this.fovy = cfg.fovy;
        this.aspect = canvas.width / canvas.height;
        this.near = cfg.near;
        this.far = cfg.far;

        var self = this;

        // Recompute aspect from change in canvas size
        this._canvasResized = this.scene.canvas.on("resized",
            function () {
                self.aspect = canvas.width / canvas.height;
            });

        // Lazy-rebuild matrix on each scene tick
        this._tick = this.scene.on("tick",
            function (c) {
                if (self._dirty) {
                    self._rebuild();
                }
            });
    },

    _rebuild: function () {

        var core = this._core;

        // Build matrix values
        core.matrix = XEO.math.perspectiveMatrix4(core.fovy * Math.PI / 180.0, core.aspect, core.near, core.far);

        // Build typed array, avoid reallocating
        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }

        this.fire("matrix", core.matrix);

        this._dirty = false;
    },

    /**
     * Field-of-view angle on Y-axis, in degrees.
     * Fires a {{#crossLink "Perspective/fovy:event"}}{{/crossLink}} event on change.
     * @property fovy
     * @default 60.0
     * @type Number
     */
    set fovy(value) {
        value = value || 60.0;
        this._core.fovy = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's   {{#crossLink "Perspective/fovy:property"}}{{/crossLink}} property changes.
         * @event fovy
         * @param value The property's new value
         */
        this.fire("fovy", value);
    },

    get fovy() {
        return this._core.fovy;
    },

    /**
     * Aspect ratio of the perspective frustum. This is effectively the height of the frustum divided by the width.
     * Fires an {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} event on change.
     * @property aspect
     * @default 60.0
     * @type Number
     */
    set aspect(value) {
        value = value || 1.0;
        this._core.aspect = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's   {{#crossLink "Perspective/aspect:property"}}{{/crossLink}} property changes.
         * @event aspect
         * @param value The property's new value
         */
        this.fire("aspect", value);
    },

    get aspect() {
        return this._core.aspect;
    },

    /**
     * Position of the near plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Perspective/near:event"}}{{/crossLink}} event on change.
     * @property near
     * @default 0.1
     * @type Number
     */
    set near(value) {
        value = value || 0.1;
        this._core.near = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's   {{#crossLink "Perspective/near:property"}}{{/crossLink}} property changes.
         * @event near
         * @param value The property's new value
         */
        this.fire("near", value);
    },

    get near() {
        return this._core.near;
    },

    /**
     * Position of the far plane on the positive View-space Z-axis.
     * Fires a {{#crossLink "Perspective/far:event"}}{{/crossLink}} event on change.
     * @property far
     * @default 10000.0
     * @type Number
     */
    set far(value) {
        value = value || 10000.0;
        this._core.far = value;
        this._dirty = true;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Perspective's  {{#crossLink "Perspective/far:property"}}{{/crossLink}} property changes.
         * @event far
         * @param value The property's new value
         */
        this.fire("far", value);
    },

    get far() {
        return this._core.far;
    },

    get matrix() {
        if (this._dirty) {
            this._core.rebuild();
        }
        return this._core.matrix.slice(0);
    },

    _compile: function () {
        this._renderer.cameraMat = this._core;
    },

    _getJSON: function () {
        return {
            fovy: this.fovy,
            aspect: this.aspect,
            near: this.near,
            far: this.far
        };
    },

    _destroy: function () {
        this.scene.canvas.off(this._canvasResized);
        this.scene.off(this._tick);
    }
});

XEO.Scene.prototype.newPerspective = function (cfg) {
    return new XEO.Perspective(this, cfg);
};;"use strict";

/**
 A **PointLight** defines a light source that originates from a single point and spreads outward in all directions, to illuminate
 attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>PointLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Within xeoEngine's Phong lighting calculations, PointLight {{#crossLink "PointLight/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "PointLight/specular:property"}}{{/crossLink}} are multiplied by {{#crossLink "Material"}}Material{{/crossLink}}
 {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and {{#crossLink "Material/specular:property"}}{{/crossLink}},
 respectively.</li>

 <li>PointLights have {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}}, {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} and
 {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} factors, which indicate how their intensity attenuates over distance.</li>

 <li>Diffuse, specular and ambient lighting may also be enabled or disabled for specific {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 via {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}, {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "Modes/ambient:property"}}{{/crossLink}} flags on {{#crossLink "Modes"}}Modes{{/crossLink}} components.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096613/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>a {{#crossLink "Material"}}{{/crossLink}},</li>
 <li>a PointLight,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing the PointLight,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
        diffuse: [1, 1, 1],
        specular: [1.1, 1]
 });

 // Our PointLight's intensity does not attenuate over distance.

 var pointLight = new XEO.PointLight(scene, {
        pos: [0, 100, 100],
        diffuse: [0.5, 0.7, 0.5],
        specular: [1.0, 1.0, 1.0],
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
 });

 var lights = new XEO.Lights(scene, {
        lights: [
            pointLight
        ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
        lights: lights,
        material: material,
        geometry: geometry
  });
 ````

 As with all components, we can <a href="XEO.Component.html#changeEvents" class="crosslink">observe and change properties</a> on PointLights like so:

 ````Javascript
 var handle = pointLight.on("diffuse", // Attach a change listener to a property
 function(value) {
        // Property value has changed
    });

 pointLight.diffuse = [0.4, 0.6, 0.4]; // Fires the change listener

 pointLight.off(handle); // Detach the change listener
 ````
 @class PointLight
 @module XEO
 @constructor
 @extends Component
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this PointLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The PointLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this PointLight.
 @param [cfg.pos=[ 1.0, 1.0, 1.0 ]] {Array(Number)} Position, in either World or View space, depending on the value of the **space** parameter.
 @param [cfg.diffuse=[0.7, 0.7, 0.8 ]] {Array(Number)} Diffuse color of this PointLight.
 @param [cfg.specular=[1.0, 1.0, 1.1 ]] {Array(Number)} Specular color of this PointLight.
 @param [cfg.constantAttenuation=0] {Number} Constant attenuation factor.
 @param [cfg.linearAttenuation=0] {Number} Linear attenuation factor.
 @param [cfg.quadraticAttenuation=0] {Number} Quadratic attenuation factor.
 @param [cfg.space="view"] {String} The coordinate system this PointLight is defined in - "view" or "space".
 */
XEO.PointLight = XEO.Component.extend({

    className: "XEO.PointLight",

    type: "light",

    _init: function (cfg) {
        this.mode = "point";
        this._core.mode = this.mode;
        this.pos = cfg.pos;
        this.diffuse = cfg.diffuse;
        this.specular = cfg.specular;
        this.constantAttenuation = cfg.constantAttenuation;
        this.linearAttenuation = cfg.linearAttenuation;
        this.quadraticAttenuation = cfg.quadraticAttenuation;
        this.space = cfg.space;
    },

    /**
     The position of this PointLight.

     This will be either World- or View-space, depending on the value of {{#crossLink "PointLight/space:property"}}{{/crossLink}}.

     Fires a {{#crossLink "PointLight/pos:event"}}{{/crossLink}} event on change.

     @property pos
     @default [1.0, 1.0, 1.0]
     @type Array(Number)
     */
    set pos(value) {
        value = value || [ 1.0, 1.0, 1.0 ];
        this._core.pos = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this PointLight's  {{#crossLink "PointLight/pos:property"}}{{/crossLink}} property changes.
         @event pos
         @param value The property's new value
         */
        this.fire("pos", value);
    },

    get pos() {
        return this._core.pos;
    },

    /**
     The diffuse color of this PointLight.

     Fires a {{#crossLink "PointLight/diffuse:event"}}{{/crossLink}} event on change.

     @property diffuse
     @default [0.7, 0.7, 0.8]
     @type Array(Number)
     */
    set diffuse(value) {
        value = value || [0.7, 0.7, 0.8 ];
        this._core.diffuse = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this PointLight's  {{#crossLink "PointLight/diffuse:property"}}{{/crossLink}} property changes.
         @event diffuse
         @param value The property's new value
         */
        this.fire("diffuse", value);
    },

    get diffuse() {
        return this._core.diffuse;
    },

    /**
     The specular color of this PointLight.

     Fires a {{#crossLink "PointLight/specular:event"}}{{/crossLink}} event on change.

     @property specular
     @default [0.7, 0.7, 0.8]
     @type Array(Number)
     */
    set specular(value) {
        value = value || [0.7, 0.7, 0.8 ];
        this._core.specular = value;
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this PointLight's  {{#crossLink "PointLight/specular:property"}}{{/crossLink}} property changes.
         * @event specular
         * @param value The property's new value
         */
        this.fire("specular", value);
    },

    get specular() {
        return this._core.specular;
    },

    /**
     The constant attenuation factor for this PointLight.

     Fires a {{#crossLink "PointLight/constantAttenuation:event"}}{{/crossLink}} event on change.

     @property constantAttenuation
     @default 0
     @type Number
     */
    set constantAttenuation(value) {
        value = value || 0.0;
        this._core.constantAttenuation = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this PointLight's {{#crossLink "PointLight/constantAttenuation:property"}}{{/crossLink}} property changes.

         @event constantAttenuation
         @param value The property's new value
         */
        this.fire("constantAttenuation", value);
    },

    get constantAttenuation() {
        return this._core.constantAttenuation;
    },

    /**
     The linear attenuation factor for this PointLight.

     Fires a {{#crossLink "PointLight/linearAttenuation:event"}}{{/crossLink}} event on change.

     @property linearAttenuation
     @default 0
     @type Number
     */
    set linearAttenuation(value) {
        value = value || 0.0;
        this._core.linearAttenuation = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this PointLight's  {{#crossLink "PointLight/linearAttenuation:property"}}{{/crossLink}} property changes.

         @event linearAttenuation
         @param value The property's new value
         */
        this.fire("linearAttenuation", value);
    },

    get linearAttenuation() {
        return this._core.linearAttenuation;
    },

    /**
     The quadratic attenuation factor for this Pointlight.

     Fires a {{#crossLink "PointLight/quadraticAttenuation:event"}}{{/crossLink}} event on change.

     @property quadraticAttenuation
     @default 0
     @type Number
     */
    set quadraticAttenuation(value) {
        value = value || 0.0;
        this._core.quadraticAttenuation = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this PointLight's  {{#crossLink "PointLight/quadraticAttenuation:property"}}{{/crossLink}} property changes.

         @event quadraticAttenuation
         @param value The property's new value
         */
        this.fire("quadraticAttenuation", value);
    },

    get quadraticAttenuation() {
        return this._core.quadraticAttenuation;
    },

    /**
     Indicates which coordinate space this PointLight is in.

     Supported values are:

     <ul>
     <li>"view" - View space, aligned within the view volume as if fixed to the viewer's head</li>
     <li>"world" - World space, fixed within the world, moving within the view volume with respect to camera</li>
     </ul>

     Fires a {{#crossLink "PointLight/space:event"}}{{/crossLink}} event on change.

     @property space
     @default "view"
     @type String
     */
    set space(value) {
        value = value || "view";
        if (value == this._core.space) {
            return;
        }
        this._core.space = value;
        this.fire("dirty", true); // Need to rebuild shader

        /**
         Fired whenever this Pointlight's  {{#crossLink "PointLight/space:property"}}{{/crossLink}} property changes.

         @event space
         @param value The property's new value
         */
        this.fire("space", value);
    },

    get space() {
        return this._core.space;
    },

    _getJSON: function () {
        return {
            mode: this.mode,
            pos: this.pos,
            diffuse: this.diffuse,
            specular: this.specular,
            constantAttenuation: this.constantAttenuation,
            linearAttenuation: this.linearAttenuation,
            quadraticAttenuation: this.quadraticAttenuation,
            space: this.space
        };
    }
});

;"use strict";

/**
 A **Scene** is a xeoEngine scene graph.

 <hr>
   *Contents*
    <Ul>
    <li><a href="#sceneStructure">Scene Structure</a></li>
    <li><a href="#sceneCanvas">The Scene Canvas</a></li>
    <li><a href="#findingByID">Finding Scenes and Components by ID</a></li>
    <li><a href="#defaults">The Default Scene</a></li>
    <li><a href="#savingAndLoadingJSON">Saving and Loading Scenes</a></li>
    </ul>
    <hr>

 ## <a name="sceneStructure">Scene Structure</a>

 A Scene is a type of <a href="http://gameprogrammingpatterns.com/component.html" target="_other">component-object</a> graph.

 A Scene contains a soup of instances of various {{#crossLink "Component"}}Component{{/crossLink}} subtypes, such as
 {{#crossLink "GameObject"}}GameObject{{/crossLink}}, {{#crossLink "Camera"}}Camera{{/crossLink}}, {{#crossLink "Material"}}Material{{/crossLink}},
 {{#crossLink "Lights"}}Lights{{/crossLink}} etc.  Each {{#crossLink "GameObject"}}GameObject{{/crossLink}} has a link to one of each of the other types,
 and the same component instances can be shared among many {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 *** Under the hood:*** Within xeoEngine, each {{#crossLink "GameObject"}}GameObject{{/crossLink}} represents a draw call,
 while its components define all the WebGL state that will be bound for that call. To render a Scene, xeoEngine traverses
 the graph to bind the states and make the draw calls, while using many optimizations for efficiency (eg. draw list caching and GL state sorting).

 <img src="http://www.gliffy.com/go/publish/image/7103731/L.png"></img>

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

 <br>
 ### Example

 Here's the JavaScript for the diagram above. As mentioned earlier, note that we only provide components for our {{#crossLink "GameObject"}}GameObjects{{/crossLink}} when we need to
 override the default components that the Scene would have provided them, and that same component instances may be shared among multiple GameObjects.

 ```` javascript
 var scene = new XEO.Scene({
       id: "myScene"   // ID is optional on all components
  });

 var material = new XEO.Material(myScene, {
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


 <br>
 ## <a name="sceneCanvas">The Scene Canvas</a>

 <br>
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

 <br>
 ## <a name="defaults">The Default Scene</a>

 When you create components without specifying a Scene for them, xeoEngine will put them in its default Scene.

 For example:

 ```` javascript
var material2 = new XEO.Material({
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

 <br>

 ## <a name="savingAndLoadingJSON">Saving and Loading Scenes</a>

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
 @param [cfg.components] {Array(GameObject)} JSON array containing parameters for {{#crossLink "Component"}}Component{{/crossLink}} subtypes to immediately create within the Scene.
 @extends Component
 */


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

        this._dirtyGameObjects = {};

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

        this._renderer = new XEO.Renderer({
            canvas: this.canvas,
            transparent: cfg.transparent
        });

        /**
         * Publishes input events that occur on this Scene's canvas.
         * @final
         * @property input
         * @type {Input}
         */
        this.input = new XEO.Input(this, this.canvas.canvas);

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
        this.engine._addScene(this);

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

        /**
         * Fired periodically, this event is the "heartbeat" of a Scene. A render will follow if any
         * Scene components are updated within subscribers to this event, or have already been updated previously.
         * @event tick
         */
        this.engine.on("tick", function (params) {
            self.fire("tick", params);
        })
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

        var isGameObject = c.type == "object";

        var self = this;

        c.on("destroyed",
            function () {

                self._componentIDMap.removeItem(c.id);
                delete self.components[c.id];

                if (isGameObject) {
                    self.stats.dec("objects");
                    delete self._dirtyGameObjects[c.id];
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
                    if (!self._dirtyGameObjects[c.id]) {
                        self._dirtyGameObjects[c.id] = object;
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
    get project() {
        return this.components["default.project"] ||
            new XEO.Perspective(this, {
                id: "default.project"
            });
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
    get view() {
        return this.components["default.view"] ||
            new XEO.Lookat(this, {
                id: "default.view"
            });
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
    get camera() {
        return this.components["default.camera"] ||
            new XEO.Camera(this, {
                id: "default.camera",
                project: "default.view",
                view: "default.lookat"
            });
    },

    /**
     * The default modelling transform provided by this Scene.
     *
     * This {{#crossLink "Matrix"}}Matrix{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.transform",
     * with all other properties initialised to their default values (ie. an identity matrix).
     *
     * {{#crossLink "GameObjects"}}GameObjects{{/crossLink}}s within this Scene are attached to
     * this {{#crossLink "Matrix"}}Matrix{{/crossLink}} by default.
     *
     * @property transform
     * @final
     * @type Matrix
     */
    get transform() {
        return this.components["default.transform"] ||
            new XEO.Matrix(this, {
                id: "default.transform"
            });
    },

    /**
     * The default {{#crossLink "Clips"}}Clips{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Clips"}}Clips{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.clips",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Clips"}}Clips{{/crossLink}} by default.
     * @property clips
     * @final
     * @type Clips
     */
    get clips() {
        return this.components["default.clips"] ||
            new XEO.Clips(this, {
                id: "default.clips"
            });
    },

    /**
     * The default {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.colorBuf",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "ColorBuf"}}ColorBuf{{/crossLink}} by default.
     * @property colorBuf
     * @final
     * @type ColorBuf
     */
    get colorBuf() {
        return this.components["default.colorBuf"] ||
            new XEO.ColorBuf(this, {
                id: "default.colorBuf"
            });
    },

    /**
     * The default {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.colorTarget",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} by default.
     * @property colorTarget
     * @final
     * @type ColorTarget
     */
    get colorTarget() {
        return this.components["default.colorTarget"] ||
            new XEO.ColorTarget(this, {
                id: "default.colorTarget"
            })
    },

    /**
     * The default {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthBuf",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "DepthBuf"}}DepthBuf{{/crossLink}} by default.
     *
     * @property depthBuf
     * @final
     * @type DepthBuf
     */
    get depthBuf() {
        return this.components["default.depthBuf"] ||
            new XEO.DepthBuf(this, {
                id: "default.depthBuf"
            })
    },

    /**
     * The default {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.depthTarget",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} by default.
     * @property depthTarget
     * @final
     * @type DepthTarget
     */
    get depthTarget() {
        return this.components["default.depthTarget"] ||
            new XEO.DepthTarget(this, {
                id: "default.colorTarget"
            })
    },

    /**
     * The default {{#crossLink "Visibility"}}Visibility{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Visibility"}}Visibility{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.visibility",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Visibility"}}Visibility{{/crossLink}} by default.
     * @property visibility
     * @final
     * @type Visibility
     */
    get visibility() {
        return this.components["default.visibility"] ||
            new XEO.Visibility(this, {
                id: "default.visibility",
                enabled: true
            })
    },

    /**
     * The default {{#crossLink "Modes"}}Modes{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Modes"}}Modes{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.modes",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Modes"}}Modes{{/crossLink}} by default.
     * @property modes
     * @final
     * @type Modes
     */
    get modes() {
        return this.components["default.modes"] ||
            new XEO.Modes(this, {
                id: "default.modes"
            })
    },

    /**
     * The default {{#crossLink "Geometry"}}Geometry{{/crossLink}} provided by this Scene, which is a 2x2x2 box centered at the World-space origin.
     *
     * This {{#crossLink "Geometry"}}Geometry{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.geometry".
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this {{#crossLink "Geometry"}}Geometry{{/crossLink}} by default.
     * @property geometry
     * @final
     * @type Geometry
     */
    get geometry() {
        return this.components["default.geometry"] ||
            new XEO.Geometry(this, {
                id: "default.geometry"
            })
    },

    /**
     * The default {{#crossLink "Layer"}}Layer{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Layer"}}Layer{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.layer",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Layer"}}Layer{{/crossLink}} by default.
     * @property layer
     * @final
     * @type Layer
     */
    get layer() {
        return this.components["default.layer"] ||
            new XEO.Layer(this, {
                id: "default.layer",
                priority: 0
            })
    },

    /**
     * The default {{#crossLink "Lights"}}Lights{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Lights"}}Lights{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to *````"default.lights"````*,
     * with all other properties initialised to their default values (ie. the default set of light sources for a {{#crossLink "Lights"}}Lights{{/crossLink}}).
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Lights"}}Lights{{/crossLink}} by default.
     * @property lights
     * @final
     * @type Lights
     */
    get lights() {
        return this.components["default.lights"] ||
            new XEO.Lights(this, {
                id: "default.lights",
                lights: [

                    // Ambient light source #0
                    new XEO.AmbientLight(this, {
                        id: "default.light0",
                        color: [0.7, 0.7, 0.7]
                    }),

                    // Directional light source #1
                    new XEO.DirLight(this, {
                        id: "default.light1",
                        dir: [-0.5, -0.5, -1.0 ],
                        color: [1.0, 1.0, 1.0 ],
                        specular: true,
                        diffuse: true,
                        space: "view"
                    }),

                    // Directional light source #2
                    new XEO.DirLight(this, {
                        id: "default.light2",
                        dir: [1.0, -0.9, -0.7 ],
                        color: [1.0, 1.0, 1.0 ],
                        specular: true,
                        diffuse: true,
                        space: "view"
                    })
                ]
            })
    },

    /**
     * The default {{#crossLink "Material"}}Material{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Material"}}Material{{/crossLink}} has
     * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.material", with all
     * other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Material"}}Material{{/crossLink}} by default.
     * @property material
     * @final
     * @type Material
     */
    get material() {
        return this.components["default.material"] ||
            new XEO.Material(this, {
                id: "default.material"
            });
    },

    /**
     * The default {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.morphTargets",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "MorphTargets"}}MorphTargets{{/crossLink}} by default.
     * @property morphTargets
     * @final
     * @type MorphTargets
     */
    get morphTargets() {
        return this.components["default.morphTargets"] ||
            new XEO.MorphTargets(this, {
                id: "default.morphTargets"
            })
    },

    /**
     * The default {{#crossLink "Reflect"}}Reflect{{/crossLink}} provided by this Scene,
     * (which is a neutral {{#crossLink "Reflect"}}Reflect{{/crossLink}} that has no effect).
     *
     * This {{#crossLink "Reflect"}}Reflect{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.reflect",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Reflect"}}Reflect{{/crossLink}} by default.
     * @property reflect
     * @final
     * @type Reflect
     */
    get reflect() {
        return this.components["default.reflect"] ||
            new XEO.Reflect(this, {
                id: "default.reflect"
            })
    },

    /**
     * The default {{#crossLink "Shader"}}Shader{{/crossLink}} provided by this Scene
     * (which is a neutral {{#crossLink "Shader"}}Shader{{/crossLink}} that has no effect).
     *
     * This {{#crossLink "Shader"}}Shader{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shader",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Shader"}}Shader{{/crossLink}} by default.
     * @property shader
     * @final
     * @type Shader
     */
    get shader() {
        return this.components["default.shader"] ||
            this.components["default.shader"] || new XEO.Shader(this, {
            id: "default.shader"
        })
    },

    /**
     * The default {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} has an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.shaderParams",
     * with all other properties initialised to their default values.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "ShaderParams"}}Shader{{/crossLink}} by default.
     * @property shaderParams
     * @final
     * @type ShaderParams
     */
    get shaderParams() {
        return this.components["default.shaderParams"] ||
            new XEO.ShaderParams(this, {
                id: "default.shaderParams"
            })
    },

    /**
     * The default {{#crossLink "Stage"}}Stage{{/crossLink}} provided by this Scene.
     *
     * This {{#crossLink "Stage"}}Stage{{/crossLink}} has
     * an {{#crossLink "Component/id:property"}}id{{/crossLink}} equal to "default.stage" and
     * a {{#crossLink "Stage/priority:property"}}priority{{/crossLink}} equal to ````0````.
     *
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}} created within this Scene will get this
     * {{#crossLink "Stage"}}Stage{{/crossLink}} by default.
     * @property stage
     * @final
     * @type Stage
     */
    get stage() {
        return this.components["default.stage"] ||
            new XEO.Stage(this, {
                id: "default.stage",
                priority: 0
            })
    },

    /**
     * Destroys all components in this Scene
     */
    clear: function () {
        var component;
        for (var id in this.components) {
            if (this.components.hasOwnProperty(id)) {
                component = this.components[id];
                if (!component.id != this.id) { // This Scene is also in the component map
                    component.destroy();
                }
            }
        }
        this._dirtyGameObjects = {};
    },

    /**
     * Compiles and renders this Scene
     * @private
     */
    _compile: function () {

        // Compile dirty objects, if any

        for (var id in this._dirtyGameObjects) {
            if (this._dirtyGameObjects.hasOwnProperty(id)) {
                this._dirtyGameObjects[i]._compile();
            }
        }

        this._dirtyGameObjects = {};

        this._renderer.render({
            clear: i == 0
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


XEO.Engine.prototype.newScene = function (cfg) {
    return new XEO.Scene(this, cfg);
};;"use strict";

/**
 A **Shader** specifies a custom GLSL shader to draw attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <hr>
    *Contents*
    <Ul>
        <li><a href="#overview">Overview</a></li>
        <li><a href="#shaderInputs">Shader Inputs</a></li>
        <li><a href="#example">Example</a></li>
    </ul>
    <hr>

 ## Overview

 <ul>
 <li>You can use xeoEngine's reserved uniform and variable names in your Shaders to read all the WebGL state that's set by other
 components on the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Use Shaders in combination with {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} components when you need to share
 the same Shaders among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} while setting the Shaders' uniforms
 differently for each {{#crossLink "GameObject"}}GameObject{{/crossLink}}.</li>

 <li>Use {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}}
 and {{#crossLink "Texture"}}Texture{{/crossLink}} components to connect the output of one Shader as input into another Shader.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105141/L.png"></img>

 ## Example

 The example below shows the simplest way to use a Shader, where we're just going to render a ripply water
 pattern to a screen-aligned quad.

 <img src="../../assets/images/shaderExample1.png"></img>

 In our scene definition, we have an  {{#crossLink "GameObject"}}GameObject{{/crossLink}} that has a {{#crossLink "Geometry"}}Geometry{{/crossLink}} that is our
 screen-aligned quad, plus a Shader that will render the fragments of that quad with our cool rippling water pattern.
 Finally, we animate the rippling by periodically updating the Shader's "time" uniform.

 ````javascript

 var scene = new XEO.Scene();

 // Shader that's used by our GameObject. Note the 'XEO_aPosition' and 'XEO_aUV attributes',
 // which will receive the positions and UVs from the Geometry. Also note the 'time'
 // uniform, which we'll be animating via Shader#setParams.

 var shader = new XEO.Shader(scene, {

       // Vertex shading stage
       vertex: [
           "attribute vec3 XEO_aPosition;",
           "attribute vec2 XEO_aUV;",
           "varying vec2 vUv;",
           "void main () {",
           "    gl_Position = vec4(XEO_aPosition, 1.0);",
           "    vUv = XEO_aUV;",
           "}"
       ],

       // Fragment shading stage
       fragment: [
           "precision mediump float;",

           "uniform float time;",
           "varying vec2 vUv;",

           "void main( void ) {",
           "    vec2 sp = vUv;",
           "    vec2 p = sp*5.0 - vec2(10.0);",
           "    vec2 i = p;",
           "    float c = 1.0;",
           "    float inten = 0.10;",
           "    for (int n = 0; n < 10; n++) {",
           "        float t = time * (1.0 - (3.0 / float(n+1)));",
           "        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
           "        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));",
           "    }",
           "    c /= float(10);",
           "    c = 1.5-sqrt(c);",
           "    gl_FragColor = vec4(vec3(c*c*c*c), 999.0) + vec4(0.0, 0.3, 0.5, 1.0);",
           "}"
       ],

       // Initial value for the 'time' uniform in the fragment stage.
       params: {
           time: 0.0
       }
  });

 // A screen-aligned quad
 var quad = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var object = new XEO.GameObject(scene, {
       shader: shader,
       geometry: quad
  });

 ````
 Now let's animate the "time" parameter on the Shader, to make the water ripple:

 ```` javascript
 scene.on("tick", function(params) {
            shader.setParams({
                time: params.timeElapsed
            });
        });
 ````

 ## Shader Inputs

 xeoEngine provides various inputs for your shaders (TODO)

 #### Attributes

 *Attributes are used in vertex shaders*

 | Attribute  | Description | Depends on  |
 |---|---|
 | attribute vec3   XEO_aPosition   | Vertex positions | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} |
 | attribute vec2   XEO_aUV         | UV coordinates | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |
 | attribute vec3   XEO_aNormal     | Normal vectors | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}}  |
 | attribute vec4   XEO_aVertexColor  | Vertex colors  | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/colors:property"}}{{/crossLink}}  |
 | attribute vec4 XEO_aTangent    | Tangent vectors for normal mapping | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}} and {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |

 #### Uniforms

 *Uniforms are used in vertex and fragment shaders*

 | Uniform  | Description | Depends on  |
 |---|---|
 | uniform mat4  XEO_uMNMatrix               | Modelling normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Matrix"}}{{/crossLink}} |
 | uniform mat4  XEO_uVMatrix                | View matrix | {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  XEO_uVNMatrix               | View normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  XEO_uPMatrix                | Projection matrix | {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform mat4  XEO_uPNMatrix               | Projection normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float XEO_uZNear                  | Near clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float XEO_uZFar                   | Far clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform vec3  XEO_uAmbientColor | Ambient light color | {{#crossLink "AmbientLight"}}{{/crossLink}} |
 | uniform vec3 XEO_uLightDir&lt;N&gt; | Direction of {{#crossLink "DirLight"}}{{/crossLink}} at index N in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "DirLight"}}{{/crossLink}} |




 #### Varying

 *Varying types are used in fragment shaders*

 | Varying | Description | Depends on  |
 |---|---|
 | varying vec4 XEO_vWorldVertex | |
 | varying vec4 XEO_vViewVertex | |
 | varying vec4 XEO_vColor | |


 @class Shader
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Shader in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Shader.
 @param [cfg.vertex=null] {String} GLSL Depends on code for the vertex shading staging.
 @param [cfg.fragment=null] {String} GLSL source code for the fragment shading staging.
 @param [cfg.params={}] {GameObject} Values for uniforms defined in the vertex and/or fragment stages.
 @extends Component
 */
XEO.Shader = XEO.Component.extend({

    className: "XEO.Shader",

    type: "shader",

    _init: function (cfg) {
        this._core.shaders = {};
        this.vertex = cfg.vertex;
        this.fragment = cfg.fragment;
        this.setParams(cfg.params);
    },

    /**
     * GLSL source code for the vertex stage of this shader.
     *
     * Fires a {{#crossLink "Shader/vertex:event"}}{{/crossLink}} event on change.
     *
     * @property vertex
     * @default null
     * @type String
     */
    set vertex(value) {
        this._core.shaders.vertex = value;
        this.fire("dirty", true);

        /**
         * Fired whenever this Shader's {{#crossLink "Shader/vertex:property"}}{{/crossLink}} property changes.
         * @event vertex
         * @param value The property's new value
         */
        this.fire("vertex", value);
    },

    get vertex() {
        return this._core.shaders.vertex;
    },

    /**
     * GLSL source code for the fragment stage of this shader.
     *
     * Fires a {{#crossLink "Shader/fragment:event"}}{{/crossLink}} event on change.
     *
     * @property fragment
     * @default null
     * @type String
     */
    set fragment(value) {
        this._core.shaders.fragment = value;
        this.fire("dirty", true);

        /**
         * Fired whenever this Shader's {{#crossLink "Shader/fragment:property"}}{{/crossLink}} property changes.
         * @event fragment
         * @param value The property's new value
         */
        this.fire("fragment", value);
    },

    get fragment() {
        return this._core.shaders.fragment;
    },

    /**
     * Sets one or more params for this Shader.
     *
     * These will be individually overridden by any {{#crossLink "ShaderParams/setParams:method"}}params subsequently specified{{/crossLink}} on
     * {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
     *
     * Fires a {{#crossLink "Shader/params:event"}}{{/crossLink}} event on change.
     *
     * @method setParams
     * @param {} [params={}] Values for params to set on this Shader, keyed to their names.
     */
    setParams: function (params) {
        this._core.params = this._core.params || {};
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                this._core.params[name] = params[name];
            }
        }
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this Shader's  {{#crossLink "Shader/params:property"}}{{/crossLink}} property has been updated.
         * @event params
         * @param value The property's new value
         */
        this.fire("params", this._core.params);
    },

    get params() {
        return this._core.params;
    },

    _compile: function () {
        this._renderer.shader = this._core;
    },

    _getJSON: function () {
        return {
            vertex: this.vertex,
            fragment: this.fragment,
            params: this.params
        };
    }
});;"use strict";

/**
 A **ShaderParams** sets uniform values for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>
 <li>Use these when you need to share the same {{#crossLink "Shader"}}Shaders{{/crossLink}} among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}},
 while setting the {{#crossLink "Shader"}}Shaders{{/crossLink}}' uniforms differently for each {{#crossLink "GameObject"}}GameObject{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105099/L.png"></img>

 ### Example

 The example below shows the simplest way to use a {{#crossLink "Shader"}}Shader{{/crossLink}}, where we're just going to render a ripply water
 pattern to a screen-aligned quad. As with all our examples, we're just creating the
 essential components while falling back on the <a href="XEO.Scene.html#defaults" class="crosslink">Scene's default components</a>
 for everything else.

 <img src="../../assets/images/shaderParamsExample1.png"></img>

 In our scene definition, we have an  {{#crossLink "GameObject"}}GameObject{{/crossLink}} that has a {{#crossLink "Geometry"}}Geometry{{/crossLink}} that is our
 screen-aligned quad, plus a {{#crossLink "Shader"}}Shader{{/crossLink}} that will render the fragments of that quad with our cool rippling water pattern.
 Finally, we animate the rippling by periodically updating the {{#crossLink "Shader"}}Shader{{/crossLink}}'s "time" uniform.

 ````javascript
 var scene = new XEO.Scene();

 // Shader that's shared by both our GameObjects. Note the 'XEO_aPosition' and 'XEO_aUV attributes',
 // which will receive the positions and UVs from the Geometry components. Also note the 'time'
 // uniform, which we'll be animating via the ShaderParams components.

 var shader = new XEO.Shader(scene, {

       // Vertex shading stage
       vertex: [
           "attribute vec3 XEO_aPosition;",
           "attribute vec2 XEO_aUV;",
           "varying vec2 vUv;",
           "void main () {",
           "    gl_Position = vec4(XEO_aPosition, 1.0);",
           "    vUv = XEO_aUV;",
           "}"
       ],

       // Fragment shading stage
       fragment: [
           "precision mediump float;",

           "uniform float time;",
           "varying vec2 vUv;",

           "void main( void ) {",
           "    vec2 sp = vUv;",
           "    vec2 p = sp*5.0 - vec2(10.0);",
           "    vec2 i = p;",
           "    float c = 1.0;",
           "    float inten = 0.10;",
           "    for (int n = 0; n < 10; n++) {",
           "        float t = time * (1.0 - (3.0 / float(n+1)));",
           "        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
           "        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));",
           "    }",
           "    c /= float(10);",
           "    c = 1.5-sqrt(c);",
           "    gl_FragColor = vec4(vec3(c*c*c*c), 999.0) + vec4(0.0, 0.3, 0.5, 1.0);",
           "}"
       ],

       // Initial values for the 'time' uniform in the fragment stage.
       params: {
           time: 0.0
       }
  });

 // First GameObject using our Shader, with a quad covering the left half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var quad1 = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var shaderParams1 = new XEO.ShaderParams(scene, {
       params: {
           time: 0.0
       }
  });

 var object1 = new XEO.GameObject(scene, {
       shader: shader,
       geometry: quad1,
       shaderParams1: shaderParams1
  });

 // Second GameObject using the Shader, with a quad covering the right half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var quad2 = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var shaderParams2 = new XEO.ShaderParams(scene, {
       params: {
           time: 0.0
       }
  });

 var object2 = new XEO.GameObject(scene, {
       shader: shader,
       geometry2: quad2,
       shaderParams2: shaderParams2
  });

 ````
 Now let's animate the "time" parameter on the Shader, for each GameObject independently:

 ```` javascript
 scene.on("tick", function(params) {

            shaderParams1.setParams({
                time: params.timeElapsed
            });

            shaderParams2.setParams({
                time: params.timeElapsed  * 0.5
            });
        });
 ````
 @class ShaderParams
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ShaderParams in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ShaderParams.
 @param [cfg.params={}] {GameObject} The {{#crossLink "Shader"}}Shader{{/crossLink}} parameter values.
 @extends Component
 */
XEO.ShaderParams = XEO.Component.extend({

    className: "XEO.ShaderParams",

    type: "shaderParams",

    _init: function (cfg) {
        this.setParams(cfg.params);
    },

    /**
     * Sets one or more params for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached
     * {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
     *
     * These will individually override any params of the same names that are {{#crossLink "Shader/setParams:method"}}already specified{{/crossLink}} on
     * those {{#crossLink "Shader"}}Shaders{{/crossLink}}.
     *
     * Fires a {{#crossLink "ShaderParams/params:event"}}{{/crossLink}} event on change.
     *
     * @method setParams
     * @param {} [params={}] Values for params to set on the {{#crossLink "Shader"}}Shaders{{/crossLink}}, keyed to their names.
     */
    setParams: function (params) {
        this._core.params = this._core.params || {};
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                this._core.params[name] = params[name];
            }
        }
        this._renderer.imageDirty = true;

        /**
         * Fired whenever this ShaderParams' {{#crossLink "ShaderParams/params:property"}}{{/crossLink}} property has been updated.
         * @event params
         * @param value The property's new value
         */
        this.fire("params", this._core.params);
    },

    get params() {
        return this._core.params;
    },

    _compile: function () {
        this._renderer.shader = this._core;
    },

    _getJSON: function () {
        return {
            params: this.params
        };
    }
});;"use strict";

/**
 A **Stage** partitions attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} into ordered render bins.

 <ul>
 <li>When the parent {{#crossLink "Scene"}}Scene{{/crossLink}} renders, each Stage renders its bin
 of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in turn, from the lowest priority Stage to the highest.</li>

 <li>Stages are typically used for ordering the render-to-texture steps in posteffects pipelines.</li>

 <li>You can control the render order of the individual {{#crossLink "GameObject"}}GameObjects{{/crossLink}} ***within*** a Stage
 by associating them with {{#crossLink "Layer"}}Layers{{/crossLink}}.</li>

 <li>{{#crossLink "Layer"}}Layers{{/crossLink}} are typically used to <a href="https://www.opengl.org/wiki/Transparency_Sorting" target="_other">transparency-sort</a> the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} within Stages.</li>

 <li>{{#crossLink "GameObject"}}GameObjects{{/crossLink}} not explicitly attached to a Stage are implicitly
 attached to the {{#crossLink "Scene"}}Scene{{/crossLink}}'s default
 {{#crossLink "Scene/stage:property"}}stage{{/crossLink}}. which has
 a {{#crossLink "Stage/priority:property"}}{{/crossLink}} value of zero.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105073/L.png"></img>

 ### Example

 In example below, we're performing render-to-texture using {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} and
 {{#crossLink "Texture"}}Texture{{/crossLink}} components.

 Note how we use two prioritized Stages, to ensure that the {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} is
 rendered ***before*** the {{#crossLink "Texture"}}Texture{{/crossLink}} that consumes it.

 ````javascript
 var scene = new XEO.Scene();

 // First stage: an GameObject that renders to a ColorTarget

 var stage1 = new XEO.Stage(scene, {
       priority: 0
  });

 var geometry = new XEO.Geometry(scene); // Geometry with no parameters defaults to a 2x2x2 box

 var colorTarget = new XEO.ColorTarget(scene);

 var object1 = new XEO.GameObject(scene, {
       stage: stage1,
       geometry: geometry,
       colorTarget: colorTarget
  });


 // Second stage: an GameObject with a Texture that sources from the ColorTarget

 var stage2 = new XEO.Stage(scene, {
       priority: 1
  });

 var texture = new XEO.Texture(scene, {
       target: colorTarget
  });

 var material = new XEO.Material(scene, {
       textures: [
           texture
       ]
  });

 var geometry2 = new XEO.Geometry(scene);

 var object2 = new XEO.GameObject(scene, {
       stage: stage2,
       material: material,
       geometry: geometry2
  });
 ````

 @class Stage
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Stage in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Stage.
 @param [cfg.priority=0] {Number} The rendering priority for the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
 @param [cfg.pickable=true] {Boolean} Indicates whether attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are pickable.
 @extends Component
 */
XEO.Stage = XEO.Component.extend({

    className: "XEO.Stage",

    type: "stage",

    _init: function (cfg) {
        this.priority = cfg.priority;
        this.pickable = cfg.pickable;
    },

    /**
     * Indicates the rendering priority for the {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in this Stage.
     *
     * Fires a {{#crossLink "Stage/priority:event"}}{{/crossLink}} event on change.
     *
     * @property priority
     * @default 0
     * @type Number
     */
    set priority(value) {
        value = value || 0;
        this._core.priority = value;
        this._renderer.stateOrderDirty = true;

        /**
         * Fired whenever this Stage's {{#crossLink "Stage/priority:property"}}{{/crossLink}} property changes.
         * @event priority
         * @param value The property's new value
         */
        this.fire("priority", value);
    },

    get priority() {
        return this._core.priority;
    },

    /**
     * Indicates whether the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} are pickable (see {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}).
     *
     * Fires a {{#crossLink "Stage/pickable:event"}}{{/crossLink}} event on change.
     * @property pickable
     * @default true
     * @type Boolean
     */
    set pickable(value) {
        value = value !== false; // Default is true
        this._core.pickable = value;
        this._renderer.drawListDirty = true;

        /**
         * Fired whenever this Stage's {{#crossLink "Stage/pickable:pickable"}}{{/crossLink}} property changes.
         * @event pickable
         * @param value The property's new value
         */
        this.fire("pickable", value);
    },

    get pickable() {
        return this._core.pickable;
    },

    _compile: function () {
        this._renderer.stage = this._core;
    },

    _getJSON: function () {
        return {
            priority: this.priority,
            pickable: this.pickable
        };
    }
});
;"use strict";

"use strict";

/**
 A **Stats** provides statistics on the parent {{#crossLink "Scene"}}{{/crossLink}}.

 <ul>

 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} provides a Stats instance on itself.</li>

 <li>You can manage your own statistics properties in a Stats, but take care not to clobber the properties that are
 provided by the {{#crossLink "Scene"}}{{/crossLink}} (see table below).</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7122941/L.png"></img>

 ### Example

 The following example shows how to subscribe to the "numGeometries' statistic, which indicates
 how many {{#crossLink "Geometry"}}{{/crossLink}} components are in the parent {{#crossLink "Scene"}}{{/crossLink}}.

 ````Javascript

 var scene = new XEO.Scene();

 // Get the statistics for a Scene
 var stats = scene.stats;

 // Subscribe to change of a statistic
 // The subscriber is also immediately notified of the current value via the callback.
 var handle = configs.on("numGeometries", function(value) {
       console.log("Number of Geometry components in the Scene is now " + value);
  });

 // Unsubscribe
 configs.off(handle);

 // Read the current value of a statistic
 // Normally we would asynchronously subscribe with #on though, to be sure that
 // we're getting the latest changes to the statistic.
 var numGeometries = configs.props["numGeometries"];
 ````

 As mentioned, we can manage our own statistics as well (perhaps if we're extending xeoEngine):

 ````Javascript

 // Create a statistic
 configs.zero("myStatistic");

 // Increment our statistic
 configs.inc("myStatistic");

 // Decrement our statistic
 configs.dec("myStatistic");

 // Subscribe to change of our statistic
 handle2 = configs.on("myStatistic", function(value) {
       console.log("Value of myStatistic is now " + value);
  });

 // Unsubscribe
 configs.off(handle2);

 // Read the current value of our statistic
 var myStatistic = configs.props["myStatistic"];
 ````

<br>
 ### Scene Statistics

 Listed below are are the statistics provided by the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

 Don't use these names for your own custom statistics properties.

 | Name  | Description|
 |---|---|
 | "numGeometries" | Number of {{#crossLink "Geometry"}}Geometrys{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}} |
 | "numTextures"  | Number of {{#crossLink "Texture"}}Textures{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}}  |
 | "numGameObjects"  | Number of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} in the {{#crossLink "Scene"}}Scene{{/crossLink}}  |

 @class Stats
 @module XEO
 @constructor
 @extends Component
 */
XEO.Stats = XEO.Component.extend({

    className: "XEO.Stats",

    type: "stats",

    _init: function (cfg) {
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                this.fire(key, cfg[key]);
            }
        }
    },

    clear: function () {
        // TODO?
    },

    /**
      Increments the value of a statistic property.

      Publishes the new value as an event with the same name as the property.

      @method inc
      @param {String} name The statistic property name.
     */
    inc: function (name) {
        this.fire(name, (this.props[name] || 0) + 1);
    },

    /**
     Decrements the value of a statistic property.

     Publishes the new value as an event with the same name as the property.

     @method dec
     @param {String} name The statistic property name.
     */
    dec: function (name) {
        this.fir(name, (this.props[name] || 0) - 1);
    },

    /**
     Zeroes the value of a statistic property.

     Publishes the new value as an event with the same name as the property.

     @method zero
     @param {String} name The statistic property name.
     */
    zero: function (name) {
        this.fire(name, 0);
    },

    _toJSON: function () {
        return  XEO._copy(this.props);
    }
});


;"use strict";

/**
 A **Task** represents an asynchronously-running process within a {{#crossLink "Tasks"}}Tasks{{/crossLink}}.

 <img src="http://www.gliffy.com/go/publish/image/7123427/L.png"></img>

 @class Task
 @module XEO
 @extends Component
 */
XEO.Task = function (tasks, cfg) {

    this._init(tasks.engine, "task['" + cfg.id + "']");

    this.tasks = tasks;

    this.id = cfg.id;

    this.description = cfg.description || "";

    this.failed = false;

    this.completed = false;
};

XEO._extend(XEO.Task, XEO.Component);

/**
 * Sets this task as successfully completed.
 *
 * Fires a  {{#crossLink "Task/completed:event"}}{{/crossLink}} event on this task, as well as
 * a {{#crossLink "Tasks/completed:event"}}{{/crossLink}} event on the parent  {{#crossLink "Tasks"}}Task{{/crossLink}}.
 *
 * @method setCompleted
 */
XEO.Task.prototype.setCompleted = function () {

    /**
     * Fired when this task has successfully completed.
     * @event completed
     */
    this.fire("completed", this.completed = true);
};

/**
 * Sets this task as failed.
 *
 * Fires a  {{#crossLink "Task/failed:event"}}{{/crossLink}} event on this task, as well as
 * a {{#crossLink "Tasks/failed:event"}}{{/crossLink}} event on the parent  {{#crossLink "Tasks"}}Tasks{{/crossLink}}.
 *
 * @method setFailed
 */
XEO.Task.prototype.setFailed = function () {

    /**
     * Fired when this task has failed
     * @event failed
     */
    this.fire("failed", this.failed = true);
};

XEO.Task._destroy = function () {
    if (!this.completed && this.destroyed) {
        this.setCompleted();
    }
};;"use strict";

/**
 A **Tasks** tracks general asynchronous tasks running within a {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <ul>
 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} has a Tasks component, available via the
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Scene/tasks:property"}}tasks{{/crossLink}} property,
 within which it will create and destroy {{#crossLink "Task"}}Task{{/crossLink}} components to indicate what processes
 it's running internally.</li>

 <li>You can also manage your own {{#crossLink "Task"}}Task{{/crossLink}} components within that, to indicate what
 application-level processes you are running.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7122907/L.png"></img>

 ### Example

 The following example shows how to manage tasks and subscribe to their life cycles.

 ````Javascript

 // Create a Scene
 var scene = new XEO.Scene();

 // Get the Tasks tracker
 var tasks = scene.tasks;

 // Subscribe to all task creations
 tasks.on("started", function(task) {
       console.log("Task started: " + task.id +", " + task.description);
  });

 // Subscribe to all task completions
 tasks.on("completed", function(task) {
       console.log("Task completed: " + task.id +", " + task.description);
  });

 // Subscribe to all task failures
 tasks.on("failed", function(task) {
       console.log("Task failed: " + task.id +", " + task.description);
  });

 // Create and start Task "foo"
 var taskFoo = tasks.create({
       id: "foo", // Optional, unique ID generated automatically when omitted
       description: "Loading something"
  });

 // Create and start Task "bar"
 var taskBar = tasks.create({
       id: "bar",
       description: "Loading something else"
  });

 // Subscribe to completion of Task "foo"
 taskFoo.on("completed", function(task) {
       console.log("Task completed: " + task.id +", " + task.description);
  });

 // Subscribe to failure of a specific task
 taskFoo.on("failed", function(task) {
       console.log("Task failed: " + task.id +", " + task.description);
  });

 // Set Task "foo" as completed, via the Tasks
 // Fires the "completed" handler we registered above, also fires "completed" on the Task itself
 tasks.setCompleted("foo");

 // Set Task "bar" as failed, this time directly on the Task in question
 myTask2.setFailed();

 ````

 @class Tasks
 @module XEO
 @constructor
 @extends Component
 */
XEO.Tasks = function (engine) {

    this._init(engine, "tasks");

    this._idMap = new XEO.utils.Map();

    this.tasks = {};
};

XEO._extend(XEO.Tasks, XEO.Component);

/**
 * Creates and starts a new {{#crossLink "Task"}}Task{{/crossLink}} instance with this Tasks.
 *
 * If an ID is given for the new {{#crossLink "Task"}}Task{{/crossLink}} that is already in use for
 * another, will log an error message and return null.
 *
 * On success, fires a {{#crossLink "Tasks/started:event"}}{{/crossLink}} event and returns the new {{#crossLink "Task"}}Task{{/crossLink}}
 *  instance.
 *
 * @method create
 * @param params Task params.
 * @param [params.id] {String} Optional unique ID,
 * internally generated if not supplied.
 * @param [params.description] {String} Optional description.
 * @returns {Task|null} The new new {{#crossLink "Task"}}Task{{/crossLink}} instance, or null if there was an ID
 * clash with an existing {{#crossLink "Task"}}Task{{/crossLink}}.
 */
XEO.Tasks.prototype.create = function (params) {

    params = params || {};

    if (params.id) {
        if (this.tasks[params.id]) {
            this.error("A task with this ID already exists: " + params.id);
            return null;
        }
    } else {
        params.id = this._idMap.addItem({});
    }

    var task = this.tasks[params.id] = new XEO.Tasks.Task(this, params);
    var self = this;

    /**
     * Fired whenever a task has successfully completed.
     * @event completed
     * @param {Task} value The task that has completed
     */
    task.on("completed",
        function () {
            delete self.tasks[task.id];
            self._idMap.removeItem(task.id);
            self.fire("completed", task, true);
        });

    /**
     * Fired whenever a task has failed
     * @event failed
     * @param {Task} value The task that has failed
     */
    task.on("failed",
        function () {
            delete self.tasks[task.id];
            self._idMap.removeItem(task.id);
            self.fire("failed", task, true);
        });

    /**
     * Fired whenever a task has started
     * @event started
     * @param {Task} value The task that has started
     */
    self.fire("started", task, true);

    return task;
};

/**
 * Completes the {{#crossLink "Task"}}Task{{/crossLink}} with the given ID.
 *
 * Fires a {{#crossLink "Tasks/completed:event"}}{{/crossLink}} event, as well as separate
 * {{#crossLink "Task/completed:event"}}{{/crossLink}} event on the {{#crossLink "Task"}}Task{{/crossLink}} itself.
 *
 * Logs an error message if no task can be found for the given ID.
 *
 * @method setCompleted
 * @param {String} id ID of the {{#crossLink "Task"}}Task{{/crossLink}} to complete.
 */
XEO.Tasks.prototype.setCompleted = function (id) {
    var task = this.tasks[id];
    if (!task) {
        this.error("Task not found:" + id);
        return;
    }
    task.fire("completed", task, true);
};

/**
 * Fails the {{#crossLink "Task"}}Task{{/crossLink}} with the given ID.
 *
 * Fires a {{#crossLink "Tasks/failed:event"}}{{/crossLink}} event, as well as separate
 * {{#crossLink "Task/failed:event"}}{{/crossLink}} event on the {{#crossLink "Task"}}Task{{/crossLink}} itself.
 *
 * Logs an error message if no task can be found for the given ID.
 *
 * @method setFailed
 * @param {String} id ID of the {{#crossLink "Task"}}Task{{/crossLink}} to fail.
 */
XEO.Tasks.prototype.setFailed = function (id) {
    var task = this.tasks[id];
    if (!task) {
        this.error("Task not found:" + id);
        return;
    }
    task.fire("failed", task, true);
};

XEO.Tasks.prototype.clear = function () {
    for (var id in this.tasks) {
        if (this.tasks.hasOwnProperty(id)) {
            this.tasks[id].setCompleted();
        }
    }
};
;/**
 A **Texture** specifies a texture map.

 <ul>

 <li>Textures are grouped within {{#crossLink "Material"}}Material{{/crossLink}}s, which are attached to
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>To create a Texture from an image file, setting the Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}}
 property to the image file path.</li>

 <li>To render color images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Similarly, to render depth images of {{#crossLink "GameObject"}}GameObjects{{/crossLink}} to a Texture, set the Texture's {{#crossLink "Texture/target:property"}}{{/crossLink}}
 property to a {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} that is attached to those {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>For special effects, we often use rendered Textures in combination with {{#crossLink "Shader"}}Shaders{{/crossLink}} and {{#crossLink "Shader"}}Stages{{/crossLink}}.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7092447/L.png"></img>

 ### Example

 The following example creates
 <ul>
 <li>three {{#crossLink "Texture"}}{{/crossLink}}s,</li>
 <li>a {{#crossLink "Material"}}{{/crossLink}} which applies the {{#crossLink "Texture"}}{{/crossLink}}s as diffuse, bump and specular maps,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing an {{#crossLink "AmbientLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}},</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
 var scene = new XEO.Scene();

 var diffuseMap = new XEO.Texture(scene, {
    src: "diffuseMap.jpg"
});

 var bumpMap = new XEO.Texture(scene, {
    src: "bumpMap.jpg"
});

 var specularMap = new XEO.Texture(scene, {
    src: "specularMap.jpg"
});

 var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    shininess: 30,
    diffuseMap: diffuseMap,
    bumpMap: bumpMap,
    specularMap: specularMap
});

 var light1 = new XEO.PointLight(scene, {
    pos: [0, 100, 100],
    diffuse: [0.5, 0.7, 0.5],
    specular: [1.0, 1.0, 1.0]
});

 var light2 = new XEO.AmbientLight(scene, {
    ambient: [0.5, 0.7, 0.5]
});

 var lights = new XEO.Lights(scene, {
    lights: [
        light1,
        light2
    ]
});

 var geometry = new XEO.Geometry(scene); // Geometry without parameters will default to a 2x2x2 box.

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````

 @class Texture
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Texture in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Texture.
 @param [cfg.minFilter]
 @param [cfg.magFilter]
 @param [cfg.wrapS]
 @param [cfg.wrapT]
 @param [cfg.isDepth]
 @param [cfg.depthMode]
 @param [cfg.depthCompareMode]
 @param [cfg.flipY]
 @param [cfg.width]
 @param [cfg.height]
 @param [cfg.internalFormat]
 @param [cfg.sourceFormat]
 @param [cfg.sourceType]
 @param [cfg.translate]
 @param [cfg.scale]
 @param [cfg.rotate]
 @extends Component
 */
XEO.Texture = XEO.Component.extend({

    className: "XEO.Texture",

    type: "texture",

    _init: function (cfg) {

        this._srcDirty = false;
        this._textureDirty = false;

        // Texture creation params

        this.minFilter = cfg.minFilter;
        this.magFilter = cfg.magFilter;
        this.wrapS = cfg.wrapS;
        this.wrapT = cfg.wrapT;
        this.isDepth = cfg.isDepth;
        this.depthMode = cfg.depthMode;
        this.depthCompareMode = cfg.depthCompareMode;
        this.depthCompareFunc = cfg.depthCompareFunc;
        this.flipY = cfg.flipY;
        this.width = cfg.width;
        this.height = cfg.height;
        this.internalFormat = cfg.internalFormat;
        this.sourceFormat = cfg.sourceFormat;
        this.sourceType = cfg.sourceType;

        // Texture application params

        this.translate = cfg.translate;
        this.scale = cfg.scale;
        this.rotate = cfg.rotate;

        // Texture source

        if (cfg.src) {
            this.src = cfg.src;

        } else if (cfg.target) {
            this.target = cfg.target;
        }

        // Create state core

        var core = this._core;

        core.waitForLoad = cfg.waitForLoad !== false;
        core.texture = null;
        core.matrix = null;

        core._matrixDirty = true;
        core._textureDirty = true;

        core.buildMatrix = function () {
            self._buildMatrix(core);
        };

        // Build transform matrix

        core.buildMatrix.call(this._core);

        // Initialise texture

        if (cfg.src) { // Load from URL
            this._core.src = cfg.src;
            this._loadTexture(cfg.src);

        } else if (cfg.image) { // Create from image
            this._core.image = cfg.image;
            this._initTexture(cfg.image);

        } else if (cfg.target) { // Render to this target
            this.scene.getComponent(cfg.target,
                function (target) {
                    self.setTarget(target);
                });
        }

        // Handle WebGL context restore

        this._webglContextRestored = this.scene.canvas.on(
            "webglContextRestored",
            function () {
                if (self._core.src) {
                    self._loadTexture(self._core.src);

                } else if (self._core.image) {
                    self._initTexture(self._core.image);

                } else if (self._core.target) {
//                    self.getScene().getComponent(cfg.target,
//                        function (target) {
//                            self.setTarget(self._core.target);
//                        });
                }
            });

        this.scene.stats.inc("textures");
    },

    /**
     * Path to an image file to source this texture from.
     *
     * Sets the {{#crossLink "Texture/target:property"}}{{/crossLink}} and
     * {{#crossLink "Texture/image:property"}}{{/crossLink}} properties to null.
     *
     * Fires a {{#crossLink "Texture/src:event"}}{{/crossLink}} event on change.
     *
     * @property src
     * @default null
     * @type String
     */
    set src(value) {
        this._core.image = null;
        this._core.src = value;
        this._core.target = null;
        var self = this;
        this.scene.once("tick", function () {
            self._loadTexture(self._core.src);
        });
        this._srcDirty = true;

        /**
         * Fired whenever this Texture's {{#crossLink "Texture/src:property"}}{{/crossLink}} property changes.
         * @event src
         * @param value The property's new value
         * @type String
         */
        this.fire("src", value);
    },

    get src() {
        return this._core.src;
    },

    /**
     * Instance or ID of a {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}} or
     * {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}} to source this texture from.
     *
     * Sets the {{#crossLink "Texture/src:property"}}{{/crossLink}} and
     * {{#crossLink "Texture/image:property"}}{{/crossLink}} properties to null.
     *
     * Fires a {{#crossLink "Texture/target:event"}}{{/crossLink}} event on change.
     *
     * @property target
     * @default null
     * @type String | XEO.ColorTarget | XEO.DepthTarget
     */
    set target(value) {
        this._setChild("renderBuf", value); // Target is a render buffer
        this._core.image = null;
        this._core.src = null;
        this._core.target = null;
        this._targetDirty = true;
        this._setDirty();

        /**
         * Fired whenever this Texture's   {{#crossLink "Texture/target:property"}}{{/crossLink}} property changes.
         * @event target
         * @param value The property's new value
         * @type String | XEO.ColorTarget | XEO.DepthTarget
         */
        this.fire("target", value);
    },

    get target() {
        return this._children.renderBuf;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/translate:event"}}{{/crossLink}} event on change.
     *
     * @property translate
     * @default [0, 0, 0]
     * @type Array(Number)
     */
    set translate(value) {
        value = value || [0, 0, 0];
        this._core.translate = value;
        this._core._matrixDirty = true;

        /**
         * Fired whenever this Texture's   {{#crossLink "Texture/translate:property"}}{{/crossLink}} property changes.
         * @event translate
         * @param value {Array(Number)} The property's new value
         */
        this.fire("translate", value);
    },

    get translate() {
        return this._core.translate;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/scale:event"}}{{/crossLink}} event on change.
     *
     * @property scale
     * @default [0, 0, 0]
     * @type Array(Number)
     */
    set scale(value) {
        value = value || [1, 1, 1];
        this._core.scale = value;
        this._core._matrixDirty = true;
        //...

        /**
         * Fired whenever this Texture's   {{#crossLink "Texture/scale:property"}}{{/crossLink}} property changes.
         * @event scale
         * @param value {Array(Number)} The property's new value
         */
        this.fire("scale", value);
    },

    get scale() {
        return this._core.scale;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/rotate:event"}}{{/crossLink}} event on change.
     *
     * @property rotate
     * @default 0
     * @type Number
     */
    set rotate(value) {
        value = value || 0;
        this._core.rotate = value;
        this._core._matrixDirty = true;
        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/rotate:property"}}{{/crossLink}} property changes.
         * @event rotate
         * @param value {Number} The property's new value
         */
        this.fire("rotate", value);
    },

    get rotate() {
        return this._core.rotate;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/minFilter:event"}}{{/crossLink}} event on change.
     *
     * @property minFilter
     * @default "linearMipMapNearest"
     * @type String
     */
    set minFilter(value) {
        value = value || "linearMipMapNearest";
        this._core.minFilter = value;

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/minFilter:property"}}{{/crossLink}} property changes.
         * @event minFilter
         * @param value {String} The property's new value
         */
        this.fire("minFilter", value);
    },

    get minFilter() {
        return this._core.minFilter;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/magFilter:event"}}{{/crossLink}} event on change.
     *
     * @property magFilter
     * @default "linear"
     * @type String
     */
    set magFilter(value) {
        value = value || "linear";
        this._core.magFilter = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/magFilter:property"}}{{/crossLink}} property changes.
         * @event magFilter
         * @param value {String} The property's new value
         */
        this.fire("magFilter", value);
    },

    get magFilter() {
        return this._core.magFilter;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/wrapS:event"}}{{/crossLink}} event on change.
     *
     * @property wrapS
     * @default "repeat"
     * @type String
     */
    set wrapS(value) {
        value = value || "repeat";
        this._core.wrapS = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/wrapS:property"}}{{/crossLink}} property changes.
         * @event wrapS
         * @param value {String} The property's new value
         */
        this.fire("wrapS", value);
    },

    get wrapS() {
        return this._core.wrapS;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/wrapT:event"}}{{/crossLink}} event on change.
     *
     * @property wrapT
     * @default "repeat"
     * @type String
     */
    set wrapT(value) {
        value = value || "repeat";
        this._core.wrapT = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/wrapT:property"}}{{/crossLink}} property changes.
         * @event wrapT
         * @param value {String} The property's new value
         */
        this.fire("wrapT", value);
    },

    get wrapT() {
        return this._core.wrapT;
    },

    /**
     * TODO
     *
     * Fires an {{#crossLink "Texture/isDepth:event"}}{{/crossLink}} event on change.
     *
     * @property isDepth
     * @default false
     * @type Boolean
     */
    set isDepth(value) {
        value = value === true;
        this._core.isDepth = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/isDepth:property"}}{{/crossLink}} property changes.
         * @event isDepth
         * @param value {Boolean} The property's new value
         */
        this.fire("isDepth", value);
    },

    get isDepth() {
        return this._core.isDepth;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/depthMode:event"}}{{/crossLink}} event on change.
     *
     * @property depthMode
     * @default "luminance"
     * @type String
     */
    set depthMode(value) {
        value = value || "luminance";
        this._core.depthMode = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/depthMode:property"}}{{/crossLink}} property changes.
         * @event depthMode
         * @param value {String} The property's new value
         */
        this.fire("depthMode", value);
    },

    get depthMode() {
        return this._core.depthMode;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/depthMode:event"}}{{/crossLink}} event on change.
     *
     * @property depthCompareMode
     * @default "compareRToTexture"
     * @type String
     */
    set depthCompareMode(value) {
        value = value || "compareRToTexture";
        this._core.depthCompareMode = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/depthCompareMode:property"}}{{/crossLink}} property changes.
         * @event depthCompareMode
         * @param value {String} The property's new value
         */
        this.fire("depthCompareMode", value);
    },

    get depthCompareMode() {
        return this._core.depthCompareMode;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/depthCompareFunc:event"}}{{/crossLink}} event on change.
     *
     * @property depthCompareFunc
     * @default "lequal"
     * @type String
     */
    set depthCompareFunc(value) {
        value = value || "lequal";
        this._core.depthCompareFunc = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/depthCompareFunc:property"}}{{/crossLink}} property changes.
         * @event depthCompareFunc
         * @param value {String} The property's new value
         */
        this.fire("depthCompareFunc", value);
    },

    get depthCompareFunc() {
        return this._core.depthCompareFunc;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/flipY:event"}}{{/crossLink}} event on change.
     *
     * @property flipY
     * @default false
     * @type Boolean
     */
    set flipY(value) {
        value = value !== false;
        this._core.flipY = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/flipY:property"}}{{/crossLink}} property changes.
         * @event flipY
         * @param value {Boolean} The property's new value
         */
        this.fire("flipY", value);
    },

    get flipY() {
        return this._core.flipY;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/width:event"}}{{/crossLink}} event on change.
     *
     * @property width
     * @default false
     * @type Number
     */
    set width(value) {
        value = value != undefined ? value : 1.0;
        this._core.width = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/width:property"}}{{/crossLink}} property changes.
         * @event width
         * @param value {Number} The property's new value
         */
        this.fire("width", value);
    },

    get width() {
        return this._core.width;
    },

    /**
     * TODO
     *
     * Fires a {{#crossLink "Texture/height:event"}}{{/crossLink}} event on change.
     *
     * @property height
     * @default false
     * @type Number
     */
    set height(value) {
        value = value != undefined ? value : 1.0;
        this._core.height = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/height:property"}}{{/crossLink}} property changes.
         * @event height
         * @param value {Number} The property's new value
         */
        this.fire("height", value);
    },

    get height() {
        return this._core.height;
    },

    /**
     * TODO
     *
     * Fires an {{#crossLink "Texture/internalFormat:event"}}{{/crossLink}} event on change.
     *
     * @property internalFormat
     * @default "alpha"
     * @type String
     */
    set internalFormat(value) {
        value = value || "alpha";
        this._core.internalFormat = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/internalFormat:property"}}{{/crossLink}} property changes.
         * @event internalFormat
         * @param value {String} The property's new value
         */
        this.fire("internalFormat", value);
    },

    get internalFormat() {
        return this._core.internalFormat;
    },

    /**
     * TODO
     *
     * Fires an {{#crossLink "Texture/sourceFormat:event"}}{{/crossLink}} event on change.
     *
     * @property sourceFormat
     * @default "alpha"
     * @type String
     */
    set sourceFormat(value) {
        value = value || "alpha";
        this._core.sourceFormat = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/sourceFormat:property"}}{{/crossLink}} property changes.
         * @event sourceFormat
         * @param value {String} The property's new value
         */
        this.fire("sourceFormat", value);
    },

    get sourceFormat() {
        return this._core.sourceFormat;
    },

    /**
     * TODO
     *
     * Fires an {{#crossLink "Texture/sourceType:event"}}{{/crossLink}} event on change.
     *
     * @property sourceType
     * @default "unsignedByte"
     * @type String
     */
    set sourceType(value) {
        value = value || "unsignedByte";
        this._core.sourceType = value;

        //...

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/sourceType:property"}}{{/crossLink}} property changes.
         * @event sourceType
         * @param value {String} The property's new value
         */
        this.fire("sourceType", value);
    },

    get sourceType() {
        return this._core.sourceType;
    },

    /**
     * TODO
     *
     * Fires an {{#crossLink "Texture/image:event"}}{{/crossLink}} event on change.
     *
     * @property image
     * @default null
     * @type {HTML Image}
     */
    set image(value) {

        /**
         * Fired whenever this Texture's  {{#crossLink "Texture/image:property"}}{{/crossLink}} property changes.
         * @event image
         * @param value {HTML Image} The property's new value
         */
        this.fire("image", value);
    },

    get image() {

    },

    /**
     * Rebuilds the texture transform matrix
     * @private
     */
    _buildMatrix: function () {
        var matrix;
        var t;
        if (this.translate.x != 0 || this.translate.y != 0) {
            matrix = XEO.math.translationMat4v([ this.translate.x || 0, this.translate.y || 0, 0]);
        }
        if (this.scale.x != 1 || this.scale.y != 1) {
            t = XEO.math.scalingMat4v([ this.scale.x || 1, this.scale.y || 1, 1]);
            matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
        }
        if (this.rotate != 0) {
            t = XEO.math.rotationMat4v(this.rotate * 0.0174532925, [0, 0, 1]);
            matrix = matrix ? XEO.math.mulMat4(matrix, t) : t;
        }
        if (matrix) {
            this.matrix = matrix;
            if (!this.matrixAsArray) {
                this.matrixAsArray = new Float32Array(this.matrix);
            } else {
                this.matrixAsArray.set(this.matrix);
            }
        }
        this._matrixDirty = false;
    },

    /**
     * Initialises texture using image loaded from given URL
     * @param src
     * @private
     */
    _loadTexture: function (src) {
        var self = this;
        var task = this.scene.tasks.create({
            description: "Loading texture"
        });
        var image = new Image();
        image.onload = function () {
            self._initTexture(image);
            task.setCompleted();
        };
        image.onerror = function () {
            task.setFailed();
        };
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    },

    _initTexture: function (image) {
        var exists = !!this._core.texture;
        var gl = this.scene.canvas.gl;
        var texture = exists ? this._core.texture.texture : gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._ensureImageSizePowerOfTwo(image));
        if (!exists) {
            this._core.texture = new XEO.webgl.Texture2D(gl, {
                texture: texture, // WebGL texture object
                minFilter: this._getGLOption("minFilter", gl.LINEAR_MIPMAP_NEAREST),
                magFilter: this._getGLOption("magFilter", gl.LINEAR),
                wrapS: this._getGLOption("wrapS", gl.REPEAT),
                wrapT: this._getGLOption("wrapT", gl.REPEAT),
                isDepth: this._getOption(this._core.isDepth, false),
                depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
                depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
                depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
                flipY: this._getOption(this._core.flipY, true),
                width: this._getOption(this._core.width, 1),
                height: this._getOption(this._core.height, 1),
                internalFormat: this._getGLOption("internalFormat", gl.LEQUAL),
                sourceFormat: this._getGLOption("sourceType", gl.ALPHA),
                sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
                update: null
            });
            if (this.destroyed) { // component was destroyed while loading
                this._core.texture.destroy();
            }
        }
        this._renderer.imageDirty = true;
    },

    _ensureImageSizePowerOfTwo: function (image) {
        if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {
            var canvas = document.createElement("canvas");
            canvas.width = this._nextHighestPowerOfTwo(image.width);
            canvas.height = this._nextHighestPowerOfTwo(image.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
            image = canvas;
            image.crossOrigin = "";
        }
        return image;
    },

    _isPowerOfTwo: function (x) {
        return (x & (x - 1)) == 0;
    },

    _nextHighestPowerOfTwo: function (x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    },

    _getGLOption: function (name, defaultVal) {
        var gl = this.scene.canvas.gl;
        var value = this._core[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = XEO.webgl.enums[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_COMPONENT_CONFIG,
                    "Unrecognised value for texture component property '" + name + "' value: '" + value + "'");
        }
        return gl[glName];
    },

    _getOption: function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    },

    _getJSON: function () {
        var json = {
            translate: this.translate,
            scale: this.scale,
            rotate: this.rotate,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            wrapS: this.wrapS,
            wrapT: this.wrapT,
            isDepth: this.isDepth,
            depthMode: this.depthMode,
            depthCompareMode: this.depthCompareMode,
            depthCompareFunc: this.depthCompareFunc,
            flipY: this.flipY,
            width: this.width,
            height: this.height,
            internalFormat: this.internalFormat,
            sourceFormat: this.sourceFormat,
            sourceType: this.sourceType
        };
        if (this.src) {
            json.src = this.src;
        } else if (this.target) {
            json.target = this.target.id;
        }
        //...
        return json;
    },

    _destroy: function () {
        this.scene.off(this._tick);
        this.scene.canvas.off(this._webglContextRestored);
        this.scene.stats.dec("textures");
    }
});;XEO.utils = XEO.utils || {};

/**
 * @class Generic map of IDs to items - can generate own IDs or accept given IDs. IDs should be strings in order to not
 * clash with internally generated IDs, which are numbers.
 */
XEO.utils.Map = function (items, baseId) {

    /**
     * @property Items in this map
     */
    this.items = items || [];

    baseId = _baseId || 0;
    var lastUniqueId = baseId + 1;

    /**
     * Adds an item to the map and returns the ID of the item in the map. If an ID is given, the item is
     * mapped to that ID. Otherwise, the map automatically generates the ID and maps to that.
     *
     * id = myMap.addItem("foo") // ID internally generated
     *
     * id = myMap.addItem("foo", "bar") // ID is "foo"
     *
     */
    this.addItem = function () {
        var item;
        if (arguments.length == 2) {
            var id = arguments[0];
            item = arguments[1];
            if (this.items[id]) { // Won't happen if given ID is string
                throw "ID clash: '" + id + "'";
            }
            this.items[id] = item;
            return id;

        } else {
            while (true) {
                item = arguments[0];
                var findId = lastUniqueId++;
                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    /**
     * Removes the item of the given ID from the map and returns it
     */
    this.removeItem = function (id) {
        var item = this.items[id];
        delete this.items[id];
        return item;
    };
};;"use strict";

/*
 * Optimizations made based on glMatrix by Brandon Jones
 */

/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */


/**
 * Math functions.
 * @module XEO
 * @class math
 * @static
 */
XEO.math = {

    /**
     * Returns a new UUID.
     * @method createUUID
     * @static
     * @return string The new UUID
     */
    createUUID: function () {
        // http://www.broofa.com/Tools/Math.uuid.htm
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = new Array(36);
        var rnd = 0, r;
        return function () {
            for (var i = 0; i < 36; i++) {
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[ i ] = '-';
                } else if (i == 14) {
                    uuid[ i ] = '4';
                } else {
                    if (rnd <= 0x02) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[ i ] = chars[ ( i == 19 ) ? ( r & 0x3 ) | 0x8 : r ];
                }
            }
            return uuid.join('');
        };

    }(),

    /**
     * Floating-point modulus
     * @param a
     * @param b
     * @returns {*}
     */
    fmod: function (a, b) {
        if (a < b) {
            console.error("XEO.math.fmod : Attempting to find modulus within negative range - would be infinite loop - ignoring");
            return a;
        }
        while (b <= a) {
            a -= b;
        }
        return a;
    },

    /**
     * Negates a four-element vector.
     * @method negateVec4
     * @param {Array(Number)} v Vector to negate
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    negateVec4: function (v, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = -v[0];
        dest[1] = -v[1];
        dest[2] = -v[2];
        dest[3] = -v[3];
        return dest;
    },

    /**
     * Adds one four-element vector to another.
     * @method addVec4
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    addVec4: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] + v[0];
        dest[1] = u[1] + v[1];
        dest[2] = u[2] + v[2];
        dest[3] = u[3] + v[3];
        return dest;
    },

    /**
     * Adds a scalar value to each element of a four-element vector.
     * @method addVec4Scalar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    addVec4Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] + s;
        dest[1] = v[1] + s;
        dest[2] = v[2] + s;
        dest[3] = v[3] + s;
        return dest;
    },

    /**
     * Adds one three-element vector to another.
     * @method addVec3
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    addVec3: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] + v[0];
        dest[1] = u[1] + v[1];
        dest[2] = u[2] + v[2];
        return dest;
    },

    /**
     * Adds a scalar value to each element of a three-element vector.
     * @method addVec4Scalar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    addVec3Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] + s;
        dest[1] = v[1] + s;
        dest[2] = v[2] + s;
        return dest;
    },

    /**
     * Subtracts one four-element vector from another.
     * @method subVec4
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Vector to subtract
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    subVec4: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];
        dest[3] = u[3] - v[3];
        return dest;
    },

    /**
     * Subtracts one three-element vector from another.
     * @method subVec3
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Vector to subtract
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    subVec3: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];
        return dest;
    },

    /**
     * Subtracts one two-element vector from another.
     * @method subVec2
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Vector to subtract
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    subVec2: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        return dest;
    },

    /**
     * Subtracts a scalar value from each element of a four-element vector.
     * @method subVec4Scalar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    subVec4Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] - s;
        dest[1] = v[1] - s;
        dest[2] = v[2] - s;
        dest[3] = v[3] - s;
        return dest;
    },

    /**
     * Sets each element of a 4-element vector to a scalar value minus the value of that element.
     * @method subScalarVec4
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    subScalarVec4: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = s - v[0];
        dest[1] = s - v[1];
        dest[2] = s - v[2];
        dest[3] = s - v[3];
        return dest;
    },

    /**
     * Multiplies one three-element vector by another.
     * @method mulVec3
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    mulVec4: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] * v[0];
        dest[1] = u[1] * v[1];
        dest[2] = u[2] * v[2];
        dest[3] = u[3] * v[3];
        return dest;
    },

    /**
     * Multiplies each element of a four-element vector by a scalar.
     * @method mulVec34calar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    mulVec4Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        dest[2] = v[2] * s;
        dest[3] = v[3] * s;
        return dest;
    },

    /**
     * Multiplies each element of a three-element vector by a scalar.
     * @method mulVec3Scalar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    mulVec3Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        dest[2] = v[2] * s;
        return dest;
    },

    /**
     * Multiplies each element of a two-element vector by a scalar.
     * @method mulVec2Scalar
     * @param {Array(Number)} v The vector
     * @param {Number} s The scalar
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, v otherwise
     */
    mulVec2Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        return dest;
    },

    /**
     * Divides one three-element vector by another.
     * @method divVec3
     * @static
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    divVec3: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] / v[0];
        dest[1] = u[1] / v[1];
        dest[2] = u[2] / v[2];
        return dest;
    },

    /**
     * Divides one four-element vector by another.
     * @method divVec4
     * @static
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @param  {Array(Number)} [dest] Destination vector
     * @return {Array(Number)} dest if specified, u otherwise
     */
    divVec4: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        dest[0] = u[0] / v[0];
        dest[1] = u[1] / v[1];
        dest[2] = u[2] / v[2];
        dest[3] = u[3] / v[3];
        return dest;
    },

    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    divScalarVec3: function (s, v, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = s / v[0];
        dest[1] = s / v[1];
        dest[2] = s / v[2];
        return dest;
    },

    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    divVec3Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] / s;
        dest[1] = v[1] / s;
        dest[2] = v[2] / s;
        return dest;
    },

    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    divVec4Scalar: function (v, s, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = v[0] / s;
        dest[1] = v[1] / s;
        dest[2] = v[2] / s;
        dest[3] = v[3] / s;
        return dest;
    },


    /**
     * @param s scalar
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return [] dest if specified, v otherwise

     */
    divScalarVec4: function (s, v, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = s / v[0];
        dest[1] = s / v[1];
        dest[2] = s / v[2];
        dest[3] = s / v[3];
        return dest;
    },


    dotVec4: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    },


    cross3Vec4: function (u, v) {
        var u0 = u[0], u1 = u[1], u2 = u[2];
        var v0 = v[0], v1 = v[1], v2 = v[2];
        return [
                u1 * v2 - u2 * v1,
                u2 * v0 - u0 * v2,
                u0 * v1 - u1 * v0,
            0.0];
    },

    /**
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return [] dest if specified, u otherwise
     *
     */
    cross3Vec3: function (u, v, dest) {
        if (!dest) {
            dest = u;
        }
        var x = u[0], y = u[1], z = u[2];
        var x2 = v[0], y2 = v[1], z2 = v[2];
        dest[0] = y * z2 - z * y2;
        dest[1] = z * x2 - x * z2;
        dest[2] = x * y2 - y * x2;
        return dest;
    },

    /**  */
    sqLenVec4: function (v) {
        return XEO.math.dotVec4(v, v);
    },

    /**  */
    lenVec4: function (v) {
        return Math.sqrt(XEO.math.sqLenVec4(v));
    },

    /**  */
    dotVec3: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    },

    /**  */
    dotVec2: function (u, v) {
        return (u[0] * v[0] + u[1] * v[1]);
    },

    /**  */
    sqLenVec3: function (v) {
        return XEO.math.dotVec3(v, v);
    },

    /**  */
    sqLenVec2: function (v) {
        return XEO.math.dotVec2(v, v);
    },

    /**  */
    lenVec3: function (v) {
        return Math.sqrt(XEO.math.sqLenVec3(v));
    },

    /**  */
    lenVec2: function (v) {
        return Math.sqrt(XEO.math.sqLenVec2(v));
    },

    /**
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    rcpVec3: function (v, dest) {
        return XEO.math.divScalarVec3(1.0, v, dest);
    },

    /**
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return [] dest if specified, v otherwise
     *
     */
    normalizeVec4: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec4(v);
        return XEO.math.mulVec4Scalar(v, f, dest);
    },

    /**  */
    normalizeVec3: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec3(v);
        return XEO.math.mulVec3Scalar(v, f, dest);
    },

// 
    normalizeVec2: function (v, dest) {
        var f = 1.0 / XEO.math.lenVec2(v);
        return XEO.math.mulVec2Scalar(v, f, dest);
    },

    /**  */
    mat4: function () {
        return new Array(16);
    },

    /**  */
    dupMat4: function (m) {
        return m.slice(0, 16);
    },

    /**  */
    mat4To3: function (m) {
        return [
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        ];
    },

    /**  */
    m4s: function (s) {
        return [
            s, s, s, s,
            s, s, s, s,
            s, s, s, s,
            s, s, s, s
        ];
    },

    /**  */
    setMat4ToZeroes: function () {
        return XEO.math.m4s(0.0);
    },

    /**  */
    setMat4ToOnes: function () {
        return XEO.math.m4s(1.0);
    },

    /**  */
    diagonalMat4v: function (v) {
        return [
            v[0], 0.0, 0.0, 0.0,
            0.0, v[1], 0.0, 0.0,
            0.0, 0.0, v[2], 0.0,
            0.0, 0.0, 0.0, v[3]
        ];
    },

    /**  */
    diagonalMat4c: function (x, y, z, w) {
        return XEO.math.diagonalMat4v([x, y, z, w]);
    },

    /**  */
    diagonalMat4s: function (s) {
        return XEO.math.diagonalMat4c(s, s, s, s);
    },

    /**  */
    identityMat4: function () {
        return XEO.math.diagonalMat4v([1.0, 1.0, 1.0, 1.0]);
    },

    /**  */
    isIdentityMat4: function (m) {
        if (m[0] !== 1.0 || m[1] !== 0.0 || m[2] !== 0.0 || m[3] !== 0.0 ||
            m[4] !== 0.0 || m[5] !== 1.0 || m[6] !== 0.0 || m[7] !== 0.0 ||
            m[8] !== 0.0 || m[9] !== 0.0 || m[10] !== 1.0 || m[11] !== 0.0 ||
            m[12] !== 0.0 || m[13] !== 0.0 || m[14] !== 0.0 || m[15] !== 1.0) {
            return false;
        }
        return true;
    },

    /**
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
     */
    negateMat4: function (m, dest) {
        if (!dest) {
            dest = m;
        }
        dest[0] = -m[0];
        dest[1] = -m[1];
        dest[2] = -m[2];
        dest[3] = -m[3];
        dest[4] = -m[4];
        dest[5] = -m[5];
        dest[6] = -m[6];
        dest[7] = -m[7];
        dest[8] = -m[8];
        dest[9] = -m[9];
        dest[10] = -m[10];
        dest[11] = -m[11];
        dest[12] = -m[12];
        dest[13] = -m[13];
        dest[14] = -m[14];
        dest[15] = -m[15];
        return dest;
    },

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
     */
    addMat4: function (a, b, dest) {
        if (!dest) {
            dest = a;
        }
        dest[0] = a[0] + b[0];
        dest[1] = a[1] + b[1];
        dest[2] = a[2] + b[2];
        dest[3] = a[3] + b[3];
        dest[4] = a[4] + b[4];
        dest[5] = a[5] + b[5];
        dest[6] = a[6] + b[6];
        dest[7] = a[7] + b[7];
        dest[8] = a[8] + b[8];
        dest[9] = a[9] + b[9];
        dest[10] = a[10] + b[10];
        dest[11] = a[11] + b[11];
        dest[12] = a[12] + b[12];
        dest[13] = a[13] + b[13];
        dest[14] = a[14] + b[14];
        dest[15] = a[15] + b[15];
        return dest;
    },

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
     */
    addMat4Scalar: function (m, s, dest) {
        if (!dest) {
            dest = m;
        }
        dest[0] = m[0] + s;
        dest[1] = m[1] + s;
        dest[2] = m[2] + s;
        dest[3] = m[3] + s;
        dest[4] = m[4] + s;
        dest[5] = m[5] + s;
        dest[6] = m[6] + s;
        dest[7] = m[7] + s;
        dest[8] = m[8] + s;
        dest[9] = m[9] + s;
        dest[10] = m[10] + s;
        dest[11] = m[11] + s;
        dest[12] = m[12] + s;
        dest[13] = m[13] + s;
        dest[14] = m[14] + s;
        dest[15] = m[15] + s;
        return dest;
    },

    /**  */
    addScalarMat4: function (s, m, dest) {
        return XEO.math.addMat4Scalar(m, s, dest);
    },

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
     */
    subMat4: function (a, b, dest) {
        if (!dest) {
            dest = a;
        }
        dest[0] = a[0] - b[0];
        dest[1] = a[1] - b[1];
        dest[2] = a[2] - b[2];
        dest[3] = a[3] - b[3];
        dest[4] = a[4] - b[4];
        dest[5] = a[5] - b[5];
        dest[6] = a[6] - b[6];
        dest[7] = a[7] - b[7];
        dest[8] = a[8] - b[8];
        dest[9] = a[9] - b[9];
        dest[10] = a[10] - b[10];
        dest[11] = a[11] - b[11];
        dest[12] = a[12] - b[12];
        dest[13] = a[13] - b[13];
        dest[14] = a[14] - b[14];
        dest[15] = a[15] - b[15];
        return dest;
    },

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
     */
    subMat4Scalar: function (m, s, dest) {
        if (!dest) {
            dest = m;
        }
        dest[0] = m[0] - s;
        dest[1] = m[1] - s;
        dest[2] = m[2] - s;
        dest[3] = m[3] - s;
        dest[4] = m[4] - s;
        dest[5] = m[5] - s;
        dest[6] = m[6] - s;
        dest[7] = m[7] - s;
        dest[8] = m[8] - s;
        dest[9] = m[9] - s;
        dest[10] = m[10] - s;
        dest[11] = m[11] - s;
        dest[12] = m[12] - s;
        dest[13] = m[13] - s;
        dest[14] = m[14] - s;
        dest[15] = m[15] - s;
        return dest;
    },

    /**
     * @param s scalar
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
     */
    subScalarMat4: function (s, m, dest) {
        if (!dest) {
            dest = m;
        }
        dest[0] = s - m[0];
        dest[1] = s - m[1];
        dest[2] = s - m[2];
        dest[3] = s - m[3];
        dest[4] = s - m[4];
        dest[5] = s - m[5];
        dest[6] = s - m[6];
        dest[7] = s - m[7];
        dest[8] = s - m[8];
        dest[9] = s - m[9];
        dest[10] = s - m[10];
        dest[11] = s - m[11];
        dest[12] = s - m[12];
        dest[13] = s - m[13];
        dest[14] = s - m[14];
        dest[15] = s - m[15];
        return dest;
    },

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     *
     */
    mulMat4: function (a, b, dest) {
        if (!dest) {
            dest = a;
        }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        var b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        var b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
        var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
        var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return dest;
    },

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     *
     */
    mulMat4Scalar: function (m, s, dest) {
        if (!dest) {
            dest = m;
        }
        dest[0] = m[0] * s;
        dest[1] = m[1] * s;
        dest[2] = m[2] * s;
        dest[3] = m[3] * s;
        dest[4] = m[4] * s;
        dest[5] = m[5] * s;
        dest[6] = m[6] * s;
        dest[7] = m[7] * s;
        dest[8] = m[8] * s;
        dest[9] = m[9] * s;
        dest[10] = m[10] * s;
        dest[11] = m[11] * s;
        dest[12] = m[12] * s;
        dest[13] = m[13] * s;
        dest[14] = m[14] * s;
        dest[15] = m[15] * s;
        return dest;
    },

    /**
     * @param m mat4
     * @param v vec4
     * @return []
     *
     */
    mulMat4v4: function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
        return [
                m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3,
                m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3,
                m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3,
                m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3
        ];
    },

    /**
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     *
     */
    transposeMat4: function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        var m4 = mat[4], m14 = mat[14], m8 = mat[8];
        var m13 = mat[13], m12 = mat[12], m9 = mat[9];
        if (!dest || mat == dest) {
            var a01 = mat[1], a02 = mat[2], a03 = mat[3];
            var a12 = mat[6], a13 = mat[7];
            var a23 = mat[11];
            mat[1] = m4;
            mat[2] = m8;
            mat[3] = m12;
            mat[4] = a01;
            mat[6] = m9;
            mat[7] = m13;
            mat[8] = a02;
            mat[9] = a12;
            mat[11] = m14;
            mat[12] = a03;
            mat[13] = a13;
            mat[14] = a23;
            return mat;
        }
        dest[0] = mat[0];
        dest[1] = m4;
        dest[2] = m8;
        dest[3] = m12;
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = m9;
        dest[7] = m13;
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = m14;
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    },

    /**  */
    determinantMat4: function (mat) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
            a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
            a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
            a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
            a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
            a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
    },

    /**
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     *
     */
    inverseMat4: function (mat, dest) {
        if (!dest) {
            dest = mat;
        }
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant (inlined to avoid double-caching)
        var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

        return dest;
    },

    /**  */
    traceMat4: function (m) {
        return (m[0] + m[5] + m[10] + m[15]);
    },

    /**  */
    translationMat4v: function (v) {
        var m = XEO.math.identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    },

    /**  */
    translationMat4c: function (x, y, z) {
        return XEO.math.translationMat4v([x, y, z]);
    },

    /**  */
    translationMat4s: function (s) {
        return XEO.math.translationMat4c(s, s, s);
    },

    /**  */
    rotationMat4v: function (anglerad, axis) {
        var ax = XEO.math.normalizeVec4([axis[0], axis[1], axis[2], 0.0], []);
        var s = Math.sin(anglerad);
        var c = Math.cos(anglerad);
        var q = 1.0 - c;

        var x = ax[0];
        var y = ax[1];
        var z = ax[2];

        var xy, yz, zx, xs, ys, zs;

        //xx = x * x; used once
        //yy = y * y; used once
        //zz = z * z; used once
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        var m = XEO.math.mat4();

        m[0] = (q * x * x) + c;
        m[1] = (q * xy) + zs;
        m[2] = (q * zx) - ys;
        m[3] = 0.0;

        m[4] = (q * xy) - zs;
        m[5] = (q * y * y) + c;
        m[6] = (q * yz) + xs;
        m[7] = 0.0;

        m[8] = (q * zx) + ys;
        m[9] = (q * yz) - xs;
        m[10] = (q * z * z) + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    },

    /**  */
    rotationMat4c: function (anglerad, x, y, z) {
        return XEO.math.rotationMat4v(anglerad, [x, y, z]);
    },

    /**  */
    scalingMat4v: function (v) {
        var m = XEO.math.identityMat4();
        m[0] = v[0];
        m[5] = v[1];
        m[10] = v[2];
        return m;
    },

    /**  */
    scalingMat4c: function (x, y, z) {
        return XEO.math.scalingMat4v([x, y, z]);
    },

    /**  */
    scalingMat4s: function (s) {
        return XEO.math.scalingMat4c(s, s, s);
    },

    /**
     * @param pos vec3 position of the viewer
     * @param target vec3 point the viewer is looking at
     * @param up vec3 pointing "up"
     * @param dest mat4 Optional, mat4 frustum matrix will be written into
     *
     * @return {mat4} dest if specified, a new mat4 otherwise
     */
    lookAtMat4v: function (pos, target, up, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
        }

        var posx = pos[0],
            posy = pos[1],
            posz = pos[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            targetx = target[0],
            targety = target[1],
            targetz = target[2];

        if (posx == targetx && posy == targety && posz == targetz) {
            return XEO.math.identityMat4();
        }

        var z0, z1, z2, x0, x1, x2, y0, y1, y2, len;

        //vec3.direction(eye, center, z);
        z0 = posx - targetx;
        z1 = posy - targety;
        z2 = posz - targetz;

        // normalize (no check needed for 0 because of early return)
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        //vec3.normalize(vec3.cross(up, z, x));
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        //vec3.normalize(vec3.cross(z, x, y));
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * posx + x1 * posy + x2 * posz);
        dest[13] = -(y0 * posx + y1 * posy + y2 * posz);
        dest[14] = -(z0 * posx + z1 * posy + z2 * posz);
        dest[15] = 1;

        return dest;
    },

    /**  */
    lookAtMat4c: function (posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
        return XEO.math.lookAtMat4v([posx, posy, posz], [targetx, targety, targetz], [upx, upy, upz], []);
    },

    /**  */
    orthoMat4c: function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
        }
        var rl = (right - left);
        var tb = (top - bottom);
        var fn = (far - near);

        dest[0] = 2.0 / rl;
        dest[1] = 0.0;
        dest[2] = 0.0;
        dest[3] = 0.0;

        dest[4] = 0.0;
        dest[5] = 2.0 / tb;
        dest[6] = 0.0;
        dest[7] = 0.0;

        dest[8] = 0.0;
        dest[9] = 0.0;
        dest[10] = -2.0 / fn;
        dest[11] = 0.0;

        dest[12] = -(left + right) / rl;
        dest[13] = -(top + bottom) / tb;
        dest[14] = -(far + near) / fn;
        dest[15] = 1.0;

        return dest;
    },

    /**  */
    frustumMat4v: function (fmin, fmax) {
        var fmin4 = [fmin[0], fmin[1], fmin[2], 0.0];
        var fmax4 = [fmax[0], fmax[1], fmax[2], 0.0];
        var vsum = XEO.math.mat4();
        XEO.math.addVec4(fmax4, fmin4, vsum);
        var vdif = XEO.math.mat4();
        XEO.math.subVec4(fmax4, fmin4, vdif);
        var t = 2.0 * fmin4[2];

        var m = XEO.math.mat4();
        var vdif0 = vdif[0], vdif1 = vdif[1], vdif2 = vdif[2];

        m[0] = t / vdif0;
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif1;
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif0;
        m[9] = vsum[1] / vdif1;
        m[10] = -vsum[2] / vdif2;
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif2;
        m[15] = 0.0;

        return m;
    },

    /**  */
    frustumMatrix4: function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = XEO.math.mat4();
        }
        var rl = (right - left);
        var tb = (top - bottom);
        var fn = (far - near);
        dest[0] = (near * 2) / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = (near * 2) / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / fn;
        dest[15] = 0;
        return dest;
    },


    /**  */
    perspectiveMatrix4: function (fovyrad, aspectratio, znear, zfar) {
        var pmin = [];
        var pmax = [];

        pmin[2] = znear;
        pmax[2] = zfar;

        pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspectratio;
        pmin[0] = -pmax[0];

        return XEO.math.frustumMat4v(pmin, pmax);
    },

    /**  */
    transformPoint3: function (m, p) {
        var p0 = p[0], p1 = p[1], p2 = p[2];
        return [
                (m[0] * p0) + (m[4] * p1) + (m[8] * p2) + m[12],
                (m[1] * p0) + (m[5] * p1) + (m[9] * p2) + m[13],
                (m[2] * p0) + (m[6] * p1) + (m[10] * p2) + m[14],
                (m[3] * p0) + (m[7] * p1) + (m[11] * p2) + m[15]
        ];
    },


    /**  */
    transformPoints3: function (m, points) {
        var result = new Array(points.length);
        var len = points.length;
        var p0, p1, p2;
        var pi;

        // cache values
        var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
        var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
        var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
        var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];

        for (var i = 0; i < len; ++i) {
            // cache values
            pi = points[i];
            p0 = pi[0];
            p1 = pi[1];
            p2 = pi[2];

            result[i] = [
                    (m0 * p0) + (m4 * p1) + (m8 * p2) + m12,
                    (m1 * p0) + (m5 * p1) + (m9 * p2) + m13,
                    (m2 * p0) + (m6 * p1) + (m10 * p2) + m14,
                    (m3 * p0) + (m7 * p1) + (m11 * p2) + m15
            ];
        }

        return result;
    },

    /**  */
    transformVec3: function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2];
        return [
                (m[0] * v0) + (m[4] * v1) + (m[8] * v2),
                (m[1] * v0) + (m[5] * v1) + (m[9] * v2),
                (m[2] * v0) + (m[6] * v1) + (m[10] * v2)
        ];
    },

    transformVec4: function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
        return [
                m[ 0] * v0 + m[ 4] * v1 + m[ 8] * v2 + m[12] * v3,
                m[ 1] * v0 + m[ 5] * v1 + m[ 9] * v2 + m[13] * v3,
                m[ 2] * v0 + m[ 6] * v1 + m[10] * v2 + m[14] * v3,
                m[ 3] * v0 + m[ 7] * v1 + m[11] * v2 + m[15] * v3
        ];
    },

    /**  */
    projectVec4: function (v) {
        var f = 1.0 / v[3];
        return [v[0] * f, v[1] * f, v[2] * f, 1.0];
    }
};
;XEO.webgl = {

    /** Maps XEO component parameter names to WebGL enum names
     */
    enums: {
        funcAdd: "FUNC_ADD",
        funcSubtract: "FUNC_SUBTRACT",
        funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
        zero: "ZERO",
        one: "ONE",
        srcColor: "SRC_COLOR",
        oneMinusSrcColor: "ONE_MINUS_SRC_COLOR",
        dstColor: "DST_COLOR",
        oneMinusDstColor: "ONE_MINUS_DST_COLOR",
        srcAlpha: "SRC_ALPHA",
        oneMinusSrcAlpha: "ONE_MINUS_SRC_ALPHA",
        dstAlpha: "DST_ALPHA",
        oneMinusDstAlpha: "ONE_MINUS_DST_ALPHA",
        contantColor: "CONSTANT_COLOR",
        oneMinusConstantColor: "ONE_MINUS_CONSTANT_COLOR",
        constantAlpha: "CONSTANT_ALPHA",
        oneMinusConstantAlpha: "ONE_MINUS_CONSTANT_ALPHA",
        srcAlphaSaturate: "SRC_ALPHA_SATURATE",
        front: "FRONT",
        back: "BACK",
        frontAndBack: "FRONT_AND_BACK",
        never: "NEVER",
        less: "LESS",
        equal: "EQUAL",
        lequal: "LEQUAL",
        greater: "GREATER",
        notequal: "NOTEQUAL",
        gequal: "GEQUAL",
        always: "ALWAYS",
        cw: "CW",
        ccw: "CCW",
        linear: "LINEAR",
        nearest: "NEAREST",
        linearMipMapNearest: "LINEAR_MIPMAP_NEAREST",
        nearestMipMapNearest: "NEAREST_MIPMAP_NEAREST",
        nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
        linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
        repeat: "REPEAT",
        clampToEdge: "CLAMP_TO_EDGE",
        mirroredRepeat: "MIRRORED_REPEAT",
        alpha: "ALPHA",
        rgb: "RGB",
        rgba: "RGBA",
        luminance: "LUMINANCE",
        luminanceAlpha: "LUMINANCE_ALPHA",
        textureBinding2D: "TEXTURE_BINDING_2D",
        textureBindingCubeMap: "TEXTURE_BINDING_CUBE_MAP",
        compareRToTexture: "COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
        unsignedByte: "UNSIGNED_BYTE"
    }
}
;/** Buffer for vertices and indices
 *
 * @param gl  WebGL gl
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */
XEO.webgl.ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {

    /**
     * True when this buffer is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;
    this.type = type;
    this.numItems = numItems;
    this.itemSize = itemSize;
    this.usage = usage;

    this._allocate(values, numItems);
};

/**
 * Allocates this buffer
 *
 * @param values
 * @param numItems
 * @private
 */
XEO.webgl.ArrayBuffer.prototype._allocate = function (values, numItems) {
    this.allocated = false;
    this.handle = this.gl.createBuffer();
    if (!this.handle) {
        throw "Failed to allocate WebGL ArrayBuffer";
    }
    if (this.handle) {
        this.gl.bindBuffer(this.type, this.handle);
        this.gl.bufferData(this.type, values, this.usage);
        this.gl.bindBuffer(this.type, null);
        this.numItems = numItems;
        this.length = values.length;
        this.allocated = true;
    }
};

/**
 * Updates values within this buffer, reallocating if needed
 *
 * @param data
 * @param offset
 */
XEO.webgl.ArrayBuffer.prototype.setData = function (data, offset) {
    if (!this.allocated) {
        return;
    }
    if (data.length > this.length) {
        // Needs reallocation
        this.destroy();
        this._allocate(data, data.length);
    } else {
        // No reallocation needed
        if (offset || offset === 0) {
            this.gl.bufferSubData(this.type, offset, data);
        } else {
            this.gl.bufferData(this.type, data);
        }
    }
};

/**
 * Unbinds this buffer on WebGL
 */
XEO.webgl.ArrayBuffer.prototype.unbind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, null);
};

/**
 * Destroys this buffer
 */
XEO.webgl.ArrayBuffer.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteBuffer(this.handle);
    this.handle = null;
    this.allocated = false;
};


XEO.webgl.ArrayBuffer.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, this.handle);
};


;
/** An attribute within a {@link XEO.webgl.Shader}
 */
XEO.webgl.Attribute = function (gl, program, name, type, size, location) {

    this.gl = gl;
    this.location = location;

    this.bindFloatArrayBuffer = function (buffer) {
        if (buffer) {
            buffer.bind();
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        }
    };
};

XEO.webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {
    this.gl.enableVertexAttribArray(this.location);
    this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);   // Vertices are not homogeneous - no w-element
};
;/**
 * @class Wrapper for a WebGL program
 *
 * @param gl WebGL gl
 * @param vertex Source code for vertex shader
 * @param fragment Source code for fragment shader
 */
XEO.webgl.Program = function (gl, vertex, fragment) {

    /**
     * True as soon as this program is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;

    this._uniforms = {};
    this._samplers = {};
    this._attributes = {};

    this.uniformValues = [];

    this.materialSettings = {
        specularColor: [0, 0, 0],

        specular: 0,
        shininess: 0,
        emit: 0,
        alpha: 0
    };

    this._vertexShader = new XEO.webgl.Shader(gl, gl.VERTEX_SHADER, vertex);

    this._fragmentShader = new XEO.webgl.Shader(gl, gl.FRAGMENT_SHADER, fragment);

    var a, i, u, u_name, location, shader;

    // Create program, attach shaders, link and validate program

    this.handle = gl.createProgram();

    if (this.handle) {

        if (this._vertexShader.valid) {
            gl.attachShader(this.handle, this._vertexShader.handle);
        }

        if (this._fragmentShader.valid) {
            gl.attachShader(this.handle, this._fragmentShader.handle);
        }

        gl.linkProgram(this.handle);

        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        var valueIndex = 0;
        for (i = 0; i < numUniforms; ++i) {
            u = gl.getActiveUniform(this.handle, i);
            if (u) {
                u_name = u.name;
                if (u_name[u_name.length - 1] == "\u0000") {
                    u_name = u_name.substr(0, u_name.length - 1);
                }
                location = gl.getUniformLocation(this.handle, u_name);
                if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {
                    this._samplers[u_name] = new XEO.webgl.Sampler(gl, this.handle, u_name, u.type, u.size, location);
                } else {
                    this._uniforms[u_name] = new XEO.webgl.Uniform(gl, this.handle, u_name, u.type, u.size, location, valueIndex);
                    this.uniformValues[valueIndex] = null;
                    ++valueIndex;
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this._attributes[a.name] = new XEO.webgl.Attribute(gl, this.handle, a.name, a.type, a.size, location);
            }
        }

        // Program allocated
        this.allocated = true;
    }
};

XEO.webgl.Program.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.useProgram(this.handle);
};

XEO.webgl.Program.prototype.getUniformLocation = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u.getLocation();
    }
};

XEO.webgl.Program.prototype.getUniform = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u;
    }
};

XEO.webgl.Program.prototype.getAttribute = function (name) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        return attr;
    }
};

XEO.webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        attr.bindFloatArrayBuffer(buffer);
    }
};

XEO.webgl.Program.prototype.bindTexture = function (name, texture, unit) {
    if (!this.allocated) {
        return false;
    }
    var sampler = this._samplers[name];
    if (sampler) {
        return sampler.bindTexture(texture, unit);
    } else {
        return false;
    }
};

XEO.webgl.Program.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteProgram(this.handle);
    this.gl.deleteShader(this._vertexShader.handle);
    this.gl.deleteShader(this._fragmentShader.handle);
    this.handle = null;
    this._attributes = null;
    this._uniforms = null;
    this._samplers = null;
    this.allocated = false;
};


XEO.webgl.Program.prototype.setUniform = function (name, value) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        if (this.uniformValues[u.index] !== value || !u.numberValue) {
            u.setValue(value);
            this.uniformValues[u.index] = value;
        }
    }
};
;
XEO.webgl.RenderBuffer = function (cfg) {

    /**
     * True as soon as this buffer is allocated and ready to go
     */
    this.allocated = false;

    /**
     * The canvas, to synch buffer size with when its dimensions change
     */
    this.canvas = cfg.canvas;

    /**
     * WebGL context
     */
    this.gl = cfg.canvas.gl;

    /**
     * Buffer resources, set up in #_touch
     */
    this.buf = null;

    /**
     * True while this buffer is bound
     * @type {boolean}
     */
    this.bound = false;
};

/**
 * Called after WebGL context is restored.
 */
XEO.webgl.RenderBuffer.prototype.webglRestored = function (_gl) {
    this.gl = _gl;
    this.buf = null;
    this.allocated = false;
    this.bound = false;
};

/**
 * Binds this buffer
 */
XEO.webgl.RenderBuffer.prototype.bind = function () {
    this._touch();
    if (this.bound) {
        return;
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.bound = true;
};

XEO.webgl.RenderBuffer.prototype._touch = function () {
    var width = this.canvas.canvas.width;
    var height = this.canvas.canvas.height;
    if (this.buf) { // Currently have a buffer
        if (this.buf.width == width && this.buf.height == height) { // Canvas size unchanged, buffer still good
            return;
        } else { // Buffer needs reallocation for new canvas size
            this.gl.deleteTexture(this.buf.texture);
            this.gl.deleteFramebuffer(this.buf.framebuf);
            this.gl.deleteRenderbuffer(this.buf.renderbuf);
        }
    }

    this.buf = {
        framebuf: this.gl.createFramebuffer(),
        renderbuf: this.gl.createRenderbuffer(),
        texture: this.gl.createTexture(),
        width: width,
        height: height
    };

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.buf.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    try {
        // Do it the way the spec requires
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    } catch (exception) {
        // Workaround for what appears to be a Minefield bug.
        var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureStorage);
    }

    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.buf.texture, 0);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    // Verify framebuffer is OK
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);

    if (!this.gl.isFramebuffer(this.buf.framebuf)) {
        throw XEO_error.fatalError(XEO.errors.INVALID_FRAMEBUFFER, "Invalid framebuffer");
    }

    var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

    switch (status) {

        case this.gl.FRAMEBUFFER_COMPLETE:
            break;

        case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");

        case this.gl.FRAMEBUFFER_UNSUPPORTED:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");

        default:
            throw XEO_error.fatalError(XEO.errors.ERROR, "Incomplete framebuffer: " + status);
    }

    this.bound = false;
};

/**
 * Clears this renderbuffer
 */
XEO.webgl.RenderBuffer.prototype.clear = function () {
    if (!this.bound) {
        throw "Render buffer not bound";
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.disable(this.gl.BLEND);
};

/**
 * Reads buffer pixel at given coordinates
 */
XEO.webgl.RenderBuffer.prototype.read = function (pickX, pickY) {
    var x = pickX;
    var y = this.canvas.canvas.height - pickY;
    var pix = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pix);
    return pix;
};

/**
 * Unbinds this renderbuffer
 */
XEO.webgl.RenderBuffer.prototype.unbind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.bound = false;
};

/** Returns the texture
 */
XEO.webgl.RenderBuffer.prototype.getTexture = function () {
    var self = this;
    return {
        bind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, self.buf.texture);
                return true;
            }
            return false;
        },
        unbind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, null);
            }
        }
    };
};

/** Destroys this buffer
 */
XEO.webgl.RenderBuffer.prototype.destroy = function () {
    if (this.buf) {
        this.gl.deleteTexture(this.buf.texture);
        this.gl.deleteFramebuffer(this.buf.framebuf);
        this.gl.deleteRenderbuffer(this.buf.renderbuf);
        this.buf = null;
        this.bound = false;
    }
};;
XEO.webgl.Sampler = function (gl, program, name, type, size, location) {

    this.bindTexture = function (texture, unit) {
        if (texture.bind(unit)) {
            gl.uniform1i(location, unit);
            return true;
        }
        return false;
    };
};
;
XEO.webgl.Texture2D = function (gl, cfg) {

    /**
     * True as soon as this texture is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.target = cfg.target || gl.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;
    this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
    this.texture = cfg.texture;
    this.format = gl.RGBA;
    this.isDepth = false;
    this.depthMode = 0;
    this.depthCompareMode = 0;
    this.depthCompareFunc = 0;

    try {
        gl.bindTexture(this.target, this.texture);

        if (cfg.minFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, cfg.minFilter);
        }

        if (cfg.magFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, cfg.magFilter);
        }

        if (cfg.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        if (cfg.minFilter == gl.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == gl.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == gl.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
            gl.generateMipmap(this.target);
        }

        gl.bindTexture(this.target, null);

        this.allocated = true;

    } catch (e) {
        throw XEO_error.fatalError(XEO.errors.OUT_OF_VRAM, "Failed to create texture: " + e.message || e);
    }

    this.bind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, this.texture);
            if (this.update) {
                this.update(gl);
            }
            return true;
        }
        return false;
    };

    this.unbind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, null);
        }
    };

    this.destroy = function () {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
    };
};

XEO.webgl.clampImageSize = function (image, numPixels) {
    var n = image.width * image.height;
    if (n > numPixels) {
        var ratio = numPixels / n;

        var width = image.width * ratio;
        var height = image.height * ratio;

        var canvas = document.createElement("canvas");

        canvas.width = XEO.webgl.nextHighestPowerOfTwo(width);
        canvas.height = XEO.webgl.nextHighestPowerOfTwo(height);

        var ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

        image = canvas;
    }
    return image;
};

XEO.webgl.ensureImageSizePowerOfTwo = function (image) {
    if (!XEO.webgl.isPowerOfTwo(image.width) || !XEO.webgl.isPowerOfTwo(image.height)) {
        var canvas = document.createElement("canvas");
        canvas.width = XEO.webgl.nextHighestPowerOfTwo(image.width);
        canvas.height = XEO.webgl.nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
};

XEO.webgl.isPowerOfTwo = function (x) {
    return (x & (x - 1)) == 0;
};

XEO.webgl.nextHighestPowerOfTwo = function (x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};

;
XEO.webgl.Uniform = function (gl, program, name, type, size, location, index, logging) {

    var func = null;

    this.numberValue = false;

    if (type == gl.BOOL) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1i(location, v);
        };
    } else if (type == gl.BOOL_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.BOOL_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.BOOL_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.INT) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1iv(location, v);
        };
    } else if (type == gl.INT_VEC2) {
        func = function (v) {
            gl.uniform2iv(location, v);
        };
    } else if (type == gl.INT_VEC3) {
        func = function (v) {
            gl.uniform3iv(location, v);
        };
    } else if (type == gl.INT_VEC4) {
        func = function (v) {
            gl.uniform4iv(location, v);
        };
    } else if (type == gl.FLOAT) {
        this.numberValue = true;
        func = function (v) {
            gl.uniform1f(location, v);
        };
    } else if (type == gl.FLOAT_VEC2) {
        func = function (v) {
            gl.uniform2fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC3) {
        func = function (v) {
            gl.uniform3fv(location, v);
        };
    } else if (type == gl.FLOAT_VEC4) {
        func = function (v) {
            gl.uniform4fv(location, v);
        };
    } else if (type == gl.FLOAT_MAT2) {
        func = function (v) {
            gl.uniformMatrix2fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT3) {
        func = function (v) {
            gl.uniformMatrix3fv(location, gl.FALSE, v);
        };
    } else if (type == gl.FLOAT_MAT4) {
        func = function (v) {
            gl.uniformMatrix4fv(location, gl.FALSE, v);
        };
    } else {
        throw "Unsupported shader uniform type: " + type;
    }

    this.setValue = func;


    this.getValue = function () {
        return gl.getUniform(program, location);
    };

    this.getLocation = function () {
        return location;
    };

    // This is just an integer key for caching the uniform's value, more efficient than caching by name.
    this.index = index;
};










;XEO.renderer = XEO.renderer || {};

/**
 * @class Display compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
 *
 * <p>A Display is a container of {@link XEO.renderer.GameObject}s which are created (or updated) by a depth-first
 * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
 *
 * <h2>Rendering Pipeline</h2>
 *
 * <p>Conceptually, a Display implements a pipeline with the following stages:</p>
 *
 * <ol>
 * <li>Create or update {@link XEO.renderer.GameObject}s during scene compilation</li>
 * <li>Organise the {@link XEO.renderer.GameObject} into an <b>object list</b></li>
 * <li>Determine the GL state sort order for the object list</li>
 * <li>State sort the object list</li>
 * <li>Create a <b>draw list</b> containing {@link XEO.Chunk}s belonging to the {@link XEO.renderer.GameObject}s in the object list</li>
 * <li>Render the draw list to draw the image</li>
 * </ol>
 *
 * <p>An update to the scene causes the pipeline to be re-executed from one of these stages, and SceneJS is designed
 * so that the pipeline is always re-executed from the latest stage possible to avoid redoing work.</p>
 *
 * <p>For example:</p>
 *
 * <ul>
 * <li>when an object is created or updated, we need to (re)do stages 2, 3, 4, 5 and 6</li>
 * <li>when an object is made invisible, we need to redo stages 5 and 6</li>
 * <li>when an object is assigned to a different scene render layer (works like a render bin), we need to redo
 *   stages 3, 4, 5, and 6</li>
 *<li>when the colour of an object changes, or maybe when the viewpoint changes, we simplt redo stage 6</li>
 * </ul>
 *
 * <h2>GameObject Creation</h2>
 * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
 * "compiling" the scene graph into the Display. As traversal visits each scene component, the component's state core is
 * set on the Display (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
 * cores that are active at that instant during compilation. Each of the scene's leaf components is always
 * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildGameObject} to create an
 * object in the soup. For each of the currently active cores, the object is given a {@link XEO.Chunk}
 * containing the WebGL calls for rendering it.</p>
 *
 * <p>The object also gets a shader (implemented by {@link XEO.renderer.Program}), taylored to render those state cores.</p>
 *
 * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
 * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildGameObject}
 * may update the {@link XEO.Chunk}s on the object as required for any changes in the core soup since the
 * last time the object was built. If differences among the cores require it, then {@link #buildGameObject} may also replace
 * the object's {@link XEO.renderer.Program} in order to render the new core soup configuration.</p>
 *
 * <p>So in summary, to each {@link XEO.renderer.GameObject} it builds, {@link #buildGameObject} creates a list of
 * {@link XEO.Chunk}s to render the set of component state cores that are currently set on the {@link XEO.Renderer}.
 * When {@link #buildGameObject} is re-building an existing object, it may replace one or more {@link XEO.Chunk}s
 * for state cores that have changed from the last time the object was built or re-built.</p>

 * <h2>GameObject Destruction</h2>
 * <p>Destruction of a scene graph branch simply involves a call to {@link #removeGameObject} for each {@link SceneJS.Geometry}
 * in the branch.</p>
 *
 * <h2>Draw List</h2>
 * <p>The draw list is actually comprised of two lists of state chunks: a "pick" list to render a pick buffer
 * for colour-indexed GPU picking, along with a "draw" list for normal image rendering. The chunks in these lists
 * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.</p>
 *
 * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
 * then lazy-redone on the next call to #render or #pick.</p>
 */
XEO.renderer.Renderer = function (cfg) {

    // Display is bound to the lifetime of an HTML5 canvas
    this._canvas = cfg.canvas;

    // Factory which creates and recycles {@link XEO.renderer.Program} instances
    this._programFactory = new XEO.renderer.ProgramFactory({
        canvas: cfg.canvas
    });

    // Factory which creates and recycles {@link SceneJS.Chunk} instances
    this._chunkFactory = new XEO.ChunkFactory();

    /**
     * True when the background is to be transparent
     * @type {boolean}
     */
    this.transparent = cfg.transparent === true;

    /**
     * Component state core for the last {@link SceneJS.Enable} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.enable = null;

    /**
     * Component state core for the last {@link SceneJS.Flags} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.flags = null;

    /**
     * Component state core for the last {@link SceneJS.Layer} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.layer = null;

    /**
     * Component state core for the last {@link SceneJS.Stage} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.stage = null;

    /**
     * Component state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.renderer = null;

    /**
     * Component state core for the last {@link SceneJS.DepthBuf} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.depthBuf = null;

    /**
     * Component state core for the last {@link SceneJS.ColorBuf} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.colorBuf = null;

    /**
     * Component state core for the last {@link SceneJS.View} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.view = null;

    /**
     * Component state core for the last {@link SceneJS.Lights} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.lights = null;

    /**
     * Component state core for the last {@link SceneJS.Material} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.material = null;

    /**
     * Component state core for the last {@link SceneJS.Texture} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.texture = null;

    /**
     * Component state core for the last {@link SceneJS.Reflect} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.cubemap = null;

    /**
     * Component state core for the last {@link SceneJS.XForm} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.modelTransform = null;

    /**
     * Component state core for the last {@link SceneJS.LookAt} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.viewTransform = null;

    /**
     * Component state core for the last {@link SceneJS.Camera} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.projTransform = null;

    /**
     * Component state core for the last {@link SceneJS.ColorTarget} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.renderTarget = null;

    /**
     * Component state core for the last {@link SceneJS.Clips} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.clips = null;

    /**
     * Component state core for the last {@link SceneJS.MorphTargets} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.MorphTargets = null;

    /**
     * Component state core for the last {@link SceneJS.Name} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.name = null;

    /**
     * Component state core for the last {@link SceneJS.Tag} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.tag = null;

    /**
     * Component state core for the last {@link SceneJS.Shader} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.shader = null;

    /**
     * Component state core for the last {@link SceneJS.Uniforms} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.uniforms = null;

    /**
     * Component state core for the last {@link SceneJS.Style} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.style = null;

    /**
     * Component state core for the last {@link SceneJS.Geometry} visited during scene graph compilation traversal
     * @type GameObject
     */
    this.geometry = null;

    /* Factory which creates and recycles {@link XEO.renderer.GameObject} instances
     */
    this._objectFactory = new XEO.renderer.GameObjectFactory();

    /**
     * The objects in the display
     */
    this._objects = {};

    /**
     * Ambient color, which must be given to gl.clearColor before draw list iteration
     */
    this._ambientColor = [0, 0, 0, 1.0];

    /**
     * The object list, containing all elements of #_objects, kept in GL state-sorted order
     */
    this._objectList = [];
    this._objectListLen = 0;

    /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
     * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
     * "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
     * their objects in #_objectList, with runs of duplicate states removed.
     */
    this._drawList = [];                // State chunk list to render all objects
    this._drawListLen = 0;

    this._pickDrawList = [];            // State chunk list to render scene to pick buffer
    this._pickDrawListLen = 0;

    this._targetList = [];
    this._targetListLen = 0;

    /* The frame context holds state shared across a single render of the draw list, along with any results of
     * the render, such as pick hits
     */
    this._frameCtx = {
        pickNames: [], // Pick names of objects hit during pick render
        canvas: this._canvas,           // The canvas
        VAO: null                       // Vertex array object extension
    };

    /*-------------------------------------------------------------------------------------
     * Flags which schedule what the display is to do when #render is next called.
     *------------------------------------------------------------------------------------*/

    /**
     * Flags the object list as needing to be rebuilt from existing objects on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #2 (see class comment),
     * causing object list rebuild, state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.objectListDirty = true;

    /**
     * Flags the object list as needing state orders to be computed on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #3 (see class comment),
     * causing state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateOrderDirty = true;

    /**
     * Flags the object list as needing to be state sorted on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #4 (see class comment),
     * causing state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateSortDirty = true;

    /**
     * Flags the draw list as needing to be rebuilt from the object list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #5 (see class comment),
     * causing draw list construction and image render.
     * @type Boolean
     */
    this.drawListDirty = true;

    /**
     * Flags the image as needing to be redrawn from the draw list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #6 (see class comment),
     * causing the image render.
     * @type Boolean
     */
    this.imageDirty = true;

    /**
     * Flags the neccessity for the image buffer to be re-rendered from the draw list.
     * @type Boolean
     */
    this.pickBufDirty = true;           // Redraw pick buffer
    this.rayPickBufDirty = true;        // Redraw raypick buffer
};

/**
 * Reallocates WebGL resources for objects within this display
 */
XEO.Renderer.prototype.webglRestored = function () {
    this._programFactory.webglRestored();// Reallocate programs
    this._chunkFactory.webglRestored(); // Recache shader var locations
    var gl = this._canvas.gl;
    if (this.pickBuf) {
        this.pickBuf.webglRestored(gl);          // Rebuild pick buffers
    }
    if (this.rayPickBuf) {
        this.rayPickBuf.webglRestored(gl);
    }
    this.imageDirty = true;             // Need redraw
};

/**
 * Internally creates (or updates) a {@link XEO.renderer.GameObject} of the given ID from whatever component state cores are currently set
 * on this {@link XEO.Renderer}. The object is created if it does not already exist in the display, otherwise it is
 * updated with the current state cores, possibly replacing cores already referenced by the object.
 *
 * @param {String} objectId ID of object to create or update
 */
XEO.Renderer.prototype.buildGameObject = function (objectId) {

    var object = this._objects[objectId];

    if (!object) { // Create object
        object = this._objects[objectId] = this._objectFactory.getGameObject(objectId);
        this.objectListDirty = true;
    }

    object.stage = this.stage;
    object.layer = this.layer;
    object.renderTarget = this.renderTarget;
    object.texture = this.texture;
    object.cubemap = this.cubemap;
    object.geometry = this.geometry;
    object.enable = this.enable;
    object.flags = this.flags;
    object.tag = this.tag;

    //if (!object.hash) {

    var hash = ([                   // Build current state hash
        this.geometry.hash,
        this.shader.hash,
        this.clips.hash,
        this.MorphTargets.hash,
        this.texture.hash,
        this.cubemap.hash,
        this.lights.hash
    ]).join(";");

    if (!object.program || hash != object.hash) {
        // Get new program for object if no program or hash mismatch
        if (object.program) {
            this._programFactory.putProgram(object.program);
        }
        object.program = this._programFactory.getProgram(hash, this);
        object.hash = hash;
    }
    //}

    // Build draw chunks for object

    this._setChunk(object, 0, "program");          // Must be first
    this._setChunk(object, 1, "xform", this.modelTransform);
    this._setChunk(object, 2, "lookAt", this.viewTransform);
    this._setChunk(object, 3, "camera", this.projTransform);
    this._setChunk(object, 4, "flags", this.flags);
    this._setChunk(object, 5, "shader", this.shader);
    this._setChunk(object, 6, "uniforms", this.uniforms);
    this._setChunk(object, 7, "style", this.style);
    this._setChunk(object, 8, "depthBuf", this.depthBuf);
    this._setChunk(object, 9, "colorBuf", this.colorBuf);
    this._setChunk(object, 10, "view", this.view);
    this._setChunk(object, 11, "name", this.name);
    this._setChunk(object, 12, "lights", this.lights);
    this._setChunk(object, 13, "material", this.material);
    this._setChunk(object, 14, "texture", this.texture);
    this._setChunk(object, 15, "cubemap", this.cubemap);
    this._setChunk(object, 16, "clips", this.clips);
    this._setChunk(object, 17, "renderer", this.renderer);
    this._setChunk(object, 18, "geometry", this.MorphTargets, this.geometry);
    this._setChunk(object, 19, "draw", this.geometry); // Must be last
};

XEO.Renderer.prototype._setChunk = function (object, order, chunkType, core, core2) {

    var chunkId;
    var chunkClass = this._chunkFactory.chunkTypes[chunkType];

    if (core) {

        // Core supplied
        if (core.empty) { // Only set default cores for state types that have them
            var oldChunk = object.chunks[order];
            if (oldChunk) {
                this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
            }
            object.chunks[order] = null;
            return;
        }

        // Note that core.stateId can be either a number or a string, that's why we make
        // chunkId a string here.
        // TODO: Would it be better if all were numbers?
        chunkId = chunkClass.prototype.programGlobal
            ? '_' + core.stateId
            : 'p' + object.program.id + '_' + core.stateId;

        if (core2) {
            chunkId += '__' + core2.stateId;
        }

    } else {

        // No core supplied, probably a program.
        // Only one chunk of this type per program.
        chunkId = 'p' + object.program.id;
    }

    // This is needed so that chunkFactory can distinguish between draw and geometry
    // chunks with the same core.
    chunkId = order + '__' + chunkId;

    var oldChunk = object.chunks[order];

    if (oldChunk) {
        if (oldChunk.id == chunkId) { // Avoid needless chunk reattachment
            return;
        }
        this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
    }

    object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, core, core2); // Attach new chunk

    // Ambient light is global across everything in display, and
    // can never be disabled, so grab it now because we want to
    // feed it to gl.clearColor before each display list render
    if (chunkType == "lights") {
        this._setAmbient(core);
    }
};

XEO.Renderer.prototype._setAmbient = function (core) {
    var lights = core.lights;
    var light;
    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        if (light.mode == "ambient") {
            this._ambientColor[0] = light.color[0];
            this._ambientColor[1] = light.color[1];
            this._ambientColor[2] = light.color[2];
        }
    }
};

/**
 * Removes an object from this display
 *
 * @param {String} objectId ID of object to remove
 */
XEO.Renderer.prototype.removeGameObject = function (objectId) {
    var object = this._objects[objectId];
    if (!object) {
        return;
    }
    this._programFactory.putProgram(object.program);
    object.program = null;
    object.hash = null;
    this._objectFactory.putGameObject(object);
    delete this._objects[objectId];
    this.objectListDirty = true;
};

/**
 * Set a tag selector to selectively activate objects that have matching SceneJS.Tag components
 */
XEO.Renderer.prototype.selectTags = function (tagSelector) {
    this._tagSelector = tagSelector;
    this.drawListDirty = true;
};

/**
 * Render this display. What actually happens in the method depends on what flags are set.
 *
 */
XEO.Renderer.prototype.render = function (params) {

    params = params || {};

    if (this.objectListDirty) {
        this._buildGameObjectList();          // Build object render bin
        this.objectListDirty = false;
        this.stateOrderDirty = true;        // Now needs state ordering
    }

    if (this.stateOrderDirty) {
        this._makeStateSortKeys();       // Compute state sort order
        this.stateOrderDirty = false;
        this.stateSortDirty = true;     // Now needs state sorting
    }

    if (this.stateSortDirty) {
        this._stateSort();              // State sort the object render bin
        this.stateSortDirty = false;
        this.drawListDirty = true;      // Now needs new visible object bin
        //this._logGameObjectList();
    }

    if (this.drawListDirty) {           // Render visible list while building transparent list
        this._buildDrawList();
        this.imageDirty = true;
        //this._logDrawList();
        //this._logPickList();
    }

    if (this.imageDirty || params.force) {
        this._doDrawList({ // Render, no pick
            clear: (params.clear !== false) // Clear buffers by default
        });
        this.imageDirty = false;
        this.pickBufDirty = true;       // Pick buff will now need rendering on next pick
    }
};

XEO.Renderer.prototype._buildGameObjectList = function () {
    this._objectListLen = 0;
    for (var objectId in this._objects) {
        if (this._objects.hasOwnProperty(objectId)) {
            this._objectList[this._objectListLen++] = this._objects[objectId];
        }
    }
};

XEO.Renderer.prototype._makeStateSortKeys = function () {
    //  console.log("--------------------------------------------------------------------------------------------------");
    // console.log("XEO.Renderer_makeSortKeys");
    var object;
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        object = this._objectList[i];
        if (!object.program) {
            // Non-visual object (eg. sound)
            object.sortKey = -1;
        } else {
            object.sortKey =
                ((object.stage.priority + 1) * 1000000000000)
                + ((object.flags.transparent ? 2 : 1) * 1000000000)
                + ((object.layer.priority + 1) * 1000000)
                + ((object.program.id + 1) * 1000)
                + object.texture.stateId;
        }
    }
    //  console.log("--------------------------------------------------------------------------------------------------");
};

XEO.Renderer.prototype._stateSort = function () {
    this._objectList.length = this._objectListLen;
    this._objectList.sort(this._stateSortGameObjects);
};

XEO.Renderer.prototype._stateSortGameObjects = function (a, b) {
    return a.sortKey - b.sortKey;
};

XEO.Renderer.prototype._logGameObjectList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._objectListLen + " objects");
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        var object = this._objectList[i];
        console.log("XEO.Renderer : object[" + i + "] sortKey = " + object.sortKey);
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

XEO.Renderer.prototype._buildDrawList = function () {

    this._lastStateId = this._lastStateId || [];
    this._lastPickStateId = this._lastPickStateId || [];

    for (var i = 0; i < 23; i++) {
        this._lastStateId[i] = null;
        this._lastPickStateId[i] = null;
    }

    this._drawListLen = 0;
    this._pickDrawListLen = 0;

    // For each render target, a list of objects to render to that target
    var targetGameObjectLists = {};

    // A list of all the render target object lists
    var targetListList = [];

    // List of all targets
    var targetList = [];

    var object;
    var tagMask;
    var tagRegex;
    var tagCore;
    var flags;

    if (this._tagSelector) {
        tagMask = this._tagSelector.mask;
        tagRegex = this._tagSelector.regex;
    }

    this._objectDrawList = this._objectDrawList || [];
    this._objectDrawListLen = 0;

    for (var i = 0, len = this._objectListLen; i < len; i++) {

        object = this._objectList[i];

        // Cull invisible objects
        if (object.enable.enabled === false) {
            continue;
        }

        flags = object.flags;

        // Cull invisible objects
        if (flags.enabled === false) {
            continue;
        }

        // Cull objects in disabled layers
        if (!object.layer.enabled) {
            continue;
        }

        // Cull objects with unmatched tags
        if (tagMask) {
            tagCore = object.tag;
            if (tagCore.tag) {
                if (tagCore.mask != tagMask) { // Scene tag mask was updated since last render
                    tagCore.mask = tagMask;
                    tagCore.matches = tagRegex.test(tagCore.tag);
                }
                if (!tagCore.matches) {
                    continue;
                }
            }
        }

        // Put objects with render targets into a bin for each target
        if (object.renderTarget.targets) {
            var targets = object.renderTarget.targets;
            var target;
            var coreId;
            var list;
            for (var j = 0, lenj = targets.length; j < lenj; j++) {
                target = targets[j];
                coreId = target.coreId;
                list = targetGameObjectLists[coreId];
                if (!list) {
                    list = [];
                    targetGameObjectLists[coreId] = list;
                    targetListList.push(list);
                    targetList.push(this._chunkFactory.getChunk(target.stateId, "renderTarget", object.program, target));
                }
                list.push(object);
            }
        } else {

            //
            this._objectDrawList[this._objectDrawListLen++] = object;
        }
    }

    // Append chunks for objects within render targets first

    var list;
    var target;
    var object;
    var pickable;

    for (var i = 0, len = targetListList.length; i < len; i++) {

        list = targetListList[i];
        target = targetList[i];

        this._appendRenderTargetChunk(target);

        for (var j = 0, lenj = list.length; j < lenj; j++) {
            object = list[j];
            pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages
            this._appendGameObjectToDrawLists(object, pickable);
        }
    }

    if (object) {

        // Unbinds any render target bound previously
        this._appendRenderTargetChunk(this._chunkFactory.getChunk(-1, "renderTarget", object.program, {}));
    }

    // Append chunks for objects not in render targets
    for (var i = 0, len = this._objectDrawListLen; i < len; i++) {
        object = this._objectDrawList[i];
        pickable = !object.stage || (object.stage && object.stage.pickable); // We'll only pick objects in pickable stages
        this._appendGameObjectToDrawLists(object, pickable);
    }

    this.drawListDirty = false;
};


XEO.Renderer.prototype._appendRenderTargetChunk = function (chunk) {
    this._drawList[this._drawListLen++] = chunk;
};

/**
 * Appends an object to the draw and pick lists.
 * @param object
 * @param pickable
 * @private
 */
XEO.Renderer.prototype._appendGameObjectToDrawLists = function (object, pickable) {
    var chunks = object.chunks;
    var picking = object.flags.picking;
    var chunk;
    for (var i = 0, len = chunks.length; i < len; i++) {
        chunk = chunks[i];
        if (chunk) {

            // As we apply the state chunk lists we track the ID of most types of chunk in order
            // to cull redundant re-applications of runs of the same chunk - except for those chunks with a
            // 'unique' flag, because we don't want to cull runs of draw chunks because they contain the GL
            // drawElements calls which render the objects.

            if (chunk.draw) {
                if (chunk.unique || this._lastStateId[i] != chunk.id) { // Don't reapply repeated states
                    this._drawList[this._drawListLen++] = chunk;
                    this._lastStateId[i] = chunk.id;
                }
            }

            if (chunk.pick) {
                if (pickable !== false) {   // Don't pick objects in unpickable stages
                    if (picking) {          // Don't pick unpickable objects
                        if (chunk.unique || this._lastPickStateId[i] != chunk.id) { // Don't reapply repeated states
                            this._pickDrawList[this._pickDrawListLen++] = chunk;
                            this._lastPickStateId[i] = chunk.id;
                        }
                    }
                }
            }
        }
    }
};

/**
 * Logs the contents of the draw list to the console.
 * @private
 */
XEO.Renderer.prototype._logDrawList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._drawListLen + " draw list chunks");
    for (var i = 0, len = this._drawListLen; i < len; i++) {
        var chunk = this._drawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Logs the contents of the pick list to the console.
 * @private
 */
XEO.Renderer.prototype._logPickList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._pickDrawListLen + " pick list chunks");
    for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
        var chunk = this._pickDrawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Performs a pick on the display graph and returns info on the result.
 * @param {*} params
 * @returns {*}
 */
XEO.Renderer.prototype.pick = function (params) {

    var canvas = this._canvas.canvas;
    var hit = null;
    var canvasX = params.canvasX;
    var canvasY = params.canvasY;
    var pickBuf = this.pickBuf;

    // Lazy-create pick buffer
    if (!pickBuf) {
        pickBuf = this.pickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
        this.pickBufDirty = true;
    }

    this.render(); // Do any pending visible render

    // Colour-index pick to find the picked object

    pickBuf.bind();

    // Re-render the pick buffer if the display has updated
    if (this.pickBufDirty) {
        pickBuf.clear();
        this._doDrawList({
            pick: true,
            clear: true
        });
        this._canvas.gl.finish();
        this.pickBufDirty = false;                                                  // Pick buffer up to date
        this.rayPickBufDirty = true;                                                // Ray pick buffer now dirty
    }

    // Read pixel color in pick buffer at given coordinates,
    // convert to an index into the pick name list

    var pix = pickBuf.read(canvasX, canvasY);                                       // Read pick buffer
    var pickedGameObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
    var pickIndex = (pickedGameObjectIndex >= 1) ? pickedGameObjectIndex - 1 : -1;
    pickBuf.unbind();                                                               // Unbind pick buffer

    // Look up pick name from index
    var pickName = this._frameCtx.pickNames[pickIndex];                                   // Map pixel to name

    if (pickName) {

        hit = {
            name: pickName.name,
            path: pickName.path,
            componentId: pickName.componentId,
            canvasPos: [canvasX, canvasY]
        };

        // Now do a ray-pick if requested

        if (params.rayPick) {

            // Lazy-create ray pick depth buffer
            var rayPickBuf = this.rayPickBuf;
            if (!rayPickBuf) {
                rayPickBuf = this.rayPickBuf = new XEO.webgl.RenderBuffer({ canvas: this._canvas });
                this.rayPickBufDirty = true;
            }

            // Render depth values to ray-pick depth buffer

            rayPickBuf.bind();

            if (this.rayPickBufDirty) {
                rayPickBuf.clear();
                this._doDrawList({
                    pick: true,
                    rayPick: true,
                    clear: true
                });
                this.rayPickBufDirty = false;
            }

            // Read pixel from depth buffer, convert to normalised device Z coordinate,
            // which will be in range of [0..1] with z=0 at front
            pix = rayPickBuf.read(canvasX, canvasY);

            rayPickBuf.unbind();

            var screenZ = this._unpackDepth(pix);
            var w = canvas.width;
            var h = canvas.height;
            // Calculate clip space coordinates, which will be in range
            // of x=[-1..1] and y=[-1..1], with y=(+1) at top
            var x = (canvasX - w / 2) / (w / 2);           // Calculate clip space coordinates
            var y = -(canvasY - h / 2) / (h / 2);
            var projMat = this._frameCtx.cameraMat;
            var viewMat = this._frameCtx.viewMat;
            var pvMat = SceneJS_math_mulMat4(projMat, viewMat, []);
            var pvMatInverse = SceneJS_math_inverseMat4(pvMat, []);
            var world1 = SceneJS_math_transformVec4(pvMatInverse, [x, y, -1, 1]);
            world1 = SceneJS_math_mulVec4Scalar(world1, 1 / world1[3]);
            var world2 = SceneJS_math_transformVec4(pvMatInverse, [x, y, 1, 1]);
            world2 = SceneJS_math_mulVec4Scalar(world2, 1 / world2[3]);
            var dir = SceneJS_math_subVec3(world2, world1, []);
            var vWorld = SceneJS_math_addVec3(world1, SceneJS_math_mulVec4Scalar(dir, screenZ, []), []);

            // Got World-space intersect with surface of picked geometry
            hit.worldPos = vWorld;
        }
    }

    return hit;
};

/**
 * Unpacks a color-encoded depth
 * @param {Array(Number)} depthZ Depth encoded as an RGBA color value
 * @returns {Number}
 * @private
 */
XEO.Renderer.prototype._unpackDepth = function (depthZ) {
    var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
    var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
    return SceneJS_math_dotVector4(vec, bitShift);
};

/** Renders either the draw or pick list.
 *
 * @param {*} params
 * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
 * @param {Boolean} params.pick Set true to render for picking
 * @param {Boolean} params.rayPick Set true to render for ray-picking
 * @private
 */
XEO.Renderer.prototype._doDrawList = function (params) {

    var gl = this._canvas.gl;

    // Reset frame context
    var frameCtx = this._frameCtx;
    frameCtx.renderTarget = null;
    frameCtx.targetIndex = 0;
    frameCtx.renderBuf = null;
    frameCtx.viewMat = null;
    frameCtx.modelMat = null;
    frameCtx.cameraMat = null;
    frameCtx.renderer = null;
    frameCtx.depthbufEnabled = null;
    frameCtx.clearDepth = null;
    frameCtx.depthFunc = gl.LESS;
    frameCtx.scissorTestEnabled = false;
    frameCtx.blendEnabled = false;
    frameCtx.backfaces = true;
    frameCtx.frontface = "ccw";
    frameCtx.pick = !!params.pick;
    frameCtx.rayPick = !!params.rayPick;
    frameCtx.pickIndex = 0;
    frameCtx.textureUnit = 0;
    frameCtx.lineWidth = 1;
    frameCtx.transparent = false;
    frameCtx.ambientColor = this._ambientColor;
    frameCtx.aspect = this._canvas.canvas.width / this._canvas.canvas.height;

    // The extension needs to be re-queried in case the context was lost and has been recreated.
    var VAO = gl.getExtension("OES_vertex_array_object");
    frameCtx.VAO = (VAO) ? VAO : null;
    frameCtx.VAO = null;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    if (this.transparent) {
        gl.clearColor(0, 0, 0, 0);
    } else {
        gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
    }

    if (params.clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    gl.frontFace(gl.CCW);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    if (params.pick) {
        // Render for pick
        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
            this._pickDrawList[i].pick(frameCtx);
        }
    } else {
        // Render for draw
        for (var i = 0, len = this._drawListLen; i < len; i++) {      // Push opaque rendering chunks
            this._drawList[i].draw(frameCtx);
        }
    }

    gl.flush();

    if (frameCtx.renderBuf) {
        frameCtx.renderBuf.unbind();
    }

    if (frameCtx.VAO) {
        frameCtx.VAO.bindVertexArrayOES(null);
        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
};

XEO.Renderer.prototype.destroy = function () {
    this._programFactory.destroy();
};
