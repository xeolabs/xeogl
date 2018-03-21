/**
 An **Entity** is a 3D object within a {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 * An Entity represents a WebGL draw call.
 * Each Entity has six components: {{#crossLink "Geometry"}}{{/crossLink}}, {{#crossLink "Material"}}{{/crossLink}},
 {{#crossLink "Transform"}}{{/crossLink}}, an {{#crossLink "EmphasisMaterial"}}{{/crossLink}} for ghosting, an {{#crossLink "EmphasisMaterial"}}{{/crossLink}} for highlighting,
 and an {{#crossLink "OutlineMaterial"}}{{/crossLink}} for outlining.
 * By default, Entities in the same Scene share the same "global" flyweight instances of those components amongst themselves. The default
 component instances are provided by the {{#crossLink "Scene"}}{{/crossLink}}'s {{#crossLink "Scene/geometry:property"}}{{/crossLink}},
 {{#crossLink "Scene/material:property"}}{{/crossLink}}, {{#crossLink "Scene/transform:property"}}{{/crossLink}},
 {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}}, {{#crossLink "Scene/outlineMaterial:property"}}{{/crossLink}},
 {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}} properties, respectively.
 * An Entity with all defaults is a white unit-sized box centered at the World-space origin.
 * Customize your Entities by attaching your own instances of those component types, to override the defaults as needed.
 * For best performance, reuse as many of the same component instances among your Entities as possible.

 ## Usage

 * [Creating an Entity](#creating-an-entity)
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

 ### Creating an Entity

 Creating a minimal Entity that has all the default components:

 <img src="../../assets/images/screenshots/Scene/defaultEntity.png"></img>

 ````javascript
 var entity = new xeogl.Entity(); // A white unit-sized box centered at the World-space origin
 ````

 Since our Entity has all the default components, we can get those off either the Entity or its Scene:

 ````javascript
 entity.material.diffuse = [1.0, 0.0, 0.0];  // This is the same Material component...

 var scene = entity.scene;
 scene.material.diffuse  = [1.0, 0.0, 0.0];  // ...as this one.
 ````

 In practice, we would provide (at least) our own Geometry and Material for the Entity:

 <a href="../../examples/#geometry_primitives_teapot"><img src="../../assets/images/screenshots/Scene/teapot.png"></img></a>

 ````javascript
 var entity = new xeogl.Entity({
     geometry: new xeogl.TeapotGeometry(),
     material: new xeogl.MetallicMaterial({
         baseColor: [1.0, 1.0, 1.0]
     })
 });
 ````

 ### Controlling visibility

 Show or hide an Entity by setting its {{#crossLink "Entity/visible:property"}}{{/crossLink}} property:

 ````javascript
 entity.visible = false; // Hide
 entity.visible = true; // Show (default)
 ````

 ### Controlling clipping

 By default, an Entity will be clipped by the
 Scene's {{#crossLink "Scene/clips:property"}}clipping planes{{/crossLink}} (if you've created some).

 Make an Entity unclippable by setting its {{#crossLink "Entity/clippable:property"}}{{/crossLink}} property false:

 ````javascript
 entity.clippable = false; // Default is true
 ````

 ### Controlling rendering order

 Control the order in which an Entity is rendered relative to others by setting its {{#crossLink "Entity/layer:property"}}{{/crossLink}}
 property. You would normally do this when you need to ensure that transparent Entities are rendered in back-to-front order for correct alpha blending.

 Assign entity to layer 0 (all Entities are in layer 0 by default):

 ````javascript
 entity.layer = 0;
 ````

 Create another Entity in a higher layer, that will get rendered after layer 0:

 ````javascript
 var entity2 = new xeogl.Entity({
     geometry: new xeogl.Sphere(),
     layer: 1
 });
 ````

 ### Geometry

 An Entity has a {{#crossLink "Geometry"}}{{/crossLink}} which describes its shape. When we don't provide it with a
 Geometry, it will have the Scene's {{#crossLink "Scene/geometry:property"}}{{/crossLink}} by default.

 Creating an Entity with its own Geometry:

 ````javascript
 var entity = new xeogl.Entity({
     geometry: new xeogl.TeapotGeometry()
 });
 ````

 Dynamically replacing the Geometry:

 ````javascript
 entity.geometry = new xeogl.CylinderGeometry();
 ````

 Getting geometry arrays:

 ````javascript
 ver geometry = entity.geometry;

 var primitive = geometry,primitive;        // Default is "triangles"
 var positions = geometry.positions;        // Local-space vertex positions
 var normals = geometry.normals;            // Local-space vertex Normals
 var uv = geometry.uv;                      // UV coordinates
 var indices = entity.geometry.indices;     // Vertex indices for pimitives
 ````

 The Entity also has a convenience property which provides the vertex positions in World-space, ie. after they have been
 transformed by the Entity's Transform:

 ````javascript
 // These are internally generated on-demand and cached. To free the cached
 // vertex World positions when you're done with them, set this property to null or undefined
 var worldPositions = entity.worldPositions;
 ````

 ### Material

 An Entity has a {{#crossLink "Material"}}{{/crossLink}}, which describes its appearance. When we don't provide it with
 a Material, it will have the Scene's {{#crossLink "Scene/material:property"}}{{/crossLink}} by default.

 Creating an Entity with its own custom Geometry and Material:

 ````javascript
 var entity = new xeogl.Entity({
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

 Dynamically replacing the Material:

 ````javascript
 entity.material = new xeogl.SpecularMaterial({
     diffuse: [1.0, 1.0, 1.0],
     specular: [1.0, 1.0, 1.0],
     glossiness: 1.0,
     emissive: [0.0, 0.0, 0.0]
     alpha: 1.0
 })
 ````

 Animating the Material's diffuse color - making the Entity rapidly pulse red:

 ````javascript
 entity.scene.on("tick", function(e) {
    var t = e.time - e.startTime; // Millisecs
    entity.material.diffuse = [0.5 + Math.sin(t * 0.01), 0.0, 0.0]; // RGB
 });
 ````

 ### Transforming

 An Entity has a {{#crossLink "Transform"}}{{/crossLink}}, which positions, sizes and orients it within the World-space
 coordinate system. When we don't provide it with a Transform, it will have the Scene's {{#crossLink "Scene/transform:property"}}{{/crossLink}}
 by default (which is the identity transform unless modified).

 Transforms can also be connected into hierarchies.

 Creating an Entity with its own Geometry and Transform hierarchy:

 ````javascript
 var entity = new xeogl.Entity({

     geometry: new xeogl.TeapotGeometry(),

     transform: new xeogl.Translate({eapot
        xyz: [-5, 0, 0],
        parent: new xeogl.Rotate({
            xyz: [0,1,0],
            angle: 45
        })
     })
 });
 ````

 Dynamically replacing the Entity's Transform hierarchy:

 ````javascript
 entity.transform = new xeogl.Rotate({
     xyz: [0,1,0],
     angle: 45
     parent: new xeogl.Rotate({
         xyz: [1,0,0],
         angle: 180
     })
 });
 ````

 Animating the Transform hierarchy:

 ````javascript
 entity.scene.on("tick", function() {
    entity.transform.angle += 0.5;
    entity.transform.parent.angle += 0.5;
 });
 ````

 ### Ghosting

 Ghost an Entity by setting its {{#crossLink "Entity/ghosted:property"}}{{/crossLink}} property true. The Entity's
 {{#crossLink "EmphasisMaterial"}}{{/crossLink}} then controls its appearance while ghosted.

 When we don't provide it with a EmphasisMaterial, it will have the Scene's {{#crossLink "Scene/ghostMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a ghosted Entity with its own EmphasisMaterial.

 <a href="../../examples/#effects_ghost"><img src="../../assets/images/screenshots/EmphasisMaterial/teapot.png"></img></a>

 ````javascript
 var entity = new xeogl.Entity({
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

 * [Ghosted teapot](../../examples/#effects_ghost)

 ### Highlighting

 Highlight an Entity by setting its {{#crossLink "Entity/highlighted:property"}}{{/crossLink}} property true. The Entity's
 highlighting {{#crossLink "EmphasisMaterial"}}{{/crossLink}} then controls its appearance while highlighted.

 When we don't provide it with a EmphasisMaterial for highlighting, it will have the Scene's {{#crossLink "Scene/highlightMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a highlighted Entity with its own EmphasisMaterial.

 <a href="../../examples/#effects_highlight"><img src="../../assets/images/screenshots/EmphasisMaterial/teapotHighlighted.png"></img></a>

 ````javascript
 var entity = new xeogl.Entity({
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

 * [Ghost and highlight effects](../../examples/#effects_demo_gearbox)

 ### Outlining

 Outline an Entity by setting its {{#crossLink "Entity/outlined:property"}}{{/crossLink}} property true. The Entity's
 {{#crossLink "OutlineMaterial"}}{{/crossLink}} then controls its appearance while outlined.

 When we don't provide it with an OutlineMaterial, it will have the Scene's {{#crossLink "Scene/outlineMaterial:property"}}{{/crossLink}}
 by default.

 In the example below, we'll create a outlined Entity with its own OutlineMaterial.

 <a href="../../examples/#effects_outline"><img src="../../assets/images/screenshots/OutlineMaterial/teapot.png"></img></a>

 ````javascript
 var entity = new xeogl.Entity({
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

 We can get an Entity's Local-space boundary at any time, as both an axis-aligned bounding box (AABB) and
 an object-aligned bounding box (OBB).

 The Local-space boundary is the boundary of the Entity's Geometry, without any transforms applied.

 Getting the Local-space boundary as an AABB:

 ````
 var aabb = entity.geometry.aabb; // [xmin, ymin, zmin, xmax, ymax, zmax]
 ````

 Getting the Local-space boundary as an OBB:

 ```` javascript
 var obb = entity.geometry.obb; // Flat array containing eight 3D corner vertices of a box
 ````

 #### Examples

 * [Local-space Geometry AABB](../../examples/#boundaries_geometry_aabb)
 * [Local-space Geometry OBB](../../examples/#boundaries_geometry_obb)

 ### World-space boundary

 We can get an Entity's World-space boundary at any time, as both an axis-aligned bounding box (AABB) and
 an object-aligned bounding box (OBB).

 The World-space boundary is the boundary of the Entity's Geometry after the Entity's Transform has been applied to it.

 Getting the World-space boundary as an AABB:

 ````javascript
 var aabb = entity.aabb; // [xmin, ymin, zmin, xmax, ymax, zmax]
 ````

 Getting the World-space boundary as an OBB:

 ```` javascript
 var obb = entity.obb; // Flat array containing eight 3D corner vertices of a box
 ````

 Subscribing to updates of the World-space boundary, which occur whenever the Entity's Transform or Geometry have been updated.

 ````javascript
 entity.on("boundary", function() {
     var aabb = entity.aabb;
     var obb = entity.obb;
 });
 ````

 An Entity's {{#crossLink "Scene"}}{{/crossLink}} also has an {{#crossLink "Scene/getAABB:method"}}{{/crossLink}}, which returns
 the collective World-space axis-aligned boundary of the {{#crossLink "Entity"}}Entities{{/crossLink}}
 and/or {{#crossLink "Model"}}Models{{/crossLink}} with the given IDs:

 ````JavaScript
 var scene = entity.scene;

 scene.getAABB(); // Gets collective boundary of all entities in the viewer
 scene.getAABB("saw"); // Gets collective boundary of all entities in a model
 scene.getAABB(["saw", "gearbox"]); // Gets collective boundary of all entities in two models
 scene.getAABB("saw#0.1"); // Get boundary of an entity
 scene.getAABB(["saw#0.1", "saw#0.2"]); // Get collective boundary of two entities
 ````

 #### Excluding from boundary calculations

 The {{#crossLink "Scene/aabb:property"}}Scene aabb{{/crossLink}}
 and {{#crossLink "Model/aabb:property"}}Model aabb{{/crossLink}} properties provide AABBs that include the boundaries of all
 contained Entities, except those Entities that have their {{#crossLink "Entity/collidable:property"}}collidable{{/crossLink}} properties set ````false````.

 Toggle that inclusion like so:

 ````javascript
 entity.collidable = false; // Exclude entity from calculation of its Scene/Model boundary
 entity.collidable = true; // Include entity in calculation of its Scene/Model boundary
 ````
 Setting this false is useful when an Entity represents some object, such as a control gizmo, that you don't want to consider as
 being a contributor to a Scene or Model boundary. It also helps performance, since boundaries will not need dynamically re-calculated
 whenever the Entity's boundary changes after a Transform or Geometry update.

 #### Examples

 * [World-space Entity AABB](../../examples/#boundaries_entity_aabb)
 * [World-space Entity OBB](../../examples/#boundaries_entity_obb)

 ### Skyboxing

 An Entity has a {{#crossLink "Entity/stationary:property"}}{{/crossLink}} property
 that will cause it to never translate with respect to the viewpoint, while still rotationg, as if always far away.

 This is useful for using Entities as skyboxes, like this:

 ````javascript
 new xeogl.Entity({

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

 An Entity has a {{#crossLink "Entity/billboard:property"}}{{/crossLink}} property
 that can make it behave as a billboard.

 Two billboard types are supported:

 * **Spherical** billboards are free to rotate their Entities in any direction and always face the {{#crossLink "Camera"}}{{/crossLink}} perfectly.
 * **Cylindrical** billboards rotate their Entities towards the {{#crossLink "Camera"}}{{/crossLink}}, but only about the Y-axis.

 Note that {{#crossLink "Scale"}}{{/crossLink}} transformations to have no effect on billboarded Entities.

 The example below shows a box that remains rotated directly towards the viewpoint, using spherical billboarding:

 ````javascript
 new xeogl.Entity({

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


 @class Entity
 @module xeogl
 @submodule entities
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Entity within xeogl's default {{#crossLink "xeogl/scene:property"}}scene{{/crossLink}} by default.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Entity.
 @param [cfg.geometry] {String|Geometry} ID or instance of a {{#crossLink "Geometry"}}Geometry{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}, which is a 2x2x2 box.
 @param [cfg.material] {String|Material} ID or instance of a {{#crossLink "Material"}}Material{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/material:property"}}material{{/crossLink}}.
 @param [cfg.transform] {String|Transform} ID or instance of a modelling transform to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance,
 {{#crossLink "Scene/transform:property"}}transform{{/crossLink}} (which is an identity matrix which performs no transformation).
 @param [cfg.visible=true] {Boolean}  Indicates if this Entity is visible.
 @param [cfg.culled=true] {Boolean}  Indicates if this Entity is culled from view.
 @param [cfg.pickable=true] {Boolean}  Indicates if this Entity is pickable.
 @param [cfg.clippable=true] {Boolean} Indicates if this Entity is clippable by {{#crossLink "Clips"}}{{/crossLink}}.
 @param [cfg.collidable=true] {Boolean} Whether this Entity is included in boundary calculations.
 @param [cfg.castShadow=true] {Boolean} Whether this Entity casts shadows.
 @param [cfg.receiveShadow=true] {Boolean} Whether this Entity receives shadows.
 @param [cfg.outlined=false] {Boolean} Whether an outline is rendered around this entity, as configured by the Entity's {{#crossLink "OutlineMaterial"}}{{/crossLink}} component.
 @param [cfg.outlineMaterial] {String|OutlineMaterial} ID or instance of an {{#crossLink "OutlineMaterial"}}{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/outlineMaterial:property"}}outlineMaterial{{/crossLink}}.
 @param [cfg.ghosted=false] {Boolean} Whether this entity is rendered ghosted, as configured by {{#crossLink "Entity/ghostMaterial:property"}}ghostMaterial{{/crossLink}}.
 @param [cfg.ghostMaterial] {String|EmphasisMaterial} ID or instance of an {{#crossLink "EmphasisMaterial"}}{{/crossLink}} to attach to this Entity. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/ghostMaterial:property"}}ghostMaterial{{/crossLink}}.
 @param [cfg.highlight=false] {Boolean} Whether this entity is rendered highlighted, as configured by {{#crossLink "Entity/highlightMaterial:property"}}highlightMaterial{{/crossLink}}.
 @param [cfg.highlightMaterial] {String|EmphasisMaterial} ID or instance of an {{#crossLink "EmphasisMaterial"}}{{/crossLink}} to attach to this Entity to define highlighted appearance. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/highlightMaterial:property"}}highlightMaterial{{/crossLink}}.
 @param [cfg.selected=false] {Boolean} Whether this entity is rendered selected, as configured by {{#crossLink "Entity/selectedMaterial:property"}}selectedMaterial{{/crossLink}}.
 @param [cfg.selectedMaterial] {String|EmphasisMaterial} ID or instance of an {{#crossLink "EmphasisMaterial"}}{{/crossLink}} to attach to this Entity to define selected appearance. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/selectedMaterial:property"}}selectedMaterial{{/crossLink}}.
 @param [cfg.layer=0] {Number} Indicates this Entity's rendering priority, typically used for transparency sorting,
 @param [cfg.stationary=false] {Boolean} Disables the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}} translations for this Entity. This is useful for skybox Entities.
 @param [cfg.billboard="none"] {String} Specifies the billboarding behaviour for this Entity. Options are "none", "spherical" and "cylindrical".
 @param [cfg.loading=false] {Boolean} Flag which indicates that this Entity is freshly loaded.
 @extends Component
 */

/**
 * Fired when this Entity is *picked* via a call to the {{#crossLink "Canvas/pick:method"}}{{/crossLink}} method
 * on the parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Canvas"}}Canvas {{/crossLink}}.
 * @event picked
 * @param {String} entityId The ID of this Entity.
 * @param {Number} canvasX The X-axis Canvas coordinate that was picked.
 * @param {Number} canvasY The Y-axis Canvas coordinate that was picked.
 */
(function () {

    "use strict";

    xeogl.Entity = xeogl.Component.extend({

        type: "xeogl.Entity",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Modes({
                translate: null,
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
                layer: null,
                billboard: null,
                hash: ""
            });

            this._objectId = null; // Renderer object
            this._loading = cfg.loading !== false;

            this._aabbDirty = true;
            this._obbDirty = true;

            this._worldPositions = null;
            this._worldPositionsDirty = true;

            // Components

            this.geometry = cfg.geometry;
            this.material = cfg.material;
            this.transform = cfg.transform;
            this.ghostMaterial = cfg.ghostMaterial;
            this.outlineMaterial = cfg.outlineMaterial;
            this.highlightMaterial = cfg.highlightMaterial;
            this.selectedMaterial = cfg.selectedMaterial;

            // Properties

            this.translate = cfg.translate;
            this.visible = cfg.visible;
            this.culled = cfg.culled;
            this.pickable = cfg.pickable;
            this.clippable = cfg.clippable;
            this.collidable = cfg.collidable;
            this.castShadow = cfg.castShadow;
            this.receiveShadow = cfg.receiveShadow;
            this.outlined = cfg.outlined;
            this.layer = cfg.layer;
            this.stationary = cfg.stationary;
            this.billboard = cfg.billboard;
            this.solid = cfg.solid;
            this.ghosted = cfg.ghosted;
            this.highlighted = cfg.highlighted;
            this.selected = cfg.selected;
            this.colorize = cfg.colorize;
        },

        _props: {

            /**
             * The {{#crossLink "Geometry"}}Geometry{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/geometry:property"}}geometry{{/crossLink}}
             * (a simple box) when set to a null or undefined value.
             *
             * Updates {{#crossLink "Entity/boundary"}}{{/crossLink}},
             * {{#crossLink "Entity/worldObb"}}{{/crossLink}} and
             * {{#crossLink "Entity/center"}}{{/crossLink}}
             *
             * @property geometry
             * @type Geometry
             */
            geometry: {

                set: function (value) {

                    this._attach({
                        name: "geometry",
                        type: "xeogl.Component",  // HACK
                        component: value,
                        sceneDefault: true,
                        on: {
                            "boundary": {
                                callback: this._setBoundaryDirty,
                                scope: this
                            },
                            "destroyed": {
                                callback: this._setBoundaryDirty,
                                scope: this
                            }
                        }
                    });

                    this._setBoundaryDirty();
                },

                get: function () {
                    return this._attached.geometry;
                }
            },

            /**
             * The {{#crossLink "Material"}}Material{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/material:property"}}material{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property material
             * @type Material
             */
            material: {

                set: function (value) {

                    this._attach({
                        name: "material",
                        type: "xeogl.Material",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.material;
                }
            },

            /**
             * The {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/ghostMaterial:property"}}ghostMaterial{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property ghostMaterial
             * @type EmphasisMaterial
             */
            ghostMaterial: {

                set: function (value) {

                    this._attach({
                        name: "ghostMaterial",
                        type: "xeogl.EmphasisMaterial",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.ghostMaterial;
                }
            },

            /**
             * The {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/highlightMaterial:property"}}highlightMaterial{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property highlightMaterial
             * @type EmphasisMaterial
             */
            highlightMaterial: {

                set: function (value) {

                    this._attach({
                        name: "highlightMaterial",
                        type: "xeogl.EmphasisMaterial",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.highlightMaterial;
                }
            },

            /**
             * The {{#crossLink "EmphasisMaterial"}}EmphasisMaterial{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/selectedMaterial:property"}}selectedMaterial{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property selectedMaterial
             * @type EmphasisMaterial
             */
            selectedMaterial: {

                set: function (value) {

                    this._attach({
                        name: "selectedMaterial",
                        type: "xeogl.EmphasisMaterial",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.selectedMaterial;
                }
            },

            /**
             * The {{#crossLink "OutlineMaterial"}}OutlineMaterial{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/outlineMaterial:property"}}outlineMaterial{{/crossLink}} when set to
             * a null or undefined value.
             *
             * @property outlineMaterial
             * @type OutlineMaterial
             */
            outlineMaterial: {

                set: function (value) {

                    this._attach({
                        name: "outlineMaterial",
                        type: "xeogl.OutlineMaterial",
                        component: value,
                        sceneDefault: true
                    });
                },

                get: function () {
                    return this._attached.outlineMaterial;
                }
            },

            /**
             * The Local-to-World-space (modelling) {{#crossLink "Transform"}}{{/crossLink}} attached to this Entity.
             *
             * Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this Entity. Defaults to the parent
             * {{#crossLink "Scene"}}Scene{{/crossLink}}'s default {{#crossLink "Scene/transform:property"}}transform{{/crossLink}}
             * (an identity matrix) when set to a null or undefined value.
             *
             * Updates {{#crossLink "Entity/boundary"}}{{/crossLink}},
             * {{#crossLink "Entity/worldObb"}}{{/crossLink}} and
             * {{#crossLink "Entity/center"}}{{/crossLink}}
             *
             * @property transform
             * @type Transform
             */
            transform: {

                set: function (value) {

                    this._setBoundaryDirty();

                    this._attach({
                        name: "transform",
                        type: "xeogl.Transform",
                        component: value,
                        sceneDefault: true,
                        on: {
                            updated: {
                                callback: function () {
                                    if (this._transformDirty) {
                                        return;
                                    }
                                    this._transformDirty = true;
                                    // Assumes worst case: many repeated "updated" events within the transform hierarchy per frame
                                    xeogl.scheduleTask(this._transformUpdated, this);
                                },
                                scope: this
                            },

                            destroyed: {
                                callback: this._setBoundaryDirty,
                                scope: this
                            }
                        }
                    });
                },

                get: function () {
                    return this._attached.transform;
                }
            },

            /**
             Indicates whether this Entity is visible or not.

             The Entity is only rendered when {{#crossLink "Entity/visible:property"}}{{/crossLink}} is true and
             {{#crossLink "Entity/culled:property"}}{{/crossLink}} is false.

             @property visible
             @default true
             @type Boolean
             */
            visible: {

                set: function (value) {
                    this._state.visible = value !== false;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.visible;
                }
            },

            /**
             Indicates whether or not this Entity is currently culled from view.

             The Entity is only rendered when {{#crossLink "Entity/visible:property"}}{{/crossLink}} is true and
             {{#crossLink "Entity/culled:property"}}{{/crossLink}} is false.

             @property culled
             @default false
             @type Boolean
             */
            culled: {

                set: function (value) {
                    this._state.culled = !!value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.culled;
                }
            },

            /**
             Indicates whether this entity is pickable or not.

             Picking is done via calls to {{#crossLink "Canvas/pick:method"}}Canvas#pick{{/crossLink}}.

             @property pickable
             @default true
             @type Boolean
             */
            pickable: {

                set: function (value) {
                    value = value !== false;
                    if (this._state.pickable === value) {
                        return;
                    }
                    this._state.pickable = value;

                    // No need to trigger a render;
                    // state is only used when picking
                },

                get: function () {
                    return this._state.pickable;
                }
            },

            /**
             Indicates whether this Entity is clippable by {{#crossLink "Clips"}}{{/crossLink}} components.

             @property clippable
             @default true
             @type Boolean
             */
            clippable: {

                set: function (value) {
                    value = value !== false;
                    if (this._state.clippable === value) {
                        return;
                    }
                    this._state.clippable = value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.clippable;
                }
            },

            /**
             Indicates whether this Entity is included in boundary calculations.

             @property collidable
             @default true
             @type Boolean
             */
            collidable: {

                set: function (value) {
                    value = value !== false;
                    if (value === this._state.collidable) {
                        return;
                    }
                    this._state.collidable = value;
                },

                get: function () {
                    return this._state.collidable;
                }
            },


            /**
             Indicates whether this Entity casts shadows.

             @property castShadow
             @default true
             @type Boolean
             */
            castShadow: {

                set: function (value) {
                    value = value !== false;
                    if (value === this._state.castShadow) {
                        return;
                    }
                    this._state.castShadow = value;
                    this._renderer.imageDirty(); // Re-render in next shadow map generation pass
                },

                get: function () {
                    return this._state.castShadow;
                }
            },

            /**
             Indicates whether this Entity receives shadows.

             @property receiveShadow
             @default true
             @type Boolean
             */
            receiveShadow: {

                set: function (value) {
                    value = value !== false;
                    if (value === this._state.receiveShadow) {
                        return;
                    }
                    this._state.receiveShadow = value;
                    this._state.hash = value ? "/mod/rs;" : "/mod;";
                    this.fire("dirty", this); // Now need to (re)compile objectRenderers to include/exclude shadow mapping
                },

                get: function () {
                    return this._state.receiveShadow;
                }
            },

            /**
             Indicates whether this Entity is rendered with an outline.

             The outline effect is configured via the Entity's {{#crossLink "Entity/outlineMaterial:property"}}outlineMaterial{{/crossLink}} component.

             @property outlined
             @default false
             @type Boolean
             */
            "outlined,outline": {

                set: function (value) {
                    value = !!value;
                    if (value === this._state.outlined) {
                        return;
                    }
                    this._state.outlined = value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.outlined;
                }
            },

            /**
             Indicates whether this Entity is highlighted.

             The highlight effect is configured via the Entity's {{#crossLink "Entity/highlightMaterial:property"}}highlightMaterial{{/crossLink}}.

             @property highlighted
             @default false
             @type Boolean
             */
            "highlight,highlighted": {

                set: function (value) {
                    value = !!value;
                    if (value === this._state.highlighted) {
                        return;
                    }
                    this._state.highlighted = value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.highlighted;
                }
            },

            /**
             Indicates whether this Entity is selected.

             The selected effect is configured via the Entity's {{#crossLink "Entity/selectedMaterial:property"}}selectedMaterial{{/crossLink}}.

             @property selected
             @default false
             @type Boolean
             */
            selected: {

                set: function (value) {
                    value = !!value;
                    if (value === this._state.selected) {
                        return;
                    }
                    this._state.selected = value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.selected;
                }
            },

            /**
             RGBA colorize color, multiplies by the outgoing fragment color and transparency.

             @property colorize
             @default [1.0, 1.0, 1.0, 1.0]
             @type Float32Array
             */
            colorize: {

                set: function (value) {
                    var colorize = this._state.colorize;
                    if (!colorize) {
                        colorize = this._state.colorize = new Float32Array(4);
                    }
                    if (value) {
                        colorize[0] = value[0];
                        colorize[1] = value[1];
                        colorize[2] = value[2];
                        colorize[3] = value[3];
                    } else {
                        colorize[0] = 1;
                        colorize[1] = 1;
                        colorize[2] = 1;
                        colorize[3] = 1;
                    }
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.colorize;
                }
            },

            /**
             * Indicates this Entity's rendering order.
             *
             * This can be set on multiple transparent Entities, to make them render in a specific order
             * for correct alpha blending.
             *
             * @property layer
             * @default 0
             * @type Number
             */
            layer: {

                set: function (value) {
                    // TODO: Only accept rendering layer in range [0...MAX_layer]
                    value = value || 0;
                    value = Math.round(value);
                    if (value === this._state.layer) {
                        return;
                    }
                    this._state.layer = value;
                    this._renderer.needStateSort();
                },

                get: function () {
                    return this._state.layer;
                }
            },

            /**
             * Flag which indicates whether this Entity is stationary or not.
             *
             * Setting this true will disable the effect of {{#crossLink "Lookat"}}view transform{{/crossLink}}
             * translations for this Entity, while still alowing it to rotate. This is useful for skybox Entities.
             *
             * @property stationary
             * @default false
             * @type Boolean
             */
            stationary: {

                set: function (value) {
                    value = !!value;
                    if (this._state.stationary === value) {
                        return;
                    }
                    this._state.stationary = value;
                    this.fire("dirty", this);
                },

                get: function () {
                    return this._state.stationary;
                }
            },

            /**
             Specifies the billboarding behaviour for this Entity.

             Options are:

             * **"none"** -  **(default)** - No billboarding.
             * **"spherical"** - Entity is billboarded to face the viewpoint, rotating both vertically and horizontally.
             * **"cylindrical"** - Entity is billboarded to face the viewpoint, rotating only about its vertically
             axis. Use this mode for things like trees on a landscape.

             @property billboard
             @default "none"
             @type String
             */
            billboard: {

                set: function (value) {
                    value = value || "none";
                    if (value !== "spherical" && value !== "cylindrical" && value !== "none") {
                        this.error("Unsupported value for 'billboard': " + value + " - accepted values are " +
                            "'spherical', 'cylindrical' and 'none' - defaulting to 'none'.");
                        value = "none";
                    }
                    if (this._state.billboard === value) {
                        return;
                    }
                    this._state.billboard = value;
                    this.fire("dirty", this);
                },

                get: function () {
                    return this._state.billboard;
                }
            },

            /**
             * Flag which indicates if this Entity is rendered with ghost effect.
             *
             * The ghost effect is configured via the Entity's {{#crossLink "Entity/ghostMaterial:property"}}ghostMaterial{{/crossLink}}.
             *
             * @property ghosted
             * @default false
             * @type Boolean
             */
            "ghosted,ghost": {

                set: function (value) {
                    value = !!value;
                    if (this._state.ghosted === value) {
                        return;
                    }
                    this._state.ghosted = value;
                    this._renderer.imageDirty();
                },

                get: function () {
                    return this._state.ghosted;
                }
            },


            /**
             * World-space 3D center of this Entity.
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
             * World-space axis-aligned 3D boundary (AABB) of this Entity.
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
                        this._aabbDirty = false;
                        var math = xeogl.math;
                        var transform = this._attached.transform;
                        var geometry = this._attached.geometry;
                        if (!transform) {
                            return geometry.aabb;
                        }
                        if (!this._aabb) {
                            this._aabb = math.AABB3();
                        }
                        if (!this._obb) {
                            this._obb = math.OBB3();
                        }
                        math.transformOBB3(transform.leafMatrix, geometry.obb, this._obb);
                        math.OBB3ToAABB3(this._obb, this._aabb);
                    }
                    return this._aabb;
                }
            },

            /**
             * World-space oriented 3D boundary (OBB) of this Entity.
             *
             * The OBB is represented by a 32-element Float32Array containing the eight vertices of the box,
             * where each vertex is a homogeneous coordinate having [x,y,z,w] elements.
             *
             * @property obb
             * @final
             * @type {Float32Array}
             */
            obb: {
                get: function () {
                    if (this._obbDirty) {
                        this._obbDirty = false;
                        var transform = this._attached.transform;
                        var geometry = this._attached.geometry;
                        if (!transform) {
                            return geometry.obb;
                        }
                        if (!this._obb) {
                            this._obb = xeogl.math.OBB3();
                        }
                        xeogl.math.transformOBB3(transform.leafMatrix, geometry.obb, this._obb);
                    }
                    return this._obb;
                }
            },

            /**
             * World-space vertex positions of this Entity.
             *
             * These are internally generated on-demand and cached. To free the cached
             * vertex World positions when you're done with them, set this property to null or undefined.
             *
             * @property worpdPositions
             * @type Float32Array
             * @final
             */
            worldPositions: {

                get: function () {
                    if (this._worldPositionsDirty) {
                        var positions = this.geometry.positions;
                        if (!this._worldPositions) {
                            this._worldPositions = new Float32Array(positions.length);
                        }
                        if (!this._attached.transform) {
                            this._worldPositions.set(positions);
                        } else {
                            xeogl.math.transformPositions3(this._attached.transform.leafMatrix, positions, this._worldPositions);
                        }
                        this._worldPositionsDirty = false;
                    }
                    return this._worldPositions;
                },

                set: function (value) {
                    if (value = undefined || value === null) {
                        this._worldPositions = null; // Release memory
                        this._worldPositionsDirty = true;
                    }
                }
            }
        },

        // Callbacks as members, to avoid GC churn

        _transformUpdated: function () {
            if (!this._transformDirty) {
                return;
            }
            this._attached.transform._buildLeafMatrix();
            this._setBoundaryDirty();
            this._transformDirty = false;
        },

        _setBoundaryDirty: function () {
            this._aabbDirty = true;
            this._obbDirty = true;
            this._worldPositionsDirty = true;

            //var lights = this._attached.lights;
            //if (lights) {
            //    lights._shadowsDirty(); // Need to re-render shadow maps
            //}

            /**
             Fired whenever this Entity's World-space boundary changes.

             Get the latest boundary from the Entity's {{#crossLink "Entity/aabb:property"}}{{/crossLink}}
             and {{#crossLink "Entity/obb:property"}}{{/crossLink}} properties.

             @event boundary
             */
            this.fire("boundary");
        },

        // Returns true if there is enough on this Entity to render something.
        _valid: function () {
            if (this.destroyed) {
                return false;
            }
            var geometry = this._attached.geometry;
            if (!geometry) {
                return false;
            }
            if (!geometry.created) {
                return false;
            }
            return true;
        },

        _compile: function () {

            if (this._objectId) {
                this._renderer.destroyObject(this._objectId);
                this._objectId = null;
            }

            var material = this.material._getState();
            var ghostMaterial = this.ghostMaterial._state;
            var outlineMaterial = this.outlineMaterial._state;
            var highlightMaterial = this.highlightMaterial._state;
            var selectedMaterial = this.selectedMaterial._state;
            var vertexBufs = this.geometry._getVertexBufs();
            var geometry = this.geometry._state;
            var modelTransform = this.transform._state;
            var modes = this._getState();

            var result = this._renderer.createObject(this.id, material, ghostMaterial, outlineMaterial, highlightMaterial, selectedMaterial,  vertexBufs, geometry, modelTransform, modes);

            if (this._loading) {
                this._loading = false;
                this.fire("loaded", true);
            }

            if (result.objectId) {
                this._objectId = result.objectId;

            } else if (result.errors) {
                var errors = result.errors.join("\n");
                this.error(errors);
                this.fire("error", errors);
            }
        },

        _getState: function () {
            this._makeHash();
            return this._state;
        },

        _makeHash: function () {
            var hash = [];
            var state = this._state;
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
        },

        _destroy: function () {
            if (this._objectId) {
                this._renderer.destroyObject(this._objectId);
                this._objectId = null;
            }
        }
    });
})();
