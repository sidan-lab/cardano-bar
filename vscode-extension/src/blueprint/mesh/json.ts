import * as vscode from "vscode";
import fs from "fs";

import { blueprintImportCodeMap, jsonImportCodeMap } from "./typeMap";
import { getFileRelativePath } from "../../utils";
import { TSCodeBuilder } from "../codeBuilder";
import { BlueprintParser } from "../parser";

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
        const blueprint = new BlueprintParser(
          script,
          jsonImportCodeMap,
          blueprintImportCodeMap,
          new TSCodeBuilder()
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
