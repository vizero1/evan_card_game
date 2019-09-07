var utils = require('./../utils');

class RouteHandler {
  constructor() {}

  handle(app) {
    app.get('/creategame', function(req, res) {
      handleRoute(req, res);
    });
    app.post('/creategame', function(req, res) {
      handleRoute(req, res);
    });
    app.put('/creategame', function(req, res) {
      handleRoute(req, res);
    });
    app.post('/joingame', function(req, res) {
      handleRoute(req, res);
    });
    app.get('/status', function(req, res) {
      handleRoute(req, res);
    });
    app.post('/makemove', function(req, res) {
      handleRoute(req, res);
    });

    var handleRoute = function(req, res) {
      var urlWithSlash = req.route.path;
      var url = urlWithSlash.substring(1);
      var route = urlHasRoute(url);

      try {
        switch (req.method) {
          case 'GET':
            route.get(req, res);
            break;
          case 'POST':
            var body = '';
            req.on('data', function(chunk) {
              body += chunk;
            });
            req.on('end', function() {
              var inputAsJson = {};
              if (!!body) {
                inputAsJson = JSON.parse(body);
              }
              route.post(req, res, inputAsJson);
            });
            break;
          case 'PUT':
            route.put(req, res);
            break;
          case 'DELETE':
            route.delete(req, res);
            break;
          default:
            throw 'invalid request method';
        }
      } catch (e) {
        throw404(req, res, e);
      }
    };

    var urlHasRoute = function(url) {
      if (!utils.string.onlyLettersAndDigits(url)) {
        return false;
      }
      var useModule = undefined;
      try {
        // check if module exists in routes folder
        useModule = require('./../routes/' + url + '.js');
      } catch (e) {
        if (e.toString().includes('Cannot find module'))
          console.log("Can't find route: /" + url);
        else console.log(e);
        return false;
      }
      return useModule;
    };

    var throw404 = function(req, res, e) {
      var url = req.params.url;
      console.log('throw 404 error at ' + url);
      console.log(e);
      res.writeHead(404);
      res.end();
    };

    return app;
  }
}

module.exports = RouteHandler;
RouteHandler.instance = new RouteHandler();
