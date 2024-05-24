var player_id = 0;
var side = "none";
//board
let board_height = 800;
let board_width = 1200;

//player
let player_width = 15;
let player_height = 100;
let playerVelocity = 15;

//balling
let ball_width = 15;
let ball_height = 15;
let ball_velocity = 10;

let ball = {
    width: ball_width,
    height: ball_height,
    xPos: (board_width / 2) - (ball_width / 2),
    yPos: (board_height / 2) - (ball_height / 2),
}

let player1 = {
    xPos: 10,
    yPos: board_height / 2 - player_height / 2,
    score: 0,
    velocity: 0,
}

let player2 = {
    xPos: board_width - player_width - 10,
    yPos: board_height / 2 - player_height / 2,
    score: 0,
    velocity: 0,
}

var stop = false;
var sound = false;
var animation_id = -1;
var isalone = true;
var time_left = 0;

function sound_change() {
    if (sound == false)
        sound = true;
    else
        sound = false;
}

var fpsInterval;
var then;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = performance.now();
    gameLoop();
}

window.onload = function () {
    let board = document.getElementById("board");
    board.width = board_width;
    board.height = board_height;
    context = board.getContext("2d");

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
    draw_board();
    gameLoop();
    // startAnimating(60);
}

function draw_board()
{
    context.fillStyle = "white";
    //player 1
    context.fillRect(player1.xPos, player1.yPos, player_width, player_height);

    //player 2
    context.fillRect(player2.xPos, player2.yPos, player_width, player_height);

    //middle_line
    fill_middle_lines();

    //score
    context.font = "48px serif";
    context.fillText(player1.score, 100, 50);

    context.fillText(player2.score, board_width - 130, 50);

    //ball
    context.fillStyle = "white";
    context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);

}

var trigger = true;

// Function that returns a Promise for the FPS
const getFPS = () =>
    new Promise(resolve =>
        requestAnimationFrame(t1 =>
        requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
    )
)

var time_before = 0;
var time_after = 0;

function gameLoop() {
    animation_id = window.requestAnimationFrame(gameLoop);

    context.clearRect(0, 0, board.width, board.height);

    draw_board();
    if (isalone == true && player1.score != 5 && player2.score != 5)
    {
        context.fillStyle = "white";
        context.fillText("waiting for a second player", 325, 315);
    }
    if (player1.score == 5)
    {
        if (trigger == true)
        {
            setTimeout(() => { location.replace("https://" + window.location.host); }, 5000);
            trigger = false;
        }
        context.font = "100px serif";
        context.fillText("Player 1 won !", 330, 400);
    }
    else if (player2.score == 5)
    {
        if (trigger == true)
        {
            setTimeout(() => { location.replace("https://" + window.location.host); }, 5000);
            trigger = false;
        }
        context.font = "100px serif";
        context.fillText("Player 2 won !", 330, 400);
    }
    if (time_left != 0)
    {
        context.fillStyle = "red";
        context.font = "100px serif";
        context.fillText(time_left, 575, 190);
    }
}

function fill_middle_lines() {
    for (let i = 0; i < board_height; i += 4.2) {
        context.fillStyle = "gray";
        context.fillRect(board_width / 2 - 5, i, 10, 30);
        i += 60;
    }
}

function play() {
    if (sound == true)
        audio.play();
}

var lastSent = "none";

function movePlayer(e) {
    if (e.key == 'w' && lastSent != "keyW") {
        ws.send(JSON.stringify({ type: "keyW", playerId: player_id }));
        lastSent = "keyW";
    }
    if (e.key == 's' && lastSent != "keyS") {
        ws.send(JSON.stringify({ type: "keyS", playerId: player_id }));
        lastSent = "keyS"
    }
}

//allows the player to stop if key is released
function stopPlayer(e) {
    if (e.key == 'w' && lastSent != "keyStop") {
        ws.send(JSON.stringify({ type: "keyStop", playerId: player_id }));
        lastSent = "keyStop"
    }
    if (e.key == 's' && lastSent != "keyStop") {
        ws.send(JSON.stringify({ type: "keyStop", playerId: player_id }));
        lastSent = "keyStop"  
    }
}

ws.addEventListener("message", event => {
    let messageData = JSON.parse(event.data);
    console.log(messageData);
    if (messageData.type === "stateUpdate") {
        player1.yPos = messageData.objects.player1Pos;
        player2.yPos = messageData.objects.player2Pos;
        ball.xPos = messageData.objects.ball_xPos;
        ball.yPos = messageData.objects.ball_yPos;
        player1.score = messageData.objects.player1Score;
        player2.score = messageData.objects.player2Score;
        if (messageData.objects.sound == true)
            play();
    }
    else if (messageData.type === "playerNum") {
        if (messageData.num === 2)
            isalone = false;
        else if (messageData.num === 1)
            isalone = true;
    }
    else if (messageData.type === "playerId") {
        player_id = messageData.objects.id;
        side = messageData.objects.side;
    }
    else if (messageData.type === "countdown") {
        time_left = messageData.left;
    }
    // if (messageData.type != "stateUpdate")
    //     console.log(messageData);
});