'use strict';

//import ErrorHandler from '/js/module/errorHandler.js';

export default class Connector {
    constructor() {
        
    }

    request(path, object) {
        return axios.post(path, object)
        .then(({data} = {}) => {
            if (data.error)
                throw data.error;

            return data.result;
        }, (error) => {
            console.error(error);
        })
        .then((result) => {
            return Promise.resolve(result);
        }, (error) => {
            return Promise.reject(error);
        }); 
    }

    ErrorHandler(path, object, error = {}) {
        if (!error.code) 
            return;

        switch (error.code) {
            case label_1:
                // statements_1
                break;
            default:
                // statements_def
                break;
        }
    }
}