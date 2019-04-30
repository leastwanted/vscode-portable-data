// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "ninexam" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.ninexam', async() => {
		// The code you place here will be executed every time your command is executed

		if (vscode.workspace.workspaceFolders == null){
			return;
		}
		// pick the number of file you want to test
		const inputstr = await vscode.window.showInputBox({prompt:'Input a number.'});
		// console.log(inputstr);
		let numoftest = parseInt(inputstr);

		let rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		rootPath = path.join(rootPath, 'cards')
		// console.log('root path:', rootPath);
		let filelist = [];
		let walkSync = function (dir){
			let files = fs.readdirSync(dir);
			files.forEach(file => {
				let filepath = path.join(dir, file);
				if (fs.statSync(filepath).isDirectory()){
					walkSync(filepath);
				}else{
					filelist.push(filepath);
				}
			});
		};
		walkSync(rootPath);

		// random select files
		let files = _.sample(filelist, numoftest)
		files.forEach(file => {
			fs.readFile(file, (err, data) => {
				if (err) throw err;
				let lines = []
				data.toString().split(/\r\n|\n/).forEach(line =>{
					if (line.startsWith('#') || line.trim() == ''){
						lines.push(line);
					}
				});
				let newtext = lines.join('\n');
				fs.writeFile(file, newtext, (err) => {
					if (err) throw err;
					// open files in vscode
					vscode.workspace.openTextDocument(file).then(doc => {
						vscode.window.showTextDocument(doc, {preview: false});
					});
				});
			});
		})
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
