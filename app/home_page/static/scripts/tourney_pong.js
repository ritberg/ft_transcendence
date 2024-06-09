import { sleep, writeVerticalText } from './utils.js';
import { stars, starWars, modifyDelta } from './stars.js';
import { game, drawBrackets } from './brackets.js';

export var loop_exec = false;
let paddle_y1 = game_canvas.height / 2 - 100;
let paddle_y2 = paddle_y1;
let paddle_speed_y1 = 0;
let paddle_speed_y2 = 0;
const ball_length = 30;
let ball_x = game_canvas.width / 2 - ball_length / 2;
let ball_y = game_canvas.height / 2 - ball_length / 2;
let ball_speed = 400;
let ball_angle = ((Math.random() < 0.5 ? 1 : -1) == true) ? (Math.PI - ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180)) : ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180);
let score = [0, 0];
let paddle_bounces = 0;
let last_frame;
let wait_frames = 0;
let speed_acc = 3;
let n = 0;
let mouse_posX;
let mouse_posY;

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
	if (wait_frames == 1) {
		paddle_speed_y1 = 0;
		paddle_speed_y2 = 0;
		ball_x = game_canvas.width / 2 - ball_length / 2;
		ball_y = game_canvas.height / 2 - ball_length / 2;
		ball_speed = 400;
		ball_angle = ((Math.random() < 0.5 ? 1 : -1) == true) ? (Math.PI - ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180)) : ((Math.random() * (225 * Math.PI / 180 - 135 * Math.PI / 180)) + 135 * Math.PI / 180);
		paddle_bounces = 0;
		speed_acc = 3;
		frames = 0;
	}

  paddle_y1 += paddle_speed_y1 * time_diff;
  paddle_y2 += paddle_speed_y2 * time_diff;
	if (paddle_y1 < 10 || paddle_y1 > game_canvas.height - 200 - 10)
		paddle_y1 -= paddle_speed_y1 * time_diff;
	if (paddle_y2 < 10 || paddle_y2 > game_canvas.height - 200 - 10)
		paddle_y2 -= paddle_speed_y2 * time_diff;

	ball_x += ball_speed * Math.cos(ball_angle) * time_diff;
	ball_y += ball_speed * Math.sin(ball_angle) * time_diff;
	// if ((ball_y < 0 && ball_angle > Math.PI || ball_angle < 0) || (ball_y + ball_length > game_canvas.height && ball_angle < Math.PI && ball_angle > 0))
	if (ball_y < 0 || ball_y > game_canvas.height - ball_length)
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
	else if (ball_x > game_canvas.width && wait_frames < 0) {
		score[0]++;
		wait_frames = 25;
	}
}

function draw() {
	if (!n) {
		paddle_y2 += 2;
		paddle_y2--;
	}
	n++;
  const game_canvas = document.getElementById("game_canvas");
  const ctx = game_canvas.getContext("2d");
  ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
  ctx.fillStyle = "rgb(70, 70, 70)";
	for (let i = 10; i < game_canvas.height - 30; i += 50) {
		ctx.fillRect(game_canvas.width / 2, i, 10, 30);
	}
	ctx.font = "100px Arial";
	ctx.textAlign = "center";
	ctx.fillText(score[0].toString(), game_canvas.width / 3, 100);
	ctx.fillText(score[1].toString(), game_canvas.width - game_canvas.width / 3, 100);
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(20, paddle_y1, 30, 200);
  ctx.fillRect(950, paddle_y2, 30, 200);
	ctx.beginPath();
	ctx.fillRect(ball_x, ball_y, ball_length, ball_length);
	ctx.fill();
  ctx.fillStyle = "rgb(0, 0, 0)";
	//console.log(game.index. game.player);
	writeVerticalText(ctx, game.score[game.index][0], 22.5, paddle_y1 + 100, "35px Arial", 0);
	writeVerticalText(ctx, game.score[game.index + 1][0], 977.5, paddle_y2 + 100, "35px Arial", 1);
}

export async function loop(current_frame) {
	const game_canvas = document.getElementById("game_canvas");
	const ctx = game_canvas.getContext("2d");
	loop_exec = true;
	//if (game.index == 8 && (score[0] == 1 || score[1] == 1))
	//	return;
	if (score[0] == game.max_points || score [1] == game.max_points) {
		//console.log(game.index, game.score[0][0].name);
		game.score[game.index][1] = score[0];
		game.score[game.index + 1][1] = score[1];
		if (score[0] > score[1])
			game.score.push([game.score[game.index][0], 172]);
		else
			game.score.push([game.score[game.index + 1][0], 172]);
		game.index += 2;
		score[0] = 0;
		score[1] = 0;
		paddle_y1 = game_canvas.height / 2 - 100;
		paddle_y2 = paddle_y1;
		ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
		loop_exec = false;
		modifyDelta(1.5);
		stars(document.getElementById("game_canvas"));
		await sleep(500);
		await drawBrackets();
		await starWars();
		let last_player = 0;
		for (let z = game.player.length; z > 1; z /= 2)
			last_player += z;
		if (game.index != last_player) {
			modifyDelta(1.5);
			document.getElementById("main-menu").style.display = "flex";
			document.getElementById("main-menu").style.opacity = "0";
			await sleep(100);
			document.getElementById("main-menu").classList.remove("hidden");
			document.getElementById("main-menu").classList.add("shown");
			await sleep(200);
			document.getElementById("main-menu").style.opacity = "1";
			return;
		}
			// loop_exec = true;
		// requestAnimationFrame(loop);
		// console.log(1);
		// return;
	} else {
		const time_diff = (current_frame - last_frame) / 1000 || 0;
		last_frame = current_frame;

		// console.log(ball_y, game_canvas.height, ball_length);
		updatePos(time_diff);
		draw();
	}
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
  if (event.key === "w")
    paddle_speed_y1 = -1000;
  else if (event.key === "s")
    paddle_speed_y1 = 1000;
  else if (event.key === "ArrowUp")
    paddle_speed_y2 = -1000;
  else if (event.key === "ArrowDown")
    paddle_speed_y2 = 1000;
});

document.addEventListener("keyup", (event) => {
	if (event.key === "w" || event.key === "s") {
		paddle_speed_y1 = 0;
	}
  else if (event.key === "ArrowUp" || event.key === "ArrowDown")
    paddle_speed_y2 = 0;
});
