document.getElementById('RegisterBtn').addEventListener('click', async function() {
    console.log('Bouton de connexion clique.');

    // Get input values
    const email = document.getElementsByName('email')[0].value;
    const username = document.getElementsByName('username')[0].value;
    const password = await hashPassword(document.getElementsByName('password')[0].value);

    const postData = {"username": username, "password": password, "email": email}

    // Send POST request
    fetch('http://localhost:8765/Register', {
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
                return response.json();
            } else {
                return response.text().then(text => {
                    console.log('Non-JSON response:', text);
                    throw new Error('Response is not in JSON format');
                });
            }
        })
        .then(data => {
            // Traitement de la réponse JSON du serveur
            document.getElementById('successMessage').textContent = 'Inscription réussie!'; // Mise à jour du message de succès
        })

});

async function hashPassword(password) {
    console.log('Hachage du mot de passe...');
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Utilise l'API Web Crypto pour hasher le mot de passe avec l'algorithme SHA-256
    const buffer = await crypto.subtle.digest('SHA-256', data);

    // Convertit le buffer en une chaîne hexadécimale
    const hashedPassword = Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashedPassword;
}
