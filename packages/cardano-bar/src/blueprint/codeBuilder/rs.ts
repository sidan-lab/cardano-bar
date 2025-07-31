import { ICodeBuilder } from ".";
import { ScriptPurpose } from "../types";

// Utility functions
const capitalizedFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const snakeToCamelCase = (snake: string): string => {
  return snake
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export class RSCodeBuilder implements ICodeBuilder {
  typePackage = () => "whisky";

  private generateImports(includeConfig = false): string {
    let imports = "";
    imports += `use whisky::*;\n`;
    imports += `use whisky::data::*;\n`;
    imports += `use whisky::utils::blueprint::{SpendingBlueprint, MintingBlueprint, WithdrawalBlueprint};\n`;
    imports += `use whisky::{LanguageVersion, ConstrEnum};\n`;
    if (includeConfig) {
      imports += `use crate::config::AppConfig;\n`;
    }
    imports += `\n`;
    return imports;
  }

  private generateRedeemerEnum(redeemerType: string): string {
    return `#[derive(Debug, Clone, ConstrEnum)]\npub enum ${redeemerType} {\n    // Add your redeemer variants here\n    DefaultRedeemer,\n}\n\n`;
  }

  private generateDatumEnum(datumType: string): string {
    return `#[derive(Debug, Clone, ConstrEnum)]\npub enum ${datumType} {\n    // Add your datum variants here\n    DefaultDatum,\n}\n\n`;
  }

  private generateMintPolarityEnum(): string {
    return `#[derive(Debug, Clone, ConstrEnum)]\npub enum MintPolarity {\n    Mint,\n    Burn,\n}\n\n`;
  }

  spendJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    datum?: string,
    redeemer?: string
  ) => {
    const functionName = snakeToCamelCase(blueprintName);
    const datumType = datum || "ByteString";
    const redeemerType = redeemer || "ByteString";
    const paramType =
      parameters.length > 0 ? `(${parameters.join(", ")})` : "()";

    let code = "";

    // Consolidated imports
    code += this.generateImports(!!(datum || redeemer));

    // Generate enums if custom types are provided
    if (redeemer && redeemer !== "ByteString") {
      code += this.generateRedeemerEnum(redeemer);
    }

    if (datum && datum !== "ByteString") {
      code += this.generateDatumEnum(datum);
    }

    // Generate blueprint function
    code += `pub fn ${functionName}_spending_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> SpendingBlueprint<${paramType}, ${redeemerType}, ${datumType}> {\n`;

    if (datum || redeemer) {
      code += `    let AppConfig { network_id, .. } = AppConfig::new();\n`;
      code += `    let mut blueprint = SpendingBlueprint::new(\n`;
      code += `        LanguageVersion::V3,\n`;
      code += `        network_id.parse().unwrap(),\n`;
      code += `        None\n`;
      code += `    );\n`;
    } else {
      code += `    let mut blueprint = SpendingBlueprint::new(\n`;
      code += `        LanguageVersion::V3,\n`;
      code += `        0, // network_id: 0 for testnet, 1 for mainnet\n`;
      code += `        None\n`;
      code += `    );\n`;
    }

    code += `    blueprint\n`;
    if (parameters.length === 0) {
      code += `        .no_param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      code += `        .param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `            &params,\n`;
      code += `        )\n`;
    }
    code += `        .unwrap();\n`;
    code += `    blueprint\n`;
    code += `}\n`;

    return code;
  };

  mintJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ) => {
    const functionName = snakeToCamelCase(blueprintName);
    const paramType =
      parameters.length > 0 ? `(${parameters.join(", ")})` : "()";

    let code = "";

    // Consolidated imports
    code += this.generateImports();

    // Generate MintPolarity enum
    code += this.generateMintPolarityEnum();

    // Generate blueprint function
    code += `pub fn ${functionName}_minting_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> MintingBlueprint<${paramType}, MintPolarity> {\n`;

    code += `    let mut blueprint = MintingBlueprint::new(LanguageVersion::V3);\n`;
    code += `    blueprint\n`;

    if (parameters.length === 0) {
      code += `        .no_param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      code += `        .param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `            &params,\n`;
      code += `        )\n`;
    }
    code += `        .unwrap();\n`;
    code += `    blueprint\n`;
    code += `}\n`;

    return code;
  };

  withdrawJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ) => {
    const functionName = snakeToCamelCase(blueprintName);
    const paramType =
      parameters.length > 0 ? `(${parameters.join(", ")})` : "()";

    let code = "";

    // Consolidated imports
    code += this.generateImports();

    // Generate blueprint function
    code += `pub fn ${functionName}_withdrawal_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> WithdrawalBlueprint<${paramType}, ByteString> {\n`;

    code += `    let mut blueprint = WithdrawalBlueprint::new(\n`;
    code += `        LanguageVersion::V3,\n`;
    code += `        0 // network_id: 0 for testnet, 1 for mainnet\n`;
    code += `    );\n`;
    code += `    blueprint\n`;

    if (parameters.length === 0) {
      code += `        .no_param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      code += `        .param_script(\n`;
      code += `            BLUEPRINT.validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `            &params,\n`;
      code += `        )\n`;
    }
    code += `        .unwrap();\n`;
    code += `    blueprint\n`;
    code += `}\n`;

    return code;
  };

  // ... rest of the methods remain the same
  createTypeCheckMethod = (methodName: string, data: string): string => {
    return `    pub fn validate_${methodName}(&self, ${methodName}: &${data}) -> bool {\n        true\n    }\n`;
  };

  importJson = (importName: string, filePath: string) => {
    return `use ${importName};\n`;
  };

  importPackage = (imports: string[], packageName: string) => {
    return `use ${packageName}::{${imports.join(", ")}};\n`;
  };

  exportType = (typeName: string, typeCode: string) => {
    return `pub type ${typeName} = ${typeCode};`;
  };

  constant = (plutusVersion: string) =>
    `const PLUTUS_VERSION: &str = "${plutusVersion}";\nconst NETWORK_ID: u8 = 0; // 0 for testnet, 1 for mainnet`;

  spendConstants = () =>
    `// Stake key configuration for spending scripts\nconst STAKE_KEY_HASH: Option<&str> = None;\nconst IS_STAKE_SCRIPT_CREDENTIAL: bool = false;`;

  getValVariableName = (validatorTitle: string) => {
    const valFuncName = validatorTitle.split(".");
    return snakeToCamelCase(valFuncName[valFuncName.length - 2]);
  };

  getOrTypeCode = (types: string[]): string => types.join(" | ");

  getCodeImportList = (importCode: string): string[] => importCode.split(" | ");

  getBlueprintName = (blueprintName: string, purpose: ScriptPurpose): string =>
    `${capitalizedFirstLetter(blueprintName)}${capitalizedFirstLetter(
      purpose
    )}`;

  any = (): string => "serde_json::Value";

  pairs = (key: string, value: string): string => `Vec<(${key}, ${value})>`;

  list = (itemCode: string): string => `Vec<${itemCode}>`;

  tuple = (...itemCodes: string[]): string => `(${itemCodes.join(", ")})`;

  option = (someCode: string): string => `Option<${someCode}>`;

  constr = (
    index: number,
    fieldCodes: string[]
  ): { toImport: string; constructorCode: string } => {
    return {
      toImport: "PlutusData",
      constructorCode: `PlutusData::ConstrPlutusData(${index}, vec![${fieldCodes.join(
        ", "
      )}])`,
    };
  };
}
