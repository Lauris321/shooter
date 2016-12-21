const bcrypt = require('bcryptjs');

const saltRounds = 10;

const hashString = (myString, callback) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(myString, salt, (error, hash) => {
            callback(hash);
        });
    });
};

const checkMatch = (plainString, hashedString, callback) => {
    bcrypt.compare(plainString, hashedString, (err, res) => {
        callback(res);
    });
};

const createToken = (userName, callback) => {
    hashString(userName, (token) => {
        callback(token);
    });
};

module.exports = {
    hashString,
    checkMatch,
    createToken,
};

