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
    }
};