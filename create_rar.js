var config = require("./config.js");
var fs = require("fs");
var path = require("path");
var encoding = require("encoding");

var data = JSON.parse(fs.readFileSync(config.backupPath + "/" + config.backupConfig));

var password = fs.readFileSync("./password.txt");

var convert2gbk = function (data) {
    return data;
};

var compress = {
    dir: function (obj) {
        var name = path.basename(obj.path);
        var dirname = path.dirname(obj.path);
        var cmd = "\"" + config.p7zExe + "\" a -mx0 -t7z -r -p" + password + " \""
            + fs.realpathSync(config.backupPath + "/" + dirname) + "\\" + name + ".7z\" \""
            + fs.realpathSync(config.path + "/" + obj.path) + "\"";
        console.log(convert2gbk(cmd));
    },
    file_collection: function (obj, dir_path, index) {
        var file_list = [];
        for (var i = 0; i < obj.list.length; i++) {
            file_list.push(fs.realpathSync(config.path + "/" + dir_path + "/" + obj.list[i]));
        }
        var name = "__collection_" + index;
        var c_p = fs.realpathSync(config.backupPath + "/" + dir_path) + "/collection_" + index + ".txt";
        fs.writeFileSync(c_p, file_list.join("\r\n"));
        var cmd = "\"" + config.p7zExe + "\" a -mx0 -t7z -r -p" + password + " \""
            + fs.realpathSync(config.backupPath + "/" + dir_path) + "\\" + name + ".7z\" \"@"
            + fs.realpathSync(c_p) + "\"";
        console.log(convert2gbk(cmd));
    },
    file: function (obj, dir_path) {
        var name = path.basename(obj.path);
        var cmd = "\"" + config.p7zExe + "\" a -mx0 -t7z -r -p" + password + " \""
            + fs.realpathSync(config.backupPath + "/" + dir_path) + "\\" + name + ".7z\" \""
            + fs.realpathSync(config.path + "/" + obj.path) + "\"";
        console.log(convert2gbk(cmd));
    }
};

for (var i = 0; i < data.list.length; i++) {
    var obj = data.list[i];

    if (obj.type === 'dir') {
        compress.dir(obj);
    } else if (obj.type === 'dir_collection') {
        var file_collection_index = 0;
        for (var j = 0; j < obj.list.length; j++) {
            var collection = obj.list[j];
            if (collection.type === "file_collection") {
                compress.file_collection(collection, obj.path, file_collection_index++);
            } else if (collection.type === "file") {
                compress.file(collection, obj.path);
            }
        }
    }
}
