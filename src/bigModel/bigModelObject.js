import {RENDER_FLAGS} from './renderFlags.js';

/**
 A **BigModelObject** is a 3D object within a {{#crossLink "BigModel"}}{{/crossLink}}.

 * Created by the BigModel {{#crossLink "BigModel/createObject:method"}}createObject(){{/crossLink}} method.
 * Instances are owned by their BigModel, which contains them and manages their life cycles.
 * Designed for low memory footprint (ie. is a lightweight class that does not extend {{#crossLink "Component"}}{{/crossLink}}).
 * Are static, ie. cannot be dynamically translated, rotated and scaled.

 @class BigModelObject
 @module xeogl
 @submodule models

 */
class BigModelObject {

    constructor(model, entityType, id, guid, layer, portionId, flags, color, aabb) {
        this.model = model;
        this.id = id;
        this._layer = layer;
        this._portionId = portionId;
        this._flags = flags;
        this._colorize = color;
        this._aabb = aabb;
        if (entityType) {
            this._entityType = entityType;
            model.scene._entityTypeAssigned(this, entityType);
        }
        if (guid) {
            this.guid = guid;
        }
        model.scene._objectCreated(this);
    }

    _getFlag(flag) {
        return !!(this._flags & flag);
    }

    /**
     The entity type of this BigModelObject.

     @property entityType
     @returns {boolean} Entity type of the target this.
     */
    get entityType() {
        return this._entityType;
    }

    /**
     Indicates if visible.

     Only rendered when {{#crossLink "BigModelObject/visible:property"}}{{/crossLink}} is true and
     {{#crossLink "BigModelObject/culled:property"}}{{/crossLink}} is false.

     Each visible BigModelObject is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/visibleEntities:property"}}{{/crossLink}} map while its {{#crossLink "BigModelObject/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property visible
     @default true
     @type Boolean
     */
    set visible(visible) {
        if (!!(this._flags & RENDER_FLAGS.VISIBLE) === visible) {
            return; // Redundant update
        }
        if (visible) {
            this._flags = this._flags | RENDER_FLAGS.VISIBLE;
            this._layer.numVisibleObjects++;
            this.model.numVisibleObjects++;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.VISIBLE;
            this._layer.numVisibleObjects--;
            this.model.numVisibleObjects--;
        }
        this._layer.setFlags(this._portionId, this._flags);
        if (this._entityType) {
            this.model.scene._entityVisibilityUpdated(this, visible);
        }
    }

    get visible() {
        return this._getFlag(RENDER_FLAGS.VISIBLE);
    }

    /**
     Indicates if highlighted.

     Each highlighted BigModelObject is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/highlightedEntities:property"}}{{/crossLink}} map while its {{#crossLink "BigModelObject/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property highlighted
     @default false
     @type Boolean
     */
    set highlighted(highlighted) {
        if (!!(this._flags & RENDER_FLAGS.HIGHLIGHTED) === highlighted) {
            return; // Redundant update
        }
        if (highlighted) {
            this._flags = this._flags | RENDER_FLAGS.HIGHLIGHTED;
            this._layer.numHighlightedObjects++;
            this.model.numHighlightedObjects++;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.HIGHLIGHTED;
            this._layer.numHighlightedObjects--;
            this.model.numHighlightedObjects--;
        }
        this._layer.setFlags(this._portionId, this._flags);
        if (this._entityType) {
            this.model.scene._entityHighlightedUpdated(this, highlighted);
        }
    }

    get highlighted() {
        return this._getFlag(RENDER_FLAGS.HIGHLIGHTED);
    }

    /**
     Indicates if ghosted.

     Each ghosted BigModelObject is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/ghostedEntities:property"}}{{/crossLink}} map while its {{#crossLink "BigModelObject/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property ghosted
     @default false
     @type Boolean
     */
    set ghosted(ghosted) {
        if (!!(this._flags & RENDER_FLAGS.GHOSTED) === ghosted) {
            return; // Redundant update
        }
        if (ghosted) {
            this._flags = this._flags | RENDER_FLAGS.GHOSTED;
            this._layer.numGhostedObjects++;
            this.model.numGhostedObjects++;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.GHOSTED;
            this._layer.numGhostedObjects--;
            this.model.numGhostedObjects--;
        }
        this._layer.setFlags(this._portionId, this._flags);
        if (this._entityType) {
            this.model.scene._entityGhostedUpdated(this, ghosted);
        }
    }

    get ghosted() {
        return this._getFlag(RENDER_FLAGS.GHOSTED);
    }

    /**
     Indicates if selected.

     Each selected BigModelObject is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
     {{#crossLink "Scene/selectedEntities:property"}}{{/crossLink}} map while its {{#crossLink "BigModelObject/entityType:property"}}{{/crossLink}}
     is set to a value.

     @property selected
     @default false
     @type Boolean
     */
    set selected(selected) {
        if (!!(this._flags & RENDER_FLAGS.SELECTED) === selected) {
            return; // Redundant update
        }
        if (selected) {
            this._flags = this._flags | RENDER_FLAGS.SELECTED;
            this._layer.numSelectedObjects++;
            this.model.numSelectedObjects++;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.SELECTED;
            this._layer.numSelectedObjects--;
            this.model.numSelectedObjects--;
        }
        this._layer.setFlags(this._portionId, this._flags);
        if (this._entityType) {
            this.model.scene._entitySelectedUpdated(this, selected);
        }
    }

    get selected() {
        return this._getFlag(RENDER_FLAGS.SELECTED);
    }

    /**
     Indicates if edges are emphasized.

     @property edges
     @default false
     @type Boolean
     */
    set edges(edges) {
        if (!!(this._flags & RENDER_FLAGS.EDGES) === edges) {
            return; // Redundant update
        }
        if (edges) {
            this._flags = this._flags | RENDER_FLAGS.EDGES;
            this._layer.numEdgesObjects++;
            this.model.numEdgesObjects++;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.EDGES;
            this._layer.numEdgesObjects--;
            this.model.numEdgesObjects--;
        }
        this._layer.setFlags(this._portionId, this._flags);
    }

    get edges() {
        return this._getFlag(RENDER_FLAGS.EDGES);
    }

    /**
     Indicates if clippable.

     Clipping is done by the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} component.

     @property clippable
     @default true
     @type Boolean
     */
    set clippable(clippable) {
        if ((!!(this._flags & RENDER_FLAGS.CLIPPABLE)) === clippable) {
            return; // Redundant update
        }
        if (clippable) {
            this._flags = this._flags | RENDER_FLAGS.CLIPPABLE;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.CLIPPABLE;
        }
        this._layer.setFlags(this._portionId, this._flags);
    }

    get clippable() {
        return this._getFlag(RENDER_FLAGS.CLIPPABLE);
    }

    /**
     Indicates if included in boundary calculations.

     @property collidable
     @default true
     @type Boolean
     */
    set collidable(collidable) {
        if (!!(this._flags & RENDER_FLAGS.COLLIDABLE) === collidable) {
            return; // Redundant update
        }
        if (collidable) {
            this._flags = this._flags | RENDER_FLAGS.COLLIDABLE;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.COLLIDABLE;
        }
        this._layer.setFlags(this._portionId, this._flags);
    }

    get collidable() {
        return this._getFlag(RENDER_FLAGS.COLLIDABLE);
    }

    /**
     Whether or not to allow picking.

     Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

     @property pickable
     @default true
     @type Boolean
     */
    set pickable(pickable) {
        if (!!(this._flags & RENDER_FLAGS.PICKABLE) === pickable) {
            return; // Redundant update
        }
        if (pickable) {
            this._flags = this._flags | RENDER_FLAGS.PICKABLE;
        } else {
            this._flags = this._flags & ~RENDER_FLAGS.PICKABLE;
        }
        this._layer.setFlags(this._portionId, this._flags);
    }

    get pickable() {
        return this._getFlag(RENDER_FLAGS.PICKABLE);
    }

    /**
     Sets the RGB color of this BigModelObject.

     Since objects within a BigModel don't have materials for normal rendering, this is effectively how their colors are specified.

     @property colorize
     @default [1.0, 1.0, 1.0]
     @type Float32Array
     */
    set colorize(color) {
        this._colorize[0] = Math.floor(color[0] * 255.0); // Quantize
        this._colorize[1] = Math.floor(color[1] * 255.0);
        this._colorize[2] = Math.floor(color[2] * 255.0);
        this._layer.setColor(this._portionId, this._colorize); // Only set RGB, not alpha
    }

    get colorize() {
        tempColor[0] = this._colorize[0] / 255.0; // Unquantize
        tempColor[1] = this._colorize[1] / 255.0;
        tempColor[2] = this._colorize[2] / 255.0;
        return tempColor;
    }

    /**
     Opacity factor, multiplies by the rendered fragment alpha.

     @property opacity
     @default 1.0
     @type Number
     */
    set opacity(opacity) {
        if (opacity < 0) {
            opacity = 0;
        } else if (opacity > 1) {
            opacity = 1;
        }
        opacity = Math.floor(opacity * 255.0); // Quantize
        var lastOpacity = this._colorize[3];
        if (lastOpacity === opacity) {
            return;
        }
        if (opacity < 255) {
            if (lastOpacity === 255) {
                this._layer.numTransparentObjects++;
                this.model.numTransparentObjects++;
            }
        } else {
            if (lastOpacity < 255) {
                this._layer.numTransparentObjects--;
                this.model.numTransparentObjects--;
            }
        }
        this._colorize[3] = opacity; // Only set alpha
        this._layer.setColor(this._portionId, this._colorize);
    }

    get opacity() {
        return this._colorize[3] / 255.0;
    }

    // /**
    //  Local modeling matrix.
    //
    //  @property matrix
    //  @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    //  @type {Float32Array}
    //  */
    // set matrix(matrix) {
    //     this._layer.setMatrix(this._portionId, matrix);
    // }

    // TODO: Retain on BigModelObject?
    // get matrix() {
    //     return this._getFlag(RENDER_FLAGS.matrix);
    // }

    /**
     World-space 3D axis-aligned bounding box (AABB) enclosing the objects within this BigModel.

     Represented by a six-element Float32Array containing the min/max extents of the
     axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

     @property aabb
     @final
     @type {Float32Array}
     */
    get aabb() {
        return this._aabb;
    }

    _destroy() { // Called by BigModel
        const scene = this.model.scene;
        if (this._entityType) {
            scene._entityTypeRemoved(this, this._entityType);
            if (this.visible) {
                scene._entityVisibilityUpdated(this, false);
            }
            if (this.ghosted) {
                scene._entityGhostedUpdated(this, false);
            }
            if (this.selected) {
                scene._entitySelectedUpdated(this, false);
            }
            if (this.highlighted) {
                scene._entityHighlightedUpdated(this, false);
            }
        }
        scene._aabbDirty = true;
        scene._objectDestroyed(this);
    }
}

export {BigModelObject};