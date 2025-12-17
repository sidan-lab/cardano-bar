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

const toSnakeCase = (str: string): string => {
  // Convert PascalCase/camelCase to snake_case
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, ""); // Remove leading underscore
};

export class RSCodeBuilder {
  private nativeTypeMap: Record<string, string>;

  constructor(nativeTypeMap?: Record<string, string>) {
    // Default type map if none provided
    this.nativeTypeMap = nativeTypeMap || {
      Integer: "i128",
      Int: "i128",
      ByteString: "&str",
      Bool: "bool",
      PubKeyHash: "&str",
      PolicyId: "&str",
      AssetName: "&str",
      ScriptHash: "&str",
      Address: "&str",
    };
  }

  typePackage = () => "whisky_common::data";

  spendJson = (
    blueprintName: string,
    validatorIndex: number,
    parameters: string[],
    datum?: string,
    redeemer?: string
  ) => {
    const functionName = toSnakeCase(blueprintName);
    const datumType = datum === "Data" ? "PlutusData" : (datum || "ByteString");
    const redeemerType = redeemer === "Data" ? "PlutusData" : (redeemer || "ByteString");
    // For single parameter, use the type directly without tuple wrapping
    const paramType =
      parameters.length === 0
        ? "()"
        : parameters.length === 1
        ? parameters[0]
        : `(${parameters.join(", ")})`;

    let code = "";

    // Generate blueprint function
    code += `pub fn ${functionName}_spending_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> SpendingBlueprint<${paramType}, ${redeemerType}, ${datumType}> {\n`;

    code += `    let app_config = AppConfig::new();\n`;
    code += `    let mut blueprint = SpendingBlueprint::new(\n`;
    code += `        app_config.plutus_version,\n`;
    code += `        app_config.network_id,\n`;
    code += `        None\n`;
    code += `    );\n`;

    if (parameters.length === 0) {
      code += `    blueprint\n`;
      code += `        .no_param_script(\n`;
      code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      // Convert params to JSON strings and create a slice
      if (parameters.length === 1) {
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &[&params.to_json_string()],\n`;
        code += `            BuilderDataType::JSON\n`;
      } else {
        code += `    let param_strs: Vec<String> = vec![\n`;
        for (let i = 0; i < parameters.length; i++) {
          code += `        params.${i}.to_json_string(),\n`;
        }
        code += `    ];\n`;
        code += `    let param_refs: Vec<&str> = param_strs.iter().map(|s| s.as_str()).collect();\n`;
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &param_refs,\n`;
        code += `            BuilderDataType::JSON\n`;
      }
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
    parameters: string[],
    redeemer?: string
  ) => {
    const functionName = toSnakeCase(blueprintName);
    const redeemerType = redeemer === "Data" ? "PlutusData" : (redeemer || "MintPolarity");
    // For single parameter, use the type directly without tuple wrapping
    const paramType =
      parameters.length === 0
        ? "()"
        : parameters.length === 1
        ? parameters[0]
        : `(${parameters.join(", ")})`;

    let code = "";

    // Generate blueprint function
    code += `pub fn ${functionName}_minting_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> MintingBlueprint<${paramType}, ${redeemerType}> {\n`;

    code += `    let app_config = AppConfig::new();\n`;
    code += `    let mut blueprint = MintingBlueprint::new(app_config.plutus_version);\n`;

    if (parameters.length === 0) {
      code += `    blueprint\n`;
      code += `        .no_param_script(\n`;
      code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      // Convert params to JSON strings and create a slice
      if (parameters.length === 1) {
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &[&params.to_json_string()],\n`;
        code += `            BuilderDataType::JSON\n`;
      } else {
        code += `    let param_strs: Vec<String> = vec![\n`;
        for (let i = 0; i < parameters.length; i++) {
          code += `        params.${i}.to_json_string(),\n`;
        }
        code += `    ];\n`;
        code += `    let param_refs: Vec<&str> = param_strs.iter().map(|s| s.as_str()).collect();\n`;
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &param_refs,\n`;
        code += `            BuilderDataType::JSON\n`;
      }
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
    parameters: string[],
    redeemer?: string
  ) => {
    const functionName = toSnakeCase(blueprintName);
    const redeemerType = redeemer === "Data" ? "PlutusData" : (redeemer || "ByteString");
    // For single parameter, use the type directly without tuple wrapping
    const paramType =
      parameters.length === 0
        ? "()"
        : parameters.length === 1
        ? parameters[0]
        : `(${parameters.join(", ")})`;

    let code = "";

    // Generate blueprint function
    code += `pub fn ${functionName}_withdrawal_blueprint(\n`;
    if (parameters.length > 0) {
      code += `    params: ${paramType},\n`;
    }
    code += `) -> WithdrawalBlueprint<${paramType}, ${redeemerType}> {\n`;

    code += `    let app_config = AppConfig::new();\n`;
    code += `    let mut blueprint = WithdrawalBlueprint::new(\n`;
    code += `        app_config.plutus_version,\n`;
    code += `        app_config.network_id\n`;
    code += `    );\n`;

    if (parameters.length === 0) {
      code += `    blueprint\n`;
      code += `        .no_param_script(\n`;
      code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
      code += `        )\n`;
    } else {
      // Convert params to JSON strings and create a slice
      if (parameters.length === 1) {
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &[&params.to_json_string()],\n`;
        code += `            BuilderDataType::JSON\n`;
      } else {
        code += `    let param_strs: Vec<String> = vec![\n`;
        for (let i = 0; i < parameters.length; i++) {
          code += `        params.${i}.to_json_string(),\n`;
        }
        code += `    ];\n`;
        code += `    let param_refs: Vec<&str> = param_strs.iter().map(|s| s.as_str()).collect();\n`;
        code += `    blueprint\n`;
        code += `        .param_script(\n`;
        code += `            get_blueprint().validators[${validatorIndex}].compiled_code.as_str(),\n`;
        code += `            &param_refs,\n`;
        code += `            BuilderDataType::JSON\n`;
      }
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

  importBlueprint = (importName: string, filePath: string) => {
    // Generate constant name from import name (e.g., "blueprint" -> "BLUEPRINT")
    const constantName = importName.toUpperCase();

    return `use std::sync::OnceLock;

static ${constantName}_JSON: &str = include_str!("${filePath}");

pub static ${constantName}: OnceLock<Blueprint> = OnceLock::new();

pub fn get_${importName.toLowerCase()}() -> &'static Blueprint {
    ${constantName}.get_or_init(|| {
        serde_json::from_str(${constantName}_JSON)
            .expect("Failed to parse ${importName} JSON")
    })
}
`;
  };

  importPackage = (imports: string[], packageName: string) => {
    // Replace Pairs with Map (for Rust, Pairs is represented as Map)
    let mappedImports = imports.map((imp) => (imp === "Pairs" ? "Map" : imp));

    // Replace Integer with Int (whisky uses Int, not Integer)
    mappedImports = mappedImports.map((imp) =>
      imp === "Integer" ? "Int" : imp
    );

    // Filter out Option (use std::option::Option instead)
    mappedImports = mappedImports.filter((imp) => imp !== "Option");

    // Separate imports: some come from whisky root, others from whisky::data
    const blueprintTypes = [
      "Blueprint",
      "MintingBlueprint",
      "SpendingBlueprint",
      "WithdrawalBlueprint",
      "BuilderDataType",
    ];
    const deriveTypes = ["ImplConstr", "ConstrEnum"];

    // Always include Blueprint types and derives from whisky root
    const rootImports = [
      ...deriveTypes,
      ...blueprintTypes,
      ...mappedImports.filter((imp) => blueprintTypes.includes(imp)),
    ];

    const dataImports = mappedImports.filter(
      (imp) => !blueprintTypes.includes(imp) && !deriveTypes.includes(imp)
    );

    // Generate the imports in the correct format
    let importCode = "";

    // Import from whisky root (Blueprint types, derives, and LanguageVersion)
    // LanguageVersion comes from whisky root, not whisky::data
    const uniqueRootImports = [...new Set(rootImports)];
    uniqueRootImports.push("LanguageVersion");
    importCode += `use whisky::{\n`;
    importCode += `    ${uniqueRootImports.join(", ")}\n`;
    importCode += `};\n\n`;

    // Import data types from whisky::data
    // Always include commonly used types
    const commonTypes = ["PlutusData", "ByteArray"];

    // Dynamically include only the Constr types that are needed
    // Check which Constr types are referenced in dataImports
    const neededConstrTypes = new Set<string>();
    dataImports.forEach((imp) => {
      // Match patterns like "Constr0", "Constr1", etc.
      const constrMatch = imp.match(/Constr(\d+)/);
      if (constrMatch) {
        neededConstrTypes.add(imp);
      }
    });

    // If ImplConstr is used, include commonly used Constr types (0-9) and ConstrFields
    // This ensures all the Constr types that might be generated in struct definitions are imported
    if (uniqueRootImports.includes("ImplConstr")) {
      neededConstrTypes.add("ConstrFields");
      // Add Constr0-Constr9 as they're commonly used in generated structs
      for (let i = 0; i <= 9; i++) {
        neededConstrTypes.add(`Constr${i}`);
      }
    }

    // Only add base Constr if it's explicitly in the dataImports
    if (dataImports.includes("Constr")) {
      neededConstrTypes.add("Constr");
    }

    const uniqueDataImports = [
      ...new Set([
        ...dataImports,
        ...Array.from(neededConstrTypes),
        ...commonTypes,
      ]),
    ];

    // Add PlutusDataJson whenever ImplConstr is used
    if (uniqueRootImports.includes("ImplConstr")) {
      uniqueDataImports.push("PlutusDataJson");
    }

    importCode += `use whisky::data::{\n`;
    importCode += `    ${uniqueDataImports.join(", ")}\n`;
    importCode += `};\n`;

    return importCode;
  };

  exportType = (
    typeName: string,
    typeCode: string,
    typeCodeMap?: Record<string, string>
  ): string => {
    // Guard against undefined typeCode
    if (!typeCode) {
      return ""; // Skip generation for undefined types
    }

    // Skip generating type definition for "Data" - it maps to PlutusData from whisky::data
    if (typeName === "Data") {
      return ""; // Data should be imported from whisky::data as PlutusData
    }

    // Check for indirect circular type alias early (before any processing)
    // Example: TradeIntent -> MintTradeIntent, MintTradeIntent -> 0::(...), TradeIntent should use 0::(...) too
    // When typeCode points to another type that has a constructor definition,
    // use that constructor definition directly for this type
    if (typeCodeMap && !typeCode.includes("::")) {
      const typeCodeDef = typeCodeMap[typeCode];
      if (typeCodeDef && typeCodeDef.includes("::")) {
        // typeCode has a constructor definition - use it directly
        typeCode = typeCodeDef;
        // Now typeCode contains the constructor pattern, continue processing normally
      }
    }

    // Helper function to replace inline type definitions with type aliases
    const replaceInlineTypes = (code: string): string => {
      if (!typeCodeMap || !code) return code;

      // Sort by length (descending) to replace longer matches first
      // This prevents partial replacements
      // Filter out undefined values before sorting
      const sortedEntries = Object.entries(typeCodeMap)
        .filter(([, value]) => value !== undefined)
        .sort(([, a], [, b]) => (b?.length || 0) - (a?.length || 0));

      // Find all inline types and replace them with type aliases if they exist
      for (const [aliasName, aliasCode] of sortedEntries) {
        // Skip self-reference
        if (aliasName === typeName) continue;

        // Skip simple index patterns (just "0", "1", etc without fields)
        // These are enum variant indices, not type definitions
        if (/^\d+$/.test(aliasCode)) continue;

        // Skip if the aliasCode is a constructor pattern (contains "::")
        // We don't want to replace constructor patterns with type aliases
        // because we need to generate the struct definition, not a type alias
        if (aliasCode.includes("::")) continue;

        // Skip if both aliasName and aliasCode are simple type names (import mappings)
        // For example, "ByteArray" -> "ByteString" should not replace "ByteString" with "ByteArray"
        // A simple type name has no special characters like ::, |, <, >, (, )
        const isSimpleTypeName = (name: string) =>
          !name.includes("::") &&
          !name.includes("|") &&
          !name.includes("<") &&
          !name.includes("(");
        if (isSimpleTypeName(aliasName) && isSimpleTypeName(aliasCode)) continue;

        // Replace constructor patterns, type patterns, and enum patterns
        // We want to replace enum type definitions (like "A|B|C" -> "MyEnum")
        // so we should NOT skip types with top-level pipes in this context

        // Create a regex that matches the pattern but ensures we don't match substrings
        // For example, "0::()" should not match within "0::(Vec<...>)"
        const escapedCode = aliasCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // The pattern can be followed by: end of string, whitespace, or closing brackets/parens
        // This prevents "0::()" from matching in "0::(Vec<...>)" but allows "Vec<X>" in "0::(Vec<X>)"
        const pattern = new RegExp(escapedCode + "(?![^\\s,\\)\\}>])", "g");
        code = code.replace(pattern, aliasName);
      }

      return code;
    };

    // Replace inline types with aliases before processing
    // BUT skip if this is a constructor pattern (contains "::")
    // because we'll handle field replacement separately in the constructor handling code
    if (!typeCode.includes("::")) {
      typeCode = replaceInlineTypes(typeCode);
    }

    // Replace Pairs with Map (for Rust, Pairs is represented as Map)
    // Only replace when Pairs is used as a generic type (followed by <)
    // Don't replace when it's part of a type name (like TokenPairs)
    typeCode = typeCode.replace(/\bPairs</g, "Map<");

    // Replace ByteArray with ByteString (whisky uses ByteString, not ByteArray)
    typeCode = typeCode.replace(/\bByteArray\b/g, "ByteString");

    // Replace Data with PlutusData (Data in Aiken/Plutus represents arbitrary Plutus data)
    // Use word boundaries to avoid replacing "PlutusData" or other types containing "Data"
    typeCode = typeCode.replace(/\bData\b/g, "PlutusData");

    // Replace qualified paths with simple type names
    // e.g., "cardano/address/Credential" -> "Credential"
    // This handles imports from jsonImportCodeMap
    if (typeCodeMap) {
      for (const [qualifiedPath, simpleName] of Object.entries(typeCodeMap)) {
        if (
          qualifiedPath.includes("/") &&
          simpleName &&
          typeof simpleName === "string"
        ) {
          // Escape special regex characters in the qualified path
          const escapedPath = qualifiedPath.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          // Replace the qualified path with the simple name
          const pathRegex = new RegExp(escapedPath, "g");
          typeCode = typeCode.replace(pathRegex, simpleName);
        }
      }
    }

    // Check if this is a single constructor with encoded format "INDEX::fields"
    // After replacement, we check again for pipes at the top level
    const hasTopLevelPipeAfterReplacement = (() => {
      let depth = 0;
      for (let i = 0; i < typeCode.length; i++) {
        const char = typeCode[i];
        if (char === "<" || char === "(") depth++;
        else if (char === ">" || char === ")") depth--;
        else if (char === "|" && depth === 0) return true;
      }
      return false;
    })();

    if (typeCode.includes("::") && !hasTopLevelPipeAfterReplacement) {
      // Split only at the first "::" to separate index from fields
      const firstColonColonIndex = typeCode.indexOf("::");
      const indexStr = typeCode.substring(0, firstColonColonIndex);
      const fields = typeCode.substring(firstColonColonIndex + 2);
      const index = parseInt(indexStr, 10);

      if (!isNaN(index)) {
        // Single constructor type - use ImplConstr or ConstrEnum derive pattern
        if (fields === "") {
          // Unit constructor (no fields)
          // Check if this is a variant in an enum - if so, skip generating it
          // A type is an enum variant if another type's definition includes it as a pipe-separated variant
          if (typeCodeMap) {
            const isEnumVariant = Object.entries(typeCodeMap).some(
              ([name, code]) => {
                if (name === typeName) return false; // Skip self
                if (!code) return false; // Skip undefined values
                // Check if this type appears as a variant in another enum
                // Enum format: "Variant1|Variant2|Variant3" or "Variant1@@0::(fields)|Variant2@@1::(fields)|..."
                if (code.includes("|")) {
                  const variants = code.split("|").map((v) => {
                    const trimmed = v.trim();
                    // Extract variant name from "VariantName@@INDEX::fields" format
                    if (trimmed.includes("@@")) {
                      return trimmed.split("@@")[0];
                    }
                    return trimmed;
                  });
                  return variants.includes(typeName);
                }
                return false;
              }
            );

            if (isEnumVariant) {
              // This is an enum variant with no fields - don't generate a separate type
              // The enum itself will handle this as a unit variant
              return ""; // Return empty string to skip generation
            }
          }

          // Standalone unit constructor - use type alias instead of struct wrapper
          return `pub type ${typeName} = Constr${index}<()>;`;
        } else {
          // Constructor with fields
          // Check if this is a variant in an enum - if so, skip generating it
          if (typeCodeMap) {
            const isEnumVariant = Object.entries(typeCodeMap).some(
              ([name, code]) => {
                if (name === typeName) return false; // Skip self
                if (!code) return false; // Skip undefined values
                // Check if this type appears as a variant in another enum
                // Enum format: "Variant1@@0::(fields)|Variant2@@1::(fields)|..."
                if (code.includes("|")) {
                  const variants = code.split("|").map((v) => {
                    const trimmed = v.trim();
                    // Extract variant name from "VariantName@@INDEX::fields" format
                    if (trimmed.includes("@@")) {
                      return trimmed.split("@@")[0];
                    }
                    return trimmed;
                  });
                  return variants.includes(typeName);
                }
                return false;
              }
            );

            if (isEnumVariant) {
              // This is an enum variant with fields - don't generate a separate type
              // The enum itself will inline the Box<(field types)>
              return ""; // Return empty string to skip generation
            }
          }

          // Parse fields from "(Type1, Type2, ...)" format
          // Use smart split that respects nested parentheses and angle brackets
          const smartSplit = (str: string): string[] => {
            const result: string[] = [];
            let current = "";
            let depth = 0;

            for (let i = 0; i < str.length; i++) {
              const char = str[i];
              const nextChar = str[i + 1];

              if (char === "(" || char === "<") {
                depth++;
                current += char;
              } else if (char === ")" || char === ">") {
                depth--;
                current += char;
              } else if (char === "," && depth === 0) {
                // Only split on commas at depth 0
                if (current.trim()) {
                  result.push(current.trim());
                }
                current = "";
                // Skip the space after comma if present
                if (nextChar === " ") {
                  i++;
                }
              } else {
                current += char;
              }
            }

            if (current.trim()) {
              result.push(current.trim());
            }

            return result;
          };

          const fieldTypes = smartSplit(fields.slice(1, -1));

          // Check if the field type is List<InlineEnum> where InlineEnum contains pipe-separated variants
          // Extract the inner type from List<...> and check if it's an inline enum
          const listEnumMatch =
            fieldTypes.length === 1 && fieldTypes[0].match(/^List<(.+)>$/);
          if (listEnumMatch) {
            const innerType = listEnumMatch[1];
            // Check if the inner type is an inline enum (contains pipes but not at depth > 0)
            if (innerType.includes("|")) {
              // Find the enum type name by looking up the inner enum definition in typeCodeMap
              let enumTypeName = innerType; // Default to inline definition
              if (typeCodeMap) {
                for (const [name, code] of Object.entries(typeCodeMap)) {
                  if (code === innerType) {
                    enumTypeName = name;
                    break;
                  }
                }
              }
              // Use ImplConstr with Box<List<EnumType>>
              return `#[derive(Debug, Clone, ImplConstr)]\npub struct ${typeName}(pub Constr${index}<Box<List<${enumTypeName}>>>);`;
            }
          }

          // Check if the field type is a direct inline enum (contains pipe-separated variants)
          // This handles cases where the field is just the enum, not wrapped in List<>
          const hasInlineEnum =
            fieldTypes.length === 1 &&
            !fieldTypes[0].startsWith("List<") &&
            fieldTypes[0].includes("|");

          if (hasInlineEnum) {
            // Field is an inline enum definition (pipe-separated variants)
            // Find the enum type name by looking up the variants in typeCodeMap
            let enumTypeName = fieldTypes[0]; // Default to inline definition
            if (typeCodeMap) {
              for (const [name, code] of Object.entries(typeCodeMap)) {
                if (code === fieldTypes[0]) {
                  enumTypeName = name;
                  break;
                }
              }
            }
            // Use ImplConstr with Box<List<EnumType>>
            return `#[derive(Debug, Clone, ImplConstr)]\npub struct ${typeName}(pub Constr${index}<Box<List<${enumTypeName}>>>);`;
          }

          // Check if the field type reference is a custom type (enum/struct)
          const isCustomTypeRef =
            fieldTypes.length === 1 &&
            !fieldTypes[0].startsWith("List<") &&
            !fieldTypes[0].startsWith("Map<") &&
            !fieldTypes[0].startsWith("Option<") &&
            typeCodeMap &&
            (typeCodeMap[fieldTypes[0]]?.includes("|") || // enum type
              typeCodeMap[fieldTypes[0]]?.includes("::"));  // struct type

          if (isCustomTypeRef) {
            // Single field that references a custom type (enum/struct) - just use the type directly
            return `#[derive(Debug, Clone, ImplConstr)]\npub struct ${typeName}(pub ${fieldTypes[0]});`;
          }

          // Check if single field is a List type
          const isListTypeRef =
            fieldTypes.length === 1 &&
            fieldTypes[0].startsWith("List<");

          if (isListTypeRef) {
            // Single field that is a List type - use Constr0<List<...>> without Box
            return `#[derive(Clone, Debug, ImplConstr)]\npub struct ${typeName}(pub Constr${index}<${fieldTypes[0]}>);`;
          }

          {
            // Regular fields - use ImplConstr and Box<>
            // Replace inline type definitions in each field with type names
            const processedFieldTypes = fieldTypes.map((fieldType) => {
              // First, check if this is a qualified path that needs to be resolved
              // e.g., "cardano/address/Credential" -> "Credential"
              if (typeCodeMap && fieldType.includes("/")) {
                const simpleName = typeCodeMap[fieldType];
                if (simpleName && typeof simpleName === "string") {
                  return simpleName;
                }
              }

              // For each field, try to find a matching type name in typeCodeMap
              if (typeCodeMap) {
                // Helper to check if a name is a simple type (not a complex definition)
                const isSimpleTypeName = (name: string) =>
                  !name.includes("::") &&
                  !name.includes("|") &&
                  !name.includes("<") &&
                  !name.includes("(");

                // Collect all matches
                const matches: string[] = [];
                for (const [aliasName, aliasCode] of Object.entries(
                  typeCodeMap
                )) {
                  if (aliasName === typeName) continue; // Skip self
                  // Skip "Data" type alias - we want to use PlutusData or more specific types
                  if (aliasName === "Data") continue;
                  // Skip "PlutusData" type alias if it maps to itself - prefer more specific types
                  if (aliasName === "PlutusData" && aliasCode === "PlutusData")
                    continue;
                  // Skip import mappings where both key and value are simple type names
                  // (e.g., "ByteArray" -> "ByteString" should not replace "ByteString" with "ByteArray")
                  if (isSimpleTypeName(aliasName) && isSimpleTypeName(aliasCode))
                    continue;
                  if (aliasCode === fieldType) {
                    matches.push(aliasName);
                  }
                }

                // If we have multiple matches, apply preference rules
                if (matches.length > 0) {
                  // Prefer simple names over qualified paths
                  const simpleNames = matches.filter((m) => !m.includes("/"));
                  if (simpleNames.length > 0) {
                    // Skip "Data" if there are other options
                    const nonDataMatches = simpleNames.filter(
                      (m) => m !== "Data"
                    );
                    if (nonDataMatches.length > 0) {
                      // Prefer ScriptHash over VerificationKeyHash (more commonly used)
                      if (nonDataMatches.includes("ScriptHash")) {
                        return "ScriptHash";
                      }
                      // Otherwise return the first non-Data match
                      return nonDataMatches[0];
                    }
                    // If only Data matches in simple names, use it
                    return simpleNames[0];
                  }
                  // If only qualified paths match, use the first one
                  return matches[0];
                }
              }

              return fieldType;
            });

            let boxContent: string;
            if (processedFieldTypes.length === 1) {
              boxContent = processedFieldTypes[0];
            } else if (processedFieldTypes.length > 12) {
              // For tuples with more than 12 items, wrap with ConstrFields<>
              boxContent = `ConstrFields<(${processedFieldTypes.join(", ")})>`;
            } else {
              boxContent = `(${processedFieldTypes.join(", ")})`;
            }
            return `#[derive(Clone, Debug, ImplConstr)]\npub struct ${typeName}(pub Constr${index}<Box<${boxContent}>>);`;
          }
        }
      }
    }

    // Check if this is a constructor enum (contains "|" delimiter from getConstrCode)
    // But exclude cases where | is inside angle brackets (like Vec<A|B|C>)
    const hasTopLevelPipe = (() => {
      let depth = 0;
      for (let i = 0; i < typeCode.length; i++) {
        const char = typeCode[i];
        if (char === "<") depth++;
        else if (char === ">") depth--;
        else if (char === "|" && depth === 0) return true;
      }
      return false;
    })();

    if (hasTopLevelPipe) {
      // Split on top-level pipes only (respecting nested < > and ( ) brackets)
      const variantDefs: string[] = [];
      let current = "";
      let depth = 0;

      for (let i = 0; i < typeCode.length; i++) {
        const char = typeCode[i];
        if (char === "<" || char === "(") {
          depth++;
          current += char;
        } else if (char === ">" || char === ")") {
          depth--;
          current += char;
        } else if (char === "|" && depth === 0) {
          // Top-level pipe - split here
          if (current.trim()) {
            variantDefs.push(current.trim());
          }
          current = "";
        } else {
          current += char;
        }
      }
      // Don't forget the last variant
      if (current.trim()) {
        variantDefs.push(current.trim());
      }

      // Parse and collect variant information with indices
      const variants: Array<{ index: number; name: string; fields: string }> =
        [];

      variantDefs.forEach((variantDef) => {
        const trimmed = variantDef.trim();
        if (!trimmed) return;

        // Check for format: "VariantName@@INDEX::fields" (from combineVariantWithFields)
        if (trimmed.includes("@@")) {
          const [name, rest] = trimmed.split("@@");
          // Split only on the first :: to separate index from fields
          const firstColonColonIndex = rest.indexOf("::");
          const indexStr = rest.substring(0, firstColonColonIndex);
          const fields = rest.substring(firstColonColonIndex + 2);
          // For enum variants:
          // - Single param: just (field) without Box
          // - Multiple params: (Box<(field1, field2, ...)>)
          let formattedFields = "";
          if (fields) {
            // Parse the fields to count how many there are
            const innerFields = fields.slice(1, -1); // Remove outer parentheses
            // Check if there's only one field (no commas at depth 0)
            let depth = 0;
            let hasMultipleFields = false;
            for (const char of innerFields) {
              if (char === '(' || char === '<') depth++;
              else if (char === ')' || char === '>') depth--;
              else if (char === ',' && depth === 0) {
                hasMultipleFields = true;
                break;
              }
            }
            if (hasMultipleFields) {
              formattedFields = `(Box<${fields}>)`;
            } else {
              // Single param - just use the type directly
              formattedFields = `(${innerFields})`;
            }
          }
          variants.push({
            index: parseInt(indexStr, 10),
            name,
            fields: formattedFields,
          });
        }
        // Check for format: "INDEX::fields" (inline constructor)
        else if (trimmed.includes("::")) {
          // Split only on the first :: to separate index from fields
          const firstColonColonIndex = trimmed.indexOf("::");
          const indexStr = trimmed.substring(0, firstColonColonIndex);
          const fields = trimmed.substring(firstColonColonIndex + 2);
          variants.push({
            index: parseInt(indexStr, 10),
            name: `Variant${indexStr}`, // Fallback name
            fields: fields || "",
          });
        }
        // Plain variant name - look up the variant's definition in typeCodeMap
        else {
          // Try to find the variant's constructor definition in typeCodeMap
          if (typeCodeMap && typeCodeMap[trimmed]) {
            const variantDef = typeCodeMap[trimmed];
            // Check if it's a constructor format "INDEX::fields"
            if (variantDef.includes("::")) {
              // Split only on the first :: to separate index from fields
              const firstColonColonIndex = variantDef.indexOf("::");
              const indexStr = variantDef.substring(0, firstColonColonIndex);
              const fields = variantDef.substring(firstColonColonIndex + 2);
              const index = parseInt(indexStr, 10);
              if (!isNaN(index)) {
                // Format the fields for enum variant: (VariantType)
                const formattedFields = fields ? `(${trimmed})` : "";
                variants.push({
                  index,
                  name: trimmed,
                  fields: formattedFields,
                });
                return;
              }
            }
          }
          // Fallback: variant without fields
          variants.push({
            index: 999, // Put at end
            name: trimmed,
            fields: "",
          });
        }
      });

      // Sort variants by index
      variants.sort((a, b) => a.index - b.index);

      // Generate enum with ConstrEnum derive
      let enumCode = `#[derive(Debug, Clone, ConstrEnum)]\n`;
      enumCode += `pub enum ${typeName} {\n`;

      variants.forEach((variant) => {
        enumCode += `    ${variant.name}${variant.fields},\n`;
      });

      enumCode += `}`;
      return enumCode;
    }

    // For non-constructor types, use type alias
    // But skip generating aliases between enum variants with empty constructors
    if (typeCodeMap) {
      // Check for direct circular type alias: if typeCode points back to typeName
      // For example: A -> B, B -> A (both without constructor definitions)
      if (typeCodeMap[typeCode] === typeName) {
        // Direct circular reference detected
        // Skip both sides of circular reference - don't generate type alias
        return "";
      }

      // Check if both the typeName and typeCode are enum variants
      const isTypeNameEnumVariant = Object.entries(typeCodeMap).some(
        ([name, code]) => {
          if (name === typeName) return false;
          if (code && code.includes("|")) {
            const variants = code.split("|").map((v) => v.trim());
            return variants.includes(typeName);
          }
          return false;
        }
      );

      const isTypeCodeEnumVariant = Object.entries(typeCodeMap).some(
        ([name, code]) => {
          if (name === typeCode) return false;
          if (code && code.includes("|")) {
            const variants = code.split("|").map((v) => v.trim());
            return variants.includes(typeCode);
          }
          return false;
        }
      );

      // Check if both are empty constructors
      const isTypeNameEmptyConstructor =
        typeCodeMap[typeName] && typeCodeMap[typeName].match(/^\d+::$/);
      const isTypeCodeEmptyConstructor =
        typeCodeMap[typeCode] && typeCodeMap[typeCode].match(/^\d+::$/);

      // Skip generating alias if both are enum variants with empty constructors
      if (
        isTypeNameEnumVariant &&
        isTypeCodeEnumVariant &&
        isTypeNameEmptyConstructor &&
        isTypeCodeEmptyConstructor
      ) {
        return ""; // Skip generating this type alias
      }
    }

    // Check if typeCode contains @@ patterns (enum definitions) and replace with type names
    // This handles cases like: List<Branch@@0::...|Fork@@1::...|Leaf@@2::...> -> List<ProofStep>
    if (typeCode.includes("@@") && typeCodeMap) {
      // Find if there's a type name for this enum definition
      for (const [name, code] of Object.entries(typeCodeMap)) {
        if (name === typeName) continue; // Skip self
        // Check if this type's code matches the pattern in typeCode
        if (code && code.includes("@@")) {
          // Try to match and replace the enum pattern with the type name
          const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const pattern = new RegExp(escapedCode, "g");
          typeCode = typeCode.replace(pattern, name);
        }
      }
    }

    return `pub type ${typeName} = ${typeCode};`;
  };

  private mapToRustType = (
    whiskyType: string,
    typeCodeMap?: Record<string, string>
  ): string => {
    // Use the instance's native type map

    // Handle List types (whisky uses List<> not Vec<>)
    if (whiskyType.startsWith("List<")) {
      const innerType = whiskyType.slice(5, -1);
      if (innerType.startsWith("(")) {
        // List of tuples - extract tuple types
        return `&[${innerType}]`;
      }
      return `&[${innerType}]`;
    }

    // Handle Option types
    if (whiskyType.startsWith("Option<")) {
      const innerType = whiskyType.slice(7, -1);
      const mappedInner = this.mapToRustType(innerType, typeCodeMap);
      return `Option<${mappedInner}>`;
    }

    // Handle tuple types
    if (whiskyType.startsWith("(") && whiskyType.endsWith(")")) {
      return whiskyType; // Keep tuple as-is for now
    }

    // Check if this is a custom type that's a List
    if (typeCodeMap && typeCodeMap[whiskyType]) {
      const typeCode = typeCodeMap[whiskyType];
      // If the type code starts with "List<", extract the inner type
      if (typeCode.startsWith("List<")) {
        const innerType = typeCode.slice(5, -1);
        // Check if the inner type is a union (e.g., "Branch|Fork|Leaf")
        // If so, find if there's a type alias for it
        if (innerType.includes("|")) {
          for (const [aliasName, aliasCode] of Object.entries(typeCodeMap)) {
            if (aliasCode === innerType) {
              return `&[${aliasName}]`;
            }
          }
        }
        return `&[${innerType}]`;
      }
    }

    return this.nativeTypeMap[whiskyType] || "&str"; // Default to &str for unknown types
  };

  constant = (plutusVersion: string) =>
    `pub struct AppConfig {
    pub plutus_version: LanguageVersion,
    pub network_id: u8,
    pub stake_key_hash: Option<String>,
    pub is_stake_script_credential: bool,
}

impl AppConfig {
    pub fn new() -> Self {
        Self {
            plutus_version: LanguageVersion::${plutusVersion},
            network_id: 0,
            stake_key_hash: None,
            is_stake_script_credential: false,
        }
    }
}`;

  spendConstants = () => ``;

  getValVariableName = (validatorTitle: string) => {
    const valFuncName = validatorTitle.split(".");
    return snakeToCamelCase(valFuncName[valFuncName.length - 2]);
  };

  getConstrCode = (types: string[]): string => {
    // In Rust, constructor variants belong to an enum
    // Join variant names with a delimiter that can be split later
    // Using "|" as delimiter to maintain compatibility with getCodeImportList
    return types.join("|");
  };

  getCodeImportList = (importCode: string): string[] => {
    // Split constructor enum variants
    return importCode.split("|");
  };

  getBlueprintName = (blueprintName: string, purpose: ScriptPurpose): string =>
    `${capitalizedFirstLetter(blueprintName)}${capitalizedFirstLetter(
      purpose
    )}`;

  any = (): string => "PlutusData";

  pairs = (key: string, value: string): string => `Map<${key}, ${value}>`;

  list = (itemCode: string): string => `List<${itemCode}>`;

  tuple = (...itemCodes: string[]): string => `(${itemCodes.join(", ")})`;

  option = (someCode: string): string => `Option<${someCode}>`;

  constr = (
    index: number,
    fieldCodes: string[]
  ): { toImport: string; constructorCode: string } => {
    // For Rust enum generation, encode the index and fields
    // The variant name will be prepended by the parser (stored in titleCodeMap)
    // Format: "INDEX::(field1, field2, ...)" or "INDEX::" for unit variants
    // When used in getConstrCode, the parser will pass variant names that have
    // this format stored in titleCodeMap
    const fields = fieldCodes.length > 0 ? `(${fieldCodes.join(", ")})` : "";
    return {
      toImport: "ConstrEnum",
      constructorCode: `${index}::${fields}`,
    };
  };

  combineVariantWithFields = (
    variantName: string,
    fieldCode: string
  ): string => {
    // Combine variant name with its encoded field definition
    // fieldCode format: "INDEX::fields"
    // Result: "VariantName@@INDEX::fields" (using @@ as delimiter)
    return `${variantName}@@${fieldCode}`;
  };
}
