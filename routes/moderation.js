let express = require('express'),
  router = express.Router(),
  config = require('../config'),
  requests = require('../logic/sql/requests'),
  errorGenerator = require('../logic/error-generator'),
  language = require('../logic/language');

let sql = new requests({connection: config.get('sql_connect')});

router.all('*', function(req, res, next) {
  if(!(req.data.user && req.data.user.privilege > 0))
    return res.redirect(`/`);

  next();
});

router.get('/', function(req, res, next) {
  res.render('moderation', {
    title: 'Gamble',
    user: req.data.user,
    text: language.getTranslate(req.data.language, 'moderation'),
  });
});

module.exports = router;
