XEO.Clips.Show = XEO.Component.extend({

    className: "XEO.Clips.Show",

    type: "clips.show",

    _init: function (cfg) {

        var self = this;
        var scene = this.scene;

        this._geometry = new XEO.Geometry(scene, {
            // TODO: wire outline of clip plane
        });

        this._material = new XEO.Material(scene, {
            color: [0.4, 1.0, 0.4],
            emit: 0.5
        });

        this._clips = {};

        scene.on("componentCreated", function (component) {
            if (component.type == "clip") {
                createClip(component.id, component);
            }
        });

        scene.on("componentDestroyed", function (component) {
            if (component.type == "clip") {
                destroyClip(component.id);
            }
        });

        function createClip(id, clip) {
            self._clips[i] = {
                translate: new XEO.Translate(scene, [0, clip.dist, 0]),
                rotate: new XEO.Rotate(scene, {})
            };
            //..
        }

        function destroyClip(id) {

        }
    },

    _destroy: function () {

    }
});
