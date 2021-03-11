// Initialize variables
const canvasElement = document.getElementById("game-canvas");
const canvasCtx = canvasElement.getContext("2d");

const width = canvasCtx.canvas.width;
const height = canvasCtx.canvas.height;

const gravity = 0.2;
const populationSize = 5;

// Classes for game objects
class Bird {
    constructor() {

    }
}
class Pipe {
    constructor() {
        
    }
}

// Utility functions
function rand_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalize(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Genetic algorithm functions
function set_fitnesses(birds) {

}
function make_generation(birds) {

}

// Set up
for (let i = 0; i < populationSize; i ++) {
    let inputLayer = new synaptic.Layer(3);
    let hiddenLayer = new synaptic.Layer(4);
    let outputLayer = new synaptic.Layer(1);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    let neuralNetwork = new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
    neuralNetwork.mutate(1, 1);
    new Bird(neuralNetwork);
}

let pressedKeys = [];
document.addEventListener("keydown", (e) => {
    pressedKeys[e.key] = true;
});
document.addEventListener("mousedown", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = true;
})
document.addEventListener("keyup", (e) => {
    pressedKeys[e.key] = false;
})
document.addEventListener("mouseup", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = false;
})

// Game loop
function update() {
    // Clear canvas
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.fillRect(0, 0, width, height);


    // Handle key/mouse presses
    if (pressedKeys[" "] || pressedKeys["MOUSEBUTTON0"]) {
        Bird.birds[0].jump();
    }

    // Update game objects
    for (let bird of Bird.aliveBirds) {
        bird.update();
        bird.draw();
    }
    for (let pipe of Pipe.pipes) {
        pipe.update();
        pipe.draw();
    }

}

// Game speed
setInterval(update, 100);


