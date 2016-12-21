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

module.exports = {
    mongoConnect,
    insertItem,
    getItemById,
    setAccessToken,
    setTimestamp,
    clearToken,
};