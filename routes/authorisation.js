let express = require('express'),
    router = express.Router(),
    mongo = require('../logic/mongodb/API'),
    language = require('../logic/language'),
    errorGenerator = require('../logic/error-generator'),
    User = require('../logic/class/user'),
    validator = require('../logic/class/requestValidator');

router.post('/exit', function(req, res, next) {
    if (req.data.user && req.data.user.id == undefined)
        return res.redirect(`/`);

    new User().exit(req.cookies.token, res).then(answer => {
        res.redirect('back');
    });
});

router.all('*', function(req, res, next) {
    if (req.data.user && req.data.user.id !== undefined)
        return res.redirect(`/`);
    next();
});

router.get('/', function(req, res, next) {
    res.render('authorisation', {
        title: 'Gamble',
        user: req.data.user,
        text: language.getTranslate(req.data.language, 'authorization')
    });
});

router.post('/login', function(req, res, next) {
    let data = req.body;
  
    if (validator(data, ["mail", "password"]))
        return res.send(errorGenerator.requireData());

    mongo.getUser({mail: data.mail}, data, (error, answer) => {
        if (error) {
            return res.send(errorGenerator.mongodbError(req, error));
        }

        let auth = new User({
            id: answer._id,
            privilege: answer.privilegeObj == null ? undefined : answer.privilegeObj.type
        });
    
        auth.authorise(res).then(answer => {
            res.send(true);
        });
    });
});

module.exports = router;