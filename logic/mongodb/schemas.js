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

userScheme.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
}
userScheme.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.userPassword;
}

module.exports = {
    Privilege: mongoose.model('Privilege', privilegeScheme),
    User: mongoose.model('User', userScheme),
}