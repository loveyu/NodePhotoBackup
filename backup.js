var config = require("./config.js");
var fs = require("fs");
var my_util = require('./my_util.js');

module.exports = function (data, cb, error) {
	var backupConfig = {
		cfg: config
	};
	var backup_path = config.backupPath;
	error = error || function () {
		};
	if (!fs.existsSync(backup_path)) {
		if (fs.mkdirSync(backup_path)) {
			console.error("can't make backup dir");
			error();
			return;
		}
	}
	var bc_file = backup_path + "/" + config.backupConfig;
	if (!fs.existsSync(bc_file)) {
		//检查目录是否为空
		var list = fs.readdirSync(backup_path);
		if (list !== null && list.length > 0) {
			console.error("new backup dir must be empty.");
			error();
			return;
		}
	} else {
		//backupConfig = JSON.parse(fs.readFileSync(bc_file, "utf-8"));

	}
	backupConfig.list = [];
	var get_dir_files = function (data, path) {
		var names = [];
		for (var id in data.dir) {
			if (data.dir.hasOwnProperty(id))
				names.push(data.dir[id].name);
		}
		return {
			path: path,
			type: 'dir',
			//list: names,
			size: data.size_count,
			size_h: data.size_count_h
		};
	};
	/**
	 * 单独文件检测
	 * @param data 数据对象
	 * @param path 文件路径
	 */
	var files_check = function (data, path) {
		var push = [];
		var files = [];
		for (var id in data.dir) {
			//找出大于指定大小的文件
			if (data.dir.hasOwnProperty(id)) {
				var obj = data.dir[id];
				if (obj.type === "file") {
					if (obj.size > config.maxFile) {
						push.push({
							type: 'file',
							path: path + "/" + obj.name,
							size: obj.size,
							size_h: obj.size_h
						});
					} else {
						files.push(obj);
					}
				}
			}
		}
		if (files.length > 0) {
			files = files.sort(function (o1, o2) {
				return o1.size - o2.size;
			});
			var map = {
				type: 'file_collection',
				size: 0,
				size_h: 0,
				list: []
			};
			for (var i = 0; i < files.length; i++) {
				if (map.size + files[i].size > config.maxDir) {
					map.size_h = my_util.format_size(map.size);
					push.push(map);
					map = {
						type: 'file_collection',
						size: 0,
						size_h: 0,
						list: []
					}
				}
				map.size += files[i].size;
				map.list.push(files[i].name);
			}
			map.size_h = my_util.format_size(map.size);
			push.push(map);
		}
		if (push.length > 0) {
			var r_path = config.backupPath + "/" + path;
			if (!fs.existsSync(r_path)) {
				fs.mkdirSync(r_path);
			}
			backupConfig.list.push({
				type: 'dir_collection',
				path: path,
				list: push
			});
		}
	};
	var deep_check = function (data, deep, path) {
		if (deep > config.miniDept) {
			//开始判断大小
			if (data.size_count <= config.maxDir) {
				backupConfig.list.push(get_dir_files(data, path));
				return;
			}
		}
		var dir_path = backup_path + "/" + path;
		if (!fs.existsSync(dir_path)) {
			fs.mkdirSync(dir_path);
		}
		if (data.hasOwnProperty('dir')) {
			for (var id in data.dir) {
				if (data.dir.hasOwnProperty(id)) {
					if (data.dir[id].type === "dir") {
						deep_check(data.dir[id], deep + 1, path + "/" + data.dir[id].name);
					}
				}
			}
		}
		files_check(data, path);
	};
	deep_check(data, 0, "");
	fs.writeFileSync(bc_file, JSON.stringify(backupConfig, null, "\t"));
	cb();
};