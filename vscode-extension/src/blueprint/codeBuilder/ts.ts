export class TSCodeBuilder {
  static spendJson = (
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
        ? TSCodeBuilder.createTypeCheckMethod(
            "params",
            `[${parameters.join(", ")}]`
          )
        : ``;
    code += datum ? TSCodeBuilder.createTypeCheckMethod("datum", datum) : ``;
    code += redeemer
      ? TSCodeBuilder.createTypeCheckMethod("redeemer", redeemer)
      : ``;
    code += `}\n`;
    return code;
  };

  static mintJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
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
        ? TSCodeBuilder.createTypeCheckMethod(
            "param",
            `[${parameters.join(", ")}]`
          )
        : ``;
    code += `}\n`;
    return code;
  };

  static withdrawJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
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
        ? TSCodeBuilder.createTypeCheckMethod(
            "param",
            `[${parameters.join(", ")}]`
          )
        : ``;
    code += `}\n`;
    return code;
  };

  static createTypeCheckMethod = (methodName: string, data: string): string => {
    let code = `  static ${methodName} = (data: ${data}): ${data} => data\n`;
    return code;
  };

  static importJson = (importName: string, filePath: string) => {
    let code = `import ${importName} from "${filePath}"\n`;
    return code;
  };

  static importPackage = (imports: string[], packageName: string) => {
    let code = `import { ${imports.join(", ")} } from "${packageName}"\n`;
    return code;
  };

  static exportType = (typeName: string, typeCode: string) => {
    return `export type ${typeName} = ${typeCode};`;
  };

  static constant = (plutusVesion: string) => `const version = "${plutusVesion}"
const networkId = 0; // 0 for testnet; 1 for mainnet`;

  static spendConstants = () => `
// Every spending validator would compile into an address with an staking key hash
// Recommend replace with your own stake key / script hash
const stakeKeyHash = ""
const isStakeScriptCredential = false`;
}
