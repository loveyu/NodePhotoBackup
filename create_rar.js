var config = require("./config.js");
var fs = require("fs");
var path = require("path");

var data = JSON.parse(fs.readFileSync(config.backupPath + "/" + config.backupConfig));


var compress = {
    dir: function (obj) {
        var name = path.basename(obj.path);
        var dirname = path.dirname(obj.path);
        var cmd = "\"" + config.p7zExe + "\" a -mx0 -t7z -r -p123456 \""
            + fs.realpathSync(config.backupPath + "/" + dirname) + "\\" + name + ".7z\" \""
            + fs.realpathSync(config.path + "/" + obj.path) + "\"";
        console.log(cmd);
    }
};

for (var i = 0; i < data.list.length; i++) {
    var obj = data.list[i];

    if (obj.type === 'dir') {
        compress.dir(obj);
    }
}
