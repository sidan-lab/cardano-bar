import { ICodeBuilder } from ".";
import { capitalizedFirstLetter, snakeToCamelCase } from "../../utils";
import { ScriptPurpose } from "../types";

export class RSCodeBuilder implements ICodeBuilder {
  typePackage = () => "whisky-common";

  spendJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    datum?: string,
    redeemer?: string
  ) => {
    const structName = `${blueprintName}Script`;
    let code = "";

    code += `use whisky_common::models::*;\n`;
    code += `use whisky_common::interfaces::*;\n`;
    code += `use serde::{Deserialize, Serialize};\n`;
    code += `\n`;

    code += `#[derive(Debug, Clone, Serialize, Deserialize)]\n`;
    code += `pub struct ${structName} {\n`;
    code += `    pub compiled_code: String,\n`;
    if (parameters.length > 0) {
      code += `    pub parameters: (${parameters.join(", ")}),\n`;
    }
    code += `}\n\n`;

    code += `impl ${structName} {\n`;
    if (parameters.length === 0) {
      code += `    pub fn new() -> Self {\n`;
    } else {
      code += `    pub fn new(params: (${parameters.join(", ")})) -> Self {\n`;
    }
    code += `        let compiled_code = BLUEPRINT.validators[${validatorIndex}].compiled_code.clone();\n`;
    code += `        Self {\n`;
    code += `            compiled_code,\n`;
    if (parameters.length > 0) {
      code += `            parameters: params,\n`;
    }
    code += `        }\n`;
    code += `    }\n\n`;

    code += `    pub fn get_script(&self) -> PlutusScript {\n`;
    if (parameters.length === 0) {
      code += `        PlutusScript::from_hex(&self.compiled_code).unwrap()\n`;
    } else {
      code += `        let param_cbor = serialize_params(&self.parameters);\n`;
      code += `        PlutusScript::apply_params(&self.compiled_code, &param_cbor).unwrap()\n`;
    }
    code += `    }\n\n`;

    code += `    pub fn get_address(&self, network_id: u8, stake_credential: Option<StakeCredential>) -> Address {\n`;
    code += `        let script = self.get_script();\n`;
    code += `        Address::from_script(script.hash(), network_id, stake_credential)\n`;
    code += `    }\n`;

    if (datum) {
      code += `\n    pub fn validate_datum(&self, datum: &${datum}) -> bool {\n`;
      code += `        // Add datum validation logic here\n`;
      code += `        true\n`;
      code += `    }\n`;
    }

    if (redeemer) {
      code += `\n    pub fn validate_redeemer(&self, redeemer: &${redeemer}) -> bool {\n`;
      code += `        // Add redeemer validation logic here\n`;
      code += `        true\n`;
      code += `    }\n`;
    }

    code += `}\n\n`;

    code += `impl SpendingScript for ${structName} {\n`;
    code += `    fn get_script_hash(&self) -> ScriptHash {\n`;
    code += `        self.get_script().hash()\n`;
    code += `    }\n\n`;
    code += `    fn get_address(&self, network_id: u8, stake_credential: Option<StakeCredential>) -> Address {\n`;
    code += `        self.get_address(network_id, stake_credential)\n`;
    code += `    }\n`;
    code += `}\n`;

    return code;
  };

  mintJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ) => {
    const structName = `${blueprintName}Script`;
    let code = "";

    code += `use whisky_common::models::*;\n`;
    code += `use whisky_common::interfaces::*;\n`;
    code += `use serde::{Deserialize, Serialize};\n`;
    code += `\n`;

    code += `#[derive(Debug, Clone, Serialize, Deserialize)]\n`;
    code += `pub struct ${structName} {\n`;
    code += `    pub compiled_code: String,\n`;
    if (parameters.length > 0) {
      code += `    pub parameters: (${parameters.join(", ")}),\n`;
    }
    code += `}\n\n`;

    code += `impl ${structName} {\n`;
    if (parameters.length === 0) {
      code += `    pub fn new() -> Self {\n`;
    } else {
      code += `    pub fn new(params: (${parameters.join(", ")})) -> Self {\n`;
    }
    code += `        let compiled_code = BLUEPRINT.validators[${validatorIndex}].compiled_code.clone();\n`;
    code += `        Self {\n`;
    code += `            compiled_code,\n`;
    if (parameters.length > 0) {
      code += `            parameters: params,\n`;
    }
    code += `        }\n`;
    code += `    }\n\n`;

    code += `    pub fn get_script(&self) -> PlutusScript {\n`;
    if (parameters.length === 0) {
      code += `        PlutusScript::from_hex(&self.compiled_code).unwrap()\n`;
    } else {
      code += `        let param_cbor = serialize_params(&self.parameters);\n`;
      code += `        PlutusScript::apply_params(&self.compiled_code, &param_cbor).unwrap()\n`;
    }
    code += `    }\n\n`;

    code += `    pub fn get_policy_id(&self) -> PolicyId {\n`;
    code += `        PolicyId::from_script_hash(self.get_script().hash())\n`;
    code += `    }\n`;
    code += `}\n\n`;

    code += `impl MintingScript for ${structName} {\n`;
    code += `    fn get_script_hash(&self) -> ScriptHash {\n`;
    code += `        self.get_script().hash()\n`;
    code += `    }\n\n`;
    code += `    fn get_policy_id(&self) -> PolicyId {\n`;
    code += `        self.get_policy_id()\n`;
    code += `    }\n`;
    code += `}\n`;

    return code;
  };

  withdrawJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[]
  ) => {
    const structName = `${blueprintName}Script`;
    let code = "";

    code += `use whisky_common::models::*;\n`;
    code += `use whisky_common::interfaces::*;\n`;
    code += `use serde::{Deserialize, Serialize};\n`;
    code += `\n`;

    code += `#[derive(Debug, Clone, Serialize, Deserialize)]\n`;
    code += `pub struct ${structName} {\n`;
    code += `    pub compiled_code: String,\n`;
    if (parameters.length > 0) {
      code += `    pub parameters: (${parameters.join(", ")}),\n`;
    }
    code += `}\n\n`;

    code += `impl ${structName} {\n`;
    if (parameters.length === 0) {
      code += `    pub fn new() -> Self {\n`;
    } else {
      code += `    pub fn new(params: (${parameters.join(", ")})) -> Self {\n`;
    }
    code += `        let compiled_code = BLUEPRINT.validators[${validatorIndex}].compiled_code.clone();\n`;
    code += `        Self {\n`;
    code += `            compiled_code,\n`;
    if (parameters.length > 0) {
      code += `            parameters: params,\n`;
    }
    code += `        }\n`;
    code += `    }\n\n`;

    code += `    pub fn get_script(&self) -> PlutusScript {\n`;
    if (parameters.length === 0) {
      code += `        PlutusScript::from_hex(&self.compiled_code).unwrap()\n`;
    } else {
      code += `        let param_cbor = serialize_params(&self.parameters);\n`;
      code += `        PlutusScript::apply_params(&self.compiled_code, &param_cbor).unwrap()\n`;
    }
    code += `    }\n\n`;

    code += `    pub fn get_stake_address(&self, network_id: u8) -> StakeAddress {\n`;
    code += `        StakeAddress::from_script_hash(self.get_script().hash(), network_id)\n`;
    code += `    }\n`;
    code += `}\n\n`;

    code += `impl WithdrawalScript for ${structName} {\n`;
    code += `    fn get_script_hash(&self) -> ScriptHash {\n`;
    code += `        self.get_script().hash()\n`;
    code += `    }\n\n`;
    code += `    fn get_stake_address(&self, network_id: u8) -> StakeAddress {\n`;
    code += `        self.get_stake_address(network_id)\n`;
    code += `    }\n`;
    code += `}\n`;

    return code;
  };

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
