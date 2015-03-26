/**
 A **Shader** specifies a custom GLSL shader to apply when rendering attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

## Overview

 <ul>
 <li>Normally you would rely on xeoEngine to automatically generate shaders for you, however the Shader component allows you to author them manually.</li>
 <li>You can use xeoEngine's reserved uniform and variable names in your Shaders to read all the WebGL state that's set by other
 components on the attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>
 <li>Use Shaders in combination with {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} components when you need to share
 the same Shaders among multiple {{#crossLink "GameObject"}}GameObjects{{/crossLink}} while setting the Shaders' uniforms
 differently for each {{#crossLink "GameObject"}}GameObject{{/crossLink}}.</li>
 <li>Use {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, {{#crossLink "DepthTarget"}}DepthTarget{{/crossLink}}
 and {{#crossLink "Texture"}}Texture{{/crossLink}} components to connect the output of one Shader as input into another Shader.</li>
 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7105141/L.png"></img>

 ## Example

 This example shows the simplest way to use a Shader, where we're just going to render a ripply water
 pattern to a screen-aligned quad.

 <img src="../../assets/images/shaderExample1.png"></img>

 In our scene definition, we have an  {{#crossLink "GameObject"}}GameObject{{/crossLink}} that has a {{#crossLink "Geometry"}}Geometry{{/crossLink}} that is our
 screen-aligned quad, plus a Shader that will render the fragments of that quad with our cool rippling water pattern.
 Finally, we animate the rippling by periodically updating the Shader's "time" uniform.

 ````javascript

 var scene = new XEO.Scene();

 // Shader that's used by our GameObject. Note the 'XEO_aPosition' and 'XEO_aUV attributes',
 // which will receive the positions and UVs from the Geometry. Also note the 'time'
 // uniform, which we'll be animating via Shader#setParams.

 var shader = new XEO.Shader(scene, {

       // Vertex shading stage
       vertex: [
           "attribute vec3 XEO_aPosition;",
           "attribute vec2 XEO_aUV;",
           "varying vec2 vUv;",
           "void main () {",
           "    gl_Position = vec4(XEO_aPosition, 1.0);",
           "    vUv = XEO_aUV;",
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
 var quad = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var object = new XEO.GameObject(scene, {
       shader: shader,
       geometry: quad
  });

 ````
 Now let's animate the "time" parameter on the Shader, to make the water ripple:

 ```` javascript
 scene.on("tick", function(params) {
            shader.setParams({
                time: params.timeElapsed
            });
        });
 ````

 ## Shader Inputs

 xeoEngine provides the following inputs for your shaders.

 **TODO - this section is under construction**

 #### Attributes

 *Attributes are used in vertex shaders*

 | Attribute  | Description | Depends on  |
 |---|---|
 | attribute vec3   XEO_aPosition   | Vertex positions | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/positions:property"}}{{/crossLink}} |
 | attribute vec2   XEO_aUV         | UV coordinates | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |
 | attribute vec3   XEO_aNormal     | Normal vectors | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}}  |
 | attribute vec4   XEO_aVertexColor  | Vertex colors  | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/colors:property"}}{{/crossLink}}  |
 | attribute vec4 XEO_aTangent    | Tangent vectors for normal mapping | {{#crossLink "Geometry"}}Geometry{{/crossLink}} {{#crossLink "Geometry/normals:property"}}{{/crossLink}} and {{#crossLink "Geometry/uv:property"}}{{/crossLink}}  |

 #### Uniforms

 *Uniforms are used in vertex and fragment shaders*

 | Uniform  | Description | Depends on  |
 |---|---|
 | uniform mat4  XEO_uMNMatrix               | Modelling normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Transform"}}{{/crossLink}} |
 | uniform mat4  XEO_uVMatrix                | View matrix | {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  XEO_uVNMatrix               | View normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Lookat"}}Lookat{{/crossLink}} |
 | uniform mat4  XEO_uPMatrix                | Projection matrix | {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform mat4  XEO_uPNMatrix               | Projection normal matrix | {{#crossLink "Geometry/normals:property"}}Geometry normals{{/crossLink}} and {{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float XEO_uZNear                  | Near clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform float XEO_uZFar                   | Far clipping plane |{{#crossLink "Ortho"}}Ortho{{/crossLink}}, {{#crossLink "Frustum"}}Frustum{{/crossLink}} or {{#crossLink "Perspective"}}Perspective{{/crossLink}} |
 | uniform vec3  XEO_uAmbientColor | Ambient light color | {{#crossLink "AmbientLight"}}{{/crossLink}} |
 | uniform vec3 XEO_uLightDir&lt;N&gt; | Direction of {{#crossLink "DirLight"}}{{/crossLink}} at index N in {{#crossLink "Lights"}}{{/crossLink}} | {{#crossLink "DirLight"}}{{/crossLink}} |




 #### Varying

 *Varying types are used in fragment shaders*

 | Varying | Description | Depends on  |
 |---|---|
 | varying vec4 XEO_vWorldVertex | |
 | varying vec4 XEO_vViewVertex | |
 | varying vec4 XEO_vColor | |


 @class Shader
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Shader in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Shader.
 @param [cfg.vertex=null] {String} GLSL Depends on code for the vertex shading staging.
 @param [cfg.fragment=null] {String} GLSL source code for the fragment shading staging.
 @param [cfg.params={}] {GameObject} Values for uniforms defined in the vertex and/or fragment stages.
 @extends Component
 */
(function () {

    "use strict";

    XEO.Shader = XEO.Component.extend({

        className: "XEO.Shader",

        type: "shader",

        _init: function (cfg) {
            this._state.shaders = {};
            this.vertex = cfg.vertex;
            this.fragment = cfg.fragment;
            this.setParams(cfg.params);
        },

        _props: {

            /**
             * GLSL source code for the vertex stage of this shader.
             *
             * Fires a {{#crossLink "Shader/vertex:event"}}{{/crossLink}} event on change.
             *
             * @property vertex
             * @default null
             * @type String
             */
            vertex: {

                set: function (value) {
                    this._state.shaders.vertex = value;

                    // Trigger recompile
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Shader's {{#crossLink "Shader/vertex:property"}}{{/crossLink}} property changes.
                     * @event vertex
                     * @param value The property's new value
                     */
                    this.fire("vertex", value);
                },

                get: function () {
                    return this._state.shaders.vertex;
                }
            },

            /**
             * GLSL source code for the fragment stage of this shader.
             *
             * Fires a {{#crossLink "Shader/fragment:event"}}{{/crossLink}} event on change.
             *
             * @property fragment
             * @default null
             * @type String
             */
            fragment: {

                set: function (value) {
                    this._state.shaders.fragment = value;

                    // Trigger recompile
                    this.fire("dirty", true);

                    /**
                     * Fired whenever this Shader's {{#crossLink "Shader/fragment:property"}}{{/crossLink}} property changes.
                     * @event fragment
                     * @param value The property's new value
                     */
                    this.fire("fragment", value);
                },

                get: function () {
                    return this._state.shaders.fragment;
                }
            },

            /**
             * Params for this shader.
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
         * {{#crossLink "ShaderParams"}}ShaderParams{{/crossLink}} on attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.
         *
         * Fires a {{#crossLink "Shader/params:event"}}{{/crossLink}} event on change.
         *
         * @method setParams
         * @param {} [params={}] Values for params to set on this Shader, keyed to their names.
         */
        setParams: function (params) {
            this._state.params = this._state.params || {};
            for (var name in params) {
                if (params.hasOwnProperty(name)) {
                    this._state.params[name] = params[name];
                }
            }
            this._renderer.imageDirty = true;

            /**
             * Fired whenever this Shader's  {{#crossLink "Shader/params:property"}}{{/crossLink}} property has been updated.
             * @event params
             * @param value The property's new value
             */
            this.fire("params", this._state.params);
        },


        _compile: function () {
            this._renderer.shader = this._state;
        },

        _getJSON: function () {
            return {
                vertex: this.vertex,
                fragment: this.fragment,
                params: this.params
            };
        }
    });

})();