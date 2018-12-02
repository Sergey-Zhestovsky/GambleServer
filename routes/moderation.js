let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    mongo = require('../logic/mongodb/API'),
    errorGenerator = require('../logic/error-generator'),
    language = require('../logic/language'),
    validator = require('../logic/class/requestValidator');

router.all('*', function(req, res, next) {
  if(!(req.data.user && req.data.user.privilege > 0))
    return res.redirect(`/`);

  next();
});

router.get('/', function(req, res, next) {
  res.redirect('/moderation/productTypes');
});

router.get('/:id', function(req, res, next) {
  let id = req.params.id;

  res.render('moderation', {
    title: 'Gamble',
    user: req.data.user,
    text: language.getTranslate(req.data.language, 'moderation'),
    module: id
  });
});

router.post('/:table/:action', function(req, res, next) {
  let table = req.params.table,
      action = req.params.action,
      data = req.body;

  if (action == "get" && validator(data, ["length", "padding"]))
    return res.send(errorGenerator.requireData());
  
  mongo.tablesDataManager(table, action, data, (error, result) => {
    if (error) {
        return res.send(errorGenerator.mongodbError(req, error));
    }
      res.send({error, result});
  });
});

module.exports = router;
