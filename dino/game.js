// Initialize variables
const canvasElement = document.getElementById("game-canvas");
const canvasCtx = canvasElement.getContext("2d");

const width = canvasCtx.canvas.width;
const height = canvasCtx.canvas.height;

const populationSize = 150;
const gravity = 0.1;

let generationNum = 1;
let gameSpeed = 1;
let hardness = 1;

// Classes for game objects
class Dino {
    static dinos = [];
    static aliveDinos = [];
    static dinosToRemove = [];
    static bestScore = 0;


    static remove_dinos() {
        for (let dino of Dino.dinosToRemove) {
            Dino.aliveDinos.splice(Dino.aliveDinos.indexOf(dino), 1);
        }
        Dino.dinosToRemove = [];
    }

    constructor(neuralNetwork) {
        this.neuralNetwork = neuralNetwork;
        this.x = 100;
        this.y = 10;
        this.width = 50;
        this.height = this.width * (316 / 166);

        this.velocity = 0;
        this.jumpPower = -4.6;

        this.score = 0;
        this.fitness = 0;

        this.run1Img;
        this.run2Img;
        this.jumpImg;
        this.duckImg;
        this.currentImage;
        let timRun1Img = new Image();
        let timRun2Img = new Image();
        let timJumpImg = new Image();
        let timDuckImg = new Image();
        timRun1Img.src = "tim_run_1.png";
        timRun2Img.src = "tim_run_2.png";
        timJumpImg.src = "tim_jump.png";
        timDuckImg.src = "tim_duck.png";
        timRun1Img.onload = () => {
            this.run1Img = timRun1Img;
            this.currentImage = timRun1Img;
        }
        timRun2Img.onload = () => {
            this.run2Img = timRun2Img;
        }
        timJumpImg.onload = () => {
            this.jumpImg = timJumpImg;
        }
        timDuckImg.onload = () => {
            this.duckImg = timDuckImg;
        }
        this.animationCounter = 0;

        Dino.dinos.push(this);
        Dino.aliveDinos.push(this);
    }

    die() {
        if (!Dino.dinosToRemove.includes(this)) {
            Dino.dinosToRemove.push(this);
        }
    }

    jump() {
        if (this.y == 0) {
            this.velocity = this.jumpPower;
            // this.animationCounter = -40;
            this.currentImage = this.jumpImg;
        }
    }

    duck() {
        // this.animationCounter = -40;
        this.currentImage = this.duckImg;
        this.height = 70;
        if (this.y != 0) {
            this.velocity += 0.2;
        }
    }

    unduck() {
        this.currentImage = this.run1Img;
        this.height = this.width * (316 / 166);
    }

    update() {
        this.velocity = this.velocity + gravity;
        this.y -= this.velocity;

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        for (let obstacle of Obstacle.obstacles) {
            if (obstacle.collision(this)) {
                this.die();
            }
        }

        if (this.currentImage == this.jumpImg && this.y == 0) {
            this.currentImage = this.run1Img;
        }

        // NN stuff
        canvasCtx.fillStyle = "#4287f5";
        if (Obstacle.obstacles.length > 0) {
            let networkOutput = this.neuralNetwork.activate([
                normalize(this.y, 0, 300, 0, 1), 
                normalize(this.velocity, -5, 5, 0, 1),
                normalize(Obstacle.obstacles[0].x, 0, 700, 0, 1),
                normalize(Obstacle.obstacles[0].y, 0, 300, 0, 1),
            ])
            if (networkOutput[0] > 0.5) {
                this.jump();
            }
            if (networkOutput[1] > 0.5) {
                this.duck();
            }
            if (networkOutput[1] < 0.5) {
                this.unduck();
            }
        }
        

        this.score ++;
    }

    draw() {
        if (this.animationCounter >= 50) {
            this.animationCounter = 0;
            this.currentImage = (this.currentImage == this.run1Img) ? this.run2Img : this.run1Img;
        }
        if (this.currentImage) {
            if (this.currentImage == this.run1Img || this.currentImage == this.run2Img) {
                this.animationCounter += 1;
            }
            // canvasCtx.globalAlpha = 0.6;
            canvasCtx.drawImage(this.currentImage, this.x - (this.width / 2), (height - this.y) - this.height, this.width, this.height);
            canvasCtx.strokeRect(this.x - (this.width / 2), (height - this.y) - this.height, this.width, this.height);
            // canvasCtx.globalAlpha = 1.0;
        }
    }
}

class Obstacle {
    static obstacles = [];
    static counter = 0;
    static spawnCounter = 0;

    constructor() {
        this.color = "#000000";
        this.width = 15;
        this.height = rand_int(30, 50);
        
        this.x = width;

        if (rand_int(1, 5000) == 1) {
            this.y = 75;
        } else {
            this.y = 0;
        }

        this.speed = (0.07 * hardness) + 1.5;
        Obstacle.obstacles.push(this);
        Obstacle.spawnCounter = rand_int(200, 300);
    }

    draw() {
        canvasCtx.fillStyle = this.color;
        canvasCtx.fillRect(this.x - (this.width / 2), (height - this.y) - this.height, this.width, this.height);
    }

    collision(dino) {
        if ((dino.x - (dino.width / 2)) + dino.width > this.x - (this.width / 2) && dino.y + dino.height > this.y && (dino.x - (dino.width / 2)) < (this.x - (this.width / 2)) + this.width && dino.y < this.y + this.height) {
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
function set_fitnesses(dinos) {
    let totalScore = 0;
    for (let dino of dinos) {
        totalScore += dino.score;
    }
    for (let dino of dinos) {
      dino.fitness = dino.score / totalScore;
    }
}

function get_dino(dinos) {
    let bestDino;

    let fitnessSum = 0;
    let randFloat = Math.random();
    for (let dino of dinos) {
        fitnessSum += dino.fitness;
        if (randFloat <= fitnessSum) {
            bestDino = dino;
            break;
        }
    }
    // bestBird = Bird.birds[0];
    let childDino = new Dino(bestDino.neuralNetwork.clone());
    childDino.neuralNetwork.mutate(1, 1);
    return childDino;
}

function make_generation(dinos) {
    set_fitnesses(dinos);

    childDinos = [];
    for (let i = 0; i < populationSize; i ++) {
        childDinos.push(get_dino(dinos));
    }
    return childDinos;
}


// Set up
let pressedKeys = [];
let releasedKeys = [];
document.addEventListener("keydown", (e) => {
    pressedKeys[e.key] = true;
});
document.addEventListener("mousedown", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = true;
})
document.addEventListener("keyup", (e) => {
    pressedKeys[e.key] = false;
    releasedKeys[e.key] = true;
})
document.addEventListener("mouseup", (e) => {
    pressedKeys["MOUSEBUTTON" + e.button] = false;
    releasedKeys["MOUSEBUTTON" + e.button] = true;
})

document.getElementById("speed-slider").oninput = (e) => {
    gameSpeed = e.currentTarget.value;
    document.getElementById("speed-label").innerText = gameSpeed + "x";
}



for (let i = 0; i < populationSize; i ++) {
    let inputLayer = new synaptic.Layer(4);
    let hiddenLayer = new synaptic.Layer(3);
    let outputLayer = new synaptic.Layer(2);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    let neuralNetwork = new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
    neuralNetwork.mutate(1, 1);
    new Dino(neuralNetwork);
}

// Game loop
function update() {
    // Clear canvas
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.fillRect(0, 0, width, height);

    // Handle key/mouse presses
    if (pressedKeys["w"] || pressedKeys["MOUSEBUTTON0"]) {
        Dino.aliveDinos[0].jump();
    }
    if (pressedKeys["s"] || pressedKeys["MOUSEBUTTON1"]) {
        Dino.aliveDinos[0].duck();
    }
    if (releasedKeys["s"]) {
        Dino.aliveDinos[0].unduck();
        releasedKeys["s"] = false;
    }
    if (releasedKeys["MOUSEBUTTON1"]) {
        Dino.aliveDinos[0].unduck();
        releasedKeys["MOUSEBUTTON1"] = false;
    }

    for (let dino of Dino.aliveDinos) {
        dino.draw();
    }
    for (let obstacle of Obstacle.obstacles) {
        obstacle.draw();
    }

    for (let i = 0; i < gameSpeed; i ++) {
        if (Obstacle.counter == Obstacle.spawnCounter) {
            new Obstacle();
            Obstacle.counter = 0;
            hardness ++;
        }
        Obstacle.counter += 1;

        Dino.dinosToRemove = [];

        for (let dino of Dino.aliveDinos) {
            dino.update();
        }

        Dino.remove_dinos();

        let removeObstacle = false;
        for (let obstacle of Obstacle.obstacles) {
            obstacle.update();
    
            if (obstacle.x < -15) {
                removeObstacle = true;
            }
    
        }
        if (removeObstacle) {
            Obstacle.obstacles.splice(0, 1);
        }

        if (Dino.aliveDinos.length == 0) {
            generationNum ++;
            document.getElementById("generation-num-label").innerText = generationNum;

            console.log("Generation", generationNum);

            Dino.dinos = make_generation(Dino.dinos);
            Obstacle.obstacles = [];
            Obstacle.counter = 0;
            Obstacle.spawnCounter = 0;
            hardness = 1;

        }

        let currentBestScore = Math.max.apply(Math, Dino.dinos.map((dino) => {return dino.score}));
        if (currentBestScore > Dino.bestScore) {
            Dino.bestScore = currentBestScore;
            document.getElementById("best-score-label").innerText = currentBestScore;

        }


        document.getElementById("current-score-label").innerText = Math.max.apply(Math, Dino.dinos.map((dino) => {return dino.score}));

    

    }



    frameID = requestAnimationFrame(update);
}

let frameID = requestAnimationFrame(update);

window.addEventListener('unload', () => {
    window.cancelAnimationFrame(frameID);
});

