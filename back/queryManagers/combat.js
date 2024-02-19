

import { setup, nextMove,updateBoard } from "./G.js";

var ownPlayer = 1;
var opponentPlayer =2;
var PlayingTurn = 1;
let gameState = {
    opponentWalls: [],
    ownWalls: [["42", 0]], // Example wall placement
    board: [
        [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
        [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
        [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
        [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
        [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
        [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
        [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
        [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
    ],
};

(async () => {
    try {
        let startingPos;
        console.time("setup");
        startingPos = await setup(ownPlayer);
        console.timeEnd("setup");
        console.log(startingPos);
        let col = parseInt(startingPos[0], 10);
        let row = parseInt(startingPos[1], 10);
        gameState.board[col - 1][row - 1] = ownPlayer;
        console.time("setup");
        let startingPos2 = await setup2(opponentPlayer);
        console.timeEnd("setup");
        console.log(startingPos2);
        let col2 = parseInt(startingPos2[0], 10);
        let row2 = parseInt(startingPos2[1], 10);
        gameState.board[col2 - 1][row2 - 1] = opponentPlayer;
        for (let i = 0; i < 20; i++) {
            console.log("turn",i);
            if (PlayingTurn == 1) {
                console.log("player 1 move", i);
                console.time("nextMove");
                let move = await nextMove(gameState);
                console.timeEnd("nextMove");
                if (move.action == "move") {
                    console.log("SELECTED : MOVE");
                    console.log(move);
                    console.log(col,row);
                    gameState.board[col - 1][row - 1] = 0;
                    col = parseInt(move.value[0], 10);
                    row = parseInt(move.value[1], 10);
                    gameState.board[col - 1][row - 1] = ownPlayer;
                } else if (move.action == "wall") {
                    console.log("SELECTED : WALL");
                    gameState.ownWalls.push(move.value);
                }
                PlayingTurn = 2;
            } else {
                console.log("player 2 move", i);

                console.time("nextMove");

                let move2 = await nextMove2(gameState);
                console.log("ca marche8");

                console.timeEnd("nextMove");
                console.log("on joue!", move2.action)
                if (move2.action == "move") {
                    console.log("SELECTED : MOVE");
                    console.log(move2);
                    gameState.board[col2 - 1][row2 - 1] = 0;
                    col2 = parseInt(move2.value[0], 10);
                    row2 = parseInt(move2.value[1], 10);

                    gameState.board[col2 - 1][row2 - 1] = opponentPlayer;
                } else if (move2.action == "wall") {
                    console.log("ca marche9");
                    console.log("SELECTED : WALL");
                    gameState.opponentWalls.push(move2.value);
                }
                PlayingTurn = 1;
                console.log("aller on recommence !")
            }
        }
    } catch (err) {
        console.log(err);
    }
})();