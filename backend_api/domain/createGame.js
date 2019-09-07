
class CreateGame {

	constructor() {}
	
	handle(paramXyz) {

    console.log('/createGame GET', paramXyz);

    // get input via:
    // var xyz = body.paramXYZ

    // return as 200
    return '/createGame GET';


	}
	
}
module.exports = CreateGame