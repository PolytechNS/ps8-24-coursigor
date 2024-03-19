// const {tokenCache} = require("mongodb/src/client-side-encryption/providers/azure");
const {AI, AIGameState} = require("../queryManagers/G.js");
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
let ais = {};

class GameState {
    constructor(token) {
        this.token = token;
        this.wallsNotToPlace = [];
        this.placedWalls = [];
        this.visionBoard = [  [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
            [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
            [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
            [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
            [0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
            [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
            [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
            [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
            [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1]];
        this.positionPlayer1 = [4, 8];
        this.positionPlayer2 = [4, 0];
        this.activePlayer = PLAYER1;
        this.wallsLeftP1 = 10;
        this.wallsLeftP2 = 10;
        this.numberOfTurns = 0;

        this.visionBoard[this.positionPlayer1[1]][this.positionPlayer1[0]] += PLAYER1;
        this.visionBoard[this.positionPlayer2[1]][this.positionPlayer2[0]] += PLAYER2;
        updatePlayerVision(this.positionPlayer1[1], this.positionPlayer1[0], 1, this.visionBoard);
        updatePlayerVision(this.positionPlayer2[1], this.positionPlayer2[0], -1, this.visionBoard);
    }
}





function newGame(socketId, token) {
    console.log('new game: socket : ' + socketId + " token : " + token);
    games[token] = new GameState(token);
    ais[token] = new AI();
    //sets ai as player 2
    ais[token].setup(2);
    games[socketId] = games[token];
    ais[socketId] = ais[token];
    console.log(games);

    sendGameState(socketId);
}
exports.newGame = newGame;

//removes socket from the games dictionary as the game is saved under the token
function removeSocket(socketId) {
    games[socketId] = undefined;
    ais[socketId] = undefined;
}
exports.removeSocket = removeSocket;


function loadGame(socketId, token) {
    if (games[token] == undefined) {
        return;
    }
    games[socketId] = games[token];
    ais[socketId] = ais[token];
    sendGameState(socketId);
}
exports.loadGame = loadGame;

function sendGameState(id) {
    console.log('sendGameState: ' + id);
    let gameState = games[id];
    // make gameState into a json to send it to the client

    let socket = io.of("/api/onlineGame").sockets.get(id);
    //socket of id id sends the gameState to the client
    socket.emit('updateGrid', gameState);
}

function sendEndOfGame(id, player) {
    let socket = io.of("/api/onlineGame").sockets.get(id);
    socket.emit("gameOver", player);

    // games[games[id].token] = undefined;
    // games[id] = undefined;

}

function sendInvalidMove(id, message) {
    let socket = io.of("/api/onlineGame").sockets.get(id);
    socket.emit('invalidMove', message);

}

function nextMove(id, move) {
    // move contains the type of move as a string and a pair of coordinates
    console.log('nextMove: ' + move);
    // move is ["type, i, j"]
    let moves = move.split(",");
    moves[1] = parseInt(moves[1]);
    moves[2] = parseInt(moves[2]);

    // let gameState = games[id];
    // let activePlayer = gameState.activePlayer;
    // let wallsLeftP1 = gameState.wallsLeftP1;
    // let wallsLeftP2 = gameState.wallsLeftP2;
    // let positionPlayer1 = gameState.positionPlayer1;
    // let positionPlayer2 = gameState.positionPlayer2;
    // let visionBoard = gameState.visionBoard;
    // let placedWalls = gameState.placedWalls;
    // let wallsNotToPlace = gameState.wallsNotToPlace;
    // let numberOfTurns = gameState.numberOfTurns;



    if (moves[0] === "cell") {
        if (validMove(id, moves[1], moves[2])) {
        }
        else {
            sendInvalidMove(id, "You cannot reach there. The move is invalid");
            return;
        }
    }
    else if (moves[0] === "horizontal") {
        if (validHorizontalWall(id, moves)) {
        }
        else {
            sendInvalidMove(id, "The player can't reach the end anymore. The move is invalid");
            return;
        }
    }
    else if (moves[0] === "vertical") {
        if (validVerticalWall(id, moves)) {
        }
        else {
            sendInvalidMove(id, "The player can't reach the end anymore. The move is invalid");
            return;
        }
    }
    else {
        sendInvalidMove(id, "Type of move not recognized");
        return;
    }

    //plays for the AI
    let placedWalls = games[id].placedWalls;
    let placedWallsP1 = [];
    let placedWallsP2 = [];
    for (let i = 0; i < placedWalls.length; i++) {
        if (placedWalls[i][3] === PLAYER1) {
            placedWallsP1.push(placedWalls[i]);
        }
        else {
            placedWallsP2.push(placedWalls[i]);
        }
    }
    let aiGameState = new AIGameState(placedWallsP1, placedWallsP2, games[id].visionBoard);
    let aiMove = ais[id].nextMove(aiGameState);
    //wait for the promise to resolve
    aiMove.then((move) => {
        console.log("AI move: ", move);



        if (move.action === "move") {
            if (validMove(id, move.value[0].split(""))){
            }
            else {
                games[id].activePlayer = PLAYER1;   //change the active player back to the human player to skip ai broken move
            }
            sendGameState(id);
        }

        //horizontal wall
        else if (move.value[1] === 0) {
            let aiMoves = [];
            aiMoves.push("horizontal");
            let coordinates = move.value[0].split("");
            aiMoves.push(parseInt(coordinates[0]) - 1);
            aiMoves.push(parseInt(coordinates[1]) - 1);
            if (validHorizontalWall(id, aiMoves)) {
            }
            else {
                games[id].activePlayer = PLAYER1;   //change the active player back to the human player to skip ai broken move
            }
            sendGameState(id);
        }
        //vertical wall
        else if (move.value[1] === 1) {
            let aiMoves = [];
            aiMoves.push("vertical");
            let coordinates = move.value[0].split("");
            aiMoves.push(parseInt(coordinates[0]) - 1);
            aiMoves.push(parseInt(coordinates[1]) - 1);
            if (validVerticalWall(id, aiMoves)) {
            }
            else {
                games[id].activePlayer = PLAYER1;   //change the active player back to the human player to skip ai broken move
            }
            sendGameState(id);
        }
        else {
            games[id].activePlayer = PLAYER1;   //change the active player back to the human player to skip ai broken move
            sendGameState(id);
        }
    });

    function transformMove(aiMove) {
        const { action, value } = aiMove;
        let result = [];

        if (aiMove.action === "move") {
            result.push("cell");
            result.push(value[0].split(""));
        } else if (action === "wall") {
            const [coordinates, orientation] = value;
            if (orientation === 0) {
                result.push("horizontal");
            } else if (orientation === 1) {
                result.push("vertical");
            }
            result.push(coordinates.split(""));
            console.log(result);
        }
        return result;
    }
}
exports.nextMove = nextMove;


function validHorizontalWall(id, moves) {
    console.log('horizontal', moves[1], moves[2]);
    let gameState = games[id];
    let i1 = moves[1];
    let j1 = moves[2];
    let i2 = i1 + 1;
    let j2 = j1;

    gameState.visionBoard[j1][i1] += WALL_BOTTOM;
    gameState.visionBoard[j2][i2] += WALL_BOTTOM;

    gameState.visionBoard[j1 + 1][i1] += WALL_TOP;
    gameState.visionBoard[j2 + 1][i2] += WALL_TOP;

    gameState.placedWalls.push(["horizontal", i1, j1, gameState.activePlayer]);
    gameState.wallsNotToPlace.push(["horizontal", i2, j2]);   //the wall to the right
    gameState.wallsNotToPlace.push(["horizontal", i1 - 1, j1]);   //the wall to the left
    gameState.wallsNotToPlace.push(["vertical", i1, j1]);     //the perpendicular wall to the top

    let ncP1 = notCirclesPlayers([], gameState.positionPlayer1[0], gameState.positionPlayer1[1], PLAYER1, gameState.visionBoard);
    let ncP2 = notCirclesPlayers([], gameState.positionPlayer2[0], gameState.positionPlayer2[1], PLAYER2, gameState.visionBoard);


    if (!ncP1 || !ncP2) {
        console.log("The player can't reach the end anymore. The move is invalid");

        gameState.visionBoard[j1][i1] -= WALL_BOTTOM;
        gameState.visionBoard[j2][i2] -= WALL_BOTTOM;

        gameState.visionBoard[j1 + 1][i1] -= WALL_TOP;
        gameState.visionBoard[j2 + 1][i2] -= WALL_TOP;

        // remove the coordinates from the wallsNotToPlace array
        removeMatchingWall(gameState.placedWalls, "horizontal", i1, j1);
        removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i2, j2);
        removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i1 - 1, j1);
        removeMatchingWall(gameState.wallsNotToPlace, "vertical", i1, j1);

        return false;
    }

    if (gameState.activePlayer === PLAYER1) {
        updateVisionWall(gameState.visionBoard, i1, j1, i2, j2, 1);
        gameState.activePlayer = PLAYER2;
        gameState.wallsLeftP1--;
        gameState.numberOfTurns++;
        console.log("Changed active player : ", gameState.activePlayer);

    } else {
        updateVisionWall(gameState.visionBoard, i1, j1, i2, j2, -1);
        gameState.activePlayer = PLAYER1;
        gameState.wallsLeftP2--;
        gameState.numberOfTurns++;
        console.log("Changed active player : ", gameState.activePlayer);
    }

    return true;
}

function validVerticalWall(id, moves) {
    console.log('vertical', moves[1], moves[2]);
    let gameState = games[id];
    let i1 = moves[1];
    let j1 = moves[2];
    let i2 = i1;
    let j2 = j1 + 1;

    gameState.visionBoard[j1][i1] += WALL_RIGHT;
    gameState.visionBoard[j2][i2] += WALL_RIGHT;

    gameState.visionBoard[j1][i1 + 1] += WALL_LEFT;
    gameState.visionBoard[j2][i2 + 1] += WALL_LEFT;

    gameState.placedWalls.push(["vertical", i1, j1, gameState.activePlayer]);
    gameState.wallsNotToPlace.push(["vertical", i2, j2]);     //the wall to the bottom
    gameState.wallsNotToPlace.push(["vertical", i1, j1 - 1]);   //the wall to the top
    gameState.wallsNotToPlace.push(["horizontal", i1, j1]);   //the perpendicular wall to the left


    let ncP1 = notCirclesPlayers([], gameState.positionPlayer1[0], gameState.positionPlayer1[1], PLAYER1, gameState.visionBoard);
    let ncP2 = notCirclesPlayers([], gameState.positionPlayer2[0], gameState.positionPlayer2[1], PLAYER2, gameState.visionBoard);


    if (!ncP1 || !ncP2) {
        console.log("The player can't reach the end anymore. The move is invalid");
        // Vertical wall
        gameState.visionBoard[j1][i1] -= WALL_RIGHT;
        gameState.visionBoard[j2][i2] -= WALL_RIGHT;

        gameState.visionBoard[j1][i1 + 1] -= WALL_LEFT;
        gameState.visionBoard[j2][i2 + 1] -= WALL_LEFT;

        //remove the coordinates from the wallsNotToPlace array
        removeMatchingWall(gameState.placedWalls, "vertical", i1, j1);
        removeMatchingWall(gameState.wallsNotToPlace, "vertical", i2, j2);
        removeMatchingWall(gameState.wallsNotToPlace, "vertical", i1, j1 - 1);
        removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i1, j1);

        return false;
    }

    if (gameState.activePlayer === PLAYER1) {
        updateVisionWall(gameState.visionBoard, i1, j1,i2,j2, 1);
        gameState.activePlayer = PLAYER2;
        gameState.wallsLeftP1--;
        gameState.numberOfTurns++;
        console.log("Changed active player : ", gameState.activePlayer);

    } else {
        updateVisionWall(gameState.visionBoard, i1, j1,i2,j2, -1);
        gameState.activePlayer = PLAYER1;
        gameState.wallsLeftP2--;
        gameState.numberOfTurns++;
        console.log("Changed active player : ", gameState.activePlayer);
    }

    return true;
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

function notCirclesPlayers(alreadyChecked, i, j, player, visionBoard) {
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

    console.log(visionBoard);

    if (!(visionBoard[j][i] & WALL_TOP)) {
        top = notCirclesPlayers(alreadyChecked, i, j - 1, player, visionBoard);
    }
    if (!(visionBoard[j][i] & WALL_BOTTOM)) {
        bottom = notCirclesPlayers(alreadyChecked, i, j + 1, player, visionBoard);
    }
    if (!(visionBoard[j][i] & WALL_LEFT)) {
        left = notCirclesPlayers(alreadyChecked, i - 1, j, player, visionBoard);
    }
    if (!(visionBoard[j][i] & WALL_RIGHT)) {
        right = notCirclesPlayers(alreadyChecked, i + 1, j, player, visionBoard);
    }

    return top || bottom || left || right;
}


function updateVisionWall(visionBoard, i1, j1,i2,j2, value) {
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


function validMove(id, i, j) {
    let gameState = games[id];
    if(gameState.activePlayer === PLAYER1) {
        //prevent the player to move on an illegal cell or on a cell separated with a wall
        //console.log(positionPlayer2[0] !== i || positionPlayer2[1] !== j);
        if (gameState.positionPlayer2[0] !== i || gameState.positionPlayer2[1] !== j) {
            if (gameState.positionPlayer1[0] === i - 1 && gameState.positionPlayer1[1] === j || gameState.positionPlayer1[0] === i + 1 && gameState.positionPlayer1[1] === j || gameState.positionPlayer1[0] === i && gameState.positionPlayer1[1] === j - 1 || gameState.positionPlayer1[0] === i && gameState.positionPlayer1[1] === j + 1) {
                //console.log("oui"); // rentre pas ici
                if (checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2)) {
                    gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;
                    updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                    gameState.positionPlayer1[0] = i;
                    gameState.positionPlayer1[1] = j;
                    updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                    updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);

                    gameState.activePlayer = PLAYER2;
                    return true;
                }
            }
        }
        //partie pour bouger ton pion au dessus du pion de l'adversaire
        else {
            let iP2MinusP1= gameState.positionPlayer2[0] - gameState.positionPlayer1[0];
            let jP2MinusP1= gameState.positionPlayer2[1] - gameState.positionPlayer1[1];
            if(iP2MinusP1===0){
                if(gameState.positionPlayer2[1] + jP2MinusP1 === j){
                    if(checkPresenceWall(i, j,gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                        gameState.positionPlayer1[0] = i;
                        gameState.positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);
                        gameState.activePlayer = PLAYER2;
                        return true;
                    }
                }
            }
            else if(jP2MinusP1===0){
                if(gameState.positionPlayer2[0] + iP2MinusP1 === i){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                        gameState.positionPlayer1[0] = i;
                        gameState.positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER2;
                        return true;
                    }
                }
            }
        }
    }
    else if(gameState.activePlayer === PLAYER2 ) {
        if (gameState.positionPlayer1[0] !== i || gameState.positionPlayer1[1] !== j) {
            if (gameState.positionPlayer2[0] === i - 1 && gameState.positionPlayer2[1] === j || gameState.positionPlayer2[0] === i + 1 && gameState.positionPlayer2[1] === j || gameState.positionPlayer2[0] === i && gameState.positionPlayer2[1] === j - 1 || gameState.positionPlayer2[0] === i && gameState.positionPlayer2[1] === j + 1) {
                //console.log("oui2");
                if (checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2)) {
                    gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                    updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                    gameState.positionPlayer2[0] = i;
                    gameState.positionPlayer2[1] = j;
                    updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                    updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                    gameState.activePlayer = PLAYER1;
                    return true;
                }
            }
        }
        else {
            let iP1MinusP2=gameState.positionPlayer1[0]-gameState.positionPlayer2[0];
            let jP1MinusP2=gameState.positionPlayer1[1]-gameState.positionPlayer2[1];
            if(iP1MinusP2===0){
                if(gameState.positionPlayer1[1]+jP1MinusP2===j){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                        gameState.positionPlayer2[0] = i;
                        gameState.positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER1;
                        return true;
                    }
                }
            }
            else if(jP1MinusP2===0){
                if(gameState.positionPlayer1[0]+iP1MinusP2===i){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                        gameState.positionPlayer2[0] = i;
                        gameState.positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER1;
                        return true;
                    }
                }
            }
        }
    }
}

function checkPresenceWall(i,j, player, visionBoard, positionPlayer1, positionPlayer2){
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
function updatePiecePosition(player, i, j, visionBoard) {
    if (player === PLAYER1) {
        visionBoard[j][i] += PLAYER1;
    }
    else if (player === PLAYER2) {
        visionBoard[j][i] += PLAYER2;
    }
}
function checkVictoryCondition(id, positionPlayer1, positionPlayer2) {
    if(positionPlayer1[1]===0){
        console.log("player 1 wins");
        sendEndOfGame(id, PLAYER1);
        return;
    }
    if(positionPlayer2[1]===8){
        console.log("player 2 wins");
        sendEndOfGame(id, PLAYER2);
        return;
    }
}

function updatePlayerVision(i, j, value, visionBoard) {
    calculateVision(visionBoard, i, j, value);
    calculateVision(visionBoard,i+1, j, value);
    calculateVision(visionBoard,i-1,j, value);
    calculateVision(visionBoard, i, j+1, value);
    calculateVision(visionBoard, i, j-1, value);
}