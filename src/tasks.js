import {Queue} from './utils/queue.js';

const taskQueue = new Queue(); // Task queue, which is pumped on each frame; tasks are pushed to it with calls to xeogl.schedule

const tasks = {

    /**
     Schedule a task for xeogl to run at the next frame.

     Internally, this pushes the task to a FIFO queue. Within each frame interval, xeogl processes the queue
     for a certain period of time, popping tasks and running them. After each frame interval, tasks that did not
     get a chance to run during the task are left in the queue to be run next time.

     @method scheduleTask
     @param {Function} callback Callback that runs the task.
     @param {Object} [scope] Scope for the callback.
     */
    scheduleTask(callback, scope) {
        taskQueue.push(callback);
        taskQueue.push(scope);
    },

    runTasks(until) { // Pops and processes tasks in the queue, until the given number of milliseconds has elapsed.
        let time = (new Date()).getTime();
        let callback;
        let scope;
        let tasksRun = 0;
        while (taskQueue.length > 0 && time < until) {
            callback = taskQueue.shift();
            scope = taskQueue.shift();
            if (scope) {
                callback.call(scope);
            } else {
                callback();
            }
            time = (new Date()).getTime();
            tasksRun++;
        }
        return tasksRun;
    },

    getNumTasks() {
        return taskQueue.length;
    }
};

export {tasks};