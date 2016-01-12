/**
 A **ShaderParams** sets uniform values for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview

 <ul>
 <li>Use ShaderParams components when you need to share the same {{#crossLink "Shader"}}Shaders{{/crossLink}} among multiple {{#crossLink "Entity"}}Entities{{/crossLink}},
 while setting the {{#crossLink "Shader"}}Shaders{{/crossLink}}' uniforms differently for each {{#crossLink "Entity"}}Entity{{/crossLink}}.</li>
 </ul>

 <img src="../../../assets/images/ShaderParams.png"></img>

 ## Example

 This example shows the simplest way to use a {{#crossLink "Shader"}}Shader{{/crossLink}}, where we're just going to render a ripply water
 pattern to a screen-aligned quad. As with all our examples, we're just creating the
 essential components while falling back on the <a href="XEO.Scene.html#defaults" class="crosslink">Scene's default components</a>
 for everything else.

 <img src="../../assets/images/shaderParamsExample1.png"></img>

 In our scene definition, we have an  {{#crossLink "Entity"}}Entity{{/crossLink}} that has a {{#crossLink "Geometry"}}Geometry{{/crossLink}} that is our
 screen-aligned quad, plus a {{#crossLink "Shader"}}Shader{{/crossLink}} that will render the fragments of that quad with our cool rippling water pattern.
 Finally, we animate the rippling by periodically updating the {{#crossLink "Shader"}}Shader{{/crossLink}}'s "time" uniform.

 ````javascript
 var scene = new XEO.Scene();

 // Shader that's shared by both our Entities. Note the 'xeo_aPosition' and 'xeo_aUV attributes',
 // which will receive the positions and UVs from the Geometry components. Also note the 'time'
 // uniform, which we'll be animating via the ShaderParams components.

 var shader = new XEO.Shader(scene, {

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

       // Initial values for the 'time' uniform in the fragment stage.
       params: {
           time: 0.0
       }
  });

 // First Object using our Shader, with a quad covering the left half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var quad1 = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var shaderParams1 = new XEO.ShaderParams(scene, {
       params: {
           time: 0.0
       }
  });

 var object1 = new XEO.Entity(scene, {
       shader: shader,
       geometry: quad1,
       shaderParams1: shaderParams1
  });

 // Second Object using the Shader, with a quad covering the right half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var quad2 = new XEO.Geometry(scene, {
       primitive:"triangles",
       positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
       normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
       uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
       indices:[ 0, 1, 2, 0, 2, 3 ]
  });

 var shaderParams2 = new XEO.ShaderParams(scene, {
       params: {
           time: 0.0
       }
  });

 var object2 = new XEO.Entity(scene, {
       shader: shader,
       geometry2: quad2,
       shaderParams2: shaderParams2
  });

 ````
 Now let's animate the "time" parameter on the Shader, for each Object independently:

 ```` javascript
 scene.on("tick", function(params) {

            shaderParams1.setParams({
                time: params.timeElapsed
            });

            shaderParams2.setParams({
                time: params.timeElapsed  * 0.5
            });
        });
 ````
 @class ShaderParams
 @module XEO
 @submodule shaders
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ShaderParams in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ShaderParams.
 @param [cfg.params={}] {Object} The {{#crossLink "Shader"}}Shader{{/crossLink}} parameter values.
 @extends Component
 */
(function () {

    "use strict";

    XEO.ShaderParams = XEO.Component.extend({

        type: "XEO.ShaderParams",

        _init: function (cfg) {

            this._state = new XEO.renderer.ShaderParams({
                params: {}
            });

            this.setParams(cfg.params);
        },

        _props: {

            /**
             * Params for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached
             * {{#crossLink "Entity"}}Entities{{/crossLink}}.
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
         * Sets one or more params for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached
         * {{#crossLink "Entity"}}Entities{{/crossLink}}.
         *
         * These will individually override any params of the same names that are {{#crossLink "Shader/setParams:method"}}already specified{{/crossLink}} on
         * those {{#crossLink "Shader"}}Shaders{{/crossLink}}.
         *
         * Fires a {{#crossLink "ShaderParams/params:event"}}{{/crossLink}} event on change.
         *
         * @method setParams
         * @param {} [params={}] Values for params to set on the {{#crossLink "Shader"}}Shaders{{/crossLink}}, keyed to their names.
         */
        setParams: function (params) {

            for (var name in params) {
                if (params.hasOwnProperty(name)) {
                    this._state.params[name] = params[name];
                }
            }

            this._renderer.imageDirty = true;

            /**
             * Fired whenever this ShaderParams' {{#crossLink "ShaderParams/params:property"}}{{/crossLink}} property has been updated.
             * @event params
             * @param value The property's new value
             */
            this.fire("params", this._state.params);
        },

        _compile: function () {
            this._renderer.shaderParams = this._state;
        },

        _getJSON: function () {
            return {
                params: this._state.params
            };
        }
    });

})();
