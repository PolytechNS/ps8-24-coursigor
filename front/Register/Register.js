document.getElementById('RegisterBtn').addEventListener('click', function() {
    console.log('Bouton de connexion clique.');


    // Get input values
    const email = document.getElementsByName('email')[0].value;
    const username = document.getElementsByName('username')[0].value;
    const password = document.getElementsByName('password')[0].value;

    const postData = {"username": username, "password": password, "email": email}

    // Send POST request
    fetch('http://localhost:8765/Register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                // Affichez le contenu de la réponse pour déboguer
                return response.text().then(text => {
                    console.log('Non-JSON response:', text);
                    throw new Error('Response is not in JSON format');
                });
            }
        });
});