import {Map} from './utils/map.js';
import {stats} from './stats.js';
import {utils} from './utils.js';
import {tasks} from './tasks.js';

const scenesRenderInfo = {}; // Used for throttling FPS for each Scene
const sceneIDMap = new Map(); // Ensures unique scene IDs
let defaultScene = null;// Default singleton Scene, lazy-initialized in getter

const core = {

    _debug: {
        forceHighShaderPrecision: false
    },

    /**
     Semantic version number. The value for this is set by an expression that's concatenated to
     the end of the built binary by the xeogl build script.
     @property version
     @namespace xeogl
     @type {String}
     */
    version: null,

    /**
     Existing {{#crossLink "Scene"}}Scene{{/crossLink}}s , mapped to their IDs
     @property scenes
     @namespace xeogl
     @type {{String:xeogl.Scene}}
     */
    scenes: {},

    _superTypes: {}, // For each component type, a list of its supertypes, ordered upwards in the hierarchy.


    /**
     The default {{#crossLink "Scene"}}Scene{{/crossLink}}.

     Components created without an explicit parent {{#crossLink "Scene"}}Scene{{/crossLink}} will be created within this
     {{#crossLink "Scene"}}Scene{{/crossLink}} by default.

     xeogl creates the default {{#crossLink "Scene"}}Scene{{/crossLink}} as soon as you either
     reference this property for the first time, or create your first {{#crossLink "Mesh"}}Mesh{{/crossLink}} without
     a specified {{#crossLink "Scene"}}Scene{{/crossLink}}.

     @property scene
     @namespace xeogl
     @type Scene
     */
    get scene() {
        return defaultScene || (defaultScene = new Scene({id: "default.scene"}));
    },

    set scene(value) {
        defaultScene = value;
    },

    /**
     Registers a scene on xeogl.
     This is called within the xeogl.Scene constructor.

     @method _addScene
     @param {Scene} scene The scene
     @private
     */
    _addScene(scene) {
        if (scene.id) { // User-supplied ID
            if (core.scenes[scene.id]) {
                console.error(`[ERROR] Scene ${utils.inQuotes(scene.id)} already exists`);
                return;
            }
        } else { // Auto-generated ID
            scene.id = sceneIDMap.addItem({});
        }
        core.scenes[scene.id] = scene;
        const ticksPerRender = scene.ticksPerRender;
        scenesRenderInfo[scene.id] = {
            ticksPerRender,
            renderCountdown: ticksPerRender
        };
        stats.components.scenes++;
        scene.on("destroyed", () => { // Unregister destroyed scenes
            sceneIDMap.removeItem(scene.id);
            delete core.scenes[scene.id];
            delete scenesRenderInfo[scene.id];
            stats.components.scenes--;
        });
    },

    /**
     Destroys all user-created {{#crossLink "Scene"}}Scenes{{/crossLink}} and
     clears the default {{#crossLink "Scene"}}Scene{{/crossLink}}.

     @method clear
     @demo foo
     */
    clear() {
        let scene;
        for (const id in core.scenes) {
            if (core.scenes.hasOwnProperty(id)) {
                scene = core.scenes[id];
                // Only clear the default Scene
                // but destroy all the others
                if (id === "default.scene") {
                    scene.clear();
                } else {
                    scene.destroy();
                }
            }
        }
        core.scenes = {};
    }
};

//---------------------------------------------------------------------------------------------------------------------
// Game loop
//---------------------------------------------------------------------------------------------------------------------

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

export {core};

