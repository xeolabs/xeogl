var utils = {

    /**
     Tests if the given object is an array
     @private
     */
    isArray: function (testMesh) {
        return testMesh && !(testMesh.propertyIsEnumerable('length')) && typeof testMesh === 'object' && typeof testMesh.length === 'number';
    },

    /**
     Tests if the given value is a string
     @param value
     @returns {boolean}
     @private
     */
    isString: function (value) {
        return (typeof value === 'string' || value instanceof String);
    },

    /**
     Tests if the given value is a number
     @param value
     @returns {boolean}
     @private
     */
    isNumeric: function (value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     Tests if the given value is an ID
     @param value
     @returns {boolean}
     @private
     */
    isID: function (value) {
        return utils.isString(value) || utils.isNumeric(value);
    },

    /**
     Tests if the given components are the same, where the components can be either IDs or instances.
     @param c1
     @param c2
     @returns {boolean}
     @private
     */
    isSameComponent: function (c1, c2) {
        if (!c1 || !c2) {
            return false;
        }
        const id1 = (utils.isNumeric(c1) || utils.isString(c1)) ? `${c1}` : c1.id;
        const id2 = (utils.isNumeric(c2) || utils.isString(c2)) ? `${c2}` : c2.id;
        return id1 === id2;
    },

    /**
     Tests if the given value is a function
     @param value
     @returns {boolean}
     @private
     */
    isFunction: function (value) {
        return (typeof value === "function");
    },

    /**
     Tests if the given value is a JavaScript JSON object, eg, ````{ foo: "bar" }````.
     @param value
     @returns {boolean}
     @private
     */
    isObject: function (value) {
        const objectConstructor = {}.constructor;
        return (!!value && value.constructor === objectConstructor);
    },

    /** Returns a shallow copy
     */
    copy: function (o) {
        return utils.apply(o, {});
    },

    /** Add properties of o to o2, overwriting them on o2 if already there
     */
    apply: function (o, o2) {
        for (const name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name];
            }
        }
        return o2;
    },

    /**
     Add non-null/defined properties of o to o2
     @private
     */
    apply2: function (o, o2) {
        for (const name in o) {
            if (o.hasOwnProperty(name)) {
                if (o[name] !== undefined && o[name] !== null) {
                    o2[name] = o[name];
                }
            }
        }
        return o2;
    },

    /**
     Add properties of o to o2 where undefined or null on o2
     @private
     */
    applyIf: function (o, o2) {
        for (const name in o) {
            if (o.hasOwnProperty(name)) {
                if (o2[name] === undefined || o2[name] === null) {
                    o2[name] = o[name];
                }
            }
        }
        return o2;
    },

    /**
     Returns true if the given map is empty.
     @param obj
     @returns {boolean}
     @private
     */
    isEmptyObject: function (obj) {
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    },

    /**
     Returns the given ID as a string, in quotes if the ID was a string to begin with.

     This is useful for logging IDs.

     @param {Number| String} id The ID
     @returns {String}
     @private
     */
    inQuotes: function (id) {
        return utils.isNumeric(id) ? (`${id}`) : (`'${id}'`);
    },

    /**
     Returns the concatenation of two typed arrays.
     @param a
     @param b
     @returns {*|a}
     @private
     */
    concat: function (a, b) {
        const c = new a.constructor(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
    },
};

export {utils};

