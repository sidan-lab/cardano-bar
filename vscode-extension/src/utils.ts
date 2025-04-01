import * as vscode from "vscode";
import path from "path";

export const capitalizedFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const snakeToCamelCase = (snake: string): string => {
  return snake
    .split("_") // Split the string by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(""); // Join the words back together
};

export const getFileRelativePath = (filePath: string): string => {
  const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath; // Absolute path of the currently active file

  if (!activeFilePath) {
    vscode.window.showErrorMessage("No active file in the editor.");
    return "";
  }

  // Calculate the relative path from the active file to the selected file
  let relativePath = path.relative(path.dirname(activeFilePath), filePath);

  if (!relativePath.startsWith("./") && !relativePath.startsWith("../")) {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
};
