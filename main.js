// GAME VARIABLES
const game = document.getElementById("game");
const playButton = document.getElementById("play");
const currentEnemies = new Map();
const table = document.getElementById("score-table");

let leaderboard = [
    {name: "Shurmeth", score: 9},
    {name: "Isagubat", score: 7},
    {name: "Tidappest", score: 6},
    {name: "Javinda", score: 5}
];
let currentPlayer = "";
let hero = document.getElementById("hero");
let replayButton;
let collisionDetector;
let generateEnemyInterval;
let currentScore = 0;
let scoreElement = document.getElementById("score");

// CONFETTI VARIABLES
const confetti = document.getElementById('confetti');
const confettiCtx = confetti.getContext('2d');
let container, confettiElements = [], clickPosition;
let confettiIntervalID;

rand = (min, max) => Math.random() * (max - min) + min;

const confettiParams = {
    // number of confetti per "explosion"
    number: 70,
    // min and max size for each rectangle
    size: { x: [5, 20], y: [10, 18] },
    // power of explosion
    initSpeed: 25,
    // defines how fast particles go down after blast-off
    gravity: 0.65,
    // how wide is explosion
    drag: 0.08,
    // how slow particles are falling
    terminalVelocity: 6,
    // how fast particles are rotating around themselves
    flipSpeed: 0.017,
};

const colors = [
    { front : '#ffadad', back: '#ff8d8d' },
    { front : '#ffd6a5', back: '#ffb257' },
    { front : '#fdff86', back: '#e8ea5b' },
    { front : '#caffbf', back: '#88ff70' },
    { front : '#9bf6ff', back: '#5fe4f2' },
    { front : '#a0c4ff', back: '#4b8cf7' },
    { front : '#bdb2ff', back: '#7862fb' },
    { front : '#ffc6ff', back: '#fb5efb' },
];

// GAME FUNCTIONS

function createReplayElement () {
    const wrapper = document.createElement('div');
    wrapper.classList.add("replay");
    wrapper.id = "replay";

    const icon = document.createElement("i");
    icon.classList.add("fa");
    icon.classList.add("fa-repeat");

    wrapper.appendChild(icon);
    game.appendChild(wrapper);
    replayButton = document.getElementById("replay");

    replayButton.onclick = function() {
        start()
    }
}

function elementsOverlap(el1, el2) {
    const domRect1 = el1.getBoundingClientRect();
    const domRect2 = el2.getBoundingClientRect();
  
    return !(
      domRect1.top > domRect2.bottom ||
      domRect1.right < domRect2.left ||
      domRect1.bottom < domRect2.top ||
      domRect1.left > domRect2.right
    );
}

function isHeroDied() {
    for (let [key, value] of currentEnemies) {
        if (elementsOverlap(value.element, hero)) {
            return true
        }
    }
    return false;
}

function elementsOverlapYAxis(el1) {
    const domRect = el1.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect(); 
    
    return domRect.x <= (heroRect.x) && domRect.x >= (heroRect.x - 25);
}

let lastBeatenCreature = -1;
function isHeroScored() {
    for (let [key, value] of currentEnemies) {
        if (elementsOverlapYAxis(value.element) && lastBeatenCreature !== key) {
            lastBeatenCreature = key;
            return true
        }
    }
    return false;
}

function stopEnemies() {
    for (let [key, value] of currentEnemies) {
        const enemy = value.element;   
        enemy.classList.add("stop");
        clearInterval(value.timeoutID);
    }
}

function generateLeaderBoard() {
    leaderboard = leaderboard.sort((a, b) => b.score - a.score);

    leaderboard.forEach((person, ind) => {
        const row = table.insertRow();

        const countCell = row.insertCell();
        countCell.innerHTML = ind + 1 + ".";

        const nameCell = row.insertCell();
        nameCell.innerHTML = person.name;

        const scoreCell = row.insertCell();
        scoreCell.innerHTML = person.score;
    });
}

function updateScoreboard() {
    let rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    const playerInd = leaderboard.findIndex(e => e.name === currentPlayer);
    if (playerInd !== -1) {
        if (leaderboard[playerInd].score < currentScore)
            leaderboard[playerInd].score = currentScore;
    } else {
        leaderboard.push({name: currentPlayer, score: currentScore});
    } 
    generateLeaderBoard();
}

function startCollisionDetection () {
    collisionDetector = setInterval(() => {
        if (isHeroDied()) {
            stop();
            stopEnemies();
            const sortedBoard = leaderboard.sort((a, b) => b.score - a.score);
            if (sortedBoard[0].score < currentScore) {
                confettiTime();
                document.getElementById("bestscore").classList.remove("hide");
            }

            updateScoreboard();

        } else if (isHeroScored()){
            currentScore += 1;
            scoreElement.innerHTML = "Score: " + currentScore;
        }
    }, 10);
}

function stop () {
    hero.classList.add("stop");
    clearInterval(collisionDetector);
    clearInterval(generateEnemyInterval);
    createReplayElement();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function createEnemy(enemyType, enemyID) {
    const enemy = document.createElement("div");
    enemy.classList.add(enemyType);
    enemy.id = enemyID; 
    enemy.setAttribute("data-char", "enemy");
    game.appendChild(enemy);

    let enemyDeletorTimeoutID = setTimeout((enemyID) => {
        clearTimeout(currentEnemies.get(enemyID).timeoutID);
        currentEnemies.get(enemyID).element.remove();
        currentEnemies.delete(enemyID);
    }, 7000, enemyID);
    currentEnemies.set(enemyID, {timeoutID: enemyDeletorTimeoutID, element: enemy});
}

function generateEnemy() {
    const enemyType = getRandomInt(1, 10);
    const keys = [...currentEnemies.keys()];
    const id = keys.length === 0 ? 1: keys[keys.length - 1] + 1;
    
    if (enemyType <= 6) // crawler
        createEnemy("worm-like-enemy", "worm-" + id);
    else  // flyer
        createEnemy("bird-like-enemy", "bird-" + id);
}

function deleteExistingEnemies() {
    for (let [key, value] of currentEnemies) {
        value.element.remove();
    }
    currentEnemies.clear();
}

function start() {
    if (!playButton.classList.contains("hide")) {
        setupCanvas();
        updateConfetti();
    }

    hero.classList.remove("stop");
    deleteExistingEnemies();
    currentScore = 0;
    scoreElement.innerHTML = "Score: " + currentScore;
    lastBeatenCreature = -1;

    generateEnemy();
    generateEnemyInterval = setInterval(() => {
        generateEnemy();
    }, 1100);

    replayButton && replayButton.remove();
    playButton.classList.add("hide");

    document.getElementById("bestscore").classList.add("hide");
    startCollisionDetection();

    stopConfetti();
}

// CONFETTI FUNCTIONS

function Conf() {
    this.randomModifier = rand(-1, 1);
    this.colorPair = colors[Math.floor(rand(0, colors.length))];
    this.dimensions = {
        x: rand(confettiParams.size.x[0], confettiParams.size.x[1]),
        y: rand(confettiParams.size.y[0], confettiParams.size.y[1]),
    };
    this.position = {
        x: clickPosition[0],
        y: clickPosition[1]
    };
    this.rotation = rand(0, 2 * Math.PI);
    this.scale = { x: 1, y: 1 };
    this.velocity = {
        x: rand(-confettiParams.initSpeed, confettiParams.initSpeed) * 0.4,
        y: rand(-confettiParams.initSpeed, confettiParams.initSpeed)
    };
    this.flipSpeed = rand(0.2, 1.5) * confettiParams.flipSpeed;

    if (this.position.y <= container.h) {
        this.velocity.y = -Math.abs(this.velocity.y);
    }

    this.terminalVelocity = rand(1, 1.5) * confettiParams.terminalVelocity;

    this.update = function () {
        this.velocity.x *= 0.98;
        this.position.x += this.velocity.x;

        this.velocity.y += (this.randomModifier * confettiParams.drag);
        this.velocity.y += confettiParams.gravity;
        this.velocity.y = Math.min(this.velocity.y, this.terminalVelocity);
        this.position.y += this.velocity.y;

        this.scale.y = Math.cos((this.position.y + this.randomModifier) * this.flipSpeed);
        this.color = this.scale.y > 0 ? this.colorPair.front : this.colorPair.back;
    }
}

function updateConfetti () {
    confettiCtx.clearRect(0, 0, container.w, container.h);

    confettiElements.forEach((c) => {
        c.update();
        confettiCtx.translate(c.position.x, c.position.y);
        confettiCtx.rotate(c.rotation);
        const width = (c.dimensions.x * c.scale.x);
        const height = (c.dimensions.y * c.scale.y);
        confettiCtx.fillStyle = c.color;
        confettiCtx.fillRect(-0.5 * width, -0.5 * height, width, height);
        confettiCtx.setTransform(1, 0, 0, 1, 0, 0)
    });

    confettiElements.forEach((c, idx) => {
        if (c.position.y > container.h ||
            c.position.x < -0.5 * container.x ||
            c.position.x > 1.5 * container.x) {
            confettiElements.splice(idx, 1)
        }
    });
    window.requestAnimationFrame(updateConfetti);
}

function setupCanvas() {
    container = {
        w: confetti.clientWidth,
        h: confetti.clientHeight
    };
    confetti.width = container.w;
    confetti.height = container.h;
}

function addConfetti(e) {
    const canvasBox = confetti.getBoundingClientRect();
    if (e) {
        clickPosition = [
            e.clientX - canvasBox.left,
            e.clientY - canvasBox.top
        ];
    } else {
        clickPosition = [
            canvasBox.width * Math.random(),
            canvasBox.height * Math.random()
        ];
    }
    for (let i = 0; i < confettiParams.number; i++) {
        confettiElements.push(new Conf())
    }
}

function hideConfetti() {
    confettiElements = [];
    window.cancelAnimationFrame(updateConfetti)
}

function resizeConfettiCanvas() {
    setupCanvas();
    hideConfetti();
}


function confettiTime() {
    window.addEventListener('click', addConfetti);
    window.addEventListener('resize', resizeConfettiCanvas);

    addConfetti();
    confettiIntervalID = setInterval(() => {
        addConfetti();
    }, 600 + Math.random() * 1700);
}

function stopConfetti() {
    removeEventListener('click', addConfetti);
    removeEventListener('resize', resizeConfettiCanvas);
    clearInterval(confettiIntervalID);
}

(() => {
    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp" && !hero.classList.contains("jump")) {
    
            hero.classList.remove("bend");
            hero.classList.add("jump");
            const timeoutJumpID = setTimeout(() => {
                hero.classList.remove("jump");
                clearTimeout(timeoutJumpID);
            }, 750);
        }
    
        if (e.key === "ArrowDown" && !hero.classList.contains("bend") ) {
    
            hero.classList.remove("jump");
            hero.classList.add("bend");
            const timeoutBendID = setTimeout(() => {
                hero.classList.remove("bend");
                clearTimeout(timeoutBendID);
            }, 1000);
        }
    });

    hero.classList.add("stop");
    clearInterval(collisionDetector);
    
    playButton.onclick = function() {
        start()
    }
    
    document.getElementById("username-submit").onclick = function() {
        currentPlayer = document.getElementById("username-input").value;
        document.getElementById("username").classList.add("hide");
    };
    
    const leaderboardButton = document.getElementById("btn-leaderboard");
    const scoreBoard = document.getElementById("score-board");
    leaderboardButton.onclick = function() {
        if (scoreBoard.classList.contains("hide"))
            scoreBoard.classList.remove("hide");
        else
            scoreBoard.classList.add("hide");
    }
    
    generateLeaderBoard();
})();
