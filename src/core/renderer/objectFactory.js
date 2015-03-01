XEO.renderer = XEO.renderer || {};

XEO.renderer.GameObjectFactory = new (function () {

    var freeGameObjects = [];
    var numFreeGameObjects = 0;

    this.getGameObject = function (id) {
        var object;
        if (numFreeGameObjects > 0) {
            object = freeGameObjects[--numFreeGameObjects];
            object.id = id;
            return object;
        }
        return new XEO.renderer.GameObject(id);
    };

    this.putGameObject = function (object) {
        freeGameObjects[numFreeGameObjects++] = object;
    };
})();


