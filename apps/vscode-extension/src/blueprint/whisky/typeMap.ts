export const jsonImportCodeMap = {
  Int: "Integer",
  Bool: "Bool",
  ByteArray: "ByteString",
  ScriptHash: "ScriptHash",
  PolicyId: "PolicyId",
  AssetName: "AssetName",
  Pairs: "Map",

  Tuple: "Tuple",
  // Option: "Option",
  "cardano/address/Credential": "Credential",
  "cardano/transaction/OutputReference": "OutputReference",
  "cardano/address/Address": "Address",

  List: "List",
  VerificationKey: "VerificationKey",
  VerificationKeyHash: "VerificationKeyHash",
  "cardano/assets/AssetName": "AssetName",
  "cardano/assets/PolicyId": "PolicyId",
  "aiken/crypto/VerificationKeyHash": "VerificationKeyHash",
  "aiken/crypto/VerificationKey": "VerificationKey",
  "aiken/crypto/ScriptHash": "ScriptHash",
};

export const blueprintImportCodeMap = {
  spend: "SpendingBlueprint",
  mint: "MintingBlueprint",
  withdraw: "WithdrawalBlueprint",
  publish: "WithdrawalBlueprint",
};

// Rust native type mappings for impl_constr_type! macro parameters
// Maps whisky types to their Rust native types
export const rustNativeTypeMap: Record<string, string> = {
  Integer: "i128",
  Int: "i128",
  ByteString: "&str",
  Bool: "bool",
  VerificationKeyHash: "&str",
  PolicyId: "&str",
  AssetName: "&str",
  ScriptHash: "&str",
  Address: "&str",
};
