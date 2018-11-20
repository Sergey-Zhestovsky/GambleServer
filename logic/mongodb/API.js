let mongoose = require("./connect"),
    schemas = require("./schemas"),
    errorHandler = require("./errorHandler");

function setUser(data, cb) {
    let user = new schemas.User(data);

    user.save(function(err, value) {
        if (err) {
            return errorHandler("setUser", err, cb);
        }

        cb(err, value);
    });
}

function getUser(data, cb) {
    schemas.User.findOne({ mail: data.mail }, function(err, value) {
        if (err) {
            return errorHandler("getUser", err, cb);
        }

        if (value === null)
            return errorHandler("getUser", {code: "custom001"}, cb);

        if(value.checkPassword(data.password))
            return cb(null, value);

        return errorHandler("getUser", {code: "custom001"}, cb);
    });
}

module.exports = {
    setUser,
    getUser
};