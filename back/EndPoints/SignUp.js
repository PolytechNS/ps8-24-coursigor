const { MongoClient } = require("mongodb")

const DBuri = "mongodb://root:example@mongodb:27017/";
const DBClient = new mongo.MongoClient(DBuri);

const signUp = async (mail, username, password) => {
    MongoClient.connect(DBuri, async (err, client) => {
        
})}
