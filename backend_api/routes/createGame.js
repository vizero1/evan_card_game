var createGameDomain = require('./../domain/createGame')
var outputHandling = require('./../lib/outputHandling.js')

var createGameDomainInstance = new createGameDomain()
var output = outputHandling.instance

class CreateGameRoute {

	constructor() {}
	
	handle(req, res) {

		var paramXyz = req.params.xyz

		createGameDomainInstance
			.post(paramXyz)
			.then(data => {
				res.redirect(data.realUrl)
				res.end()
			})
			.catch(err => output.throw200(res, err))

	}
	
}
module.exports = CreateGameRoute