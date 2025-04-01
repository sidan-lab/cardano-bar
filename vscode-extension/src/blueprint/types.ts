export type Preamble = {
  title: string;
  description: string;
  version: string;
  plutusVersion: "v1" | "v2" | "v3";
  compiler: {
    name: string;
    version: string;
  };
  license: string;
};

export type ByteDefinition = {
  title: string;
  dataType: "bytes";
};

export type DataDefinition = {
  title: "Data";
  description: string;
};

export type BoolDefinition = {
  title: "Bool";
  anyOf: [
    {
      title: "False";
      dataType: "constructor";
      index: 0;
      fields: [];
    },
    {
      title: "True";
      dataType: "constructor";
      index: 1;
      fields: [];
    }
  ];
};

export type IntDefinition = {
  dataType: "integer";
};

export type MapDefinition = {
  title: string;
  dataType: "map";
  keys: {
    $ref: string;
    // $ref: "#/definitions/PolicyId";
  };
  values: {
    $ref: string;
    // $ref: "#/definitions/Pairs$AssetName_Int";
  };
};

export type ListDefinition = {
  title: string;
  dataType: "list";
  items: {
    $ref: string;
  };
};

export type TupleDefinition = {
  title: string;
  dataType: "list";
  items: [
    {
      $ref: string;
    },
    {
      $ref: string;
    }
  ];
};

export type OptionDefinition = {
  title: "Option";
  anyOf: [
    {
      title: "Some";
      description: "An optional value.";
      dataType: "constructor";
      index: 0;
      fields: [
        {
          $ref: string;
          // $ref: "#/definitions/StakeCredential";
        }
      ];
    },
    {
      title: "None";
      description: "Nothing.";
      dataType: "constructor";
      index: 1;
      fields: [];
    }
  ];
};

export type ConstructorDefinition = {
  title: string;
  dataType: "constructor";
  index: number;
  fields: {
    $ref: string;
  }[];
};

export type ConstructorsDefinition = {
  title: string;
  description?: string;
  anyOf: ConstructorDefinition[];
};

export type IgnoreDefinition = DataDefinition;

export type CustomDefinition =
  | MapDefinition
  | ListDefinition
  | TupleDefinition
  | OptionDefinition
  | ConstructorsDefinition;

export type PrimitiveDefinition =
  | IntDefinition
  | ByteDefinition
  | BoolDefinition;

export type Definition = {
  title?: string;
  dataType?: string;
  description?: string;
  index?: number;
  anyOf?:
    | ConstructorDefinition[]
    | [
        {
          title: "Some";
          description: "An optional value.";
          dataType: "constructor";
          index: 0;
          fields: [
            {
              $ref: string;
              // $ref: "#/definitions/StakeCredential";
            }
          ];
        },
        {
          title: "None";
          description: "Nothing.";
          dataType: "constructor";
          index: 1;
          fields: [];
        }
      ]
    | [
        {
          title: "False";
          dataType: "constructor";
          index: 0;
          fields: [];
        },
        {
          title: "True";
          dataType: "constructor";
          index: 1;
          fields: [];
        }
      ];
  keys?: {
    $ref: string;
  };
  values?: {
    $ref: string;
  };
  items?:
    | {
        $ref: string;
      }
    | [
        {
          $ref: string;
        },
        {
          $ref: string;
        }
      ];
  fields?: {
    $ref: string;
  }[];
};

export type Definitions = {
  [key: string]: Definition;
};

export type Validator = {
  title: string;
  redeemer: {
    title: string;
    schema: { $ref?: string };
  };
  parameters?: {
    title: string;
    schema: { $ref: string };
  }[];
  datum?: {
    title: string;
    schema: { $ref: string };
  };
  dataType: "validator";
  code: string;
};

export type ScriptPurpose = "spend" | "mint" | "withdraw" | "publish";
