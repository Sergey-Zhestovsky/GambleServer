let config = require('../../config'),
    jwt = require('jsonwebtoken');

module.exports = function dynamicToken(req, res, next) {
    let dynamicToken = req.cookies.dynamicToken,
        bodyToken = req.body.dynamicToken;

    if (!dynamicToken)
    	return cookieNotFound();

    if (!bodyToken)
    	return bodyTokenNotFound();

    if (dynamicToken !== bodyToken)
    	return signsNotEqual();

    jwt.verify(bodyToken, config.get('encode_server_key'), function(err, decoded) {
        if (err)
            return invalidToken();

    	return next();
    });
};

function cookieNotFound() {
 //token = jwt.sign(userJSON, config.get('encode_server_key'));
 console.log('cookieNotFound')
}

function bodyTokenNotFound() {
 console.log('bodyTokenNotFound')

}

function invalidToken() {
 console.log('invalidToken')

}

function signsNotEqual() {
 console.log('signsNotEqual')

}