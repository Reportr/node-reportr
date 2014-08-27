var unirest = require('unirest');
var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');
var querystring = require('querystring');

var Client = function(config) {
    events.EventEmitter.call(this);

    this.set(config);
};
util.inherits(Client, events.EventEmitter);


// Update configuration
Client.prototype.set = function(config) {
    this.config = _.extend({
        'host': null,
        'auth': null
    },
    this.config || {},
    config || {});
};


Client.prototype.request = function(mode, method, args) {
    var that = this;
    var deferred = Q.defer();
    mode = mode.toLowerCase();

    if (mode == "get" && args) {
        method = method+"?"+querystring.stringify(args);
    }

    var r = unirest[mode](this.config.host+"/api/"+method);
    r.strictSSL(false);

    r.headers({
        'Accept': 'application/json',
        'User-Agent': 'reportr-node'
    });

    if (this.config.auth) {
        r.auth({
            user: this.config.auth.username,
            pass: this.config.auth.password,
            sendImmediately: true
        });
    }

    if (args) {
        r.send(args);
    }

    r.end(function (response) {
        var body = response.body;
        var error = response.error;

        if (response.code != 200) {
            that.emit("apierror", error, body);
            if (body && body.error) error = new Error(body.error);
            error = error || new Error(JSON.stringify(body));
            deferred.reject(error);
        } else {
            deferred.resolve(body);
        }
    });

    return deferred.promise;
};

// Post an event
Client.prototype.postEvent = function(name, properties) {
    return this.request("POST", "events", {
        'type': name,
        'properties': properties
    });
};

module.exports = Client;

