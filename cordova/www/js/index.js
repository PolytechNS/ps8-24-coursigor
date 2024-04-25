// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    url = "http://coursigor.ps8.academy/";
    checkConnectionAndLoadURL(url);


}

function checkConnectionAndLoadURL(url) {
    var networkState = navigator.connection.type;

    // If no network connection, alert the user and don't load the URL
    if (networkState === Connection.NONE) {
        alert('No network connection');
        navigator.app.exitApp();
    } else if (networkState === Connection.UNKNOWN || networkState === Connection.CELL_2G || networkState === Connection.CELL_3G || networkState === Connection.CELL_4G || networkState === Connection.CELL) {
        // alert('Network may be unstable');
        navigator.notification.confirm(
            'Network may be unstable, do you want to proceed?',  // message
            function(buttonIndex) {
                if (buttonIndex === 1) {
                    showUrlAndHideSplashScreen(url);
                } else {
                    // console.log('User clicked Cancel');
                    navigator.app.exitApp();
                }
            },                                     // callback to invoke with index of button pressed
            'Confirmation',                        // title
            ['OK', 'Cancel']                       // buttonLabels
        );
    } else {
        showUrlAndHideSplashScreen(url);
    }
}



function showUrlAndHideSplashScreen(url) {
    navigator.splashscreen.hide();
    window.location = url;
    return;
}
