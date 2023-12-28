'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below

import * as azdata from 'azdata';
import { match } from 'assert';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "jasper-script-converter" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('jasper-script-converter.convertToJasperSyntax', convertToJasperSyntax));
    context.subscriptions.push(vscode.commands.registerCommand('jasper-script-converter.convertToSqlSyntax', convertToSqlSyntax));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function convertToSqlSyntax() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const doc = editor.document;
        const selection = editor.selection;
        var text = doc.getText(selection);

        var expression = /\$P\{(@\w+)\}/gm;
        var matches = text.match(expression);
        
        text = text.replace(expression, "$1");

        if (text.substring(0,2) !== 'set'){
            var vars = [...new Set(matches)];
            vars.forEach(v => v = v.concat(" = ''"));
            var init = vars.join(',\n');
            init = 'set '.concat(init,';');
            text = init.concat(text);
        }

        editor.edit(builder => {
            builder.replace(selection, text);
        });
    }
}

function convertToJasperSyntax() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const doc = editor.document;
        const selection = editor.selection;
        var text = doc.getText(selection);

        var exp1 = new RegExp(/([Ss][Ee][Tt]|[Dd][Ee][Cc][Ll][Aa][Rr][Ee])[\s\S]*?(?=;)/gm, 's');
        var exp2 = new RegExp(/(@[a-zA-Z]+)/g);

        var varBlocks = text.match(exp1);

        varBlocks?.forEach(block => {
            var vars = block.match(exp2);
            
            vars?.forEach((value) => {
                console.log("Value: " + value);
                text = text.replace(new RegExp(value, 'gm'), (m) => { return `$P{${m}}`; });
            });
        });

        editor.edit(builder => {
            builder.replace(selection, text);
        });
    }
}