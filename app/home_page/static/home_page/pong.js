let paddle_y1 = paddle_y2 = game.height / 2 - 100;
let paddle_speed_y1 = 0;
let paddle_speed_y2 = 0;
const ball_length = 30;
let ball_x = game.width / 2 - ball_length / 2;
let ball_y = game.height / 2 - ball_length / 2;
let ball_speed = 400;
let ball_angle = ((Math.random() < 0.5 ? 1 : -1) == true) ? (Math.PI - ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180)) : ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180);
let score = [0, 0];
let paddle_bounces = 0;
let last_frame;
let wait_frames = 0;
let speed_acc = 3;
let n = 0;
let ai_activated = false;
let mouse_posX;
let mouse_posY;
let loop_exec = 0;

function GameMode(n) {
	//
	if (n == 2)
		return;
	//
	// document.getElementById("game").style.display = "block";
	document.getElementById("title").style.display = "none";
	document.getElementById("cpu-mode").style.display = "none";
	document.getElementById("pvp-mode").style.display = "none";
	document.getElementById("tournoi-mode").style.display = "none";
	document.getElementById("online-mode").style.display = "none";

	if (n == 3)
		loginBox();
	if (n == 1)
		ai_activated = true;
	if (n <= 1)
		requestAnimationFrame(loop);
}

function loginBox() {
	const login_elements = document.getElementsByClassName("login-box");
	for (let i = 0; i < login_elements.length; i++)
		login_elements[i].style.display = "block";
}

function bounceAngle(ball_angle, ball_x, ball_y, ball_length, paddle_y1, paddle_y2) {
	let paddle;
	paddle_bounces++;
	if (ball_angle > Math.PI / 2 && ball_angle < Math.PI + Math.PI / 2)
		paddle = paddle_y1;
	else if (ball_angle < Math.PI / 2 || ball_angle > Math.PI + Math.PI / 2)
		paddle = paddle_y2;
	let relative_position = (ball_y + ball_length / 2) - (paddle + 100);

	if (paddle == paddle_y1)
		return (2 * Math.PI - ((360 - relative_position * 45 / 100) * Math.PI / 180));
	else if (paddle == paddle_y2)
		return (2 * Math.PI - ((180 + relative_position * 45 / 100) * Math.PI / 180));
}

function updatePos(time_diff) {
	wait_frames--;
	frames++;
	aiMove();
	if (wait_frames == 1) {
		paddle_speed_y1 = 0;
		paddle_speed_y2 = 0;
		ball_x = game.width / 2 - ball_length / 2;
		ball_y = game.height / 2 - ball_length / 2;
		ball_speed = 400;
		ball_angle = ((Math.random() < 0.5 ? 1 : -1) == true) ? (Math.PI - ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180)) : ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180);
		paddle_bounces = 0;
		speed_acc = 3;
		frames = 0;
		aiMove();
	}

  paddle_y1 += paddle_speed_y1 * time_diff;
  paddle_y2 += paddle_speed_y2 * time_diff;
	if (paddle_y1 < 10 || paddle_y1 > game.height - 200 - 10)
		paddle_y1 -= paddle_speed_y1 * time_diff;
	if (paddle_y2 < 10 || paddle_y2 > game.height - 200 - 10)
		paddle_y2 -= paddle_speed_y2 * time_diff;

	ball_x += ball_speed * Math.cos(ball_angle) * time_diff;
	ball_y += ball_speed * Math.sin(ball_angle) * time_diff;
	// if ((ball_y < 0 && ball_angle > Math.PI || ball_angle < 0) || (ball_y + ball_length > game.height && ball_angle < Math.PI && ball_angle > 0))
	if (ball_y < 0 || ball_y > game.height - ball_length)
		ball_angle = 2 * Math.PI - ball_angle;
	if ((ball_y >= paddle_y1 - ball_length && ball_y <= paddle_y1 + 200 && ball_x <= 50 && ball_x >= 20 && ball_angle > Math.PI / 2 && ball_angle < Math.PI * 1.5) || (ball_y >= paddle_y2 - 25 && ball_y <= paddle_y2 + 200 && ball_x + ball_length >= 950 && ball_x <= 980 && (ball_angle < Math.PI / 2 || ball_angle > Math.PI * 1.5))) {
		ball_angle = bounceAngle(ball_angle, ball_x, ball_y, ball_length, paddle_y1, paddle_y2);
		if (Math.floor(Math.random() * speed_acc) == 1)
			ball_speed *= 1.1;
		if (ball_speed > 1500)
			speed_acc = 10;
		if (ball_speed > 2000)
			ball_speed = 2000;
		if (paddle_bounces == 1)
			ball_speed *= 2;
	}
	if (ball_x < -ball_length && wait_frames < 0) {
		score[1]++;
		wait_frames = 25;
	}
	else if (ball_x > game.width && wait_frames < 0) {
		score[0]++;
		wait_frames = 25;
	}
}

function aiMove() {
	if (!ai_activated || !(ball_angle > Math.PI / 2 && ball_angle < Math.PI * 1.5))
		return;
	let copy_ball_x = ball_x;
	let copy_ball_y = ball_y;
	let copy_ball_angle = ball_angle;
	for (let i = 1; ball_x > 50; i++) {
		if (ball_y < 0 || ball_y > game.height - ball_length)
		// if ((ball_y < 0 && ball_angle > Math.PI || ball_angle < 0) || (ball_y + ball_length > game.height && ball_angle < Math.PI && ball_angle > 0))
			ball_angle = 2 * Math.PI - ball_angle;
		ball_x += Math.cos(ball_angle) * i;
		ball_y += Math.sin(ball_angle) * i;
	}
	if (ball_y > paddle_y1 + 200)
		paddle_speed_y1 = 1000;
	else if (ball_y + ball_length < paddle_y1)
		paddle_speed_y1 = -1000;
	else
		paddle_speed_y1 = 0;
	ball_x = copy_ball_x;
	ball_y = copy_ball_y;
	ball_angle = copy_ball_angle;
}

function draw() {
	if (!n) {
		paddle_y2 += 2;
		paddle_y2--;
	}
	n++;
  const game = document.getElementById("game");
  const ctx = game.getContext("2d");
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.fillStyle = "rgb(70, 70, 70)";
	for (let i = 10; i < game.height - 30; i += 50) {
		ctx.fillRect(game.width / 2, i, 10, 30);
	}
	ctx.font = "100px Arial";
	ctx.textAlign = "center";
	ctx.fillText(score[0].toString(), game.width / 3, 100);
	ctx.fillText(score[1].toString(), game.width - game.width / 3, 100);
  ctx.fillStyle = "rgb(100, 100, 100)";
	ctx.font = "20px Courier New";
	ctx.textAlign = "left";
	// ctx.fillText("Ball Speed: " + Math.floor(ball_speed), 20, 30);
	// ctx.fillText("Paddle Bounces: " + paddle_bounces, 20, 50);
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(20, paddle_y1, 30, 200);
  ctx.fillRect(950, paddle_y2, 30, 200);
	ctx.beginPath();
	ctx.fillRect(ball_x, ball_y, ball_length, ball_length);
	ctx.fill();
}

function loop(current_frame) {
	loop_exec = 1;
	const game = document.getElementById("game");
	const ctx = game.getContext("2d");
  const time_diff = (current_frame - last_frame) / 1000 || 0;
  last_frame = current_frame;

	// aiMove();
  updatePos(time_diff);
  draw();

  requestAnimationFrame(loop);
}

document.onmousemove = (event) => {
	const {
		clientX,
		clientY
	} = event
	mouse_posX = clientX;
	mouse_posY = clientY;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "w" && !ai_activated)
    paddle_speed_y1 = -1000;
  else if (event.key === "s" && !ai_activated)
    paddle_speed_y1 = 1000;
  else if (event.key === "ArrowUp")
    paddle_speed_y2 = -1000;
  else if (event.key === "ArrowDown")
    paddle_speed_y2 = 1000;
});

document.addEventListener("keyup", (event) => {
	if (event.key === "w" || event.key === "s") {
		if (!ai_activated)
			paddle_speed_y1 = 0;
	}
  else if (event.key === "ArrowUp" || event.key === "ArrowDown")
    paddle_speed_y2 = 0;
});

document.getElementById("pvp-mode").addEventListener("click", function() { GameMode(0); });
document.getElementById("cpu-mode").addEventListener("click", function() { GameMode(1); });
document.getElementById("tournoi-mode").addEventListener("click", function() { GameMode(2); });
document.getElementById("online-mode").addEventListener("click", function() { GameMode(3); });

const game_ = document.getElementById("game");
const ctx_stars = game.getContext("2d");

let delta = 1.5;
const InitCanvas = () => {
	// game_.style.position = "fixed";
	game_.setAttribute("width", `1000px`);
	ctx_stars.clearRect(0, 0, _game_.width, _game_.height);
};

class Stars {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.glow = "#cfcfcf88";
		this.radius = 0.2;
	}
	beforeStart() {
		if (
			this.x < 0 ||
			this.x > game_.width ||
			this.y < 0 ||
			this.y > game_.height
		) {
			this.radius = 0.2;
			this.x = Math.random() * game_.width;
			this.y = Math.random() * game_.height;
		}
	}
	move() {
		this.radius += 0.1 / delta;
		const speed = 100 * delta;
		this.x += (this.x - game_.width / 2) * (this.radius / speed);
		this.y += (this.y - game_.height / 2) * (this.radius / speed);
	}
	draw() {
		this.beforeStart();
		this.move();
		ctx_stars.beginPath();
		ctx_stars.fillStyle = this.glow;
		ctx_stars.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
		ctx_stars.fill();
		ctx_stars.closePath();
		ctx_stars.beginPath();
		ctx_stars.fillStyle = this.color;
		ctx_stars.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx_stars.fill();
		ctx_stars.closePath();
	}
}

function StarArray(amount = 100) {
	const x = () => Math.random() * window.innerWidth;
	const y = () => Math.random() * window.innerHeight;
	const color = "#ffffff";
	let array = Array.from({ length: amount }, () => new Stars(x(), y(), color));
	return array;
}

const _game_ = StarArray();

function Update() {
	if (loop_exec == 1)
		return;
	InitCanvas();
	_game_.forEach((star) => star.draw());
	requestAnimationFrame(Update);
}
Update();
