var env = process.env.NODE_ENV;
if(env === undefined)
	env = 'development'
var config = require('./../config/'+env+'.env')

module.exports = {

	getConfig: function() {
		return config
	}

}