
var socket = io("/api/1v1Online");
window.addEventListener('load', function() {
    console.log("load");
    socket.emit('joinOrCreate1v1', { message: "Okay" });

});

