let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    requests = require('../logic/sql/requests'),
    language = require('../logic/language');

let sql = new requests({connection: config.get('sql_connect')});

router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'Gamble',
      text: language.getTranslate(req.data.language, 'main', 'product'),
      user: req.data.user
  });
});

module.exports = router;
