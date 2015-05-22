/**

 **Component** is the base class for all xeoEngine components.

 ## Contents

 <Ul>
    <li><a href="#ids">Component IDs</a></li>
    <li><a href="#componentProps">Properties</a></li>
    <li><a href="#metadata">Metadata</a></li>
    <li><a href="#logging">Logging</a></li>
    <li><a href="#destruction">Destruction</a></li>
 </ul>

 ## <a name="ids">Component IDs</a>

 Every Component has an ID that's unique within the parent {{#crossLink "Scene"}}{{/crossLink}}. xeoEngine generates
 the IDs automatically by default, however you can also specify them yourself. In the example below, we're creating a
 scene comprised of {{#crossLink "Scene"}}{{/crossLink}}, {{#crossLink "Material"}}{{/crossLink}}, {{#crossLink "Geometry"}}{{/crossLink}} and
 {{#crossLink "GameObject"}}{{/crossLink}} components, while letting xeoEngine generate its own ID for
 the {{#crossLink "Geometry"}}{{/crossLink}}:

 ````javascript
// The Scene is a Component too
var scene = new XEO.Scene({
    id: "myScene"
});

var material = new XEO.Material(scene, {
    id: "myMaterial"
});

var geometry = new XEO.Geometry(scene, {
    id: "myGeometry"
});

// Let xeoEngine automatically generated the ID for our Object
var object = new XEO.GameObject(scene, {
    material: material,
    geometry: geometry
});
 ````

We can then find those components like this:

 ````javascript
// Find the Scene
var theScene = XEO.scenes["myScene"];

// Find the Material
var theMaterial = theScene.components["myMaterial"];
 ````

## <a name="componentProps">Properties</a>

Almost every property on a xeoEngine Component fires a change event when you update it. For example, we can subscribe
 to the {{#crossLink "Material/diffuse:event"}}{{/crossLink}} event that a
{{#crossLink "Material"}}{{/crossLink}} fires when its {{#crossLink "Material/diffuse:property"}}{{/crossLink}}
property is updated, like so:

 ````javascript
// Bind a change callback to a property
var handle = material.on("diffuse", function(diffuse) {
    console.log("Material diffuse color has changed to: [" + diffuse[0] + ", " + diffuse[1] + "," + diffuse[2] + "]");
});

// Change the property value, which fires the callback
material.diffuse = [ 0.0, 0.5, 0.5 ];

// Unsubscribe from the property change event
material.off(handle);
 ````

 We can also subscribe to changes in the way components are attached to each other, since components are properties
 of other components. For example, we can subscribe to the '{{#crossLink "Object/material:event"}}{{/crossLink}}' event that a
 {{#crossLink "GameObject"}}GameObject{{/crossLink}} fires when its {{#crossLink "Object/material:property"}}{{/crossLink}}
 property is set to a different {{#crossLink "Material"}}Material{{/crossLink}}:

 ```` javascript
// Bind a change callback to the Object's Material
object1.on("material", function(material) {
    console.log("Object's Material has changed to: " + material.id);
});

// Now replace that Material with another
object1.material = new XEO.Material({
    id: "myOtherMaterial",
    diffuse: [ 0.3, 0.3, 0.6 ]
    //..
});
````

## <a name="metadata">Metadata</a>

 You can set optional **metadata** on your Components, which can be anything you like. These are intended
 to help manage your components within your application code or content pipeline. You could use metadata to attach
 authoring or version information, like this:

 ````javascript
// Scene with authoring metadata
var scene = new XEO.Scene({
    id: "myScene",
    metadata: {
        title: "My awesome 3D scene",
        author: "@xeolabs",
        date: "February 13 2015"
    }
});

// Material with descriptive metadata
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

````javascript
// Subscribe to changes to the Material's metadata
 material.on("metadata", function(value) {
    console.log("Metadata changed: " + JSON.stringify(value));
});

// Change the Material's metadata, firing our change handler
material.metadata = {
    description: "Bright red color with no textures",
    version: "0.2",
    foo: "baz"
};
 ````

## <a name="logging">Logging</a>

Components have methods to log ID-prefixed messages to the JavaScript console:

````javascript
material.log("Everything is fine, situation normal.");
material.warn("Wait, whats that red light?");
material.error("Aw, snap!");
````

The logged messages will look like this in the console:

````text
[LOG]   myMaterial: Everything is fine, situation normal.
[WARN]  myMaterial: Wait, whats that red light..
[ERROR] myMaterial: Aw, snap!
````

## <a name="destruction">Destruction</a>

Get notification of destruction directly on the Components:

````javascript
material.on("destroyed", function() {
    this.log("Component was destroyed: " + this.id);
});
````

Or get notification of destruction of any Component within its {{#crossLink "Scene"}}{{/crossLink}}, indiscriminately:

 ````javascript
scene.on("componentDestroyed", function(component) {
    this.log("Component was destroyed: " + component.id);
});
 ````

Then destroy a component like this:

````javascript
material.destroy();
````

Other Components that are linked to it will fall back on a default of some sort. For example, any
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} that were linked to our {{#crossLink "Material"}}{{/crossLink}}
 will then automatically link to the {{#crossLink "Scene"}}Scene's{{/crossLink}} default {{#crossLink "Scene/material:property"}}{{/crossLink}}.

 @class Component
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Component
 within the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Component.
 @extends Object
 */
(function () {

    "use strict";

    XEO.Component = Class.extend({

        __init: function () {


            var cfg = {};

            var arg1 = arguments[0];
            var arg2 = arguments[1];


            /**
             The parent {{#crossLink "Scene"}}{{/crossLink}} that contains this Component.

             @property scene
             @type {Scene}
             @final
             */
            this.scene = null;


            if (this.className === "XEO.Scene") {

                this.scene = this;

                if (arg1) {
                    cfg = arg1;
                }

            } else {

                if (arg1) {

                    if (arg1.className === "XEO.Scene") {

                        this.scene = arg1;

                        if (arg2) {
                            cfg = arg2;
                        }

                    } else {

                        this.scene = XEO.scene;

                        cfg = arg1;
                    }
                }

                this._renderer = this.scene._renderer;
            }

            /**
             Arbitrary, user-defined metadata on this component.

             @property metadata
             @type Object
             */
            this.metadata = cfg.metadata || {};

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
            this._eventSubs = {}; // A [handle -> callback] map for each location name
            this._handleLocs = {}; // Maps handles to loc names
            this.props = {}; // Maps locations to publications

            // Initialize
            if (this._init) {
                this._init(cfg);
            }

            if (this.scene) {
                // Register this component on its scene
                // Assigns this component an automatic ID if not yet assigned
                this.scene._addComponent(this);
            }
        },


        /**
         Type code for this Component.

         @property type
         @type String
         @final
         @public
         */
        type: "component",

        /**
         JavaScript class name for this Component.

         This is used when <a href="Scene.html#savingAndLoading">loading Scenes from JSON</a>, and is included in the JSON
         representation of this Component, so that this class may be instantiated when loading it from the JSON representation.

         For example: "XEO.AmbientLight", "XEO.ColorTarget", "XEO.Lights" etc.

         @property className
         @type String
         @final
         */
        className: "XEO.Component",

        /**
         * Initializes this component
         * @param cfg
         * @private
         */
        _init: function (cfg) {
        },

        /**
         * Fires an event on this component.
         *
         * Notifies existing subscribers to the event, retains the event to give to
         * any subsequent notifications on that location as they are made.
         *
         * @method fire
         * @param {String} event The event type name
         * @param {Object} value The event
         * @param {Boolean} [forget=false] When true, does not retain for subsequent subscribers
         */
        fire: function (event, value, forget) {
            if (forget !== true) {
                this.props[event] = value; // Save notification
            }
            var subs = this._eventSubs[event];
            var sub;
            if (subs) { // Notify subscriptions
                for (var handle in subs) {
                    if (subs.hasOwnProperty(handle)) {
                        sub = subs[handle];
                        sub.callback.call(sub.scope, value);
                    }
                }
            }
        },

        /**
         * Subscribes to an event on this component.
         *
         * The callback is be called with this component as scope.
         *
         * @method on
         * @param {String} event The event
         * @param {Function} callback Called fired on the event 
         * @param {Object} [scope=this] Scope for the callback
         * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
         */
        on: function (event, callback, scope) {
            var subs = this._eventSubs[event];
            if (!subs) {
                subs = {};
                this._eventSubs[event] = subs;
            }
            var handle = this._handleMap.addItem(); // Create unique handle
            subs[handle] = {
                scope: scope || this,
                callback: callback
            };
            this._handleLocs[handle] = event;
            var value = this.props[event];
            if (value) { // A publication exists, notify callback immediately
                callback.call(scope || this, value);
            }
            return handle;
        },

        /**
         * Cancels an event subscription that was previously made with {{#crossLink "Component/on:method"}}{{/crossLink}} or
         * {{#crossLink "Component/once:method"}}{{/crossLink}}.
         *
         * @method off
         * @param {String} handle Publication handle
         */
        off: function (handle) {
            var event = this._handleLocs[handle];
            if (event) {
                delete this._handleLocs[handle];
                var locSubs = this._eventSubs[event];
                if (locSubs) {
                    delete locSubs[handle];
                }
                this._handleMap.removeItem(handle); // Release handle
            }
        },

        /**
         * Subscribes to the next occurrence of the given event, then un-subscribes as soon as the event is handled.
         *
         * This is equivalent to calling {{#crossLink "Component/on:method"}}{{/crossLink}}, and then calling
         * {{#crossLink "Component/off:method"}}{{/crossLink}} inside the callback function.
         *
         * @method once
         * @param {String} event Data event to listen to
         * @param {Function(data)} callback Called when fresh data is available at the event
         * @param {Object} [scope=this] Scope for the callback
         */
        once: function (event, callback, scope) {
            var self = this;
            var handle = this.on(event,
                function (value) {
                    self.off(handle);
                    callback(value);
                },
                scope);
        },

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
        log: function (message) {
            window.console.log("[LOG] " + this.id + ": " + message);

            this.scene.fire("log", message);
        },

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
        error: function (message) {
            window.console.error("[ERROR] " + this.id + ": " + message);

            this.scene.fire("error", message);
        },

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
        warn: function (message) {
            window.console.warn("[WARN] " + this.id + ": " + message);

            this.scene.fire("warn", message);
        },

        /**
         * Adds a child component to this.
         * When component not given, attaches the scene's default instance for the given type.
         * Publishes the new child component on this component, keyed to the given type.
         *
         * @param {string} type component type
         * @param {Component} child The component
         * @private
         */
        _setChild: function (type, child) {

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

                if (!child.type || child.type !== type) {
                    this.error("Failed to add component '" + child.id + "' to object - component expected to be a '" + type + "' type");
                    return;
                }
            }

            var oldChild = this._children[type];

            if (oldChild) { // child of given type already attached

                if (oldChild.id === child.id) { // Attempt to reattach same child
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
                    if (child.id === defaultComponent.id) {

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

            this.fire(type, child);

            return child;
        },


        _compile: function () {
        },

        _props: {

            "json": {

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
            }
        },

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
        destroy: function () {

            // Unsubscribe from child components
            var child;
            for (var type in this._children) {
                if (this._children.hasOwnProperty(type)) {
                    child = this._children[type];
                    child.off(this._childDestroySubs[type]);
                    child.off(this._childDirtySubs[type]);
                }
            }

            // Execute subclass behaviour
            if (this._destroy) {
                this._destroy();
            }

            /**
             * Fired when this Component is destroyed.
             * @event destroyed
             */

            this.fire("destroyed", this.destroyed = true);
        },

        _destroy: function () {
        }
    });

})()
