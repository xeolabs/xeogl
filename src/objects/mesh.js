/**
 A **Mesh** is an {{#crossLink "Object"}}{{/crossLink}} that represents a drawable 3D primitive.

 ## Overview

 * A Mesh represents a WebGL draw call.
 * Each Mesh has six components: {{#crossLink "Geometry"}}{{/crossLink}} for shape, {{#crossLink "Material"}}{{/crossLink}}
 for normal rendered appearance, three {{#crossLink "EmphasisMaterial"}}EmphasisMaterials{{/crossLink}} for ghosted, highlighted and selected effects,
 and {{#crossLink "EdgeMaterial"}}{{/crossLink}} for rendering emphasised edges.
 * By default, Meshes in the same Scene share the same global scene flyweight instances of those components among themselves. The default
 component instances are provided by the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Scene/geometry:property"}}{{/crossLink}},
 {{#crossLink "Scene/material:property"}}{{/crossLink}}, {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}}, {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}},
 {{#crossLink "Scene/selectedMaterial:property"}}{{/crossLink}} and {{#crossLink "Scene/edgeMaterial:property"}}{{/crossLink}} properties.
 * A Mesh with all defaults is a white unit-sized box centered at the World-space origin.
 * Customize your Meshes by attaching your own instances of those component types, to override the defaults as needed.
 * For best performance, reuse as many of the same component instances among your Meshes as possible.
 * Use {{#crossLink "Group"}}Group{{/crossLink}} components to organize Meshes into hierarchies, if required.

 This page covers functionality specific to the Mesh component, while {{#crossLink "Object"}}{{/crossLink}} covers generic
 functionality inherited from the base class.

 ## Usage

 * [Creating a Mesh](#creating-a-mesh)
 * [Creating hierarchies](#creating-hierarchies)
 * [Controlling visibility](#controlling-visibility)
 * [Controlling clipping](#controlling-clipping)
 * [Controlling rendering order](#controlling-rendering-order)
 * [Geometry](#geometry)
 * [Material](#material)
 * [Transforming](#transforming)
 * [Ghosting](#ghosting)
 * [Highlighting](#highlighting)
 * [Outlining](#outlining)
 * [Local-space boundary](#local-space-boundary)
 * [World-space boundary](#world-space-boundary)
 * [Skyboxing](#skyboxing)
 * [Billboarding](#billboarding)
 * [Shadows](#shadows) TODO

 ### Creating a Mesh

 Creating a minimal Mesh that has all the default components:

 <img src="../../assets/images/screenshots/Scene/defaultMesh.png"></img>

 ````javascript
 var mesh = new xeogl.Mesh(); // A white unit-sized box centered at the World-space origin
 ````

 Since our Mesh has all the default components, we can get those off either the Mesh or its Scene:

 ````javascript
 mesh.material.diffuse = [1.0, 0.0, 0.0];           // This is the same Material component...
 mesh.scene.material.diffuse  = [1.0, 0.0, 0.0];    // ...as this one.
 ````

 In practice, we would provide (at least) our own Geometry and Material for the Mesh:

 <a href="../../examples/#geometry_primitives_teapot"><img src="../../assets/images/screenshots/Scene/teapot.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TeapotGeometry(),
     material: new xeogl.MetallicMaterial({
         baseColor: [1.0, 1.0, 1.0]
     })
 });
 ````

 ### Creating hierarchies

 In xeogl we represent an object hierarchy as a tree of {{#crossLink "Object"}}Objects{{/crossLink}} in which
 the leaf Objects are Meshes. In an Object tree, an operation on an Object is recursively applied to sub-Objects, down
 to the Meshes at the leaves.

 See {{#crossLink "Object"}}{{/crossLink}} for information on organizing Meshes hierarchically.

 ### Controlling visibility

 Show or hide a Mesh by setting its {{#crossLink "Mesh/visible:property"}}{{/crossLink}} property:

 ````javascript
 mesh.visible = false; // Hide
 mesh.visible = true; // Show (default)
 ````

 This property is inherited from {{#crossLink "Object/visible:property"}}Object{{/crossLink}}.

 ### Controlling clipping

 By default, a Mesh will be clipped by the
 Scene's {{#crossLink "Scene/clips:property"}}clipping planes{{/crossLink}}.

 Make a Mesh unclippable by setting its {{#crossLink "Mesh/clippable:property"}}{{/crossLink}} property false:

 ````javascript
 mesh.clippable = false; // Default is true
 ````

 ### Controlling rendering order

 Control the order in which a Mesh is rendered relative to others by setting its {{#crossLink "Mesh/layer:property"}}{{/crossLink}}
 property. You would normally do this when you need to ensure that transparent Meshes are rendered in back-to-front order for correct alpha blending.

 Assigning our Mesh to layer 0 (all Meshes are in layer 0 by default):

 ````javascript
 mesh.layer = 0;
 ````

 Create another Mesh in a higher layer, that will get rendered after layer 0:

 ````javascript
 var mesh2 = new xeogl.Mesh({
     geometry: new xeogl.Sphere(),
     layer: 1
 });
 ````

 ### Geometry

 A Mesh has a {{#crossLink "Geometry"}}{{/crossLink}} which describes its shape. When we don't provide a Geometry,
 a Mesh will automatically get its {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Scene/geometry:property"}}{{/crossLink}} by default.

 Creating a Mesh with its own Geometry:

 ````javascript
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TeapotGeometry()
 });
 ````

 Getting geometry arrays:

 ````javascript
 ver geometry = mesh.geometry;

 var primitive = geometry.primitive;        // Default is "triangles"
 var positions = geometry.positions;        // Local-space vertex positions
 var normals = geometry.normals;            // Local-space vertex Normals
 var uv = geometry.uv;                      // UV coordinates
 var indices = mesh.geometry.indices;     // Vertex indices for pimitives
 ````

 The Mesh also has a convenience property which provides the vertex positions in World-space, ie. after they have been
 transformed by the Mesh's {{#crossLink "Object/worldMatrix:property"}}{{/crossLink}}:

 ````javascript
 // These are internally generated on-demand and cached. To free the cached
 // vertex World positions when you're done with them, set this property to null or undefined
 var worldPositions = mesh.worldPositions;
 ````

 ### Material

 A Mesh has a {{#crossLink "Material"}}{{/crossLink}}, which describes its appearance. When we don't provide it with
 a Material, it will automatically get its {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Scene/material:property"}}{{/crossLink}} by default.

 Creating a Mesh with its own custom {{#crossLink "Geometry"}}{{/crossLink}} and {{#crossLink "MetallicMaterial"}}{{/crossLink}}:

 ````javascript
 var mesh = new xeogl.Mesh({
     geometry: new xeogl.TeapotGeometry(),
     material: new xeogl.MetallicMaterial({
         baseColor: [0.0, 0.0, 1.0],
         metallic: 1.0,
         roughness: 1.0,
         emissive: [0.0, 0.0, 0.0],
         alpha: 1.0
     })
 });
 ````

 Animating the {{#crossLink "MetallicMaterial"}}{{/crossLink}}'s diffuse color - making the Mesh rapidly pulse red:

 ````javascript
 mesh.scene.on("tick", function(e) {
    var t = e.time - e.startTime; // Millisecs
    mesh.material.baseColor = [0.5 + Math.sin(t * 0.01), 0.0, 0.0]; // RGB
 });
 ````

 ### Transforming

 A Mesh can be positioned within the World-space coordinate system.

 See {{#crossLink "Object"}}{{/crossLink}}.

 ### Ghosting

 Ghost a Mesh by setting its {{#crossLink "Mesh/ghosted:property"}}{{/crossLink}} property true. The Mesh's
 {{#crossLink "Mesh/ghostMaterial:property"}}{{/crossLink}} property holds the {{#crossLink "EmphasisMaterial"}}{{/crossLink}}
 that controls its appearance while ghosted.

 When we don't provide it with a EmphasisMaterial, the Mesh will automatically get its Scene's {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a ghosted Mesh with its own EmphasisMaterial for ghosted appearance:

 <a href="../../examples/#effects_ghost"><img src="../../assets/images/screenshots/EmphasisMaterial/teapot.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    ghostMaterial: new xeogl.EmphasisMaterial({
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
    ghosted: true
 });
 ````

 #### Examples

 * [Ghosted teapot](../../examples/#effects_demo_hoverToGhost)

 ### Highlighting

 Highlight a Mesh by setting its {{#crossLink "Mesh/highlighted:property"}}{{/crossLink}} property true. The Mesh's
 {{#crossLink "Mesh/highlightMaterial:property"}}{{/crossLink}} property holds the {{#crossLink "EmphasisMaterial"}}{{/crossLink}}
 that controls its appearance while highlighted.

 When we don't provide it with a EmphasisMaterial for highlighting, it will automatically get its Scene's {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a highlighted Mesh with its own EmphasisMaterial for highlighted appearance:

 <a href="../../examples/#effects_highlight"><img src="../../assets/images/screenshots/EmphasisMaterial/teapotHighlighted.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    highlightMaterial: new xeogl.EmphasisMaterial({
        color: [1.0, 1.0, 0.0],
        alpha: 0.6
    }),
    highlighted: true
 });
 ````

 #### Examples

 * [Ghost and highlight effects](../../examples/#effects_demo_hoverToHighlight)

 ### Selecting

 Make a Mesh appear selected by setting its {{#crossLink "Mesh/selected:property"}}{{/crossLink}} property true. The Mesh's
 {{#crossLink "Mesh/selectedMaterial:property"}}{{/crossLink}} property holds the {{#crossLink "EmphasisMaterial"}}{{/crossLink}}
 that controls its appearance while selected.

 When we don't provide it with a EmphasisMaterial for selecting, it will automatically get its Scene's {{#crossLink "Scene/selectMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a selected Mesh with its own EmphasisMaterial for selection appearance:

 <a href="../../examples/#effects_select"><img src="../../assets/images/screenshots/EmphasisMaterial/teapotSelected.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    selectMaterial: new xeogl.EmphasisMaterial({
        color: [1.0, 1.0, 0.0],
        alpha: 0.6
    }),
    selected: true
 });
 ````

 #### Examples

 * [Ghost and select effects](../../examples/#effects_demo_gearbox)


 ### Edges

 Emphasise a Mesh's edges by setting its {{#crossLink "Mesh/edges:property"}}{{/crossLink}} property true. The Mesh's
 {{#crossLink "Mesh/edgeMaterial:property"}}{{/crossLink}} property holds the {{#crossLink "EdgeMaterial"}}{{/crossLink}}
 that controls the appearance of the edges while they are emphasized.

 When we don't provide it with an EdgeMaterial, the Mesh will automatically get its Scene's {{#crossLink "Scene/edgeMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a edges Mesh with its own EdgeMaterial for edges appearance:

 <a href="../../examples/#effects_ghost"><img src="../../assets/images/screenshots/EdgeMaterial/teapot.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    edgeMaterial: new xeogl.EdgeMaterial({
        edgeColor: [0.2, 1.0, 0.2],
        edgeAlpha: 1.0,
        edgeWidth: 2
    }),
    edges: true
 });
 ````

 ### Outlining

 Outline a Mesh by setting its {{#crossLink "Mesh/outlined:property"}}{{/crossLink}} property true. The Mesh's
 {{#crossLink "Mesh/outlineMaterial:property"}}{{/crossLink}} property holds the {{#crossLink "OutlineMaterial"}}{{/crossLink}}
 that controls its appearance while outlined.

 When we don't provide it with an {{#crossLink "OutlineMaterial"}}{{/crossLink}}, it will automatically get its Scene's
 {{#crossLink "Scene/outlineMaterial:property"}}{{/crossLink}} by default.

 In the example below, we'll create a outlined Mesh with its own {{#crossLink "OutlineMaterial"}}{{/crossLink}}:

 <a href="../../examples/#effects_outline"><img src="../../assets/images/screenshots/OutlineMaterial/teapot.png"></img></a>

 ````javascript
 var mesh = new xeogl.Mesh({
    geometry: new xeogl.TeapotGeometry(),
    material: new xeogl.PhongMaterial({
        diffuse: [0.2, 0.2, 1.0]
    }),
    outlineMaterial: new xeogl.OutlineMaterial({
        color: [1.0, 1.0, 0.0],
        alpha: 0.6,
        width: 5
    }),
    outlined: true
 });
 ````

 ### Local-space boundary

 We can query a Mesh's Local-space boundary at any time, getting it as either an axis-aligned bounding box (AABB) or
 an object-aligned bounding box (OBB).

 The Local-space AABB and OBB belong to the Mesh's {{#crossLink "Geometry"}}{{/crossLink}}.

 Getting the Local-space AABB:

 ````
 var aabb = mesh.geometry.aabb; // [xmin, ymin, zmin, xmax, ymax, zmax]
 ````

 Getting the Local-space OBB:

 ```` javascript
 var obb = mesh.geometry.obb; // Flat array containing eight 3D corner vertices of a box
 ````

 #### Examples

 * [Local-space Geometry AABB](../../examples/#boundaries_geometry_aabb)
 * [Local-space Geometry OBB](../../examples/#boundaries_geometry_obb)

 ### World-space boundary

 We can query a Mesh's World-space boundary at any time, getting it as an axis-aligned bounding box (AABB).

 The World-space AABB is the boundary of the Mesh's {{#crossLink "Geometry"}}{{/crossLink}} after transformation by the
 Mesh's {{#crossLink "Object/worldMatrix:property"}}{{/crossLink}} and the {{#crossLink "Camera"}}{{/crossLink}}'s
 {{#crossLink "Camera/matrix:property"}}{{/crossLink}}.

 Getting the World-space boundary AABB:

 ````javascript
 var aabb = mesh.aabb; // [xmin, ymin, zmin, xmax, ymax, zmax]
 ````

 Subscribing to updates of the World-space boundary, which occur after each update to the
 Mesh's {{#crossLink "Object/worldMatrix:property"}}{{/crossLink}} or the {{#crossLink "Camera"}}{{/crossLink}}:

 ````javascript
 mesh.on("boundary", function() {
     var aabb = mesh.aabb;
     var obb = mesh.obb;
 });
 ````

 The {{#crossLink "Scene"}}{{/crossLink}} also has a {{#crossLink "Scene/getAABB:method"}}Scene#getAABB(){{/crossLink}}, which returns
 the collective World-space AABBs of the {{#crossLink "Object"}}Objects{{/crossLink}} with the given IDs:

 ````JavaScript
 var scene = mesh.scene;

 scene.getAABB(); // Gets collective boundary of all meshes in the scene
 scene.getAABB("saw"); // Gets collective boundary of all meshes in a model
 scene.getAABB(["saw", "gearbox"]); // Gets collective boundary of all meshes in two models
 scene.getAABB("saw#0.1"); // Get boundary of a mesh
 scene.getAABB(["saw#0.1", "saw#0.2"]); // Get collective boundary of two meshes
 ````

 #### Excluding from boundary calculations

 The {{#crossLink "Scene/aabb:property"}}Scene aabb{{/crossLink}}
 and parent {{#crossLink "Object/aabb:property"}}Object{{/crossLink}}'s {{#crossLink "Object/aabb:property"}}aabb{{/crossLink}}
 properties provide AABBs that dynamically include the AABB of all contained Meshes, except those Meshes that have
 their {{#crossLink "Mesh/collidable:property"}}collidable{{/crossLink}} properties set ````false````.

 Toggle that inclusion like so:

 ````javascript
 mesh.collidable = false; // Exclude mesh from calculation of its Scene/Model boundary
 mesh.collidable = true; // Include mesh in calculation of its Scene/Model boundary
 ````
 Setting this false is useful when a Mesh represents some element, such as a control gizmo, that you don't want to
 contribute to the  {{#crossLink "Scene"}}Scene{{/crossLink}} or parent {{#crossLink "Object"}}{{/crossLink}}'s AABB. It
 also helps performance, since boundaries will not need dynamically re-calculated whenever the Mesh's boundary changes after
 a {{#crossLink "Object/worldMatrix:property"}}{{/crossLink}} or {{#crossLink "Camera"}}{{/crossLink}} update.

 #### Examples

 * [World-space Mesh AABB](../../examples/#boundaries_mesh_aabb)
 * [World-space Mesh OBB](../../examples/#boundaries_mesh_obb)

 ### Skyboxing

 A Mesh has a {{#crossLink "Mesh/stationary:property"}}{{/crossLink}} property
 that will cause it to never translate with respect to the viewpoint.

 This is useful for using Meshes as skyboxes, like this:

 ````javascript
 new xeogl.Mesh({

     geometry: new xeogl.BoxGeometry({
         xSize: 1000,
         ySize: 1000,
         zSize: 1000
     }),

     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
         })
     }),

     stationary: true // Locks position with respect to viewpoint
 });
 ````

 #### Examples

 * [Skybox component](../../examples/#skyboxes_skybox)
 * [Custom skybox](../../examples/#skyboxes_skybox_custom)

 ### Billboarding

 A Mesh has a {{#crossLink "Mesh/billboard:property"}}{{/crossLink}} property
 that can make it behave as a billboard.

 Two billboard types are supported:

 * **Spherical** billboards are free to rotate their Meshes in any direction and always face the {{#crossLink "Camera"}}{{/crossLink}} perfectly.
 * **Cylindrical** billboards rotate their Meshes towards the {{#crossLink "Camera"}}{{/crossLink}}, but only about the Y-axis.

 Note that scaling transformations to have no effect on billboarded Meshes.

 The example below shows a box that remains rotated directly towards the viewpoint, using spherical billboarding:

 ````javascript
 new xeogl.Mesh({

     geometry: new xeogl.BoxGeometry(),

     material: new xeogl.PhongMaterial({
         diffuseMap: new xeogl.Texture({
            src: "textures/diffuse/uvGrid2.jpg"
         })
     }),

     billboard: "spherical" // Or "cylindrical"
 });
 ````

 #### Examples

 * [Spherical billboards](../../examples/#billboards_spherical)
 * [Cylindrical billboards](../../examples/#billboards_cylindrical)
 * [Clouds using billboards](../../examples/#billboards_spherical_clouds)


 ### Shadows

 [Work-in-progress]

 @class Mesh
 @module xeogl
 @submodule objects
 @constructor
 @param [owner] {Component} Owner component. When destroyed, the owner will destroy this component as well. Creates this component within the default {{#crossLink "Scene"}}{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Mesh.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.parent] {Object} The parent.
 @param [cfg.position=[0,0,0]] {Float32Array} The Mesh's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The Mesh's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The Mesh's local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The Mesh's local modelling transform matrix. Overrides the position, scale and rotation parameters.

 @param [cfg.geometry] {Geometry} Defines shape. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.material] {Material} Defines normal rendered appearance. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.outlineMaterial] {OutlineMaterial} Defines appearance when outlined. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/outlineMaterial:property"}}outlineMaterial{{/crossLink}}.
 @param [cfg.ghostMaterial] Defines appearance when ghosted. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/ghostMaterial:property"}}ghostMaterial{{/crossLink}}.
 @param [cfg.highlightMaterial] Defines appearance when highlighted. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/highlightMaterial:property"}}highlightMaterial{{/crossLink}}.
 @param [cfg.selectedMaterial] Defines appearance when selected. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Mesh. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/selectedMaterial:property"}}selectedMaterial{{/crossLink}}.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array} RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.layer=0] {Number} Indicates this Mesh's rendering priority, relative to other Meshes. Typically used for transparency sorting,
 @param [cfg.stationary=false] {Boolean} Disables the effect of {{#crossLink "Camera"}}{{/crossLink}} translations for this Mesh. This is useful for making skyboxes.
 @param [cfg.billboard="none"] {String} Specifies the billboarding behaviour for this Mesh. Options are "none", "spherical" and "cylindrical".

 @param [cfg.visible=true] {Boolean}        Indicates if this Mesh is visible. Mesh is only rendered when visible and not culled.
 @param [cfg.culled=false] {Boolean}        Indicates if this Mesh is culled from view. Mesh is only rendered when visible and not culled.
 @param [cfg.pickable=true] {Boolean}       Indicates if this Mesh is pickable. When false, the Mesh will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}} method, and picking will happen as "through" the Mesh, to attempt to pick whatever lies on the other side of it.
 @param [cfg.clippable=true] {Boolean}      Indicates if this Mesh is clippable by {{#crossLink "Clips"}}{{/crossLink}}. When false, Mesh will not be affected by the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.collidable=true] {Boolean}     Whether this Mesh is included in boundary calculations. When false, the bounding boxes of the containing {{#crossLink "Scene"}}{{/crossLink}} and parent {{#crossLink "Object"}}{{/crossLink}}, {{#crossLink "Group"}}{{/crossLink}} or {{#crossLink "Model"}}{{/crossLink}} will not be calculated to enclose this Mesh.
 @param [cfg.castShadow=true] {Boolean}     Whether this Mesh casts shadows.
 @param [cfg.receiveShadow=true] {Boolean}  Whether this Mesh receives shadows.
 @param [cfg.outlined=false] {Boolean}      Whether an outline is rendered around this mesh.
 @param [cfg.ghosted=false] {Boolean}       Whether this Mesh is rendered with a ghosted appearance.
 @param [cfg.highlighted=false] {Boolean}   Whether this Mesh is rendered with a highlighted appearance.
 @param [cfg.selected=false] {Boolean}      Whether this Mesh is rendered with a selected appearance.
 @param [cfg.aabbVisible=false] {Boolean}   Whether this Mesh's World-space axis-aligned bounding box (AABB) is visible.
 @param [cfg.obbVisible=false] {Boolean}    Whether this Mesh's World-space oriented bounding box (OBB) is visible.

 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number} Opacity factor, multiplies by the rendered fragment alpha.

 @param [cfg.loading=false] {Boolean} Flag which indicates that this Mesh is freshly loaded.

 @extends Object
 */

/**
 Fired when this Mesh is picked via a call to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

 The event parameters will be the hit result returned by the {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}} method.
 @event picked
 */
import {math} from '../math/math.js';
import {xeoglObject} from './object.js';
import {State} from '../renderer/state.js';
import {DrawRenderer} from "../renderer/draw/drawRenderer.js";
import {EmphasisFillRenderer} from "../renderer/emphasis/emphasisFillRenderer.js";
import {EmphasisEdgesRenderer} from "../renderer/emphasis/emphasisEdgesRenderer.js";
import {EmphasisVerticesRenderer} from "../renderer/emphasis/emphasisVerticesRenderer.js";
import {ShadowRenderer} from "../renderer/shadow/shadowRenderer.js";
import {OutlineRenderer} from "../renderer/outline/outlineRenderer.js";
import {PickMeshRenderer} from "../renderer/pick/pickMeshRenderer.js";
import {PickVertexRenderer} from "../renderer/pick/pickVertexRenderer.js";
import {PickTriangleRenderer} from "../renderer/pick/pickTriangleRenderer.js";
import {componentClasses} from "./../componentClasses.js";

const obb = math.OBB3();

const type = "xeogl.Mesh";

class Mesh extends xeoglObject {

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

    static _compareState(a, b) {
        return (a._state.layer - b._state.layer)
            || (a._drawRenderer.id - b._drawRenderer.id) // Program state
            || (a._material._state.id - b._material._state.id) // Material state
            || (a._vertexBufs.id - b._vertexBufs.id)  // SHared vertex bufs
            || (a._geometry._state.id - b._geometry._state.id); // Geometry state
    }

    init(cfg) {

        this._state = new State({ // NOTE: Renderer gets modeling and normal matrices from xeogl.Object#matrix and xeogl.Object.#normalMatrix
            visible: true,
            culled: false,
            pickable: null,
            clippable: null,
            colorize: null,
            collidable: null,
            castShadow: null,
            receiveShadow: null,
            outlined: null,
            ghosted: false,
            highlighted: false,
            selected: false,
            edges: false,
            layer: null,
            billboard: this._checkBillboard(cfg.billboard),
            stationary: !!cfg.stationary,
            hash: ""
        });

        this._drawRenderer = null;
        this._shadowRenderer = null;
        this._emphasisFillRenderer = null;
        this._emphasisEdgesRenderer = null;
        this._emphasisVerticesRenderer = null;
        this._pickMeshRenderer = null;
        this._pickTriangleRenderer = null;

        this._worldPositions = null;
        this._worldPositionsDirty = true;
        this._geometry = cfg.geometry ? this._checkComponent("xeogl.Geometry", cfg.geometry) : this.scene.geometry;
        this._vertexBufs = this._geometry._getVertexBufs();
        this._material = cfg.material ? this._checkComponent("xeogl.Material", cfg.material) : this.scene.material;
        this._ghostMaterial = cfg.ghostMaterial ? this._checkComponent("xeogl.EmphasisMaterial", cfg.ghostMaterial) : this.scene.ghostMaterial;
        this._outlineMaterial = cfg.outlineMaterial ? this._checkComponent("xeogl.EmphasisMaterial", cfg.outlineMaterial) : this.scene.outlineMaterial;
        this._highlightMaterial = cfg.highlightMaterial ? this._checkComponent("xeogl.EmphasisMaterial", cfg.highlightMaterial) : this.scene.highlightMaterial;
        this._selectedMaterial = cfg.selectedMaterial ? this._checkComponent("xeogl.EmphasisMaterial", cfg.selectedMaterial) : this.scene.selectedMaterial;
        this._edgeMaterial = cfg.edgeMaterial ? this._checkComponent("xeogl.EdgeMaterial", cfg.edgeMaterial) : this.scene.edgeMaterial;

        this._compile();

        super.init(cfg); // Call xeogl.Object._init()

        this.scene._meshCreated(this);
    }

    _checkBillboard(value) {
        value = value || "none";
        if (value !== "spherical" && value !== "cylindrical" && value !== "none") {
            this.error("Unsupported value for 'billboard': " + value + " - accepted values are " +
                "'spherical', 'cylindrical' and 'none' - defaulting to 'none'.");
            value = "none";
        }
        return value;
    }

    _compile() {
        this._putRenderers();
        this._makeHash();
        this._drawRenderer = DrawRenderer.get(this);
        //this._shadowRenderer = ShadowRenderer.get(this);
        this._emphasisFillRenderer = EmphasisFillRenderer.get(this);
        this._emphasisEdgesRenderer = EmphasisEdgesRenderer.get(this);
        this._emphasisVerticesRenderer = EmphasisVerticesRenderer.get(this);
        this._pickMeshRenderer = PickMeshRenderer.get(this);

        this._renderer.meshListDirty();
    }

    _webglContextRestored() {
        if (this._drawRenderer) {
            this._drawRenderer.webglContextRestored();
        }
        if (this._shadowRenderer) {
            this._shadowRenderer.webglContextRestored();
        }
        if (this._emphasisFillRenderer) {
            this._emphasisFillRenderer.webglContextRestored();
        }
        if (this._emphasisEdgesRenderer) {
            this._emphasisEdgesRenderer.webglContextRestored();
        }
        if (this._emphasisVerticesRenderer) {
            this._emphasisVerticesRenderer.webglContextRestored();
        }
        if (this._pickMeshRenderer) {
            this._pickMeshRenderer.webglContextRestored();
        }
        if (this._pickTriangleRenderer) {
            this._pickMeshRenderer.webglContextRestored();
        }
    }

    _makeHash() {
        const hash = [];
        const state = this._state;
        if (state.stationary) {
            hash.push("/s");
        }
        if (state.billboard === "none") {
            hash.push("/n");
        } else if (state.billboard === "spherical") {
            hash.push("/s");
        } else if (state.billboard === "cylindrical") {
            hash.push("/c");
        }
        if (state.receiveShadow) {
            hash.push("/rs");
        }
        hash.push(";");
        this._state.hash = hash.join("");
    }

    _buildMeshAABB(worldMatrix, aabb) { // TODO: factor out into class member
        math.transformOBB3(worldMatrix, this._geometry.obb, obb);
        math.OBB3ToAABB3(obb, aabb);
    }

    _getSceneHash() {
        return (this.scene.gammaInput ? "gi;" : ";") + (this.scene.gammaOutput ? "go" : "");
    }

    //--------------------- Rendering ------------------------------------------------------------------------------

    _draw(frame) {
        if (this._drawRenderer || (this._drawRenderer = DrawRenderer.get(this))) {
            this._drawRenderer.drawMesh(frame, this);
        }
    }

    _drawGhostFill(frame) {
        if (this._emphasisFillRenderer || (this._emphasisFillRenderer = EmphasisFillRenderer.get(this))) {
            this._emphasisFillRenderer.drawMesh(frame, this, 0); // 0 == ghost
        }
    }

    _drawGhostEdges(frame) {
        if (this._emphasisEdgesRenderer || (this._emphasisEdgesRenderer = EmphasisEdgesRenderer.get(this))) {
            this._emphasisEdgesRenderer.drawMesh(frame, this, 0); // 0 == ghost
        }
    }

    _drawGhostVertices(frame) {
        if (this._emphasisVerticesRenderer || (this._emphasisVerticesRenderer = EmphasisVerticesRenderer.get(this))) {
            this._emphasisVerticesRenderer.drawMesh(frame, this, 0); // 0 == ghost
        }
    }

    _drawHighlightFill(frame) {
        if (this._emphasisFillRenderer || (this._emphasisFillRenderer = EmphasisFillRenderer.get(this))) {
            this._emphasisFillRenderer.drawMesh(frame, this, 1); // 1 == highlight
        }
    }

    _drawHighlightEdges(frame) {
        if (this._emphasisEdgesRenderer || (this._emphasisEdgesRenderer = EmphasisEdgesRenderer.get(this))) {
            this._emphasisEdgesRenderer.drawMesh(frame, this, 1); // 1 == highlight
        }
    }

    _drawHighlightVertices(frame) {
        if (this._emphasisVerticesRenderer || (this._emphasisVerticesRenderer = EmphasisVerticesRenderer.get(this))) {
            this._emphasisVerticesRenderer.drawMesh(frame, this, 1); // 1 == highlight
        }
    }

    _drawSelectedFill(frame) {
        if (this._emphasisFillRenderer || (this._emphasisFillRenderer = EmphasisFillRenderer.get(this))) {
            this._emphasisFillRenderer.drawMesh(frame, this, 2); // 2 == selected
        }
    }

    _drawSelectedEdges(frame) {
        if (this._emphasisEdgesRenderer || (this._emphasisEdgesRenderer = EmphasisEdgesRenderer.get(this))) {
            this._emphasisEdgesRenderer.drawMesh(frame, this, 2); // 2 == selected
        }
    }

    _drawSelectedVertices(frame) {
        if (this._emphasisVerticesRenderer || (this._emphasisVerticesRenderer = EmphasisVerticesRenderer.get(this))) {
            this._emphasisVerticesRenderer.drawMesh(frame, this, 2); // 2 == selected
        }
    }

    _drawEdges(frame) {
        if (this._emphasisEdgesRenderer || (this._emphasisEdgesRenderer = EmphasisEdgesRenderer.get(this))) {
            this._emphasisEdgesRenderer.drawMesh(frame, this, 3); // 3 == edges
        }
    }

    _drawShadow(frame, light) {
        // if (this._shadowRenderer || (this._shadowRenderer = ShadowRenderer.get(this))) {
        //     this._shadowRenderer.drawMesh(frame, this, light);
        // }
    }

    _drawOutline(frame) {
        if (this._shadowRenderer || (this._outlineRenderer = OutlineRenderer.get(this))) {
            this._outlineRenderer.drawMesh(frame, this);
        }
    }

    _pickMesh(frame) {
        if (this._pickMeshRenderer || (this._pickMeshRenderer = PickMeshRenderer.get(this))) {
            this._pickMeshRenderer.drawMesh(frame, this);
        }
    }

    _pickTriangle(frame) {
        if (this._pickTriangleRenderer || (this._pickTriangleRenderer = PickTriangleRenderer.get(this))) {
            this._pickTriangleRenderer.drawMesh(frame, this);
        }
    }

    _pickVertex(frame) {
        if (this._pickVertexRenderer || (this._pickVertexRenderer = PickVertexRenderer.get(this))) {
            this._pickVertexRenderer.drawMesh(frame, this);
        }
    }

    _getOutlineRenderer() {
        this._outlineRenderer = OutlineRenderer.get(this);
        if (this._outlineRenderer.errors) {
            this.errors = (this.errors || []).concat(this._outlineRenderer.errors);
            this.error(this._outlineRenderer.errors.join("\n"));
            return false;
        }
        return true;
    }

    _putRenderers() {
        if (this._drawRenderer) {
            this._drawRenderer.put();
            this._drawRenderer = null;
        }
        if (this._shadowRenderer) {
            this._shadowRenderer.put();
            this._shadowRenderer = null;
        }
        if (this._emphasisFillRenderer) {
            this._emphasisFillRenderer.put();
            this._emphasisFillRenderer = null;
        }
        if (this._emphasisEdgesRenderer) {
            this._emphasisEdgesRenderer.put();
            this._emphasisEdgesRenderer = null;
        }
        if (this._emphasisVerticesRenderer) {
            this._emphasisVerticesRenderer.put();
            this._emphasisVerticesRenderer = null;
        }
        if (this._outlineRenderer) {
            this._outlineRenderer.put();
            this._outlineRenderer = null;
        }
        if (this._pickMeshRenderer) {
            this._pickMeshRenderer.put();
            this._pickMeshRenderer = null;
        }
        if (this._pickTriangleRenderer) {
            this._pickTriangleRenderer.put();
            this._pickTriangleRenderer = null;
        }
        if (this._pickVertexRenderer) {
            this._pickVertexRenderer.put();
            this._pickVertexRenderer = null;
        }
    }

    /**
     World-space 3D vertex positions.

     These are internally generated on-demand and cached. To free the cached
     vertex World positions when you're done with them, set this property to null or undefined.

     @property worldPositions
     @type Float32Array
     @final
     */
    get worldPositions() {
        if (this._worldPositionsDirty) {
            const positions = this._geometry.positions;
            if (!this._worldPositions) {
                this._worldPositions = new Float32Array(positions.length);
            }
            math.transformPositions3(this.worldMatrix, positions, this._worldPositions);
            this._worldPositionsDirty = false;
        }
        return this._worldPositions;
    }

    set worldPositions(value) {
        if (value = undefined || value === null) {
            this._worldPositions = null; // Release memory
            this._worldPositionsDirty = true;
        }
    }

    /**
     Defines the shape of this Mesh.

     @property geometry
     @type Geometry
     @final
     */
    get geometry() {
        return this._geometry;
    }

    /**
     Defines appearance when rendering normally, ie. when not ghosted, highlighted or selected.

     @property material
     @type Material
     @final
     */
    get material() {
        return this._material;
    }

    /**
     Defines surface appearance when ghosted.

     @property ghostMaterial
     @type EmphasisMaterial
     @final
     */
    get ghostMaterial() {
        return this._ghostMaterial;
    }

    /**
     Defines surface appearance when highlighted.

     @property highlightMaterial
     @type EmphasisMaterial
     @final
     */
    get highlightMaterial() {
        return this._highlightMaterial;
    }

    /**
     Defines surface appearance when selected.

     @property selectedMaterial
     @type EmphasisMaterial
     */
    get selectedMaterial() {
        return this._selectedMaterial;
    }

    /**
     Defines surface appearance when edges are shown.

     @property edgeMaterial
     @type EdgeMaterial
     */
    get edgeMaterial() {
        return this._edgeMaterial;
    }

    /**
     Defines surface appearance when outlined.

     @property outlineMaterial
     @type OutlineMaterial
     */
    get outlineMaterial() {
        return this._outlineMaterial;
    }

    /**
     Indicates if visible.

     The Mesh is only rendered when {{#crossLink "Mesh/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Mesh/culled:property"}}{{/crossLink}} is false.

     Each visible Mesh is registered in the {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/visibleEntities:property"}}{{/crossLink}} map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property visible
     @default true
     @type Boolean
     */
    set visible(visible) {
        visible = visible !== false;
        this._state.visible = visible;
        if (this._entityType) {
            this.scene._entityVisibilityUpdated(this, visible);
        }
        this._renderer.imageDirty();
        if (this._state.castShadow) {
            this._renderer.shadowsDirty();
        }
    }

    get visible() {
        return this._state.visible;
    }

    /**
     Indicates if ghosted.

     The ghosted appearance is configured by {{#crossLink "Mesh/ghostMaterial:property"}}ghostMaterial{{/crossLink}}.

     Each ghosted Mesh is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/ghostedEntities:property"}}{{/crossLink}} map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property ghosted
     @default false
     @type Boolean
     */
    set ghosted(ghosted) {
        ghosted = !!ghosted;
        if (this._state.ghosted === ghosted) {
            return;
        }
        this._state.ghosted = ghosted;
        if (this._entityType) {
            this.scene._entityGhostedUpdated(this, ghosted);
        }
        this._renderer.imageDirty();
    }

    get ghosted() {
        return this._state.ghosted;
    }

    /**
     Indicates if highlighted.

     The highlight appearance is configured by {{#crossLink "Mesh/highlightMaterial:property"}}highlightMaterial{{/crossLink}}.

     Each highlighted Mesh is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/highlightedEntities:property"}}{{/crossLink}} map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property highlighted
     @default false
     @type Boolean
     */
    set highlighted(highlighted) {
        highlighted = !!highlighted;
        if (highlighted === this._state.highlighted) {
            return;
        }
        this._state.highlighted = highlighted;
        if (this._entityType) {
            this.scene._entityHighlightedUpdated(this, highlighted);
        }
        this._renderer.imageDirty();
    }

    get highlighted() {
        return this._state.highlighted;
    }

    /**
     Indicates if selected.

     The selected appearance is configured by {{#crossLink "Mesh/selectedMaterial:property"}}selectedMaterial{{/crossLink}}.

     Each selected Mesh is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/selectedEntities:property"}}{{/crossLink}} map when its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property selected
     @default false
     @type Boolean
     */
    set selected(selected) {
        selected = !!selected;
        if (selected === this._state.selected) {
            return;
        }
        this._state.selected = selected;
        if (this._entityType) {
            this.scene._entitySelectedUpdated(this, selected);
        }
        this._renderer.imageDirty();
    }

    get selected() {
        return this._state.selected;
    }

    /**
     Indicates if edges are shown.

     The edges appearance is configured by {{#crossLink "Mesh/edgeMaterial:property"}}edgeMaterial{{/crossLink}}.

     @property edges
     @default false
     @type Boolean
     */
    set edges(edges) {
        edges = !!edges;
        if (edges === this._state.edges) {
            return;
        }
        this._state.edges = edges;
        this._renderer.imageDirty();
    }

    get edges() {
        return this._state.edges;
    }

    /**
     Indicates if culled from view.

     The MEsh is only rendered when {{#crossLink "Mesh/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "Mesh/culled:property"}}{{/crossLink}} is false.

     @property culled
     @default false
     @type Boolean
     */
    set culled(value) {
        this._state.culled = !!value;
        this._renderer.imageDirty();
    }

    get culled() {
        return this._state.culled;
    }

    /**
     Indicates if pickable.

     When false, the Mesh will never be picked by calls to the {{#crossLink "Scene/pick:method"}}Scene pick(){{/crossLink}} method, and picking will happen as "through" the Mesh, to attempt to pick whatever lies on the other side of it.

     @property pickable
     @default true
     @type Boolean
     */
    set pickable(value) {
        value = value !== false;
        if (this._state.pickable === value) {
            return;
        }
        this._state.pickable = value;
        // No need to trigger a render;
        // state is only used when picking
    }

    get pickable() {
        return this._state.pickable;
    }

    /**
     Indicates if clippable.

     When false, the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} will have no effect on the Mesh.

     @property clippable
     @default true
     @type Boolean
     */
    set clippable(value) {
        value = value !== false;
        if (this._state.clippable === value) {
            return;
        }
        this._state.clippable = value;
        this._renderer.imageDirty();
        if (this._state.castShadow) {
            this._renderer.shadowsDirty();
        }
    }

    get clippable() {
        return this._state.clippable;
    }

    /**
     Indicates if included in boundary calculations.

     When false, this Mesh will not be included in the bounding boxes provided by parent components (

     @property collidable
     @default true
     @type Boolean
     */
    set collidable(value) {
        value = value !== false;
        if (value === this._state.collidable) {
            return;
        }
        this._state.collidable = value;
    }

    get collidable() {
        return this._state.collidable;
    }

    /**
     Indicates if casting shadows.

     @property castShadow
     @default true
     @type Boolean
     */
    set castShadow(value) {
        value = value !== false;
        if (value === this._state.castShadow) {
            return;
        }
        this._state.castShadow = value;
        this._renderer.shadowsDirty();
    }

    get castShadow() {
        return this._state.castShadow;
    }

    /**
     Indicates if receiving shadows.

     @property receiveShadow
     @default true
     @type Boolean
     */
    set receiveShadow(value) {
        this._state.receiveShadow = false; // Disables shadows for now
        // value = value !== false;
        // if (value === this._state.receiveShadow) {
        //     return;
        // }
        // this._state.receiveShadow = value;
        // this._state.hash = value ? "/mod/rs;" : "/mod;";
        // this.fire("dirty", this); // Now need to (re)compile objectRenderers to include/exclude shadow mapping
    }

    get receiveShadow() {
        return this._state.receiveShadow;
    }

    /**
     Indicates if rendered with an outline.

     The outline appearance is configured by {{#crossLink "Mesh/outlineMaterial:property"}}outlineMaterial{{/crossLink}}.

     @property outlined
     @default false
     @type Boolean
     */
    set outlined(value) {
        value = !!value;
        if (value === this._state.outlined) {
            return;
        }
        this._state.outlined = value;
        this._renderer.imageDirty();
    }

    get outlined() {
        return this._state.outlined;
    }

    /**
     RGB colorize color, multiplies by the rendered fragment colors.

     @property colorize
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set colorize(value) {
        let colorize = this._state.colorize;
        if (!colorize) {
            colorize = this._state.colorize = new Float32Array(4);
            colorize[3] = 1;
        }
        if (value) {
            colorize[0] = value[0];
            colorize[1] = value[1];
            colorize[2] = value[2];
        } else {
            colorize[0] = 1;
            colorize[1] = 1;
            colorize[2] = 1;
        }
        this._renderer.imageDirty();
    }

    get colorize() {
        return this._state.colorize;
    }

    /**
     Opacity factor, multiplies by the rendered fragment alpha.

     This is a factor in range ````[0..1]````.

     @property opacity
     @default 1.0
     @type Number
     */
    set opacity(opacity) {
        let colorize = this._state.colorize;
        if (!colorize) {
            colorize = this._state.colorize = new Float32Array(4);
            colorize[0] = 1;
            colorize[1] = 1;
            colorize[2] = 1;
        }
        colorize[3] = opacity !== null && opacity !== undefined ? opacity : 1.0;
        this._renderer.imageDirty();
    }

    get opacity() {
        return this._state.colorize[3];
    }

    /**
     The rendering order.

     This can be set on multiple transparent Meshes, to make them render in a specific order
     for correct alpha blending.

     @property layer
     @default 0
     @type Number
     */
    set layer(value) {
        // TODO: Only accept rendering layer in range [0...MAX_layer]
        value = value || 0;
        value = Math.round(value);
        if (value === this._state.layer) {
            return;
        }
        this._state.layer = value;
        this._renderer.needStateSort();
    }

    get layer() {
        return this._state.layer;
    }

    /**
     Indicates if the position is stationary.

     When true, will disable the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}}
     translations for this Mesh, while still allowing it to rotate. This is useful for skybox Meshes.

     @property stationary
     @default false
     @type Boolean
     @final
     */
    get stationary() {
        return this._state.stationary;
    }

    /**
     Indicates the billboarding behaviour.

     Options are:

     * **"none"** -  **(default)** - No billboarding.
     * **"spherical"** - Mesh is billboarded to face the viewpoint, rotating both vertically and horizontally.
     * **"cylindrical"** - Mesh is billboarded to face the viewpoint, rotating only about its vertically
     axis. Use this mode for things like trees on a landscape.

     @property billboard
     @default "none"
     @type String
     @final
     */
    get billboard() {
        return this._state.billboard;
    }

    destroy() {
        super.destroy(); // xeogl.Object
        this._putRenderers();
        this._renderer.meshListDirty();
        this.scene._meshDestroyed(this);
        if (this._state.castShadow) {
            this._renderer.shadowsDirty();
        }
    }
}

componentClasses[type] = Mesh;

export {Mesh};