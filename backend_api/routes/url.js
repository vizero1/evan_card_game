var urlDomain = require('./../domain/url');
var outputHandling = require('./../lib/outputHandling.js');

var output = outputHandling.instance;

module.exports = {
  get: function(req, res) {
    urlDomain
      .get()
      .then(data => output.throw200(res, data))
      .catch(err => output.throw404(res, err));
  },

  post: function(req, res, body) {
    urlDomain
      .post(body)
      .then(data => output.throw201(res, data))
      .catch(err => output.throw400(res, err));
  }
};
