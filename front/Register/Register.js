document.getElementById('loginBtn').addEventListener('click', function() {
    var username = document.getElementsByName('username').value;
    var password = document.getElementsByName('password').value;
    var data = {
        username: username,
        password: password
    };
    fetch('http://localhost:8765/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data2 => {
            console.log('Données de la réponse :', data2);
            // Handle the response data as needed
        })
        .catch(error => {
            console.error('Erreur lors de la requête :', error);
        });
});