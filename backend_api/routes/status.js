var getStatusDomain = require('./../domain/status');
var outputHandling = require('./../lib/outputHandling.js');

var output = outputHandling.instance;

module.exports = {
  get: function(req, res) {
    getStatusDomain
      .get()
      .then(data => output.throw200(res, data))
      .catch(err => output.throw404(res, err));
  },

  put: function(req, res, body) {
    getStatusDomain
      .put(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  },

  post: function(req, res, body) {
    getStatusDomain
      .post(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  }
};
