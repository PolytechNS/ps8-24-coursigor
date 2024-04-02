document.getElementById('RegisterBtn').addEventListener('click', async function() {
    console.log('Bouton de connexion clique.');

    // Get input values
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = await hashPassword(document.getElementById('password').value);

    const postData = {"username": username, "password": password, "email": email}

    // Send POST request
    fetch('/api/Register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                return response.json(); // Si le type de contenu est JSON, parse la réponse
            } else {
                return response.text(); // Sinon, récupère le texte brut de la réponse
            }
        })
        .then(data => {
            // Traitez la réponse ici
            document.getElementById('successMessage').textContent = 'Connexion réussie!';
            console.log('Data reçue:', data);
        })
        .catch(error => {
            // Gérer les erreurs ici
            console.error('Erreur lors de la demande:', error);
        });




});
document.getElementById('LoginBtn').addEventListener('click', async function() {
    console.log('Bouton de login clique.');
    const usernameLogin = document.getElementById('usernameLogin').value;
    const passwordLogin = await hashPassword(document.getElementById('passwordLogin').value);
    const loginData = { "username": usernameLogin, "password": passwordLogin }

    fetch('/api/Login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('successMessageLogin').textContent = 'Erreur d\'identification';

                console.error('Erreur lors de la connexion:', data.error);

                // Gérez l'affichage ou la manipulation de l'erreur côté client
            } else {
                document.getElementById('successMessageLogin').textContent = 'Connexion réussie!';
                if (data.token) {
                    // Afficher le token dans la console (à des fins de débogage)
                    console.log('Token reçu:', data.token);
                    const expirationDate = new Date();
                    expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000); //expiration 1h
                    document.cookie = `token=${data.token}; expires=${expirationDate.toUTCString()}; path=/`;
                    const elo = data.elo;
                    console.log("elo",elo);
                    document.cookie = `elo=${elo}; path=/`;
                    //window.location.href = "../index.html";
                }
                console.log('Connexion réussie:', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);
        });

});



async function hashPassword(password) {
    console.log('Hachage du mot de passe...');
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Utilise l'API Web Crypto pour hasher le mot de passe avec l'algorithme SHA-256
    //TODO fix le hashage
    //const buffer = await crypto.subtle.digest('SHA-256', data);

    // Convertit le buffer en une chaîne hexadécimale
    const hashedPassword = Array.from(new Uint8Array(data)).map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashedPassword;
}
document.getElementById('showCookies').addEventListener('click', function() {
    displayCookies();
});


//TODO PROVISOIRE
function displayCookies() {
    const cookies = document.cookie.split(';');
    let cookieString = "Cookies:\n";

    cookies.forEach(cookie => {
        cookieString += cookie.trim() + '\n';
    });

    alert(cookieString);
}
