var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');
var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');

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
    mode = mode.toUpperCase();

    var parsed = url.parse(this.config.host);

    var content = args? JSON.stringify(args) : "";

    var options = {
        hostname: parsed.hostname,
        port: parsed.port || ((parsed.protocol == "https://")? 443 : 80),
        path: '/api/'+method,
        method: mode,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'reportr-node',
            'Content-Length': (mode == "POST") ? content.length : 0
        }
    };

    // Querystring
    if (mode == "GET" && args) {
        options.path += "?"+querystring.stringify(args);
    }

    // Auth
    if (this.config.auth) {
        options.headers.Authorization = 'Basic '+(new Buffer(this.config.auth.username+":"+this.config.auth.password).toString('base64'));
    }


    var handler = (parsed.protocol == "https://")? https : http;


    var req = http.request(options, function(res) {
        var body = "";

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('error', function(e) {
            deferred.reject(e);
        });
        res.on('end', function() {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return deferred.reject(body);
            }

            if (res.statusCode != 200) {
                var error = new Error(body.error || body);
                deferred.reject(error);
            } else {
                deferred.resolve(body);
            }
        });
    });

    // Handle errors
    req.on('error', function(e) {
        deferred.reject(e);
    });

    // Write post data
    if (mode == "POST" && args) req.write(content);

    req.end();

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

