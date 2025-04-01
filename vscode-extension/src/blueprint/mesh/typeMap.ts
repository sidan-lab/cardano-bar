// export const jsonTypeMap = {
//   WithdrawalScriptHashes: "WithdrawalScriptHashes",
//   ScriptHash: "ScriptHash",
//   KeyHash: "PubKeyHash",
//   Address: "PubKeyAddress | ScriptAddress",
//   PolicyId: "PolicyId",
//   ByteArray: "ByteString",
//   Int: "Integer",
// };

// export const meshTypeMap = {
//   bytestring: "string",
//   int: "bigint",
//   bool: "MBool",
//   tuple: "MTuple",
//   keyhash: "pubKeyHash",
//   address: "scriptAddress",
//   option: "option",
// };

export const jsonImportCodeMap = {
  Int: "Integer",
  Bool: "Bool",
  ByteArray: "ByteString",
  VerificationKeyHash: "PubKeyHash",
  ScriptHash: "ScriptHash",
  PolicyId: "PolicyId",
  AssetName: "AssetName",
  Pairs: "Pairs",
  Tuple: "Tuple",
  Option: "Option",
  "cardano/address/Credential": "Credential",
  "cardano/transaction/OutputReference": "OutputReference",
  "cardano/address/Address": "PubKeyAddress | ScriptAddress",
};

export const blueprintImportCodeMap = {
  spend: "SpendingBlueprint",
  mint: "MintingBlueprint",
  withdraw: "WithdrawalBlueprint",
  publish: "WithdrawalBlueprint",
};
