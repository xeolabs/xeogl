/**
 A **Tasks** tracks general asynchronous tasks running within a {{#crossLink "Scene"}}Scene{{/crossLink}}.

 <ul>
 <li>Each {{#crossLink "Scene"}}Scene{{/crossLink}} has a Tasks component, available via the
 {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Scene/tasks:property"}}tasks{{/crossLink}} property,
 within which it will create and destroy {{#crossLink "Task"}}Task{{/crossLink}} components to indicate what processes
 it's running internally.</li>

 <li>You can also manage your own {{#crossLink "Task"}}Task{{/crossLink}} components within that, to indicate what
 application-level processes you are running.</li>
 </ul>

 <img src="../../../assets/images/Tasks.png"></img>

 ## Example

 This example shows how to manage tasks and subscribe to their life cycles.

 ````Javascript
// Create a Scene
var scene = new XEO.Scene();

// Get the Tasks tracker
var tasks = scene.tasks;

// Subscribe to all task creations
tasks.on("started", function(task) {
     console.log("Task started: " + task.id +", " + task.description);
});

// Subscribe to all task completions
tasks.on("completed", function(task) {
      console.log("Task completed: " + task.id +", " + task.description);
});

 // Subscribe to all task failures
tasks.on("failed", function(task) {
     console.log("Task failed: " + task.id +", " + task.description);
});

// Create and start Task "foo"
var taskFoo = tasks.create({
     id: "foo", // Optional, unique ID generated automatically when omitted
     description: "Loading something"
});

// Create and start Task "bar"
var taskBar = tasks.create({
     id: "bar",
     description: "Loading something else"
});

// Subscribe to completion of Task "foo"
taskFoo.on("completed", function(task) {
     console.log("Task completed: " + task.id +", " + task.description);
});

// Subscribe to failure of a specific task
taskFoo.on("failed", function(task) {
     console.log("Task failed: " + task.id +", " + task.description);
});

// Set Task "foo" as completed, via the Tasks
// Fires the "completed" handler we registered above, also fires "completed" on the Task itself
tasks.setCompleted("foo");

// Set Task "bar" as failed, this time directly on the Task in question
myTask2.setFailed();

````
 @class Tasks
 @module XEO
 @submodule reporting
 @constructor
 @extends Component
 */
(function () {

    "use strict";

    XEO.Tasks = XEO.Component.extend({

        type: "XEO.Tasks",

        serializable: false,

        _init: function () {

            this._idMap = new XEO.utils.Map();

            this.tasks = {};
        },

        /**
         * Creates and starts a new {{#crossLink "Task"}}Task{{/crossLink}} instance with this Tasks.
         *
         * If an ID is given for the new {{#crossLink "Task"}}Task{{/crossLink}} that is already in use for
         * another, will log an error message and return null.
         *
         * On success, fires a {{#crossLink "Tasks/started:event"}}{{/crossLink}} event and returns the new {{#crossLink "Task"}}Task{{/crossLink}}
         *  instance.
         *
         * @method create
         * @param params Task params.
         * @param [params.id] {String} Optional unique ID,
         * internally generated if not supplied.
         * @param [params.description] {String} Optional description.
         * @returns {Task|null} The new new {{#crossLink "Task"}}Task{{/crossLink}} instance, or null if there was an ID
         * clash with an existing {{#crossLink "Task"}}Task{{/crossLink}}.
         */
        create: function (params) {

            params = params || {};

            if (params.id) {
                if (this.tasks[params.id]) {
                    this.error("Task " + XEO._inQuotes(params.id) + "already exists");
                    return null;
                }
            } else {
                params.id = this._idMap.addItem({});
            }

            var task = new XEO.Task(this, params);

            this.tasks[params.id] = task;

            var self = this;

            /**
             * Fired whenever a Task within this Tasks has successfully completed.
             *
             * @event completed
             * @param {Task} value The task that has completed
             */
            task.on("completed",
                function () {
                    delete self.tasks[task.id];
                    self._idMap.removeItem(task.id);
                    self.fire("completed", task, true);
                });

            /**
             * Fired whenever a Task within this Tasks has failed.
             *
             * @event failed
             * @param {Task} value The task that has failed
             */
            task.on("failed",
                function () {
                    delete self.tasks[task.id];
                    self._idMap.removeItem(task.id);
                    self.fire("failed", task, true);
                });

            self.fire("started", task, true);

            return task;
        },

        /**
         * Completes the {{#crossLink "Task"}}Task{{/crossLink}} with the given ID.
         *
         * Fires a {{#crossLink "Tasks/completed:event"}}{{/crossLink}} event, as well as separate
         * {{#crossLink "Task/completed:event"}}{{/crossLink}} event on the {{#crossLink "Task"}}Task{{/crossLink}} itself.
         *
         * Logs an error message if no task can be found for the given ID.
         *
         * @method setCompleted
         * @param {String} id ID of the {{#crossLink "Task"}}Task{{/crossLink}} to complete.
         */
        setCompleted: function (id) {

            var task = this.tasks[id];

            if (!task) {
                this.error("Task not found:" + XEO._inQuotes(id));
                return;
            }

            task.fire("completed", task, true);
        },

        /**
         * Fails the {{#crossLink "Task"}}Task{{/crossLink}} with the given ID.
         *
         * Fires a {{#crossLink "Tasks/failed:event"}}{{/crossLink}} event, as well as separate
         * {{#crossLink "Task/failed:event"}}{{/crossLink}} event on the {{#crossLink "Task"}}Task{{/crossLink}} itself.
         *
         * Logs an error message if no task can be found for the given ID.
         *
         * @method setFailed
         * @param {String} id ID of the {{#crossLink "Task"}}Task{{/crossLink}} to fail.
         */
        setFailed: function (id) {

            var task = this.tasks[id];

            if (!task) {
                this.error("Task not found:" + XEO._inQuotes(id));
                return;
            }

            task.fire("failed", task, true);
        },

        clear: function () {
            for (var id in this.tasks) {
                if (this.tasks.hasOwnProperty(id)) {
                    this.tasks[id].setCompleted();
                }
            }
        }
    });


})();
