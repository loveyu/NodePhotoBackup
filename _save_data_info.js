var rc = require('./read_content.js');
var mongo = require('./action_mongo.js');
var config = require("./config.js");
var backup = require("./backup.js");
var my_util = require("./my_util.js");
var fs = require("fs");

var startTime = new Date().getTime();
rc(config, function (rc) {
	var endTime = new Date().getTime();

	console.error("Directory read time: " + ((endTime - startTime) / 1000));


	var data_config_path = config.backupPath + "/" + config.backupDataInfo;
	var data_save = data_config_path + "_sa_" + my_util.time("yyyyMMdd_hhmmss");
	var old_data = data_config_path + "_bk_" + my_util.time("yyyyMMdd_hhmmss");
	if (fs.statSync(data_config_path).isFile()) {
		fs.renameSync(data_config_path, old_data);
		my_util.copy_file(old_data, config.backupPath + "/" + config.backupDataLastInfo)
	}
	fs.writeFileSync(data_save, JSON.stringify(rc, null, "\t"));
	my_util.copy_file(data_save, data_config_path);

	mongo("photo_backup", function (db) {
		db.insert(rc, function (result) {
			console.error("Insert complete");
			process.exit(0);
		});
	});
});