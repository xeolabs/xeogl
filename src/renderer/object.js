/**
 * @author xeolabs / https://github.com/xeolabs
 */

xeogl.renderer.Object = function (id, entityId, gl, scene, material, ghostMaterial, outlineMaterial, highlightMaterial, selectedMaterial, vertexBufs, geometry, modelTransform, modes) {

    this.id = id;
    this.entityId = entityId;
    this.gl = gl;
    this.scene = scene;

    this.material = material;
    this.ghostMaterial = ghostMaterial;
    this.outlineMaterial = outlineMaterial;
    this.highlightMaterial = highlightMaterial;
    this.selectedMaterial = selectedMaterial;
    this.vertexBufs = vertexBufs;
    this.geometry = geometry;
    this.modelTransform = modelTransform;
    this.modes = modes;

    this.scene = scene;
    this.gl = gl;

    this._draw = null;
    this._ghostFill = null;
    this._ghostEdges = null;
    this._ghostVertices = null;
    this._shadow = null;
    this._outline = null;
    this._pickObject = null;
    this._pickTriangle = null;
    this._pickVertex = null;

    this._draw = xeogl.renderer.DrawRenderer.create(this.gl, [this.gl.canvas.id, (this.scene.gammaOutput ? "gam" : ""), this.scene.lights.hash,
        this.scene.clips.hash, this.geometry.hash, this.material.hash, this.modes.hash].join(";"), this.scene, this);
    if (this._draw.errors) {
        this.errors = (this.errors || []).concat(this._draw.errors);
        console.error(this._draw.errors.join("\n"));
    }
};

xeogl.renderer.Object.compareState = function (a, b) {
    return (a.modes.layer - b.modes.layer)
        || (a._draw.id - b._draw.id)
        || (a.material.id - b.material.id)  // TODO: verify which of material and vertexBufs should be highest order
        || (a.vertexBufs.id - b.vertexBufs.id)
        || (a.geometry.id - b.geometry.id);
};

xeogl.renderer.Object.prototype._getSceneHash = function () {
    return (this.scene.gammaInput ? "gi;" : ";") + (this.scene.gammaOutput ? "go" : "");
};

xeogl.renderer.Object.prototype.draw = function (frame) {
    if (!this._draw) {
        this._draw = xeogl.renderer.DrawRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.lights.hash, this.scene.clips.hash, this.geometry.hash, this.material.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._draw.errors) {
            this.errors = (this.errors || []).concat(this._draw.errors);
            console.error(this._draw.errors.join("\n"));
            return;
        }
    }
    this._draw.drawObject(frame, this);
};

xeogl.renderer.Object.prototype.drawGhostFill = function (frame) {
    if (!this._ghostFill) {
        this._ghostFill = xeogl.renderer.GhostFillRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostFill.errors) {
            this.errors = (this.errors || []).concat(this._ghostFill.errors);
            console.error(this._ghostFill.errors.join("\n"));
            return;
        }
    }
    this._ghostFill.drawObject(frame, this, 0); // 0 == ghost
};

xeogl.renderer.Object.prototype.drawGhostEdges = function (frame) {
    if (!this._ghostEdges) {
        this._ghostEdges = xeogl.renderer.GhostEdgesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostEdges.errors) {
            this.errors = (this.errors || []).concat(this._ghostEdges.errors);
            console.error(this._ghostEdges.errors.join("\n"));
            return;
        }
    }
    this._ghostEdges.drawObject(frame, this, 0); // 0 == ghost
};

xeogl.renderer.Object.prototype.drawGhostVertices = function (frame) {
    if (!this._ghostVertices) {
        this._ghostVertices = xeogl.renderer.GhostVerticesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostVertices.errors) {
            this.errors = (this.errors || []).concat(this._ghostVertices.errors);
            console.error(this._ghostVertices.errors.join("\n"));
            return;
        }
    }
    this._ghostVertices.drawObject(frame, this, 0); // 0 == ghost
};

xeogl.renderer.Object.prototype.drawHighlightFill = function (frame) {
    if (!this._ghostFill) {
        this._ghostFill = xeogl.renderer.GhostFillRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostFill.errors) {
            this.errors = (this.errors || []).concat(this._ghostFill.errors);
            console.error(this._ghostFill.errors.join("\n"));
            return;
        }
    }
    this._ghostFill.drawObject(frame, this, 1); // 1 == highlight
};

xeogl.renderer.Object.prototype.drawHighlightEdges = function (frame) {
    if (!this._ghostEdges) {
        this._ghostEdges = xeogl.renderer.GhostEdgesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostEdges.errors) {
            this.errors = (this.errors || []).concat(this._ghostEdges.errors);
            console.error(this._ghostEdges.errors.join("\n"));
            return;
        }
    }
    this._ghostEdges.drawObject(frame, this, 1); // 1 == highlight
};

xeogl.renderer.Object.prototype.drawHighlightVertices = function (frame) {
    if (!this._ghostVertices) {
        this._ghostVertices = xeogl.renderer.GhostVerticesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostVertices.errors) {
            this.errors = (this.errors || []).concat(this._ghostVertices.errors);
            console.error(this._ghostVertices.errors.join("\n"));
            return;
        }
    }
    this._ghostVertices.drawObject(frame, this, 1); // 1 == highlight
};

xeogl.renderer.Object.prototype.drawSelectedFill = function (frame) {
    if (!this._ghostFill) {
        this._ghostFill = xeogl.renderer.GhostFillRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostFill.errors) {
            this.errors = (this.errors || []).concat(this._ghostFill.errors);
            console.error(this._ghostFill.errors.join("\n"));
            return;
        }
    }
    this._ghostFill.drawObject(frame, this, 2); // 2 == selected
};

xeogl.renderer.Object.prototype.drawSelectedEdges = function (frame) {
    if (!this._ghostEdges) {
        this._ghostEdges = xeogl.renderer.GhostEdgesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostEdges.errors) {
            this.errors = (this.errors || []).concat(this._ghostEdges.errors);
            console.error(this._ghostEdges.errors.join("\n"));
            return;
        }
    }
    this._ghostEdges.drawObject(frame, this, 2); // 2 == selected
};

xeogl.renderer.Object.prototype.drawSelectedVertices = function (frame) {
    if (!this._ghostVertices) {
        this._ghostVertices = xeogl.renderer.GhostVerticesRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._ghostVertices.errors) {
            this.errors = (this.errors || []).concat(this._ghostVertices.errors);
            console.error(this._ghostVertices.errors.join("\n"));
            return;
        }
    }
    this._ghostVertices.drawObject(frame, this, 2); // 2 == selected
};

xeogl.renderer.Object.prototype.drawShadow = function (frame, light) {
    if (!this._shadow) {
        this._shadow = xeogl.renderer.ShadowRenderer.create(this.gl, [this.gl.canvas.id, this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._shadow.errors) {
            this.errors = (this.errors || []).concat(this._shadow.errors);
            console.error(this._shadow.errors.join("\n"));
            return;
        }
    }
    this._shadow.drawObject(frame, this, light);
};

xeogl.renderer.Object.prototype.drawOutline = function (frame) {
    if (!this._outline) {
        this._outline = xeogl.renderer.OutlineRenderer.create(this.gl, [this.gl.canvas.id, this._getSceneHash(), this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._outline.errors) {
            this.errors = (this.errors || []).concat(this._outline.errors);
            console.error(this._outline.errors.join("\n"));
            return;
        }
    }
    this._outline.drawObject(frame, this);
};

xeogl.renderer.Object.prototype.pickObject = function (frame) {
    if (!this._pickObject) {
        this._pickObject = xeogl.renderer.PickObjectRenderer.create(this.gl, [this.gl.canvas.id, this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._pickObject.errors) {
            this.errors = (this.errors || []).concat(this._pickObject.errors);
            return;
        }
    }
    this._pickObject.drawObject(frame, this);
};

xeogl.renderer.Object.prototype.pickTriangle = function (frame) {
    if (!this._pickTriangle) {
        this._pickTriangle = xeogl.renderer.PickTriangleRenderer.create(this.gl, [this.gl.canvas.id, this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._pickTriangle.errors) {
            this.errors = (this.errors || []).concat(this._pickTriangle.errors);
            console.error(this._pickTriangle.errors.join("\n"));
            return;
        }
    }
    this._pickTriangle.drawObject(frame, this);
};

xeogl.renderer.Object.prototype.pickVertex = function (frame) {
    if (!this._pickVertex) {
        this._pickVertex = xeogl.renderer.PickVertexRenderer.create(this.gl, [this.gl.canvas.id, this.scene.clips.hash, this.geometry.hash, this.modes.hash].join(";"), this.scene, this);
        if (this._pickVertex.errors) {
            this.errors = (this.errors || []).concat(this._pickVertex.errors);
            console.error(this._pickVertex.errors.join("\n"));
            return;
        }
    }
    this._pickVertex.drawObject(frame, this);
};

xeogl.renderer.Object.prototype.destroy = function () {
    if (this._draw) {
        this._draw.destroy();
        this._draw = null;
    }
    if (this._ghostFill) {
        this._ghostFill.destroy();
        this._ghostFill = null;
    }
    if (this._ghostEdges) {
        this._ghostEdges.destroy();
        this._ghostEdges = null;
    }
    if (this._ghostVertices) {
        this._ghostVertices.destroy();
        this._ghostVertices = null;
    }
    if (this._outline) {
        this._outline.destroy();
        this._outline = null;
    }
    if (this._shadow) {
        this._shadow.destroy();
        this._shadow = null;
    }
    if (this._pickObject) {
        this._pickObject.destroy();
        this._pickObject = null;
    }
    if (this._pickTriangle) {
        this._pickTriangle.destroy();
        this._pickTriangle = null;
    }
    if (this._pickVertex) {
        this._pickVertex.destroy();
        this._pickVertex = null;
    }
};