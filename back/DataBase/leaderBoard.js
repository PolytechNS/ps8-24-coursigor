const http = require('http');
const cors = require('cors');
// Structure de données pour stocker les 10 meilleurs joueurs
let topPlayers = [];

// Fonction pour mettre à jour les 10 meilleurs joueurs
const updateTopPlayers= async (DBClient) =>{
    try {
        await DBClient.connect();
        const db = DBClient.db('ma_base_de_donnees');
        const utilisateursCollection = db.collection('utilisateurs');

        const pipeline = [
            { "$sort": { "elo": -1 } },  // Trier par score Elo décroissant
            { "$limit": 10 }              // Limiter le résultat aux 10 premiers joueurs
        ];
        const topPlayersCursor = utilisateursCollection.aggregate(pipeline);

        // Traiter les résultats (par exemple, les convertir en une liste)
        const topPlayersListPromise = topPlayersCursor.toArray(); // Obtenir la promesse

        // Attendre la résolution de la promesse et traiter le résultat
        topPlayersListPromise.then(topPlayersList => {
            // Fermer la connexion à la base de données
            console.log("topPlayersList", topPlayersList);
            return topPlayersList;
        });

        // Retourner la promesse pour permettre au code appelant de l'attendre si nécessaire
        return topPlayersListPromise;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des 10 meilleurs joueurs :', error);
        throw error;
    }
};

function manageRequestLB(DBClient,req, res) {
    cors()(req, res, () => {});
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const url = req.url;
    const method = req.method;
    if (method === 'GET' && url === '/api/leaderboard') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });
        req.on('end', async () => {
            try {
                console.log("appel la fonction updateTopPlayers");
                const result = await updateTopPlayers(DBClient);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({message: 'update leaderboard', data: result}));
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 401;
                res.end(JSON.stringify({error: error.message}));
            }
        });
    }
}


exports.manageRequestLB = manageRequestLB;