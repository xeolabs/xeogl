/**
 * @author xeolabs / https://github.com/xeolabs
 */

/**
 * Rendering context for a frame.
 */

class Frame {

    constructor() {
        this.reset();
    }

    reset() {
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
        this.pickmeshIndex = 1;
    }
}

export {Frame};