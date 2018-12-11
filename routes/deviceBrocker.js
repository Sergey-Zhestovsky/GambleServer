let express = require('express'),
    router = express.Router(),
    config = require('../config'),
    errorGenerator = require('../logic/error-generator'),
    validator = require('../logic/class/requestValidator');

let requestQueue = [];

router.post('/', setRequestInQueue);
router.post('/response', getResponseToRequest);

function setRequestInQueue(req, res, next) {
    let data = req.body;

    if (validator(data, ["objectId", "createdObject"]) && validator(data.createdObject, ["name"]))
        return res.send(errorGenerator.requireData());

    const index = requestQueue.length;

    requestQueue.push({
        objectId: data.objectId,
        createdObject: data.createdObject,
        req,
        res
    });

    res.on("close", function() {
        requestQueue.splice(index, 1);
    });
}

function getResponseToRequest(req, res, next) {
    let data = req.body;

    if (validator(data, ["moduleId"]))
        return res.send(errorGenerator.requireData());

    for (let i = 0; i < requestQueue.length; i++) {
        let current = requestQueue[i];

        if (current.objectId === data.moduleId) {
            current.createdObject.value = Math.random();
            current.res.send({error: null, result: current.createdObject});

            requestQueue.splice(i, 1);
        }
    }

    res.send(true);
}

module.exports = {
    router,
    setRequestInQueue
};