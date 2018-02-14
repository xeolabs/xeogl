xeogl.utils = xeogl.utils || {};

/**
 * Generic map of IDs to items - can generate own IDs or accept given IDs. IDs should be strings in order to not
 * clash with internally generated IDs, which are numbers.
 */
xeogl.utils.Map = function (items, baseId) {

    this.items = items || [];

    baseId = baseId || 0;
    var lastUniqueId = baseId + 1;

    /**
     * Usage:
     *
     * id = myMap.addItem("foo") // ID internally generated
     * id = myMap.addItem("foo", "bar") // ID is "foo"
     */
    this.addItem = function () {
        var item;
        if (arguments.length === 2) {
            var id = arguments[0];
            item = arguments[1];
            if (this.items[id]) { // Won't happen if given ID is string
                throw "ID clash: '" + id + "'";
            }
            this.items[id] = item;
            return id;

        } else {
            item = arguments[0] || {};
            while (true) {
                var findId = lastUniqueId++;
                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    this.removeItem = function (id) {
        var item = this.items[id];
        delete this.items[id];
        return item;
    };
};
