let scoreElement = document.getElementById("score");
let gameCanvas = document.getElementById("game");
let ctx = gameCanvas.getContext("2d");

let startModal = document.querySelector(".modal");
let startBtn = document.getElementById("start-btn");

let score = 0;

const config = {
    msPrev: window.performance.now(),
    msPerFrame: 1000 / 10,

    sizeCeil: 16,
    playing: false,
    radiusBerry: 6
}
const defaultSnake = {
    x: 16,
    y: 16,
    dx: config.sizeCeil,
    dy: 0,
    tails: [],
    maxTails: 20
}
let snake = { }
let berry = {
    x: 0,
    y: 0
}

function Start() {
    score = 0;
    Object.assign(snake, defaultSnake);
    snake.tails = [];
    drawScore();

    config.playing = true;
    
    randomPositionBerry();
    FixedUpdate();
    Update();

    startModal.setAttribute("hidden", "");
}
function FixedUpdate() {
    if(!config.playing)
        return;

    requestAnimationFrame(FixedUpdate)

    // Stable frame rate on all screens
    const msNow = window.performance.now()
    const msPassed = msNow - config.msPrev

    if (msPassed < config.msPerFrame) return

    const excessTime = msPassed % config.msPerFrame;
    config.msPrev = msNow - excessTime;

    ctx.clearRect(0, 0, gameCanvas.offsetWidth, gameCanvas.offsetHeight)
    
    // Game Logic
    drawBerry();
    drawSnake();
}
function Update() {
    requestAnimationFrame(Update);
}

function Stop() {
    config.playing = false;
    
    startBtn.textContent = "Replay";
    startModal.removeAttribute("hidden");
}

function drawSnake() {
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Collision with border
    if(snake.x < 0)
        Stop()
    else if(snake.x >= gameCanvas.offsetWidth)
        Stop()

    if(snake.y < 0)
        Stop()
    else if(snake.y >= gameCanvas.offsetHeight)
        Stop()

    // Remove last tail item which extends beyond the maximum tail
    snake.tails.unshift({ x: snake.x, y: snake.y });

    if (snake.tails.length > snake.maxTails) {
        snake.tails.pop();
    }

    // Create tail and head
    snake.tails.forEach((el, i) => {
        if(i == 0) 
            ctx.fillStyle = "#FA0556"
        else 
            ctx.fillStyle = "#A00034" 

        ctx.fillRect(el.x, el.y, config.sizeCeil, config.sizeCeil)

        // Collision with tail
        if(i != 0) {
            if(snake.tails[i].x == snake.x &&
                snake.tails[i].y == snake.y)
                Stop()
        }
    });
    // Collision with food
    if(snake.x == berry.x && snake.y == berry.y) {
        incScore();
        snake.maxTails++;
        randomPositionBerry();
    }

    
}
const direction = {
    right: "ArrowRight",
    top: "ArrowUp",
    left: "ArrowLeft",
    bottom: "ArrowDown"
}
function control(direct) {
    // We cannot turn in the opposite direction (if we go up, we cannot turn sharply down)
    switch (direct) {
        case direction.right:
        case direction.left:
            if(snake.dx != 0)
                return;
            break;

        case direction.top:
        case direction.bottom:
            if(snake.dy != 0)
                return;
            break;

        default:
            return;
    }
    
    snake.dx = 0;
    snake.dy = 0;

    switch (direct) {
        case direction.right:
            snake.dx = config.sizeCeil;
            break;

        case direction.left:
            snake.dx = -config.sizeCeil;
            break;

        case direction.top:
            snake.dy = -config.sizeCeil;
            break;

        case direction.bottom:
            snake.dy = config.sizeCeil;
            break;
    }
}

function drawBerry() {
    ctx.beginPath();
    ctx.fillStyle = "#A00034";
    ctx.arc(berry.x + config.sizeCeil / 2, berry.y + config.sizeCeil / 2, config.radiusBerry, 0, Math.PI*2)
    ctx.fill();
}
function randomPositionBerry() {
    berry.x = getRandomInt(0, gameCanvas.offsetWidth / config.sizeCeil) * config.sizeCeil
    berry.y = getRandomInt(0, gameCanvas.offsetHeight / config.sizeCeil) * config.sizeCeil
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * max);
}
  
function incScore() {
    score++;
    drawScore();
}
function drawScore() {
    scoreElement.innerText = score;
}

document.addEventListener("keydown", (e) => {
    key = e.code;
    switch (key) {
        case "KeyW":
            key = direction.top
            break;
        case "KeyS":
            key = direction.bottom
            break;
        case "KeyA":
            key = direction.left
            break;
        case "KeyD":
            key = direction.right
            break;
    }
    control(key);
})
startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    Start();
});