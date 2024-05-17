export function drawBrackets(n) {
	// document.querySelector("#brackets");
	for (let i = 0; i < n; i++) {
		const newDiv = document.createElement("div");
		const winHeight = parseInt(window.getComputedStyle(document.getElementById("brackets")).height, 10);
		newDiv.classList.add("rectangle-div");
		if (i < 2)
			newDiv.style.boxShadow = `white 0 0 10px`;
		if (i % 2 == 0 && i)
			newDiv.style.top = `${i * (winHeight * 8 / 100) + 70}px`;
		newDiv.style.top = `${i * (winHeight * 8 / 100) + 20}px`;
		newDiv.style.left = `0px`;
		newDiv.style.marginBottom = `${i * 5}px`;
		newDiv.textContent = `PLAYER ${i + 1}`; // Add numbering to each div (optional)
		document.querySelector("#brackets").appendChild(newDiv);
	}
}
