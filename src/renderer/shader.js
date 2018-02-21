/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer.Shader = function (gl, type, source) {

    this.allocated = false;
    this.compiled = false;
    this.handle = gl.createShader(type);

    if (!this.handle) {
        this.errors = [
            "Failed to allocate"
        ];
        return;
    }

    this.allocated = true;

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);

    this.compiled = gl.getShaderParameter(this.handle, gl.COMPILE_STATUS);

    if (!this.compiled) {

        if (!gl.isContextLost()) { // Handled explicitly elsewhere, so won't re-handle here

            var lines = source.split("\n");
            var numberedLines = [];
            for (var i = 0; i < lines.length; i++) {
                numberedLines.push((i + 1) + ": " + lines[i] + "\n");
            }
            this.errors = [];
            this.errors.push("");
            this.errors.push(gl.getShaderInfoLog(this.handle));
            this.errors = this.errors.concat(numberedLines.join(""));
        }
    }
};

xeogl.renderer.Shader.prototype.destroy = function () {

};