module.exports = {
	onlyLettersAndDigits: function(str) {
		return !/[^a-zA-Z0-9]/.test(str)
	}
}
