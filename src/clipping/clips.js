/**

 A **Clips** is a group of arbitrarily-aligned World-space {{#crossLink "Clip"}}Clip{{/crossLink}} planes, which may be used to create
 cross-section views of attached {{#crossLink "Entity"}}Entities{{/crossLink}}.

 ## Overview


 * Each {{#crossLink "Clip"}}Clip{{/crossLink}} is specified in World-space, as being perpendicular to a vector
 {{#crossLink "Clip/dir:property"}}{{/crossLink}} that emanates from the origin, offset at a
 distance {{#crossLink "Clip/dist:property"}}{{/crossLink}} along that vector.
 * You can move each {{#crossLink "Clip"}}Clip{{/crossLink}} back and forth along its vector by varying
 its {{#crossLink "Clip/dist:property"}}{{/crossLink}}.
 * Likewise, you can rotate each {{#crossLink "Clip"}}Clip{{/crossLink}} about the origin by rotating
 its {{#crossLink "Clip/dir:property"}}{{/crossLink}} vector.
 * Each {{#crossLink "Clip"}}Clip{{/crossLink}} is has a {{#crossLink "Clip/mode:property"}}{{/crossLink}}, which indicates whether it is disabled ("disabled"), discarding fragments that fall on the origin-side of the plane ("inside"), or clipping fragments that fall on the other side of the plane from the origin ("outside").
 * You can update each {{#crossLink "Clip"}}Clip{{/crossLink}}'s {{#crossLink "Clip/mode:property"}}{{/crossLink}} to
 activate or deactivate it, or to switch which side it discards fragments from.
 * Clipping may also be enabled or disabled for specific {{#crossLink "Entity"}}Entities{{/crossLink}}
 via the {{#crossLink "Modes/clipping:property"}}{{/crossLink}} flag on {{#crossLink "Modes"}}Modes{{/crossLink}} components
 attached to those {{#crossLink "Entity"}}Entities{{/crossLink}}.

 <img src="../../../assets/images/Clips.png"></img>

 ## Usage

 See {{#crossLink "Clip"}}{{/crossLink}} for an example.

 @class Clips
 @module xeogl
 @submodule clipping
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Clips in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clips.
 @param [cfg.clips] {Array(String)|Array(xeogl.Clip)} Array containing either IDs or instances of
 {{#crossLink "Clip"}}Clip{{/crossLink}} components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @extends Component
 */
(function () {

    "use strict";

    xeogl.Clips = xeogl.Component.extend({

        type: "xeogl.Clips",

        _init: function (cfg) {

            // Renderer state contains the states of the child Clip components
            this._state = new xeogl.renderer.Clips({

                clips: [],

                hash: ""
            });

            this._dirty = true;

            // Array of child Clip components
            this._clips = [];

            // Subscriptions to "dirty" events from child Clip components
            this._dirtySubs = [];

            // Subscriptions to "destroyed" events from child Clip components
            this._destroyedSubs = [];

            // Add initial Clip components
            this.clips = cfg.clips;
        },

        _props: {

            /**
             * The clipping planes contained within this Clips.
             *
             * Fires a {{#crossLink "Clips/clips:event"}}{{/crossLink}} event on change.
             *
             * @property clips
             * @default []
             * @type Array(xeogl.Clip)
             */
            clips: {

                set: function (value) {

                    value = value || [];

                    var clip;
                    var i;
                    var len;
                    var id;

                    // Unsubscribe from events on old clips
                    for (i = 0, len = this._clips.length; i < len; i++) {

                        clip = this._clips[i];

                        clip.off(this._dirtySubs[i]);
                        clip.off(this._destroyedSubs[i]);
                    }

                    this._clips = [];

                    this._dirtySubs = [];
                    this._destroyedSubs = [];

                    var self = this;

                    function clipDirty() {
                        self.fire("dirty", true);
                    }

                    function clipDestroyed() {

                        var id = this.id; // Clip ID

                        for (var i = 0, len = self._clips.length; i < len; i++) {

                            if (self._clips[i].id === id) {

                                self._clips = self._clips.slice(i, i + 1);

                                self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                                self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);

                                self._dirty = true;

                                self.fire("dirty", true);
                                self.fire("clips", self._clips);

                                return;
                            }
                        }
                    }

                    for (i = 0, len = value.length; i < len; i++) {

                        clip = value[i];

                        if (xeogl._isString(clip)) {

                            // ID given for clip - find the clip component

                            id = clip;

                            clip = this.components[id];

                            if (!clip) {
                                this.error("Component not found: " + xeogl._inQuotes(id));
                                continue;
                            }
                        }

                        if (clip.type !== "xeogl.Clip") {
                            this.error("Component " + xeogl._inQuotes(id) + " is not a xeogl.Clip");
                            continue;
                        }

                        this._clips.push(clip);

                        this._dirtySubs.push(clip.on("dirty", clipDirty));

                        this._destroyedSubs.push(clip.on("destroyed", clipDestroyed));
                    }

                    this._dirty = true;

                    /**
                     Fired whenever this Clips' {{#crossLink "Clips/clips:property"}}{{/crossLink}} property changes.
                     @event clips
                     @param value {Array of xeogl.Clip} The property's new value
                     */
                    this.fire("dirty", true);
                    this.fire("clips", this._clips);
                },

                get: function () {
                    return this._clips.slice(0, this._clips.length);
                }
            }
        },

        _compile: function () {

            var state = this._state;

            if (this._dirty) {

                state.clips = [];

                for (var i = 0, len = this._clips.length; i < len; i++) {
                    state.clips.push(this._clips[i]._state);
                }

                this._makeHash();

                this._dirty = false;
            }

            this._renderer.clips = state;
        },

        _makeHash: function () {

            var clips = this._state.clips;

            if (clips.length === 0) {
                return ";";
            }

            var clip;
            var hash = [];

            for (var i = 0, len = clips.length; i < len; i++) {

                clip = clips[i];

                hash.push(clip._state.mode);
            }

            hash.push(";");

            this._state.hash = hash.join("");
        },

        _getJSON: function () {

            var clipIds = [];

            for (var i = 0, len = this._clips.length; i < len; i++) {
                clipIds.push(this._clips[i].id);
            }

            return {
                clips: clipIds
            };
        },

        _destroy: function () {
            this._state.destroy();
        }
    });

})();
