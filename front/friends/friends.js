function fetchFriends() {
        console.log("called");
        const username = localStorage["username"]
        // Fetch friends data
        fetch(`http://localhost:8000/api/friends/confirmedFriends?username=${localStorage["username"]}`, {
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



            // Iterate over the friends and create table rows
            data.forEach(friend => {
                let row = document.createElement("tr");
                let nameCell = document.createElement("td");
                let removeCell = document.createElement("td");
                nameCell.innerText = friend;
                removeCell.innerHTML = `<button onclick="removeFriend('${friend}')">Remove</button>`;

                row.appendChild(nameCell);
                row.appendChild(removeCell);
                tablebody.appendChild(row);
            });
            table.appendChild(tablebody);
            
        if (container) { // Ensure the container element exists before appending the table
            container.appendChild(table);
        }else {
            console.log("container not found"); 
        }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

function fetchFriendsWaiting() {
        console.log("called");
        const username = localStorage["username"]
        // Fetch friends data
        fetch(`http://localhost:8000/api/friends/waitingFriends?username=${localStorage["username"]}`, {
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



            // Iterate over the friends and create table rows
            data.forEach(friend => {
                let row = document.createElement("tr");
                let nameCell = document.createElement("td");
                let addCell = document.createElement("td");
                let refuseCell = document.createElement("td");
                nameCell.innerText = friend;

                addCell.innerHTML = `<button onclick="addAskingFriend('${friend}')">Add</button>`;
                refuseCell.innerHTML = `<button onclick="refuseFriend('${friend}')">Refuse</button>`;


                row.appendChild(nameCell);
                row.appendChild(removeCell);
                tablebody.appendChild(row);
            });
            table.appendChild(tablebody);
            
        if (container) { // Ensure the container element exists before appending the table
            container.appendChild(table);
        }else {
            console.log("container not found"); 
        }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

window.addEventListener('DOMContentLoaded', fetchFriends);
window.addEventListener('DOMContentLoaded',fetchFriendsWaiting);

function addAskingFriend(id) {
    console.log("add");
    const added = id;
    const username = localStorage["username"];
    const adding = {"added": added,  "username": username};
    let tmp = JSON.stringify(adding);
    console.log(tmp);
    fetch(`http://localhost:8000/api/friends/accept`, {
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
            console.log('Friend removed:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function removeFriend(id) {
    console.log("remove");
    const removed = id;
    const username = localStorage["username"];
    const removing = {"removed": removed,  "username": username};
    let tmp = JSON.stringify(removing);
    console.log(tmp);
    fetch(`http://localhost:8000/api/friends/remove`, {
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
    fetch(`http://localhost:8000/api/friends/deny`, {
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
            console.log('Friend removed:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

