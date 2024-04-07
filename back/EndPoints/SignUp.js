const { MongoClient } = require("mongodb");
const jwt = require('jsonwebtoken');


const DBuri = "mongodb://root:example@172.20.0.2:27017/";
const DBClient = new MongoClient(DBuri);
const http = require('http');
const cors = require('cors');

const signUpAndPrintDatabase = async (DBClient,mail, username, password) => {
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

        // Retournez la réponse sous forme d'objet JSON
        return { message: 'Inscription réussie' };
    } catch (error) {
        console.log('Erreur lors de l\'opération d\'inscription :', error);
        console.error('Erreur lors de l\'opération d\'inscription :', error);

        // Retournez une réponse d'erreur sous forme d'objet JSON
        throw { error: error.message };
    } finally {
        // Fermeture de la connexion à la base de données
        await DBClient.close();
    }
};

const signInAndGenerateToken = async (DBClient,username, password) => {
    try {
        
        // Connexion à la base de données MongoDB
        await DBClient.connect();

        console.log('Connexion à la base de données réussie !');

        // Sélection de la base de données
        const db = DBClient.db('ma_base_de_donnees');

        // Récupération de l'utilisateur par son nom d'utilisateur et mot de passe
        const utilisateur = await db.collection('utilisateurs').findOne({ username, password });

        if (!utilisateur) {
            return { error: 'Nom d\'utilisateur ou mot de passe incorrect.' };
        }

        console.log('Connexion réussie !');
        
        // Génération du token JWT
        const token = generateToken(username, password);

        return { message: 'Connexion réussie.', token, username };
    } catch (error) {
        console.error('Erreur lors de l\'opération de connexion :', error);
        return { error: 'Erreur lors de la connexion.' };
    } finally {

        // Fermeture de la connexion à la base de données
        // await DBClient.close();
    }
};

const generateToken = (username, password) => {
    const userInfo = {
        username: username,
        // Vous pouvez ajouter plus d'informations sur l'utilisateur ici si nécessaire
    };

    // Génération du token avec une clé secrète (remplacez 'votreCleSecrete' par votre clé réelle)
    const token = jwt.sign(userInfo, 'KcorpUltra', { expiresIn: '1h' });

    return token;
};




function manageRequest(DBClient,req, res) {
    cors()(req, res, () => {});
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const url = req.url;
    const method = req.method;
    if (method === 'POST' && url === '/api/Register') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const postData = JSON.parse(requestBody);
                console.log(requestBody);
                const result = await signUpAndPrintDatabase(DBClient, postData.email, postData.username, postData.password);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Inscription réussie', data: result }));
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 401;
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }
    else if (method === 'POST' && url === '/api/Login') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const postData = JSON.parse(requestBody);
                console.log(requestBody);
                const result = await signInAndGenerateToken(DBClient, postData.username, postData.password);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' }));
            }
        });
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`Method: ${req.method}, URL: ${req.url}`);
    }

}
exports.manage = manageRequest;