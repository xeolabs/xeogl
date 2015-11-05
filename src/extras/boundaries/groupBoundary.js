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
 @param [cfg.blendEnabled=false] {Boolean} Indicates if blending is enabled.
 @param [cfg.colorMask=[true, true, true, true]] {Array of Boolean} The color mask,
 @extends Component
 */
(function () {

    "use strict";

    XEO.GroupBoundary = XEO.Component.extend({

        type: "XEO.GroupBoundary",

        _init: function (cfg) {

            this._onUpdated = {};

            this.group = cfg.group;
        },

        _props: {

            /**
             * The {{#crossLink "Group"}}{{/crossLink}} attached to this GameObject.
             *
             * Defaults to an empty internally-managed {{#crossLink "Group"}}{{/crossLink}}.
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

                        oldGroup.iterate(unbind);
                    }

                    /**
                     * Fired whenever this GroupBoundary's  {{#crossLink "GroupBoundary/group:property"}}{{/crossLink}} property changes.
                     *
                     * @event group
                     * @param value The property's new value
                     */
                    var group = this._setChild("group", value);

                    var self = this;

                    if (group) {

                        this._onAdded = group.on("added",
                            function (c) {
                                if (c.worldBoundary) {
                                    bind(c);
                                }
                            });

                        this._onRemoved = group.on("removed",
                            function (c) {
                                if (c.worldBoundary) {
                                    unbind(c);
                                }
                            });

                        this._onRemoved = group.on("updated",
                            function () {
                                if (!self._AABBDirty) {
                                    self._setAABBDirty();
                                }
                            });

                        group.iterate(bind);

                        this._setAABBDirty();
                    }

                    function bind(c) {
                        var worldBoundary = c.worldBoundary;
                        if (!worldBoundary) {
                            return;
                        }
                        self._onUpdated[c.id] = worldBoundary.on("updated",
                            function () {
                                self._setAABBDirty();
                            });
                    }

                    function unbind(c) {
                        var worldBoundary = c.worldBoundary;
                        if (!worldBoundary) {
                            return;
                        }
                        worldBoundary.off(self._onUpdated[c.id]);
                        delete self._onUpdated[c.id];
                    }

                    this._setAABBDirty();
                },

                get: function () {
                    return this._children.group;
                }
            },

            /**
             * World-space 3D boundary.
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
                                if (self._worldBoundaryDirty) {
                                    self._worldBoundaryDirty = false;
                                    return true;
                                }
                                return false;
                            },

                            getAABB: function () {

                                if (self._AABBDirty) {

                                    self._buildAABB();

                                    self._AABBDirty = false;
                                }

                                return self._aabb;
                            }
                        });

                        this._worldBoundary.on("destroyed",
                            function () {
                                self._worldBoundary = null;
                            });

                        this._setWorldBoundaryDirty();
                    }

                    return this._worldBoundary;
                }
            }
        },

        _setAABBDirty: function () {
            if (this._AABBDirty) {
                return;
            }
            this._AABBDirty = true;
            this._setWorldBoundaryDirty();
        },

        _setWorldBoundaryDirty: function () {
            if (this._worldBoundaryDirty) {
                return;
            }
            this._worldBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
        },

        _buildAABB: function () {

            if (!this._aabb) {
                this._aabb = {
                    xmin: 0, ymin: 0, zmin: 0,
                    xmax: 0, ymax: 0, zmax: 0
                };
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

            var group = this.group;

            if (group) {

                var components = group.components;

                for (var componentId in components) {
                    if (components.hasOwnProperty(componentId)) {

                        component = components[componentId];

                        worldBoundary = component.worldBoundary;
                        if (worldBoundary) {

                            aabb = worldBoundary.aabb;

                            if (aabb.xmin < xmin) {
                                xmin = aabb.xmin;
                            }

                            if (aabb.ymin < ymin) {
                                ymin = aabb.ymin;
                            }

                            if (aabb.zmin < zmin) {
                                zmin = aabb.zmin;
                            }

                            if (aabb.xmax > xmax) {
                                xmax = aabb.xmax;
                            }

                            if (aabb.ymax > ymax) {
                                ymax = aabb.ymax;
                            }

                            if (aabb.zmax > zmax) {
                                zmax = aabb.zmax;
                            }
                        }
                    }
                }
            }

            this._aabb.xmin = xmin;
            this._aabb.ymin = ymin;
            this._aabb.zmin = zmin;
            this._aabb.xmax = xmax;
            this._aabb.ymax = ymax;
            this._aabb.zmax = zmax;
        },

        _getJSON: function () {
            var json = {};
            if (this.group) {
                json.group = this.group
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
