let nconf = require('nconf'),
    path = require('path'),
    fs = require('fs');

let getPath = path.join.bind(null, __dirname);

nconf
  .argv()
  .env()
  .file({ file: getPath('config.json') });

nconf.getOnes = function (key) {
  let result = this.get(key);
  this.set(key, undefined);
  return result;
};

module.exports = nconf;