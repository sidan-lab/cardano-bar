// Type mappings for Plutus Core types to Rust/Whisky types
export const jsonImportCodeMap: Record<string, string> = {
  // Basic types
  integer: "i64",
  bytes: "ByteString",
  string: "String",
  bool: "bool",
  unit: "()",

  // Cardano specific types
  address: "Address",
  credential: "Credential",
  stake_credential: "StakeCredential",
  script_hash: "ScriptHash",
  pub_key_hash: "PubKeyHash",
  policy_id: "PolicyId",
  asset_name: "AssetName",
  value: "Value",
  tx_hash: "TxHash",
  tx_out_ref: "TxOutRef",
  output_datum: "OutputDatum",
  datum: "Datum",
  redeemer: "Redeemer",
  script_context: "ScriptContext",
  tx_info: "TxInfo",
  purpose: "Purpose",

  // Time types
  posix_time: "PosixTime",
  slot: "Slot",
  extended_posix_time_range: "ExtendedPosixTimeRange",
  posix_time_range: "PosixTimeRange",
  interval: "Interval",

  // Plutus Data
  data: "PlutusData",
  plutus_data: "PlutusData",
  constr_plutus_data: "ConstrPlutusData",

  // Common patterns
  maybe: "Option",
  list: "Vec",
  pair: "tuple",
  map: "BTreeMap",
  assoc_map: "BTreeMap",
};

// Blueprint specific imports for whisky
export const blueprintImportCodeMap: Record<string, string> = {
  // Whisky specific types
  ByteString: "whisky::data::ByteString",
  PlutusData: "whisky::data::PlutusData",
  WData: "whisky::data::WData",
  BuilderDataType: "whisky::models::BuilderDataType",
  LanguageVersion: "whisky::models::LanguageVersion",
  WError: "whisky::error::WError",

  // Cardano types from whisky
  Address: "whisky::models::Address",
  ScriptHash: "whisky::models::ScriptHash",
  PubKeyHash: "whisky::models::PubKeyHash",
  PolicyId: "whisky::models::PolicyId",
  AssetName: "whisky::models::AssetName",
  Value: "whisky::models::Value",
  TxHash: "whisky::models::TxHash",
  TxOutRef: "whisky::models::TxOutRef",
  Credential: "whisky::models::Credential",
  StakeCredential: "whisky::models::StakeCredential",
  OutputDatum: "whisky::models::OutputDatum",
  Datum: "whisky::models::Datum",
  Redeemer: "whisky::models::Redeemer",
  ScriptContext: "whisky::models::ScriptContext",
  TxInfo: "whisky::models::TxInfo",
  Purpose: "whisky::models::Purpose",

  // Time types
  PosixTime: "whisky::models::PosixTime",
  Slot: "whisky::models::Slot",
  Interval: "whisky::models::Interval",

  // Rust standard types
  String: "String",
  i64: "i64",
  u64: "u64",
  bool: "bool",
  Vec: "Vec",
  Option: "Option",
  BTreeMap: "std::collections::BTreeMap",
  HashMap: "std::collections::HashMap",

  // Serde for serialization
  Serialize: "serde::Serialize",
  Deserialize: "serde::Deserialize",
};
