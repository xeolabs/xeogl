/**
 The **Component** class is the base class for all xeogl components.

 ## Usage

 * [Component IDs](#component-ids)
 * [Metadata](#metadata)
 * [Logging](#logging)
 * [Destruction](#destruction)
 * [Creating custom Components](#creating-custom-components)

 ### Component IDs

 Every Component has an ID that's unique within the parent {{#crossLink "Scene"}}{{/crossLink}}. xeogl generates
 the IDs automatically by default, however you can also specify them yourself. In the example below, we're creating a
 scene comprised of {{#crossLink "Scene"}}{{/crossLink}}, {{#crossLink "Material"}}{{/crossLink}}, {{#crossLink "Geometry"}}{{/crossLink}} and
 {{#crossLink "Entity"}}{{/crossLink}} components, while letting xeogl generate its own ID for
 the {{#crossLink "Geometry"}}{{/crossLink}}:

 ````javascript
 // The Scene is a Component too
 var scene = new xeogl.Scene({
    id: "myScene"
 });

 var material = new xeogl.PhongMaterial(scene, {
    id: "myMaterial"
 });

 var geometry = new xeogl.Geometry(scene, {
    id: "myGeometry"
 });

 // Let xeogl automatically generate the ID for our Entity
 var entity = new xeogl.Entity(scene, {
    material: material,
    geometry: geometry
 });
 ````

 We can then find those components like this:

 ````javascript
 // Find the Scene
 var theScene = xeogl.scenes["myScene"];

 // Find the Material
 var theMaterial = theScene.components["myMaterial"];

 // Find all PhongMaterials in the Scene
 var phongMaterials = theScene.types["xeogl.PhongMaterial"];

 // Find our Material within the PhongMaterials
 var theMaterial = phongMaterials["myMaterial"];
 ````

 ### Component inheritance


 TODO

 All xeogl components extend the Component base type. Each component

 For example, if this component is a {{#crossLink "Rotate"}}{{/crossLink}}, which
 extends {{#crossLink "Transform"}}{{/crossLink}}, which in turn extends {{#crossLink "Component"}}{{/crossLink}},
 then this property will have the value:

 ````json
 ["xeogl.Component", "xeogl.Transform"]
 ````

 TODO

 ````javascript
 // Evaluates true:
 var isComponent = theMaterial.isType("xeogl.Component");

 // Evaluates true:
 var isMaterial = theMaterial.isType("xeogl.Material");

 // Evaluates true:
 var isPhongMaterial = theMaterial.isType("xeogl.PhongMaterial");

 // Evaluates false:
 var isMetallicMaterial = theMaterial.isType("xeogl.MetallicMaterial");
 ````
 Note that the chain is ordered downwards in the hierarchy, ie. from super-class down towards sub-class.

 ### Metadata

 You can set optional **metadata** on your Components, which can be anything you like. These are intended
 to help manage your components within your application code or content pipeline. You could use metadata to attach
 authoring or version information, like this:

 ````javascript
 // Scene with authoring metadata
 var scene = new xeogl.Scene({
    id: "myScene",
    meta: {
        title: "My bodacious 3D scene",
        author: "@xeographics",
        date: "February 30 2018"
    }
 });

 // Material with descriptive metadata
 var material = new xeogl.PhongMaterial(scene, {
    id: "myMaterial",
    diffuse: [1, 0, 0],
    meta: {
        description: "Bright red color with no textures",
        version: "0.1",
        foo: "bar"
    }
 });
 ````

 ### Logging

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

 ### Destruction

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

 ### Creating custom Components

 Subclassing a Component to create a new ````xeogl.ColoredTorus```` type:

 ````javascript
 xeogl.ColoredTorus = xeogl.Component.extend({

     type: "xeogl.ColoredTorus",

     _init: function (cfg) { // Constructor

         this._torus = new xeogl.Entity({
             geometry: new xeogl.TorusGeometry({radius: 2, tube: .6}),
             material: new xeogl.MetallicMaterial({
                 baseColor: [1.0, 0.5, 0.5],
                 roughness: 0.4,
                 metallic: 0.1
             })
         });

         this.color = cfg.color;
     },

     _props: {

         // The color of this ColoredTorus.
         color: {
             set: function (color) {
                 this._torus.material.baseColor = color;
             },
             get: function () {
                 return this._torus.material.baseColor;
             }
         }
     },

     _destroy: function () {
         this._torus.geometry.destroy();
         this._torus.material.destroy();
         this._torus.destroy();
     }
 });
 ````

 #### Examples

 * [Custom component definition](../../examples/#extending_component_basic)
 * [Custom component that fires events](../../examples/#extending_component_changeEvents)
 * [Custom component that manages child components](../../examples/#extending_component_childCleanup)
 * [Custom component that schedules asynch tasks](../../examples/#extending_component_update)

 @class Component
 @module xeogl
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Component
 within the default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} DepthBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Component.
 @param [cfg.isDefault] {Boolean} Set true when this is one of xeogl's default components.
 */
(function () {

    "use strict";

    xeogl.Component = Class.extend({

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

            var adopter = null;

            if (this.type === "xeogl.Scene") {
                this.scene = this;
                if (arg1) {
                    cfg = arg1;
                }

            } else {
                if (arg1) {
                    if (arg1.type === "xeogl.Scene") {
                        this.scene = arg1;
                        adopter = this.scene;
                        if (arg2) {
                            cfg = arg2;
                        }

                    } else if (arg1.isType && arg1.isType("xeogl.Component")) {
                        this.scene = arg1.scene;
                        adopter = arg1;
                        if (arg2) {
                            cfg = arg2;
                        }

                    } else {
                        // Create this component within the default xeogl Scene
                        this.scene = xeogl.scene;
                        adopter = this.scene;

                        cfg = arg1;
                    }
                } else {
                    // Create this component within the default xeogl Scene
                    this.scene = xeogl.scene;
                    adopter = this.scene;
                }
                this._renderer = this.scene._renderer;
            }

            /**
             Arbitrary, user-defined metadata on this component.

             @property metadata
             @type Object
             */
            this.meta = cfg.meta || {};

            /**
             Indicates whether this is one of the {{#crossLink "Scene"}}Scene{{/crossLink}}'s built-in Components.

             @property isDefault
             @type Boolean
             */
            this.isDefault = cfg.isDefault;

            /**
             Unique ID for this Component within its parent {{#crossLink "Scene"}}Scene{{/crossLink}}.

             @property id
             @type String
             @final
             */
            this.id = cfg.id; // Auto-generated by xeogl.Scene by default

            /**
             True as soon as this Component has been destroyed

             @property destroyed
             @type Boolean
             */
            this.destroyed = false;

            /// Attached components with names.
            this._attached = {}; // Protected

            // Attached components keyed to IDs
            this._attachments = null; // Lazy-instantiated map

            // Event support - lazy creating these properties because
            // they are expensive to have around if not using them
            this._handleMap = null; // Subscription handle pool
            this._handleEvents = null; // Subscription handles mapped to event names
            this._eventSubs = null; // Event names mapped to subscribers
            this._events = null; // Maps names to events
            this._eventCallDepth = 0; // Helps us catch stack overflows from recursive events

            // Components created with #create
            this._adoptees = null; // Lazy-instantiated map

            if (this.scene && this.type !== "xeogl.Scene") { // HACK: Don't add scene to itself
                // Register this component on its scene
                // Assigns this component an automatic ID if not yet assigned
                this.scene._addComponent(this);
            }

            // True when #_update will be called on next tick
            this._updateScheduled = false;

            // Initialize this component
            if (this._init) {
                this._init(cfg);
            }

            if (adopter) {
                adopter._adopt(this);
            }
        },

        /**
         JavaScript class name for this Component.

         For example: "xeogl.AmbientLight", "xeogl.ColorTarget", "xeogl.Lights" etc.

         @property type
         @type String
         @final
         */
        type: "xeogl.Component",

        /**
         An array of strings that indicates the chain of super-types within this component's inheritance hierarchy.

         For example, if this component is a {{#crossLink "Rotate"}}{{/crossLink}}, which
         extends {{#crossLink "Transform"}}{{/crossLink}}, which in turn extends {{#crossLink "Component"}}{{/crossLink}},
         then this property will have the value:

         ````json
         ["xeogl.Component", "xeogl.Transform"]
         ````

         Note that the chain is ordered downwards in the hierarchy, ie. from super-class down towards sub-class.

         @property superTypes
         @type {Array of String}
         @final
         */
        superTypes: [],

        /**
         Tests if this component is of the given type, or is a subclass of the given type.

         The type may be given as either a string or a component constructor.

         This method works by walking up the inheritance type chain, which this component provides in
         property {{#crossLink "Component/superTypes:property"}}{{/crossLink}}, returning true as soon as one of the type strings in
         the chain matches the given type, of false if none match.

         #### Examples:

         ````javascript
         var myRotate = new xeogl.Rotate({ ... });

         myRotate.isType(xeogl.Component); // Returns true for all xeogl components
         myRotate.isType("xeogl.Component"); // Returns true for all xeogl components
         myRotate.isType(xeogl.Rotate); // Returns true
         myRotate.isType(xeogl.Transform); // Returns true
         myRotate.isType("xeogl.Transform"); // Returns true
         myRotate.isType(xeogl.Entity); // Returns false, because xeogl.Rotate does not (even indirectly) extend xeogl.Entity
         ````

         @method isType
         @param  {String|Function} type Component type to compare with, eg "xeogl.PhongMaterial", or a xeogl component constructor.
         @returns {Boolean} True if this component is of given type or is subclass of the given type.
         */
        isType: function (type) {
            if (!xeogl._isString(type)) {
                type = type.type;
                if (!type) {
                    return false;
                }
            }
            return xeogl._isComponentType(this.type, type);
        },

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
         * Notifies existing subscribers to the event, optionally retains the event to give to
         * any subsequent notifications on the event as they are made.
         *
         * @method fire
         * @param {String} event The event type name
         * @param {Object} value The event parameters
         * @param {Boolean} [forget=false] When true, does not retain for subsequent subscribers
         */
        fire: function (event, value, forget) {
            if (!this._events) {
                this._events = {};
            }
            if (!this._eventSubs) {
                this._eventSubs = {};
            }
            if (forget !== true) {
                this._events[event] = value; // Save notification
            }
            var subs = this._eventSubs[event];
            var sub;
            if (subs) { // Notify subscriptions
                for (var handle in subs) {
                    if (subs.hasOwnProperty(handle)) {
                        sub = subs[handle];
                        this._eventCallDepth++;
                        if (this._eventCallDepth < 300) {
                            sub.callback.call(sub.scope, value);
                        } else {
                            this.error("fire: potential stack overflow from recursive event '" + event + "' - dropping this event");
                        }
                        this._eventCallDepth--;
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
            if (!this._events) {
                this._events = {};
            }
            if (!this._handleMap) {
                this._handleMap = new xeogl.utils.Map(); // Subscription handle pool
            }
            if (!this._handleEvents) {
                this._handleEvents = {};
            }
            if (!this._eventSubs) {
                this._eventSubs = {};
            }
            var subs = this._eventSubs[event];
            if (!subs) {
                subs = {};
                this._eventSubs[event] = subs;
            }
            var handle = this._handleMap.addItem(); // Create unique handle
            subs[handle] = {
                callback: callback,
                scope: scope || this
            };
            this._handleEvents[handle] = event;
            var value = this._events[event];
            if (value !== undefined) { // A publication exists, notify callback immediately
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
            if (handle === undefined || handle === null) {
                return;
            }
            if (!this._handleEvents) {
                return;
            }
            var event = this._handleEvents[handle];
            if (event) {
                delete this._handleEvents[handle];
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
         * Returns true if there are any subscribers to the given event on this component.
         *
         * @method hasSubs
         * @param {String} event The event
         * @return {Boolean} True if there are any subscribers to the given event on this component.
         */
        hasSubs: function (event) {
            return (this._eventSubs && !!this._eventSubs[event]);
        },

        /**
         * Logs a console debugging message for this component.
         *
         * The console message will have this format: *````[LOG] [<component type> <component id>: <message>````*
         *
         * Also fires the message as a {{#crossLink "Scene/log:event"}}{{/crossLink}} event on the
         * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * @method log
         * @param {String} message The message to log
         */
        log: function (message) {
            message = "[LOG]" + this._message(message);
            window.console.log(message);
            this.scene.fire("log", message);
        },

        _message: function (message) {
            return " [" + this.type + " " + xeogl._inQuotes(this.id) + "]: " + message;
        },

        /**
         * Logs a warning for this component to the JavaScript console.
         *
         * The console message will have this format: *````[WARN] [<component type> =<component id>: <message>````*
         *
         * Also fires the message as a {{#crossLink "Scene/warn:event"}}{{/crossLink}} event on the
         * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * @method warn
         * @param {String} message The message to log
         */
        warn: function (message) {
            message = "[WARN]" + this._message(message);
            window.console.warn(message);
            this.scene.fire("warn", message);
        },

        /**
         * Logs an error for this component to the JavaScript console.
         *
         * The console message will have this format: *````[ERROR] [<component type> =<component id>: <message>````*
         *
         * Also fires the message as an {{#crossLink "Scene/error:event"}}{{/crossLink}} event on the
         * parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
         *
         * @method error
         * @param {String} message The message to log
         */
        error: function (message) {
            message = "[ERROR]" + this._message(message);
            window.console.error(message);
            this.scene.fire("error", message);
        },

        /**
         * Adds a child component to this.
         * When component not given, attaches the scene's default instance for the given name (if any).
         * Publishes the new child component on this component, keyed to the given name.
         *
         * @param {*} params
         * @param {String} params.name component name
         * @param {Component} [params.component] The component
         * @param {String} [params.type] Optional expected type of base type of the child; when supplied, will
         * cause an exception if the given child is not the same type or a subtype of this.
         * @param {Boolean} [params.sceneDefault=false]
         * @param {Boolean} [params.sceneSingleton=false]
         * @param {Function} [params.onAttached] Optional callback called when component attached
         * @param {Function} [params.onAttached.callback] Callback function
         * @param {Function} [params.onAttached.scope] Optional scope for callback
         * @param {Function} [params.onDetached] Optional callback called when component is detached
         * @param {Function} [params.onDetached.callback] Callback function
         * @param {Function} [params.onDetached.scope] Optional scope for callback
         * @param {{String:Function}} [params.on] Callbacks to subscribe to properties on component
         * @param {Boolean} [params.recompiles=true] When true, fires "dirty" events on this component
         * @private
         */
        _attach: function (params) {

            var name = params.name;

            if (!name) {
                this.error("Component 'name' expected");
                return;
            }

            var component = params.component;
            var sceneDefault = params.sceneDefault;
            var sceneSingleton = params.sceneSingleton;
            var type = params.type;
            var on = params.on;
            var recompiles = params.recompiles !== false;

            // True when child given as config object, where parent manages its instantiation and destruction
            var managingLifecycle = false;

            if (component) {

                if (xeogl._isNumeric(component) || xeogl._isString(component)) {

                    // Component ID given
                    // Both numeric and string IDs are supported

                    var id = component;

                    component = this.scene.components[id];

                    if (!component) {

                        // Quote string IDs in errors

                        this.error("Component not found: " + xeogl._inQuotes(id));
                        return;
                    }

                } else if (xeogl._isObject(component)) {

                    // Component config given

                    var componentCfg = component;
                    var componentType = componentCfg.type || type || "xeogl.Component";
                    var componentClass = window[componentType];

                    if (!componentClass) {
                        this.error("Component type not found: " + componentType);
                        return;
                    }

                    if (type) {
                        if (!xeogl._isComponentType(componentType, type)) {
                            this.error("Expected a " + type + " type or subtype, not a " + componentType);
                            return;
                        }
                    }

                    component = new componentClass(this.scene, componentCfg);

                    managingLifecycle = true;
                }
            }


            if (!component) {

                if (sceneSingleton === true) {

                    // Using the first instance of the component type we find

                    var instances = this.scene.types[type];
                    for (var id2 in instances) {
                        if (instances.hasOwnProperty) {
                            component = instances[id2];
                            break;
                        }
                    }

                    if (!component) {
                        this.error("Scene has no default component for '" + name + "'");
                        return null;
                    }

                } else if (sceneDefault === true) {

                    // Using a default scene component

                    component = this.scene[name];

                    if (!component) {
                        this.error("Scene has no default component for '" + name + "'");
                        return null;
                    }
                }
            }

            if (component) {

                if (component.scene.id !== this.scene.id) {
                    this.error("Not in same scene: " + component.type + " " + xeogl._inQuotes(component.id));
                    return;
                }

                if (type) {

                    if (!component.isType(type)) {
                        this.error("Expected a " + type + " type or subtype: " + component.type + " " + xeogl._inQuotes(component.id));
                        return;
                    }
                }
            }

            if (!this._attachments) {
                this._attachments = {};
            }

            var oldComponent = this._attached[name];
            var subs;
            var i;
            var len;

            if (oldComponent) {

                if (component && oldComponent.id === component.id) {

                    // Reject attempt to reattach same component
                    return;
                }

                var oldAttachment = this._attachments[oldComponent.id];

                // Unsubscribe from events on old component

                subs = oldAttachment.subs;

                for (i = 0, len = subs.length; i < len; i++) {
                    oldComponent.off(subs[i]);
                }

                delete this._attached[name];
                delete this._attachments[oldComponent.id];

                var onDetached = oldAttachment.params.onDetached;
                if (onDetached) {
                    if (xeogl._isFunction(onDetached)) {
                        onDetached(oldComponent);
                    } else {
                        onDetached.scope ? onDetached.callback.call(onDetached.scope, oldComponent) : onDetached.callback(oldComponent);
                    }
                }

                if (oldAttachment.managingLifecycle) {

                    // Note that we just unsubscribed from all events fired by the child
                    // component, so destroying it won't fire events back at us now.

                    oldComponent.destroy();
                }
            }

            if (component) {

                // Set and publish the new component on this component

                var attachment = {
                    params: params,
                    component: component,
                    subs: [],
                    managingLifecycle: managingLifecycle
                };

                attachment.subs.push(
                    component.on("destroyed",
                        function () {
                            attachment.params.component = null;
                            this._attach(attachment.params);
                        },
                        this));

                if (recompiles) {
                    attachment.subs.push(
                        component.on("dirty",
                            function () {
                                this.fire("dirty", this);
                            },
                            this));
                }

                this._attached[name] = component;
                this._attachments[component.id] = attachment;

                // Bind destruct listener to new component to remove it
                // from this component when destroyed

                var onAttached = params.onAttached;
                if (onAttached) {
                    if (xeogl._isFunction(onAttached)) {
                        onAttached(component);
                    } else {
                        onAttached.scope ? onAttached.callback.call(onAttached.scope, component) : onAttached.callback(component);
                    }
                }

                if (on) {

                    var event;
                    var handler;
                    var callback;
                    var scope;

                    for (event in on) {
                        if (on.hasOwnProperty(event)) {

                            handler = on[event];

                            if (xeogl._isFunction(handler)) {
                                callback = handler;
                                scope = null;
                            } else {
                                callback = handler.callback;
                                scope = handler.scope;
                            }

                            if (!callback) {
                                continue;
                            }

                            attachment.subs.push(component.on(event, callback, scope));
                        }
                    }
                }
            }

            if (recompiles) {
                this.fire("dirty", this); // FIXME: May trigger spurous entity recompilations unless able to limit with param?
            }

            this.fire(name, component); // Component can be null

            return component;
        },

        /**
         * Convenience method for creating a Component within this Component's {{#crossLink "Scene"}}{{/crossLink}}.
         *
         * The method is given a component configuration, like so:
         *
         * ````javascript
         * var material = myComponent.create({
         *      type: "xeogl.PhongMaterial",
         *      diffuse: [1,0,0],
         *      specular: [1,1,0]
         * }, "myMaterial");
         * ````
         *
         * @method create
         * @param {*} [cfg] Configuration for the component instance.
         * @returns {*}
         */
        create: function (cfg) {

            var type;
            var claz;

            if (xeogl._isObject(cfg)) {
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

            if (cfg && cfg.id && this.components[cfg.id]) {
                this.error("Component " + xeogl._inQuotes(cfg.id) + " already exists in Scene - ignoring ID, will randomly-generate instead");
                cfg.id = undefined;
                //return null;
            }

            var component = new claz(this, cfg);
            if (component) {
                this._adopt(component);
            }

            return component;
        },

        _adopt: function (component) {
            if (!this._adoptees) {
                this._adoptees = {};
            }
            if (!this._adoptees[component.id]) {
                this._adoptees[component.id] = component;
            }
            component.on("destroyed", function () {
                delete this._adoptees[component.id];
            }, this);
        },

        /**
         * Protected method, called by sub-classes to queue a call to _update().
         * @protected
         * @param {Number} [priority=1]
         */
        _needUpdate: function (priority) {
            if (!this._updateScheduled) {
                this._updateScheduled = true;
                if (priority === 0) {
                    xeogl.deferTask(this._doUpdate, this);
                } else {
                    xeogl.scheduleTask(this._doUpdate, this);
                }
            }
        },

        /**
         * @private
         */
        _doUpdate: function () {
            if (this._updateScheduled) {
                this._updateScheduled = false;
                if (this._update) {
                    this._update();
                }
            }
        },

        /**
         * Protected virtual template method, optionally implemented
         * by sub-classes to perform a scheduled task.
         *
         * @protected
         */
        _update: null,

        /**
         * Destroys this component.
         *
         * Fires a {{#crossLink "Component/destroyed:event"}}{{/crossLink}} event on this Component.
         *
         * Automatically disassociates this component from other components, causing them to fall back on any
         * defaults that this component overrode on them.
         *
         * TODO: describe effect with respect to #create
         *
         * @method destroy
         */
        destroy: function () {

            if (this.destroyed) {
                return;
            }

            // Unsubscribe from child components and destroy then

            var id;
            var attachment;
            var component;
            var subs;
            var i;
            var len;

            if (this._attachments) {
                for (id in this._attachments) {
                    if (this._attachments.hasOwnProperty(id)) {
                        attachment = this._attachments[id];
                        component = attachment.component;
                        subs = attachment.subs;
                        for (i = 0, len = subs.length; i < len; i++) {
                            component.off(subs[i]);
                        }
                        if (attachment.managingLifecycle) {
                            component.destroy();
                        }
                    }
                }
            }

            // Release components created with #create

            if (this._adoptees) {
                for (id in this._adoptees) {
                    if (this._adoptees.hasOwnProperty(id)) {
                        component = this._adoptees[id];
                        delete this._adoptees[id];
                    }
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

        /**
         * Protected template method, implemented by sub-classes
         * to clean up just before the component is destroyed.
         *
         * @protected
         */
        _destroy: function () {
        }
    });
})();
