const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let addSpeedX = 0;
let gameOver = false;
ctx.font = '50px Impact';


let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven{
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 2.5 + addSpeedX; 
        this.directionY = Math.random()*5 - 2.5;
        this.makedForDeletion = false;
        this.image = new Image();
        this.image.src = './image/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColor[0] + ',' + this.randomColor[1] + ',' + this.randomColor[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }
    update(deltatime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY= this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.makedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if(this.timeSinceFlap > this.flapInterval){
            this.frame > this.maxFrame ? this.frame = 0 : this.frame++;
            this.timeSinceFlap = 0;
        }
        if(this.x < 0 - this.width) gameOver = true;
        if(this.hasTrail) particles.push(new Particles(this.x,this.y,this.width,this.color));
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.frame * this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
    }
};

let explosions = [];
class Explosion {
    constructor(x,y,size){
        this.x = x;
        this.y = y;
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.image = new Image();
        this.size = size;
        this.image.src = './image/boom.png';
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = './sound/Ice attack 2.wav';
        this.timerSinceLastFrame = 0;
        this.frameInterval = 100;
        this.makedForDeletion = false;
    }
    update(deltatime){
        if(this.frame === 0){
            this.sound.play();
        }
        this.timerSinceLastFrame += deltatime;
        if(this.timerSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timerSinceLastFrame = 0;
            if(this.frame > 5){
                this.makedForDeletion = true;
            }
        }
    }
    draw(){
        ctx.drawImage(this.image,this.frame * this.spriteWidth, 0, this.spriteWidth,this.spriteHeight,this.x,this.y - this.size/4,this.size,this.size);
    }
};

let particles = [];
class Particles {
    constructor(x,y,size,color){
        this.size = size;
        this.x = x + this.size/2;
        this.y = y + this.size/3;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.makedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update(deltatime){
        this.x += this.speedX;
        this.radius += 0.5;
        if(this.radius > this.maxRadius - 5) this.makedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50,75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55,80)
};

function drawGameOver(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, you score is ' + score, canvas.width / 2, canvas.height / 2);
};

window.addEventListener('click',function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x,e.y,1,1);
    const pc = detectPixelColor.data;
    ravens.forEach(object =>{
        if(object.randomColor[0] === pc[0] && object.randomColor[1] === pc[1] && object.randomColor[2] === pc[2]){
            object.makedForDeletion = true;
            score++;
            addSpeedX+=0.05;
            explosions.push(new Explosion(object.x,object.y,object.width));
        }
    });
});

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collisionCtx.clearRect(0,0,canvas.width,canvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort((a,b) =>{
            return a.width - b.width;
        });
    };
    drawScore();
    [...particles,...explosions,...ravens].forEach(object => object.update(deltatime));
    [...particles,...explosions,...ravens].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.makedForDeletion);
    explosions = explosions.filter(object => !object.makedForDeletion);
    particles = particles.filter(object => !object.makedForDeletion);
    !gameOver ? requestAnimationFrame(animate) : drawGameOver();  
}

(function main(){
    animate(0);
})();
console.log(ravens)