let express = require('express'),
    router = express.Router(),
    mongo = require('../logic/mongodb/API'),
    errorGenerator = require('../logic/error-generator'),
    language = require('../logic/language'),
    dynamicTokenValidator = require('./modules/dynamicToken.js'),
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
            language: req.cookies.language,
            text: language.getTranslate(req.data.language, 'account')
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

router.post('/deviceStub/get', function(req, res, next) {
    let data = req.body;

    if (validator(data, ["name"]))
        return res.send(errorGenerator.requireData());

    data.value = Math.random();

    setTimeout(() => {
        res.send({error: null, result: data});
    }, 2000);
});

module.exports = router;