/**
 A Progress displays a progress loader animation at the center of its {{#crossLink "Canvas"}}{{/crossLink}} while things are loading or otherwise busy.

 ## Usage

 TODO

 @class Progress
 @module xeogl
 @submodule canvas
 @extends Component
 */
(function () {

    "use strict";

    // Ensures lazy-injected CSS only injected once  
    var progressCSSInjected = false;

    xeogl.Progress = xeogl.Component.extend({

        type: "xeogl.Progress",

        _init: function (cfg) {

            this._canvas = cfg.canvas;

            this._injectProgressCSS();

            var div = document.createElement('div');
            var style = div.style;
            style["z-index"] = "9000";
            style.width = "100%";
            style.height = "100%";
            style.position = "absolute";

            div.innerHTML = '<div class="progress-wrap progress"><div class="progress-bar progress"></div></div>';

            this._canvas.parentElement.appendChild(div);
            this._element = div;

            this._wrapper = document.querySelector('.progress-wrap');
            this._progress = document.querySelector('.progress-bar');

            this._adjustPosition();

            this.todo = 0;
            this.done = 0;
        },

        _update: function () {
            if (this._done < this._todo) {
                var progress = this._done / this._todo;
                var width = this._wrapper.getBoundingClientRect().width;
                var total = progress * width;
                this._progress.style.left = Math.floor(total) + 'px';
                this._wrapper.style["visibility"] = "hidden";
                this._wrapper.style["visibility"] = "visible";
            } else {
                this._wrapper.style["visibility"] = "hidden";
                this._todo = 0;
                this._done = 0;
            }
        },

        _props: {

            /**
             The number of outstanding tasks to complete.

             The progress indicator is visible while this property is greater than {{#crossLink "Progress/done:property"}}{{/crossLink}}.

             Clamps to zero if you attempt to set to to a negative value.

             @property todo
             @default 0
             @type Number
             */
            todo: {

                set: function (value) {
                    value = value || 0;
                    if (this._todo === value) {
                        return;
                    }
                    if (value < 0) {
                        return;
                    }
                    this._todo = value;
                    this._needUpdate();
                },

                get: function () {
                    return this._todo;
                }
            },

            /**
             The number of tasks completed.

             The progress indicator is visible while this property is less than {{#crossLink "Progress/todo:property"}}{{/crossLink}}.

             Clamps to zero if you attempt to set to to a negative value.

             @property done
             @default 0
             @type Number
             */
            done: {

                set: function (value) {
                    value = value || 0;
                    if (this._done === value) {
                        return;
                    }
                    if (value < 0) {
                        return;
                    }
                    this._done = value;
                    this._needUpdate();
                },

                get: function () {
                    return this._done;
                }
            },

            /**
             TODO.
             @property progress
             @final
             @type Number
             */
            progress: {
                get: function () {
                    return this._done ? this._done / this._todo : 0;
                }
            }
        },

        _adjustPosition: function () {

            if (!this._canvas || !this._element) {
                return;
            }

            var canvas = this._canvas;
            var progress = this._element;
            var progressStyle = progress.style;

            //  progressStyle["left"] = (canvas.offsetLeft + (canvas.clientWidth * 0.5) - (progress.clientWidth * 0.5)) + "px";
            //  progressStyle["top"] = (canvas.offsetTop + (canvas.clientHeight * 0.5) - (progress.clientHeight * 0.5)) + "px";
        },

        _injectProgressCSS: function () {
            if (progressCSSInjected) {
                return;
            }
            var node = document.createElement('style');
            node.innerHTML = this._progressCSS;
            document.body.appendChild(node);
            progressCSSInjected = true;
        },


        _progressCSS: ".progress {\
        width: 100%;\
        height: 10px;\
        }\
        .progress-wrap {\
        background: #f80;\
        overflow: hidden;\
        position: relative;\
        }\
        .progress-bar {\
        background: #ddd;\
        overflow: hidden;\
        left: 0;\
        position: absolute;\
        top: 0;\
        }"
    });
})();
