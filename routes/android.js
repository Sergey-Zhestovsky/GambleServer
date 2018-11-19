let express = require('express'),
    errorGenerator = require('../logic/error-generator'),
    router = express.Router(),
    config = require('../config'),
    requests = require('../logic/sql/requests');

let sql = new requests({connection: config.get('sql_connect')});

router.post("*", function (req, res, next) {
  try{
    req.body = JSON.parse(Object.keys(req.body)[0]);
  }catch (e){
    return res.send(501, "Incorrect request");
  }

  next();
});

router.post("/login", function (req, res, next) {
  let data = req.body;

  if(
    data.mail === undefined || data.mail === "" ||
    data.password === undefined || data.password === ""
  )
    return res.send(errorGenerator.requireData());

  sql.getUser(data, function (answer) {
    if(answer)
      return res.send(answer);

    return res.send({authorizationError: true});
  });
});

router.post("/trackers", function (req, res, next) {
  let data = req.body;

  if(
    data.id === undefined || data.id === ""
  )
    return res.send(errorGenerator.requireData());

  sql.getUserTrackers(data, function (answer) {
    if(answer.error)
      return res.send(errorGenerator.dataBaseCriticalError());

    return res.send(answer.result[0]);
  });
});

module.exports = router;
