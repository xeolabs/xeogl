/**

 TODO

 ## Overview

 TODO

 ## Example

 TODO

 @class Collider
 @module xeogl
 @submodule audio
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Collider within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} The Collider configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Collider.
 @param [cfg.type="dynamic"] {String} The type of this Collider - "dynamic", "static" or "kinematic".
 @param [cfg.mass=1.0 ] {Number} The mass of this Collider.
 @param [cfg.linearDamping=0.0 ] {Number} The proportion of linear velocity that is lost by this Collider every second.
 @param [cfg.angularDamping=0.0 ] {Number} The proportion of angular (rotational) velocity that is lost by this Collider every second.
 @param [cfg.linearFactor=[0.0, 0.0, 0.0 ]] {Array(Number)} Multiplier for this Collider's linear movement in each World-space axis. If set to 0 for any axis no
 movement will occur in that axis, which is useful for constraining to 1D/2D movement.
 @param [cfg.angularFactor=[0.0, 0.0, 0.0 ]] {Array(Number)} Multiplier for this Collider's angular (rotational) movement about each World-space axis. If set to 0 for
 any axis no rotation will occur about that axis.
 @param [cfg.friction=0] {Number} How rapidly this Collider loses velocity when in contact with other bodies.
 @param [cfg.restitution=0] {Number} The bounciness of this Collider, given as a factor between 0 and 1.
 @param [cfg.active=true] {Boolean} If active and if the {{#crossLink "Entity"}}{{/crossLink}} has a
 * sibling {{#crossLink "Collider"}}{{/crossLink}} component, the Collider will participate in the physics simulation.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Collider = xeogl.Component.extend({

        type: "xeogl.Collider",

        _init: function (cfg) {

            this._rigidBodyDirty = false;
            this._massDirty = true;
            this._linearDampingDirty = true;
            this._angularDampingDirty = true;
            this._linearFactorDirty = true;

            this.type = cfg.type;
            this.mass = cfg.mass;
            this.linearDamping = cfg.linearDamping;
            this.angularDamping = cfg.angularDamping;
            this.linearFactor = cfg.linearFactor;
            this.angularFactor = cfg.angularFactor;
            this.friction = cfg.friction;
            this.restitution = cfg.restitution;
            this.active = cfg.active;
        },

        _setColliderDirty: function () {

            if (!this._rigidBodyDirty) {

                this._rigidBodyDirty = true;

                var self = this;

                this.scene.once("tick",
                    function () {
                        self._buildCollider();
                    });
            }
        },

        _buildCollider: function () {

            this._rigidBodyDirty = false;

            //
        },

        _props: {

            /**
             The type of this Collider.

             Supported types are: "dynamic", "static" and "kinematic".

             Fires a {{#crossLink "Collider/type:event"}}{{/crossLink}} event on change.

             @property type
             @default false
             @type Boolean
             */
            type: {

                set: function (value) {

                    value = value || "dynamic";

                    if (value !== "dynamic" && type !== "static" && type !== "kinematic") {
                        this.error("illegal type: " + value);
                        return;
                    }

                    if (value == this._type) {
                        return;
                    }

                    this._type = !!value;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/type:property"}}{{/crossLink}} property changes.
                     * @event type
                     * @param value The property's new value
                     */
                    this.fire("type", this._type);
                },

                get: function () {
                    return this._type;
                }
            },

            /**
             The mass of this Collider.

             When world units in your Scene are meters, then the unit for mass is kilograms.

             Fires a {{#crossLink "Collider/mass:event"}}{{/crossLink}} event on change.

             @property mass
             @default 1.0
             @type Number
             */
            mass: {

                set: function (value) {

                    value = value !== undefined ? value : 1.0;

                    if (this._mass === value) {
                        return;
                    }

                    this._mass = value;

                    this._massDirty = true;

                    this._setColliderDirty();

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/mass:property"}}{{/crossLink}} property changes.
                     * @event mass
                     * @param value The property's new value
                     */
                    this.fire("mass", this._mass);
                },

                get: function () {
                    return this._mass;
                }
            },

            /**
             * The proportion of linear velocity that is lost by this Collider every second.
             * .
             * Fires an {{#crossLink "Collider/linearDamping:event"}}{{/crossLink}} event on change.
             *
             * @property linearDamping
             * @default 0
             * @type Number
             */
            linearDamping: {

                set: function (value) {

                    value = value || 0;

                    if (this._linearDamping === value) {
                        return;
                    }

                    this._linearDampingDirty = true;

                    this._setColliderDirty();

                    /**
                     Fired whenever this Translate's {{#crossLink "Translate/linearDamping:property"}}{{/crossLink}} property changes.
                     @event linearDamping
                     @param value {Array of Number} The property's new value
                     */
                    this.fire("linearDamping", this._linearDamping);
                },

                get: function () {
                    return this._linearDamping;
                }
            },

            /**
             The proportion of angular velocity that is lost by this Collider every second.

             Fires a {{#crossLink "Collider/angularDamping:event"}}{{/crossLink}} event on change.

             @property angularDamping
             @default 0
             @type Number
             */
            angularDamping: {

                set: function (value) {

                    value = value || 0;

                    if (this._angularDamping === value) {
                        return;
                    }

                    this._angularDamping = value;

                    this._angularDampingDirty = true;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/angularDamping:property"}}{{/crossLink}} property changes.
                     * @event angularDamping
                     * @param value The property's new value
                     */
                    this.fire("angularDamping", this._angularDamping);
                },

                get: function () {
                    return this._angularDamping;
                }
            },

            /**
             Multiplier for this Collider's linear movement in each World-space axis. If set to 0 for any axis no
             movement will occur in that axis, which is useful for constraining to 1D/2D movement.

             Fires a {{#crossLink "Collider/linearFactor:event"}}{{/crossLink}} event on change.

             @property linearFactor
             @default [0,0,0]
             @type {Array of Number}
             */
            linearFactor: {

                set: function (value) {

                    value = value || [0, 0, 0];

                    if (!this._linearFactor) {
                        this._linearFactor = [0, 0, 0];

                    } else if (
                        this._linearFactor[0] === value[0] &&
                        this._linearFactor[1] === value[1] &&
                        this._linearFactor[2] === value[2]) {

                        return;
                    }

                    this._linearFactor[0] = value[0];
                    this._linearFactor[1] = value[1];
                    this._linearFactor[2] = value[2];

                    this._linearFactorDirty = true;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/linearFactor:property"}}{{/crossLink}} property changes.
                     * @event linearFactor
                     * @param value The property's new value
                     */
                    this.fire("linearFactor", this._linearFactor);
                },

                get: function () {
                    return this._linearFactor;
                }
            },

            /**
             Multiplier for this Collider's angular (rotational) movement about each World-space axis. If set to 0 for
             any axis no rotation will occur about that axis.

             Fires a {{#crossLink "Collider/angularFactor:event"}}{{/crossLink}} event on change.

             @property angularFactor
             @default [0,0,0]
             @type {Array of Number}
             */
            angularFactor: {

                set: function (value) {

                    value = value || [0, 0, 0];

                    if (!this._angularFactor) {
                        this._angularFactor = [0, 0, 0];

                    } else if (
                        this._angularFactor[0] === value[0] &&
                        this._angularFactor[1] === value[1] &&
                        this._angularFactor[2] === value[2]) {

                        return;
                    }

                    this._angularFactor[0] = value[0];
                    this._angularFactor[1] = value[1];
                    this._angularFactor[2] = value[2];

                    this._angularFactorDirty = true;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/angularFactor:property"}}{{/crossLink}} property changes.
                     * @event angularFactor
                     * @param value The property's new value
                     */
                    this.fire("angularFactor", this._angularFactor);
                },

                get: function () {
                    return this._angularFactor;
                }
            },

            /**
             How rapidly this Collider loses velocity when in contact with other bodies.

             Fires a {{#crossLink "Collider/friction:event"}}{{/crossLink}} event on change.

             @property friction
             @default 0.0
             @type Number
             */
            friction: {

                set: function (value) {

                    value = value !== undefined ? value : 0;

                    if (this._friction === value) {
                        return;
                    }

                    this._friction = value;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/friction:property"}}{{/crossLink}} property changes.
                     * @event friction
                     * @param value The property's new value
                     */
                    this.fire("friction", this._friction);
                },

                get: function () {
                    return this._friction;
                }
            },

            /**
             The bounciness of this Collider, given as a factor between 0 and 1.

             Setting to 1 means the Collider may never come to rest, unless it collides with other bodies with restitutions below 1.

             Fires a {{#crossLink "Collider/restitution:event"}}{{/crossLink}} event on change.

             @property restitution
             @default 0
             @type Number
             */
            restitution: {

                set: function (value) {

                    value = value !== undefined ? value : 0;

                    if (value < 0 || value > 1.0) {
                        this.("restitution out of range [0..1]: " + value);
                        return
                    }

                    this._restitution = value;

                    if (this._restitution === value) {
                        return;
                    }

                    this._restitution = value;

                    /**
                     * Fired whenever this Collider's  {{#crossLink "Collider/restitution:property"}}{{/crossLink}} property changes.
                     * @event restitution
                     * @param value The property's new value
                     */
                    this.fire("restitution", this._restitution);
                },

                get: function () {
                    return this._restitution;
                }
            },

            /**
             * If active and if the {{#crossLink "Entity"}}{{/crossLink}} has a
             * sibling {{#crossLink "Collider"}}{{/crossLink}} component, the Collider will participate in the physics simulation.
             *
             * Fires an {{#crossLink "Collider/active:event"}}{{/crossLink}} event on change.
             *
             * @property active
             * @type Boolean
             */
            active: {

                set: function (value) {

                    if (this._active === value) {
                        return;
                    }

                    this._active = value;

                    /**
                     * Fired whenever this Collider's {{#crossLink "Collider/active:property"}}{{/crossLink}} property changes.
                     * @event active
                     * @param value The property's new value
                     */
                    this.fire('active', this._active);
                },

                get: function () {
                    return this._active;
                }
            }
        },

        _getJSON: function () {
            return {
                type: this._type,
                mass: this._mass,
                linearDamping: this.linearDamping,
                angularDamping: this._angularDamping,
                linearFactor: this._linearFactor,
                angularFactor: this._angularFactor,
                friction: this._friction,
                restitution: this._restitution,
                active: this._active
            };
        }
    });

})();
