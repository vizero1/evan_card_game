var express = require('express');
var app = express();
var lib = require('./lib');
var config = require('./lib/config.js').getConfig();

var routes = lib.routeHandler.instance;

// initialize RouteHandler
app = routes.handle(app);

console.log('Webserver started successful');
app.listen(config.port);
