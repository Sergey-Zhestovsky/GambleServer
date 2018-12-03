'use strict';

//import ErrorHandler from '/js/module/errorHandler.js';

export default class Connector {
    constructor({signRequests = false}) {
        this.signRequests = signRequests;
    }

    request(path, object) {
        return this.customRequest(path, object)
        .then((result) => {
            return Promise.resolve(result);
        }, ({error, result}) => {
            return Promise.resolve(this.ErrorHandler(path, object, error, result));
        }); 
    }

    customRequest(path, object) {
        if ( this.signRequests && localStorage.getItem('dynamicToken') )
            object.dynamicToken = localStorage.getItem('dynamicToken');

        return axios.post(path, object)
        .then(({data} = {}) => {
            if (data.error)
                throw data;

            return data.result;
        }, (error) => {
            console.error(error);
        }); 
    }

    ErrorHandler(path, object, error, result) {
        if (!error.code) 
            return;

        switch (error.code) {
            case 107:
                return this.DynamicCookieHandler(path, object, error, result);
                break;
            default:
                return Promise.reject(error);
                break;
        }
    }

    DynamicCookieHandler(path, object, error, result) {
        if (!result.dynamicToken)
            return false;

        localStorage.setItem('dynamicToken', result.dynamicToken);
        return this.customRequest(path, object);  
    }
}