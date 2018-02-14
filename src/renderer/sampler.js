/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer.Sampler = function (gl, location) {
    this.bindTexture = function (texture, unit) {
        if (texture.bind(unit)) {
            gl.uniform1i(location, unit);
            return true;
        }
        return false;
    };
};