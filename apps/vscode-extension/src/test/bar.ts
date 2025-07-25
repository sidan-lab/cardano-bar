import {
  PolicyId,
  ConStr0,
  PubKeyAddress,
  ScriptAddress,
  Pairs,
  AssetName,
  Integer,
  SpendingBlueprint,
  ConStr1,
  ByteString,
  MintingBlueprint,
  OutputReference,
  WithdrawalBlueprint,
  PubKeyHash,
} from "@meshsdk/core";

const version = "V3";
const networkId = 0; // 0 for testnet; 1 for mainnet
// Every spending validator would compile into an address with an staking key hash
// Recommend replace with your own stake key / script hash
const stakeKeyHash = "";
const isStakeScriptCredential = false;

export class DepositIntentSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[0]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
  datum = (data: DepositIntentDatum): DepositIntentDatum => data;
  redeemer = (data: Data): Data => data;
}

export class DepositIntentMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[1]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
}

export class LpTokenMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[3]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
}

export class OracleNftMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [OutputReference]) {
    const compiledCode = blueprint.validators[5]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [OutputReference]): [OutputReference] => data;
}

export class VaultSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[7]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
  datum = (data: Data): Data => data;
  redeemer = (data: Data): Data => data;
}

export class VaultWithdrawBlueprint extends WithdrawalBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[8]!.compiledCode;
    super(version, networkId);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
}

export class VaultOracleSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[10]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
  datum = (data: VaultOracleDatum): VaultOracleDatum => data;
  redeemer = (data: ProcessRedeemer): ProcessRedeemer => data;
}

export class WithdrawalIntentSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[12]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
  datum = (data: WithdrawalIntentDatum): WithdrawalIntentDatum => data;
  redeemer = (data: Data): Data => data;
}

export class WithdrawalIntentMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [any]) {
    const compiledCode = blueprint.validators[13]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [any]): [any] => data;
}

export type PolicyId = any;

export type Data = any;

export type DepositIntentDatum = ConStr0<
  [PubKeyAddress | ScriptAddress, Pairs<any, Pairs<any, Integer>>]
>;

export type MValue = Pairs<any, Pairs<any, Integer>>;

export type AssetName = any;

export type IntentRedeemer = MintIntent | BurnIntent;

export type MintIntent = ConStr0<[]>;

export type BurnIntent = ConStr1<[any, ByteString, any]>;

export type List = any;

export type List = any;

export type ProcessRedeemer = ProcessDeposit | ProcessWithdrawal;

export type ProcessDeposit = ConStr0<[]>;

export type ProcessWithdrawal = ConStr1<[]>;

export type MintPolarity = RMint | RBurn;

export type RMint = ConStr0<[]>;

export type RBurn = ConStr1<[]>;

export type VaultOracleDatum = ConStr0<
  [
    any,
    ByteString,
    any,
    Integer,
    Integer,
    Integer,
    any,
    Integer,
    ByteString,
    ByteString,
    ByteString,
    any
  ]
>;

export type List = any;

export type VerificationKeyHash = any;

export type WithdrawalIntentDatum = ConStr0<
  [PubKeyAddress | ScriptAddress, Integer]
>;
