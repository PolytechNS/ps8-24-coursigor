//    WT WL WB WR P1 P2 cell vision
//    00 00 00 00 0  0  0000

// Wall state : Player wall here
//              0      0


const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
const NEGMASK =0b1000
const VISIONMASK = 0b111
let activePlayer = PLAYER1;

let positionPlayer1 = [4, 8];
let positionPlayer2 = [4, 0];

let wallsNotToPlace = [];


let visionBoard= [  [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
                    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
                    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
                    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
                    [0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
                    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
                    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
                    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
                    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1]];

visionBoard[0][4] += PLAYER2;
visionBoard[8][4] += PLAYER1;
Game = true;
while (Game) {
    updatePlayerVision(positionPlayer1[0], positionPlayer1[1], -1);
    updatePlayerVision(positionPlayer2[0], positionPlayer2[1], 1);
        
    console.log(visionBoard);
    Game = false;
}
let test=1;
function createGrid() {
    const svg = document.querySelector('svg');
    //clear the previous cells and walls but keep the placed walls
    svg.querySelectorAll(".cell").forEach(cell => cell.remove());
    svg.querySelectorAll(".wall").forEach(wall => wall.remove());
    var StartGame= document.getElementById("StartGame");
    StartGame.style.display = "none";
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const x = i * 5;
            const y = j * 5;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x.toString());
            rect.setAttribute("y", y.toString());
            rect.setAttribute("width", "4");
            rect.setAttribute("height", "4");
            rect.setAttribute("fill", "#B70000");
            rect.setAttribute("class", "cell");

            rect.setAttribute("data-i", i.toString());
            rect.setAttribute("data-j", j.toString());
            rect.addEventListener("click", () => handlePlayerClick(i, j));

            document.querySelector('svg').appendChild(rect);
            if (visionBoard[j][i] & PLAYER1) {
                const circlePlayer1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circlePlayer1.setAttribute("cx", (x + 2).toString());
                circlePlayer1.setAttribute("cy", (y + 2).toString());
                circlePlayer1.setAttribute("r", "2");
                circlePlayer1.setAttribute("fill", "#00FF00");
                circlePlayer1.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer1);
            }

            // Ajoutez un cercle pour le joueur 2
            if (visionBoard[j][i] & PLAYER2) {
                const circlePlayer2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circlePlayer2.setAttribute("cx", (x + 2).toString());
                circlePlayer2.setAttribute("cy", (y + 2).toString());
                circlePlayer2.setAttribute("r", "2");
                circlePlayer2.setAttribute("fill", "#0000FF");
                circlePlayer2.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer2);
            }
        }
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const x = i * 5;
            const y = j * 5;

            if (wallsNotToPlace.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j)) {
                console.log("skipping vertical wall", i, j);
            } else {
                const verticalWall = createWall(x + 4, y, 1, 4, "verticalWall");
                verticalWall.setAttribute("data-i", i.toString());
                verticalWall.setAttribute("data-j", j.toString());
                document.querySelector('svg').appendChild(verticalWall);

            }
            if (wallsNotToPlace.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j)) {
                console.log("skipping horizontal wall", i, j);
            } else {
                const horizontalWall = createWall(x, y + 4, 4, 1, "horizontalWall");
                horizontalWall.setAttribute("data-i", i.toString());
                horizontalWall.setAttribute("data-j", j.toString());
                document.querySelector('svg').appendChild(horizontalWall);

            }
        }
    }

    const horizontalWalls = document.querySelectorAll(".horizontalWall");
    horizontalWalls.forEach(wall => {
        wall.setAttribute("data-width", wall.getAttribute("width"));
        wall.setAttribute("data-height", wall.getAttribute("height"));
        wall.addEventListener("mouseenter", horizontalWallHandleHover);
        wall.addEventListener("mouseleave", horizontalWallHandleHover);

        const i1 = parseInt(wall.getAttribute("data-i"));
        const j1 = parseInt(wall.getAttribute("data-j"));
        const i2 = 1 + parseInt(wall.getAttribute("data-i"));
        const j2 = parseInt(wall.getAttribute("data-j"));
        wall.addEventListener("click", () => handleWallClick(i1, j1, i2, j2));
    });

    const verticalWalls = document.querySelectorAll(".verticalWall");
    verticalWalls.forEach(wall => {
        wall.setAttribute("data-width", wall.getAttribute("width"));
        wall.setAttribute("data-height", wall.getAttribute("height"));
        wall.addEventListener("mouseenter", verticalWallHandleHover);
        wall.addEventListener("mouseleave", verticalWallHandleHover);

        const i1 = parseInt(wall.getAttribute("data-i"));
        const j1 = parseInt(wall.getAttribute("data-j"));
        const i2 = parseInt(wall.getAttribute("data-i"));
        const j2 = 1 + parseInt(wall.getAttribute("data-j"));
        wall.addEventListener("click", () => handleWallClick(i1, j1, i2, j2));
    });

}

function updateVisionWall(i, j, value) {
    calculateVision(visionBoard, i, j, value);
    calculateVision(visionBoard, i + 1, j, value);
    calculateVision(visionBoard, i, j + 1, value);
    calculateVision(visionBoard, i + 1, j + 1, value);

    //TODO finish the vision update for the walls
}

function handleWallClick(i1, j1, i2, j2) {
    wallsNotToPlace.push(["vertical", i1, j1]);     //the selected wall
    wallsNotToPlace.push(["horizontal", i1, j1]);   //the perpendicular wall to the left or the top
    console.log("click wall", i1, j1, i2, j2);
    const wall = event.target;

    let newWall = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let wall2;
    let wall3;
    let wall4;

    //place the wall on the vision board
    //TODO set the player owning the wall
    if (i1 === i2) {
        // Vertical wall
        newWall.setAttribute("x", (i1*5+4).toString());
        newWall.setAttribute("y", (j1*5).toString());
        newWall.setAttribute("width", (1).toString());
        newWall.setAttribute("height", (9).toString());
        newWall.setAttribute("class", activePlayer+ "verticalPlacedWall");

        visionBoard[j1][i1] += WALL_RIGHT;
        visionBoard[j2][i2] += WALL_RIGHT;

        visionBoard[j1][i1 + 1] += WALL_LEFT;
        visionBoard[j2][i2 + 1] += WALL_LEFT;

        wallsNotToPlace.push(["vertical", i2, j2]);     //the wall to the bottom
        wallsNotToPlace.push(["vertical", i1, j1 - 1]);   //the wall to the top
        wall2 = document.querySelector(`.verticalWall[data-i="${i2}"][data-j="${j2}"]`);
        wall3 = document.querySelector(`.verticalWall[data-i="${i2}"][data-j="${j1 - 1}"]`);
        wall4 = document.querySelector(`.horizontalWall[data-i="${i1}"][data-j="${j1}"]`);
    } else {
        // Horizontal wall
        newWall.setAttribute("x", (i1*5).toString());
        newWall.setAttribute("y", (j1*5+4).toString());
        newWall.setAttribute("width", (9).toString());
        newWall.setAttribute("height", (1).toString());
        newWall.setAttribute("class", activePlayer+ "horizontalPlacedWall");

        visionBoard[j1][i1] += WALL_BOTTOM;
        visionBoard[j2][i2] += WALL_BOTTOM;

        visionBoard[j1 + 1][i1] += WALL_TOP;
        visionBoard[j2 + 1][i2] += WALL_TOP;

        wallsNotToPlace.push(["horizontal", i2, j2]);   //the wall to the right
        wallsNotToPlace.push(["horizontal", i1 - 1, j1]);   //the wall to the left
        wall2 = document.querySelector(`.horizontalWall[data-i="${i2}"][data-j="${j2}"]`);
        wall3 = document.querySelector(`.horizontalWall[data-i="${i1 - 1}"][data-j="${j2}"]`);
        wall4 = document.querySelector(`.verticalWall[data-i="${i1}"][data-j="${j1}"]`);
    }



    const svg = document.querySelector('svg');

    if (activePlayer === PLAYER1) {
        newWall.setAttribute("fill", "#00FF00");
        updateVisionWall(i1, j1, -2);
        activePlayer = PLAYER2;
    } else {
        newWall.setAttribute("fill", "#0000FF");
        updateVisionWall(i1, j1, 2);
        activePlayer = PLAYER1;
    }

    svg.removeChild(wall);
    svg.appendChild(newWall);

    if (wall2 != null) {
        //remove the wall to the right or bottom from being clicked again and hover events
        svg.removeChild(wall2);
    }
    if (wall3 != null) {
        //remove the wall to the left or top from being clicked again and hover events
        svg.removeChild(wall3);
    }
    if (wall4 != null) {
        //remove the perpendicular wall to the left or the top from being clicked again and hover events
        svg.removeChild(wall4);

    }

    // console.log(visionBoard) as binary
    console.log(visionBoard.map(row => row.map(cell => cell.toString(2).padStart(16, "0")).join(" ")).join("\n"));
    console.log(wallsNotToPlace);
    updateGrid();
}


function createWall(x, y, width, height, className) {
    const wall = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    wall.setAttribute("x", x.toString());
    wall.setAttribute("y", y.toString());
    wall.setAttribute("width", width.toString());
    wall.setAttribute("height", height.toString());
    wall.setAttribute("fill", "rgba(8,59,45,0)");
    wall.setAttribute("class", "wall " + className);

    return wall;
}

function horizontalWallHandleHover(event) {
    const wall = event.target;
    const isHover = event.type === "mouseenter";

    // Adjust the size on hover
    wall.setAttribute("width", isHover ? 9 : wall.getAttribute("data-width"));
    wall.setAttribute("height", isHover ? wall.getAttribute("data-height") : wall.getAttribute("data-height"));
    wall.setAttribute("fill", isHover ? "#ff0000" : "rgba(255,255,255,0)");

    // Bring the wall to the front on hover
    if (isHover) {
        wall.parentElement.appendChild(wall);
    }
}

function verticalWallHandleHover(event) {
    const wall = event.target;
    const isHover = event.type === "mouseenter";

    // Adjust the size on hover
    wall.setAttribute("width", isHover ? wall.getAttribute("data-width") : wall.getAttribute("data-width"));
    wall.setAttribute("height", isHover ? 9 : wall.getAttribute("data-height"));
    wall.setAttribute("fill", isHover ? "#ff0000" : "rgba(255,255,255,0)");

    // Bring the wall to the front on hover
    if (isHover) {
        wall.parentElement.appendChild(wall);
    }
}
function updatePlayerVision(i, j, value) {
    calculateVision(visionBoard, i, j, value);
    calculateVision(visionBoard,i+1, j, value);
    calculateVision(visionBoard,i-1,j, value);
    calculateVision(visionBoard, i, j+1, value);
    calculateVision(visionBoard, i, j-1, value);
}
function calculateVision(board,i,j,value){
    if (i<0 || i>8 || j<0 || j>8)
        return;
    if (!(board[i][j] & VISIONMASK)){
        if (board[i][j] & NEGMASK)
            board[i][j] -=NEGMASK;
        if (value < 0){
            board[i][j] -= 1;
            board[i][j] += NEGMASK;
        }
        else{
            board[i][j] += 1;
        }
    }
    else if (board[i][j] & NEGMASK)
        board[i][j] -= 1;
    else
        board[i][j] += 1;

    if (value > 1) {
        calculateVision(board, i, j, value-1);
    }
}

function handlePlayerClick(i, j) {
    console.log("click cell", i, j);
    validMove(i, j);

}

function handlePlayerClickWallHorizontal(i, j) {
    console.log("clickwallhorizontal", i, j);
    wall.setAttribute("fill", isHover ? "#000000" : "#ffffffff");

}

function validMove(i, j) {
    console.log(activePlayer);
    if(activePlayer === PLAYER1) {
        //prevent the player to move on an illegal cell or on a cell separated with a wall
        if (positionPlayer1[0] === i-1 && positionPlayer1[1] === j || positionPlayer1[0] === i+1 && positionPlayer1[1] === j || positionPlayer1[0] === i && positionPlayer1[1] === j-1 || positionPlayer1[0] === i && positionPlayer1[1] === j+1) {
            visionBoard[positionPlayer1[1]][positionPlayer1[0]] -= PLAYER1;
            positionPlayer1[0] = i;
            positionPlayer1[1] = j;
            console.log("player1", positionPlayer1);
            updatePiecePosition(PLAYER1, positionPlayer1[0], positionPlayer1[1]);
            updateGrid();
            activePlayer = PLAYER2;
        }
    }
    else if(activePlayer === PLAYER2 ) {
        if (positionPlayer2[0] === i-1 && positionPlayer2[1] === j || positionPlayer2[0] === i+1 && positionPlayer2[1] === j || positionPlayer2[0] === i && positionPlayer2[1] === j-1 || positionPlayer2[0] === i && positionPlayer2[1] === j+1) {
            visionBoard[positionPlayer2[1]][positionPlayer2[0]] -= PLAYER2;
            positionPlayer2[0] = i;
            positionPlayer2[1] = j;
            console.log("player2", positionPlayer2);
            updatePiecePosition(PLAYER2, positionPlayer2[0], positionPlayer2[1]);
            updateGrid();
            activePlayer = PLAYER1;
        }
    }
}
function updatePiecePosition(player, i, j) {
    if (player === PLAYER1) {
        visionBoard[j][i] += PLAYER1;
    }
    else if (player === PLAYER2) {
        visionBoard[j][i] += PLAYER2;
    }
}
function updateGrid() {
    const circles = document.querySelectorAll('circle');
    circles.forEach(circle => circle.remove());
    createGrid();
    checkVictoryCondition();
}
function checkVictoryCondition() {
    if(positionPlayer1[1]===0){
        console.log("player 1 wins");
        return;
    }
    if(positionPlayer2[1]===8){
        console.log("player 2 wins");
        return;
    }
}