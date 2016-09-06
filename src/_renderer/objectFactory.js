                (function () {

    "use strict";

    XEO.renderer.ObjectFactory = function () {

        var freeObjects = [];
        var numFreeObjects = 0;

        this.get = function (id) {

            var object;

            if (numFreeObjects > 0) {

                object = freeObjects[--numFreeObjects];

                object.id = id;

                object.compiled = false;

                return object;
            }

            return new XEO.renderer.Object(id);
        };

        this.put = function (object) {
            freeObjects[numFreeObjects++] = object;
        };
    };

})();


