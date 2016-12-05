YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AABBGeometry",
        "AmbientLight",
        "Billboard",
        "Boundary2D",
        "Boundary3D",
        "BoundingSphereGeometry",
        "BoxGeometry",
        "BuildableModel",
        "Camera",
        "CameraControl",
        "CameraController",
        "CameraFlightAnimation",
        "CameraFollowAnimation",
        "CameraPath",
        "CameraPathAnimation",
        "Canvas",
        "Clip",
        "Clips",
        "ColorBuf",
        "Component",
        "Configs",
        "CubicBezierCurve",
        "Cull",
        "Curve",
        "CylinderGeometry",
        "DepthBuf",
        "DirLight",
        "Entity",
        "Fresnel",
        "Frustum",
        "GLTFModel",
        "Geometry",
        "GeometryBuilder",
        "HeightmapGeometry",
        "Input",
        "KeyboardAxisCamera",
        "KeyboardPanCamera",
        "KeyboardRotateCamera",
        "KeyboardZoomCamera",
        "Layer",
        "Lights",
        "Lookat",
        "Material",
        "Model",
        "Modes",
        "MousePanCamera",
        "MousePickEntity",
        "MouseRotateCamera",
        "MouseZoomCamera",
        "Nintendo3DSGeometry",
        "OBBGeometry",
        "OBJGeometry",
        "Ortho",
        "Path",
        "PathGeometry",
        "Perspective",
        "PhongMaterial",
        "PlaneGeometry",
        "PointLight",
        "QuadraticBezierCurve",
        "Quaternion",
        "Rotate",
        "Scale",
        "Scene",
        "SceneJSModel",
        "Skybox",
        "SphereGeometry",
        "Spinner",
        "SplineCurve",
        "Stage",
        "Stationary",
        "StereoEffect",
        "TeapotGeometry",
        "Texture",
        "TorusGeometry",
        "Transform",
        "Translate",
        "VectorTextGeometry",
        "Viewport",
        "Visibility",
        "ZSpaceEffect",
        "ZSpaceStylusControl",
        "xeogl",
        "xeogl.math.math"
    ],
    "modules": [
        "animation",
        "boundaries",
        "camera",
        "canvas",
        "clipping",
        "configs",
        "controls",
        "culling",
        "curves",
        "effects",
        "entities",
        "generation",
        "geometry",
        "input",
        "interaction",
        "lighting",
        "materials",
        "math",
        "model",
        "models",
        "rendering",
        "skyboxes",
        "transforms",
        "xeogl"
    ],
    "allModules": [
        {
            "displayName": "animation",
            "name": "animation",
            "description": "Components for animating state within Scenes."
        },
        {
            "displayName": "boundaries",
            "name": "boundaries",
            "description": "Components to support spatial queries (eg. collisions etc)."
        },
        {
            "displayName": "camera",
            "name": "camera",
            "description": "Camera components."
        },
        {
            "displayName": "canvas",
            "name": "canvas",
            "description": "Canvas-related things."
        },
        {
            "displayName": "clipping",
            "name": "clipping",
            "description": "Components for cross-section views of Entities."
        },
        {
            "displayName": "configs",
            "name": "configs",
            "description": "Components for managing Scene configuration."
        },
        {
            "displayName": "controls",
            "name": "controls",
            "description": "Components for controlling things with user input."
        },
        {
            "displayName": "culling",
            "name": "culling",
            "description": "Components for controlling the visibility of Entities."
        },
        {
            "displayName": "curves",
            "name": "curves",
            "description": "Components for defining 3D curves."
        },
        {
            "displayName": "effects",
            "name": "effects",
            "description": "Components for viewing effects."
        },
        {
            "displayName": "entities",
            "name": "entities",
            "description": "Entities."
        },
        {
            "displayName": "generation",
            "name": "generation",
            "description": "Components for generating xeogl content."
        },
        {
            "displayName": "geometry",
            "name": "geometry",
            "description": "Components for defining geometry."
        },
        {
            "displayName": "input",
            "name": "input",
            "description": "Components for capturing user input."
        },
        {
            "displayName": "interaction",
            "name": "interaction",
            "description": "A **CameraController** is the base class for components that control Cameras."
        },
        {
            "displayName": "lighting",
            "name": "lighting",
            "description": "Components for defining light sources."
        },
        {
            "displayName": "materials",
            "name": "materials",
            "description": "Components to define the surface appearance of Entities."
        },
        {
            "displayName": "math",
            "name": "math",
            "description": "Math utilities."
        },
        {
            "displayName": "model",
            "name": "model",
            "description": "An **SceneJSModel** is a {{#crossLink \"Model\"}}{{/crossLink}} that's loaded from the\nJSON-based <a href=\"http://scenejs.org\">SceneJS</a> scene definition format.\n\n<a href=\"../../examples/#models_SceneJSModel_tronTank\"><img src=\"http://i.giphy.com/l3vR50pFTpEbJTztS.gif\"></img></a>\n\n## Overview\n\n* A SceneJSModel is a container of {{#crossLink \"Component\"}}Components{{/crossLink}} that loads itself from SceneJS JSON.\n* It begins loading as soon as you set its {{#crossLink \"SceneJSModel/src:property\"}}{{/crossLink}}\nproperty to the location of a valid SceneJS JSON file.\n* You can set {{#crossLink \"SceneJSModel/src:property\"}}{{/crossLink}} to a new file path at any time, which causes\nthe SceneJSModel to clear itself and load components from the new file.\n* Can be transformed within World-space by attaching it to a {{#crossLink \"Transform\"}}{{/crossLink}}.\n* Provides its World-space boundary as a {{#crossLink \"Boundary3D\"}}{{/crossLink}}.\n\n<img src=\"../../../assets/images/SceneJSModel.png\"></img>\n\n## Examples\n\n* [Importing the SceneJS Tron Tank model](../../examples/#models_SceneJSModel_tronTank)\n\n## Usage\n\nImporting a <a href=\"../../examples/models/scenejs/tronTank.json\">SceneJS JSON model</a> into the default xeogl {{#crossLink \"Scene\"}}{{/crossLink}}:\n\n````javascript\n// Import SceneJS JSON model\nvar tank = new xeogl.SceneJSModel({\n   id: \"tank\",\n   src: \"models/scenejs/tronTank.min.json\",\n   transform: new xeogl.Rotate({ // Tank direction\n       xyz: [0, 1, 0],\n       angle: 0,\n       parent: new xeogl.Translate({ // Tank position\n           xyz: [0, 0, 0]\n       })\n   })\n});\n\n// Set camera position\nvar view = tank.scene.camera.view;\nview.eye = [0, 0, -70];\nview.look = [0, 0, 0];\nview.up = [0, 1, 0];\n````"
        },
        {
            "displayName": "models",
            "name": "models",
            "description": "Models are units of xeogl content."
        },
        {
            "displayName": "rendering",
            "name": "rendering",
            "description": "Components that influence the way entities are rendered with WebGL."
        },
        {
            "displayName": "skyboxes",
            "name": "skyboxes",
            "description": "Skybox components."
        },
        {
            "displayName": "transforms",
            "name": "transforms",
            "description": "Modelling transform components."
        },
        {
            "displayName": "xeogl",
            "name": "xeogl",
            "description": "The xeogl namespace."
        }
    ]
} };
});