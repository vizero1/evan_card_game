var joinGameDomain = require('./../domain/joinGame');
var outputHandling = require('./../lib/outputHandling.js');

var output = outputHandling.instance;

module.exports = {
  get: function(req, res) {
    joinGameDomain
      .get()
      .then(data => output.throw200(res, data))
      .catch(err => output.throw404(res, err));
  },

  put: function(req, res, body) {
    joinGameDomain
      .put(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  },

  post: function(req, res, body) {
    joinGameDomain
      .post(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  }
};
