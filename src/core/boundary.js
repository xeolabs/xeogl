(function () {

    "use strict";


    /**
     *
     *
     *
     * @constructor
     * @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Boundary in the
     * default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
     * @param [cfg] {*} Boundary configuration
     * @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
     * You only need to supply an ID if you need to be able to find the Clip by ID within the {{#crossLink "Scene"}}Scene{{/crossLink}}.
     * @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Clip.
     * @param [cfg.mode="disabled"] {String} Clipping mode - "disabled" to clip nothing, "inside" to reject points inside the plane, "outside" to reject points outside the plane.
     * @param [dir= [1, 0, 0]] {Array of Number} The direction of the clipping plane from the World-space origin.
     * @param [dist=1.0] {Number} Distance to the clipping plane along the direction vector.
     *
     * @extends Component
     */
    XEO.Boundary = XEO.Component.extend({

        className: "XEO.Boundary",

        type: "boundary",

        _init: function (cfg) {

            this._space = cfg.space;

            this.objects = cfg.objects;
        },

        set objects(value) {

            var object;

            // Unsubscribe from events on old objects
            for (var i = 0, len = this._objects.length; i < len; i++) {
                object = this._objects[i];
                object.off(this._dirtySubs[i]);
                object.off(this._destroyedSubs[i]);
            }

            this._objects = [];
            this._dirtySubs = [];
            this._destroyedSubs = [];

            var objects = [];
            var self = this;

            for (var i = 0, len = value.length; i < len; i++) {

                object = value[i];

                if (XEO._isString(object)) {

                    // ID given for object - find the object component

                    var id = object;
                    object = this.components[id];
                    if (!object) {
                        this.error("object not found for ID: '" + id + "'");
                        continue;
                    }
                }

                if (object.type !== "object") {
                    this.error("Component is not a object: '" + object.id + "'");
                    continue;
                }

                var space = this._space;

                if (space === "world") {
                    object.on("positions",
                        function (positions) {

                        });
                }

                if (space === "view") {

                }

                this._objects.push(object);

                this._dirtySubs.push(object.on("dirty",
                    function () {
                        self.fire("dirty", true);
                    }));

                this._destroyedSubs.push(object.on("destroyed",
                    function () {
                        var id = this.id; // object ID
                        for (var i = 0, len = self._objects.length; i < len; i++) {
                            if (self._objects[i].id === id) {
                                self._objects = self._objects.slice(i, i + 1);
                                self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                                self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);
                                self.fire("dirty", true);
                                self.fire("objects", self._objects);
                                return;
                            }
                        }
                    }));

                objects.push(object);
            }

            this.fire("dirty", true);
            this.fire("objects", this._objects);
        },

        get objects() {
            return this._objects.slice(0, this._objects.length);
        },

        _getJSON: function () {
            return {
                mode: this.mode,
                dir: this.dir,
                dist: this.dist
            };
        }
    });


})();