export const jsonTypeMap = {
  WithdrawalScriptHashes: "WithdrawalScriptHashes",
  ScriptHash: "ScriptHash",
  KeyHash: "PubKeyHash",
  Address: "ScriptAddress",
  PolicyId: "PolicyId",
  ByteArray: "ByteString",
  Int: "Integer",
};

export const meshTypeMap = {
  bytestring: "string",
  int: "bigint",
  bool: "MBool",
  tuple: "MTuple",
  keyhash: "pubKeyHash",
  address: "scriptAddress",
  option: "option",
};

// A list of mesh types to be skipped for imports and generation
export const basicTypeList = [
  "Bool",
  "Option",
  "ByteString",
  "Integer",
  "PubKeyHash",
  "ScriptAddress",
  "Address",
  "Collection",
];
