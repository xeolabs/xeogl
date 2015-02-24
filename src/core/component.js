"use strict";

/**
 Base class for all XEO components.

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

 XEO Engine generates the IDs automatically by default, however you can also specify them yourself:

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

 Almost every property on a XEO Component fires a change event when you update it.

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
})();