const http = require('http');
const mongo = require('mongodb');
const cors = require('cors'); // Ajout du module cors
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');
const SignUp = require('./EndPoints/SignUp.js');
const {Server} = require("socket.io");
const friends = require('./EndPoints/friends.js');

const DBuri = "mongodb://{$mongodbuser}:{$mongodbpassword}@mongodb:27017/";
const DBClient = new mongo.MongoClient(DBuri);





DBClient.connect()
.then(()=>{
    console.log("db connect success");
})
.catch((err)=>{
    console.log("db connect error");
    throw err;
});



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
                console.log('start');
                if(filePath[2] === "Register" || filePath[2] === "Login"){
                    SignUp.manage(DBClient,request,response);
                }
                else if (filePath[2]==="friends"){
                    console.log('oi')
                    friends.manageRequest(DBClient,request,response);
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
        let onlineGame = require('./logic/onlineGame.js');
        onlineGame.removeSocket(socket.id);
        console.log('user disconnected');
    });

});

io.of("/api/1v1Online").on('connection', (socket) => {

    socket.on('joinOrCreate1v1', (data) => {
        console.log("joinOrCreate1v1");
        console.log(data);
        let online1v1 = require('./Sockets/Online1v1.js');
        online1v1.afficherMessage(socket.id, "joinOrCreate1v1");
        online1v1.handleStartGame(socket, data);

    });

});
exports.io = io;



// io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
//     const namespace = socket.nsp;
// });
