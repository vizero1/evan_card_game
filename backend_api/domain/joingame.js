var db = require('../db')

var linksDB = db.linksDB.instance

class UnknownUrl {

	constructor() {}
	
	handle(miniUrl) {
		return new Promise(function(resolve, reject) {

			var conditions = {'miniUrl': miniUrl}

			var findSuccessful = function(data) {
				data.accessCount++
				linksDB
					.update(conditions, data)
				resolve(data)
			}

			linksDB
				.findOne(conditions, 'realUrl miniUrl accessCount')
				.then(findSuccessful)
				.catch(reject)
		})

	}
	
}
module.exports = UnknownUrl