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
	ScriptHash: "ScriptHash",
	PolicyId: "PolicyId",
	AssetName: "AssetName",
	Pairs: "Pairs",

	Tuple: "Tuple",
	Option: "Option",
	"cardano/address/Credential": "Credential",
	"cardano/transaction/OutputReference": "OutputReference",
	"cardano/address/Address": "PubKeyAddress | ScriptAddress",

	List: "List",
	VerificationKey: "VerificationKey",
	VerificationKeyHash: "PubKeyHash",
	"cardano/assets/AssetName": "AssetName",
	"cardano/assets/PolicyId": "PolicyId",
	"aiken/crypto/VerificationKeyHash": "PubKeyHash",
	"aiken/crypto/VerificationKey": "VerificationKey",
	"aiken/crypto/ScriptHash": "ScriptHash",
};

export const blueprintImportCodeMap = {
	spend: "SpendingBlueprint",
	mint: "MintingBlueprint",
	withdraw: "WithdrawalBlueprint",
	publish: "WithdrawalBlueprint",
};
