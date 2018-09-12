import {Map} from './utils/map.js';
import {stats} from './stats.js';
import {utils} from './utils.js';
import {Scene} from "./scene/scene.js";
import {componentClasses} from "./componentClasses.js";

const scenesRenderInfo = {}; // Used for throttling FPS for each Scene
const sceneIDMap = new Map(); // Ensures unique scene IDs
let defaultScene = null;// Default singleton Scene, lazy-initialized in getter

const core = {

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
     Returns the current default {{#crossLink "Scene"}}{{/crossLink}}.

     If no Scenes exist yet, or no Scene has been made default yet with a previous call to
     {{#crossLink "xeogl/setDefaultScene:function"}}{{/crossLink}}, then this method will create the default
     Scene on-the-fly.

     Components created without specifying their Scene will be created within this Scene.

     @method getDefaultScene
     @returns {Scene} The current default scene
     */
    getDefaultScene() {
        if (!defaultScene) {
            defaultScene = new Scene({id: "default.scene"});
        }
        return defaultScene;
    },

    /**
     Sets the current default {{#crossLink "Scene"}}{{/crossLink}}.

     A subsequent call to {{#crossLink "xeogl/getDefaultScene:function"}}{{/crossLink}} will return this Scene.

     Components created without specifying their Scene will be created within this Scene.

     @method setDefaultScene
     @param {Scene} scene The new current default scene
     @returns {Scene} The new current default scene
     */
    setDefaultScene(scene) {
        defaultScene = scene;
        return defaultScene;
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
                    delete core.scenes[scene.id];
                }
            }
        }
    },

    //////////////////////////////////////////////////////////////////////////
    /////////// Fix me
    //////////////////////////////////////////////////////////////////////////

    /**
     Tests if the given component type is a subtype of another component supertype.
     @param {String} type
     @param {String} [superType="xeogl.Component"]
     @returns {boolean}
     @private
     */
    isComponentType: function (type, superType = "xeogl.Component") {
        if (type === superType) {
            return true;
        }
        var clas = componentClasses[type];
        if (!clas) {
            return false;
        }
        var superClas = componentClasses[superType];
        if (!superClas) {
            return false;
        }
        let result = subclasses(clas, superClas);
        return result;
    }
};

function subclasses(ChildClass, ParentClass) {
    var c = ChildClass.prototype;
    while (c !== null) {
        if (c === ParentClass.prototype) {
            return true;
        }
        c = c.__proto__;
    }
    return false;
}

export {core};