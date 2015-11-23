(function () {

    "use strict";

    /**
     A **DAEModel** is a {{#crossLink "Collection"}}{{/crossLink}} of {{#crossLink "Components"}}{{/crossLink}} that are
     loaded from a <a href="https://en.wikipedia.org/wiki/COLLADA" target = "_other">COLLADA .DAE</a> file.

     @class DAEModel
     @module XEO
     @extends Component
     */
    XEO.DAEModel = XEO.Collection.extend({

        type: "XEO.DAEModel",

        _init: function (cfg) {

            this._super(cfg);

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to a .DAE file that provides the Components in this DEAModel.

             Clears this DAEModel when src is undefined.

             Fires a {{#crossLink "DAEModel/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        this.destroyAll();
                        return;
                    }

                    if (!XEO._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    this.clear();

                    //this._taskId = this.taskStarted("Loading .OBJ");

                    this._src = value;

                    var self = this;

                    load(this._src, function (data) {

                            if (!data.length) {
                                //    return;
                            }

                            var m = K3D.parse.fromDAE(data);

                            self.fire("loaded", true);
                        },

                        function (msg) {

                            self.error("Failed to load .DAE file: " + msg);

                            self.fire("failed", msg);

                            //self._taskId = self.taskFailed(self._taskId);
                        });

                    /**
                     Fired whenever this PointLight's  {{#crossLink "PointLight/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _getJSON: function () {
            return {
                src: this._src
            };
        },

        _destroy: function () {
            this._clear();
        }
    });

    function load(url, ok, error) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
//            xhr.addEventListener('progress',
//                function (event) {
//                    // TODO: Update the task? { type:'progress', loaded:event.loaded, total:event.total }
//                }, false);
        xhr.addEventListener('load',
            function (event) {
                if (event.target.response) {
                    ok(event.target.response);
                } else {
                    error('Invalid file [' + url + ']');
                }
            }, false);
        xhr.addEventListener('error',
            function () {
                error('Couldn\'t load URL [' + url + ']');
            }, false);
        xhr.open('GET', url, true);
        xhr.send(null);
    }

})
();