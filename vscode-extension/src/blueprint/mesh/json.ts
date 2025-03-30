import * as vscode from "vscode";

import { jsonTypeMap } from "./typeMap";
import {
  ConstructorDefinition,
  Definition,
  Definitions,
  Preamble,
  Validator,
} from "../types";

export class BlueprintGenerator {
  preamble: Preamble;
  validators: Validator[];
  definitions: Definitions;
  visited: Set<string> = new Set();

  customs: Set<string> = new Set();
  imports: Set<string> = new Set();

  importSnippet: string[] = [];
  blueprintSnippet: string[] = [];
  typeSnippet: string[] = [];

  defTitleMap: Record<string, string> = {};
  defCodeMap: Record<string, string> = {};
  defDepsMap: Record<string, string[]> = {};
  defImportsMap: Record<string, string[]> = {};

  constructor(blueprint: any) {
    this.preamble = blueprint.preamble;
    this.validators = blueprint.validators;
    this.definitions = blueprint.definitions;
  }

  addType() {}

  addBlueprint() {}

  analyzeDefinitions() {
    for (const key in this.definitions) {
      this.traceDefinition(key);
    }
    return this;
  }

  generateBlueprints() {
    this.validators.forEach((validator) => {
      // loop through validators check needed
      if (validator.parameters) {
        validator.parameters.forEach((parameter) => {
          this.checkValidatorSchemas(
            this.getDefinitionKey(parameter.schema.$ref)
          );
        });
      }

      if (validator.redeemer && "$ref" in validator.redeemer.schema) {
        this.checkValidatorSchemas(
          this.getDefinitionKey(validator.redeemer.schema.$ref!)
        );
      }

      if (validator.datum) {
        this.checkValidatorSchemas(
          this.getDefinitionKey(validator.datum.schema.$ref)
        );
      }
    });
    return this;
  }

  generateTypes() {
    if (this.customs.size > 0) {
      this.customs.forEach((custom) => {
        const customTitle = this.defTitleMap[custom];
        this.typeSnippet.push(
          `export type ${customTitle} = ${this.defCodeMap[custom]};`
        );
      });
    }
    return this;
  }

  generateImports() {
    Object.values(this.defImportsMap).forEach((importNames) => {
      importNames.forEach((importName) => {
        this.imports.add(importName);
      });
    });

    if (this.imports.size > 0) {
      this.importSnippet = [
        `import { ${Array.from(this.imports).join(
          ", "
        )} } from "@meshsdk/core";`,
        "",
      ];
    }
    return this;
  }

  private checkValidatorSchemas(key: string) {
    if (this.defImportsMap[key]) {
      const importNames = this.defImportsMap[key];
      importNames.forEach((importName) => {
        this.imports.add(importName);
      });
      return;
    }
    if (key) {
      this.customs.add(key);
    }
    // if (this.defImportMap[key]) {
    //   const toImport = this.defImportMap[key];
    //   this.imports.add(toImport);
    // }
    if (this.defDepsMap[key]) {
      const dependencies = this.defDepsMap[key];
      dependencies.forEach((depRef) => {
        const title = this.defTitleMap[depRef];
        this.customs.add(title);
        this.checkValidatorSchemas(title);
      });
    }
  }

  /**
   * Trace down the definition's nested type and implement the code if its at the end
   * @param key The key of the definition in the blueprint
   * @returns The implementation of the definition code snippet
   */
  private traceDefinition(key: string) {
    if (this.visited.has(key)) {
      return this.defCodeMap[key];
    }
    this.visited.add(key);

    if (Object.keys(jsonTypeMap).includes(key)) {
      const value = jsonTypeMap[key as keyof typeof jsonTypeMap];
      this.addToImportsMap(key, value);
      this.defCodeMap[key] = value;
      return value;
    }

    const def = this.definitions[key];
    const defCode = this.getDefinitionCode(def);
    this.defTitleMap[key] = def.title || "";
    this.defCodeMap[key] = defCode;
    return defCode;
  }

  /**
   * Check what the definition is and implement the code
   * It also add to `defDepsMap` on what the dependencies needed by this definition
   * It also add to `defImportsMap` on what the imports needed this definition
   * @param def The definition json
   * @returns The implementation of the definition code snippet
   */
  private getDefinitionCode(def: Definition): string {
    const { title, dataType, items } = def;

    if (dataType) {
      if (!title) {
        // | IntDefinition
        if (dataType === "integer") {
          this.addToImportsMap("Int", "Integer");
          return "Integer";
        }
        // | ByteDefinition -> native one
        if (dataType === "bytes") {
          this.addToImportsMap("ByteArray", "ByteString");
          return "ByteString";
        }
        return "any";
      }

      // | ByteDefinition -> others
      if (title === "bytes") {
        this.addToImportsMap(title, "ByteString");
        return "ByteString";
      }

      // | MapDefinition
      if (dataType === "map") {
        const keyDefRef = this.getDefinitionKey(def.keys!.$ref);
        const valueDefRef = this.getDefinitionKey(def.values!.$ref);
        const keyCode = this.traceDefinition(keyDefRef);
        const valueCode = this.traceDefinition(valueDefRef);
        this.defDepsMap[title] = [keyDefRef, valueDefRef];
        this.addToImportsMap(title, "Dict");
        return `Dict<${keyCode}, ${valueCode}>`;
      }

      if (dataType === "list") {
        // | ListDefinition
        if ("$ref" in items!) {
          const itemDefRef = this.getDefinitionKey(items.$ref);
          const itemCode = this.traceDefinition(itemDefRef);
          this.defDepsMap[title] = [itemDefRef];
          this.addToImportsMap(title, "List");
          return `List<${itemCode}>`;
        }
        // | TupleDefinition

        const keyDefRef = this.getDefinitionKey(items![0].$ref);
        const valueDefRef = this.getDefinitionKey(items![1].$ref);
        const keyCode = this.traceDefinition(keyDefRef);
        const valueCode = this.traceDefinition(valueDefRef);
        this.defDepsMap[title] = [keyDefRef, valueDefRef];
        this.addToImportsMap(title, "Tuple");
        return `Tuple<${keyCode}, ${valueCode}>`;
      }

      // | ConstructorDefinition;
      if (dataType === "constructor") {
        return this.handleConstructor(def, title);
      }
    }

    // | DataDefinition
    if (title === "Data") {
      return "any";
    }

    // | BoolDefinition;
    if (title === "Bool") {
      this.addToImportsMap(title, "Bool");
      return "Bool";
    }

    // | OptionDefinition
    if (title === "Option") {
      const someDefRef = this.getDefinitionKey(def.anyOf![0].fields[0]!.$ref);
      const someCode = this.traceDefinition(someDefRef);
      this.defDepsMap[title] = [someDefRef];
      this.addToImportsMap(title, "Option");
      return `Option<${someCode}>`;
    }

    // | ConstructorsDefinition;
    if (title && def.anyOf) {
      const constructors: string[] = def.anyOf.map(
        (constr: ConstructorDefinition) => this.handleConstructor(constr, title)
      );
      return constructors.join(" | ");
    }

    return "any";
  }

  private handleConstructor = (constr: Definition, currentTitle: string) => {
    const { index, fields } = constr;
    const fieldCodes: string[] = [];

    fields?.forEach((field) => {
      const fieldDefRef = this.getDefinitionKey(field.$ref);
      const fieldCode = this.traceDefinition(fieldDefRef);
      this.defDepsMap[currentTitle] = [fieldDefRef];
      fieldCodes.push(fieldCode!);
    });

    switch (constr.index) {
      case 0:
        this.addToImportsMap(currentTitle, "ConStr0");
        return `ConStr0<[${fieldCodes.join(", ")}]>`;
      case 1:
        this.addToImportsMap(currentTitle, "ConStr1");
        return `ConStr1<[${fieldCodes.join(", ")}]>`;
      case 2:
        this.addToImportsMap(currentTitle, "ConStr2");
        return `ConStr2<[${fieldCodes.join(", ")}]>`;
      default:
        this.addToImportsMap(currentTitle, "ConStr");
        return `ConStr<${index}, [${fieldCodes.join(", ")}]>`;
    }
  };

  private getDefinitionKey = (defRef: string) => {
    const key = defRef.replaceAll("~1", "/").replaceAll("#/definitions/", "");
    return key;
  };

  private addToImportsMap = (defKey: string, importName: string) => {
    if (!this.defImportsMap[defKey]) {
      this.defImportsMap[defKey] = [];
    }
    if (this.defImportsMap[defKey].includes(importName)) {
      return;
    }
    this.defImportsMap[defKey].push(importName);
  };

  getFullSnippet = () => [
    ...this.importSnippet,
    "\n",
    ...this.blueprintSnippet,
    "\n",
    ...this.typeSnippet,
  ];
}

export const analyzeScriptJSON = vscode.commands.registerCommand(
  "cardano-extension.analyzeScriptJSON",
  () => {
    vscode.window.showInformationMessage(
      "Analyzing Cardano script file for JSON date type..."
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
        const fs = require("fs");
        const path = fileUri[0].fsPath;
        const data = fs.readFileSync(path, "utf8");

        const script = JSON.parse(data);
        const blueprint = new BlueprintGenerator(script);

        blueprint
          .analyzeDefinitions()
          .generateBlueprints()
          .generateImports()
          .generateTypes();

        let fullSnippet: string[] = blueprint.getFullSnippet();

        const snippet = new vscode.SnippetString(fullSnippet.join("\n"));
        vscode.window.activeTextEditor?.insertSnippet(snippet);
      }
    });
  }
);
