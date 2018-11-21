let mongoose = require("mongoose"),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

let privilegeScheme = new Schema({
    type: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String
    }
}, { versionKey: false });

let userScheme = new Schema({
    name: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        unique: true,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    privilege: {
        type: Schema.Types.ObjectId,
        ref: 'Privilege',
        default: null
    }
}, { versionKey: false });

userScheme.virtual("password")
    .set(function(pass) {
        this.salt = crypto.randomBytes(10).toString('hex');
        this.userPassword = this.encryptPassword(pass)
    })
    .get(() => this.userPassword)

userScheme.virtual("privilegeObj")
    .set((obj) => { this.privilege = JSON.stringify(obj); })
    .get(() => JSON.parse(this.privilege) )

userScheme.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
}
userScheme.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.userPassword;
}

let productTypeScheme = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
}, { versionKey: false });

productTypeScheme.path('url').default(function () {
  return `${this.name}.png`;
});

let productConfig = {
    name: {
        type: String
    },
    value: {
        type: String
    }, 
    using: {
        type: Boolean
    }
};

let productScheme = new Schema({
    productType: {
        type: Schema.Types.ObjectId,
        ref: 'ProductType',
        required: true
    },
    shopCode: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    passwordPreferenceList: [productConfig],
    voicePreferenceList: [productConfig],
    fingerprintPreferenceList: [productConfig]
}, { versionKey: false });

module.exports = {
    Privilege: mongoose.model('Privilege', privilegeScheme),
    User: mongoose.model('User', userScheme),
    ProductType: mongoose.model('ProductType', productTypeScheme),
    Product: mongoose.model('Product', productScheme)
}