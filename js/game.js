class Engine {

    /**
     * @param {HTMLCanvasElement} gameCanvas 
     * @param {Number} fps 
     */
    constructor(gameCanvas, fps = 10) {
        this.canvas = gameCanvas;
        this.ctx = gameCanvas.getContext("2d");

        this._playing = false
        this._msPrev = window.performance.now(),
            this.fps = fps

        this._UpdateEngine = this._UpdateEngine.bind(this)
        this._FixedUpdateEngine = this._FixedUpdateEngine.bind(this)
    }
    get fps() {
        return this._fps;
    }
    set fps(value) {
        this._msPerFrame = 1000 / value,
            this._fps = value
    }

    /**
     * Start/Repeat Game
     */
    Start() {
        // ....

        this._playing = true;
        this._FixedUpdateEngine();
        this._UpdateEngine();
    }
    /**
     * Stop Game
     */
    Stop() {
        this._playing = false
    }
    _UpdateEngine() {
        if (!this._playing)
            return;

        requestAnimationFrame(this.Update);

        // .....
    }
    _FixedUpdateEngine() {
        if (!this._playing)
            return;

        requestAnimationFrame(this._FixedUpdateEngine)

        // Stable frame rate on all screens
        const msNow = window.performance.now()
        const msPassed = msNow - this._msPrev

        if (msPassed < this._msPerFrame) return

        const excessTime = msPassed % this._msPerFrame;
        this._msPrev = msNow - excessTime;

        // Clear canvas for drawing
        this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

        this.FixedUpdate();
    }

    /**
     * Fixed update frames by fps
     */
    FixedUpdate() { }
    /**
     * Update frames by monitor Hz
     */
    Update() { }
}


class Berry {
    static color = "#A00034"

    constructor(ctx) {
        this.ctx = ctx;

        this.RandomPosition()
    }
    /**
     * Draw berry object on ctx
     */
    Draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = Berry.color;
        this.ctx.arc(this.x + Snake2DGame.config.sizeCeil / 2, this.y + Snake2DGame.config.sizeCeil / 2, Snake2DGame.config.radiusBerry, 0, Math.PI * 2)
        this.ctx.fill();
    }
    /**
     * set random position using ctx and sizeCeil
     */
    RandomPosition() {
        this.x = getRandomInt(0, gameCanvas.offsetWidth / Snake2DGame.config.sizeCeil) * Snake2DGame.config.sizeCeil
        this.y = getRandomInt(0, gameCanvas.offsetHeight / Snake2DGame.config.sizeCeil) * Snake2DGame.config.sizeCeil
    }
}

class Snake {
    static direction = {
        right: "ArrowRight",
        top: "ArrowUp",
        left: "ArrowLeft",
        bottom: "ArrowDown"
    }
    static colors = {
        headColor: "#FA0556",
        tailColor: "#A00034"
    }

    constructor(ctx) {
        this.ctx = ctx;

        this.isDied = false;
        // Coordinates
        this.x = 16;
        this.y = 16;

        // Speed
        this.dx = Snake2DGame.config.sizeCeil;
        this.dy = 0;

        // Tail
        this.maxTails = Snake2DGame.config.maxTails;
        this.tails = [];
    }
    /**
     * Draw snake object on ctx
     */
    Draw() {
        // Remove last tail item which extends beyond the maximum tail
        this.tails.unshift({ x: this.x, y: this.y });

        if (this.tails.length > this.maxTails) {
            this.tails.pop();
        }

        // Create tail and head
        this.tails.forEach((el, i) => {
            // Zero index is head 
            if (i == 0)
                this.ctx.fillStyle = Snake.colors.headColor
            else
                this.ctx.fillStyle = Snake.colors.tailColor

            this.ctx.fillRect(el.x, el.y, Snake2DGame.config.sizeCeil, Snake2DGame.config.sizeCeil)

            // Collision with tail
            if (i != 0) {
                if (this.tails[i].x == this.x &&
                    this.tails[i].y == this.y)
                    this.Die();
            }
        });
    }
    /**
     * Move using x, y
     */
    Move() {
        this.x += this.dx;
        this.y += this.dy;
    }
    /**
     * Change direction, using dx, dy. 
     * @param {string} direct
     */
    Control(direct) {
        // We cannot turn in the opposite direction (if we go up, we cannot turn sharply down)
        switch (direct) {
            case Snake.direction.right:
            case Snake.direction.left:
                if (this.dx != 0)
                    return;
                break;
    
            case Snake.direction.top:
            case Snake.direction.bottom:
                if (this.dy != 0)
                    return;
                break;
    
            default:
                return;
        }
    
        this.dx = 0;
        this.dy = 0;
    
        switch (direct) {
            case Snake.direction.right:
                this.dx = Snake2DGame.config.sizeCeil;
                break;
    
            case Snake.direction.left:
                this.dx = -Snake2DGame.config.sizeCeil;
                break;
    
            case Snake.direction.top:
                this.dy = -Snake2DGame.config.sizeCeil;
                break;
    
            case Snake.direction.bottom:
                this.dy = Snake2DGame.config.sizeCeil;
                break;
        }
    }
    /**
     * Snake died
     */
    Die() {
        this.isDied = true;
    }
}
class Snake2DGame extends Engine {
    static config = {
        sizeCeil: 16,
        radiusBerry: 6,
        maxTails: 3,
        incTail: 1
    }

    constructor({gameCanvas, onGameOver = () => {}, onStart = () => {}, onGameScore = (score) => {}}) {
        super(gameCanvas, 10);
        this.score = 0;
        this.sizeCeil = 16
        
        this.onGameOver = onGameOver
        this.onStart = onStart
        this.onGameScore = onGameScore
    }
    Start() {
        this.snake = new Snake(this.ctx);
        this.berry = new Berry(this.ctx);
        this.score = 0;

        super.Start();
        
        this.onStart();
        this.onGameScore(this.score);
    }
    FixedUpdate() {
        // Snake move
        this.snake.Move();

        // CCollision with border
        if (this.snake.x < 0)
            this.snake.Die()
        else if (this.snake.x >= this.canvas.offsetWidth)
            this.snake.Die()

        if (this.snake.y < 0)
            this.snake.Die()
        else if (this.snake.y >= this.canvas.offsetHeight)
            this.snake.Die()

        // Collision with berry
        if (this.snake.x == this.berry.x && this.snake.y == this.berry.y) {
            this.snake.maxTails += Snake2DGame.config.incTail;
            this.berry.RandomPosition();
            
            this.score++;
            this.onGameScore(this.score);
        }

        // Snake died = Game Over
        if (this.snake.isDied) {
            this.Stop();
        }

        // Draw objects
        this.snake.Draw();
        this.berry.Draw();        
    }
    Stop() {
        super.Stop();
        this.onGameOver();
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * max);
}

