const { MongoClient } = require("mongodb");
const jwt = require('jsonwebtoken');

//const DBuri = "mongodb://root:example@172.20.0.2:27017/";
//const DBClient = new MongoClient(DBuri);
const http = require('http');
const cors = require('cors');

const saveAI = async (DBSaves, userName,ai)=>{
    try {
        // Connexion à la base de données MongoDB
        await DBSaves.connect();

        console.log('Connexion à la base de données réussie !');

        // Sélection de la base de données
        const db = DBSaves.db('ma_base_de_donnees');

        // Création de la collection (si elle n'existe pas déjà)
        await db.createCollection('gamesSaved');

        // Ajout de la partie dans la collection
        const gamesSavedCollection = db.collection('gamesSaved');
        await gamesSavedCollection.insertOne({ userName, ai });

        console.log('sauvegarde ajoutée avec succès !');

        // Affichage de toutes les parties sauvegardées
        const saves = await gamesSavedCollection.find().toArray();
        console.log('Sauvegardes dans la collection :', saves);

        // Retournez la réponse sous forme d'objet JSON
        return { message: 'Sauvegarde réussie' };
    } catch (error) {
        console.log('Erreur lors de l\'opération de sauvegarde :', error);
        console.error('Erreur lors de l\'opération de sauvegarde :', error);

        // Retournez une réponse d'erreur sous forme d'objet JSON
        throw { error: error.message };
    } finally {
        // Fermeture de la connexion à la base de données
        await DBSaves.close();
    }
}

const savePlayers=(username1, username2)=>{

}