let express = require('express'),
  router = express.Router(),
  config = require('../config'),
  requests = require('../logic/sql/requests'),
  language = require('../logic/language'),
  errorGenerator = require('../logic/error-generator'),
  User = require('../logic/class/user');

let sql = new requests({connection: config.get('sql_connect')});

router.all('*', function(req, res, next) {
  if(req.data.user && req.data.user.id !== undefined)
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

  if(
    data.name === undefined || data.name === "" ||
    data.mail === undefined || data.mail === "" ||
    data.password === undefined || data.password === ""
  )
    return res.send(errorGenerator.requireData());

  sql.setUser(data, function (answer) {
    if(answer.error)
      return res.send(answer);

    let auth = new User({
      id: answer.user_id,
      userSalt: answer.user_id,
      privilege: answer.privilege_id == null ? undefined : answer.privilege_id
    });

    auth.authorised(res).then(answer => {
      res.send(true);
    });
  });
});

module.exports = router;