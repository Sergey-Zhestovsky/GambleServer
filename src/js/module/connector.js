'use strict';

//import ErrorHandler from '/js/module/errorHandler.js';

export default class Connector {
    constructor({ signRequests = false }) {
        this.signRequests = signRequests;
    }

    request(path, object) {
        let requestObjcet = this.customRequest(path, object);

        this.defaultEntry(requestObjcet.request, path, object);

        return requestObjcet;
    }

    straightRequest(path, object) {
        return this.defaultEntry(this.customRequest(path, object).request, path, object)
    }

    defaultEntry(promise, path, object) {
        return promise
            .then((result) => {
                return Promise.resolve(result);
            }, ({ error, result }) => {
                return Promise.resolve(this.ErrorHandler(path, object, error, result));
            }).catch((error) => {
                console.error(error);
            });
    }

    customRequest(path, object) { 
        if (this.signRequests && localStorage.getItem('dynamicToken'))
            object.dynamicToken = localStorage.getItem('dynamicToken');

        let source = axios.CancelToken.source(),
            request = axios.post(path, object, {
                cancelToken: source.token
            })
            .then(({ data } = {}) => {
                if (data.error)
                    throw data;

                return data.result;
            }, (error) => {
                if (axios.isCancel(error)) {
                    throw {error: 'Request canceled'};
                } else {
                    console.error(error);
                }
            });

        return {
            cancel: source.cancel,
            request
        };
    }

    ErrorHandler(path, object, error, result) {
        if (!error.code)
            return Promise.reject(error);

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
        return this.customRequest(path, object).request;
    }
}