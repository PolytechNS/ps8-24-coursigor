const io = require("../index.js").io;

const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
const NEGMASK =0b1000
const VISIONMASK = 0b111

// dictionary of games
let games = {};


// initial game state
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

visionBoard[positionPlayer1[1]][positionPlayer1[0]] += PLAYER1;
visionBoard[positionPlayer2[1]][positionPlayer2[0]] += PLAYER2;

let numberOfTurns = 0;


class GameState {
    constructor(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, activePlayer, wallsLeftP1, wallsLeftP2, numberOfTurns) {
        this.wallsNotToPlace = wallsNotToPlace;
        this.placedWalls = placedWalls;
        this.visionBoard = visionBoard;
        this.positionPlayer1 = positionPlayer1;
        this.positionPlayer2 = positionPlayer2;
        this.activePlayer = activePlayer;
        this.wallsLeftP1 = wallsLeftP1;
        this.wallsLeftP2 = wallsLeftP2;
        this.numberOfTurns = numberOfTurns;
    }
}





function newGame(socketId) {
    console.log('new game: ' + socketId);

    games[socketId] = new GameState(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, PLAYER1, 10, 10, numberOfTurns);
    console.log(games);

    sendGameState(socketId);
}
exports.newGame = newGame;

function sendGameState(id) {
    console.log('sendGameState: ' + id);
    let gameState = games[id];
    // make gameState into a json to send it to the client

    let socket = io.of("/api/onlineGame").sockets.get(id);
    //socket of id id sends the gameState to the client
    socket.emit('updateGrid', gameState);
}

function sendInvalidMove(id, message) {
    let socket = io.of("/api/onlineGame").sockets.get(id);
    socket.emit('invalidMove', message);

}

function nextMove(id, move) {
    // move contains the type of move as a string and a pair of coordinates
    console.log('nextMove: ' + move);
    let moves = move.split(",");
    moves[1] = parseInt(moves[1]);
    moves[2] = parseInt(moves[2]);

    let gameState = games[id];
    let activePlayer = gameState.activePlayer;
    let wallsLeftP1 = gameState.wallsLeftP1;
    let wallsLeftP2 = gameState.wallsLeftP2;
    let positionPlayer1 = gameState.positionPlayer1;
    let positionPlayer2 = gameState.positionPlayer2;
    let visionBoard = gameState.visionBoard;
    let placedWalls = gameState.placedWalls;
    let wallsNotToPlace = gameState.wallsNotToPlace;
    let numberOfTurns = gameState.numberOfTurns;


    // move est de type [string, int, int]
    if (moves[0] === "cell") {
        //TODO
    }
    else if (moves[0] === "horizontal") {
        console.log('horizontal', moves[1], moves[2]);
        let i1 = moves[1];
        let j1 = moves[2];
        let i2 = i1 + 1;
        let j2 = j1;

        visionBoard[j1][i1] += WALL_BOTTOM;
        visionBoard[j2][i2] += WALL_BOTTOM;

        visionBoard[j1 + 1][i1] += WALL_TOP;
        visionBoard[j2 + 1][i2] += WALL_TOP;

        placedWalls.push(["horizontal", i1, j1, activePlayer]);
        wallsNotToPlace.push(["horizontal", i2, j2]);   //the wall to the right
        wallsNotToPlace.push(["horizontal", i1 - 1, j1]);   //the wall to the left
        wallsNotToPlace.push(["vertical", i1, j1]);     //the perpendicular wall to the top

        let ncP1 = notCirclesPlayers([], positionPlayer1[0], positionPlayer1[1], PLAYER1);
        let ncP2 = notCirclesPlayers([], positionPlayer2[0], positionPlayer2[1], PLAYER2);


        if (!ncP1 || !ncP2) {
            console.log("The player can't reach the end anymore. The move is invalid");

            visionBoard[j1][i1] -= WALL_BOTTOM;
            visionBoard[j2][i2] -= WALL_BOTTOM;

            visionBoard[j1 + 1][i1] -= WALL_TOP;
            visionBoard[j2 + 1][i2] -= WALL_TOP;

            // remove the coordinates from the wallsNotToPlace array
            removeMatchingWall(placedWalls, "horizontal", i1, j1);
            removeMatchingWall(wallsNotToPlace, "horizontal", i2, j2);
            removeMatchingWall(wallsNotToPlace, "horizontal", i1 - 1, j1);
            removeMatchingWall(wallsNotToPlace, "vertical", i1, j1);

            sendInvalidMove(id, "The player can't reach the end anymore. The move is invalid");
        }

        if (activePlayer === PLAYER1) {
            updateVisionWall(i1, j1,i2,j2, 1);
            activePlayer = PLAYER2;
            wallsLeftP1--;
            numberOfTurns++;

        } else {
            updateVisionWall(i1, j1,i2,j2, -1);
            activePlayer = PLAYER1;
            wallsLeftP2--;
            numberOfTurns++;
        }

        sendGameState(id);
    }
    else if (moves[0] === "vertical") {
        console.log('vertical', moves[1], moves[2]);
        let i1 = moves[1];
        let j1 = moves[2];
        let i2 = i1;
        let j2 = j1 + 1;

        visionBoard[j1][i1] += WALL_RIGHT;
        visionBoard[j2][i2] += WALL_RIGHT;

        visionBoard[j1][i1 + 1] += WALL_LEFT;
        visionBoard[j2][i2 + 1] += WALL_LEFT;

        placedWalls.push(["vertical", i1, j1, activePlayer]);
        wallsNotToPlace.push(["vertical", i2, j2]);     //the wall to the bottom
        wallsNotToPlace.push(["vertical", i1, j1 - 1]);   //the wall to the top
        wallsNotToPlace.push(["horizontal", i1, j1]);   //the perpendicular wall to the left


        let ncP1 = notCirclesPlayers([], positionPlayer1[0], positionPlayer1[1], PLAYER1);
        let ncP2 = notCirclesPlayers([], positionPlayer2[0], positionPlayer2[1], PLAYER2);


        if (!ncP1 || !ncP2) {
            console.log("The player can't reach the end anymore. The move is invalid");
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

            sendInvalidMove(id, "The player can't reach the end anymore. The move is invalid");
        }

        if (activePlayer === PLAYER1) {
            updateVisionWall(i1, j1,i2,j2, 1);
            activePlayer = PLAYER2;
            wallsLeftP1--;
            numberOfTurns++;

        } else {
            updateVisionWall(i1, j1,i2,j2, -1);
            activePlayer = PLAYER1;
            wallsLeftP2--;
            numberOfTurns++;
        }

        sendGameState(id);
    }
    else {
        //TODO
    }
}
exports.nextMove = nextMove;


function isMatchingWall(wall, type, i, j) {
    return wall[0] === type && wall[1] === i && wall[2] === j;
}

function removeMatchingWall(arr, type, i, j) {
    const indexToRemove = arr.findIndex(wall => isMatchingWall(wall, type, i, j));
    if (indexToRemove !== -1) {
        arr.splice(indexToRemove, 1);
    }
}

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