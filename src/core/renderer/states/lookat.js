
XEO.renderer.StateFactory.createStateType({

    init: function (cfg) {

        // Core state

        this.eye = cfg.eye || [0, 0, -10];
        this.look = cfg.look || [0, 0, 0];
        this.up = cfg.up || [0, 1, 0];

        // Dynamically rebuilt properties

        this.matrix = null;
        this.lookAt = null;
        this.mat = null;

        // Schedule rebuild

        this.dirty = true;
    },

    rebuild: function () {

        // Build matrix values

        this.matrix = XEO.math.lookAtMat4c(
            this.eye[0], this.eye[1], this.eye[2],
            this.look[0], this.look[1], this.look[2],
            this.up[0], this.up[1], this.up[2]);

        this.lookAt = {
            eye: this.eye,
            look: this.look,
            up: this.up
        };

        // Build typed arrays for view matrix and normal matrix
        // Avoid reallocating those if possible

        if (!this.mat) {

            // Create arrays

            this.mat = new Float32Array(this.matrix);
            this.normalMat = new Float32Array(
                XEO.math.transposeMat4(XEO.math.inverseMat4(this.matrix, XEO.math.mat4())));

        } else {

            // Insert into existing arrays

            this.mat.set(this.matrix);
            this.normalMat.set(
                XEO.math.transposeMat4(XEO.math.inverseMat4(this.matrix, XEO.math.mat4())));
        }

        /**
         * Fired whenever this Lookat's  {{#crossLink "Lookat/matrix:property"}}{{/crossLink}} property is regenerated.
         * @event matrix
         * @param value The property's new value
         */
//        self.fire("matrix", this.matrix);

        this.dirty = false;
    }
});
