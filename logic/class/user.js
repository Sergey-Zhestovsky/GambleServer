let config = require('../../config'),
    errorGenerator = require('../error-generator'),
    jwt = require('jsonwebtoken');

function User(options = {}) {
  this.id = options.id;
  this.privilege = options.privilege;
}

User.prototype.verifyFromToken = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.get('encode_server_key'), function(err, decoded) {
      if(err)
        reject(err);

      let user;

      try {
        user = JSON.parse(decoded);
      } catch(e) {
        reject(e);
      }

      resolve(new User(user));
    });
  });
};

User.prototype.getUser = function () {
  return {
    id: this.id,
    privilege: this.privilege
  }
};

User.prototype.exit = function (res) {
  return new Promise((resolve, reject) => {
    jwt.verify(this.token, config.get('encode_server_key'), function (err, decoded) {
      res.cookie('token', null, {expires: new Date(0)});

      if (err)
        resolve(err);

      resolve();
    });
  });
};

User.prototype.authorise = function (res) {
  if(!this.userSalt)
    return errorGenerator.userSaltError();

  return new Promise((resolve, reject) => {
    let user = this.getUser(),
        userJSON = JSON.stringify(user),
        token = jwt.sign(userJSON, config.get('encode_server_key'));

    res.cookie('token', token, { expires: new Date(Date.now() + 315360000), httpOnly: true });
    resolve(user);
  });
};

module.exports = User;