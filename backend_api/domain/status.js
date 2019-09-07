module.exports = {
  get: function(req, res) {
    return new Promise(function(resolve, reject) {
      resolve('status GET working');
    });
  },

  put: function(req, res) {
    return new Promise(function(resolve, reject) {
      resolve('status PUT working');
    });
  },

  post: function(body) {
    return new Promise(function(resolve, reject) {
      resolve('status POST working');
    });
  }
};
