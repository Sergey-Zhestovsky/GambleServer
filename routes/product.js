let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    requests = require('../logic/sql/requests'),
    createError = require('http-errors'),
    errorGenerator = require('../logic/error-generator'),
    language = require('../logic/language');

let sql = new requests({connection: config.get('sql_connect')});

router.get('/:productId', function(req, res, next) {

  let productId = req.params.productId;
  sql.getProduct({productId}, function (answer) {
    let product = answer.result[0].data[0];

    if(answer.error != null || product === undefined)
      return next(createError(404, "Product not found"));

    res.render('product', {
      title: `Product - [${product.product_id}] ${product.type_name}`,
      text: language.getTranslate(req.data.language, 'product'),
      mapKey: config.get('map_key'),
      user: req.data.user,
      product
    });
  });
});

router.post("/api/rentProduct", function (req, res, next) {
  if(!(req.data.user && req.data.user.id !== undefined))
    return res.send(errorGenerator.accessError());

  let data = req.body;

  if(data.productId === undefined || data.productId === '')
    return res.send(errorGenerator.requireData());

  data.userId = req.data.user.id;
  sql.setRent(data, function (answer) {
    res.send(answer);
  });
});

module.exports = router;
