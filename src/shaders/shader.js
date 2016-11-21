/**
 A **Shader** specifies a custom GLSL shader to apply when rendering attached {{#crossLink "Entity"}}Entities{{/crossLink}}.


 * Normally you would rely on xeogl to automatically generate shaders for you, however the Shader component allows you to author them manually.
 * You can use xeogl's reserved uniform and variable names in your Shaders to read all the WebGL state that's set by other
 components on the attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * Use Shaders in combination with {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} components when you need to share
 the same Shaders among multiple {{#crossLink "Entity"}}Entities{{/crossLink}} while setting the Shaders' uniforms
 differently for each {{#crossLink "Entity"}}Entity{{/crossLink}}.
 * Use {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}}
 and {{#crossLink "Texture"}}Texture{{/crossLink}} components to connect the output of one Shader as input into another Shader.


 <img src="../../../assets/images/Shader.png"></img>

 ## Usage

 This example shows the simplest way to use a Shader, where we're just going to render a ripply water
 pattern to a screen-aligned quad.

 <img src="../../assets/images/shaderExample1.png"></img>

 In our scene definition, we have an  {{#crossLink "Entity"}}Entity{{/crossLink}} that has a {{#crossLink "Geometry"}}Geometry{{/crossLink}} that is our
 screen-aligned quad, plus a Shader that will render the fragments of that quad with our rippling water pattern.
 Finally, we animate the rippling by periodically updating the Shader's "time" uniform.

 ````javascript
 // Shader that's used by our Entity. Note the 'xeo_aPosition' and 'xeo_aUV attributes',
 // which will receive the positions and UVs from the Geometry. Also note the 'time'
 // uniform, which we'll be animating via Shader#setParams.

 var shader = new xeogl.Shader({

    // Vertex shading stage
    vertex: [
        "attribute vec3 xeo_aPosition;",
        "attribute vec2 xeo_aUV;",
        "varying vec2 vUv;",
        "void main () {",
        "    gl_Position = vec4(xeo_aPosition, 1.0);",
        "    vUv = xeo_aUV;",
        "}"
    ],

    // Fragment shading stage
    fragment: [
        "precision mediump float;",

        "uniform float time;",
        "varying vec2 vUv;",

        "void main( void ) {",
        "    vec2 sp = vUv;",
        "    vec2 p = sp*5.0 - vec2(10.0);",
        "    vec2 i = p;",
        "    float c = 1.0;",
        "    float inten = 0.10;",
        "    for (int n = 0; n < 10; n++) {",
        "        float t = time * (1.0 - (3.0 / float(n+1)));",
        "        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
        "        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));",
        "    }",
        "    c /= float(10);",
        "    c = 1.5-sqrt(c);",
        "    gl_FragColor = vec4(vec3(c*c*c*c), 999.0) + vec4(0.0, 0.3, 0.5, 1.0);",
        "}"
    ],

    // Initial value for the 'time' uniform in the fragment stage.
    params: {
        time: 0.0
    }
 });

 // A screen-aligned quad
 var quad = new xeogl.Geometry({
    primitive:"triangles",
    positions:[ 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0 ],
    normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
    uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
    indices:[ 0, 1, 2, 0, 2, 3 ]
 });

 var entity = new xeogl.Entity(scene, {
    shader: shader,
    geometry: quad
 });

 ````
 Now let's animate the "time" parameter on the Shader, to make the water ripple:

 ```` javascript
 entity.scene.on("tick", function(params) {
     shader.setParams({
         time: params.timeElapsed
     });
 });
 ````

 ## <a name="inputs">Shader Inputs</a>

 xeogl provides the following inputs for your shaders (work in progress).

 #### Attributes

 *Attributes are used only in vertex shaders*

 | Attribute  | Description | Depends on  |
 |---|---|
 | attribute vec3 xeo_aPosition   | Geometry vertex positions | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} |
 | attribute vec2 xeo_aUV         | Geometry vertex UV coordinates | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |
 | attribute vec3 xeo_aNormal     | Geometry vertex normals | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}}  |
 | attribute vec4 xeo_aColor      | Geometry vertex colors  | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/colors:property"}}{{/crossLink}}  |
 | attribute vec4 xeo_aTangent    | Geometry vertex tangents, for normal mapping | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}} and {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |

 #### Uniforms

 *Uniforms are used in vertex and fragment shaders*

 | Uniform  | Description | Depends on  |
 |---|---|
 | uniform mat4  xeo_uModelMatrix                                   | Modelling transform matrix | {{#crossLink "Transform"}}{{/crossLink}} |
 | uniform mat4  xeo_uModelNormalMatrix                             | Modelling transform normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Transform"}}{{/crossLink}} |
 | uniform mat4  xeo_uViewMatrix                                    | View transform matrix | {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  xeo_uViewNormalMatrix                              | View transform normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  xeo_uProjMatrix                                    | Projection transform matrix | {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float xeo_uZNear                                         | Near clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float xeo_uZFar                                          | Far clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 |---|---|
 | uniform vec3  xeo_uLightAmbientColor                             | Color of the first {{#crossLink "AmbientLight"}}{{/crossLink}} in {{#crossLink "Lights"}}{{/crossLink}}| {{#crossLink "AmbientLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightColor&lt;***N***&gt;                    | Diffuse color of {{#crossLink "DirLight"}}{{/crossLink}} or {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "DirLight"}}{{/crossLink}} or {{#crossLink "PointLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightIntensity&lt;***N***&gt;                   | Specular color of {{#crossLink "DirLight"}}{{/crossLink}} or {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "DirLight"}}{{/crossLink}} or {{#crossLink "PointLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightDir&lt;***N***&gt;                        | Direction of {{#crossLink "DirLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "DirLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightPos&lt;***N***&gt;                        | Position of {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "PointLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightConstantAttenuation&lt;***N***&gt;        | Constant attenuation factor for {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "PointLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightLinearAttenuation&lt;***N***&gt;          | Linear attenuation factor for {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "PointLight"}}{{/crossLink}} |
 | uniform vec3 xeo_uLightQuadraticAttenuation&lt;***N***&gt;       | Quadratic attenuation factor for {{#crossLink "PointLight"}}{{/crossLink}} at index ***N*** in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "PointLight"}}{{/crossLink}} |
 |---|---|
 | uniform vec3 xeo_uDiffuse;       |  | {{#crossLink "PhongMaterial/diffuse:property"}}{{/crossLink}} |
 | uniform vec3 xeo_uSpecular;       |  | {{#crossLink "PhongMaterial/specular:property"}}{{/crossLink}} |
 | uniform vec3 xeo_uEmissive;       |  | {{#crossLink "PhongMaterial/emissive:property"}}{{/crossLink}} |
 | uniform float xeo_uOpacity;       |  | {{#crossLink "PhongMaterial/opacity:property"}}{{/crossLink}} |
 | uniform float xeo_uShininess;       |  | {{#crossLink "PhongMaterial/shininess:property"}}{{/crossLink}} |
 | uniform float xeo_uDiffuseFresnelEdgeBias;       |  | {{#crossLink "Fresnel/edgeBias:property"}}{{/crossLink}} |

 #### Varying

 *Varying types are used in fragment shaders*

 | Varying | Description | Depends on  |
 |---|---|---|
 | varying vec4 xeo_vWorldPosition | |
 | varying vec4 xeo_vViewPosition | |
 | varying vec4 xeo_vColor | |

 #### Samplers

 *Samplers are used in fragment shaders*

 | Varying | Description | Depends on  |
 |---|---|---|



 @module xeogl
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Shader in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Shader.
 @param [cfg.vertex=null] {String} GLSL Depends on code for the vertex shading staging.
 @param [cfg.fragment=null] {String} GLSL source code for the fragment shading staging.
 @param [cfg.params={}] {Object} Values for uniforms defined in the vertex and/or fragment stages.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Shader = xeogl.Component.extend({

        type: "xeogl.Shader",

        _init: function (cfg) {

            this._state = new xeogl.renderer.Shader({
                vertex: null,
                fragment: null,
                params: {}
            });

            this.vertex = cfg.vertex;

            this.fragment = cfg.fragment;

            this.setParams(cfg.params);
        },

        _props: {

            /**
             * GLSL source code for this Shader's vertex stage.
             *
             * Fires a {{#crossLink "Shader/vertex:event"}}{{/crossLink}} event on change.
             *
             * @property vertex
             * @default null
             * @type String
             */
            vertex: {

                set: function (value) {

                    this._state.vertex = value;

                    // Trigger recompile
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Shader's {{#crossLink "Shader/vertex:property"}}{{/crossLink}} property changes.
                     *
                     * @event vertex
                     * @param value The property's new value
                     */
                    this.fire("vertex", this._state.vertex);
                },

                get: function () {
                    return this._state.vertex;
                }
            },

            /**
             * GLSL source code for this Shader's fragment stage.
             *
             * Fires a {{#crossLink "Shader/fragment:event"}}{{/crossLink}} event on change.
             *
             * @property fragment
             * @default null
             * @type String
             */
            fragment: {

                set: function (value) {

                    this._state.fragment = value;

                    // Trigger recompile
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Shader's {{#crossLink "Shader/fragment:property"}}{{/crossLink}} property changes.
                     *
                     * @event fragment
                     * @param value The property's new value
                     */
                    this.fire("fragment", this._state.fragment);
                },

                get: function () {
                    return this._state.fragment;
                }
            },

            /**
             * Params for this Shader.
             *
             * Fires a {{#crossLink "Shader/params:event"}}{{/crossLink}} event on change.
             *
             * @property params
             * @default {}
             * @type {}
             */
            params: {

                get: function () {
                    return this._state.params;
                }
            }
        },

        /**
         * Sets one or more params for this Shader.
         *
         * These will be individually overridden by any {{#crossLink "ShaderParams/setParams:method"}}params subsequently specified{{/crossLink}} on
         * {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
         *
         * Fires a {{#crossLink "Shader/params:event"}}{{/crossLink}} event on change.
         *
         * @method setParams
         * @param {} [params={}] Values for params to set on this Shader, keyed to their names.
         */
        setParams: function (params) {

            for (var name in params) {
                if (params.hasOwnProperty(name)) {
                    this._state.params[name] = params[name];
                }
            }

            this._renderer.imageDirty = true;

            /**
             * Fired whenever this Shader's  {{#crossLink "Shader/params:property"}}{{/crossLink}}
             * property has been updated.
             *
             * @event params
             * @param value The property's new value
             */
            this.fire("params", this._state.params);
        },

        _compile: function () {
            this._renderer.shader = this._state;
        },

        _getJSON: function () {

            var json = {
                params: this._state.params
            };

            if (this._state.vertex) {
                json.vertex = this._state.vertex;
            }

            if (this._state.fragment) {
                json.fragment = this._state.fragment;
            }

            return json;
        }
    });

})();
