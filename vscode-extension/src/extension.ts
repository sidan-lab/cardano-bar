import * as vscode from "vscode";
import { analyzeScriptJSON, analyzeScriptMesh } from "./blueprint";

export function activate(context: vscode.ExtensionContext) {
  console.log("Cardano devkit extension activated");

  context.subscriptions.push(analyzeScriptJSON);

  context.subscriptions.push(analyzeScriptMesh);
}

// This method is called when your extension is deactivated
export function deactivate() {}
