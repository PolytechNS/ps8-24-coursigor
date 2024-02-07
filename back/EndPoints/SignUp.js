const { MongoClient } = require("mongodb");

const DBuri = "mongodb://root:example@172.20.0.2:27017/";
const DBClient = new MongoClient(DBuri);
const http = require('http');
const cors = require('cors');

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
        //await utilisateursCollection.deleteMany({});
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





const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const url= req.url;
    const method = req.method;
    if(method === 'POST' && url === '/Register') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(requestBody);
            console.log(requestBody);
            signUpAndPrintDatabase(postData.email, postData.username, postData.password);
            console.log('Received data:', postData.username, postData.password, postData.email);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Data received successfully.' }));
        });
    }else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`Method: ${req.method}, URL: ${req.url}`);
    }
});

const port = 8765;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
