let express = require('express'),
    router = express.Router(),
    mongo = require('../logic/mongodb/API'),
    language = require('../logic/language'),
    errorGenerator = require('../logic/error-generator'),
    User = require('../logic/class/user'),
    validator = require('../logic/class/requestValidator');

router.all('*', function(req, res, next) {
    if (req.data.user && req.data.user.id !== undefined)
        return res.redirect(`/`);

    next();
});

router.get('/', function(req, res, next) {
    res.render('registration', {
        title: 'Gamble',
        user: req.data.user,
        text: language.getTranslate(req.data.language, 'authorization')
    });
});

router.post('/', function(req, res, next) {
    let data = req.body;

    if (validator(data, ["name", "mail", "password"]))
        return res.send(errorGenerator.requireData());

    mongo.setUser(data, (error, answer) => {
        if (error) {
            return res.send(errorGenerator.mongodbError(req, error));
        }

        let auth = new User({
            id: answer._id,
            privilege: answer.privilege == null ? undefined : answer.privilege
        });

        auth.authorise(res).then(answer => {
            res.send(true);
        });
    });
});

module.exports = router;