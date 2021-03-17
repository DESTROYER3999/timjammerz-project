const canvasElement = document.getElementById("game-canvas");
const canvasCtx = canvasElement.getContext("2d");


const width = canvasCtx.canvas.width;
const height = canvasCtx.canvas.height;


class Character{
    static characters = [];
    static aliveCharacters = [];
    static charactersToRemove = [];
    static bestScore = 0;

    constructor(){
        this.size = 50
        this.x = 50;
        this.y = height * 0.5;
        this.ground = 200;
        this.score = 0;
        this.velocity = 0;
        this.gravity = 0.75; 
        this.image;
        let timHeadImg = new Image();
        timHeadImg.src = "tim_head.png";
        timHeadImg.onload = () => {
            this.image = timHeadImg;
        }
    }
    
    jump(){
      this.velocity = -10;
    }  
    move(){
      this.y += this.velocity;
      this.velocity += this.gravity;
      this.y = constrain(this.y,0,this.ground); 
    }
    
    crouch(){
      
    }
    
    update(){
      this.score += 1;
    }
    
    draw(){
      // fill(0); 
      // translate(width / 2, height / 2);
      // rotate(PI / 3.0);
      image(Tim,this.x,this.y,this.size,this.size);
    }

}

class Obstacle {
    constructor(){
      this.x = width-20;
      this.y = character.ground;
      this.velocity = 0;
      this.color = '#000000';
    }
    
    move(){
      this.velocity = 5;
      this.x -= this.velocity;
    }

    draw() {
        canvasCtx.fillStyle = this.color;
        canvasCtx.fillRect(this.x,this.y,50,50);
    }

    collision(character){
    }
}


