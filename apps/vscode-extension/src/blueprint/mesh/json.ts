import * as vscode from "vscode";
import fs from "fs";
import { TypeScriptBlueprintParser } from "@sidan-lab/cardano-bar";

import { getFileRelativePath } from "../../utils";
import { blueprintImportCodeMap, jsonImportCodeMap } from "./typeMap";

export const parseBlueprintTS = vscode.commands.registerCommand(
  "cardano-bar.parseBlueprintMesh",
  () => {
    vscode.window.showInformationMessage(
      "Analyzing Cardano script file for Mesh type..."
    );
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: {
        JSON: ["json"],
      },
    };

    vscode.window.showOpenDialog(options).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const selectedFilePath = fileUri[0].fsPath;
        const relativePath = getFileRelativePath(selectedFilePath);

        const data = fs.readFileSync(selectedFilePath, "utf8");

        const script = JSON.parse(data);
        const blueprint = new TypeScriptBlueprintParser(
          script,
          jsonImportCodeMap,
          blueprintImportCodeMap
        );

        blueprint
          .analyzeDefinitions()
          .generateBlueprints()
          .generateImports(relativePath)
          .generateTypes();

        let fullSnippet: string[] = blueprint.getFullSnippet();

        const snippet = new vscode.SnippetString(fullSnippet.join("\n\n"));
        vscode.window.activeTextEditor?.insertSnippet(snippet);
      }
    });
  }
);
