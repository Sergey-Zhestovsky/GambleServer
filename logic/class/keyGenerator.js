const chars = 'qwertyuiopasdfghjklzxcvbnm1234567890';

module.exports = function generateKey(length) {
    let result = "";

    for (let i = 0; i < length; i++)
        result += chars.charAt(Math.random() * chars.length - 1);

    return result;
};