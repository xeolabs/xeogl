/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer = xeogl.renderer || {};

/**
 * Rendering context for a frame.
 */

xeogl.renderer.Frame = function () {
    this.reset();
};

xeogl.renderer.Frame.prototype.reset = function () {
    this.lastProgramId = null;
    this.backfaces = false;
    this.frontface = true; // true == "ccw" else "cw"
    this.textureUnit = 0;
    this.drawElements = 0;
    this.drawArrays = 0;
    this.useProgram = 0;
    this.bindTexture = 0;
    this.bindArray = 0;
    this.pass = 0;
    this.shadowViewMatrix = null;
    this.shadowProjMatrix = null;
    this.pickViewMatrix = null;
    this.pickProjMatrix = null;
    this.pickObjectIndex = 1;
};