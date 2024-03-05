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
