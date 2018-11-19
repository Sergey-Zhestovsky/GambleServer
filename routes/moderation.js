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
    title: 'SmartShare',
    user: req.data.user,
    text: language.getTranslate(req.data.language, 'moderation'),
  });
});

router.post('/', function(req, res, next) {
  sql.getModerationData(function (answer) {
    res.send(answer);
  });
});

router.post('/confirmUser', function(req, res, next) {
  let data = req.body;

  if(
    data.id === undefined || data.id === "" ||
    data.passportId === undefined || data.passportId === ""
  )
    return res.send(errorGenerator.requireData());

  sql.confirmUser(data, function (answer) {
    res.send(answer);
  });
});

router.post('/confirmDelivery', function(req, res, next) {
  let data = req.body;

  if(
    data.id === undefined || data.id === "" ||
    data.userId === undefined || data.userId === ""
  )
    return res.send(errorGenerator.requireData());

  sql.deliveryProduct(data, function (answer) {
    res.send(answer);
  });
});

module.exports = router;
