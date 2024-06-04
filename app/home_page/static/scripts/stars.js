import { delta } from './main.js';
import { loop_exec } from './tourney_pong.js';

export function stars(stars_effect) {
	const ctx_stars = stars_effect.getContext("2d");

	const InitCanvas = () => {
		// stars_effect.style.position = "fixed";
		stars_effect.setAttribute("width", `1000px`);
		ctx_stars.clearRect(0, 0, stars_array.width, stars_array.height);
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
				this.x > stars_effect.width ||
				this.y < 0 ||
				this.y > stars_effect.height
			) {
				this.radius = 0.2;
				this.x = Math.random() * stars_effect.width;
				this.y = Math.random() * stars_effect.height;
			}
		}
		move() {
			this.radius += 0.1 / delta;
			const speed = 100 * delta;
			this.x += (this.x - stars_effect.width / 2) * (this.radius / speed);
			this.y += (this.y - stars_effect.height / 2) * (this.radius / speed);
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

	const stars_array = StarArray();

	function Update() {
		if (loop_exec == true)
			return;
		// if (loop_exec == false) {
			InitCanvas();
			stars_array.forEach((star) => star.draw());
		// }
		requestAnimationFrame(Update);
	}
	Update();
}
