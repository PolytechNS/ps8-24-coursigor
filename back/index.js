const http = require('http');
const mongo = require('mongodb');
const cors = require('cors'); // Ajout du module cors
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');
const SignUp = require('./EndPoints/SignUp.js');
const {Server} = require("socket.io");


const DBuri = "mongodb://root:example@mongodb:27017/";
const DBClient = new mongo.MongoClient(DBuri);



const app = http.createServer(async function (request, response) {
    // Utilisation du middleware cors
    cors()(request, response, function() {
        let filePath = request.url.split("/").filter(function(elem) {
            return elem !== "..";
        });

        try {

            // Ajout des en-têtes CORS manuellement
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
            response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Si le URL commence par /api, alors c'est une requête REST.
            if (filePath[1] === "api") {
                if(filePath[2] === "Register" || filePath[2] === "Login"){
                    SignUp.manage(DBClient,request,response);
                }
                //apiQuery.manage(request, response);
            } else {
                fileQuery.manage(request, response);
            }
        } catch(error) {
            console.log(`error while processing ${request.url}: ${error}`);
            response.statusCode = 400;
            response.end(`Something in your request (${request.url}) is strange...`);
        }
    });
}).listen(8000);

DBClient.connect()
    .then(()=>{
        console.log("db connect success");
    })
    .catch((err)=>{
        throw err;
    });

const io = new Server(app);
// Pour l'espace de noms '/api/onlineGame'

io.of("/api/onlineGame").on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('newGame', (cookieToken) => {
        console.log('new game: ' + cookieToken);
        socket.emit('message', 'Starting new game...');
        let onlineGame = require('./logic/onlineGame.js');

        onlineGame.newGame(socket.id, cookieToken);

    });

    socket.on('loadGame', (cookieToken) => {
        console.log('load game: ' + cookieToken);
        let onlineGame = require('./logic/onlineGame.js');

        onlineGame.loadGame(socket.id, cookieToken);
    });

    socket.on('nextMove' , (move) => {
        console.log('nextMove: ' + move);
        let onlineGame = require('./logic/onlineGame.js');
        onlineGame.nextMove(socket.id, move);
    });



    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});


let nsp = io.of("/api/1v1Online");
nsp.on('connection', (socket) => {
    console.log('a user connected');

    let online1v1 = require('./Sockets/Online1v1.js');
    socket.on("firstConnection", () => {
        console.log("first connection");
        online1v1.handleStartGame(nsp, socket);
    });

    socket.on('nextMove' , (move,roomName) => {
        console.log('nextMove: ' + move);
        console.log("salle associée au move : " + roomName);
        let onlineGame = require('./Sockets/Online1v1.js');
        onlineGame.nextMove(nsp, roomName, move);
    });
    socket.on('userLeft', (InGame) => {
        console.log("user left");
        online1v1.userLeft(socket);

    });

    socket.on("surrender", (roomName) => {
        online1v1.makePlayersLeave(roomName,nsp);
    });

    socket.on("resumeGame", (roomName) => {

        online1v1.resumeGame(socket,roomName,nsp);
    });

});
exports.io = io;



// io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
//     const namespace = socket.nsp;
// });
