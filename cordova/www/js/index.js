// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    url = "http://coursigor.ps8.academy/";

    showUrl(url);
}

function showUrl(url) {
    window.location = url;
    return;
}
