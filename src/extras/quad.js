/**

 A quad-shaped geometry.

 @class Geometry.Quad
 @module XEO
 @extends Geometry
 */
XEO.Geometry.Quad = XEO.Geometry.extend({

    type: "XEO.Geometry.Quad",

    // Constructor

    _init: function (cfg) {

        // Call XEO.Component's init method
        this._super(XEO._apply({

            primitive: "triangles",

            positions: [

                // Front face
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,

                // Back face
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,

                // Top face
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,

                // Bottom face
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0,

                // Right face
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,

                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0, -1.0
            ],

            // Vertex colors
            colors: [
                1.0, 1.0, 1.0, 1.0,    // Front face: white
                1.0, 0.0, 0.0, 1.0,    // Back face: red
                0.0, 1.0, 0.0, 1.0,    // Top face: green
                0.0, 0.0, 1.0, 1.0,    // Bottom face: blue
                1.0, 1.0, 0.0, 1.0,    // Right face: yellow
                1.0, 0.0, 1.0, 1.0     // Left face: purple
            ],

            // Vertex normals
            normals: [
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
            ],

            // UV coordinates
            uv: [
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 1, 0, 0, 1, 0, 1, 1,
                1, 0, 1, 1, 0, 1, 0, 0,
                1, 1, 0, 1, 0, 0, 1, 0,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1
            ],

            // Triangle indices
            indices: [
                0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // back
                8, 9, 10, 8, 10, 11,   // top
                12, 13, 14, 12, 14, 15,   // bottom
                16, 17, 18, 16, 18, 19,   // right
                20, 21, 22, 20, 22, 23    // left
            ]
        }, cfg));
    }
});