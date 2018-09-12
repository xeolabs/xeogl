/**
 An **EdgeMaterial** is a {{#crossLink "Material"}}{{/crossLink}} that defines the appearance of attached
 {{#crossLink "Mesh"}}Meshes{{/crossLink}} when they are highlighted, selected or ghosted.

 ## Examples

 | <a href="../../examples/#effects_ghost"><img src="../../assets/images/screenshots/HighlightMaterial/teapot.png"></img></a> | <a href="../../examples/#effects_demo_housePlan"><img src="../../assets/images/screenshots/HighlightMaterial/house.png"></img></a> | <a href="../../examples/#effects_demo_gearbox"><img src="../../assets/images/screenshots/HighlightMaterial/gearbox.png"></img></a> | <a href="../../examples/#effects_demo_adam"><img src="../../assets/images/screenshots/HighlightMaterial/adam.png"></img></a>|
 |:------:|:------:|:----:|:-----:|:-----:|
 |[Example 1: Ghost effect](../../examples/#effects_ghost)|[Example 2: Ghost and highlight effects for architecture](../../examples/#effects_demo_housePlan)|[Example 3: Ghost and highlight effects for CAD](../../examples/#effects_demo_gearbox)| [Example 4: Ghost effect for CAD ](../../examples//#effects_demo_adam)|

 ## Overview

 * Ghost an {{#crossLink "Mesh"}}{{/crossLink}} by setting its {{#crossLink "Mesh/ghost:property"}}{{/crossLink}} property ````true````.
 * When ghosted, a Mesh's appearance is controlled by its EdgeMaterial.
 * An EdgeMaterial provides several preset configurations that you can set it to. Select a preset by setting {{#crossLink "EdgeMaterial/preset:property"}}{{/crossLink}} to the preset's ID. A map of available presets is provided in {{#crossLink "EdgeMaterial/presets:property"}}xeogl.EdgeMaterial.presets{{/crossLink}}.
 * By default, a Mesh uses the {{#crossLink "Scene"}}{{/crossLink}}'s global EdgeMaterials, but you can give each Mesh its own EdgeMaterial when you want to customize the effect per-Mesh.
 * Ghost all Meshes in a {{#crossLink "Model"}}{{/crossLink}} by setting the Model's {{#crossLink "Model/ghost:property"}}{{/crossLink}} property ````true````. Note that all Meshes in a Model have the Scene's global EdgeMaterial by default.
 * Modify the Scene's global EdgeMaterial to customize it.

 ## Usage

 * [Ghosting](#ghosting)
 * [Highlighting](#highlighting)

 ### Ghosting

 In the usage example below, we'll create a Mesh with a ghost effect applied to it. The Mesh gets its own EdgeMaterial for ghosting, and
 has its {{#crossLink "Mesh/ghost:property"}}{{/crossLink}} property set ````true```` to activate the effect.

 <a href="../../examples/#effects_ghost"><img src="../../assets/images/screenshots/HighlightMaterial/teapot.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry({
        edgeThreshold: 1
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    edgeMaterial: new xeogl.EdgeMaterial({
        edges: true,
        edgeColor: [0.2, 1.0, 0.2],
        edgeAlpha: 1.0,
        edgeWidth: 2,
        vertices: true,
        vertexColor: [0.6, 1.0, 0.6],
        vertexAlpha: 1.0,
        vertexSize: 8,
        fill: true,
        fillColor: [0, 0, 0],
        fillAlpha: 0.7
    }),
    ghost: true
 });
 ````

 Note the **edgeThreshold** configuration on the {{#crossLink "Geometry"}}{{/crossLink}} we've created for our
 Mesh. Our EdgeMaterial is configured to draw a wireframe representation of the Geometry, which will have inner edges (ie. edges between
 adjacent co-planar triangles) removed for visual clarity. The ````edgeThreshold```` configuration indicates
 that, for this particular Geometry, an inner edge is one where the angle between the surface normals of adjacent triangles is not
 greater than ````5```` degrees. That's set to ````2```` by default, but we can override it to tweak the effect as needed for particular Geometries.

 Here's the example again, this time using the Scene's global EdgeMaterial by default. We'll also modify that EdgeMaterial
 to customize the effect.

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry({
        edgeThreshold: 5
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    ghost: true
 });

 var edgeMaterial = mesh.scene.edgeMaterial;

 edgeMaterial.edges = true;
 edgeMaterial.edgeColor = [0.2, 1.0, 0.2];
 edgeMaterial.edgeAlpha = 1.0;
 edgeMaterial.edgeWidth = 2;
 ````

 ### Highlighting

 In the next example, we'll use a ghosting in conjunction with highlighting, to emphasise a couple of objects within
 a gearbox {{#crossLink "Model"}}{{/crossLink}}. We'll load the Model from glTF, then ghost all of its Meshes except for two gears, which we'll highlight instead. The ghosted
 Meshes have the Scene's global ghosting EdgeMaterial, which we'll modify. The  highlighted Meshes also have the Scene's global highlighting EdgeMaterial, which we'll modify as well.

 <a href="../../examples/#effects_demo_gearbox"><img src="../../assets/images/screenshots/HighlightMaterial/gearbox.png"></img></a>

 ````javascript
 var model = new xeogl.GLTFModel({
     src: "models/gltf/gearbox_conical/scene.gltf",
     edgeThreshold: 10
 });

 model.on("loaded", function() {

    model.meshes["gearbox#77.0"].highlight = true;
    model.meshes["gearbox#79.0"].highlight = true;

    var edgeMaterial = model.scene.edgeMaterial;

    edgeMaterial.edgeColor = [0.4, 0.4, 1.6];
    edgeMaterial.edgeAlpha = 0.8;
    edgeMaterial.edgeWidth = 3;

    var highlightMaterial = model.scene.highlightMaterial;

    highlightMaterial.color = [1.0, 1.0, 1.0];
    highlightMaterial.alpha = 1.0;
 });
 ````

 ## Presets

 For convenience, an EdgeMaterial provides several preset configurations that you can set it to, which are provided in
 {{#crossLink "EdgeMaterial/presets:property"}}xeogl.EdgeMaterial.presets{{/crossLink}}:

 ````javascript
 var presets = xeogl.EdgeMaterial.presets;
 ````

 The presets look something like this:

 ````json
 {
        "default": {
            edgeColor: [0.2, 0.2, 0.2],
            edgeAlpha: 1.0,
            edgeWidth: 1
        },

         "sepia": {
            edgeColor: [0.45, 0.45, 0.41],
            edgeAlpha: 1.0,
            edgeWidth: 1
        },

        //...
 }
 ````

 Let's switch the Scene's global default  EdgeMaterial over to the "sepia" preset used in <a href="/examples/#effects_demo_adam">Example 4: Ghost effect for CAD</a>.

 ````javascript
 scene.edgeMaterial.preset = "sepia";
 ````

 You can also just create an EdgeMaterial from a preset:

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry({
        edgeThreshold: 5
    }),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    edgeMaterial: new xeogl.EdgeMaterial({
        preset: "sepia"
    });
    ghost: true
 });
 ````

 Note that applying a preset just sets the EdgeMaterial's property values, which you are then free to modify afterwards.

 @class EdgeMaterial
 @module xeogl
 @submodule materials
 @constructor
 @extends Material
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} The EdgeMaterial configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta=null] {String:Object} Metadata to attach to this EdgeMaterial.

 @param [cfg.edgeColor=[0.2,0.2,0.2]] {Array of Number}  RGB color of ghost edges.
 @param [cfg.edgeAlpha=1.0] {Number} Transparency of ghost edges. A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
 @param [cfg.edgeWidth=1] {Number}  Width of ghost edges, in pixels.

 @param [cfg.preset] {String} Selects a preset EdgeMaterial configuration - see {{#crossLink "EdgeMaterial/preset:method"}}EdgeMaterial#preset(){{/crossLink}}.
 */

import {Material} from './material.js';
import {State} from '../renderer/state.js';
import {componentClasses} from "./../componentClasses.js";

const PRESETS = {
    "default": {
        edgeColor: [0.0, 0.0, 0.0],
        edgeAlpha: 1.0,
        edgeWidth: 1
    },
    "defaultWhiteBG": {
        edgeColor: [0.2, 0.2, 0.2],
        edgeAlpha: 1.0,
        edgeWidth: 1
    },
    "defaultLightBG": {
        edgeColor: [0.2, 0.2, 0.2],
        edgeAlpha: 1.0,
        edgeWidth: 1
    },
    "defaultDarkBG": {
        edgeColor: [0.5, 0.5, 0.5],
        edgeAlpha: 1.0,
        edgeWidth: 1
    }
};


const type = "xeogl.EdgeMaterial";

class EdgeMaterial extends Material {

    /**
     Available EdgeMaterial presets.

     @property presets
     @type {Object}
     @static
     */
    static get presets() {
        return PRESETS;
    };

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

    init(cfg) {

        super.init(cfg);

        this._state = new State({
            type: "EdgeMaterial",
            edgeColor: null,
            edgeAlpha: null,
            edgeWidth: null
        });

        this._preset = "default";

        if (cfg.preset) { // Apply preset then override with configs where provided
            this.preset = cfg.preset;
            if (cfg.edgeColor) {
                this.edgeColor = cfg.edgeColor;
            }
            if (cfg.edgeAlpha !== undefined) {
                this.edgeAlpha = cfg.edgeAlpha;
            }
            if (cfg.edgeWidth !== undefined) {
                this.edgeWidth = cfg.edgeWidth;
            }
        } else {
            this.edgeColor = cfg.edgeColor;
            this.edgeAlpha = cfg.edgeAlpha;
            this.edgeWidth = cfg.edgeWidth;
        }
    }


    /**
     RGB color of ghost edges.

     @property edgeColor
     @default [0.2, 0.2, 0.2]
     @type Float32Array
     */
    set edgeColor(value) {
        let edgeColor = this._state.edgeColor;
        if (!edgeColor) {
            edgeColor = this._state.edgeColor = new Float32Array(3);
        } else if (value && edgeColor[0] === value[0] && edgeColor[1] === value[1] && edgeColor[2] === value[2]) {
            return;
        }
        if (value) {
            edgeColor[0] = value[0];
            edgeColor[1] = value[1];
            edgeColor[2] = value[2];
        } else {
            edgeColor[0] = 0.2;
            edgeColor[1] = 0.2;
            edgeColor[2] = 0.2;
        }
        this._renderer.imageDirty();
    }

    get edgeColor() {
        return this._state.edgeColor;
    }

    /**
     Transparency of ghost edges.

     A value of 0.0 indicates fully transparent, 1.0 is fully opaque.

     @property edgeAlpha
     @default 1.0
     @type Number
     */
    set edgeAlpha(value) {
        value = (value !== undefined && value !== null) ? value : 1.0;
        if (this._state.edgeAlpha === value) {
            return;
        }
        this._state.edgeAlpha = value;
        this._renderer.imageDirty();
    }

    get edgeAlpha() {
        return this._state.edgeAlpha;
    }

    /**
     Width of ghost edges, in pixels.

     @property edgeWidth
     @default 1.0
     @type Number
     */
    set edgeWidth(value) {
        this._state.edgeWidth = value || 1.0;
        this._renderer.imageDirty();
    }

    get edgeWidth() {
        return this._state.edgeWidth;
    }

    /**
     Selects a preset EdgeMaterial configuration.

     Available presets are:

     * "default" - grey wireframe with translucent fill, for light backgrounds.
     * "defaultLightBG" - grey wireframe with grey translucent fill, for light backgrounds.
     * "defaultDarkBG" - grey wireframe with grey translucent fill, for dark backgrounds.
     * "vectorscope" - green wireframe with glowing vertices and black translucent fill.
     * "battlezone" - green wireframe with black opaque fill, giving a solid hidden-lines-removed effect.
     * "sepia" - light red-grey wireframe with light sepia translucent fill - easy on the eyes.
     * "gamegrid" - light blue wireframe with dark blue translucent fill - reminiscent of Tron.
     * "yellowHighlight" - light yellow translucent fill - highlights while allowing underlying detail to show through.

     @property preset
     @default "default"
     @type String
     */
    set preset(value) {
        value = value || "default";
        if (this._preset === value) {
            return;
        }
        const preset = PRESETS[value];
        if (!preset) {
            this.error("unsupported preset: '" + value + "' - supported values are " + Object.keys(PRESETS).join(", "));
            return;
        }
        this.edgeColor = preset.edgeColor;
        this.edgeAlpha = preset.edgeAlpha;
        this.edgeWidth = preset.edgeWidth;
        this._preset = value;
    }

    get preset() {
        return this._preset;
    }

    destroy() {
        super.destroy();
        this._state.destroy();
    }
}

componentClasses[type] = EdgeMaterial;

export {EdgeMaterial};