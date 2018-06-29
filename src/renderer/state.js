(function () {
    var ids = new xeogl.utils.Map({});
    xeogl.renderer.State = function (cfg) {
        this.id = ids.addItem({});
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                this[key] = cfg[key];
            }
        }
    };
    xeogl.renderer.State.prototype.destroy = function () {
        ids.removeItem(this.id);
    };
})();