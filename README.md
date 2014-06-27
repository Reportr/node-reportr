Node.js API Client
============

This module is a client for the reportr API. The APi is promsie based.

### How to install it?

```
$ npm install reportr-api
```

### How to use it?

```js
var Reportr = require("reportr-api");


// Create a client instance
var client = new Reportr({
    host: "http://example.com",
    auth: {
        username: "Me",
        password: "test"
    }
});

// Post an event
client.postEvent("test", {
   a: 1
});
```

