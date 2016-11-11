YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AmbientLight",
        "Billboard",
        "Boundary2D",
        "Boundary3D",
        "BoundaryGeometry",
        "BoxGeometry",
        "BuildableModel",
        "Camera",
        "CameraControl",
        "CameraController",
        "CameraFlight",
        "CameraFollow",
        "CameraPath",
        "CameraPathPlayer",
        "Canvas",
        "Cardboard",
        "Clip",
        "Clips",
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
        "GLTFModel",
        "Geometry",
        "HeightmapGeometry",
        "HighlightEntityEffect",
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
        "MorphTargets",
        "MousePanCamera",
        "MousePickEntity",
        "MouseRotateCamera",
        "MouseZoomCamera",
        "Nintendo3DSGeometry",
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
        "Shader",
        "ShaderParams",
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
        "WebVR",
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
        "geometry",
        "input",
        "interaction",
        "lighting",
        "materials",
        "math",
        "models",
        "paths",
        "rendering",
        "shaders",
        "skyboxes",
        "transforms",
        "webvr",
        "xeo",
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
            "displayName": "models",
            "name": "models",
            "description": "Models are units of xeogl content."
        },
        {
            "displayName": "paths",
            "name": "paths",
            "description": "A **Path** is a complex curved path constructed from various {{#crossLink \"Curve\"}}{{/crossLink}} subtypes.\n\n<ul>\n<li>A Path can be constructed from these {{#crossLink \"Curve\"}}{{/crossLink}} subtypes: {{#crossLink \"SplineCurve\"}}{{/crossLink}},\n{{#crossLink \"CubicBezierCurve\"}}{{/crossLink}} and {{#crossLink \"QuadraticBezierCurve\"}}{{/crossLink}}.</li>\n<li>You can sample a {{#crossLink \"Path/point:property\"}}{{/crossLink}} and a {{#crossLink \"Curve/tangent:property\"}}{{/crossLink}}\nvector on a Path for any given value of {{#crossLink \"Path/t:property\"}}{{/crossLink}} in the range [0..1].</li>\n<li>When you set {{#crossLink \"Path/t:property\"}}{{/crossLink}} on a Path, its\n{{#crossLink \"Path/point:property\"}}{{/crossLink}} and {{#crossLink \"Curve/tangent:property\"}}{{/crossLink}} properties\nwill update accordingly.</li>\n</ul>\n\n## Examples\n\n<ul>\n<li>[CubicBezierCurve example](../../examples/#curves_CubicBezierCurve)</li>\n<li>[Tweening position along a QuadraticBezierCurve](../../examples/#curves_QuadraticBezierCurve)</li>\n<li>[Tweening color along a QuadraticBezierCurve](../../examples/#curves_QuadraticBezierCurve_color)</li>\n<li>[SplineCurve example](../../examples/#curves_SplineCurve)</li>\n<li>[Path example](../../examples/#curves_Path)</li>\n</ul>\n\n## Usage\n\n#### Animation along a SplineCurve\n\nCreate a Path containing a {{#crossLink \"CubicBezierCurve\"}}{{/crossLink}}, a {{#crossLink \"QuadraticBezierCurve\"}}{{/crossLink}}\nand a {{#crossLink \"SplineCurve\"}}{{/crossLink}}, subscribe to updates on its {{#crossLink \"Path/point:property\"}}{{/crossLink}} and\n{{#crossLink \"Curve/tangent:property\"}}{{/crossLink}} properties, then vary its {{#crossLink \"Path/t:property\"}}{{/crossLink}}\nproperty over time:\n\n````javascript\nvar path = new xeogl.Path({\n    curves: [\n        new xeogl.CubicBezierCurve({\n            v0: [-10, 0, 0],\n            v1: [-5, 15, 0],\n            v2: [20, 15, 0],\n            v3: [10, 0, 0]\n        }),\n        new xeogl.QuadraticBezierCurve({\n            v0: [10, 0, 0],\n            v1: [20, 15, 0],\n            v2: [10, 0, 0]\n        }),\n        new xeogl.SplineCurve({\n            points: [\n                [10, 0, 0],\n                [-5, 15, 0],\n                [20, 15, 0],\n                [10, 0, 0]\n            ]\n        })\n    ]\n});\n\npath.on(\"point\", function(point) {\n    this.log(\"path.point=\" + JSON.stringify(point));\n});\n\npath.on(\"tangent\", function(tangent) {\n    this.log(\"path.tangent=\" + JSON.stringify(tangent));\n});\n\npath.on(\"t\", function(t) {\n    this.log(\"path.t=\" + t);\n});\n\npath.scene.on(\"tick\", function(e) {\n    path.t = (e.time - e.startTime) * 0.01;\n});\n````\n\n#### Randomly sampling points\n\nUse Path's {{#crossLink \"Path/getPoint:method\"}}{{/crossLink}} and\n{{#crossLink \"path/getTangent:method\"}}{{/crossLink}} methods to sample the point and vector\nat a given **t**:\n\n````javascript\npath.scene.on(\"tick\", function(e) {\n\n    var t = (e.time - e.startTime) * 0.01;\n\n    var point = path.getPoint(t);\n    var tangent = path.getTangent(t);\n\n    this.log(\"t=\" + t + \", point=\" + JSON.stringify(point) + \", tangent=\" + JSON.stringify(tangent));\n});\n````\n\n#### Sampling multiple points\n\nUse Path's {{#crossLink \"path/getPoints:method\"}}{{/crossLink}} method to sample a list of equidistant points\nalong it. In the snippet below, we'll build a {{#crossLink \"Geometry\"}}{{/crossLink}} that renders a line along the\npath.  Note that we need to flatten the points array for consumption by the {{#crossLink \"Geometry\"}}{{/crossLink}}.\n\n````javascript\nvar geometry = new xeogl.Geometry({\n    positions: xeogl.math.flatten(path.getPoints(50))\n});\n````"
        },
        {
            "displayName": "rendering",
            "name": "rendering",
            "description": "Components that influence the way entities are rendered with WebGL."
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
            "displayName": "webvr",
            "name": "webvr",
            "description": "Components for Web-based Virtual Reality."
        },
        {
            "displayName": "xeo",
            "name": "xeo"
        },
        {
            "displayName": "xeogl",
            "name": "xeogl",
            "description": "The xeogl namespace."
        }
    ]
} };
});