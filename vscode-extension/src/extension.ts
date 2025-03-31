import * as vscode from "vscode";
import { parseBlueprintTS } from "./blueprint";

export function activate(context: vscode.ExtensionContext) {
  console.log("Cardano Bar extension activated");

  context.subscriptions.push(parseBlueprintTS);

  // context.subscriptions.push(analyzeScriptMesh);
}

// This method is called when your extension is deactivated
export function deactivate() {}
