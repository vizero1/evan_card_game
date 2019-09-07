var db = require('../db')
var lib = require('../lib')

var linkGenerator = lib.linkGenerator
var linkGen = new linkGenerator()
var linksDB = db.linksDB.instance
var output = lib.output.instance

// desc: generate miniUrl, check DB if not existing yet and then store it
module.exports = {
	
	get: function(req, res) {
		
		return new Promise(function(resolve, reject) {
			resolve('NOT_IMPLEMENTED_YET')
		})

	},

	post: function(body) {

		var that = this

		return new Promise(function(resolve, reject) {
			// validate input
			var realUrl = body.realUrl
			if(!realUrl || 0 === realUrl.length)
				reject('REALURL_NOT_DEFINED')

			// check and fix input
			realUrl = realUrl.toLowerCase()
			var n = realUrl.indexOf('https://')
			var n2 = realUrl.indexOf('http://')
			if(n == -1 && n2 == -1) {
				realUrl = "http://" + realUrl
			}

			// create link obj
			that.link = {}
			that.link.realUrl = realUrl

			// generate miniUrl hash and store it
			that.link.miniUrl = linkGen.generate(realUrl)
			linksDB
				.create(that.link)
				.then(resolve(that.link))
				.catch(reject)
		})



	}
	
}

