"use strict";

/**
 A light source that illuminates all associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally
 from a given direction.

 <ul>

 <li>DirLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are associated with {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Within XEO Engine's Phong lighting calculations, DirLight {{#crossLink "DirLight/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "DirLight/specular:property"}}{{/crossLink}} are multiplied by {{#crossLink "Material"}}Material{{/crossLink}}
 {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and {{#crossLink "Material/specular:property"}}{{/crossLink}},
 respectively.</li>

 <li>Diffuse, specular and ambient lighting may also be enabled or disabled for specific {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 via {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}, {{#crossLink "Modes/diffuse:property"}}{{/crossLink}}
 and {{#crossLink "Modes/ambient:property"}}{{/crossLink}} flags on {{#crossLink "Modes"}}Modes{{/crossLink}} components.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096639/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that has a {{#crossLink "Geometry"}}{{/crossLink}},
 a {{#crossLink "Material"}}{{/crossLink}}, and a {{#crossLink "Lights"}}{{/crossLink}} that has a {{#crossLink "DirLight"}}{{/crossLink}}.


 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
 });

 // Within XEO Engine's Phong shading calculations, the DirLight's diffuse and
 // specular colors will be multiplied by the Material's diffuse and specular colors

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

