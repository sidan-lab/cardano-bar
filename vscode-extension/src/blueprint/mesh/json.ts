import * as vscode from "vscode";
import fs from "fs";

import { jsonTypeMap } from "./typeMap";
import {
  ConstructorDefinition,
  Definition,
  Definitions,
  Preamble,
  Validator,
} from "../types";
import { getFileRelativePath, snakeToCamelCase } from "../../utils";
import { TSCodeBuilder } from "../codeBuilder";

export class BlueprintGenerator {
  preamble: Preamble;
  validators: Validator[];
  definitions: Definitions;

  // Visited definition key
  visited: Set<string> = new Set();

  // Custom code implementation - Set of titles
  customs: Set<string> = new Set();

  // Imports code implementation - Set of titles
  imports: Set<string> = new Set();

  // Map of definition key to title
  defTitleMap: Record<string, string> = {};
  titleDefMap: Record<string, string> = {};

  // Map of definition title to code implementation
  titleCodeMap: Record<string, string> = {};

  // Map of definition title to dependencies' title
  titleDepsMap: Record<string, string[]> = {};

  // Map of definition title to import names
  titleImportsMap: Record<string, string[]> = {};

  // Snippets for final code
  importSnippet: string[] = [];
  blueprintSnippet: string[] = [];
  typeSnippet: string[] = [];
  debugLog: string[] = [];

  constructor(blueprint: any) {
    this.preamble = blueprint.preamble;
    this.validators = blueprint.validators;
    this.definitions = blueprint.definitions;
  }

  addBlueprint() {}

  analyzeDefinitions() {
    for (const key in this.definitions) {
      this.traceDefinition(key);
    }
    return this;
  }

  generateBlueprints() {
    const plutusVesion = this.preamble.plutusVersion.toUpperCase();
    let constantSnippet: string = TSCodeBuilder.constant(plutusVesion);
    let hasSpendingBlueprint = false;
    const spendingConstantSnippet: string = TSCodeBuilder.spendConstants();
    const blueprintSnippet: string[] = [];

    this.validators.forEach((validator, validatorIndex) => {
      // loop through validators check needed
      let redeemer = "";
      let datum = "";
      let parameters: string[] = [];
      if (validator.parameters) {
        parameters = validator.parameters.map((parameter) => {
          this.checkValidatorSchemas(
            this.getDefinitionKey(parameter.schema.$ref)
          );
          const defKey = this.getDefinitionKey(parameter.schema.$ref);
          const title = this.defTitleMap[defKey];
          return this.titleCodeMap[title];
        });
      }

      if (validator.redeemer && "$ref" in validator.redeemer.schema) {
        this.checkValidatorSchemas(
          this.getDefinitionKey(validator.redeemer.schema.$ref!)
        );
        const defKey = this.getDefinitionKey(validator.redeemer.schema.$ref!);
        redeemer = this.defTitleMap[defKey];
      }

      if (validator.datum) {
        this.checkValidatorSchemas(
          this.getDefinitionKey(validator.datum.schema.$ref)
        );
        const defKey = this.getDefinitionKey(validator.datum.schema.$ref);
        datum = this.defTitleMap[defKey];
      }

      // Genearte blueprint code
      const valFuncName = validator.title.split(".");
      const validatorType = valFuncName[valFuncName.length - 1];
      const blueprintName =
        snakeToCamelCase(valFuncName[valFuncName.length - 2]) + "Blueprint";

      let code = "";
      switch (validatorType) {
        case "spend":
          hasSpendingBlueprint = true;
          this.imports.add("SpendingBlueprint");
          code = TSCodeBuilder.spendJson(
            `${blueprintName}Spend`,
            validatorIndex,
            parameters,
            datum,
            redeemer
          );

          break;
        case "mint":
          this.imports.add("MintingBlueprint");
          code = TSCodeBuilder.mintJson(
            `${blueprintName}Mint`,
            validatorIndex,
            parameters
          );
          break;
        case "withdraw":
          this.imports.add("WithdrawalBlueprint");
          code = TSCodeBuilder.withdrawJson(
            `${blueprintName}Withdraw`,
            validatorIndex,
            parameters
          );
          break;
        case "publish":
          this.imports.add("WithdrawalBlueprint");
          code = TSCodeBuilder.withdrawJson(
            `${blueprintName}Publish`,
            validatorIndex,
            parameters
          );
          break;
      }
      blueprintSnippet.push(code);
    });

    if (hasSpendingBlueprint) {
      constantSnippet += spendingConstantSnippet;
    }
    this.blueprintSnippet = [constantSnippet, ...blueprintSnippet];

    return this;
  }

  generateTypes() {
    if (this.customs.size > 0) {
      this.customs.forEach((custom) => {
        const customTitle = this.defTitleMap[custom];
        this.typeSnippet.push(
          TSCodeBuilder.exportType(customTitle, this.titleCodeMap[customTitle])
        );
      });
    }
    return this;
  }

  generateImports(blueprintPath: string) {
    if (this.imports.size > 0) {
      this.importSnippet = [
        TSCodeBuilder.importJson("blueprint", blueprintPath),
        TSCodeBuilder.importPackage(Array.from(this.imports), "@meshsdk/core"),
      ];
    }
    return this;
  }

  private checkValidatorSchemas(key: string) {
    this.addToCustoms(key);
    const title = this.defTitleMap[key];

    const importNames = this.titleImportsMap[title];
    const dependencies = this.titleDepsMap[title];
    if (importNames) {
      importNames.forEach((importName) => {
        this.imports.add(importName);
      });
    }
    if (dependencies) {
      dependencies.forEach((depTitle) => {
        const def = this.titleDefMap[depTitle];
        if (def === undefined) {
          this.addDebugLog(
            `// key - ${key}`,
            `key - ${depTitle}`,
            `Warning: ${def} is not defined in the definitions`
          );
        }
        this.checkValidatorSchemas(def);
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
      const title = this.defTitleMap[key];
      return this.titleCodeMap[title];
    }
    this.visited.add(key);

    if (Object.keys(jsonTypeMap).includes(key)) {
      const title = key.split("/").pop()!;
      const value = jsonTypeMap[key as keyof typeof jsonTypeMap];
      value.split(" | ").forEach((importName) => {
        this.addToImportsMap(title, importName);
      });
      this.mapDefTitle(key, title);
      this.titleCodeMap[title] = value;
      return value;
    }

    const def = this.definitions[key];
    const title = def.title || key; // If no title, use the key as title
    const defCode = this.getDefinitionCode(def);
    this.mapDefTitle(key, title);
    this.titleCodeMap[title] = defCode;
    return defCode;
  }

  /**
   * Check what the definition is and implement the code
   * It also add to `titleDepsMap` on what the dependencies needed by this definition
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
          this.mapDefTitle("Int", "Integer");
          this.addToImportsMap("Int", "Integer"); // Int as key of Integer
          return "Integer";
        }
        // | ByteDefinition -> native one
        if (dataType === "bytes") {
          this.mapDefTitle("ByteArray", "ByteString");
          this.addToImportsMap("ByteArray", "ByteString"); // ByteArray as key of ByteString
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
        const keyTitle = this.getDefinitionTitle(keyDefRef);
        const valueTitle = this.getDefinitionTitle(valueDefRef);
        this.addToDepsMap(title, keyTitle);
        this.addToDepsMap(title, valueTitle);
        this.addToImportsMap(title, "Pairs");
        return `Pairs<${keyCode}, ${valueCode}>`;
      }

      if (dataType === "list") {
        // | ListDefinition
        if ("$ref" in items!) {
          const itemDefRef = this.getDefinitionKey(items.$ref);
          const itemCode = this.traceDefinition(itemDefRef);
          const itemTitle = this.getDefinitionTitle(itemDefRef);
          this.addToDepsMap(title, itemTitle);
          this.addToImportsMap(title, "List");
          return `List<${itemCode}>`;
        }

        // | TupleDefinition
        const keyDefRef = this.getDefinitionKey(items![0].$ref);
        const valueDefRef = this.getDefinitionKey(items![1].$ref);
        const keyCode = this.traceDefinition(keyDefRef);
        const valueCode = this.traceDefinition(valueDefRef);
        const keyTitle = this.getDefinitionTitle(keyDefRef);
        const valueTitle = this.getDefinitionTitle(valueDefRef);
        this.addToDepsMap(title, keyTitle);
        this.addToDepsMap(title, valueTitle);
        this.addToImportsMap(title, "Tuple");
        return `Tuple<${keyCode}, ${valueCode}>`;
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
      const someTitle = this.getDefinitionTitle(someDefRef);
      this.addToDepsMap(title, someTitle);
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
    const {
      index,
      title: constructorTitle,
      fields,
    } = constr as ConstructorDefinition;
    let constructorCode = "";
    const fieldCodes: string[] = [];

    fields?.forEach((field) => {
      const fieldDefRef = this.getDefinitionKey(field.$ref);
      const fieldCode = this.traceDefinition(fieldDefRef);
      const fieldTitle = this.getDefinitionTitle(fieldDefRef);
      constructorTitle === currentTitle
        ? this.addToDepsMap(currentTitle, fieldTitle)
        : this.addToDepsMap(constructorTitle, fieldTitle);
      fieldCodes.push(fieldCode!);
    });

    let toImport = "";
    switch (constr.index) {
      case 0:
        toImport = "ConStr0";
        constructorCode = `ConStr0<[${fieldCodes.join(", ")}]>`;
        break;
      case 1:
        toImport = "ConStr1";
        constructorCode = `ConStr1<[${fieldCodes.join(", ")}]>`;
        break;
      case 2:
        toImport = "ConStr2";
        constructorCode = `ConStr2<[${fieldCodes.join(", ")}]>`;
        break;
      default:
        toImport = "ConStr";
        constructorCode = `ConStr<${index}, [${fieldCodes.join(", ")}]>`;
        break;
    }

    if (constructorTitle === currentTitle) {
      this.addToImportsMap(currentTitle, toImport);
      return constructorCode;
    }

    this.addToDepsMap(currentTitle, constructorTitle!);
    this.addToImportsMap(constructorTitle!, toImport);
    this.mapDefTitle(constructorTitle!, constructorTitle!);
    this.titleCodeMap[constructorTitle!] = constructorCode;
    return constructorTitle!;
  };

  private getDefinitionKey = (defRef: string) => {
    const key = defRef.replaceAll("~1", "/").replaceAll("#/definitions/", "");
    return key;
  };

  private getDefinitionTitle = (defRef: string) => {
    const key = this.getDefinitionKey(defRef);
    if (key in this.defTitleMap) {
      return this.defTitleMap[key];
    }
    let title = this.definitions[key].title;
    if (title) {
      this.mapDefTitle(key, title);
      return title;
    }
    title = key.split("/").pop()!;
    return title;
  };

  private addToImportsMap = (title: string, importName: string) => {
    if (!this.titleImportsMap[title]) {
      this.titleImportsMap[title] = [];
    }
    if (this.titleImportsMap[title].includes(importName)) {
      return;
    }
    this.titleImportsMap[title].push(importName);
  };

  private addToDepsMap = (title: string, depTitle: string) => {
    if (!this.titleDepsMap[title]) {
      this.titleDepsMap[title] = [];
    }
    if (this.titleDepsMap[title].includes(depTitle)) {
      return;
    }
    this.titleDepsMap[title].push(depTitle);
  };

  private mapDefTitle = (def: string, title: string) => {
    this.defTitleMap[def] = title;
    this.titleDefMap[title] = def;
  };

  private addToCustoms = (def: string) => {
    const parentTitle = def.split("$")[0];

    // Catching Tuple & Pairs
    if (parentTitle && parentTitle in jsonTypeMap) {
      const value = jsonTypeMap[parentTitle as keyof typeof jsonTypeMap];
      value.split(" | ").forEach((importName) => {
        this.addToImportsMap(def, importName);
      });
      return;
    }

    if (def in jsonTypeMap) {
      const value = jsonTypeMap[def as keyof typeof jsonTypeMap];
      value.split(" | ").forEach((importName) => {
        this.addToImportsMap(def, importName);
      });
      return;
    }
    this.customs.add(def);
  };

  getFullSnippet = () => [
    ...this.importSnippet,
    "\n",
    ...this.blueprintSnippet,
    "\n",
    ...this.typeSnippet,
    "\n",
    ...this.debugLog,
  ];

  addDebugLog = (...logs: string[]) => {
    let currentLog = "";
    for (const log of logs) {
      currentLog += ` ${log}`;
    }
    this.debugLog.push(currentLog);
  };
}

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
        const blueprint = new BlueprintGenerator(script);

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
