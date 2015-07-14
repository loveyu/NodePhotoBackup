var fs = require('fs');
var util = require('util');
var md5 = require('MD5');
var my_util = require('./my_util.js');

/**
 * 读取文件系统
 * @param config
 * @param finish
 */
module.exports = function (config, finish) {
    var root_data = {
        'dir_count': 0,
        'file_count': 0,
        'size_count': 0,
        'size_count_h': 0,
        'dir': {}
    };
    var read_record = 0;

    var root_path = config.path || './';

    var array_clone = function (arr) {
        var rt_arr = [];
        for (var i = 0; i < arr.length; i++) {
            if (typeof arr[i] === "object") {
                rt_arr.push(array_clone(arr[i]));
            } else {
                rt_arr.push(arr[i]);
            }
        }
        return rt_arr;
    };

    /**
     * 设置目录信息
     * @param data 当前路径信息
     * @param name 当前路径名称
     * @param stat 路径的统计信息
     * @param new_path 新的完整路径
     */
    var set_data_info = function (data, name, stat, new_path) {
        var _name = md5(name);
        if (!data.hasOwnProperty(_name)) {
            data[_name] = {
                'name': name,
                'mtime': stat.mtime.getTime(),
                'birthtime': stat.birthtime.getTime(),
                'atime': stat.atime.getTime(),
                'ctime': stat.ctime.getTime()
            };
            if (stat.isDirectory()) {
                data[_name] = util._extend(data[_name], {
                    'dir_count': 0,
                    'file_count': 0,
                    'size_count': 0,
                    'size_count_h': "",
                    'type': 'dir',
                    'dir': {}
                });
            } else if (stat.isFile()) {
                data[_name] = util._extend(data[_name], {
                    'size': stat.size,
                    'type': 'file',
                    'size_h': ""
                });
            } else if (stat.isSymbolicLink()) {
                data[_name] = util._extend(data[_name], {
                    'type': 'link',
                    'link': fs.readlinkSync(new_path)
                });
            } else {
                data[_name] = util._extend(data[_name], {
                    'type': 'unknown'
                });
            }
        }
    };

    /**
     * 设置用户可读的文件大小
     */
    var set_human_size = function () {
        root_data.size_count_h = my_util.format_size(root_data.size_count);
        set_human_size_re(root_data.dir);
    };
    /**
     * 开始递归计算
     * @param data
     */
    var set_human_size_re = function (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (data[i].hasOwnProperty('dir')) {
                    data[i].size_count_h = my_util.format_size(data[i].size_count);
                    set_human_size_re(data[i].dir);
                } else {
                    if (data[i].hasOwnProperty('size_h')) {
                        data[i].size_h = my_util.format_size(data[i].size);
                    }
                }
            }
        }
    };

    var set_count_info = function (data, cb) {
        var re = function (data) {
            var s_c = 0;
            var d_c = 0;
            var f_c = 0;
            for (var name in data.dir) {
                if (data.dir.hasOwnProperty(name)) {
                    if (data.dir[name].type === "file") {
                        s_c += data.dir[name].size;
                        ++f_c;
                    } else if (data.dir[name].type === "dir") {
                        re(data.dir[name]);//递归计算
                        s_c += data.dir[name].size_count;
                        d_c += (data.dir[name].dir_count + 1);
                        f_c += data.dir[name].file_count;
                    } else {
                        //链接或其他数据计算为文件,不计大小
                        ++f_c;
                    }
                }
            }
            data.size_count = s_c;
            data.dir_count = d_c;
            data.file_count = f_c;
        };
        if (data.hasOwnProperty('dir')) {
            re(data);
        }
        cb();
    };

    /**
     * 读取路径
     * @param {object} data 当前目录的数据
     * @param {string} path 当前搜索的路径
     */
    var read_dir = function (data, path) {
        ++read_record;
        var call = function (err, list) {
            if (err) {
                return;
            }
            for (var i = 0; i < list.length; ++i) {
                var new_path = path + "/" + list[i];
                var stat = null;
                try {
                    stat = fs.lstatSync(new_path);
                    set_data_info(data, list[i], stat, new_path);
                } catch (ex) {
                    console.error(ex);
                    continue;
                }
                if (stat.isSymbolicLink()) {
                    //跳过链接文件
                    continue;
                }
                if (stat.isDirectory()) {
                    //路径由MD5存储
                    read_dir(data[md5(list[i])].dir, new_path);
                }
            }
            --read_record;
            if (read_record === 0 && typeof finish === "function") {
                set_count_info(root_data, function () {
                    set_human_size();
                    finish(root_data);
                });
            }
        };
        fs.readdir(path, call);
    };
    read_dir(root_data.dir, root_path);
};