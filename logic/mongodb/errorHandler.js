let config = require("./errorConfig.json");

function errorHandler(functionName = "default", err, cb) {
	let describe = 	(config[functionName] && config[functionName][err.code]) || 
					(config.default && config.default[err.code]) ||
					err.errmsg;

	return cb({
		origin: err,
		source: functionName,
		describe,
		code: err.code
	});
}

module.exports = errorHandler;