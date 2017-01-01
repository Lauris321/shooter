const hashingService = require('./hashingService.js');
const mongoDb = require('./mongodbService.js');

const register = (request, reply) => {
    mongoDb.getItemById(request.userName, 'usersCollection', (result) => {
        if (result !== undefined) {
            reply({ message: 'User already exists' });
        } else {
            hashingService.hashString(request.password, (hashedPassword) => {
                const userData = {
                    _id: request.name,
                    password: hashedPassword,
                    auth: 'admin',
                    access_token: undefined,
                    timeStamp: undefined,
                };
                console.log(userData);
                mongoDb.insertItem(userData, 'usersCollection');
                reply({ message: 'Registration successful' });
            });
        }
    });
};

const login = (request, reply) => {
    console.log(request);
    mongoDb.getItemById(request.name, 'usersCollection', (item) => {
        if (item === undefined) {
            reply({message: 'Username does not exist'});
        } else {
            hashingService.checkMatch(request.password, item.password, (eq) => {
                if (eq) {
                    const returnData = {
                        message: 'Logged in!',
                        user: item._id,
                        access_token: undefined,
                    };
                    if (item.access_token == undefined) {
                        hashingService.createToken(request.name, (hToken) => {
                            mongoDb.setAccessToken(hToken, request.name,
                                'usersCollection');
                            returnData.access_token = hToken;
                            reply(returnData);
                        });
                    } else {
                        returnData.access_token = item.access_token;
                        mongoDb.setTimestamp(item.timeStamp, 'usersCollection');
                        reply(returnData);
                    }
                } else {
                    reply({ message: 'Wrong password!' });
                }
            });
        }
    });
};

const timeDifference = (tStamp) => {
    const dif = new Date().getTime() - new Date(tStamp).getTime();
    return dif / 60000;
};

const authenticateUser = (token, userId, callback) => {
    mongoDb.getItemById(userId, 'usersCollection', (user) => {
        var auth;
        if (user == undefined || token == undefined) {
            auth = undefined;
        } else if (token === user.access_token) {
            auth = user.auth;
        } else {
            auth = undefined;
        }
        if (auth != undefined) {
            if (timeDifference(user.timeStamp) >= 30) {
                mongoDb.clearToken(user._id, 'usersCollection', () => {
                    auth = 'Token expired';
                });
            } else {
                mongoDb.setTimestamp(userId, 'usersCollection');
            }
        }
        callback(auth);
    });
};

const clearToken = (request, reply) => {
    mongoDb.clearToken(request.payload.username, 'usersCollection', () => {
        reply({ message: 'Access token cleared.' });
    });
};

const authFromParams = (request, reply) => {
    authenticateUser(request.payload.token, request.payload.userId, (auth) => {
        reply(auth);
    });
};

module.exports = {
    register,
    login,
    authenticateUser,
    clearToken,
    authFromParams,
};
