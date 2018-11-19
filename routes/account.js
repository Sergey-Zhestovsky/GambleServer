let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    requests = require('../logic/sql/requests'),
    errorGenerator = require('../logic/error-generator'),
    keyGenerator = require('../logic/class/keyGenerator'),
    language = require('../logic/language');

let sql = new requests({connection: config.get('sql_connect')});

router.all('*', function(req, res, next) {
  if(!(req.data.user && req.data.user.id !== undefined))
    return res.redirect(`/`);

  next();
});

router.get('/', function(req, res, next) {
  sql.getUser({
    id: req.data.user.id
  }, function (userData) {
    if(userData == undefined)
      return res.redirect('/');

    res.render('account', {
      title: 'SmartShare',
      userData,
      mapKey: config.get('map_key'),
      user: req.data.user,
      language: req.cookies.language,
      text: language.getTranslate(req.data.language, 'account')
    });
  });
});

router.post('/api/getAccountTables', function(req, res, next) {
  sql.getAccountTables({
    id: req.data.user.id
  }, function (answer) {
    res.send(answer);
  });
});

router.post('/api/addProduct', function(req, res, next) {
  let data = req.body;

  if(
      data.type === undefined || data.type === "" ||
      data.company === undefined || data.company === "" ||
      data.model === undefined || data.model === "" ||
      data.address === undefined || data.address === "" ||
      data.price === undefined || data.price === ""
    )
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  console.log(123);
  data.initialPassword = keyGenerator.generateKey(8);
  data.password = keyGenerator.generateKey(8);
  console.log(4);
  sql.addProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/api/deliveryProduct', function(req, res, next) {
  let data = req.body;

  if(data.id === undefined || data.id === "")
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.deliveryProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/api/editProduct', function(req, res, next) {
  let data = req.body;

  if(
    data.type === undefined || data.type === "" ||
    data.company === undefined || data.company === "" ||
    data.model === undefined || data.model === "" ||
    data.price === undefined || data.price === ""
  )
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.editProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/api/deleteProduct', function(req, res, next) {
  let data = req.body;

  if(data.id === undefined || data.id === "")
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.deleteProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/api/receiveRentedProduct', function(req, res, next) {
  let data = req.body;

  if(data.id === undefined || data.id === "")
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.receiveRentedProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/api/removeRentedProduct', function(req, res, next) {
  let data = req.body;

  if(data.id === undefined || data.id === "")
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.removeRentedProduct(data, function (answer) {
    res.send(answer);
  });
});

router.post('/stub/replenishAccount', function(req, res, next) {
  let data = req.body;

  if(data.cacheAmount === undefined || data.cacheAmount === "")
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.replenishAccount(data, function (answer) {
    res.send(answer);
  });
});

module.exports = router;