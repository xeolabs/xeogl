
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
 @submodule grouping
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

            this.group = cfg.group;
        },

        _props: {

            /**
             * The {{#crossLink "Collection"}}Collection{{/crossLink}} attached to this GameObject.
             *
             * Defaults to an empty internally-managed {{#crossLink "Collection"}}{{/crossLink}}. 
             *
             * Fires a {{#crossLink "GameObject/group:event"}}{{/crossLink}} event on change.
             *
             * @property group
             * @type Group
             */
            group: {

                set: function (value) {

                    /**
                     * Fired whenever this GroupBoundary's  {{#crossLink "GroupBoundary/group:property"}}{{/crossLink}} property changes.
                     *
                     * @event group
                     * @param value The property's new value
                     */
                    this._setChild("group", value);
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

                            getOBB: function () {

                                // Calls our Geometry's modelBoundary property,
                                // lazy-inits the boundary and its obb

                                return self._children.geometry.modelBoundary.obb;
                            },

                            getMatrix: function () {
                                return self._children.transform.matrix;
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
                                return self._children.camera.view.matrix;
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

        _setWorldBoundaryDirty: function () {
            this._worldBoundaryDirty = true;
            this._viewBoundaryDirty = true;
            if (this._worldBoundary) {
                this._worldBoundary.set("updated", true);
            }
            if (this._viewBoundary) {
                this._viewBoundary.set("updated", true);
            }
        },

        _setViewBoundaryDirty: function () {
            this._viewBoundaryDirty = true;
            if (this._viewBoundary) {
                this._viewBoundary.set("updated", true);
            }
        },
        
        _getJSON: function () {
            return {
                
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
