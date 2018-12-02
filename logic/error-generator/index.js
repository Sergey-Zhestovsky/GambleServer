let translate = require('../language').getErrorTranslate;

function errorGenerator() {

    this.create = (error, result = []) => {
        return {
            error,
            result
        }
    };

    this.accessError = (result) => {
        let error = {
            type: "AccessError",
            message: "Request don't have appropriate access level.",
            code: 100
        }

        return this.create(error, result);
    };

    this.requireData = (result) => {
        let error = {
            type: "RequireDataError",
            message: "The request don't have appropriate variables.",
            code: 101
        }
        
        return this.create(error, result);
    };

    this.dataBaseCriticalError = (result) => {
        let error = {
            type: "DataBaseCriticalError",
            message: "Database request don't work properly.",
            code: 102
        }
        
        return this.create(error, result);
    };

    this.loginError = (language, result) => {
        let error = {
            type: "LoginError",
            message: translate(language, "loginError"),
            code: 103
        }
        
        return this.create(error, result);
    };

    this.registrationError = (language, result) => {
        let error = {
            type: "RegistrationError",
            message: translate(language, "registrationError"),
            code: 104
        }
        
        return this.create(error, result);
    };

    this.middlewareError = (result) => {
        let error = {
            type: "MiddlewareError",
            message: "Page not found.",
            code: 105
        }
        
        return this.create(error, result);
    };

    this.mongodbError = (req, error) => {
        switch (error.describe) {
            case 'existing email':
                return this.registrationError(req.data.language);
                break;
            case 'no such user':
                return this.loginError(req.data.language);
                break;
            default:
                return setError(req.app.get('env'), error);
                break;
        }

        function setError(env, result) {
            let error = {
                type: "MongodbError",
                message: "Server API error",
                code: 106
            };

            if (env === 'development')
                error.message = result;

            return this.create(error);
        }
    };
}

module.exports = new errorGenerator();