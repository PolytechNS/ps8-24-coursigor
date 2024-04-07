const http = require('http');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const DBuri = "mongodb://root:example@172.20.0.2:27017/";
const DBClient = new MongoClient(DBuri);

const addFriend = async (DBClient,UserToAdd,userName) => {
        const newDemand = {
          demander: userName,
          demandee: UserToAdd
        };
        DBClient.connect();
        db = DBClient.db('ma_base_de_donnees');
        const demandingFriends = db.collection('demandingFriends');
        demandingFriends.insertOne(newDemand);
        return { message: 'Friend demand added', data: newDemand };
      }


const acceptFriend = async (DBClient,userNameToAccept,userName) => {
      const newFriend = {
        user1: userName,
        user2: userNameToAccept
      };
      DBClient.connect();
      const db = DBClient.db('ma_base_de_donnees');
      const allFriends = db.collection('friends');

      allFriends.insertOne(newFriend);
      const demandingFriends = db.collection('demandingFriends');
      demandingFriends.deleteOne({ demander: userNameToAccept, demandee: userName });
      return { message: 'Friend added', data: newFriend };
    }


const removeFriend = async (DBClient,userNameToDelete,userName) => {
    DBClient.connect();
    const db = DBClient.db('ma_base_de_donnees');
    const allFriends = db.collection('friends');

    const friend =allFriends.findOne( { user1: userName, user2: userNameToDelete }, { user1: userNameToDelete, user2: userName });
    if (friend) {
        allFriends.deleteOne({ user1: userName, user2: userNameToDelete }, { user1: userNameToDelete, user2: userName });
        console.log (allFriends);
        return { message: 'Friend removed', data: friend };
    } else {
        throw new Error('Friend not found');
    }
}
const denyFriend = async (DBClient,UserToDeny,userName) => {
  DBClient.connect();
  const db = DBClient.db('ma_base_de_donnees');
  const demandingFriends = db.collection('demandingFriends');
  demandingFriends.updateOne({ $pull:{ demander: UserToDeny, demandee: userName }});
  console.log(demandingFriends);
  return { message: 'Friend demand denied' };
    
}

const getFriends = async (DBClient,userName) => {
  DBClient.connect();
  const db = DBClient.db('ma_base_de_donnees');
  await db.createCollection('friends');
  const allUsers = db.collection('friends');
  const userFriends = allUsers.filter(friend => friend.user1 === userName || friend.user2 === userName);
  const friendNames = userFriends.map(friend => {
    if (friend.user1 === userName) {
      return friend.user2;
    } else {
      return friend.user1;
    }
  });
  return friendNames;
};


const getFriendsWait = async (DBClient,userName) => {
  DBClient.connect();
  const db = DBClient.db('ma_base_de_donnees');
  await db.createCollection('demandingFriends');
  const allUsers = db.collection('demandingFriends');
  const userFriends = allUsers.filter(friend => friend.demandee===userName);
  const friendNames = userFriends.map(friend => {
    return friend.demander;
  });
  return friendNames;
};

const getAllUsers = async (DBClient,userName) => {
  DBClient.connect();
  // Sélection de la base de données
  const db = DBClient.db('ma_base_de_donnees');

  // Récupération de l'utilisateur par son nom d'utilisateur et mot de passe
  const allUsers = await db.collection('utilisateurs');

  const users = allUsers.filter(user => user.username !== userName).map(user => user.username);
  return users;
}

function manageRequest(DBClient,req, res) {
  const url = req.url;
  const method = req.method;
  const splitters = /[?/]/;
  let filePath = url.split(splitters).filter(function(elem) {
    return elem !== "..";
  });
  console.log(filePath);
  if (method === 'POST' && url === '/api/friends/remove') {
    let requestBody = '';
    req.on('data', function(chunk) {
      requestBody += chunk;
    });
    req.on('end', async function() {
      try {
        console.log(requestBody);
        const postData = JSON.parse(requestBody);
        console.log(postData);
        const result = await removeFriend(DBClient,postData.removed,postData.username);
        console.log("done");
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (error) {
        
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (method === 'POST' && url === '/api/friends/add') {
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const postData = JSON.parse(requestBody);
        console.log(requestBody);
        const result = await addFriend(DBClient,postData.user);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (method === 'POST' && url === '/api/friends/accept') {
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const postData = JSON.parse(requestBody);
        console.log(requestBody);
        const result = await acceptFriend(DBClient,postData.user);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (method === 'POST' && url === '/api/friends/deny') {
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const postData = JSON.parse(requestBody);
        console.log(requestBody);
        const result = await denyFriend(DBClient,postData.removed,postData.username);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: error.message }));
      } 
    });
  }
  else if (method === 'GET' && filePath[3] === 'confirmedFriends') {
      try {
        const urlParams = new URLSearchParams(filePath[4]);
        const userName = urlParams.get('username');
        const friends = getFriends(DBClient,userName);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(friends));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: error.message }));
      }
   } else if (method === 'GET' && filePath[3] === 'waitingFriends') {
    try {
      const urlParams = new URLSearchParams(filePath[4]);
      const userName = urlParams.get('username');
      const friends = getFriendsWait(DBClient, userName);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(friends));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 401;
      res.end(JSON.stringify({ error: error.message }));
    }
 }else if (method==="GET" && filePath[3]==='allUsers'){
    try {
      const urlParams = new URLSearchParams(filePath[4]);
      const userName = urlParams.get('username');
      const users = getAllUsers(DBClient,userName);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(users));
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 401;
      res.end(JSON.stringify({ error: error.message }));
    }

 }
  else {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Invalid endpoint' }));
  }
}

exports.manageRequest= manageRequest;