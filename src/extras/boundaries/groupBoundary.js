/**
 A **GroupBoundary** configures the WebGL color buffer for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Overview

 <ul>

 <li>A GroupBoundary configures **the way** that pixels are written to the WebGL color buffer.</li>
 <li>GroupBoundary is not to be confused with {{#crossLink "ColorTarget"}}ColorTarget{{/crossLink}}, which stores rendered pixel
 colors for consumption by {{#crossLink "Texture"}}Textures{{/crossLink}}, used when performing *render-to-texture*.</li>

 </ul>

 <img src="../../../assets/images/GroupBoundary.png"></img>

 ## Example

 In this example we're configuring the WebGL color buffer for a {{#crossLink "GameObject"}}{{/crossLink}}.

 This example scene contains:

 <ul>
 <li>a GroupBoundary that enables blending and sets the color mask,</li>
 <li>a {{#crossLink "Geometry"}}{{/crossLink}} that is the default box shape, and
 <li>a {{#crossLink "GameObject"}}{{/crossLink}} attached to all of the above.</li>
 </ul>

 ````javascript
 var scene = new XEO.Scene();

 var GroupBoundary = new XEO.GroupBoundary(scene, {
    blendEnabled: true,
    colorMask: [true, true, true, true]
});

 var geometry = new XEO.Geometry(scene); // Defaults to a 2x2x2 box

 var gameObject = new XEO.GameObject(scene, {
    GroupBoundary: GroupBoundary,
    geometry: geometry
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
                            function () {
                                if (c.worldBoundary) {
                                    bind(c);
                                    self._setGroupDirty();
                                }
                            });

                        this._onRemoved = group.on("removed",
                            function (c) {
                                if (c.worldBoundary) {
                                    unbind(c);
                                    self._setGroupDirty();
                                }
                            });

                        group.iterate(bind);

                        this._setGroupDirty();
                    }

                    function bind(c) {
                        var worldBoundary = c.worldBoundary;
                        if (!worldBoundary) {
                            return;
                        }
                        self._onUpdated[c.id] = worldBoundary.on("updated",
                            function () {
                                self._setGroupDirty();
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

                    this._setGroupDirty();
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
                                return self._worldBoundaryDirty;
                            },

                            getAABB: function () {

                                if (self._groupDirty) {

                                    self._buildAABB();

                                    self._groupDirty = false;
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
            },

            /**
             * View-space 3D boundary.
             *
             * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
             * this property will be assigned to a fresh {{#crossLink "Boundary3D"}}{{/crossLink}} instance
             * next time you reference it.
             *
             * @property viewBoundary
             * @type Boundary3D
             * @final
             */
            viewBoundary: {

                get: function () {

                    if (!this._viewBoundary) {

                        var self = this;

                        this._viewBoundary = new XEO.Boundary3D(this.scene, {

                            getDirty: function () {
                                return self._viewBoundaryDirty;
                            },

                            getOBB: function () {

                                // Calls our worldBoundary property,
                                // lazy-inits the boundary and its obb

                                return self.worldBoundary.obb;
                            },

                            getMatrix: function () {

                                // TODO:
                                return self.scene.camera.view.matrix;
                            }
                        });

                        this._viewBoundary.on("destroyed",
                            function () {
                                self._viewBoundary = null;
                            });

                        this._setViewBoundaryDirty();
                    }

                    return this._viewBoundary;
                }
            }
        },

        /**
         * Canvas-space 2D boundary.
         *
         * If you call {{#crossLink "Component/destroy:method"}}{{/crossLink}} on this boundary, then
         * this property will be assigned to a fresh {{#crossLink "Boundary2D"}}{{/crossLink}} instance
         * next time you reference it.
         *
         * @property canvasBoundary
         * @type Boundary2D
         * @final
         */
        canvasBoundary: {

            get: function () {

                if (!this._canvasBoundary) {

                    var self = this;

                    // TODO: bind to transform and camera updates here, for lazy-binding efficiency goodness?

                    this._canvasBoundary = new XEO.Boundary2D(this.scene, {

                        getDirty: function () {
                            return self._canvasBoundaryDirty;
                        },

                        getOBB: function () {
                            return self.viewBoundary.obb; // Lazy-inits!
                        },

                        getMatrix: function () {
                            return self.scene.camera.project.matrix;
                        }
                    });

                    this._canvasBoundary.on("destroyed",
                        function () {
                            self._canvasBoundary = null;
                        });

                    this._setCanvasBoundaryDirty();
                }

                return this._canvasBoundary;
            }
        },

        _setGroupDirty: function () {
            this._groupDirty = true;
            this._setWorldBoundaryDirty();
        },

        _setWorldBoundaryDirty: function () {
            this._worldBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.fire("updated", true);
            }
            this._setViewBoundaryDirty();
        },

        _setViewBoundaryDirty: function () {
            this._viewBoundaryDirty = true;
            if (this._viewBoundary) {
                this._viewBoundary.fire("updated", true);
            }
            this._setCanvasBoundaryDirty();
        },

        _setCanvasBoundaryDirty: function () {
            this._canvasBoundaryDirty = true;
            if (this._canvasBoundary) {
                this._canvasBoundary.fire("updated", true);
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

            for (var componentId in this.components) {
                if (this.components.hasOwnProperty(componentId)) {

                    component = this.components[componentId];

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

            this._aabb.xmin = xmin;
            this._aabb.ymin = ymin;
            this._aabb.zmin = zmin;
            this._aabb.xmax = xmax;
            this._aabb.ymax = ymax;
            this._aabb.zmax = zmax;
        },

        _getJSON: function () {
            return {};
        },

        _destroy: function () {
            this.group = null;
        }
    });

})
();
