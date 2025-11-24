import { capitalizedFirstLetter, snakeToCamelCase } from "../../utils";
import { ScriptPurpose } from "../types";

export class TSCodeBuilder {
  typePackage = () => "@meshsdk/core";

  spendJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    datum?: string,
    redeemer?: string
  ) => {
    let code = "";
    code = code = `export class ${blueprintName} extends SpendingBlueprint {\n`;
    code += `  compiledCode: string\n`;
    code += `\n`;

    code +=
      parameters.length === 0
        ? `  constructor() {\n`
        : `  constructor(params: [${parameters.join(", ")}]) {\n`;
    code += `    const compiledCode = blueprint.validators[${validatorIndex}]!.compiledCode;\n`;
    code += `    super(version, networkId, stakeKeyHash, isStakeScriptCredential);\n`;
    code += `    this.compiledCode = compiledCode\n`;
    code +=
      parameters.length === 0
        ? `    this.noParamScript(compiledCode)\n`
        : `    this.paramScript(compiledCode,  params, "JSON")\n`;
    code += `  }\n`;
    code += `\n`;
    code +=
      parameters.length > 0
        ? this.createTypeCheckMethod("params", `[${parameters.join(", ")}]`)
        : ``;
    code += datum ? this.createTypeCheckMethod("datum", datum) : ``;
    code += redeemer ? this.createTypeCheckMethod("redeemer", redeemer) : ``;
    code += `}\n`;
    return code;
  };

  mintJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    redeemer?: string
  ) => {
    let code = "";
    code = code = `export class ${blueprintName} extends MintingBlueprint {\n`;
    code += `  compiledCode: string\n`;
    code += `\n`;

    code +=
      parameters.length === 0
        ? `  constructor() {\n`
        : `  constructor(params: [${parameters.join(", ")}]) {\n`;
    code += `    const compiledCode = blueprint.validators[${validatorIndex}]!.compiledCode;\n`;
    code += `    super(version);\n`;
    code += `    this.compiledCode = compiledCode\n`;
    code +=
      parameters.length === 0
        ? `    this.noParamScript(compiledCode)\n`
        : `    this.paramScript(compiledCode,  params, "JSON")\n`;
    code += `  }\n`;
    code += `\n`;
    code +=
      parameters.length > 0
        ? this.createTypeCheckMethod("params", `[${parameters.join(", ")}]`)
        : ``;
    code += `}\n`;
    return code;
  };

  withdrawJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    redeemer?: string
  ) => {
    let code = "";
    code =
      code = `export class ${blueprintName} extends WithdrawalBlueprint {\n`;
    code += `  compiledCode: string\n`;
    code += `\n`;

    code +=
      parameters.length === 0
        ? `  constructor() {\n`
        : `  constructor(params: [${parameters.join(", ")}]) {\n`;
    code += `    const compiledCode = blueprint.validators[${validatorIndex}]!.compiledCode;\n`;
    code += `    super(version, networkId);\n`;
    code += `    this.compiledCode = compiledCode\n`;
    code +=
      parameters.length === 0
        ? `    this.noParamScript(compiledCode)\n`
        : `    this.paramScript(compiledCode,  params, "JSON")\n`;
    code += `  }\n`;
    code += `\n`;
    code +=
      parameters.length > 0
        ? this.createTypeCheckMethod("params", `[${parameters.join(", ")}]`)
        : ``;
    code += `}\n`;
    return code;
  };

  createTypeCheckMethod = (methodName: string, data: string): string => {
    let code = `   ${methodName} = (data: ${data}): ${data} => data\n`;
    return code;
  };

  importBlueprint = (importName: string, filePath: string) => {
    let code = `import ${importName} from "${filePath}"\n`;
    return code;
  };

  importPackage = (imports: string[], packageName: string) => {
    let code = `import { ${imports.join(", ")} } from "${packageName}"\n`;
    return code;
  };

  exportType = (typeName: string, typeCode: string, typeCodeMap?: Record<string, string>) => {
    return `export type ${typeName} = ${typeCode};`;
  };

  constant = (plutusVesion: string) => `const version = "${plutusVesion}"
const networkId = 0; // 0 for testnet; 1 for mainnet`;

  spendConstants = () => `
// Every spending validator would compile into an address with an staking key hash
// Recommend replace with your own stake key / script hash
const stakeKeyHash = ""
const isStakeScriptCredential = false`;

  getValVariableName = (validatorTitle: string) => {
    const valFuncName = validatorTitle.split(".");
    return snakeToCamelCase(valFuncName[valFuncName.length - 2]);
  };

  getConstrCode = (types: string[]): string => types.join(" | ");

  getCodeImportList = (importCode: string): string[] => importCode.split(" | ");

  getBlueprintName = (blueprintName: string, purpose: ScriptPurpose): string =>
    `${blueprintName}${capitalizedFirstLetter(purpose)}Blueprint`;

  any = (): string => "any";

  pairs = (key: string, value: string): string => `Pairs<${key}, ${value}>`;

  list = (itemCode: string): string => `List<${itemCode}>`;

  tuple = (...itemCodes: string[]): string =>
    `Tuple<[${itemCodes.join(", ")}]>`;

  option = (someCode: string): string => `Option<${someCode}>`;

  constr = (
    index: number,
    fieldCodes: string[]
  ): { toImport: string; constructorCode: string } => {
    switch (index) {
      case 0:
        return {
          toImport: "ConStr0",
          constructorCode: `ConStr0<[${fieldCodes.join(", ")}]>`,
        };
      case 1:
        return {
          toImport: "ConStr1",
          constructorCode: `ConStr1<[${fieldCodes.join(", ")}]>`,
        };
      case 2:
        return {
          toImport: "ConStr2",
          constructorCode: `ConStr2<[${fieldCodes.join(", ")}]>`,
        };
      default:
        return {
          toImport: "ConStr",
          constructorCode: `ConStr<${index}, [${fieldCodes.join(", ")}]>`,
        };
    }
  };
}
