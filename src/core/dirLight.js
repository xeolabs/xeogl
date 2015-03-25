/**
 A **DirLight** is a light source that illuminates all attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally
 from a given direction.

 <ul>
    <li>DirLights are grouped, along with other light source types, within {{#crossLink "Lights"}}Lights{{/crossLink}} components,
 which are attached to {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
    <li>DirLights have a direction, but no position.</li>
    <li>DirLights may be defined in either **World** or **View** coordinate space. When in World-space, their direction
 is relative to the World coordinate system, and will appear to move as the {{#crossLink "Camera"}}{{/crossLink}} moves.
 When in View-space, their direction is relative to the View coordinate system, and will behave as if fixed to the viewer's
 head as the {{#crossLink "Camera"}}{{/crossLink}} moves.</li>
 <li>Within xeoEngine's Phong lighting calculations, DirLight {{#crossLink "DirLight/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "DirLight/specular:property"}}{{/crossLink}} are multiplied by {{#crossLink "Material"}}Material{{/crossLink}}
 {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and {{#crossLink "Material/specular:property"}}{{/crossLink}},
 respectively.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7096639/L.png"></img>

 ## Example

 In this example we have a DirLight

 <ul>
 <li>a {{#crossLink "material"}}{{/crossLink}},</li>
 <li>a DirLight that points along the negative diagonal of the View coordinate system,</li>
 <li>a {{#crossLink "Lights"}}{{/crossLink}} containing the DirLight,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ```` javascript
var scene = new XEO.Scene();

// A shiny Material with quantities of reflected
// ambient, diffuse and specular color
var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
});

// DirLight with diffuse and specular color, pointing along
// the negative diagonal within the View coordinate system
var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"  // Other option is "world", for World-space
});

// Lights which contains our DirLight
var lights = new XEO.Lights(scene, {
    lights: [
        dirLight
    ]
});

var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

// GameObject which renders our Geometry, colored with
// the Material and illuminated with the DirLight
var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});
 ````

 As with all components, we can observe and change properties on a DirLights, like so:

 ````Javascript
// Attach a change listener to a property
var handle = dirLight.on("diffuse",
    function(value) {
        // Property value has changed
    });

// Set the property, which fires our change listener
dirLight.diffuse = [0.0, 0.3, 0.3];

// Detach the change listener
dirLight.off(handle);
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
(function () {

    "use strict";

    XEO.DirLight = XEO.Component.extend({

        className: "XEO.DirLight",

        type: "light",

        _init: function (cfg) {

            this.mode = "dir";

            this._state.mode = this.mode;

            this.dir = cfg.dir;
            this.diffuse = cfg.diffuse;
            this.specular = cfg.specular;
            this.space = cfg.space;
        },

        _props: {

            /**
             The direction of this DirLight.

             Fires a {{#crossLink "DirLight/dir:event"}}{{/crossLink}} event on change.

             @property dir
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            dir: {

                set: function (value) {
                    value = value || [1.0, 1.0, 1.0 ];
                    this._state.dir = value;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/dir:property"}}{{/crossLink}} property changes.
                     * @event dir
                     * @param value The property's new value
                     */
                    this.fire("dir", value);
                },

                get: function () {
                    return this._state.dir;
                }
            },

            /**
             The diffuse color of this DirLight.

             Fires a {{#crossLink "DirLight/diffuse:event"}}{{/crossLink}} event on change.

             @property diffuse
             @default [0.7, 0.7, 0.8]
             @type Array(Number)
             */
            diffuse: {

                set: function (value) {
                    value = value || [0.7, 0.7, 0.8 ];
                    this._state.diffuse = value;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/diffuse:property"}}{{/crossLink}} property changes.
                     * @event diffuse
                     * @param value The property's new value
                     */
                    this.fire("diffuse", value);
                },

                get: function () {
                    return this._state.diffuse;
                }
            },

            /**
             The specular color of this DirLight.

             Fires a {{#crossLink "DirLight/specular:event"}}{{/crossLink}} event on change.

             @property specular
             @default [1.0, 1.0, 1.0]
             @type Array(Number)
             */
            specular: {

                set: function (value) {
                    value = value || [1.0, 1.0, 1.0 ];
                    this._state.specular = value;
                    this._renderer.imageDirty = true;

                    /**
                     * Fired whenever this DirLight's  {{#crossLink "DirLight/specular:property"}}{{/crossLink}} property changes.
                     * @event specular
                     * @param value The property's new value
                     */
                    this.fire("specular", value);
                },

                get: function () {
                    return this._state.specular;
                }
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
            space: {

                set: function (value) {
                    value = value || "view";
                    if (value === this._state.space) {
                        return;
                    }
                    this._state.space = value;
                    this.fire("dirty", true); // Need to rebuild shader

                    /**
                     * Fired whenever this DirLight's {{#crossLink "DirLight/space:property"}}{{/crossLink}} property changes.
                     * @event space
                     * @param value The property's new value
                     */
                    this.fire("space", value);
                },

                get: function () {
                    return this._state.space;
                }
            }
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

})();
