import { ScriptPurpose } from "../types";

export * from "./ts";
export * from "./rs";

export interface ICodeBuilder {
  typePackage(): string;

  spendJson(
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    datum?: string,
    redeemer?: string
  ): string;

  mintJson(
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ): string;

  withdrawJson(
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ): string;

  createTypeCheckMethod(methodName: string, data: string): string;

  importJson(importName: string, filePath: string): string;

  importPackage(imports: string[], packageName: string): string;

  exportType(typeName: string, typeCode: string): string;

  constant(plutusVersion: string): string;

  spendConstants(): string;

  getValVariableName(validatorName: string): string;

  getOrTypeCode(types: string[]): string;

  getCodeImportList(importCode: string): string[];

  getBlueprintName(blueprintName: string, purpose: ScriptPurpose): string;

  any(): string;

  pairs(key: string, value: string): string;

  list(itemCode: string): string;

  tuple(key: string, value: string): string;

  option(someCode: string): string;

  constr(
    index: number,
    fieldCodes: string[]
  ): { toImport: string; constructorCode: string };
}
