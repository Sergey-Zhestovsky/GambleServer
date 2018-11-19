let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    requests = require('../logic/sql/requests'),
    errorGenerator = require('../logic/error-generator'),
    language = require('../logic/language'),
    User = require('../logic/class/user');

let sql = new requests({connection: config.get('sql_connect')});

router.get('/exit', function(req, res, next) {
  if(req.data.user && req.data.user.id == undefined)
    return res.redirect(`/`);

  let auth = new User({
    token: req.cookies.token
  });

  auth.exit(res).then(answer => {
    console.log(answer)
    res.redirect('/');
  });
});

router.all('*', function(req, res, next) {
  if(req.data.user && req.data.user.id !== undefined)
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

  if(
    data.mail === undefined || data.mail === "" ||
    data.password === undefined || data.password === ""
  )
    return res.send(errorGenerator.requireData());

  sql.getUser(data, function (answer) {
    if(!(answer !== undefined && answer.user_id !== undefined))
      return res.send(errorGenerator.loginError());

    let auth = new User({
      id: answer.user_id,
      userSalt: answer.user_id,
      privilege: answer.privilege_id == null ? undefined : answer.privilege_id
    });

    auth.authorise(res).then(answer => {
      res.send(true);
    });
  });
});

module.exports = router;