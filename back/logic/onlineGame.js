// gère les parties en ligne
// possède deux clients, un pour chaque joueur qui sont connectés

// websocket pour joueur 1
const ws1 = new WebSocket('ws://localhost:8080');
// websocket pour joueur 2
const ws2 = new WebSocket('ws://localhost:8080');

// fonction qui gère les parties en ligne
async function onlineGame() {
    // connexion des deux joueurs
    ws1.on('open', function open() {
        ws1.send('something');
    });

    ws2.on('open', function open() {
        ws2.send('something');
    });

    // boucle de jeu
    while (true) {
        // joueur 1 joue
        ws1.on('message', function incoming(data) {
            console.log(data);
        });

        // joueur 2 joue
        ws2.on('message', function incoming(data) {
            console.log(data);
        });

        // fin de la partie
        if (true) {
            break;
        }
    }
}