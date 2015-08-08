var rc = require('./read_content.js');
var fs = require('fs');
var config = require("./config.js");

var startTime = new Date().getTime();
rc(config, function (rc) {
	var endTime = new Date().getTime();

	console.log("Directory read time: " + ((endTime - startTime) / 1000));

	fs.writeFileSync(config.backupPath + "/" + config.backupDataInfo, JSON.stringify(rc, null, "\t"));
});