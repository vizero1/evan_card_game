var lib = require('./../lib');
var db = require('./../db');
var output = lib.output.instance;

module.exports = {
  get: function(req, res) {
    return new Promise(function(resolve, reject) {
      const deviceTwin = db.evan.createDeviceTwin();

      resolve('creatGame GET working');
    });
  },

  put: function(req, res) {
    return new Promise(function(resolve, reject) {
      resolve('creatGame PUT working');
    });
  },

  post: function(body) {
    var cards = [];

    var that = this;
    return new Promise(function(resolve, reject) {
      // validate input
      var paramXyz = body.paramXyz;
      if (!paramXyz || 0 === paramXyz.length) {
        reject('PARAMS_NOT_DEFINED');
      }
      resolve('creatGame post working');
    });
  }
};
