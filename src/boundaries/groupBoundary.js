/**
 A **GroupBoundary** TODO.

 ## Overview

 <ul>

 <li>TODO</li>

 </ul>

 <img src="../../../assets/images/GroupBoundary.png"></img>

 ## Example

 TODO

 ````javascript
 var groupBoundary = new XEO.GroupBoundary({

    group: new XEO.Group({

        components: [
            new XEO.GameObject({
                ..,,
            }),
            new XEO.GameObject({
                ..,,
            }),
            new XEO.GameObject({
                //..
            })
        ]
    })
});

 var showBoundary = new XEO.GameObject({
        geometry: new XEO.BoundaryGeometry({
            boundary: groupBoundary.worldBoundary
        }),
        material: new XEO.PhongMaterial({
            diffuse: [1,0,0]
        })
    });
 ````

 @class GroupBoundary
 @module XEO
 @submodule boundaries
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this GroupBoundary within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} GroupBoundary configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this GroupBoundary.
 @param [cfg.emissiveMap=null] {Group} A {{#crossLink "Group"}}Group{{/crossLink}} to fit the {{#crossLink "GroupBoundary/worldBoundary:property"}}{{/crossLink}} to. Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this GroupBoundary.
 @extends Component
 */
(function () {

    "use strict";

    XEO.GroupBoundary = XEO.Component.extend({

        type: "XEO.GroupBoundary",

        _init: function (cfg) {

            this._onAdded = {};
            this._onUpdated = {};
            this._onRemoved = {};

            this._aabb = null;
            this._aabbDirty = false;
            this._worldBoundary = null;

            this.group = cfg.group;
        },

        _props: {

            /**
             * The {{#crossLink "Group"}}{{/crossLink}} attached to this GroupBoundary.
             *
             * Fires a {{#crossLink "GroupBoundary/group:event"}}{{/crossLink}} event on change.
             *
             * @property group
             * @type Group
             */
            group: {

                set: function (value) {

                    // Unsubscribe from old Group's events

                    var oldGroup = this._children.group;

                    if (oldGroup && (!value || value.id !== oldGroup.id)) {

                        oldGroup.off(this._onAdded);
                        oldGroup.off(this._onRemoved);

                        oldGroup.iterate(this._unbind, this);
                    }

                    /**
                     * Fired whenever this GroupBoundary's {{#crossLink "GroupBoundary/group:property"}}{{/crossLink}} property changes.
                     *
                     * @event group
                     * @param value The property's new value
                     */
                    var group = this._setChild("group", value);

                    if (group) {

                        this._onAdded = group.on("added", this._added, this);
                        this._onRemoved = group.on("removed", this._removed, this);

                        group.iterate(this._bind, this);

                        this._setAABBDirty();
                    }

                    this._setAABBDirty();
                },

                get: function () {
                    return this._children.group;
                }
            },

            /**
             * World-space 3D boundary enclosing all the components contained in {{#crossLink "GroupBoundary/group:property"}}{{/crossLink}}.
             *
             * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
             * this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance next
             * time you reference it.
             *
             * @property worldBoundary
             * @type Boundary3D
             * @final
             */
            worldBoundary: {

                get: function () {

                    if (!this._worldBoundary) {

                        var self = this;

                        this._worldBoundary = new XEO.Boundary3D(this.scene, {

                            getDirty: function () {
                                if (self._aabbDirty) {
                                    self._buildAABB();
                                    self._aabbDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getAABB: function () {
                                return self._aabb;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {
                                self._worldBoundary = null;
                            });
                    }

                    return this._worldBoundary;
                }
            }
        },

        _added: function (c) {
            if (c.worldBoundary) {
                this._bind(c);
            }
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _removed: function (c) {
            if (c.worldBoundary) {
                this._unbind(c);
            }
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _bind: function (c) {
            var worldBoundary = c.worldBoundary;
            if (!worldBoundary) {
                return;
            }
            this._onUpdated[c.id] = worldBoundary.on("updated", this._updated, this);
        },

        _updated: function () {
            if (!this._aabbDirty) {
                this._setAABBDirty();
            }
        },

        _unbind: function (c) {
            var worldBoundary = c.worldBoundary;
            if (!worldBoundary) {
                return;
            }
            worldBoundary.off(this._onUpdated[c.id]);
            delete this._onUpdated[c.id];
        },

        _setAABBDirty: function () {
            this._aabbDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
        },

        _buildAABB: function () {

            if (!this._aabb) {
                this._aabb = XEO.math.AABB3();
            }

            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;

            var component;
            var worldBoundary;
            var aabb;
            var min;
            var max;

            var group = this.group;

            if (group) {

                var components = group.components;

                for (var componentId in components) {
                    if (components.hasOwnProperty(componentId)) {

                        component = components[componentId];

                        worldBoundary = component.worldBoundary;
                        if (worldBoundary) {

                            aabb = worldBoundary.aabb;
                            min = aabb.min;
                            max = aabb.max;

                            if (min[0] < xmin) {
                                xmin = min[0];
                            }

                            if (min[1] < ymin) {
                                ymin = min[1];
                            }

                            if (min[2] < zmin) {
                                zmin = min[2];
                            }

                            if (max[0] > xmax) {
                                xmax = max[0];
                            }

                            if (max[1] > ymax) {
                                ymax = max[1];
                            }

                            if (max[2] > zmax) {
                                zmax = max[2];
                            }
                        }
                    }
                }
            }

            this._aabb.min[0] = xmin;
            this._aabb.min[1] = ymin;
            this._aabb.min[2] = zmin;
            this._aabb.max[0] = xmax;
            this._aabb.max[1] = ymax;
            this._aabb.max[2] = zmax;
        },

        _getJSON: function () {
            var json = {};
            if (this.group) {
                json.group = this.group.id
            }
            return json;
        },

        _destroy: function () {

            this.group = null; // Unsubscribes from worldBoundary updates on Group members

            if (this._worldBoundary) {
                this._worldBoundary.destroy();
            }
        }
    });

})
();
