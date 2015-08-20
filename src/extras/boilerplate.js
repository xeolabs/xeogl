/**

 A **MyComponent** is a custom component you created for xeoEngine.

 Use this code and these comments as a boilerplate for your Component subclasses.

 <ul>
 <li>Say something here about your component</li>
 <li>Say another thing about your component, maybe mention how it interacts with other component types</li>
 </ul>

 For each xeoEngine component, I use Gliffy (https://www.gliffy.com/) to embed an instance diagram that shows
 where the component fits within xeoEngine. For example:

 <img src="http://www.gliffy.com/go/publish/image/7430557/L.png">

 ###

 Next up is an example of how to use this component:

 ```` javascript
 var myComponent = new MyComponent(scene, {
    foo: 42,
    bar: "baz"
 });

 myComponent.on("foo", function(value) {
    //..
 });

 myComponent.foo = 34;

 //...
 ````
 @class MyComponent
 @module XEO
 @extends Component
 */
var MyComponent = XEO.Component.extend({

    // The JavaScript class we'll instantiate whenever we load this component from JSON

    type: "MyComponent",

    // Constructor

    _init: function (cfg) {

        // Call the super class constructor first
        this._super(cfg);

        // Then construct your subclass, which mainly consists
        // of setting initial values for its properties
        this.foo = cfg.foo;
        this.bar = cfg.bar;

    },

    // The properties of your subclass

    _props: {

        /**
         * The "foo" property of this MyComponent.
         *
         * Fires a {{#crossLink "MyComponent/foo:event"}}{{/crossLink}} event on change.
         *
         * @property foo
         * @default 0
         * @type Number
         */
        foo: {

            set: function(value) {
                this._foo = value != undefined ? value : 0;

                /**
                 * Fired whenever this MyComponent's {{#crossLink "MyComponent/foo:property"}}{{/crossLink}} property changes.
                 * @event foo
                 * @param value The property's new value
                 */
                this.fire("foo", this._foo);
            },
            
            get: function() {
                return this._foo;
            }
        },

        /**
         * The "bar" property of this MyComponent.
         *
         * Fires a {{#crossLink "MyComponent/bar:event"}}{{/crossLink}} event on change.
         *
         * @property bar
         * @default 0
         * @type Number
         */
        bar: {

            set: function(value) {
                this._bar = value != undefined ? value : 0;

                /**
                 * Fired whenever this MyComponent's {{#crossLink "MyComponent/bar:property"}}{{/crossLink}} property changes.
                 * @event bar
                 * @param value The property's new value
                 */
                this.fire("bar", this._bar);
            },

            get: function() {
                return this._bar;
            }
        }
    },

    /**
     * A method of this MyComponent.
     *
     * @method doSomething
     * @param {} params
     */
    doSomething: function(params) {
    },

    /**
     * Returns a JSON object containing the component's property values
     */
    _getJSON: function () {
        return {
            foo: this.foo,
            bar: this.bar
        };
    },

    _destroy: function () {

        // Do your component destruction here
        //..

        // Then call the super class destructor
        this._super();
    }
});