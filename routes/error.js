let language = require('../logic/language');

function error(err, req, res, next) {
  if(req.app.get('env') === 'development')
    return next(err);

  if(err.status === undefined)
    err.message = "Server error";

  err.status = err.status || 500;
  res.locals.message = err.message;
  res.locals.error = {status:err.status};

  sendMessage(err, res, req);
}

function devError(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;

  sendMessage(err, res, req);
}

function sendMessage(err, res, req) {
  res.status(err.status);
  res.render('error', {
    title: 'SmartShare',
    text: language.getTranslate(req.data.language, 'main', 'product'),
    user: req.data.user
  });
}

module.exports = {
  error,
  devError
};