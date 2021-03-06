var fs = require("fs");

module.exports = {
	/**
	 * 格式化文件大小
	 */
	format_size: function (size) {
		var a = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		var pos = 0;
		if (size < 0)return '出错';
		while (size > 1024) {
			size /= 1024;
			pos++;
		}
		return (Math.round(size * 100) / 100) + a[pos];
	},

	/**
	 * 格式化时间
	 * @param fmt
	 */
	time: function (fmt) {
		var date = new Date();
		var o = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				if (new RegExp("(" + k + ")").test(fmt))
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	},

	copy_file: function (src, dest) {
		var readable = fs.createReadStream(src);
		var writable = fs.createWriteStream(dest);
		readable.pipe(writable);
	}
};