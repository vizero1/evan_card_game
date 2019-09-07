var db = require('../db')
var lib = require('../lib')

var linksDB = db.linksDB.instance
var output = lib.output.instance

module.exports = {
	
	get: function(req, res) {

		return new Promise(function(resolve, reject) {
			var conditions = {}
			var returnFields = 'realUrl miniUrl accessCount'
			linksDB
				.find(conditions, returnFields)
				.then(resolve)
				.catch(reject)
		})

	}
	
}

