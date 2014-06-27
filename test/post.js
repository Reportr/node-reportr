var Reportr = require("../lib");


// Create a client instance
var client = new Reportr({
    host: "http://localhost:5000",
    auth: null
});

// Post an event
client.postEvent("test", {
   a: 1
})
.then(function() {
    console.log("Passed!")
}, function(e) {
    console.log("Error:", e.stack || e.message || e);
});
