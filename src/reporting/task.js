/**
 A **Task** represents an asynchronously-running process within a {{#crossLink "Tasks"}}Tasks{{/crossLink}}.

 See the {{#crossLink "Tasks"}}{{/crossLink}} documentation for more information.</li>

 <img src="../../../assets/images/Task.png"></img>

 @class Task
 @module XEO
 @submodule reporting
 @extends Component
 */
(function () {

    "use strict";

    XEO.Task = XEO.Component.extend({

        type: "XEO.Task",

        serializable: false,

        _init: function (cfg) {

            this.description = cfg.description || "";

            this.failed = false;

            this.completed = false;
        },

        /**
         * Sets this Task as successfully completed.
         *
         * Fires a  {{#crossLink "Task/completed:event"}}{{/crossLink}} event on this task, as well as
         * a {{#crossLink "Tasks/completed:event"}}{{/crossLink}} event on the parent  {{#crossLink "Tasks"}}Task{{/crossLink}}.
         *
         * @method setCompleted
         */
        setCompleted: function () {

            /**
             * Fired when this Task has successfully completed.
             *
             * @event completed
             */
            this.fire("completed", this.completed = true);
        },

        /**
         * Sets this Task as having failed.
         *
         * Fires a  {{#crossLink "Task/failed:event"}}{{/crossLink}} event on this task, as well as
         * a {{#crossLink "Tasks/failed:event"}}{{/crossLink}} event on the parent  {{#crossLink "Tasks"}}Tasks{{/crossLink}}.
         *
         * @method setFailed
         */
        setFailed: function () {

            /**
             * Fired when this Task has failed to complete successfully.
             *
             * @event failed
             */
            this.fire("failed", this.failed = true);
        },

        _destroy: function () {
            if (!this.completed && this.destroyed) {
                this.setCompleted();
            }
        }
    });

})();
