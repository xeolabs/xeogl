import {Map} from "../utils/map.js";

const ids = new Map({});

class State {

    constructor(cfg) {
        this.id = ids.addItem({});
        for (const key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                this[key] = cfg[key];
            }
        }
    }

    destroy() {
        ids.removeItem(this.id);
    }
}

export{State};