fetch('http://localhost:8000/api/friends')
    .then(response => response.json())
    .then(data => {
        // Process the list of friends here
        const table = document.createElement('table');
        const tableBody = document.createElement('tbody');

        // Iterate over the friends and create table rows
        data.forEach(friend => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const removeCell = document.createElement('td');

            nameCell.textContent = friend.name;
            removeCell.innerHTML = `<button onclick="removeFriend(${friend.id})">Remove</button>`;

            row.appendChild(nameCell);
            row.appendChild(removeCell);
            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        document.body.appendChild(table);
    })
    .catch(error => {
        console.error('Error:', error);
    });

function removeFriend(id) {
    fetch(`http://localhost:8000/api/friends/${id}`, {
        method: 'DELETE'
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
