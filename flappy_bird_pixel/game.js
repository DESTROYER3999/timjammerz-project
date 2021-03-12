const canvasElement = document.getElementById("game-canvas");
const canvasCtx = canvasElement.getContext("2d");


const width = 500;
const height = 500;

canvasElement.width = width;
canvasElement.height = height;

const gravity = 0.2;
const populationSize = 100;

let generationNum = 1;
let gameSpeed = 1;

class Bird {
    static birds = [];
    static aliveBirds = [];
    static birdsToRemove = [];
    static bestScore = 0;

    static remove_birds() {
        for (let bird of Bird.birdsToRemove) {
            Bird.aliveBirds.splice(Bird.aliveBirds.indexOf(bird), 1);
        }
        Bird.birdsToRemove = [];
    }


    constructor(neuralNetwork) {
        this.neuralNetwork = neuralNetwork;
        this.x = width / 2;
        this.y = height / 2;
        this.width = 45;
        this.height = 31;

        this.velocity = 0;
        this.terminalVelocity = -10;
        this.jumpPower = 5;
        this.score = 0;
        this.fitness = 0;

        this.image;
        let timHeadImg = new Image();
        timHeadImg.src = "tim_head.png";
        timHeadImg.onload = () => {
            this.image = timHeadImg;
        }
        Bird.birds.push(this);
        Bird.aliveBirds.push(this);
    }

    jump() {
        this.velocity = this.jumpPower;
    }

    draw() {
        if (this.image) {
            canvasCtx.globalAlpha = 0.6;
            canvasCtx.drawImage(this.image, this.x - (this.width / 2), this.y - (this.height / 2));
            canvasCtx.globalAlpha = 1.0;
        }
    }

    die() {
        if (!Bird.birdsToRemove.includes(this)) {
            Bird.birdsToRemove.push(this);
        }
    }

    update() {
        this.velocity = Math.max(this.velocity - gravity, this.terminalVelocity);
        this.y -= this.velocity;

        if (this.y >= height - (this.height / 2)) {
            this.die();
            // this.y = height - (this.height / 2);
            // this.velocity = - this.velocity * 0.9;

        }
        if (this.y <= (this.height / 2)) {
            this.die();
            // this.y = (this.height / 2);
            // this.velocity = - this.velocity * 0.9;

        }

        for (let pipe of Pipe.pipes) {
            if (pipe.collision(this)) {
                this.die();
            }
        }

        // NN stuff
        let networkOutput = this.neuralNetwork.activate([
            normalize(this.y, 0, 500, 0, 1), 
            normalize(this.velocity, -10, 10, 0, 1), 
            normalize(Pipe.pipes[Pipe.pipes.length - 1].topHeight, 0, 500, 0, 1)
        ])
        if (networkOutput[0] > 0.5) {
            this.jump();
        }
        this.score ++;
    }
}

class Pipe {
    static pipes = [];
    static spacing = 150;
    static counter = 0;

    constructor() {
        this.color = "#000000";

        this.width = 65;
        this.x = width;

        this.speed = 2.5;

        this.topHeight = rand_int(0, height - Pipe.spacing);
        this.bottomHeight = height - (this.topHeight + Pipe.spacing);
        Pipe.pipes.push(this);
    }

    draw() {
        canvasCtx.fillStyle = this.color;
        canvasCtx.fillRect(this.x, 0, this.width, this.topHeight);
        canvasCtx.fillRect(this.x, this.topHeight + Pipe.spacing, this.width, this.bottomHeight);
    }

    collision(bird) {
        // Top collision
        if (bird.x + (bird.width / 2) > this.x && bird.y - (bird.height / 2) < this.topHeight && bird.x - (bird.width / 2) < this.x + this.width) {
            return true;
        }
        // Bottom collision
        if (bird.x + (bird.width / 2) > this.x && bird.y + (bird.height / 2) > this.topHeight + Pipe.spacing && bird.x - (bird.width / 2) < this.x + this.width) {
            return true;
        }

    }

    update() {
        this.x -= this.speed;

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
    let totalScore = 0;
    for (let bird of birds) {
        totalScore += bird.score;
    }
    for (let bird of birds) {
      bird.fitness = bird.score / totalScore;
    }
}

function get_bird(birds) {
    let bestBird;

    let fitnessSum = 0;
    let randFloat = Math.random();
    for (let bird of Bird.birds) {
        fitnessSum += bird.fitness;
        if (randFloat <= fitnessSum) {
            bestBird = bird;
            break;
        }
    }
    // bestBird = Bird.birds[0];
    let childBird = new Bird(bestBird.neuralNetwork.clone());
    childBird.neuralNetwork.mutate(1, 1);
    return childBird;
}

function make_generation(birds) {
    set_fitnesses(birds);

    // document.getElementById("fitness-label").innerText = Math.max.apply(Math, birds.map((bird) => {return bird.fitness}));

    childBirds = [];
    for (let i = 0; i < populationSize; i ++) {
        childBirds.push(get_bird(birds));
    }
    return childBirds;
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
canvasElement.addEventListener("keydown", (e) => {
    pressedKeys[e.key] = true;
});
canvasElement.addEventListener("mousedown", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = true;
})
canvasElement.addEventListener("keyup", (e) => {
    pressedKeys[e.key] = false;
})
canvasElement.addEventListener("mouseup", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = false;
})

document.getElementById("speed-slider").oninput = (e) => {
    gameSpeed = e.currentTarget.value;
    document.getElementById("speed-label").innerText = gameSpeed + "x";
}


// Game loop
function update(ms) {
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.fillRect(0, 0, width, height);
    for (let bird of Bird.aliveBirds) {
        bird.draw();
    }
    for (let pipe of Pipe.pipes) {
        pipe.draw();
    }
    for (let i = 0; i < gameSpeed; i++) {
        var myImageData = canvasCtx.createImageData(100, 100); // (40000 (100x100))
        if (Pipe.counter % 140 == 0) {
            new Pipe();
        }
        Pipe.counter += 1;
    
    
        if (pressedKeys[" "] || pressedKeys["MOUSEBUTTON0"]) {
            Bird.aliveBirds[0].jump();
        }

        Bird.birdsToRemove = [];
    
        for (let bird of Bird.aliveBirds) {
            bird.update();
        }
    
        Bird.remove_birds();
    
        let removePipe = false;
        for (let pipe of Pipe.pipes) {
            pipe.update();
    
            if (pipe.x <= -Pipe.spacing) {
                removePipe = true;
            }
    
        }
    
        if (removePipe) {
            Pipe.pipes.splice(0, 1);
        }
    
    
        if (Bird.aliveBirds.length == 0) {
            generationNum ++;
            document.getElementById("generation-num-label").innerText = generationNum;

            Bird.birds = make_generation(Bird.birds);
            Pipe.pipes = [];
            Pipe.counter = 0;
        }

    }

    let currentBestScore = Math.max.apply(Math, Bird.birds.map((bird) => {return bird.score}));
    if (currentBestScore > Bird.bestScore) {
        Bird.bestScore = currentBestScore;
        document.getElementById("best-score-label").innerText = currentBestScore;

    }

    document.getElementById("current-score-label").innerText = Math.max.apply(Math, Bird.birds.map((bird) => {return bird.score}));

    frameID = requestAnimationFrame(update)
    
}

let frameID = requestAnimationFrame(update);

window.addEventListener('unload', () => {
    window.cancelAnimationFrame(frameID);
});