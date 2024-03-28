window.addEventListener("load", async function () {
    try {
        const response = await fetch('/api/leaderboard', {
            method: 'GET',  // Spécification de la méthode GET
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Vérifier la réponse de la requête
        if (response.ok) {
            const data = await response.json();
            console.log('Réponse de la requête GET:', data);

            // Récupérer la référence de l'élément de tableau dans le DOM
            const tableBody = document.getElementById('table-body');

            // Parcourir les données et créer les lignes de tableau
            data.data.forEach(player => {
                const row = document.createElement('tr');

                // Créer les cellules de tableau pour chaque propriété du joueur
                const playerNameCell = document.createElement('td');
                playerNameCell.textContent = player.username;
                row.appendChild(playerNameCell);

                const playerScoreCell = document.createElement('td');
                playerScoreCell.textContent = player.elo;
                row.appendChild(playerScoreCell);

                // Attacher la ligne au corps du tableau
                tableBody.appendChild(row);
            });
        } else {
            console.error('Erreur lors de la requête GET:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erreur lors de la requête GET:', error);
    }
});
