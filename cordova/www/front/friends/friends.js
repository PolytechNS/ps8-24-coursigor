
const username = localStorage["username"];
let users = [];
let all = [];

const socket = io("api/defyFriends");



function fetchFriends() {
        console.log("called");
        const username = localStorage["username"]
        // Fetch friends data
        fetch(`/api/friends/confirmedFriends?username=${localStorage["username"]}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            // Process the list of friends here
            const table = document.getElementById("Comrades");
            const tablebody = document.getElementById("ComradesBody");
            console.log(data);
            all.push(data);


            // Iterate over the friends and create table rows
            data.forEach(friend => {
                let row = document.createElement("tr");
                row.setAttribute("id", "friend"+friend);
                let nameCell = document.createElement("td");
                let defyCell = document.createElement("td");
                let removeCell = document.createElement("td");
                nameCell.innerText = friend;
                defyCell.innerHTML = `<button onclick="defyFriend('${friend}')">Defy</button>`;
                removeCell.innerHTML = `<button onclick="removeFriend('${friend}')">Remove</button>`;

                row.appendChild(nameCell);
                row.appendChild(defyCell);
                
                row.appendChild(removeCell);
                tablebody.appendChild(row);
            });
            table.appendChild(tablebody);
            
        
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

function fetchFriendsWaiting() {
        console.log("called");
        const username = localStorage["username"]
        // Fetch friends data
        fetch(`/api/friends/waitingFriends?username=${localStorage["username"]}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            // Process the list of friends here
            const table = document.getElementById("ComradesWait");
            const tablebody = document.getElementById("ComradesWaitBody");
            console.log(data);
            all.push(data);


            // Iterate over the friends and create table rows
            data.forEach(friend => {
                let row = document.createElement("tr");
                row.setAttribute("id", "waiting"+friend);
                let nameCell = document.createElement("td");
                let addCell = document.createElement("td");
                let refuseCell = document.createElement("td");
                nameCell.innerText = friend;

                addCell.innerHTML = `<button onclick="addAskingFriend('${friend}')">Add</button>`;
                refuseCell.innerHTML = `<button onclick="refuseFriend('${friend}')">Refuse</button>`;


                row.appendChild(nameCell);
                row.appendChild(addCell);
                row.appendChild(refuseCell);
                tablebody.appendChild(row);
            });
            table.appendChild(tablebody);
            
        
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

window.addEventListener('DOMContentLoaded', fetchFriends);
window.addEventListener('DOMContentLoaded',fetchFriendsWaiting);
window.addEventListener('DOMContentLoaded',fetchUsers);

function addAskingFriend(id) {
    console.log("add");
    const added = id;
    const adding = {"added": added,  "username": username};
    let tmp = JSON.stringify(adding);
    console.log(tmp);
    fetch(`/api/friends/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: tmp,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let row = document.querySelector(`#waiting${added}`);
            if (row) {
                row.remove();
                
                const table = document.getElementById("Comrades");
                const tablebody = document.getElementById("ComradesBody");
                row = document.createElement("tr");
                row.setAttribute("id", "friend"+added);
                let nameCell = document.createElement("td");
                let defyCell = document.createElement("td");
                let removeCell = document.createElement("td");
                nameCell.innerText = added;
                defyCell.innerHTML = `<button onclick="defyFriend('${added}')">Defy</button>`;
                removeCell.innerHTML = `<button onclick="removeFriend('${added}')">Remove</button>`;
                row.appendChild(nameCell); 
                row.appendChild(removeCell);
                row.appendChild(defyCell);
                tablebody.appendChild(row);
                table.appendChild(tablebody);
            }
            console.log('Friend added:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function removeFriend(id) {
    console.log("remove");
    const removed = id;
    const removing = {"removed": removed,  "username": username};
    let tmp = JSON.stringify(removing);
    console.log(tmp);
    fetch(`/api/friends/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: tmp,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const row = document.querySelector(`#friend${removed}`);
            if (row) {
                row.remove();
            }
            console.log('Friend removed:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function refuseFriend(id) {
    console.log("refuse");
    const removed = id;
    const username = localStorage["username"];
    const removing = {"removed": removed,  "username": username};
    let tmp = JSON.stringify(removing);
    console.log(tmp);
    fetch(`/api/friends/deny`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: tmp,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const row = document.querySelector(`#waiting${removed}`);
            if (row) {
                row.remove();
            }
            console.log('Friend removed:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function addNewFriend(id) {
    console.log("add");
    const added = id;
    const adding = {"demandee": added,  "demander": username};
    let tmp = JSON.stringify(adding);
    console.log(tmp);
    fetch(`/api/friends/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: tmp,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            console.log('Friend added:', data);
            const card = document.querySelector(`#${added}card`);
            if (card) {
                card.remove();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

}


function fetchUsers() {
    console.log("called");
    const  searchInput = document.querySelector("[data-search]") ;
    // Fetch friends data
    fetch(`/api/friends/allUsers?username=${username}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        const userCardTemplate = document.querySelector("[data-user-template]");
        const userCardContainer = document.querySelector("[data-user-cards-container]");
        console.log(data);
        if (!(data in all)){
        users = data.map(user => {
            const card = userCardTemplate.content.cloneNode(true).children[0]
            const header = card.querySelector("[data-header]")
            const body = card.querySelector("[data-body]")
            card.id = user + "card";
            header.textContent = user
            body.innerHTML = `<button onclick="addNewFriend('${user}')">Add</button>`
            userCardContainer.append(card)
            return { name: user, element: card }
        });}


    });
    
}

document.addEventListener("DOMContentLoaded", e => {

    let searchInput = document.querySelector("[data-search]");
    searchInput.addEventListener("input", e => {
        const value = e.target.value.toLowerCase()
        users.forEach(user => {
        const isVisible =
            user.name.toLowerCase().includes(value) ;
        user.element.classList.toggle("hide", !isVisible)
        })
    })
})


function defyFriend(id) {
    window.location.href = `/game/online1v1`;
    
    const message = username + " wants to defy " + id + " to a game!";
    socket.emit('defyFriend', message);
}


function goBackToMenu() {
    window.location.href = '/';
    
}


socket.on('defyFriend', (data) => {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    const message = document.createElement("p");
    message.innerText = data;
    const button = document.createElement("button");
    button.innerText = "Play Game";
    button.addEventListener("click", () => {
        window.location.href = "/game/online1v1";
    });
    popup.appendChild(message);
    popup.appendChild(button);
    document.body.appendChild(popup);
    alert(data);
});