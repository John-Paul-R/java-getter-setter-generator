
const vscode = require('vscode');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "java-getter-setter-generator" is now active!');
	class varElements
	{
		constructor(numLines, useLines, varTypes, varNames, selection)
		{
			this.numLines = numLines;
			this.useLines = useLines;
			this.varTypes = varTypes;
			this.varNames = varNames;
			this.selection = selection;
		}

	}
	function getVarElementsFromSelected()
	{
		var hselec = vscode.window.activeTextEditor.selection;
		var varnames = [];
		var vartypes = [];
		var varmods = [];
		var useLines = [];
		var selectedText = vscode.window.activeTextEditor.document.getText(hselec).split("\n");
		for (var i=0; i < selectedText.length; i++)
		{
			var cstring = selectedText[i].trim();
			varmods.push([]);
			if (cstring.length <= 1)
			{
				useLines.push(false)
				varnames.push(null);
				vartypes.push(null);
			}
			else {
				useLines.push(true);
				var cstringlower = cstring.toLowerCase();
				var cindex = 0;

				
				var accessMods = ["private", "protected", "public"];
				for (var j=0; j<accessMods.length; j++)//this possibly errors if they have the keywords in a string, followed by a space... but its so much of a niche case that I don't care.
				{
					var modIndex = cstringlower.indexOf(accessMods[j]);
					if (modIndex > -1 && cstringlower.charAt(modIndex+accessMods[j].length) == ' ')
					{
						cindex += accessMods[j].length+1;
						varmods[i].push(accessMods[j]);
					}
				}
				var otherMods = ["static", "final", "abstract", "synchronized", "volatile"];
				for (var j=0; j<otherMods.length; j++)//this possibly errors if they have the keywords in a string, followed by a space... but its so much of a niche case that I don't care.
				{
					var modIndex = cstringlower.indexOf(otherMods[j]);
					if (modIndex > -1 && cstringlower.charAt(modIndex+otherMods[j].length) == ' ')
					{
						cindex += otherMods[j].length+1;
						varmods[i].push(otherMods[j]);
					}
				}
				let nindex = cstring.indexOf(" ",cindex)
				vartypes.push(cstring.substring(cindex, nindex).trim());
				varnames.push(cstring.substring(nindex, Math.min(cstring.indexOf(";"), cstring.length-1)).trim());
			}
		}
		return new varElements(selectedText.length, useLines, vartypes, varnames, hselec);
	}

	var disp_getters = vscode.commands.registerTextEditorCommand('generate.getters', function() {
		genGetters(getVarElementsFromSelected());
	});
	function genGetters(varElements) {
		var output ="\n\n";
		var baseIndent = vscode.IndentAction.Indent
		vscode.window.activeTextEditor.options.tabSize
		for (var i = 0; i < varElements.numLines; i++)
		{
			if (varElements.useLines[i])
			{
				output = output.concat("public ",
				varElements.varTypes[i].toString(),
				" get",
				varElements.varNames[i].toString().charAt(0).toUpperCase(),
				varElements.varNames[i].toString().substring(Math.min(varElements.varNames[i].length-1,1)),
				"()\n{\n\treturn ",
				varElements.varNames[i].toString(),
				";\n}\n");
			}
		}
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(output), varElements.selection.end);
	}

	var disp_setters = vscode.commands.registerTextEditorCommand('generate.setters', function() {
		genSetters(getVarElementsFromSelected());
	});
	function genSetters(varElements) {
		var output ="\n\n";
		var baseIndent = vscode.IndentAction.Indent
		vscode.window.activeTextEditor.options.tabSize
		for (var i = 0; i < varElements.numLines; i++)
		{
			if (varElements.useLines[i])
			{
				output = output.concat("public void set",
				varElements.varNames[i].toString().charAt(0).toUpperCase(),
				varElements.varNames[i].toString().substring(Math.min(varElements.varNames[i].length-1,1)),
				"(",varElements.varTypes[i].toString()," ",varElements.varNames[i],
				")\n{\n\tthis.",varElements.varNames[i].toString()," = ", varElements.varNames[i].toString(),
				";\n}\n");
			}
		}
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(output), varElements.selection.end);
	}

	let disp_get_set = vscode.commands.registerCommand('generate.getset', function () {
		//vscode.window.showInputBox();
		let varElements = getVarElementsFromSelected();
		genGetters(varElements);
		genSetters(varElements);
	});



	context.subscriptions.push(disp_get_set, disp_getters, disp_setters);
}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
