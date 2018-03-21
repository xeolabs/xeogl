/*
 Based on Simple JavaScript Inheritance
 By John Resig http://ejohn.org/
 MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {

    var initializing = false;

    var fnTest = /xyz/.test(function () {xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {

            //
            if (name === "_props") {
                var props = prop[name];
                var descriptor;
                for (var key in props) {
                    descriptor = props[key];
                    if (key.indexOf(",") >= 0) { // Aliased property name of form "foo, bar, baz": { .. }
                        var aliases = key.split(",");
                        for (var i = 0, len = aliases.length; i < len; i++) {
                            var alias = aliases[i].trim();
                            if (!descriptor.set) {
                                (function () {
                                    var name3 = alias;
                                    descriptor.set = function () {
                                        this.warn("Property '" + name3 + "' is read-only, ignoring assignment");
                                    };
                                })();
                            }
                            descriptor.enumerable = true; // Want property to show up in inspectors
                            Object.defineProperty(prototype, alias, descriptor);
                        }
                    } else {

                        // If no setter is provided, then the property
                        // is strictly read-only. Insert a dummy setter
                        // to log a warning.

                        if (!descriptor.set) {
                            (function () {
                                var name = key;
                                descriptor.set = function () {
                                    this.warn("Property '" + name + "' is read-only, ignoring assignment");
                                };
                            })();
                        }
                        descriptor.enumerable = true; // Want property to show up in inspectors
                        Object.defineProperty(prototype, key, descriptor);
                    }
                }
                continue;
            }

            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) : prop[name];
        }

        // Create array of type names to indicate inheritance chain,
        // to support "isType" queries on components
        prototype.superTypes = _super.superTypes ? _super.superTypes.concat(_super.type) : [];

        if (!prop.type) {
            prop.type = _super.type + "_" + createUUID();
        } else {
            xeogl._superTypes[prop.type] = prototype.superTypes;
        }

        // The dummy class constructor
        function Class() {

            // All construction is actually done in the init method
            if (!initializing && this.__init)
                this.__init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        window[prop.type] = Class;

        return Class;
    };

    /**
     * Returns a new UUID.
     * @method createUUID
     * @static
     * @return string The new UUID
     */
    var createUUID = (function () {
        // http://www.broofa.com/Tools/Math.uuid.htm
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = new Array(36);
        var rnd = 0, r;
        return function () {
            for (var i = 0; i < 36; i++) {
                if (i === 8 || i === 13 || i === 18 || i === 23) {
                    uuid[i] = '-';
                } else if (i === 14) {
                    uuid[i] = '4';
                } else {
                    if (rnd <= 0x02) {
                        rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                    }
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[( i === 19 ) ? ( r & 0x3 ) | 0x8 : r];
                }
            }
            return uuid.join('');
        };
    })();
})();

