var request = require("request");
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

    this.http = request.defaults({
        'auth': this.config.auth,
        'json': true,
        'headers': {
            'User-Agent': 'reportr-node'
        },
        'strictSSL': false,
    });
};


Client.prototype.request = function(mode, method, args) {
    var that = this;
    var deferred = Q.defer();
    mode = mode.toLowerCase();

    if (mode == "get" && args) {
        method = method+"?"+querystring.stringify(args);
    }

    this.http[mode](this.config.host+"/api/"+method, {
        'body': args
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve(body);
        } else {
            that.emit("apierror", error, body);
            if (body && body.error) error = new Error(body.error);
            error = error || new Error(JSON.stringify(body));
            deferred.reject(error);
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

