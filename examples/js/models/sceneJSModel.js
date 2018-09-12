/**
 A **SceneJSModel** is a {{#crossLink "Model"}}{{/crossLink}} that
 imports content from the JSON-based <a href="http://scenejs.org">SceneJS</a> scene definition format.

 <a href="../../examples/#importing_scenejs_tronTank"><img src="http://i.giphy.com/l3vR50pFTpEbJTztS.gif"></img></a>

 ## Overview

 * A SceneJSModel is a container of {{#crossLink "Component"}}Components{{/crossLink}} that loads itself from a
 SceneJS scene definition, given as either a JSON file or a JavaScript object (POJO).
 * It begins loading as soon as you either set its {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}}
 property to the location of a valid SceneJS JSON file, or set its {{#crossLink "SceneJSModel/data:property"}}{{/crossLink}} property to a
 valid POJO.
 * You can set these properties to new values at any time, which causes
 the SceneJSModel to clear itself and load fresh components.
 * Can be configured to do a best-effort conversion of SceneJS Phong materials into xeogl's PBR {{#crossLink "PBRMetalness"}}{{/crossLink}} or {{#crossLink "SpecularMaterials"}}{{/crossLink}}.

 It inherits these capabilities from its {{#crossLink "Model"}}{{/crossLink}} base class:

 * Allows you to access and manipulate the components within it.
 * Can be transformed within World-space by attaching it to a {{#crossLink "Transform"}}{{/crossLink}}.
 * Provides its World-space boundary as a {{#crossLink "Boundary3D"}}{{/crossLink}}.

 <img src="../../../assets/images/SceneJSModel.png"></img>

 ## SceneJS Support

 SceneJSModel was developed to import the [Tron Tank model](../../examples/#importing_scenejs_tronTank). As such,
 it only imports a limited subset of the SceneJS scene definition API. <b>Use with caution</b> and be prepared to
 fix and contribute missing functionality!

 SceneJS nodes supported so far:

 * ````"node"````
 * ````"rotate"````
 * ````"translate"````
 * ````"scale"````
 * ````"material"````
 * ````"texture"````
 * ````"fresnel"````
 * ````"flags"````
 * ````"geometry"````
 * ````"layer"````
 * ````"stage"````

 Unsupported API features include:

 * Lights
 * Cameras
 * Shared node cores
 * SceneJS plugins

 ## Examples

 * [Importing POJO defining geometry with diffuse, specular and normal maps](../../examples/#importing_scenejs_pojo_textures)
 * [Importing POJO defining transparent geometry](../../examples/#importing_scenejs_pojo_transparency)
 * [Importing JSON file defining geometry with diffuse, specular and normal maps](../../examples/#importing_scenejs_json_textures)
 * [Importing JSON file defining the SceneJS Tron Tank](../../examples/#importing_scenejs_tronTank)

 ## Usage

 #### Loading a POJO scene definition

 The simplest way to import SceneJS content is by setting a POJO on the SceneJSModel's {{#crossLink "SceneJSModel/data:property"}}data{{/crossLink}}
 property:

 ````javascript
 var pojoModel = new xeogl.SceneJSModel({
        id: "myModel",

        // Our POJO scene definition
        data: {
            type: "node",
            nodes: [
                {
                    type: "rotate",
                    id: "myRotate",
                    nodes: [
                        {
                            type: "geometry",
                            id: "boxEntity",
                            primitive: "triangles",
                            positions: [
                                2, 2, 2, -2, 2, 2, -2, -2, 2, 2, -2, 2, 2, 2, 2, 2, -2,
                                2, 2, -2, -2, 2, 2, -2, 2, 2, 2, 2, 2, -2, -2, 2, -2,
                                -2, 2, 2, -2, 2, 2, -2, 2, -2, -2, -2, -2, -2, -2, 2,
                                -2, -2, -2, 2, -2, -2, 2, -2, 2, -2, -2, 2, 2, -2, -2,
                                -2, -2, -2, -2, 2, -2, 2, 2, -2
                            ],
                            normals: [
                                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1,
                                0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0,
                                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0,
                               -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
                            ],
                            uv: [
                                5, 5, 0, 5, 0, 0, 5, 0, 0, 5, 0, 0, 5, 0, 5, 5,
                                5, 0, 5, 5, 0, 5, 0, 0, 5, 5, 0, 5, 0, 0, 5, 0,
                                0, 0, 5, 0, 5, 5, 0, 5, 0, 0, 5, 0, 5, 5, 0, 5
                            ],
                            indices: [
                                0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
                                12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21,
                                22, 20, 22, 23
                            ]
                        }
                    ]
                }
            ]
        }
     });

 // Set camera position
 var camera = pojoModel.scene.camera;
 camera.eye = [0, 0, -25];
 camera.look = [0, 0, 0];
 camera.up = [0, 1, 0];
 ````

 #### Finding components

 Our SceneJSModel has now created various xeogl components
 within itself, which we can find by their IDs. In this particular example, our POJO has a SceneJS ````"rotate"```` node
 with ID ````"myRotate"````. Our SceneJSModel parsed that into a {{#crossLink "Rotate"}}{{/crossLink}} component with
 ID ````"myModel.myRotate"````.

 To see what components our SceneJSModel created, we can drop this expression into the browser's JavaScript
 debug console (we're using Chrome here):

 ````
 pojoModel.types;
 ````

 The result is the value of the SceneJSModel's {{#crossLink "Model/types:property"}}types{{/crossLink}} map, which
 contains its xeogl components, mapped to their types:

 <img src="../../../assets/images/screenshots/SceneJSModel_console_tankModel.types.png"></img>

 Here we've expanded the {{#crossLink "Rotate"}}{{/crossLink}} components, and we can see
 our {{#crossLink "Rotate"}}{{/crossLink}}. **Note that its ID is prefixed with the ID of the SceneJSModel.**

 Let's get that {{#crossLink "Rotate"}}{{/crossLink}} from our SceneJSModel's
 {{#crossLink "Model/components:property"}}{{/crossLink}} map and set it spinning:

 ```` JavaScript
 var rotate = pojoModel.components["myModel.myRotate"];

 pojoModel.scene.on("tick", function() {
    rotate.angle += 0.2;
 });
 ````

 #### Loading a JSON scene definition

 As shown in the example below, we can also import a SceneJS scene definition from a JSON file (eg. <a href="../../examples/models/scenejs/tronTank.json">tronTank.json</a>).
 Note that we need to wait for the SceneJSModel's {{#crossLink "SceneJSModel/loaded:event"}}{{/crossLink}} event before we
 can access its components. In this example we're also showing how a SceneJSModel can be attached to a modeling {{#crossLink "Transform"}}{{/crossLink}}
 hierarchy to transform it within World space (see {{#crossLink "Model"}}{{/crossLink}}).

 ````javascript
 // Import SceneJS JSON model
 var tankModel = new xeogl.SceneJSModel({
        id: "tankModel",

        // Path to our JSON scene definition file
        src: "models/scenejs/tronTank.json",

        // We can also bolt on a hierarchy of modeling transforms,
        // to transform the entire SceneJSModel in World space
        transform: new xeogl.Rotate({
            xyz: [0, 1, 0],
            angle: 0,
            parent: new xeogl.Translate({
                xyz: [0, 0, 0]
            })
        })
     });

 // Once our SceneJSModel has loaded, we can access its components
 tankModel.on("loaded", function() {

        tankModel.components["tankModel.gunDir"].angle = gunDir;

        // Set camera position
        var camera = tankModel.scene.camera;
        camera.eye = [0, 0, -70];
        camera.look = [0, 0, 0];
        camera.up = [0, 1, 0];
    });
 ````

 #### Converting materials to PBR


 ````javascript
 var pbrSpecularTankModel = new xeogl.SceneJSModel({
    src: "models/scenejs/tronTank.json",
    materialWorkflow: "SpecularMaterial"
 });
 ````

 ````javascript
 var pbrMetalnessTankModel = new xeogl.SceneJSModel({
    src: "models/scenejs/tronTank.json",
    materialWorkflow: "MetallicMaterial"
 });
 ````

 @class SceneJSModel
 @module xeogl
 @submodule models
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this SceneJSModel in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model. See the {{#crossLink "Object"}}{{/crossLink}} documentation for usage.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this SceneJSModel.
 @param [cfg.materialWorkflow] {String} Selects material workflow - "classic" | "pbrMatalness" | "pbrSpecular"
 @param [cfg.src] {String} Path to a SceneJS JSON scene description file.
 @param [cfg.data] {String} Path to a SceneJS JSON scene description file.
 @param [cfg.position=[0,0,0]] {Float32Array} The Model's local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} The SceneJSModel's local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} The SceneJSModel's local rotation, as Euler angles given in degrees.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} The SceneJSModel's local transform matrix. Overrides the position, scale and rotation parameters.
 @extends Geometry
 */
{

    xeogl.SceneJSModel = class xeoglSceneJSModel extends xeogl.Model {

        init(cfg) {
            super.init(cfg);
            this._src = null;
            this.materialWorkflow = cfg.materialWorkflow;
            this.src = cfg.src;
            this.data = cfg.data;
        }

        /**
         Selects which xeogl material type to create from each SceneJS Phong material.

         Causes the SceneJSModel to attempt a best-effort conversion.

         Update this at any time to reconvert the materials.

         Fires a {{#crossLink "SceneJSModel/materialWorkFlow:event"}}{{/crossLink}} event on change.

         @property materialWorkflow
         @type {*}
         */
        set materialWorkflow(value) {

            value = value || "PhongMaterial";

            if (value !== "MetallicMaterial" && value !== "SpecularMaterial" && value !== "PhongMaterial") {
                this.error("Unsupported value for 'materialWorkflow' - defaulting to 'PhongMaterial'");
                value = "PhongMaterial";
            }

            if (this._materialWorkflow === value) {
                return;
            }

            this._materialWorkflow = value;

            //this.destroyAll();
            //
            //this._src = null;
            //
            //this._parse(this._materialWorkflow, null, null, null);

            /**
             Fired whenever this SceneJSModel's  {{#crossLink "SceneJSModel/materialWorkflow:property"}}{{/crossLink}} property changes.
             @event materialWorkflow
             @param value The property's new value
             */
            this.fire("materialWorkflow", this._materialWorkflow);
        }

        get materialWorkFlow() {
            return this._materialWorkflow;
        }

        /**
         Path to the SceneJS JSON scene description file.

         Update this at any time to clear and re-import content.

         Fires a {{#crossLink "SceneJSModel/src:event"}}{{/crossLink}} event on change.

         @property src
         @type String
         */
        set src(value) {

            if (!value) {
                return;
            }

            if (!xeogl._isString(value)) {
                this.error("Value for 'src' should be a string");
                return;
            }

            if (value === this._src) { // Already loaded this SceneJSModel

                /**
                 Fired whenever this SceneJSModel has finished loading the SceneJS JSON file
                 specified by {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}}.
                 @event loaded
                 */
                this.fire("loaded", true, true);

                return;
            }

            this.destroyAll();

            this._data = null;

            this._src = value;

            // Increment processes represented by loading spinner
            // Spinner appears as soon as count is non-zero

            var spinner = this.scene.canvas.spinner;
            spinner.processes++;

            var self = this;

            load(this._src, function (node) {

                    var group = self;

                    self._parse(node, group, null, null);

                    // Decrement processes represented by loading spinner
                    // Spinner disappears if the count is now zero
                    spinner.processes--;

                    xeogl.scheduleTask(function () {
                        self.fire("loaded", true);
                    });
                },

                function (msg) {

                    spinner.processes--;

                    self.error("Failed to load JSON file: " + msg);

                    self.fire("failed", msg);
                });

            /**
             Fired whenever this SceneJSModel's  {{#crossLink "SceneJSModel/src:property"}}{{/crossLink}} property changes.
             @event src
             @param value The property's new value
             */
            this.fire("src", this._src);
        }

        get src() {
            return this._src;
        }

        /**
         A SceneJS POJO scene definition.

         Update this at any time to clear and re-import content.

         Fires a {{#crossLink "SceneJSModel/data:event"}}{{/crossLink}} event on change.

         @property data
         @type {*}
         */
        set data(value) {

            if (!value) {
                return;
            }

            this.destroyAll();

            this._src = null;

            this._data = value;

            var group = this;

            this._parse(this._data, group, null, null);

            var self = this;

            xeogl.scheduleTask(function () {
                self.fire("loaded", true);
            });

            /**
             Fired whenever this SceneJSModel's  {{#crossLink "SceneJSModel/data:property"}}{{/crossLink}} property changes.
             @event data
             @param value The property's new value
             */
            this.fire("data", this._data);
        }

        get data() {
            return this._data;
        }

        //---------------------------------------------------------------------------------------------------------------
        // A simple recursive descent parser that loads SceneJS JSON into a xeogl.Model.
        // This is just the bare essentials to prove the concept - just transforms, diffuse material and geometry.
        //---------------------------------------------------------------------------------------------------------------

        _parse(node,
               group,
               material,
               diffuseMap,
               specularMap,
               emissiveMap,
               normalMap,
               alphaMap,
               diffuseFresnel,
               specularFresnel,
               emissiveFresnel,
               normalFresnel,
               alphaFresnel,
               transparent,
               backfaces,
               layer) {

            switch (node.type) {

                case "material":

                    var scenejsBaseColor = node.baseColor;
                    var scenejsSpecularColor = node.specularColor;
                    var scenejsSpecular = node.specular;
                    var scenejsEmit = node.emit;
                    var diffuse = scenejsBaseColor ? [scenejsBaseColor.r, scenejsBaseColor.g, scenejsBaseColor.b] : null;
                    var specular = (scenejsSpecular && scenejsSpecularColor) ? [scenejsSpecular * scenejsSpecularColor.r, scenejsSpecular * scenejsSpecularColor.g, scenejsSpecular * scenejsSpecularColor.b] : null;
                    var emissive = (scenejsEmit && diffuse) ? [scenejsEmit * diffuse[0], scenejsEmit * diffuse[1], scenejsEmit * diffuse[2]] : null;

                    switch (this._materialWorkflow) {
                        case "MetallicMaterial":
                            material = {
                                id: this._createID(node),
                                type: "xeogl.MetallicMaterial",
                                baseColor: diffuse,
                                metallic: 1.0,
                                roughness: 0.4,
                                emissive: emissive,
                                alpha: node.alpha,
                                alphaMode: "blend"
                            };
                            break;

                        case "SpecularMaterial":
                            material = {
                                id: this._createID(node),
                                type: "xeogl.SpecularMaterial",
                                diffuse: diffuse,
                                specular: specular,
                                glossiness: 0.5,
                                emissive: emissive,
                                alpha: node.alpha,
                                alphaMode: "blend"
                            };
                            break;

                        default:
                            material = {
                                id: this._createID(node),
                                type: "xeogl.PhongMaterial",
                                ambient: [.2, .2, .2],
                                diffuse: diffuse,
                                specular: specular,
                                // shininess: node.shine,
                                emissive: emissive,
                                alpha: node.alpha,
                                alphaMode: "blend"
                            };
                    }

                    break;

                case "translate":

                    group = group.addChild(new xeogl.Group(this.scene, {
                        id: this._createID(node),
                        position: [node.x, node.y, node.z]
                    }));

                    this._addComponent(group);

                    break;

                case "scale":

                    group = group.addChild(new xeogl.Group(this.scene, {
                        id: this._createID(node),
                        scale: [node.x, node.y, node.z]
                    }));

                    this._addComponent(group);

                    break;

                case "rotate":

                    var newGroup = new xeogl.Group(this.scene, {
                        id: this._createID(node)
                    });

                    newGroup.rotate([node.x, node.y, node.z], node.angle);

                    group = group.addChild(newGroup);

                    this._addComponent(group);

                    // var localMatrix = xeogl.math.rotationMat4c(node.angle * xeogl.math.DEGTORAD, node.x, node.y, node.z);
                    // if (matrix) {
                    //     matrix = xeogl.math.mulMat4(matrix, localMatrix, xeogl.math.mat4());
                    // } else {
                    //     matrix = localMatrix;
                    // }

                    break;

                case "texture":

                    var texture = new xeogl.Texture(this.scene, {
                        id: this._createID(node),
                        src: node.src,
                        wrapS: node.wrapS,
                        wrapT: node.wrapT,
                        scale: node.scale ? [node.scale.x || 1, node.scale.y || 1] : undefined,
                        translate: node.translate ? [node.translate.x || 0, node.translate.y || 1] : undefined,
                        rotate: node.rotate,
                        minFilter: node.minFilter,
                        maxFilter: node.maxFilter,
                        encoding: "sRGB"
                    });

                    this._addComponent(texture);

                    switch (node.applyTo) {

                        case "baseColor":
                        case "color":
                            diffuseMap = texture;
                            break;

                        case "specular":
                            specularMap = texture;
                            break;

                        case "emit":
                            emissiveMap = texture;
                            break;

                        case "alpha":
                            alphaMap = texture;
                            break;

                        case "normals":
                            normalMap = texture;
                            break;

                        case "shine":
                            this.warn("Unsupported SceneJS feature - texture applyTo:'shine'");
                            break;
                    }

                    break;

                case "fresnel":

                    var fresnel = new xeogl.Fresnel(this.scene, {
                        id: this._createID(node)
                        // TODO
                    });

                    this._addComponent(fresnel);

                    switch (node.applyTo) {

                        case "baseColor":
                        case "color":
                            diffuseFresnel = fresnel;
                            break;

                        case "specular":
                            specularFresnel = fresnel;
                            break;

                        case "emit":
                            emissiveFresnel = fresnel;
                            break;

                        case "alpha":
                            alphaFresnel = fresnel;
                            break;
                    }

                    break;

                case "flags":

                    transparent = node.transparent;
                    backfaces = node.backfaces;

                    // TODO: pickable and clippable

                    break;

                case "layer":

                    layer = node.priority;

                    break;


                case "geometry":

                    var geometry = new xeogl.Geometry(this.scene, {
                        primitive: node.primitive,
                        positions: node.positions,
                        normals: node.normals,
                        uv: node.uv,
                        indices: node.indices
                    });

                    this._addComponent(geometry);

                    if (material) {

                        // Set properties on material component

                        material.diffuseMap = diffuseMap;
                        material.specularMap = specularMap;
                        material.emissiveMap = emissiveMap;
                        material.alphaMap = alphaMap;
                        material.normalMap = normalMap;

                        material.diffuseFresnel = diffuseFresnel;
                        material.specularFresnel = specularFresnel;
                        material.emissiveFresnel = emissiveFresnel;
                        material.alphaFresnel = alphaFresnel;

                        material.alphaMode = transparent ? "blend" : "opaque";

                        material.backfaces = !!backfaces;
                    }

                    var material2 = this.scene.components[material.id];
                    if (!material2) {
                        material2 = new xeogl[material.type.substring(6)](this.scene, material);
                    }

                    var mesh = new xeogl.Mesh(this.scene, {
                        id: this._createID(node),
                        geometry: geometry,
                        material: material2,
                        layer: layer
                    });

                    if (group) {
                        group.addChild(mesh);
                    } else {
                        this.addChild(mesh);
                    }

                    this._addComponent(mesh);

                    break;
            }

            var nodes = node.nodes;

            if (nodes) {
                for (var i = 0, len = nodes.length; i < len; i++) {
                    this._parse(
                        nodes[i],
                        group,
                        material,
                        diffuseMap,
                        specularMap,
                        emissiveMap,
                        normalMap,
                        alphaMap,
                        diffuseFresnel,
                        specularFresnel,
                        emissiveFresnel,
                        normalFresnel,
                        alphaFresnel,
                        transparent,
                        backfaces,
                        layer);
                }
            }
        }

        _createID(node, type) {
            return (node.id !== null && node.id !== undefined) ? ("" + this.id + "." + (type ? type + "." : "") + node.id) : null;
        }
    };

    function load(url, ok, error) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.addEventListener('load', function (event) {
            if (event.target.responseText) {
                try {
                    ok(JSON.parse(event.target.responseText));
                } catch (e) {
                    error('Invalid file [' + url + ']: ' + e);
                }
            } else {
                error('Invalid file [' + url + ']');
            }
        }, false);
        xhr.addEventListener('error', function () {
            error('Couldn\'t load URL [' + url + ']');
        }, false);
        xhr.open('GET', url, true);
        xhr.send(null);
    }

}