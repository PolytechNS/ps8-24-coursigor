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
            DBClient.connect()
                .then(()=>{
                    console.log("db connect success");
                })
                .catch((err)=>{
                    throw err;
                });

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

const io = new Server(app);
io.of("/api/onlineGame").on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('message', 'Hello there!');

    socket.on('message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('newGame', () => {
        console.log('new game: ');
        let onlineGame = require('./logic/onlineGame.js');

        onlineGame.newGame(socket.id);

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


io.of("/api/online1V1").on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('message', 'Hello there!');

    socket.on('message', (msg) => {
        console.log('message: ' + msg);
    });



});




exports.io = io;



// io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
//     const namespace = socket.nsp;
// });
