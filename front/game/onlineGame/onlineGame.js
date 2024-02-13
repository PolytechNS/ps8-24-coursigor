
//    WT WL WB WR P1 P2 cell vision
//    00 00 00 00 0  0  0000

// Wall state : Player wall here
//              0      0


var socket = io("/api/onlineGame");

socket.send("salut !");

const cookies = document.cookie.split(';');
let cookieString = "Cookies:\n";

cookies.forEach(cookie => {
    cookieString += cookie.trim() + '\n';
});

console.log(cookieString);

socket.emit("newGame", cookieString);

socket.on("message", (msg) => {
    console.log(msg);
});

socket.on("updateGrid", (gameStatus) => {
    console.log("updateGrid", gameStatus);



    closeOverlay();
    createGrid(gameStatus.visionBoard, gameStatus.activePlayer, gameStatus.placedWalls, gameStatus.wallsNotToPlace, gameStatus.positionPlayer1, gameStatus.positionPlayer2);
})







const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
const NEGMASK =0b1000
const VISIONMASK = 0b111

/*
let activePlayer = PLAYER1;
let wallLeftP1 = 10;
let wallLeftP2 = 10;



let wallsNotToPlace = [];
let placedWalls = [];   //type of wall, wall coordinates and player owning the wall


let visionBoard= [  [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1]];

let positionPlayer1 = [4, 8];
let positionPlayer2 = [4, 0];

visionBoard[0][4] += PLAYER2;
visionBoard[8][4] += PLAYER1;
let Game;
Game = true;
while (Game) {
    updatePlayerVision(positionPlayer1[1], positionPlayer1[0], 1);
    updatePlayerVision(positionPlayer2[1], positionPlayer2[0], -1);

    console.log(visionBoard);
    Game = false;
}
let test=1;
*/

function createGrid(visionBoard, activePlayer, placedWalls, wallsNotToPlace, positionPlayer1, positionPlayer2) {
    const svg = document.querySelector('svg');
    //clear the previous cells and walls but keep the placed walls
    svg.querySelectorAll(".cell").forEach(cell => cell.remove());
    svg.querySelectorAll(".wall").forEach(wall => wall.remove());
    var StartGame= document.getElementById("StartGame");
    StartGame.style.display = "none";

    // Create the cells
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
            if (visionBoard[j][i]& VISIONMASK){


                if (activePlayer==PLAYER1 && visionBoard[j][i] & NEGMASK && !nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2)){
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", "4");
                    rect.setAttribute("height", "4");
                    rect.setAttribute("fill", "rgba(0,0,0,1)");
                    rect.setAttribute("data-i", i.toString());
                    rect.setAttribute("data-j", j.toString());
                    rect.addEventListener("click", () => handlePlayerClick(i, j));
                    document.querySelector('svg').appendChild(rect);
                } else if (activePlayer==PLAYER2 && ((visionBoard[j][i] ^ NEGMASK)&NEGMASK) && !nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2)){
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", "4");
                    rect.setAttribute("height", "4");
                    rect.setAttribute("fill", "rgba(0,0,0,1)");
                    rect.setAttribute("data-i", i.toString());
                    rect.setAttribute("data-j", j.toString());
                    rect.addEventListener("click", () => handlePlayerClick(i, j));
                    document.querySelector('svg').appendChild(rect);
                }

            }
        }
    }


    //create the walls
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const x = i * 5;
            const y = j * 5;

            if (wallsNotToPlace.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j)) {
                //console.log("skipping vertical wall", i, j);
            } else {
                const verticalWall = createWall(x + 4, y, 1, 4, "verticalWall");
                verticalWall.setAttribute("data-i", i.toString());
                verticalWall.setAttribute("data-j", j.toString());

                if (placedWalls.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j && wall[3] === PLAYER1)) {
                    verticalWall.setAttribute("height", "9");
                    verticalWall.setAttribute("fill", "#00FF00");
                    verticalWall.setAttribute("class", "placedVerticalWall");
                } else if (placedWalls.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j && wall[3] === PLAYER2)) {
                    verticalWall.setAttribute("height", "9");
                    verticalWall.setAttribute("fill", "#0000FF");
                    verticalWall.setAttribute("class", "placedVerticalWall");

                }

                document.querySelector('svg').appendChild(verticalWall);

            }
            if (wallsNotToPlace.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j)) {
                //console.log("skipping horizontal wall", i, j);
            } else {
                const horizontalWall = createWall(x, y + 4, 4, 1, "horizontalWall");
                horizontalWall.setAttribute("data-i", i.toString());
                horizontalWall.setAttribute("data-j", j.toString());

                if (placedWalls.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j && wall[3] === PLAYER1)) {
                    horizontalWall.setAttribute("width", "9");
                    horizontalWall.setAttribute("fill", "#00FF00");
                    horizontalWall.setAttribute("class", "placedHorizontalWall");
                } else if (placedWalls.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j && wall[3] === PLAYER2)) {
                    horizontalWall.setAttribute("width", "9");
                    horizontalWall.setAttribute("fill", "#0000FF");
                    horizontalWall.setAttribute("class", "placedHorizontalWall");

                }

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
    document.getElementById('overlay').classList.add('active');

}

function nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2) {
    if (activePlayer === PLAYER1) {
        return (i===positionPlayer1[0] && j===positionPlayer1[1]) || (i === positionPlayer1[0] + 1 && j === positionPlayer1[1]) || (i === positionPlayer1[0] - 1 && j === positionPlayer1[1]) || (i === positionPlayer1[0] && j === positionPlayer1[1] + 1) || (i === positionPlayer1[0] && j === positionPlayer1[1] - 1);
    }else if (activePlayer === PLAYER2) {
        return (i===positionPlayer2[0] && j===positionPlayer2[1]) || (i === positionPlayer2[0] + 1 && j === positionPlayer2[1]) || (i === positionPlayer2[0] - 1 && j === positionPlayer2[1]) || (i === positionPlayer2[0] && j === positionPlayer2[1] + 1) || (i === positionPlayer2[0] && j === positionPlayer2[1] - 1);
    }
}
function closeOverlay() {
    // Masquer l'overlay
    document.getElementById('overlay').classList.remove('active');
}
function displayOverlay() {
    // Afficher l'overlay
    document.getElementById('overlay').classList.add('active');
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



/*

function notCirclesPlayers(alreadyChecked, i, j, player) {
    // check if the cell has already been checked
    if (alreadyChecked.some(cell => cell[0] === i && cell[1] === j)) {
        return false;
    }

    //if the cell is out of the board
    if (i < 0 || i > 8 || j < 0 || j > 8) {
        return false;
    }

    // store the cell as checked
    alreadyChecked.push([i, j]);

    if ((player == PLAYER1) && j == 0) {
        return true;
    }
    if ((player == PLAYER2) && j == 8) {
        return true;
    }

    let top = false;
    let bottom = false;
    let left = false;
    let right = false;

    if (!(visionBoard[j][i] & WALL_TOP)) {
        top = notCirclesPlayers(alreadyChecked, i, j - 1, player);
    }
    if (!(visionBoard[j][i] & WALL_BOTTOM)) {
        bottom = notCirclesPlayers(alreadyChecked, i, j + 1, player);
    }
    if (!(visionBoard[j][i] & WALL_LEFT)) {
        left = notCirclesPlayers(alreadyChecked, i - 1, j, player);
    }
    if (!(visionBoard[j][i] & WALL_RIGHT)) {
        right = notCirclesPlayers(alreadyChecked, i + 1, j, player);
    }

    return top || bottom || left || right;
}


function updateVisionWall(i1, j1,i2,j2, value) {
    if (i1 === i2) {
        // Vertical wall

        calculateVision(visionBoard, j1, i1, value*2);
        calculateVision(visionBoard, j2, i2, value*2);
        calculateVision(visionBoard, j1 , i1 + 1, value*2);
        calculateVision(visionBoard, j2 , i2 + 1, value*2);
        calculateVision(visionBoard, j1 - 1 , i1, value);
        calculateVision(visionBoard,j2 + 1, i2 , value);
        calculateVision(visionBoard,j1 - 1 , i1+1, value);
        calculateVision(visionBoard, j2 + 1, i2+1, value);
        calculateVision(visionBoard, j1, i1+2, value);
        calculateVision(visionBoard, j2, i2+2, value);
        calculateVision(visionBoard, j1, i1-1, value);
        calculateVision(visionBoard, j2, i2-1, value);
        console.log(visionBoard);

    }
    else {
        //horizontal wall
        calculateVision(visionBoard, j1, i1, value*2);
        calculateVision(visionBoard, j2, i2, value*2);
        calculateVision(visionBoard, j1 + 1, i1, value*2);
        calculateVision(visionBoard, j2 + 1, i2, value*2);
        calculateVision(visionBoard, j1, i1 - 1, value);
        calculateVision(visionBoard, j2, i2 + 1, value);
        calculateVision(visionBoard, j1 + 1, i1 - 1, value);
        calculateVision(visionBoard, j2 + 1, i2 + 1, value);
        calculateVision(visionBoard, j1 + 2, i1, value);
        calculateVision(visionBoard, j2 + 2, i2, value);
        calculateVision(visionBoard, j1 - 1, i1, value);
        calculateVision(visionBoard, j2 - 1, i2, value);
    }
}

function handleWallClick(i1, j1, i2, j2) {
    // Check if the player has a wall left to place
    if ((activePlayer === PLAYER1 && wallLeftP1 === 0) || (activePlayer === PLAYER2 && wallLeftP2 === 0)) {
        console.log("No more walls left for the active player.");
        return;
    }
    //console.log("click wall", i1, j1, i2, j2);
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

        placedWalls.push(["vertical", i1, j1, activePlayer]);
        wallsNotToPlace.push(["vertical", i2, j2]);     //the wall to the bottom
        wallsNotToPlace.push(["vertical", i1, j1 - 1]);   //the wall to the top
        wallsNotToPlace.push(["horizontal", i1, j1]);   //the perpendicular wall to the left
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

        placedWalls.push(["horizontal", i1, j1, activePlayer]);
        wallsNotToPlace.push(["horizontal", i2, j2]);   //the wall to the right
        wallsNotToPlace.push(["horizontal", i1 - 1, j1]);   //the wall to the left
        wallsNotToPlace.push(["vertical", i1, j1]);     //the perpendicular wall to the top
        wall2 = document.querySelector(`.horizontalWall[data-i="${i2}"][data-j="${j2}"]`);
        wall3 = document.querySelector(`.horizontalWall[data-i="${i1 - 1}"][data-j="${j2}"]`);
        wall4 = document.querySelector(`.verticalWall[data-i="${i1}"][data-j="${j1}"]`);
    }


    //check if placing the wall would block any player
    let ncP1 = notCirclesPlayers([], positionPlayer1[0], positionPlayer1[1], PLAYER1);
    let ncP2 = notCirclesPlayers([], positionPlayer2[0], positionPlayer2[1], PLAYER2);
    if (!ncP1 || !ncP2) {
        console.log("The player can't reach the end anymore. The move is invalid");
        if (i1 === i2) {
            // Vertical wall
            visionBoard[j1][i1] -= WALL_RIGHT;
            visionBoard[j2][i2] -= WALL_RIGHT;

            visionBoard[j1][i1 + 1] -= WALL_LEFT;
            visionBoard[j2][i2 + 1] -= WALL_LEFT;

            //remove the coordinates from the wallsNotToPlace array
            removeMatchingWall(placedWalls, "vertical", i1, j1);
            removeMatchingWall(wallsNotToPlace, "vertical", i2, j2);
            removeMatchingWall(wallsNotToPlace, "vertical", i1, j1 - 1);
            removeMatchingWall(wallsNotToPlace, "horizontal", i1, j1);

        } else {
            // Horizontal wall
            visionBoard[j1][i1] -= WALL_BOTTOM;
            visionBoard[j2][i2] -= WALL_BOTTOM;

            visionBoard[j1 + 1][i1] -= WALL_TOP;
            visionBoard[j2 + 1][i2] -= WALL_TOP;

            // remove the coordinates from the wallsNotToPlace array
            removeMatchingWall(placedWalls, "horizontal", i1, j1);
            removeMatchingWall(wallsNotToPlace, "horizontal", i2, j2);
            removeMatchingWall(wallsNotToPlace, "horizontal", i1 - 1, j1);
            removeMatchingWall(wallsNotToPlace, "vertical", i1, j1);

        }
        return;
    }

    function isMatchingWall(wall, type, i, j) {
        return wall[0] === type && wall[1] === i && wall[2] === j;
    }

    function removeMatchingWall(arr, type, i, j) {
        const indexToRemove = arr.findIndex(wall => isMatchingWall(wall, type, i, j));
        if (indexToRemove !== -1) {
            arr.splice(indexToRemove, 1);
        }
    }


    const svg = document.querySelector('svg');

    if (activePlayer === PLAYER1) {
        displayOverlay();
        newWall.setAttribute("fill", "#00FF00");
        updateVisionWall(i1, j1,i2,j2, 1);
        activePlayer = PLAYER2;
        wallLeftP1--;

    } else {
        displayOverlay();
        newWall.setAttribute("fill", "#0000FF");
        updateVisionWall(i1, j1,i2,j2, -1);
        activePlayer = PLAYER1;
        wallLeftP2--;

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
    //console.log(visionBoard.map(row => row.map(cell => cell.toString(2).padStart(16, "0")).join(" ")).join("\n"));
    //console.log(wallsNotToPlace);
    updateGrid();
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
    if ((board[i][j] & VISIONMASK)===0b111)
        return;
    else if (!(board[i][j] & VISIONMASK)){
        if (board[i][j] & NEGMASK)
            board[i][j] -=NEGMASK;
        if (value < 0){
            board[i][j] += 1;
            board[i][j] += NEGMASK;
        }
        else{
            board[i][j] += 1;
        }
    }
    else if (board[i][j] & NEGMASK){
        if (value > 0)
            board[i][j] -= 1;
        else
            board[i][j] += 1;
    }
    else{
        if (value>0)
            board[i][j] += 1;
        else
            board[i][j] -= 1;
    }
    if (value > 1) {
        calculateVision(board, i, j, value-1);
    }
    else if(value < -1){
        calculateVision(board, i, j, value+1);
    }
}

function handlePlayerClick(i, j) {
    validMove(i, j);

}

function handlePlayerClickWallHorizontal(i, j) {
    wall.setAttribute("fill", isHover ? "#000000" : "#ffffffff");

}

function validMove(i, j) {
    if(activePlayer === PLAYER1) {
        //prevent the player to move on an illegal cell or on a cell separated with a wall
        //console.log(positionPlayer2[0] !== i || positionPlayer2[1] !== j);
        if (positionPlayer2[0] !== i || positionPlayer2[1] !== j) {
            if (positionPlayer1[0] === i - 1 && positionPlayer1[1] === j || positionPlayer1[0] === i + 1 && positionPlayer1[1] === j || positionPlayer1[0] === i && positionPlayer1[1] === j - 1 || positionPlayer1[0] === i && positionPlayer1[1] === j + 1) {
                //console.log("oui"); // rentre pas ici
                if (checkPresenceWall(i, j, activePlayer)) {
                    visionBoard[positionPlayer1[1]][positionPlayer1[0]] -= PLAYER1;
                    updatePlayerVision(positionPlayer1[1], positionPlayer1[0], -1)
                    positionPlayer1[0] = i;
                    positionPlayer1[1] = j;
                    updatePiecePosition(PLAYER1, positionPlayer1[0], positionPlayer1[1]);
                    updatePlayerVision(positionPlayer1[1], positionPlayer1[0], 1)

                    activePlayer = PLAYER2;
                    updateGrid();
                    displayOverlay();
                }
            }
        }
        //partie pour bouger ton pion au dessus du pion de l'adversaire
        else {
            let iP2MinusP1=positionPlayer2[0]-positionPlayer1[0];
            let jP2MinusP1=positionPlayer2[1]-positionPlayer1[1];
            if(iP2MinusP1===0){
                if(positionPlayer2[1]+jP2MinusP1===j){
                    if(checkPresenceWall(i, j,activePlayer))
                    {
                        visionBoard[positionPlayer1[1]][positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(positionPlayer1[1], positionPlayer1[0], -1)
                        positionPlayer1[0] = i;
                        positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, positionPlayer1[0], positionPlayer1[1]);
                        updatePlayerVision(positionPlayer1[1], positionPlayer1[0], 1)
                        activePlayer = PLAYER2;
                        updateGrid();
                        displayOverlay();
                    }
                }
            }
            else if(jP2MinusP1===0){
                if(positionPlayer2[0]+iP2MinusP1===i){
                    if(checkPresenceWall(i, j,activePlayer))
                    {
                        visionBoard[positionPlayer1[1]][positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(positionPlayer1[1], positionPlayer1[0], -1)
                        positionPlayer1[0] = i;
                        positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, positionPlayer1[0], positionPlayer1[1]);
                        updatePlayerVision(positionPlayer1[1], positionPlayer1[0], 1)

                        activePlayer = PLAYER2;
                        updateGrid();
                        displayOverlay();
                    }
                }
            }
        }
    }
    else if(activePlayer === PLAYER2 ) {
        if (positionPlayer1[0] !== i || positionPlayer1[1] !== j) {
            if (positionPlayer2[0] === i - 1 && positionPlayer2[1] === j || positionPlayer2[0] === i + 1 && positionPlayer2[1] === j || positionPlayer2[0] === i && positionPlayer2[1] === j - 1 || positionPlayer2[0] === i && positionPlayer2[1] === j + 1) {
                //console.log("oui2");
                if (checkPresenceWall(i, j, activePlayer)) {
                    visionBoard[positionPlayer2[1]][positionPlayer2[0]] -= PLAYER2;
                    updatePlayerVision(positionPlayer2[1], positionPlayer2[0], 1)
                    positionPlayer2[0] = i;
                    positionPlayer2[1] = j;
                    updatePiecePosition(PLAYER2, positionPlayer2[0], positionPlayer2[1]);
                    updatePlayerVision(positionPlayer2[1], positionPlayer2[0], -1)

                    activePlayer = PLAYER1;
                    updateGrid();
                    displayOverlay();
                }
            }
        }
        else {
            let iP1MinusP2=positionPlayer1[0]-positionPlayer2[0];
            let jP1MinusP2=positionPlayer1[1]-positionPlayer2[1];
            if(iP1MinusP2===0){
                if(positionPlayer1[1]+jP1MinusP2===j){
                    if(checkPresenceWall(i, j, activePlayer))
                    {
                        visionBoard[positionPlayer2[1]][positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(positionPlayer2[1], positionPlayer2[0], 1)
                        positionPlayer2[0] = i;
                        positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, positionPlayer2[0], positionPlayer2[1]);
                        updatePlayerVision(positionPlayer2[1], positionPlayer2[0], -1)

                        activePlayer = PLAYER1;
                        updateGrid();
                        displayOverlay();
                    }
                }
            }
            else if(jP1MinusP2===0){
                if(positionPlayer1[0]+iP1MinusP2===i){
                    if(checkPresenceWall(i, j, activePlayer))
                    {
                        visionBoard[positionPlayer2[1]][positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(positionPlayer2[1], positionPlayer2[0], 1)
                        positionPlayer2[0] = i;
                        positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, positionPlayer2[0], positionPlayer2[1]);
                        updatePlayerVision(positionPlayer2[1], positionPlayer2[0], -1)

                        activePlayer = PLAYER1;
                        updateGrid();
                        displayOverlay();
                    }
                }
            }
        }
    }
}
function checkPresenceWall(i,j, player){
    let iSub;
    let jSub;
    let posOpponent;
    if(player === PLAYER1) {
        iSub = i - positionPlayer1[0];
        jSub = j - positionPlayer1[1];
        posOpponent=visionBoard[positionPlayer2[1]][positionPlayer2[0]];
    }
    else if(player === PLAYER2) {
        iSub = i - positionPlayer2[0];
        jSub = j - positionPlayer2[1];
        posOpponent=visionBoard[positionPlayer1[1]][positionPlayer1[0]];
    }
    if(jSub===0){

        switch (iSub) {
            case -1:
                if(visionBoard[j][i] & WALL_RIGHT){
                    return false;
                }
                break;
            case -2:
                if(visionBoard[j][i] & WALL_RIGHT || posOpponent & WALL_RIGHT){
                    return false;
                }
                break;
            case 1:
                if(visionBoard[j][i] & WALL_LEFT){
                    return false;
                }
                break;
            case 2:
                if(visionBoard[j][i] & WALL_LEFT || posOpponent & WALL_LEFT){
                    return false;
                }
            default:
        }
        return true;

    }
    if(iSub===0){
        switch (jSub) {
            case -1:
                if(visionBoard[j][i] & WALL_BOTTOM){
                    return false;
                }
                break;
            case -2:
                if((visionBoard[j][i] & WALL_BOTTOM) || (posOpponent & WALL_BOTTOM)){
                    return false;
                }
                break;
            case 1:
                if(visionBoard[j][i] & WALL_TOP){
                    return false;
                }
                break;
            case 2:
                if(visionBoard[j][i] & WALL_TOP || posOpponent & WALL_TOP){
                    return false;
                }
                break;
            default:
        }
        return true;

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
    document.getElementById('wallLeftP1').textContent = wallLeftP1.toString();
    document.getElementById('wallLeftP2').textContent = wallLeftP2.toString();
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

 */