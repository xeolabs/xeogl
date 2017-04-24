/**
 A **ShaderParams** sets uniform values for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.


 * Use ShaderParams components when you need to share the same {{#crossLink "Shader"}}Shaders{{/crossLink}} among multiple {{#crossLink "Entity"}}Entities{{/crossLink}},
 while setting the {{#crossLink "Shader"}}Shaders{{/crossLink}}' uniforms differently for each {{#crossLink "Entity"}}Entity{{/crossLink}}.


 <img src="../../../assets/images/ShaderParams.png"></img>

 ## Usage

 In this example we'll create the effect shown below, in which we render a rippling water pattern to the left and right halves
 of the canvas, independently. We'll have a {{#crossLink "Shader"}}{{/crossLink}} that creates the water pattern, which
 we'll share between two {{#crossLink "Entity"}}Entities{{/crossLink}}.
 Each {{#crossLink "Entity"}}{{/crossLink}} will have its own screen-aligned quad {{#crossLink "Geometry"}}{{/crossLink}},
 as well its own {{#crossLink "ShaderParams"}}{{/crossLink}} to update the update the {{#crossLink "Shader"}}{{/crossLink}}'s
 rippling rate independently.

 <img src="../../assets/images/shaderParamsExample1.png"></img>

 ````javascript
 // Shader that's shared by both our Entities. Note the 'xeo_aPosition' and 'xeo_aUV attributes',
 // which will receive the positions and UVs from the Geometry components. Also note the 'time'
 // uniform, which we'll be animating via the ShaderParams components.

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

    // Initial values for the 'time' uniform in the fragment stage.
    uniforms: {
        time: 0.0
    }
 });

 // First Entity using our Shader, with a quad covering the left half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var entity1 = new xeogl.Entity({
    shader: shader,
    geometry: new xeogl.Geometry({
        primitive:"triangles",
        positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
        normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
        uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
        indices:[ 0, 1, 2, 0, 2, 3 ]
    }),
    shaderParams1: new xeogl.ShaderParams({
        uniforms: {
            time: 0.0
        }
    })
 });

 // Second Entity using the Shader, with a quad covering the right half of the canvas,
 // along with its own ShaderParams to independently set its own values for the Shader's uniforms.

 var entity2 = new xeogl.Entity({
    shader: shader,
    geometry: new xeogl.Geometry({
        primitive:"triangles",
        positions:[ 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, -1, 0 ],
        normals:[ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ],
        uv:[ 1, 1, 0, 1, 0, 0, 1, 0 ],
        indices:[ 0, 1, 2, 0, 2, 3 ]
    }),
    shaderParams: new xeogl.ShaderParams({
        uniforms: {
            time: 0.0
        }
    })
 });
 ````
 Now let's animate the "time" parameter on the Shader, for each Entity independently:

 ```` javascript
 // Get the default Scene off the first Entity
 var scene = entity1.scene;

 scene.on("tick", function(e) {

    entity1.shaderParams.setUniforms({
        time: e.timeElapsed
    });

    entity2.shaderParams.setUniforms({
        time: e.timeElapsed  * 0.5
    });
});
 ````
 @class ShaderParams
 @module xeogl
 @submodule shaders
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this ShaderParams in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this ShaderParams.
 @param [cfg.uniforms={}] {Object} The {{#crossLink "Shader"}}Shader{{/crossLink}} parameter values.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.ShaderParams = xeogl.Component.extend({

        type: "xeogl.ShaderParams",

        _init: function (cfg) {

            this._state = new xeogl.renderer.ShaderParams({
                uniforms: {}
            });

            this.setUniforms(cfg.uniforms);
        },

        _props: {
            
            /**
             * Uniforms for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached
             * {{#crossLink "Entity"}}Entities{{/crossLink}}.
             *
             * Fires a {{#crossLink "Shader/uniforms:event"}}{{/crossLink}} event on change.
             *
             * @property uniforms
             * @default {}
             * @type {}
             */
            uniforms: {

                get: function () {
                    return this._state.uniforms;
                }
            }
        },

        /**
         * Sets one or more uniforms for {{#crossLink "Shader"}}Shaders{{/crossLink}} on attached
         * {{#crossLink "Entity"}}Entities{{/crossLink}}.
         *
         * These will individually override any uniforms of the same names that are {{#crossLink "Shader/setUniforms:method"}}already specified{{/crossLink}} on
         * those {{#crossLink "Shader"}}Shaders{{/crossLink}}.
         *
         * Fires a {{#crossLink "ShaderParams/uniforms:event"}}{{/crossLink}} event on change.
         *
         * @method setUniforms
         * @param {} [uniforms={}] Values for uniforms to set on the {{#crossLink "Shader"}}Shaders{{/crossLink}}, keyed to their names.
         */
        setUniforms: function (uniforms) {

            for (var name in uniforms) {
                if (uniforms.hasOwnProperty(name)) {
                    this._state.uniforms[name] = uniforms[name];
                }
            }

            this._renderer.imageDirty = true;

            /**
             * Fired whenever this ShaderParams' {{#crossLink "ShaderParams/uniforms:property"}}{{/crossLink}} property has been updated.
             * @event uniforms
             * @param value The property's new value
             */
            this.fire("uniforms", this._state.uniforms);
        },

        _compile: function () {
            this._renderer.shaderParams = this._state;
        },

        _getJSON: function () {
            return {
                uniforms: this._state.uniforms
            };
        }
    });

})();
