/**
 A ripply water {{#crossLink "Shader"}}Shader{{/crossLink}}.

 @module xeogl
 @extends Shader
 */
xeogl.WaterShader = xeogl.Shader.extend({

    type: "xeogl.WaterShader",


    _init: function (cfg) {

        this._super(xeogl._apply({

            vertex: [
                "attribute vec3 xeo_aPosition;",
                "attribute vec2 xeo_aUV;",
                "varying vec2 vUv;",
                "void main () {",
                "    gl_Position = vec4(xeo_aPosition, 1.0);",
                "    vUv = xeo_aUV;",
                "}"
            ],

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

        }, cfg));

        // Animate the water ripple

        var self = this;

        this._tick = this.scene.on("tick",
            function (e) {
                self.setParams({
                    time: e.time
                });
            });
    },

    _destroy: function () {
        this._super();
        this.scene.off(this._tick);
    }
});