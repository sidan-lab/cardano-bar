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

// A list of mesh types to be skipped for imports and generation
export const basicTypeList = ["List", "Bool", "Option", "Dict"];

export const jsonTypeMap = {
  Int: "Integer",
  Bool: "Bool",
  ByteArray: "ByteString",
  VerificationKeyHash: "PubKeyHash",
  ScriptHash: "ScriptHash",
  PolicyId: "PolicyId",
  AssetName: "AssetName",
  OutputReference: "OutputReference",
};
