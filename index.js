// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// Instantiate the HTTP Server

const server = http.createServer(function (req, res) {
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an Object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // choose the handler this request should go to, If one is not found, use the not found handlers
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handlers, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handlers, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Conver the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            res.end(payloadString);

            // Log the request path
            /*console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and with these query parameters ', queryStringObject);
            console.log('Request received with these headers: ', headers);
            console.log('Request received with this payload: ', buffer);*/
            console.log('Returning the response: ', statusCode, payloadString);
        });
    });
});

server.listen(config.port, function () {
    console.log("The server is listening on port " + config.port + " now");
    console.log("The environment is: " +  config.envName);
});

// Define the handlers
var handlers = {};

// Hello Handler
handlers.hello = function (data, callback) {
    callback(200, {
        welcome: "Hi world this is a homework for pirple"
    });
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};
// Define a request routes
var router = {
    'hello': handlers.hello
};
