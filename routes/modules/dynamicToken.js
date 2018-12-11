let config = require('../../config'),
    keyGenerator = require("../../logic/class/keyGenerator.js"),
    errorGenerator = require('../../logic/error-generator'),
    jwt = require('jsonwebtoken');

module.exports = function dynamicToken(req, res, next) {
    let dynamicToken = req.cookies.dynamicToken,
        bodyToken = req.body.dynamicToken;

    if (!dynamicToken)
    	return generateCookie(req, res, "cookieNotFound");

    if (!bodyToken)
        return res.send(errorGenerator.dynamicCookie("bodyTokenNotFound", dynamicToken));

    if (dynamicToken !== bodyToken) 
        return res.send(errorGenerator.dynamicCookie("signsNotEqual", dynamicToken));

    jwt.verify(bodyToken, config.get('encode_server_key'), function(err, decoded) {
        if (err)
          return generateCookie(req, res, "invalidToken");

        delete req.body.dynamicToken;

        return next();
    });
};

function generateCookie(req, res, message) {
	let token = jwt.sign(keyGenerator(8), config.get('encode_server_key'));  
    
    res.cookie('dynamicToken', token, { 
    	expires: false, 
    	httpOnly: true, 
    	maxAge: 60 * 60 * 1000 
    });
   
    return res.send(errorGenerator.dynamicCookie(message, token));
}