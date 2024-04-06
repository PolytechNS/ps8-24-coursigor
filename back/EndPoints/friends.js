let friendsData = {
    "friends": [
      {
        "user1": "user1",
        "user2": "user2"
      },
      {
        "user1": "user2",
        "user2": "user3"
      },
      {
        "user1": "user1",
        "user2": "user3"
      },
      {
        "user1": "user3",
        "user2": "user4"
      },
      {
        "user1": "user4",
        "user2": "user5"
      }
    ]
  };
let demandData = {
  "futureFriends": [
    {
      demander:"user1",
      demandee:"user2"
    },
    {
      demander:"user3",
      demandee:"user1"
    }
  ]
}
let usersData = {
    "users": [
        {
          "username": "user1",
          "email": "user1@example.com",
          "password": "password1"
        },
        {
          "username": "user2",
          "email": "user2@example.com",
          "password": "password2"
        },
        {
          "username": "user3",
          "email": "user3@example.com",
          "password": "password3"
        },
        {
          "username": "user4",
          "email": "user4@example.com",
          "password": "password4"
        },
        {
          "username": "user5",
          "email": "user5@example.com",
          "password": "password5"
        }
    ]
};

const http = require('http');
const cors = require('cors');
const mongo = require('mongodb');

const addFriend = async (UserToAdd,userName) => {
        const newDemand = {
          demander: userName,
          demandee: UserToAdd
        };
        demandData.futureFriends.push(newDemand);
        return { message: 'Friend demand added', data: newDemand };
      }


const acceptFriend = async (userNameToAccept,userName) => {
      const newFriend = {
        user1: userName,
        user2: userNameToAccept
      };
      friendsData.friends.push(newFriend);
      demandData.futureFriends = demandData.futureFriends.filter(f => f.demander !== userNameToAccept && f.demandee !== userName);
      return { message: 'Friend added', data: newFriend };
    }


const removeFriend = async (userNameToDelete,userName) => {
    console.log(userNameToDelete);
    const friend = friendsData.friends.find(friend => ((friend.user1 === userNameToDelete || friend.user2 === userNameToDelete) && (friend.user1===userName || friend.user2 === userName)));
    if (friend) {
        friendsData.friends = friendsData.friends.filter(f => f !== friend );
        console.log (friendsData.friends);
        return { message: 'Friend removed', data: friend };
    } else {
        throw new Error('Friend not found');
    }
}
const denyFriend = async (UserToDeny,userName) => {
  demandData.futureFriends = demandData.futureFriends.filter(f => f.demander !== UserToDeny && f.demandee !== userName);
    
}

const getFriends = (userName) => {
  const userFriends = friendsData.friends.filter(friend => friend.user1 === userName || friend.user2 === userName);
  const friendNames = userFriends.map(friend => {
    if (friend.user1 === userName) {
      return friend.user2;
    } else {
      return friend.user1;
    }
  });
  return friendNames;
};


const getFriendsWait = (userName) => {
  const userFriends = demandData.futureFriends.filter(friend => friend.demandee===userName);
  const friendNames = userFriends.map(friend => {
    return friend.demander;
  });
  return friendNames;
};


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
        const result = await removeFriend(postData.removed,postData.username);
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
        const result = await addFriend(postData.user);
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
        const result = await acceptFriend(postData.user);
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
        const result = await denyFriend(postData.removed,postData.username);
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
        const friends = getFriends(userName);
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
      const friends = getFriendsWait(userName);
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
      const users = usersData.users.filter(user => user.username !== userName).map(user => user.username);
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