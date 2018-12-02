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

async function getUsers(searchData, {length, padding}, cb = data) {
    let dbLength, data;

    try {
        dbLength = await schemas.User.countDocuments();
        length = length == -1 ? dbLength : length;
        data = await schemas.User.aggregate([{
            $match: searchData
        }, { 
            $skip : Number(padding) 
        }, { 
            $limit : Number(length) 
        }, {
            $lookup: {
                from: 'privileges',
                localField: 'privilege',
                foreignField: '_id',
                as: 'privilege'
            }
        }, {
            $unwind: {
                path: "$privilege",
                preserveNullAndEmptyArrays: true
            }
        }]);
    } catch (err) {
        return errorHandler("getUsers", err, cb);
    }
    
    cb(null, {dbLength, data});
}

async function getProductTypes({length, padding}, cb = function(){}) {
    let dbLength, data;

    try {
        dbLength = await schemas.ProductType.countDocuments();
        length = length == -1 ? dbLength : length;
        data = await schemas.ProductType.find().skip(Number(padding)).limit(Number(length));
    } catch (err) {
        return errorHandler("getProductTypes", err, cb);
    }
    
    cb(null, {dbLength, data});
}

function setProductType(data, cb = function(){}) {
    let productTypes = new schemas.ProductType(data);

    productTypes.save(function(err, value) {
        if (err) {
            return errorHandler("setProductType", err, cb);
        }

        cb(null, value);
    });
}

function editProductType(data, cb = function(){}) {
    schemas.ProductType.where({ _id: data._id }).updateOne(data, function(err, value) {
        if (err) {
            return errorHandler("editProductType", err, cb);
        }

        if (value.nModified != value.n)
            return errorHandler("editProductType", { code: "custom002" }, cb);

        if (value.n == 0)
            return errorHandler("editProductType", { code: "custom003" }, cb);

        cb(null, data);
    });
}

async function getProducts(searchData, {length, padding}, cb = function(){}) {
    let dbLength, data;

    try {
        dbLength = await schemas.Product.find(searchData).countDocuments();
        length = length == -1 ? dbLength : length;
        data = await schemas.Product.aggregate([{
            $match: searchData
        }, { 
            $skip : Number(padding) 
        }, { 
            $limit : Number(length) 
        }, {
            $lookup: {
                from: 'producttypes',
                localField: 'productType',
                foreignField: '_id',
                as: 'productType'
            }
        }, {
            $unwind: "$productType"
        }]);
    } catch (err) {
        return errorHandler("getProducts", err, cb);
    }
    
    cb(null, {dbLength, data});
}

function setProduct(data, cb = function(){}) {
    let product = new schemas.Product(data);

    product.save(function(err, value) {
        if (err) {
            return errorHandler("setProduct", err, cb);
        }

        return getProducts(value, {length: 1, padding: 0}, (error, result) => {
            let data = result ? result.data[0] : result;
            cb(error, data);
        });
    });
}

function editProduct(data, cb = function(){}) {
    schemas.Product.where({ _id: data._id }).updateOne(data, function(err, value) {
        if (err) { 
            return errorHandler("editProduct", err, cb);
        }

        if (value.nModified != value.n)
            return errorHandler("editProduct", { code: "custom002" }, cb);

        if (value.n == 0)
            return errorHandler("editProduct", { code: "custom003" }, cb);

        return getProducts({_id: new mongoose.Types.ObjectId(data._id)}, {length: 1, padding: 0}, (error, result) => {
            let data = result ? result.data[0] : result;
            cb(error, data);
        });
    });
}

function deleteProduct(data, cb = function(){}) {
    schemas.Product.deleteOne({ _id: data._id }, function(err, value) {
        if (err) {
            return errorHandler("deleteProduct", err, cb);
        }

        if (value.n == 0)
            return errorHandler("deleteProduct", { code: "custom003" }, cb);

        if (value.ok == 0)
            return errorHandler("deleteProduct", { code: "custom004" }, cb);

        cb(null, true);
    });
}

function tablesDataManager(table, action, ...args) {
    const dataTableController = {
        productTypes: {
            get: getProductTypes,
            add: setProductType,
            edit: editProductType
        },
        products: {
            get: getProducts.bind(null, {user: null}),
            add: setProduct,
            edit: (data, ...args) => { delete data.user; editProduct(data, ...args); },
            delete: deleteProduct
        },
        users: {
            get: getUsers.bind(null, {})
        }
    };

    if (dataTableController[table][action])
        return dataTableController[table][action](...args)
    else
        return errorHandler("tablesDataManager", { code: "custom005" }, args[args.length - 1]);
}

async function getUserAccountData(searchData, cb = function(){}) {
    let deviceLength, user;

    try {
        deviceLength = await schemas.Product.find({user: searchData._id}).countDocuments();
        user = await schemas.User.findOne(searchData);
    } catch (err) {
        return errorHandler("getUserAccountData", err, cb);
    }
    
    cb(null, {deviceLength, user}); 
}

function userDeviceManager(action, ...args) {
    const cotroller = {
        get: getProducts
    }

    
    if (cotroller[action])
        return cotroller[action](...args);
    else
        return errorHandler("userDeviceManager", { code: "custom005" }, args[args.length - 1]);
}

module.exports = {
    setUser,
    getUser,
    tablesDataManager,
    getUserAccountData,
    userDeviceManager
};