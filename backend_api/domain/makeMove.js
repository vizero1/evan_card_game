module.exports = {
  get: function(req, res) {
    return new Promise(function(resolve, reject) {
      resolve('make move GET working');
    });
  },

  put: function(req, res) {
    return new Promise(function(resolve, reject) {
      resolve('make move PUT working');
    });
  },

  post: function(body) {
    return new Promise(function(resolve, reject) {
      resolve('make move POST working');
    });
  }
};
