// Fonction pour obtenir la valeur d'un cookie par son nom
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

// Fonction pour imprimer les cookies dans la console
function printCookies() {
    var allCookies = document.cookie;
    console.log("Cookies:", allCookies);
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