// This function doesn't handle walls.
// function computeMove(gameState) {
//     let pos = gameState.player.position;
//     let possibleMoves = [];
//     // Check if moving left is possible.
//     if (pos > 20) possibleMoves.push(pos-10);
//     // Check if moving right is possible.
//     if (pos < 90) possibleMoves.push(pos+10);
//     // Check if moving down is possible.
//     if (pos % 10 !== 1) possibleMoves.push(pos-1);
//     // Check if moving up is possible.
//     if (pos % 10 !== 9) possibleMoves.push(pos+1);
//
//     // Get a random integer between 0 and possibleMoves.length-1
//     let moveIndex = Math.floor(Math.random()*possibleMoves.length);
//     return possibleMoves[moveIndex];
// }




function computeMove(gameState) {
    //ai plays as player 2
    let pos = gameState.positionPlayer2;
    let possibleMoves = [];
    // Check if moving left is possible.
    // pos[i][j] with i and j between 0 and 9 inculded
    if (pos[0] > 0) possibleMoves.push([pos[0]-1, pos[1]]);
    // Check if moving right is possible.
    if (pos[0] < 9) possibleMoves.push([pos[0]+1, pos[1]]);
    // Check if moving down is possible.
    if (pos[1] > 0) possibleMoves.push([pos[0], pos[1]-1]);
    // Check if moving up is possible.
    if (pos[1] < 9) possibleMoves.push([pos[0], pos[1]+1]);

    // randomise the order of the possible moves
    possibleMoves.sort(() => Math.random() - 0.5);
    return possibleMoves;
}
exports.computeMove = computeMove;