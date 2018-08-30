const stats = {
    build: {
        version: "0.8"
    },
    client: {
        browser: (navigator && navigator.userAgent) ? navigator.userAgent : "n/a"
    },

    // TODO: replace 'canvas' with 'pixels'
    //canvas: {
    //    width: 0,
    //    height: 0
    //},
    components: {
        scenes: 0,
        models: 0,
        meshes: 0,
        objects: 0
    },
    memory: {

        // Note that these counts will include any positions, colors,
        // normals and indices that xeogl internally creates on-demand
        // to support color-index triangle picking.

        meshes: 0,
        positions: 0,
        colors: 0,
        normals: 0,
        uvs: 0,
        indices: 0,
        textures: 0,
        transforms: 0,
        materials: 0,
        programs: 0
    },
    frame: {
        frameCount: 0,
        fps: 0,
        useProgram: 0,
        bindTexture: 0,
        bindArray: 0,
        drawElements: 0,
        drawArrays: 0,
        tasksRun: 0,
        tasksScheduled: 0
    }
};

export {stats};