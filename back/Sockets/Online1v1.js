function afficherMessage(id, message) {
    console.log(`message: ${message}`);
}
exports.afficherMessage = afficherMessage;

const rooms = [];

function handleStartGame(socket, data) {

    const playerInQueue = rooms.find((room) => room.players.length === 1);
    if(playerInQueue){
        //un joueur est déjà en attente
        //il faut l'associer à cette room
        //ajoût du joueur dans l'objet room
        playerInQueue.players.push(socket.id);
        //ajout du joueur dans la room
        socket.join(playerInQueue.roomName);
        console.log("you are not alone in the room");
    }else{
        //aucun joueur en attente
        //il faut créer une room
        //création d'une room avec socket.id
        roomName=generateRoomName();
        socket.join(roomName);
        //création de l'objet room
        const room = {
            players: [socket.id],
            roomName: roomName
        }
        //ajout de l'objet room dans le tableau rooms
        rooms.push(room);
        console.log("you are alone in the room");
    }
}
exports.handleStartGame = handleStartGame;


function generateRoomName() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomName = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        roomName += characters.charAt(randomIndex);
    }

    return roomName;
}