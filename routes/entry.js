let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    URL = require('url-parse'),
    User = require('../logic/class/user');

router.all('*', function(req, res, next) {
  new Promise((resolve, reject) => {
    req.data = {};
    resolve([req, res]);
  })
    .then(crossDomainFireWall)
    .then(authoriseUser)
    .then(getLanguage)
    .then(next)
    .catch(([req, res]) => {
      return res.header("Connection", "close").destroy();
    });

  //req.data = {};
  // authoriseUser([req, res])
  //   .then(getLanguage)
  //   .then(next);
});

function crossDomainFireWall([req, res]) {
  return new Promise((resolve, reject) => {
    let head = req.headers;

    if (!head.referer)
      resolve([req, res]);

    let referrer = URL(head.referer, true);

    if (head.host != referrer.host) {
      reject([req, res]);
    }

    resolve([req, res]);
  });
}

function authoriseUser([req, res]) {
  return new Promise((resolve, reject) => {
    if (req.cookies.token !== undefined) {
      let auth = new User();

      auth.verifyFromToken(req.cookies.token)
        .then(answer => {
          req.data.user = answer;
          resolve([req, res]);
        })
        .catch(error => {
          res.cookie('token', null, {expires: new Date(0)});
          resolve([req, res]);
        });
    } else {
      req.data.user = {};
      resolve([req, res]);
    }
  });
}

function getLanguage([req, res]) {
  if(req.cookies.language === undefined) {
    let l = config.get('default_language');
    res.cookie('language', l, {expires: new Date(Date.now() + 31536000000), path: "/"});
    req.data.language = l;
  }else{
    req.data.language = req.cookies.language;
  }
}

module.exports = router;
