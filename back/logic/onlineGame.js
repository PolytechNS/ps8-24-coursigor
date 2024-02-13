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


class GameState {
    constructor(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, activePlayer, wallsLeftP1, wallsLeftP2) {
        this.wallsNotToPlace = wallsNotToPlace;
        this.placedWalls = placedWalls;
        this.visionBoard = visionBoard;
        this.positionPlayer1 = positionPlayer1;
        this.positionPlayer2 = positionPlayer2;
        this.activePlayer = activePlayer;
        this.wallsLeftP1 = wallsLeftP1;
        this.wallsLeftP2 = wallsLeftP2;
    }
}





function newGame(socketId) {
    console.log('new game: ' + socketId);

    games[socketId] = new GameState(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, PLAYER1, 10, 10);
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

function nextMove(id, move) {
    console.log('nextMove: ' + move);

    let gameState = games[id];

    // move est de type [string, int, int]
    if (move[0] === "cell") {
        //TODO
    }
    else if (move[0] === "horizontal") {
        //TODO
    }
    else if (move[0] === "vertical") {
        //TODO
    }
    else {
        //TODO
    }
}
exports.nextMove = nextMove;