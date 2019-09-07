var makeMoveDomain = require('./../domain/makeMove');
var outputHandling = require('./../lib/outputHandling.js');

var output = outputHandling.instance;

module.exports = {
  get: function(req, res) {
    makeMoveDomain
      .get()
      .then(data => output.throw200(res, data))
      .catch(err => output.throw404(res, err));
  },

  put: function(req, res, body) {
    makeMoveDomain
      .put(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  },

  post: function(req, res, body) {
    makeMoveDomain
      .post(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  }
};
