/**
 The xeogl namespace.

 @class xeogl
 @main xeogl
 @static
 @author xeolabs / http://xeolabs.com/
 */
import {core} from "./core.js";
import {tasks} from "./tasks.js";
import {loop} from "./loop.js";
import {utils} from "./utils.js";

// Core framework

export {WEBGL_INFO} from "./webglInfo.js";
export {stats}  from "./stats.js";
export {math} from "./math/math.js";

export const scenes = core.scenes;
export const getDefaultScene = core.getDefaultScene;
export const setDefaultScene = core.setDefaultScene;
export const scheduleTask = tasks.scheduleTask;
export const clear = core.clear;
export const _isString = utils.isString; // Backward compat
export const _apply = utils.apply; // Backward compat
export const _isNumeric = utils.isNumeric;

// Component classes

export {Component} from "./component.js";
export {CameraFlightAnimation} from './animation/cameraFlightAnimation.js';
export {Canvas} from "./canvas/canvas.js";
export {Spinner} from "./canvas/spinner.js";
export {Clip} from "./clipping/clip.js";
export {CameraControl} from "./controls/cameraControl.js";
export {Geometry} from "./geometry/geometry.js";
export {BoxGeometry} from "./geometry/boxGeometry.js";
export {TorusGeometry} from "./geometry/torusGeometry.js";
export {SphereGeometry} from "./geometry/sphereGeometry.js";
export {OBBGeometry} from "./geometry/obbGeometry.js";
export {AABBGeometry}  from "./geometry/aabbGeometry.js";
export {CylinderGeometry} from "./geometry/cylinderGeometry.js";
export {PlaneGeometry} from "./geometry/planeGeometry.js";
export {Input} from "./input/input.js";
export {AmbientLight} from "./lighting/ambientLight.js";
export {DirLight} from "./lighting/dirLight.js";
export {PointLight} from "./lighting/pointLight.js";
export {SpotLight} from "./lighting/spotLight.js";
export {CubeTexture} from "./lighting/cubeTexture.js";
export {LightMap} from "./lighting/lightMap.js";
export {ReflectionMap} from "./lighting/reflectionMap.js";
export {Shadow} from "./lighting/shadow.js";
export {Model} from "./models/model.js";
export {Mesh} from "./objects/mesh.js";
export {Group} from "./objects/group.js";
export {xeoglObject as Object} from "./objects/object.js";
export {Material} from "./materials/material.js";
export {PhongMaterial} from "./materials/phongMaterial.js";
export {LambertMaterial} from "./materials/lambertMaterial.js";
export {SpecularMaterial} from "./materials/specularMaterial.js";
export {MetallicMaterial} from "./materials/metallicMaterial.js";
export {EmphasisMaterial} from "./materials/emphasisMaterial.js";
export {EdgeMaterial} from "./materials/edgeMaterial.js";
export {OutlineMaterial} from "./materials/outlineMaterial.js";
export {Texture} from "./materials/texture.js";
export {Fresnel} from "./materials/fresnel.js";
export {Viewport} from "./viewport/viewport.js";
export {Camera} from "./camera/camera.js";
export {Frustum} from "./camera/frustum.js";
export {Ortho} from "./camera/ortho.js";
export {Perspective} from "./camera/perspective.js";
export {CustomProjection} from "./camera/customProjection.js"
export {Scene} from "./scene/scene.js";


