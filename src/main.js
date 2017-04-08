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
function copy(dir1, dir2)
{
    if (fse.existsSync(dir1))
    {
        if (fse.statSync(dir1).isDirectory())
        {
            fse.copySync(dir1, dir2)
        }
    }
}

var src = path.dirname(process.argv[1])
var root = path.dirname(src)
var iconsDir = path.join(root, "icons")
var iconsJsonFile = path.join(iconsDir, "icons.json")
var defaultIconsDir = path.join(src, "default")
var extensionsIconsDir = path.join(src, "extensions")
var filesIconsDir = path.join(src, "files")
var foldersIconsDir = path.join(src, "folders")

console.log("生成IconsJson文件")
var icons = {
    iconDefinitions: {
        file: {
            iconPath: "./file.svg"
        },
        folder: {
            iconPath: "./folder.svg"
        },
        folderExpanded: {
            iconPath: "./folder.expanded.svg"
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
action(extensionsIconsDir, (file, name) =>
{
    icons.fileExtensions[name] = name
    icons.iconDefinitions[name] = { iconPath: "./" + name + ".svg" }
})
action(filesIconsDir, (file, name) =>
{
    icons.fileNames[name] = name
    icons.iconDefinitions[name] = { iconPath: "./" + name + ".svg" }
})
action(foldersIconsDir, (file, name) =>
{
    if (getExtension(name) == "expanded")
    {
        icons.folderNamesExpanded[getName(name)] = name
        icons.iconDefinitions[name] = { iconPath: "./" + name + ".svg" }
    }
    else
    {
        icons.folderNames[name] = name
        icons.iconDefinitions[name] = { iconPath: "./" + name + ".svg" }
    }
})

fse.removeSync(iconsDir)
fse.ensureDirSync(iconsDir)
fse.outputJsonSync(iconsJsonFile, icons, { spaces: 4 })

console.log("复制新的图标")
copy(defaultIconsDir, iconsDir)
copy(extensionsIconsDir, iconsDir)
copy(filesIconsDir, iconsDir)
copy(foldersIconsDir, iconsDir)


console.log("压缩图标文件")
action(iconsDir, (file, name) =>
{
    console.log("压缩：" + name)
    child_process.execFileSync("svgo", [file])
})

console.log("清理现有文件")
fse.removeSync(defaultIconsDir)
fse.removeSync(extensionsIconsDir)
fse.removeSync(filesIconsDir)
fse.removeSync(foldersIconsDir)

console.log("完成")
process.exit()