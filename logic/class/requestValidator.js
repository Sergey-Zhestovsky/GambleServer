module.exports = function requestValidator(data, fields) {
    let error = false;

    for (var i = 0; i < fields.length; i++) {
        error = data[fields[i]] === undefined || data[fields[i]] === "" || data[fields[i]] === null;

        if (error)
            return error;
    }

    return error;
}