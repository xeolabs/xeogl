/*
 Based on Simple JavaScript Inheritance
 By John Resig http://ejohn.org/
 MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {

    let initializing = false;

    const fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {

        const _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        const prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (const name in prop) {

            //
            if (name === "_props") {
                const props = prop[name];
                let descriptor;
                for (const key in props) {
                    descriptor = props[key];
                    if (key.indexOf(",") >= 0) { // Aliased property name of form "foo, bar, baz": { .. }
                        const aliases = key.split(",");
                        for (let i = 0, len = aliases.length; i < len; i++) {
                            const alias = aliases[i].trim();
                            if (!descriptor.set) {
                                (function () {
                                    const name3 = alias;
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
                                const name = key;
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

            const existsOnSuper = !!_super[name];
            const isFunc = typeof prop[name] === "function";
            const superIsFunc = typeof _super[name] === "function";
            const passFnTest = fnTest.test(prop[name]);

            if (existsOnSuper) {
                if (isFunc && !superIsFunc) {
                    throw "Can't override super class property with function: '" + name + "'";
                }
                if (!isFunc && superIsFunc) {
                    throw "Can't override super class function with property: '" + name + "'";
                }
            }

            if (isFunc) {

                if (existsOnSuper) {

                    // Exists on super, so overriding.
                    // Allow possibility for sub-class function to call super function from within itself.

                    prototype[name] = (function (name, fn) {
                        return function () {
                            const tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            const ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name])

                } else {

                    // Does not exist on super; just define on subclass.

                    prototype[name] = prop[name];
                }
            } else {

                // Not a function; just define on subclass.

                prototype[name] = prop[name];
            }
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
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const uuid = new Array(36);
        let rnd = 0, r;
        return function () {
            for (let i = 0; i < 36; i++) {
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

