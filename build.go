package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func eachPngFileName(dir string, action func(string)) {
	info, err := os.Stat(dir)
	if err != nil {
		panic(err)
	}
	if info.IsDir() {
		files, err := ioutil.ReadDir(dir)
		if err != nil {
			panic(err)
		}
		for _, file := range files {
			if file.IsDir() {
				eachPngFileName(path.Join(dir, file.Name()), action)
			} else {
				if action != nil && filepath.Ext(file.Name()) == ".png" {
					action(strings.Replace(file.Name(), filepath.Ext(file.Name()), "", -1))
				}
			}
		}
	}
}

func saveFile(str, filePath string) {
	file, err := os.Create(filePath)
	if err != nil {
		panic(err)
	}
	file.WriteString(str)
	file.Close()
}

func main() {
	rootDir, err := filepath.Abs("./")
	if err != nil {
		panic(err)
	}
	examplesDir := path.Join(rootDir, "examples")
	iconsDir := path.Join(rootDir, "icons")
	defaultDir := path.Join(iconsDir, "default")
	extensionsDir := path.Join(iconsDir, "extensions")
	filesDir := path.Join(iconsDir, "files")
	foldersDir := path.Join(iconsDir, "folders")
	iconsJSONFile := path.Join(iconsDir, "icons.json")
	READMEFile := path.Join(rootDir, "README.md")

	fmt.Println("生成", "icons.json", "...")
	{
		type IconsJSON struct {
			iconDefinitions     []string
			file                string
			folder              string
			folderExpanded      string
			fileExtensions      []string
			fileNames           []string
			folderNames         []string
			folderNamesExpanded []string
		}
		iconsJSON := new(IconsJSON)
		eachPngFileName(defaultDir, func(name string) {
			iconsJSON.iconDefinitions = append(iconsJSON.iconDefinitions, `"`+name+`": {"iconPath": "./default/`+name+`.png"}`)
		})
		eachPngFileName(extensionsDir, func(name string) {
			iconsJSON.iconDefinitions = append(iconsJSON.iconDefinitions, `"`+name+`": {"iconPath": "./extensions/`+name+`.png"}`)
			iconsJSON.fileExtensions = append(iconsJSON.fileExtensions, `"`+name+`": "`+name+`"`)
		})
		eachPngFileName(filesDir, func(name string) {
			iconsJSON.iconDefinitions = append(iconsJSON.iconDefinitions, `"`+name+`": {"iconPath": "./files/`+name+`.png"}`)
			iconsJSON.fileNames = append(iconsJSON.fileNames, `"`+name+`": "`+name+`"`)
		})
		eachPngFileName(foldersDir, func(name string) {
			iconsJSON.iconDefinitions = append(iconsJSON.iconDefinitions, `"`+name+`": {"iconPath": "./folders/`+name+`.png"}`)
			if filepath.Ext(name) == ".expanded" {
				iconsJSON.folderNamesExpanded = append(iconsJSON.folderNamesExpanded, `"`+strings.Replace(name, filepath.Ext(name), "", -1)+`": "`+name+`"`)
			} else {
				iconsJSON.folderNames = append(iconsJSON.folderNames, `"`+name+`": "`+name+`"`)
			}
		})
		iconsJSONStr := `{`
		iconsJSONStr += `"iconDefinitions":{` + strings.Join(iconsJSON.iconDefinitions, ",") + `},`
		iconsJSONStr += `"file": "file",`
		iconsJSONStr += `"folder": "folder",`
		iconsJSONStr += `"folderExpanded": "folder.expanded",`
		iconsJSONStr += `"fileExtensions":{` + strings.Join(iconsJSON.fileExtensions, ",") + `},`
		iconsJSONStr += `"fileNames":{` + strings.Join(iconsJSON.fileNames, ",") + `},`
		iconsJSONStr += `"folderNames":{` + strings.Join(iconsJSON.folderNames, ",") + `},`
		iconsJSONStr += `"folderNamesExpanded":{` + strings.Join(iconsJSON.folderNamesExpanded, ",") + `}`
		iconsJSONStr += `}`
		saveFile(iconsJSONStr, iconsJSONFile)
	}

	fmt.Println("生成", "examples", "...")
	{
		delete := func(fileofdir string) {
			err := os.RemoveAll(fileofdir)
			if err != nil {
				panic(err)
			}
		}
		create := func(filepath string) {
			file, err := os.Create(filepath)
			if err != nil {
				panic(err)
			}
			file.Close()
		}
		mkdir := func(dirpath string) {
			err := os.MkdirAll(dirpath, os.ModePerm)
			if err != nil {
				panic(err)
			}
		}

		delete(examplesDir)
		mkdir(examplesDir)
		mkdir(path.Join(examplesDir, "folder"))
		create(path.Join(examplesDir, "file"))

		eachPngFileName(extensionsDir, func(name string) {
			create(path.Join(examplesDir, "ext."+name))
		})
		eachPngFileName(filesDir, func(name string) {
			create(path.Join(examplesDir, name))
		})
		eachPngFileName(foldersDir, func(name string) {
			if filepath.Ext(name) != ".expanded" {
				mkdir(path.Join(examplesDir, name))
			}
		})
	}

	fmt.Println("生成", "README.md", "...")
	{
		READMEStr := `# Smile Icons` + "\n"
		READMEStr += "\n"
		READMEStr += `<img src="icon.png" width="120px">` + "\n"
		READMEStr += "\n"
		READMEStr += `## 安装` + "\n"
		READMEStr += "\n"
		READMEStr += "```" + "\n"
		READMEStr += `ext install smile-icons` + "\n"
		READMEStr += "```" + "\n"
		READMEStr += "\n"
		READMEStr += `## 预览` + "\n"
		READMEStr += "\n"
		READMEStr += `默认图标` + "\n"
		READMEStr += "\n"
		READMEStr += `<img src="icons/default/file.png" width="36px">` + "\n"
		READMEStr += `<img src="icons/default/folder.png" width="36px">` + "\n"
		READMEStr += `<img src="icons/default/folder.expanded.png" width="36px">` + "\n"
		READMEStr += "\n"
		READMEStr += `目录图标` + "\n"
		READMEStr += "\n"
		eachPngFileName(foldersDir, func(name string) {
			READMEStr += `<img src="icons/folders/` + name + `.png" width="36px">` + "\n"
		})
		READMEStr += "\n"
		READMEStr += `文件图标` + "\n"
		READMEStr += "\n"
		eachPngFileName(filesDir, func(name string) {
			READMEStr += `<img src="icons/files/` + name + `.png" width="36px">` + "\n"
		})
		READMEStr += "\n"
		READMEStr += `扩展图标` + "\n"
		READMEStr += "\n"
		eachPngFileName(extensionsDir, func(name string) {
			READMEStr += `<img src="icons/extensions/` + name + `.png" width="36px">` + "\n"
		})
		saveFile(READMEStr, READMEFile)
	}
}
