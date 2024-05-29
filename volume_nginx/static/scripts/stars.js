import { loop_exec, delta } from './main.js';

export function stars(game_) {
	const ctx_stars = game_.getContext("2d");

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
}
