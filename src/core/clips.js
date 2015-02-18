"use strict";

/**
 A group of arbitrarily-aligned {{#crossLink "Clip"}}Clip{{/crossLink}} planes that clip fragments of associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 <ul>

 <li>Each {{#crossLink "Clip"}}Clip{{/crossLink}} is specified in World-space, as being perpendicular to a vector
 {{#crossLink "Clip/dir:property"}}{{/crossLink}} that emanates from the origin, offset at a
 distance {{#crossLink "Clip/dist:property"}}{{/crossLink}} along that vector. </li>

 <li>You can move each {{#crossLink "Clip"}}Clip{{/crossLink}} back and forth along its vector by varying
 its {{#crossLink "Clip/dist:property"}}{{/crossLink}}.</li>

 <li>Likewise, you can rotate each {{#crossLink "Clip"}}Clip{{/crossLink}} about the origin by rotating
 its {{#crossLink "Clip/dir:property"}}{{/crossLink}}.</li>

 <li>Each {{#crossLink "Clip"}}Clip{{/crossLink}} is has a {{#crossLink "Clip/mode:property"}}{{/crossLink}}, which indicates whether it is disabled ("disabled"), discarding fragments that fall on the origin-side of the plane ("inside"), or clipping fragments that fall on the other side of the plane from the origin ("outside").</li>

 <li>You can update each {{#crossLink "Clip"}}Clip{{/crossLink}}'s {{#crossLink "Clip/mode:property"}}{{/crossLink}} to
 activate or deactivate it, or to switch which side it discards fragments from.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/6890347/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that's clipped by a {{#crossLink "Clips"}}{{/crossLink}}
 that contains two {{#crossLink "Clip"}}{{/crossLink}} planes. The first {{#crossLink "Clip"}}{{/crossLink}} plane is on the
 positive diagonal, while the second is on the negative diagonal. The {{#crossLink "GameObject"}}GameObject's{{/crossLink}}
 {{#crossLink "Geometry"}}{{/crossLink}} is the default 2x2x2 box, and the planes will clip off two of the box's corners.

 ````javascript
 var scene = new XEO.Scene();

 // Clip plane on negative diagonal
 var clip1 = new XEO.Clip(scene, {
       dir: [-1.0, -1.0, -1.0], // Direction of Clip from World space origin
       dist: 2.0,               // Distance along direction vector
       mode: "outside"          // Clip fragments that fall beyond the plane
 });

 // Clip plane on positive diagonal
 var clip2 = new XEO.Clip(scene, {
      dir: [1.0, 1.0, 1.0],
      dist: 2.0,
      mode: "outside"
  });

 // Group the planes in a Clips
 var clips = new XEO.Clip(scene, {
       clips: [
            clip1,
            clip2
        ]
  });

 // Geometry defaults to a 2x2x2 box
 var geometry = new XEO.Geometry(scene);

 // Create an GameObject, which is a box sliced by our clip planes
 var object = new XEO.GameObject(scene, {
       clips: clips,
       geometry: geometry
   });

 // Subscribe to change of a clip plane's distance
 clip1.on("dist",
    function(value) {
        // Property value has changed
    });

 // Subscribe to change of a clip plane's direction
 clip2.on("dir",
    function(dir) {
        // Property value has changed
    });

 // Set a clip plane's distance, firing the first change handler
 clip1.dist = 3.0;

 // Set a clip plane's direction, firing the second change handler
 clip1.dir = [1.0, -1.0, -1.0];

 // When we destroy a Clip, it gets automatically removed from its Clips
 clip1.destroy();

 // When we destroy a Clips, the GameObject will fall back on the Scene's default (empty) Clips
 clips.destroy();
 ````

 @class Clips
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Clips in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clips.
 @param [cfg.clips] {Array(String)|Array(XEO.Clip)} Array containing either IDs or instances of
 {{#crossLink "Clip"}}Clip{{/crossLink}} components within the parent {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @extends Component
 */
XEO.Clips = XEO.Component.extend({

    className: "XEO.Clips",

    type: "clips",

    _init: function (cfg) {

        this._clips = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        this.clips = cfg.clips;
    },

    /**
     * The clipping planes contained within this Clips.
     *
     * Fires a {{#crossLink "Clips/clips:event"}}{{/crossLink}} event on change.
     *
     * @property clips
     * @default []
     * @type Array(XEO.Clip)
     */
    set clips(value) {

        var clip;

        // Unsubscribe from events on old clips        
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clip = this._clips[i];
            clip.off(this._dirtySubs[i]);
            clip.off(this._destroyedSubs[i]);
        }

        this._clips = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        var clips = [];
        var self = this;

        for (var i = 0, len = value.length; i < len; i++) {

            clip = value[i];

            if (XEO._isString(clip)) {

                // ID given for clip - find the clip component

                var id = clip;
                clip = this.components[id];
                if (!clip) {
                    this.error("Clip not found for ID: '" + id + "'");
                    continue;
                }
            }

            if (clip.type != "clip") {
                this.error("Component is not a clip: '" + clip.id + "'");
                continue;
            }

            this._clips.push(clip);

            this._dirtySubs.push(clip.on("dirty",
                function () {
                    self.fire("dirty", true);
                }));

            this._destroyedSubs.push(clip.on("destroyed",
                function () {
                    var id = this.id; // Clip ID
                    for (var i = 0, len = self._clips.length; i < len; i++) {
                        if (self._clips[i].id == id) {
                            self._clips = self._clips.slice(i, i + 1);
                            self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                            self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);
                            self.fire("dirty", true);
                            self.fire("clips", self._clips);
                            return;
                        }
                    }
                }));

            clips.push(clip);
        }

        /**
          Fired whenever this Clips' {{#crossLink "Clips/clips:property"}}{{/crossLink}} property changes.
          @event clips
          @param value {Array of XEO.Clip} The property's new value
         */
        this.fire("dirty", true);
        this.fire("clips", this._clips);
    },

    get clips() {
        return this._clips.slice(0, this._clips.length);
    },

    _compile: function () {
        var clips = [];
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clips.push(this._clips[i]._core)
        }
        var core = {
            type: "clips",
            clips: clips,
            hash: this._makeHash(clips)
        };
        this._renderer.clips = core;
    },

    _makeHash: function (clips) {
        if (clips.length == 0) {
            return "";
        }
        var parts = [];
        var clip;
        for (var i = 0, len = clips.length; i < len; i++) {
            clip = clips[i];
            parts.push(clip.mode);
            if (clip.specular) {
                parts.push("s");
            }
            if (clip.diffuse) {
                parts.push("d");
            }
            parts.push((clip.space == "world") ? "w" : "v");
        }
        return parts.join("");
    },

    _getJSON: function () {
        var clipIds = [];
        for (var i = 0, len = this._clips.length; i < len; i++) {
            clipIds.push(this._clips[i].id);
        }
        return {
            clips: clipIds
        };
    }
});