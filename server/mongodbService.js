const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://testuser:testuser@ds021326.mlab.com:21326/shooterdb';

var collections;

const mongoConnect = (callback) => {
    MongoClient.connect(url, (err, db) => {
        collections = {
            mapsCollection: db.collection('mapsCollection'),
            usersCollection: db.collection('usersCollection'),
        };
        callback();
    });
};

const insertItem = (item, usedCollection) => {
    collections[usedCollection].insert(item);
};

const getItemById = (id, usedCollection, callback) => {
    while(collections === undefined){}
    collections[usedCollection].find({ _id: id }).toArray((err, res) => {
        callback(res[0]);
    });
};

const getAllItems = (usedCollection, callback) => {
    while(collections === undefined){}
    collections[usedCollection].find().toArray((err, res) => {
        callback(res);
    });
};

const setAccessToken = (newToken, itemId, usedCollection) => {
    collections[usedCollection].update(
        { _id: itemId },
        {
            $set: {
                access_token: newToken,
                timeStamp: new Date().toISOString(),
            },
        }
    );
};

const setTimestamp = (username, usedCollection) => {
    collections[usedCollection].update(
        { _id: username },
        {
            $set: {
                timeStamp: new Date().toISOString(),
            },
        }
    );
};

const clearToken = (username, usedCollection, callback) => {
    collections[usedCollection].update(
        { _id: username },
        {
            $set: {
                access_token: undefined,
                timeStamp: undefined,
            },
        }
    );
    callback();
};

const changeAuth = (username, auth, usedCollection, callback) => {
    collections[usedCollection].update(
        { _id: username },
        {
            $set: {
                auth: auth,
            },
        }
    );
    callback();
};

const changeUserStats = (username, stats, usedCollection, callback) => {
    getItemById(username, usedCollection, (res) => {
        var totalShotsFired = stats.totalShotsFired + res.totalShotsFired;
        var totalHits = stats.totalHits + res.totalHits;
        var totalDeaths = stats.totalDeaths + res.totalDeaths;
        collections[usedCollection].update(
            { _id: username },
            {
                $set: {
                    totalShotsFired: totalShotsFired,
                    totalHits: totalHits,
                    totalDeaths: totalDeaths,
                },
            }
        );
        callback();
    });
};

const deleteOneItem = (itemId, usedCollection) => {
    collections[usedCollection].deleteOne({ _id: itemId });
};

module.exports = {
    mongoConnect,
    insertItem,
    getItemById,
    getAllItems,
    setAccessToken,
    setTimestamp,
    clearToken,
    changeAuth,
    changeUserStats,
    deleteOneItem,
};