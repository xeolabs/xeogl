var Transition = function () {

    var tasks = [];
    var dir = 0;
    var t = 0;
    var ok;

    xeogl.scene.on("tick", function () {
        if (dir === 0) {
            return;
        }
        if (t < 0) {
            t = 0;
            dir = 0;
        }
        if (t > 1) {
            t = 1;
            dir = 0;
        }
        for (var i = 0, len = tasks.length; i < len; i++) {
            tasks[i](t);
        }
        if (dir !== 0) {
            t += 0.03 * dir;
        } else {
            if (ok) {
                ok();
            }
        }
    });

    this.xray = function (ids, alpha) {
        var alphaFresnel = new xeogl.Fresnel({
            edgeBias: 0.2,
            centerBias: 0.8,
            edgeColor: [1.0, 1.0, 1.0],
            centerColor: [0.0, 0.0, 0.0],
            power: 1.0
        });
        for (var i = 0, len = ids.length; i < len; i++) {
            var id = ids [i];
            tasks.push((function () {
                var entity = model.entities[id];
                var startAlpha = entity.material.alpha;
                return function (t) {
                    var newAlpha = startAlpha + (t * (alpha - startAlpha));
                    entity.material.alpha =newAlpha;
                    entity.material.alphaMode = (newAlpha < 1.0) ? "blend" : "opaque"; // Note: breaks alpha maps

                    //  entity.material.alphaFresnel = alphaFresnel;
                };
            })());
        }
        return this;
    };

    this.translate = function (ids, xyz) {
        for (var i = 0, len = ids.length; i < len; i++) {
            var id = ids [i];
            tasks.push((function () {
                var entity = model.entities[id];
                entity.transform = new xeogl.Translate({
                    parent: entity.transform
                });
                return function (t) {
                    entity.transform.xyz = [xyz[0] * t, xyz[1] * t, xyz[2] * t]
                };
            })());
        }
        return this;
    };

    this.play = function (_ok) {
        dir = 1.0;
        t = 0.0;
        ok = _ok;
    };

    this.rewind = function () {
        dir = -1.0;
        t = 1.0;
    };
};