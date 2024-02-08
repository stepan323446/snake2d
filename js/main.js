let scoreElement = document.getElementById("score");
let gameCanvas = document.getElementById("game");

let startModal = document.querySelector(".modal");
let startBtn = document.getElementById("start-btn");

let gameSnake = new Snake2DGame({
    gameCanvas: gameCanvas,
    onGameScore: (score) => {
        scoreElement.textContent = score;
    },
    onGameOver: () => {
        startModal.removeAttribute("hidden");
    }
});

startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    startModal.setAttribute("hidden", "");
    gameSnake.Start();
});

document.addEventListener("keydown", (e) => {
    key = e.code;
    switch (key) {
        case "KeyW":
            key = Snake.direction.top
            break;
        case "KeyS":
            key = Snake.direction.bottom
            break;
        case "KeyA":
            key = Snake.direction.left
            break;
        case "KeyD":
            key = Snake.direction.right
            break;
    }
    gameSnake.snake.Control(key);
})
