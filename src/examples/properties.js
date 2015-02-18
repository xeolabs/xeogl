
//---------------------------------------------------------------------------------------------
// - Properties are raw values that you can read or write directly.
//
// - Listener for changes on a property by registering a listener on the owner object, to
//   listen for an event matching the property name, that will be fired by the owner object
//---------------------------------------------------------------------------------------------

// Create a scene
var scene = new XEO.Scene();

// Create a 'lookat' viewing transform
var lookat = new XEO.Lookat(scene, {
    eye: [0, 0, -10],
    look: [0, 0, 0],
    up: [0, 1, 0]
});

// Subscribe to changes on the lookat's eye
lookat.on("eye", function (value) {
    console.log("eye updated: " + value[0] + ", " + value[1] + ", " + value[2]);
});

// Set the lookat's eye, which fires our change listener
lookat.eye = [-5, 0, -10];

// Get the lookat's eye
var value = lookat.eye;

