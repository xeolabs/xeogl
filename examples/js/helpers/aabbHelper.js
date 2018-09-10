/**

 Helper that visualizes the boundary of a target {{#crossLink "Component"}}{{/crossLink}} subtype with a World-space axis-aligned boundary (AABB).

 @class AABBHelper
 @constructor
 @param cfg {*} Configuration
 @param [cfg.target] {Number|String|Component} ID or instance of a {{#crossLink "Component"}}{{/crossLink}} subtype with a World-space axis-aligned boundary (AABB).
 @param [cfg.color=[0.4,0.4,0.4]] {Float32Array} Emmissive color
 @param [cfg.visible=true] {Boolean} Indicates whether or not this helper is visible.

 */
xeogl.AABBHelper = class xeoglAABBHelper extends xeogl.Component{

    init(cfg) {

        super.init(cfg);

        this._box = new xeogl.Mesh(this, {
            geometry: new xeogl.AABBGeometry(this),
            material: new xeogl.PhongMaterial(this, {
                emissive: [1, 0, 0],
                diffuse: [0, 0, 0],
                lineWidth: 4
            }),
            pickable: false,
            collidable: false,
            clippable: false
        });

        this.target = cfg.target;
        this.color = cfg.color;
        this.visible = cfg.visible;
    }

    /**
     * The target {{#crossLink "Component"}}{{/crossLink}} subtype.
     *
     * Must be within the same {{#crossLink "Scene"}}{{/crossLink}} as this CameraFollowAnimation. Defaults to the parent
     * {{#crossLink "Scene"}}Scene{{/crossLink}} when set to a null or undefined value.
     *
     * @property target
     * @type Component
     */
    set target(target) {
        this._box.geometry.target = target;
    }

    get target() {
        return this._box.geometry.target;
    }

    /**
     * Emissive color of this AABBHelper.
     *
     * @property color
     * @default [0,1,0]
     * @type {Float32Array}
     */
    set color(value) {
        this._box.material.emissive = value || [0, 1, 0];
    }

    get color() {
        return this._box.emissive;
    }

    /**
     Indicates whether this AABBHelper is visible or not.

     Fires a {{#crossLink "AABBHelper/visible:event"}}{{/crossLink}} event on change.

     @property visible
     @default true
     @type Boolean
     */
    set visible(value) {
        value = value !== false;
        this._box.visible = value;
    }

    get visible() {
        return this._box.visible;
    }
};
