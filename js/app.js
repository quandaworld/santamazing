/*-------------------------------- Constants --------------------------------*/
const singleWallSize = 20;
const mazeHeight = 300;
const mazeWidth = 300;

const gridArr = [];
const wallLeftCoords = [];
const wallRightCoords = [];
const wallTopCoords = [];
const wallBotCoords = [];


/*---------------------------- Variables (state) ----------------------------*/
let totalGridRows = mazeHeight / singleWallSize; // 15
let totalGridCols = mazeWidth / singleWallSize; // 15

/*------------------------ Cached Element References ------------------------*/
const maze = document.getElementById('maze');
const santa = document.getElementById('santa');
const exit = document.getElementById('exit');
const walls = document.getElementsByClassName('wall');
const wallWidth = document.getElementById('top').clientHeight;

/*-------------------------------- Functions --------------------------------*/

// Populate grid's walls when the page is done loading
window.onload = () => {
	for (let i = 0; i < walls.length; i++) {
		wallLeftCoords.push(walls[i].offsetLeft);
		wallRightCoords.push(walls[i].offsetLeft + walls[i].clientWidth);
		wallTopCoords.push(walls[i].offsetTop);
		wallBotCoords.push(walls[i].offsetTop + walls[i].clientHeight);
	}
};

// Populate grid arr structure with rows and columns
function initializeGrid() {
	for (let i = 0; i < totalGridRows; i++) {
		const singleRowArr = [];
	
		for (let j = 0; j < totalGridCols; j++) {
			singleRowArr.push({ u: 0, d: 0, l: 0, r: 0, v: 0 }); // up, down, left, right, visited
		}
	
		gridArr.push(singleRowArr);
	}
}

// Create vertical walls with random entry and exit points
function createVerticalWalls() {
	const topHeight = Math.floor(Math.random() * totalGridRows) * singleWallSize;
	const botHeight = mazeHeight - singleWallSize - topHeight;

	const wallArr = [
			{ top: singleWallSize, left: singleWallSize, height: topHeight },
			{ top: topHeight + singleWallSize * 2, left: singleWallSize, height: botHeight },
			{ top: singleWallSize, left: mazeWidth + singleWallSize, height: botHeight },
			{ top: botHeight + singleWallSize * 2, left: mazeWidth + singleWallSize, height: topHeight }
	];

	// Store wall coordinates
	wallLeftCoords.push(0, mazeWidth + 2 * singleWallSize, 0, 0, mazeWidth + singleWallSize, mazeWidth + singleWallSize);
	wallRightCoords.push(0 + wallWidth, mazeWidth + 2 * singleWallSize + wallWidth, singleWallSize, singleWallSize, mazeWidth + 2 * singleWallSize, mazeWidth + 2 * singleWallSize);
	wallTopCoords.push(topHeight + singleWallSize, botHeight + singleWallSize, topHeight + singleWallSize, topHeight + 2 * singleWallSize, botHeight + singleWallSize, botHeight + 2 * singleWallSize);
	wallBotCoords.push(topHeight + 2 * singleWallSize, botHeight + 2 * singleWallSize, topHeight + singleWallSize + wallWidth, topHeight + 2 * singleWallSize + wallWidth, botHeight + singleWallSize + wallWidth, botHeight + 2 * singleWallSize + wallWidth);

	// Set player & exit positions
	Object.assign(santa.style, { top: `${topHeight + singleWallSize}px`, left: '0px' });
	Object.assign(exit.style, { top: `${botHeight + singleWallSize}px`, left: `${mazeWidth + singleWallSize}px` });

	// Create walls
	wallArr.forEach(({ top, left, height }) => {
			const wall = document.createElement('div');
			Object.assign(wall.style, { top: `${top}px`, left: `${left}px`, height: `${height}px`, width: `${wallWidth}px` });
			wall.classList.add('wall');
			maze.appendChild(wall);
	});
}

// Helper method for generateRandomMaze()
function shuffleArr(arr) {
	for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr;
}

// Populate a maze using Recursive Backtracking
function generateRandomMaze(currentX, currentY) {
	const directions = shuffleArr(['u', 'd', 'l', 'r']); // up, down, left, right
	const dirsCoords = { // directions' coordinates
		u: { x: 0, y: -1, o: 'd' },
		d: { x: 0, y: 1, o: 'u' },
		l: { x: -1, y: 0, o: 'r' },
		r: { x: 1, y: 0, o: 'l' }
	};

	for (let i = 0; i < directions.length; i++) {
		let nx = currentX + dirsCoords[directions[i]].x;
		let ny = currentY + dirsCoords[directions[i]].y;
		gridArr[currentY][currentX].v = 1;

		if (nx >= 0 && nx < totalGridCols && ny >= 0 && ny < totalGridRows && gridArr[ny][nx].v === 0) {
			gridArr[currentY][currentX][directions[i]] = 1;
			gridArr[ny][nx][dirsCoords[directions[i]].o] = 1;
			generateRandomMaze(nx, ny);
		}
	}
}

// helper method for drawMaze
function drawLines(x, y, l, r, u, d) {
	let top = (y + 1) * singleWallSize;
	let left = (x + 1) * singleWallSize;
	if (l === 0 && x > 0) {
		let el = document.createElement('div');
		el.style.left = left + 'px';
		el.style.height = singleWallSize + 'px';
		el.style.top = top + 'px';
		el.setAttribute('class', 'wall');
		el.style.width = wallWidth + 'px';
		maze.appendChild(el);
	}

	if (d === 0 && y < totalGridRows - 1) {
		let el = document.createElement('div');
		el.style.left = left + 'px';
		el.style.height = wallWidth + 'px';
		el.style.top = top + singleWallSize + 'px';
		el.setAttribute('class', 'wall');
		el.style.width = singleWallSize + wallWidth + 'px';
		maze.appendChild(el);
	}
}

// Draw maze
function drawMaze() {
	for (let x = 0; x < totalGridCols; x++) {
		for (let y = 0; y < totalGridRows; y++) {
			let l = gridArr[y][x].l;
			let r = gridArr[y][x].r;
			let u = gridArr[y][x].u;
			let d = gridArr[y][x].d;

			drawLines(x, y, l, r, u, d);
		}
	}
}

//check if one can move horizontally
function checkXWall(direction) {

}

// check if one can move vertically
function checkYWall(direction) {
	
}

function up() {
	if (checkYWall('u')) {
		santa.style.top = santa.offsetTop - singleWallSize + 'px';
	}
}

function down() {
	if (checkYWall('d')) {
		santa.style.top = santa.offsetTop + singleWallSize + 'px';
	}
}

function left() {
	if (checkXWall('l')) {
		santa.style.left = santa.offsetLeft - singleWallSize + 'px';
	}
}

function right() {
	if (checkXWall('r')) {
		santa.style.left = santa.offsetLeft + singleWallSize + 'px';
	}
}



function handleKeyboardInput(e) {
	switch (e.key) {
		case 'ArrowUp':
			up();
			break;
		case 'ArrowDown':
			down();
			break;
		case 'ArrowLeft':
			left();
			break;
		case 'ArrowRight':
			right();
			break;
	}
}

initializeGrid();
createVerticalWalls();
generateRandomMaze(0, 0);
drawMaze();

/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', handleKeyboardInput);
