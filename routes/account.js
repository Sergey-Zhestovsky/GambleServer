let express = require('express'),
    router = express.Router(),
    mongo = require('../logic/mongodb/API'),
    errorGenerator = require('../logic/error-generator'),
    language = require('../logic/language'),
    dynamicTokenValidator = require('./modules/dynamicToken.js'),
    deviceBrocker = require('./deviceBrocker.js').setRequestInQueue,
    validator = require('../logic/class/requestValidator');

router.all('*', function(req, res, next) {
    if (!(req.data.user && req.data.user.id !== undefined))
        return res.redirect(`/`);

    next();
});

router.post('*', dynamicTokenValidator);

router.get('/', function(req, res, next) {
    mongo.getUserAccountData({ _id: req.data.user.id }, (error, result) => {
        if (error)
            return res.send(errorGenerator.mongodbError(req, error));

        return res.render('account', {
            title: 'Gamble',
            userData: result,
            user: req.data.user,
            text: language.getTranslate(req.data.language, "account", "tableModule")
        });
    });
});

router.post('/devices/:action', function(req, res, next) {
    let action = req.params.action,
        data = req.body;

    if (action == "get" && validator(data, ["length", "padding"]))
        return res.send(errorGenerator.requireData());

    mongo.userDeviceManager(action, { user: req.data.user.id }, data, (error, result) => {
        if (error)
            return res.send(errorGenerator.mongodbError(req, error));

        res.send({ error, result });
    });
});

router.post('/deviceStub/get', deviceBrocker);

module.exports = router;