window.addEventListener("load", async function () {
    try {
        const response = await fetch('/api/leaderboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Réponse de la requête GET:', data);

            const tableBody = document.getElementById('table-body');
            let rank = 1; // Commencez le classement à 1

            data.data.forEach(player => {
                const row = document.createElement('tr');

                // Créez la cellule de classement
                const rankCell = document.createElement('td');
                rankCell.textContent = '#' + rank; // Ajoutez le numéro de classement
                row.appendChild(rankCell);

                const playerNameCell = document.createElement('td');
                playerNameCell.textContent = player.username;
                row.appendChild(playerNameCell);

                const playerScoreCell = document.createElement('td');
                playerScoreCell.textContent = player.elo;
                row.appendChild(playerScoreCell);

                tableBody.appendChild(row);

                rank++; // Incrémentez le classement pour le prochain joueur
            });
        } else {
            console.error('Erreur lors de la requête GET:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erreur lors de la requête GET:', error);
    }
});

function goBackToMenu() {
    window.location.href = '/';
}
