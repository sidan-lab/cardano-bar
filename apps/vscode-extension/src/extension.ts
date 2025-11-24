import * as vscode from "vscode";
import { mesh, whisky } from "./blueprint";

export function activate(context: vscode.ExtensionContext) {
  console.log("Cardano Bar extension activated");

  context.subscriptions.push(mesh.parseBlueprintTS);
  context.subscriptions.push(whisky.parseBlueprintRS);

  // context.subscriptions.push(analyzeScriptMesh);
}

// This method is called when your extension is deactivated
export function deactivate() {}
