import {stats} from './stats.js';
import {core} from './core.js';
import {tasks} from './tasks.js';

const scenesRenderInfo = {}; // Used for throttling FPS for each Scene

const tickEvent = {
    sceneId: null,
    time: null,
    startTime: null,
    prevTime: null,
    deltaTime: null
};

const taskBudget = 10; // Millisecs we're allowed to spend on tasks in each frame
const fpsSamples = [];
const numFPSSamples = 30;

let lastTime = 0;
let elapsedTime;
let totalFPS = 0;

const frame = function () {
    let time = Date.now();
    if (lastTime > 0) { // Log FPS stats
        elapsedTime = time - lastTime;
        var newFPS = 1000 / elapsedTime; // Moving average of FPS
        totalFPS += newFPS;
        fpsSamples.push(newFPS);
        if (fpsSamples.length >= numFPSSamples) {
            totalFPS -= fpsSamples.shift();
        }
        stats.frame.fps = Math.round(totalFPS / fpsSamples.length);
    }
    runTasks(time);
    fireTickEvents(time);
    renderScenes();
    lastTime = time;
    window.requestAnimationFrame(frame);
};

function runTasks(time) { // Process as many enqueued tasks as we can within the per-frame task budget
    const tasksRun = tasks.runTasks(time + taskBudget);
    const tasksScheduled = tasks.getNumTasks();
    stats.frame.tasksRun = tasksRun;
    stats.frame.tasksScheduled = tasksScheduled;
    stats.frame.tasksBudget = taskBudget;
}

function fireTickEvents(time) { // Fire tick event on each Scene
    tickEvent.time = time;
    for (var id in core.scenes) {
        if (core.scenes.hasOwnProperty(id)) {
            var scene = core.scenes[id];
            tickEvent.sceneId = id;
            tickEvent.startTime = scene.startTime;
            tickEvent.deltaTime = tickEvent.prevTime != null ? tickEvent.time - tickEvent.prevTime : 0;
            /**
             * Fired on each game loop iteration.
             *
             * @event tick
             * @param {String} sceneID The ID of this Scene.
             * @param {Number} startTime The time in seconds since 1970 that this Scene was instantiated.
             * @param {Number} time The time in seconds since 1970 of this "tick" event.
             * @param {Number} prevTime The time of the previous "tick" event from this Scene.
             * @param {Number} deltaTime The time in seconds since the previous "tick" event from this Scene.
             */
            scene.fire("tick", tickEvent, true);
        }
    }
    tickEvent.prevTime = time;
}

function renderScenes() {
    const scenes = core.scenes;
    const forceRender = false;
    let scene;
    let renderInfo;
    let ticksPerRender;
    let id;
    for (id in scenes) {
        if (scenes.hasOwnProperty(id)) {
            scene = scenes[id];
            renderInfo = scenesRenderInfo[id];
            if (!renderInfo) {
                renderInfo = scenesRenderInfo[id] = {}; // FIXME
            }
            ticksPerRender = scene.ticksPerRender;
            if (renderInfo.ticksPerRender !== ticksPerRender) {
                renderInfo.ticksPerRender = ticksPerRender;
                renderInfo.renderCountdown = ticksPerRender;
            }
            if (--renderInfo.renderCountdown === 0) {
                scene.render(forceRender);
                renderInfo.renderCountdown = ticksPerRender;
            }
        }
    }
}

window.requestAnimationFrame(frame);

const loop = {};

export{loop};


