module.exports = {
    path: "F:\\相片",//要检查的文件夹
    backupPath: "F:\\bk",//备份到的目录文件夹
    backupConfig: "config.json",//备份目录的配置文件
    encode: "GB2312",//备份文件夹
    miniDept: 2,//最小压缩深度
    maxDir: 2 * 1024 * 1024 * 1024,//最大文件夹大小
    maxFile: 1024 * 1024 * 1024,//最大不压缩的文件
    p7zExe:'D:\\Program Files\\7-Zip\\7z.exe'
};