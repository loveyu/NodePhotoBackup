var rc = require('./read_content.js');

rc(require("./config.js"), function (rc) {
    console.log(JSON.stringify(rc, null, "\t"));
});