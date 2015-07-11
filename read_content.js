var fs = require('fs');

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
     * @param root_index 路径名称列表
     */
    var set_data_info = function (data, name, stat, root_index) {
        if (!data.hasOwnProperty(name)) {
            if (stat.isDirectory()) {
                data[name] = {
                    'mtime': stat.mtime.getTime(),
                    'ctime': stat.ctime.getTime(),
                    'dir_count': 0,
                    'file_count': 0,
                    'size_count': 0,
                    'size_count_h': "",
                    'dir': {}
                };
            } else if (stat.isFile()) {
                data[name] = {
                    'mtime': stat.mtime.getTime(),
                    'ctime': stat.ctime.getTime(),
                    'size': stat.size,
                    'size_h': ""
                };
            }
        }
        var now_data = root_data;
        if (stat.isFile()) {
            ++now_data.file_count;
            now_data.size_count += stat.size;
        } else if (stat.isDirectory()) {
            ++now_data.dir_count;
        }
        for (var i = 0; i < root_index.length; i++) {
            now_data = now_data.dir[root_index[i]];
            if (stat.isFile()) {
                ++now_data.file_count;
                now_data.size_count += stat.size;
            } else if (stat.isDirectory()) {
                ++now_data.dir_count;
            }
        }
    };

    /**
     * 格式化文件大小
     */
    var format_size = function (size) {
        var a = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        var pos = 0;
        if (size < 0)return '出错';
        while (size > 1024) {
            size /= 1024;
            pos++;
        }
        return (Math.round(size * 100) / 100) + a[pos];
    };

    var set_human_size = function () {
        root_data.size_count_h = format_size(root_data.size_count);
        set_human_size_re(root_data.dir);
    };
    var set_human_size_re = function (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (data[i].hasOwnProperty('dir')) {
                    data[i].size_count_h = format_size(data[i].size_count);
                    set_human_size_re(data[i].dir);
                } else {
                    data[i].size_h = format_size(data[i].size);
                }
            }
        }
    };

    /**
     * 读取路径
     * @param {object} data 当前目录的数据
     * @param {string} path 当前搜索的路径
     * @param {Array} root_index 当前路径相对根目录的数组文件名称
     * @param {string|null} next_index 下一个索引
     */
    var read_dir = function (data, path, root_index, next_index) {
        ++read_record;
        if (typeof next_index === "string") {
            root_index.push(next_index);
        }
        var call = function (err, list) {
            if (err) {
                return;
            }
            for (var i = 0; i < list.length; ++i) {
                var new_path = path + "/" + list[i];
                var stat = fs.statSync(new_path);
                set_data_info(data, list[i], stat, root_index);
                if (stat.isDirectory()) {
                    read_dir(data[list[i]].dir, new_path, array_clone(root_index), list[i]);
                }
            }
            --read_record;
            if (read_record === 0 && typeof finish === "function") {
                set_human_size();
                finish(root_data);
            }
        };
        fs.readdir(path, call);
    };
    read_dir(root_data.dir, root_path, [], null);
};