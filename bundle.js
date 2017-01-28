// Copy files to dist/
// Bundle JS files together
// Copy over any lib files I need to dist/

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var packageInfo = require('./package.json');
var bundleKey = packageInfo.name + '_' + packageInfo.version;

var srcDir = path.join('./', 'src');
var baseOutputDir = path.join('./', 'dist');
var outputDir = path.join(baseOutputDir, bundleKey);
var outputDirLib = path.join(outputDir, './lib');

function isFolder(folderPath) {
  assert.ok(typeof folderPath === 'string');
  if (!fs.existsSync(folderPath)) return false;
  return fs.statSync(folderPath).isDirectory();
}

function createFolder(folderPath) {
  assert.ok(typeof folderPath === 'string');
  if (folderPath === '.') return;
  var parentFolderPath = path.dirname(folderPath);
  if (! isFolder(parentFolderPath)) createFolder(parentFolderPath);
  if (! fs.existsSync(folderPath)) {
    console.log('Creating folder `' + folderPath + '`')
    fs.mkdirSync(folderPath);
  } else if (! isFolder(folderPath)) {
    throw new Error('Path: `' + folderPath + '` already exists and is not a folder');
  }
}

function copyFile(inputFile, outputFile) {
  assert.ok(typeof inputFile === 'string');
  assert.ok(typeof outputFile === 'string');
  // if (fs.existsSync(outputFile)) return;
  console.log('Copying file `' + inputFile + '` to `' + outputFile + '`');
  fs.createReadStream(inputFile)
    .pipe(fs.createWriteStream(outputFile));
}

function copyFolderContents(parentFolder, outputFolder) {
  assert.ok(typeof parentFolder === 'string');
  assert.ok(typeof outputFolder === 'string');
  if (! isFolder(parentFolder)) throw new Error('Copy path `' + parentFolder + '` missing');
  console.log('Copying contents of `' + parentFolder + '` to `' + outputFolder + '`');
  for(fileOrFolder of fs.readdirSync(parentFolder)) {
    var fullFileOrFolderPath = path.join(parentFolder, fileOrFolder);
    var fileOrFolderDestination = path.join(outputFolder, fileOrFolder);
    if (isFolder(fullFileOrFolderPath)) {
      createFolder(fileOrFolderDestination);
      copyFolderContents(fullFileOrFolderPath, fileOrFolderDestination);
    } else {
      copyFile(fullFileOrFolderPath, fileOrFolderDestination);
    }
  }
  console.log(JSON.stringify( fs.readdirSync(parentFolder) )); // TODO
}

function copyAssets() {

}

function deleteFolderRecursive(removableFolderPath) {
  assert.ok(typeof removableFolderPath === 'string');
  console.log('Removing folder: `' + removableFolderPath + '`');
  if( fs.existsSync(removableFolderPath) ) {
    for (file of fs.readdirSync(removableFolderPath)) {
      var currentFilePath = removableFolderPath + "/" + file;
      if(fs.lstatSync(currentFilePath).isDirectory()) { // recurse
        deleteFolderRecursive(currentFilePath);
      } else {
        console.log('Removing file: `' + currentFilePath + '`')
        fs.unlinkSync(currentFilePath);
      }
    }
    fs.rmdirSync(removableFolderPath);
  }
};

var libFileList = [
  './lib/big-list-of-naughty-strings/blns.json',
  './lib/jquery/3.1.0/jquery.min.js',
];
function copyLibFiles() {
  for(var file of libFileList) {
    var fileBaseName = path.basename(file);
    copyFile(file, path.join(outputDirLib, fileBaseName));
  }
}

function main() {
  if (process.argv.indexOf('-D') !== -1) {
    deleteFolderRecursive(baseOutputDir);
  }
  createFolder(outputDir);
  createFolder(outputDirLib);
  copyLibFiles();
  copyFolderContents(srcDir, outputDir);
}

main();
