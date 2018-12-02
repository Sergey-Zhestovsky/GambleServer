let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    language = require('../logic/language');

router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'Gamble',
      text: language.getTranslate(req.data.language, 'main', 'product'),
      user: req.data.user
  });
});

module.exports = router;
