"use strict"

var fs = require("fs")
var fse = require("fs-extra")
var path = require("path")
var child_process = require("child_process")

function action(dir, callback)
{
    if (fse.existsSync(dir))
    {
        if (fse.statSync(dir).isDirectory())
        {
            fs.readdirSync(dir).forEach(filename =>
            {
                if (getExtension(filename) == "svg")
                {
                    callback(path.join(dir, filename), getName(filename))
                }
            })
        }
    }
}
function getName(filename)
{
    return filename.split(".").slice(0, -1).join(".")
}
function getExtension(filename)
{
    return filename.split(".").slice(-1).join(".")
}

var root = path.dirname(process.argv[1])
var icons = path.join(root, "icons")
var iconsJson = path.join(icons, "icons.json")
var defaultIcons = path.join(icons, "default")
var extensions = path.join(icons, "extensions")
var files = path.join(icons, "files")
var folders = path.join(icons, "folders")

console.log("生成IconsJson文件")
var iconsObj = {
    iconDefinitions: {
        file: {
            iconPath: "./default/file.svg"
        },
        folder: {
            iconPath: "./default/folder.svg"
        },
        folderExpanded: {
            iconPath: "./default/folder.expanded.svg"
        }
    },
    file: "file",
    folder: "folder",
    folderExpanded: "folderExpanded",
    fileExtensions: {

    },
    fileNames: {

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
action(extensions, (file, name) =>
{
    iconsObj.fileExtensions[name] = name
    iconsObj.iconDefinitions[name] = { iconPath: "./extensions/" + name + ".svg" }
})
action(files, (file, name) =>
{
    iconsObj.fileNames[name] = name
    iconsObj.iconDefinitions[name] = { iconPath: "./files/" + name + ".svg" }
})
action(folders, (file, name) =>
{
    if (getExtension(name) == "expanded")
    {
        iconsObj.folderNamesExpanded[getName(name)] = name
        iconsObj.iconDefinitions[name] = { iconPath: "./folders/" + name + ".svg" }
    }
    else
    {
        iconsObj.folderNames[name] = name
        iconsObj.iconDefinitions[name] = { iconPath: "./folders/" + name + ".svg" }
    }
})
fse.ensureDirSync(icons)
fse.outputJsonSync(iconsJson, iconsObj, { spaces: 4 })


console.log("压缩图标文件")
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", icons])
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", defaultIcons])
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", extensions])
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", files])
child_process.execFileSync("svgo", ["--enable=removeDimensions", "-f", folders])

console.log("完成")
process.exit()
