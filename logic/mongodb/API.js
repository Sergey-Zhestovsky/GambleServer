let mongoose = require("./connect"),
    schemas = require("./schemas"),
    errorHandler = require("./errorHandler");

function setUser(data, cb = function(){}) {
    let user = new schemas.User(data);

    user.save(function(err, value) {
        if (err) {
            return errorHandler("setUser", err, cb);
        }

        cb(null, value);
    });
}

function getUser(searchData, data, cb = data) {
    schemas.User.aggregate([{
        $match: searchData
    }, {
        $lookup: {
            from: 'privileges',
            localField: 'privilege',
            foreignField: '_id',
            as: 'privilegeObj'
        }
    }, {
        $unwind: "$privilegeObj"
    }, {
        $limit: 1
    }], mongoCB.bind(null, cb));

    function mongoCB(cb = function(){}, err, value) {
        if (err) {
            return errorHandler("getUser", err, cb);
        }

        if (!value.length)
            return errorHandler("getUser", { code: "custom001" }, cb);

        let user = new schemas.User(value[0]);

        if (user.checkPassword(data.password))
            return cb(null, user);

        return errorHandler("getUser", { code: "custom001" }, cb);
    }
}

function getProductTypes(cb = function(){}) {
    schemas.ProductType.find({}, function(err, value) {
        if (err) {
            return errorHandler("getUser", err, cb);
        }

        cb(null, value);
    });
}

function setProductType(data, cb = function(){}) {
    let productTypes = new schemas.ProductType(data);

    productTypes.save(function(err, value) {
        if (err) {
            return errorHandler("setUser", err, cb);
        }

        cb(null, value);
    });
}

function getProduct(data, cb = function(){}) {
    schemas.ProductType.find({}, function(err, value) {
        if (err) {
            return errorHandler("getUser", err, cb);
        }

        cb(null, value);
    });
}

function setProduct(data, cb = function(){}) {
    
}

module.exports = {
    setUser,
    getUser
};