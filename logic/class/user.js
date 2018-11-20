let config = require('../../config'),
    errorGenerator = require('../error-generator'),
    jwt = require('jsonwebtoken');

class User {
  constructor({id, privilege} = {}) {
    this.id = id;
    this.privilege = privilege;
  }

  static verifyFromToken (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.get('encode_server_key'), function(err, decoded) {
        if(err)
          reject(err);
  
        resolve(new User(decoded));
      });
    });
  }

  getUser () {
    return {
      id: this.id,
      privilege: this.privilege
    }
  }

  exit (token, res) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.get('encode_server_key'), function (err, decoded) {
        res.cookie('token', null, {expires: new Date(0)});

        if (err)
          resolve(err);

        resolve();
      });
    });
  }

  authorise (res) {
    return new Promise((resolve, reject) => {

      let user = this.getUser(),
          userJSON = JSON.stringify(user),
          token = jwt.sign(userJSON, config.get('encode_server_key'));

      res.cookie('token', token, { expires: new Date(Date.now() + 315360000), httpOnly: true });
      resolve(user);
    });
  }
}

module.exports = User;