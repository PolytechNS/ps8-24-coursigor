const { MongoClient } = require("mongodb");

const DBuri = "mongodb://root:example@172.20.0.2:27017/";
const DBClient = new MongoClient(DBuri);

const signUpAndPrintDatabase = async (mail, username, password) => {
    try {
        // Connexion à la base de données MongoDB
        await DBClient.connect();

        console.log('Connexion à la base de données réussie !');

        // Sélection de la base de données
        const db = DBClient.db('ma_base_de_donnees');

        // Création de la collection (si elle n'existe pas déjà)
        await db.createCollection('utilisateurs');

        // Ajout de l'utilisateur à la collection
        const utilisateursCollection = db.collection('utilisateurs');
        await utilisateursCollection.insertOne({ mail, username, password });

        console.log('Utilisateur ajouté avec succès !');

        // Affichage de tous les utilisateurs dans la collection
        const users = await utilisateursCollection.find().toArray();
        console.log('Utilisateurs dans la collection :', users);
    } catch (error) {
        console.error('Erreur lors de l\'opération d\'inscription :', error);
    } finally {
        // Fermeture de la connexion à la base de données
        await DBClient.close();
    }
};

const exempleMail = 'AAexemple@mail.com';
const exempleUsername = 'AAutilisateur';
const exemplePassword = 'AAmotdepasse';

signUpAndPrintDatabase(exempleMail, exempleUsername, exemplePassword);
