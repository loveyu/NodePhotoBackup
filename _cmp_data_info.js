var config = require("./config.js");
var fs = require("fs");

var old_data = JSON.parse(fs.readFileSync(config.backupPath + "/" + config.backupDataLastInfo));
var new_data = JSON.parse(fs.readFileSync(config.backupPath + "/" + config.backupDataInfo));

var modify_new = [];
var modify_edit = [];
var modify_delete = [];
var modify_replace = [];

var read_dir = function (path, data_old, data_new) {
	//检查旧文件对象
	for (var old_k in data_old) {
		if (!data_old.hasOwnProperty(old_k)) {
			continue;
		}
		if (!data_new.hasOwnProperty(old_k)) {
			//--被删除的文件或目录
			modify_delete.push({path: path, node: data_old[old_k]});
		} else {
			if (data_old[old_k].type === data_new[old_k].type) {
				switch (data_old[old_k].type) {
					case "file":
						if (data_old[old_k].mtime !== data_new[old_k].mtime) {
							//修改时间不一致
							//--修改的文件
							modify_edit.push({path: path, node: data_old[old_k]});
						}
						break;
					case "dir":
						//继续检查文件夹
						read_dir(path + data_old[old_k].name + "/", data_old[old_k].dir, data_new[old_k].dir);
						break;
				}
			} else {
				//文件类型不一致
				//--替换操作
				modify_replace.push({
					path: path,
					node: data_old[old_k],
					node_new: data_new[old_k]
				});
			}
		}
	}

	//检查新的文件对象
	for (var new_k in data_new) {
		if (!data_new.hasOwnProperty(new_k)) {
			continue;
		}
		if (!data_old.hasOwnProperty(new_k)) {
			//--新的文件或目录
			modify_new.push({path: path, node: data_new[new_k]});
		}
	}

};

read_dir("/", old_data.dir, new_data.dir);

//新增文件

//console.log(JSON.stringify({
//	modify_new: modify_new,
//	modify_edit: modify_edit,
//	modify_delete: modify_delete,
//	modify_replace: modify_replace
//}, null, "\t"));
