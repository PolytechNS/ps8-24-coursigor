import { GameState, Move } from './Classes';

var whichPlayer = 0;

function setup(AIplay) {
    return new Promise((resolve, reject) => {   
        if (AIplay == 1){
            whichPlayer = 1;
            resolve( "[4,0]");
        }
        else {
            
            resolve("[4,8]");
        }
        setTimeout(() => {
            reject('timeout');
        }, 1000);
    });
}

function nextMove(gameState) {
    return new Promise ((resolve, reject) => {
    for (var i=0; i<9; i++){
        for (j=0; j<9; j++){
            resolve(whatToDo(whichPlayer, gameState));
        }
    }
    setTimeout(() => {
        reject('timeout');
    }, 200);
    });
}

function correction(rightMove) {
    return new Promise((resolve, reject) => {
        resolve(true);
        setTimeout(() => {reject('timeout');}, 50);
    });
}

function updateBoard(gameState) {
    return new Promise((resolve,reject)=>{ 
        resolve(true);
        setTimeout(() => {reject('timeout');}, 50);
    });
}   


function whatToDo(whichPlayer, gameState){
    let advance;
    if (whichPlayer == 1){
        advance = 1;
    }
    else {
        advance = -1;
    }
    if (gameState.board[i][j] == 1){
        return new Move("move", [i+advance, j]);
    }
}

exports.setup = setup;
exports.nextMove = nextMove;    
exports.correction = correction;    
exports.updateBoard = updateBoard;
