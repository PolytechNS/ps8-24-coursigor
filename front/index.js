// Fonction pour vérifier la présence du token et activer/désactiver le bouton en conséquence
function checkTokenAndDisplayLinks() {
    const online1v1Button = document.getElementById('online1v1Button');

    if (hasJwtCookie()) {
        console.log("true");
        online1v1Button.disabled = false;
    } else {
        console.log("false");
        online1v1Button.disabled = true;
    }
}

// Fonction pour vérifier la présence du cookie JWT
function hasJwtCookie() {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        console.log(name + "= " + value);
        if (name.trim() === 'token') { // Assurez-vous de mettre le bon nom de cookie ici
            return true;
        }
    }

    return false;
}

// Fonction pour rediriger vers la page "Online 1v1" si le token est présent
function redirectToOnline1v1() {
    const token = getToken();
    if (token) {
        window.location.href = "game/onlineGame/online1v1.html?token=${token}";
    }
}

// Fonction pour obtenir le token depuis les cookies
function getToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('token=')) {
            return cookie.substring('token='.length);
        }
    }
    return null;
}

function disconnect() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = 'index.html';
}

// Appeler la fonction lors du chargement de la page
window.addEventListener('load', checkTokenAndDisplayLinks);