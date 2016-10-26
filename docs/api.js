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
        "CameraController",
        "CameraFlight",
        "Canvas",
        "Cardboard",
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
        "HeightmapGeometry",
        "HighlightEntityEffect",
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
        "glTFModel",
        "xeogl",
        "xeogl.math.math"
    ],
    "modules": [
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
        "effects",
        "entities",
        "geometry",
        "importing",
        "input",
        "interaction",
        "lighting",
        "materials",
        "math",
        "model",
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
            "displayName": "importing",
            "name": "importing",
            "description": "A **glTF** loads content from a <a href=\"https://github.com/KhronosGroup/glTF\" target = \"_other\">glTF</a> file into its parent {{#crossLink \"Scene\"}}{{/crossLink}}.\n\n<ul><li>A glTF begins loading as soon as it's {{#crossLink \"glTF/src:property\"}}{{/crossLink}}\nproperty is set to the location of a valid glTF file.</li>\n<li>A glTF keeps all its loaded components in a {{#crossLink \"Collection\"}}{{/crossLink}}.</li>\n<li>A glTF can be attached to an animated and dynamically-editable\nglTFling {{#crossLink \"Transform\"}}{{/crossLink}} hierarchy, to rotate, translate and scale it within the World-space coordinate system, in the\nsame way that an {{#crossLink \"Entity\"}}{{/crossLink}} can.</li>\n<li>You can set a glTF's {{#crossLink \"glTF/src:property\"}}{{/crossLink}} property to a new file path at any time,\nwhich will cause it to load components from the new file (destroying any components loaded previously).</li>\n</ul>\n\n<img src=\"../../../assets/images/glTF.png\"></img>\n\n## Examples\n\n<ul>\n<li>[Gearbox](../../examples/#importing_gltf_gearbox)</li>\n<li>[Buggy](../../examples/#importing_gltf_buggy)</li>\n<li>[Reciprocating Saw](../../examples/#importing_gltf_ReciprocatingSaw)</li>\n<li>[Textured Duck](../../examples/#importing_gltf_duck)</li>\n<li>[glTF with entity explorer UI](../../examples/#demos_ui_explorer)</li>\n<li>[Fly camera to glTF entities](../../examples/#boundaries_flyToBoundary)</li>\n<li>[Ensuring individual materials on glTF entities](../../examples/#importing_gltf_techniques_uniqueMaterials)</li>\n<li>[Baking transform hierarchies](../../examples/#importing_gltf_techniques_bakeTransforms)</li>\n<li>[Attaching transforms to glTFs, via constructor](../../examples/#importing_gltf_techniques_configTransform)</li>\n<li>[Attaching transforms to glTFs, via property](../../examples/#importing_gltf_techniques_attachTransform)</li>\n</ul>\n\n## Tutorials\n\nFind API documentation for glTF here:\n\n<ul>\n<li>[Importing glTF](https://github.com/xeolabs/xeogl/wiki/Importing-glTF)</li>\n</ul>"
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
            "description": "Imports content from files."
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