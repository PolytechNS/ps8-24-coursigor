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
        } else {
            console.error('Erreur lors de la requête GET:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erreur lors de la requête GET:', error);
    }
});
