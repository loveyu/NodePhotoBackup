var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

module.exports = function (db, cb) {
    var url = 'mongodb://localhost:27017/' + db;
    MongoClient.connect(url, function (err, db) {
        assert.equal(err, null);
        var insert = function (object, cb) {
            var collection = db.collection('record');
            collection.insertOne(
                {
                    time: (new Date()).getTime(),
                    path: require("./config.js"),
                    data: object
                },
                function (err, result) {
                    assert.equal(err, null);
                    assert.equal(1, result.result.n);
                    assert.equal(1, result.result.ok);
                    cb(result);
                });
        };
        var action = {
            insert: insert
        };
        cb(action);
    });
};