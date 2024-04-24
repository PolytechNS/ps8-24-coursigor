function isCordova() {
    // Check if Cordova is available
    return typeof cordova !== 'undefined';
}

function handlePageLoad(event, ref) {
    var url = event.url;
    // Check if the URL is your app's URL or an external URL
    if (url.indexOf('http://yourappdomain.com') === 0 || url.indexOf('https://yourappdomain.com') === 0) {
        // Load the URL within the same WebView
        ref.show();
    } else {
        // External URL, prevent default behavior (opening in system browser)
        event.preventDefault();
        // Load the URL within the same WebView
        ref.loadUrl(url);
    }
}

// Fonction pour vérifier la présence du token et activer/désactiver le bouton en conséquence
function checkTokenAndDisplayLinks() {
    const online1v1Button = document.getElementById('online1v1Button');
    const loginButton = document.querySelector('.login-button');
    const disconnectButton = document.getElementById('disconnect');
    const aiGameButton = document.getElementById('aiGameButton');
    const loadAiGameButton = document.getElementById('loadAIGame');

    if (hasJwtCookie()) {
        online1v1Button.style.display = 'inline';
        loginButton.style.display = 'none';
        disconnectButton.style.display = 'inline';
        aiGameButton.style.display = 'inline';
        loadAiGameButton.style.display = 'inline';
    } else {
        online1v1Button.style.display = 'none';
        loginButton.style.display = 'inline';
        disconnectButton.style.display = 'none';
        aiGameButton.style.display = 'none';
        loadAiGameButton.style.display = 'none';
    }
}
function redirectToLeaderboard() {
    window.location.href = 'leaderboard/leaderboard.html';
}
// Fonction pour vérifier la présence du cookie JWT
function hasJwtCookie() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        console.log(name + "= " + value);
        if (name.trim() === 'token') {
            return true;
        }
    }
    return false;
}
// Fonction pour rediriger vers la page "Online 1v1" si le token est présent
function redirectToOnline1v1() {
    window.location.href = "game/online1v1/online1v1.html";
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
// Appel de la fonction pour imprimer les cookies lorsque la page est chargée
window.onload = function () {
    printCookies();
};
//waits for the page to load
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("onlineGame").addEventListener('click', function () {
        //socket emits a new game event with the cookie token
        const cookies = document.cookie.split(';');
        let cookieString = "Cookies:\n";
        cookies.forEach(cookie => {
            cookieString += cookie.trim() + '\n';
        });
        console.log(cookieString);
        const socket = io('/api/onlineGame');
        socket.emit('newGame', cookieString);
        //loads the game page on message event
        socket.on('message', (msg) => {
            window.location.href = 'game/onlineGame/onlineGame.html';
        });
    });
});
// Appeler la fonction lors du chargement de la page
window.addEventListener('load', checkTokenAndDisplayLinks);

function connect() {
    if (isCordova()) {
        var url = 'Register/Register.html';
        var target = '_self'; // Open in the Cordova WebView
        var ref = cordova.InAppBrowser.open(url, target, 'location=no');

        // Add event listener for link clicks
        ref.addEventListener('loadstart', function(event) {
            handlePageLoad(event, ref);
        });
    } else {
        window.location.href = 'Register/Register.html';
    }
}

function localGame() {
    if (isCordova()) {
        var url = 'game/localGame.html';
        var target = '_self'; // Open in the Cordova WebView
        var ref = cordova.InAppBrowser.open(url, target, 'location=no');

        // Add event listener for link clicks
        ref.addEventListener('loadstart', function(event) {
            handlePageLoad(event, ref);
        });
    } else {
        window.location.href = 'game/localGame.html';
    }
}

function onlineGame() {
    const cookies = document.cookie.split(';');
    let cookieString = "Cookies:\n";
    cookies.forEach(cookie => {
        cookieString += cookie.trim() + '\n';
    });

    console.log(cookieString);
    const socket = io('/api/onlineGame');
    socket.emit('newGame', cookieString);


    socket.on('message', (msg) => {
        if (isCordova()) {
            var url = 'game/onlineGame/onlineGame.html';
            var target = '_self'; // Open in the Cordova WebView

            var ref = cordova.InAppBrowser.open(url, target, 'location=no');
        } else {
            window.location.href = 'game/onlineGame/onlineGame.html';
        }
    });
}
function loadAIGame() {
    window.location.href = 'game/onlineGame/onlineGame.html';
}