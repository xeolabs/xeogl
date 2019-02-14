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
 {{#crossLink "Mesh"}}{{/crossLink}} components, while letting xeogl generate its own ID for
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

 // Let xeogl automatically generate the ID for our Mesh
 var mesh = new xeogl.Mesh(scene, {
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

 All xeogl components are (at least indirect) subclasses of the Component base type.

 For most components, you can get the name of its class via its {{#crossLink "Component/type:property"}}{{/crossLink}} property:

 ````javascript
 var type = theMaterial.type; // "xeogl.PhongMaterial"
 ````

 You can also test if a component implements or extends a given component class, like so:

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
 class ColoredTorus extends xeogl.Component{

     get type() {
        return "ColoredTorus";
     }

     constructor(scene=null, cfg) { // Constructor

         super(scene. cfg);

         this._torus = new xeogl.Mesh({
             geometry: new xeogl.TorusGeometry({radius: 2, tube: .6}),
             material: new xeogl.MetallicMaterial({
                 baseColor: [1.0, 0.5, 0.5],
                 roughness: 0.4,
                 metallic: 0.1
             })
         });

         this.color = cfg.color;
     },

     set color(color) {
         this._torus.material.baseColor = color;
     }

     get color() {
         return this._torus.material.baseColor;
     }

     destroy() {
         super.destroy();
         this._torus.geometry.destroy();
         this._torus.material.destroy();
         this._torus.destroy();
     }
 };
 ````

 #### Examples

 * [Custom component definition](../../examples/#extending_component_basic)
 * [Custom component that fires events](../../examples/#extending_component_changeEvents)
 * [Custom component that manages child components](../../examples/#extending_component_childCleanup)
 * [Custom component that schedules asynch tasks](../../examples/#extending_component_update)

 @class Component
 @module xeogl
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} DepthBuf configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Component.
 */

import {core} from "./core.js";
import {utils} from './utils.js';
import {tasks} from './tasks.js';
import {Map} from "./utils/map.js";
import {componentClasses} from "./componentClasses.js";

const type = "xeogl.Component";

class Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    constructor() {

        var cfg = {};

        var arg1 = arguments[0];
        var arg2 = arguments[1];

        var owner = null;

        /**
         The parent {{#crossLink "Scene"}}{{/crossLink}} that contains this Component.

         @property scene
         @type {Scene}
         @final
         */
        this.scene = null;

        if (this.type === "xeogl.Scene") {
            this.scene = this;
            if (arg1) {
                cfg = arg1;
            }
        } else {
            if (arg1) {
                if (arg1.type === "xeogl.Scene") {
                    this.scene = arg1;
                    owner = this.scene;
                    if (arg2) {
                        cfg = arg2;
                    }

                } else if (arg1 instanceof Component) {
                    this.scene = arg1.scene;
                    owner = arg1;
                    if (arg2) {
                        cfg = arg2;
                    }

                } else {
                    // Create this component within the default xeogl Scene
                    this.scene = core.getDefaultScene();
                    owner = this.scene;
                    cfg = arg1;
                }
            } else {
                // Create this component within the default xeogl Scene
                this.scene = core.getDefaultScene();
                owner = this.scene;
            }
            this._renderer = this.scene._renderer;
        }

        this._dontClear = !!cfg.dontClear; // Prevent Scene#clear from destroying this component

        this._model = null;
        this._renderer = this.scene._renderer;

        /**
         Arbitrary, user-defined metadata on this component.

         @property metadata
         @type Object
         */
        this.meta = cfg.meta || {};

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

        this._attached = {}; // Attached components with names.
        this._attachments = null; // Attached components keyed to IDs - lazy-instantiated
        this._subIdMap = null; // Subscription subId pool
        this._subIdEvents = null; // Subscription subIds mapped to event names
        this._eventSubs = null; // Event names mapped to subscribers
        this._events = null; // Maps names to events
        this._eventCallDepth = 0; // Helps us catch stack overflows from recursive events
        this._adoptees = null; // // Components created with #create - lazy-instantiated

        if (this !== this.scene) { // Don't add scene to itself
            this.scene._addComponent(this); // Assigns this component an automatic ID if not yet assigned
        }

        this._updateScheduled = false; // True when #_update will be called on next tick

        this.init(cfg);

        if (owner) {
            owner._adopt(this);
        }
    }

    init() { // No-op

    }

    _addedToModel(model) { // Called by xeogl.Model.add()
        this._model = model;
    }

    _removedFromModel(model) { // Called by xeogl.Model.remove()
        this._model = null;
    }

    /**
     The {{#crossLink "Model"}}{{/crossLink}} which contains this Component, if any.

     Will be null if this Component is not in a Model.

     @property model
     @final
     @type Model
     */
    get model() {
        return this._model;
    }

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
     myRotate.isType(xeogl.Mesh); // Returns false, because xeogl.Rotate does not (even indirectly) extend xeogl.Mesh
     ````

     @method isType
     @param  {String|Function} type Component type to compare with, eg "xeogl.PhongMaterial", or a xeogl component constructor.
     @returns {Boolean} True if this component is of given type or is subclass of the given type.
     */
    isType(type) {
        if (!utils.isString(type)) {
            type = type.type;
            if (!type) {
                return false;
            }
        }
        return core.isComponentType(this.type, type);
    }

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
    fire(event, value, forget) {
        if (!this._events) {
            this._events = {};
        }
        if (!this._eventSubs) {
            this._eventSubs = {};
        }
        if (forget !== true) {
            this._events[event] = value || true; // Save notification
        }
        const subs = this._eventSubs[event];
        let sub;
        if (subs) { // Notify subscriptions
            for (const subId in subs) {
                if (subs.hasOwnProperty(subId)) {
                    sub = subs[subId];
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
    }

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
    on(event, callback, scope) {
        if (!this._events) {
            this._events = {};
        }
        if (!this._subIdMap) {
            this._subIdMap = new Map(); // Subscription subId pool
        }
        if (!this._subIdEvents) {
            this._subIdEvents = {};
        }
        if (!this._eventSubs) {
            this._eventSubs = {};
        }
        let subs = this._eventSubs[event];
        if (!subs) {
            subs = {};
            this._eventSubs[event] = subs;
        }
        const subId = this._subIdMap.addItem(); // Create unique subId
        subs[subId] = {
            callback: callback,
            scope: scope || this
        };
        this._subIdEvents[subId] = event;
        const value = this._events[event];
        if (value !== undefined) { // A publication exists, notify callback immediately
            callback.call(scope || this, value);
        }
        return subId;
    }

    /**
     * Cancels an event subscription that was previously made with {{#crossLink "Component/on:method"}}Component#on(){{/crossLink}} or
     * {{#crossLink "Component/once:method"}}Component#once(){{/crossLink}}.
     *
     * @method off
     * @param {String} subId Publication subId
     */
    off(subId) {
        if (subId === undefined || subId === null) {
            return;
        }
        if (!this._subIdEvents) {
            return;
        }
        const event = this._subIdEvents[subId];
        if (event) {
            delete this._subIdEvents[subId];
            const subs = this._eventSubs[event];
            if (subs) {
                delete subs[subId];
            }
            this._subIdMap.removeItem(subId); // Release subId
        }
    }

    /**
     * Subscribes to the next occurrence of the given event, then un-subscribes as soon as the event is subIdd.
     *
     * This is equivalent to calling {{#crossLink "Component/on:method"}}Component#on(){{/crossLink}}, and then calling
     * {{#crossLink "Component/off:method"}}Component#off(){{/crossLink}} inside the callback function.
     *
     * @method once
     * @param {String} event Data event to listen to
     * @param {Function(data)} callback Called when fresh data is available at the event
     * @param {Object} [scope=this] Scope for the callback
     */
    once(event, callback, scope) {
        const self = this;
        const subId = this.on(event,
            function (value) {
                self.off(subId);
                callback(value);
            },
            scope);
    }

    /**
     * Returns true if there are any subscribers to the given event on this component.
     *
     * @method hasSubs
     * @param {String} event The event
     * @return {Boolean} True if there are any subscribers to the given event on this component.
     */
    hasSubs(event) {
        return (this._eventSubs && !!this._eventSubs[event]);
    }

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
    log(message) {
        message = "[LOG]" + this._message(message);
        window.console.log(message);
        this.scene.fire("log", message);
    }

    _message(message) {
        return " [" + this.type + " " + utils.inQuotes(this.id) + "]: " + message;
    }

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
    warn(message) {
        message = "[WARN]" + this._message(message);
        window.console.warn(message);
        this.scene.fire("warn", message);
    }

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
    error(message) {
        message = "[ERROR]" + this._message(message);
        window.console.error(message);
        this.scene.fire("error", message);
    }

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
    _attach(params) {

        const name = params.name;

        if (!name) {
            this.error("Component 'name' expected");
            return;
        }

        let component = params.component;
        const sceneDefault = params.sceneDefault;
        const sceneSingleton = params.sceneSingleton;
        const type = params.type;
        const on = params.on;
        const recompiles = params.recompiles !== false;

        // True when child given as config object, where parent manages its instantiation and destruction
        let managingLifecycle = false;

        if (component) {

            if (utils.isNumeric(component) || utils.isString(component)) {

                // Component ID given
                // Both numeric and string IDs are supported

                const id = component;

                component = this.scene.components[id];

                if (!component) {

                    // Quote string IDs in errors

                    this.error("Component not found: " + utils.inQuotes(id));
                    return;
                }

            } else if (utils.isObject(component)) {

                // Component config given

                const componentCfg = component;
                const componentType = componentCfg.type || type || "xeogl.Component";
                const componentClass = componentClasses[componentType];

                if (!componentClass) {
                    this.error("Component type not found: " + componentType);
                    return;
                }

                if (type) {
                    if (!core.isComponentType(componentType, type)) {
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

                const instances = this.scene.types[type];
                for (const id2 in instances) {
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
                this.error("Not in same scene: " + component.type + " " + utils.inQuotes(component.id));
                return;
            }

            if (type) {

                if (!component.isType(type)) {
                    this.error("Expected a " + type + " type or subtype: " + component.type + " " + utils.inQuotes(component.id));
                    return;
                }
            }
        }

        if (!this._attachments) {
            this._attachments = {};
        }

        const oldComponent = this._attached[name];
        let subs;
        let i;
        let len;

        if (oldComponent) {

            if (component && oldComponent.id === component.id) {

                // Reject attempt to reattach same component
                return;
            }

            const oldAttachment = this._attachments[oldComponent.id];

            // Unsubscribe from events on old component

            subs = oldAttachment.subs;

            for (i = 0, len = subs.length; i < len; i++) {
                oldComponent.off(subs[i]);
            }

            delete this._attached[name];
            delete this._attachments[oldComponent.id];

            const onDetached = oldAttachment.params.onDetached;
            if (onDetached) {
                if (utils.isFunction(onDetached)) {
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

            const attachment = {
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

            const onAttached = params.onAttached;
            if (onAttached) {
                if (utils.isFunction(onAttached)) {
                    onAttached(component);
                } else {
                    onAttached.scope ? onAttached.callback.call(onAttached.scope, component) : onAttached.callback(component);
                }
            }

            if (on) {

                let event;
                let subIdr;
                let callback;
                let scope;

                for (event in on) {
                    if (on.hasOwnProperty(event)) {

                        subIdr = on[event];

                        if (utils.isFunction(subIdr)) {
                            callback = subIdr;
                            scope = null;
                        } else {
                            callback = subIdr.callback;
                            scope = subIdr.scope;
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
            this.fire("dirty", this); // FIXME: May trigger spurous mesh recompilations unless able to limit with param?
        }

        this.fire(name, component); // Component can be null

        return component;
    }

    _checkComponent(expectedType, component) {
        if (utils.isObject(component)) {
            if (component.type) {
                if (!core.isComponentType(component.type, expectedType)) {
                    this.error("Expected a " + expectedType + " type or subtype: " + component.type + " " + utils.inQuotes(component.id));
                    return;
                }
            } else {
                component.type = expectedType;
            }
            component = new componentClasses[component.type](this.scene, component);
        } else {
            if (utils.isID(component)) { // Expensive test
                const id = component;
                component = this.scene.components[id];
                if (!component) {
                    this.error("Component not found: " + utils.inQuotes(component.id));
                    return;
                }
            }
        }
        if (component.scene.id !== this.scene.id) {
            this.error("Not in same scene: " + component.type + " " + utils.inQuotes(component.id));
            return;
        }
        if (!component.isType(expectedType)) {
            this.error("Expected a " + expectedType + " type or subtype: " + component.type + " " + utils.inQuotes(component.id));
            return;
        }
        return component;
    }

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
    create(cfg) {

        let type;
        let claz;

        if (utils.isObject(cfg)) {
            type = cfg.type || "xeogl.Component";
            claz = componentClasses[type];

        } else if (utils.isString(cfg)) {
            type = cfg;
            claz = componentClasses[type];

        } else {
            claz = cfg;
            type = cfg.prototype.type;
            // TODO: catch unknown component class
        }

        if (!claz) {
            this.error("Component type not found: " + type);
            return;
        }

        if (!core.isComponentType(type, "xeogl.Component")) {
            this.error("Expected a xeogl.Component type or subtype");
            return;
        }

        if (cfg && cfg.id && this.components[cfg.id]) {
            this.error("Component " + utils.inQuotes(cfg.id) + " already exists in Scene - ignoring ID, will randomly-generate instead");
            cfg.id = undefined;
            //return null;
        }

        const component = new claz(this, cfg);
        if (component) {
            this._adopt(component);
        }

        return component;
    }

    _adopt(component) {
        if (!this._adoptees) {
            this._adoptees = {};
        }
        if (!this._adoptees[component.id]) {
            this._adoptees[component.id] = component;
        }
        component.on("destroyed", function () {
            delete this._adoptees[component.id];
        }, this);
    }

    /**
     * Protected method, called by sub-classes to queue a call to _update().
     * @protected
     * @param {Number} [priority=1]
     */
    _needUpdate(priority) {
        if (!this._updateScheduled) {
            this._updateScheduled = true;
            if (priority === 0) {
                this._doUpdate();
            } else {
                tasks.scheduleTask(this._doUpdate, this);
            }
        }
    }

    /**
     * @private
     */
    _doUpdate() {
        if (this._updateScheduled) {
            this._updateScheduled = false;
            if (this._update) {
                this._update();
            }
        }
    }

    /**
     * Protected virtual template method, optionally implemented
     * by sub-classes to perform a scheduled task.
     *
     * @protected
     */
    _update() {
    }

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
    destroy() {

        if (this.destroyed) {
            return;
        }

        // Unsubscribe from child components and destroy then

        let id;
        let attachment;
        let component;
        let subs;
        let i;
        let len;

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
            const ids = Object.keys(this._adoptees);
            for (i = 0, len = ids.length; i < len; i++) {
                component = this._adoptees[ids[i]];
                component.destroy();
            }
        }

        this.scene._removeComponent(this);

        // Memory leak avoidance
        this._attached = {};
        this._attachments = null;
        this._subIdMap = null;
        this._subIdEvents = null;
        this._eventSubs = null;
        this._events = null;
        this._eventCallDepth = 0;
        this._adoptees = null;
        this._updateScheduled = false;

        /**
         * Fired when this Component is destroyed.
         * @event destroyed
         */
        this.fire("destroyed", this.destroyed = true);
    }
}

componentClasses[type] = Component;

export {Component};
