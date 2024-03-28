const http = require('http');

// Structure de données pour stocker les 10 meilleurs joueurs
let topPlayers = [];

// Fonction pour mettre à jour les 10 meilleurs joueurs
function updateTopPlayers(DBClient,req,res) {
    cors()(req, res, () => {});
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    console.log("on est bien ici");
    try {
        DBClient.connect();
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
}


exports.updateTopPlayers = updateTopPlayers;