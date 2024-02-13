// gère les parties en ligne
// possède deux clients, un pour chaque joueur qui sont connectés

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});




// joueur 1 et joueur 2 sont connectés via des sockets


// le serveur recoit l'état de la partie et le renvoie à l'autre joueur sous forme d'un objet json



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


//on construit l'objet json à partir de ces variables
function buildJson(){
    return {
        wallsNotToPlace: wallsNotToPlace,
        placedWalls: placedWalls,
        visionBoard: visionBoard,
        positionPlayer1: positionPlayer1,
        positionPlayer2: positionPlayer2
    };
}