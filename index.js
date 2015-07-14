var rc = require('./read_content.js');
var mongo = require('./action_mongo.js');
var config = require("./config.js");
var backup = require("./backup.js");

var startTime = new Date().getTime();
rc(config, function (rc) {
    var endTime = new Date().getTime();

    console.error("Directory read time: " + ((endTime - startTime) / 1000));

    //console.log(JSON.stringify(rc, null, "\t"));

    mongo("photo_backup", function (db) {
        db.insert(rc, function (result) {
            //console.log(result);
            console.error("Insert complete");

            backup(rc, function () {
                console.error("backup complete.");
                process.exit(0);
            });
        });
    });

});