YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AmbientLight",
        "Billboard",
        "Boundary2D",
        "Boundary3D",
        "BoundaryGeometry",
        "BoxGeometry",
        "Camera",
        "CameraControl",
        "CameraFlight",
        "CameraPath",
        "Canvas",
        "Clip",
        "Clips",
        "Collection",
        "CollectionBoundary",
        "ColorBuf",
        "ColorTarget",
        "Component",
        "Configs",
        "CubicBezierCurve",
        "Cull",
        "Curve",
        "CylinderGeometry",
        "DepthBuf",
        "DepthTarget",
        "DirLight",
        "Entity",
        "Fresnel",
        "Frustum",
        "Geometry",
        "Input",
        "KeyboardAxisCamera",
        "KeyboardPanCamera",
        "KeyboardRotateCamera",
        "KeyboardZoomCamera",
        "LatheGeometry",
        "Layer",
        "Lights",
        "Lookat",
        "Material",
        "Model",
        "Modes",
        "MorphTargets",
        "MousePanCamera",
        "MousePickEntity",
        "MouseRotateCamera",
        "MouseZoomCamera",
        "Ortho",
        "Path",
        "PathGeometry",
        "Perspective",
        "PhongMaterial",
        "PlaneGeometry",
        "PointLight",
        "Projection",
        "QuadraticBezierCurve",
        "Quaternion",
        "Reflect",
        "Rotate",
        "Scale",
        "Scene",
        "Shader",
        "ShaderParams",
        "Skybox",
        "SphereGeometry",
        "Spinner",
        "SplineCurve",
        "Stage",
        "Stationary",
        "Task",
        "Tasks",
        "Texture",
        "TorusGeometry",
        "Transform",
        "Translate",
        "Viewport",
        "Visibility",
        "XEO",
        "XEO.math.math"
    ],
    "modules": [
        "XEO",
        "animation",
        "boundaries",
        "camera",
        "canvas",
        "clipping",
        "collections",
        "configs",
        "controls",
        "culling",
        "curves",
        "entities",
        "geometry",
        "importing",
        "input",
        "lighting",
        "materials",
        "math",
        "rendering",
        "reporting",
        "shaders",
        "skyboxes",
        "transforms"
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
            "displayName": "collections",
            "name": "collections",
            "description": "Components for managing collections of components."
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
            "displayName": "entities",
            "name": "entities",
            "description": "Entities."
        },
        {
            "displayName": "geometry",
            "name": "geometry",
            "description": "A **PathGeometry** is a {{#crossLink \"Geometry\"}}{{/crossLink}} that is defined by a {{#crossLink \"Curve\"}}{{/crossLink}}.\n\n## Usage\n\nAn {{#crossLink \"Entity\"}}{{/crossLink}} with a PathGeometry, a {{#crossLink \"Path\"}}{{/crossLink}} and\na {{#crossLink \"PhongMaterial\"}}{{/crossLink}}:\n\n````javascript\nnew XEO.Entity({\n\n    geometry: new XEO.PathGeometry({\n\n       divisions: 10,\n\n       path: new XEO.Path({\n\n           // Subpaths\n\n           curves: [\n               new XEO.CubicBezierCurve({\n                   v0: [-10, 0, 0],\n                   v1: [-5, 15, 0],\n                   v2: [20, 15, 0],\n                   v3: [10, 0, 0]\n               }),\n               new XEO.QuadraticBezierCurve({\n                   v0: [10, 0, 0],\n                   v1: [30, 15, 0],\n                   v2: [20, 0, 0]\n               }),\n               new XEO.SplineCurve({\n                   points: [\n                       [20, 0, 0],\n                       [-5, 15, 0],\n                       [20, 15, 0],\n                       [10, 0, 0]\n                   ]\n               })\n           ]\n       })\n    }),\n\n    material: new XEO.PhongMaterial(\n       diffuse: [1,0,0]\n    })\n});\n````"
        },
        {
            "displayName": "importing",
            "name": "importing",
            "description": "Imports content from files."
        },
        {
            "displayName": "input",
            "name": "input",
            "description": "Components for capturing user input."
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
            "displayName": "rendering",
            "name": "rendering",
            "description": "Components that influence the way entities are rendered with WebGL."
        },
        {
            "displayName": "reporting",
            "name": "reporting",
            "description": "Components for reporting Scene statistics."
        },
        {
            "displayName": "shaders",
            "name": "shaders",
            "description": "Components for defining custom GLSL shaders."
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
            "displayName": "XEO",
            "name": "XEO",
            "description": "The xeoEngine namespace."
        }
    ]
} };
});