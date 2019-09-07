
class OutputHandling {
		
	constructor() {}
  
	throw200(res, data) {
		this.sendData(res, data, 200)
	}
	throw201(res, data) {
		this.sendData(res, data, 201)
	}

	throw400(res, err) {
		this.sendError(res, err, 400)
	}
	
	throw404(res, err) {
		this.sendError(res, err, 404)
	}

	sendData(res, data, httpStatus) {
		res.writeHead(httpStatus)
		if(typeof(data) !== 'object')
			data = {'data': data}
		var json = JSON.stringify(data);
		res.end(json)
	}

	sendError(res, err, httpStatus) {
		if(err !== null)
			console.log(err)
		res.writeHead(httpStatus)
		if(typeof(err) !== 'object')
			err = {'error': err}
		var json = JSON.stringify(err);
		res.end(json)
	}

}

module.exports = OutputHandling
OutputHandling.instance = new OutputHandling()