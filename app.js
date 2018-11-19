let createError = require('http-errors'),
    express = require('express'),
    bodyParser = require("body-parser"),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    config = require('./config'),
    logger = require('morgan'),
    language = require('./logic/language'),
    favicon = require('serve-favicon');

language.setDefaultLayouts(['title', 'footer']);

let entryRouter =         require('./routes/entry'),
    registrationRouter =  require('./routes/registration'),
    authorisationRouter = require('./routes/authorisation'),
    indexRouter =         require('./routes/index'),
    accountRouter =       require('./routes/account'),
    moderationRouter =    require('./routes/moderation'),
    errorRouter =         require('./routes/error');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (app.get('env') === 'development') {
  app.use(logger('dev', {
    skip: function (req, res) { return req.originalUrl.indexOf(".") != -1; }
  }));
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let publicRoute = "public";

if (app.get('env') === 'development') {
  publicRoute = "src";
}
app.use("/js", express.static(__dirname + `/${publicRoute}/js`));
app.use("/css", express.static(__dirname + `/${publicRoute}/css`));
app.use("/img", express.static(__dirname + `/${publicRoute}/img`));
app.use("/fonts", express.static(__dirname + `/${publicRoute}/fonts`));
app.use(favicon(__dirname + `/${publicRoute}/img/favicon.ico`)); 

app.all("*", entryRouter);
app.use('/', indexRouter);
app.use('/registration', registrationRouter);
app.use('/authorisation', authorisationRouter);
app.use('/account', accountRouter);
app.use('/moderation', moderationRouter);

app.use(function(req, res, next) {
  next(createError(404));
});
app.use(errorRouter.error);
app.use(errorRouter.devError);

module.exports = app;
