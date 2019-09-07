var lib = require('./../lib')
// var linkGenerator = lib.linkGenerator
// var linkGen = new linkGenerator()
// var linksDB = db.linksDB.instance
var output = lib.output.instance

// desc: generate miniUrl, check DB if not existing yet and then store it
module.exports = {
	
	get: function(req, res) {
		return new Promise(function(resolve, reject) {
			resolve('creatGame GET  working')
		})
	},

  
	put: function(req, res) {
		return new Promise(function(resolve, reject) {
			resolve('creatGame PUT working')
		})
  },
  
	post: function(body) {
		var that = this
		return new Promise(function(resolve, reject) {
			// validate input
			var realUrl = body.realUrl
			if(!realUrl || 0 === realUrl.length)
				reject('REALURL_NOT_DEFINED')
      resolve("creatGame post working");
		})
	}
	
}
