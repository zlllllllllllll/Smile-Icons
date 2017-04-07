"use strict"

var fs = require("fs")
var fse = require("fs-extra")
var path = require("path")
var child_process = require("child_process")

function action(dir, callback)
{
    fs.readdirSync(dir).forEach(filename =>
    {
        if (getExtension(filename) == "svg")
        {
            callback(path.join(dir, filename), getName(filename))
        }
    })
}
function getName(filename)
{
    return filename.split(".").slice(0, -1).join(".")
}
function getExtension(filename)
{
    return filename.split(".").slice(-1).join(".")
}

console.log("生成IconsJson文件")
var icons = {
    iconDefinitions: {
        file: {
            iconPath: "./icons/file.svg"
        },
        folder: {
            iconPath: "./icons/folder.svg"
        },
        folderExpanded: {
            iconPath: "./icons/folder.expanded.svg"
        }
    },
    file: "file",
    folder: "folder",
    folderExpanded: "folderExpanded",
    fileExtensions: {

    },
    filenames: {

    },
    folderNames: {

    },
    folderNamesExpanded: {

    },
    light: {
        // 单独适配浅色主题
        // 内容与正常模式下一样
    }
}
action("./extensions", (file, name) =>
{
    icons.fileExtensions[name] = name
    icons.iconDefinitions[name] = { iconPath: "./icons/" + name + ".svg" }
})
action("./files", (file, name) =>
{
    icons.filenames[name] = name
    icons.iconDefinitions[name] = { iconPath: "./icons/" + name + ".svg" }
})
action("./folders", (file, name) =>
{
    if (getExtension(name) == "expanded")
    {
        icons.folderNamesExpanded[getName(name)] = name
        icons.iconDefinitions[name] = { iconPath: "./icons/" + name + ".svg" }
    }
    else
    {
        icons.folderNames[name] = name
        icons.iconDefinitions[name] = { iconPath: "./icons/" + name + ".svg" }
    }
})
fse.outputJsonSync("../icons.json", icons, { spaces: 4 })

console.log("清理图标缓存")
fse.removeSync("../icons")

console.log("复制新的图标")
fse.copySync("./default", "../icons")
fse.copySync("./extensions", "../icons")
fse.copySync("./files", "../icons")
fse.copySync("./folders", "../icons")


console.log("压缩图标文件")
action("../icons", (file, name) =>
{
    console.log("压缩：" + name)
    child_process.execFileSync("svgo", [file])
})

console.log("完成")
process.exit()