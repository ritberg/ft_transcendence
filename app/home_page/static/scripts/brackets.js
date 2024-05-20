export function drawBrackets(n) {
	// document.querySelector("#brackets");
	// var curr_block = 0;
	// for (let i = 0; i < n; i++) {
	// 	const newDiv = document.createElement("div");
	// 	const winHeight = parseInt(window.getComputedStyle(document.getElementById("brackets")).height, 10);
	// 	const numBlocks = parseInt(document.getElementById("slider1").value) + (Math.round(document.getElementById("slider1").value / 3));
	// 	newDiv.classList.add("rectangle-div");
	// 	if (i % 2 == 0 && i > 0)
	// 		curr_block++;
	// 	if (i < 2)
	// 		newDiv.style.boxShadow = `white 0 0 20px`;
	// 	newDiv.style.top = `${(i + curr_block) * (winHeight / numBlocks)}px`;
	// 	newDiv.textContent = `PLAYER ${i + 1}`; // Add numbering to each div (optional)
	// 	document.querySelector("#brackets").appendChild(newDiv);
	// }
	for (let i = 0; i < n; i++) {
		const newDiv = document.createElement("div");
		const winHeight = parseInt(window.getComputedStyle(document.getElementById("brackets")).height);
		const blockHeight = winHeight / parseInt(document.getElementById("slider1").value);
		const offset = winHeight / 2 - ((blockHeight * Math.round(parseInt(document.getElementById("slider1").value) / 2)) + (blockHeight * Math.round(parseInt(document.getElementById("slider1").value) / 2 + 1) - (blockHeight * Math.round(parseInt(document.getElementById("slider1").value) / 2)) / 2));
		// const offset = blockHeight / 2;
		// const offset = 0;
		console.log(offset);
		newDiv.classList.add("rectangle-div");
		if (i < 2)
			newDiv.style.boxShadow = `white 0 0 20px`;
		if (i % 2 == 0)
			newDiv.style.top = `${i * blockHeight + offset}px`;
		else
			newDiv.style.top = `${(i - 1) * blockHeight + 70 + offset}px`;
		newDiv.textContent = `PLAYER ${i + 1}`; // Add numbering to each div (optional)
		document.querySelector("#brackets").appendChild(newDiv);
	}
}
