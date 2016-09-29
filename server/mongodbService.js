const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://testuser:testuser@ds021326.mlab.com:21326/shooterdb';

let collections;

// var map = {
// 	_id: 'test',
// 	width: 500,
// 	height: 500,
// 	walls: [
// 		{x1: 0, y1: 0, x2: 500, y2: 0},
// 		{x1: 500, y1: 0, x2: 500, y2: 500},
// 		{x1: 500, y1: 500, x2: 0, y2: 500},
// 		{x1: 0, y1: 500, x2: 0, y2: 0},
// 		{x1: 0, y1: 250, x2: 200, y2: 250},
// 	],
// };

const mongoConnect = (callback) => {
    MongoClient.connect(url, (err, db) => {
        collections = {
            mapsCollection: db.collection('mapsCollection'),
        };
        callback();
    });
};

// mongoConnect(() => {
//     console.log('Connected to the database.');
// });

const insertItem = (item, usedCollection) => {
    collections[usedCollection].insert(item);
};

const getItemById = (id, usedCollection, callback) => {
    while(collections === undefined){}
    collections[usedCollection].find({ _id: id }).toArray((err, res) => {
        callback(res[0]);
    });
};

module.exports = {
    mongoConnect,
    insertItem,
    getItemById,
};