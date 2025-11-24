import {
	ConstructorDefinition,
	Definition,
	Definitions,
	Preamble,
	Validator,
} from "./types";
import { ICodeBuilder } from "./codeBuilder";

export class BlueprintParser {
	preamble: Preamble;
	validators: Validator[];
	definitions: Definitions;

	// Visited definition key
	visited: Set<string> = new Set();

	// Custom code implementation - Set of titles
	customs: Set<string> = new Set();

	// Imports code implementation - Set of titles
	imports: Set<string> = new Set();

	// Map of definition key to title
	defTitleMap: Record<string, string> = {};
	titleDefMap: Record<string, string> = {};

	// Map of definition title to code implementation
	titleCodeMap: Record<string, string> = {};

	// Map of definition title to dependencies' title
	titleDepsMap: Record<string, string[]> = {};

	// Map of definition title to import names
	titleImportsMap: Record<string, string[]> = {};

	// Snippets for final code
	importSnippet: string[] = [];
	blueprintSnippet: string[] = [];
	typeSnippet: string[] = [];
	debugLog: string[] = [];

	constructor(
		blueprint: any,
		public importCodeMap: Record<string, string>,
		public blueprintImportCodeMap: Record<string, string>,
		private codeBuilder: ICodeBuilder
	) {
		this.preamble = blueprint.preamble;
		this.validators = blueprint.validators;
		this.definitions = blueprint.definitions;
	}

	analyzeDefinitions() {
		Object.entries(this.importCodeMap).forEach(([key, value]) => {
			{
				this.mapDefTitle(key, value);
				this.addToImportsMap(key, value);
			}
		});
		for (const key in this.definitions) {
			this.traceDefinition(key);
		}
		return this;
	}

	generateBlueprints() {
		const plutusVesion = this.preamble.plutusVersion.toUpperCase();
		let constantSnippet: string = this.codeBuilder.constant(plutusVesion);
		let hasSpendingBlueprint = false;
		const spendingConstantSnippet: string = this.codeBuilder.spendConstants();
		const blueprintSnippet: string[] = [];

		this.validators.forEach((validator, validatorIndex) => {
			// loop through validators check needed
			let redeemer = "";
			let datum = "";
			let parameters: string[] = [];
			if (validator.parameters) {
				parameters = validator.parameters.map((parameter) => {
					this.checkValidatorSchemas(
						this.getDefinitionKey(parameter.schema.$ref)
					);
					const defKey = this.getDefinitionKey(parameter.schema.$ref);
					const title = this.defTitleMap[defKey];
					return this.titleCodeMap[title];
				});
			}

			if (validator.redeemer && "$ref" in validator.redeemer.schema) {
				this.checkValidatorSchemas(
					this.getDefinitionKey(validator.redeemer.schema.$ref!)
				);
				const defKey = this.getDefinitionKey(validator.redeemer.schema.$ref!);
				redeemer = this.defTitleMap[defKey];
			}

			if (validator.datum) {
				this.checkValidatorSchemas(
					this.getDefinitionKey(validator.datum.schema.$ref)
				);
				const defKey = this.getDefinitionKey(validator.datum.schema.$ref);
				datum = this.defTitleMap[defKey];
			}

			// Genearte blueprint code
			const valFuncName = validator.title.split(".");
			const validatorType = valFuncName[valFuncName.length - 1];
			const blueprintName = this.codeBuilder.getValVariableName(
				validator.title
			);

			let code = "";
			const toImport = this.blueprintImportCodeMap[validatorType];
			const blueprintFullName = this.codeBuilder.getBlueprintName(
				blueprintName,
				validatorType as "spend" | "mint" | "withdraw" | "publish"
			);

			if (toImport) {
				this.imports.add(toImport);
			}
			switch (validatorType) {
				case "spend":
					hasSpendingBlueprint = true;
					code = this.codeBuilder.spendJson(
						blueprintFullName,
						validatorIndex,
						parameters,
						datum,
						redeemer
					);

					break;
				case "mint":
					code = this.codeBuilder.mintJson(
						blueprintFullName,
						validatorIndex,
						parameters
					);
					break;
				case "withdraw":
					code = this.codeBuilder.withdrawJson(
						blueprintFullName,
						validatorIndex,
						parameters
					);
					break;
				case "publish":
					code = this.codeBuilder.withdrawJson(
						blueprintFullName,
						validatorIndex,
						parameters
					);
					break;
			}
			blueprintSnippet.push(code);
		});

		if (hasSpendingBlueprint) {
			constantSnippet += spendingConstantSnippet;
		}
		this.blueprintSnippet = [constantSnippet, ...blueprintSnippet];

		return this;
	}

	generateTypes() {
		if (this.customs.size > 0) {
			this.customs.forEach((custom) => {
				const customTitle = this.defTitleMap[custom];
				this.typeSnippet.push(
					this.codeBuilder.exportType(
						customTitle,
						this.titleCodeMap[customTitle]
					)
				);
			});
		}
		return this;
	}

	generateImports(blueprintPath: string) {
		if (this.imports.size > 0) {
			this.importSnippet = [
				this.codeBuilder.importJson("blueprint", blueprintPath),
				this.codeBuilder.importPackage(
					Array.from(this.imports),
					"@meshsdk/core"
				),
			];
		}
		return this;
	}

	private checkValidatorSchemas(key: string) {
		this.addToCustoms(key);
		const title = this.defTitleMap[key];

		const importNames = this.titleImportsMap[title];
		const dependencies = this.titleDepsMap[title];
		if (importNames) {
			importNames.forEach((importName) => {
				this.imports.add(importName);
			});
		}
		if (dependencies) {
			dependencies.forEach((depTitle) => {
				const def = this.titleDefMap[depTitle];
				if (def === undefined) {
					this.addDebugLog(
						`// key - ${key}`,
						`key - ${depTitle}`,
						`Warning: ${def} is not defined in the definitions`
					);
				}
				this.checkValidatorSchemas(def);
			});
		}
	}

	/**
	 * Trace down the definition's nested type and implement the code if its at the end
	 * @param key The key of the definition in the blueprint
	 * @returns The implementation of the definition code snippet
	 */
	private traceDefinition(key: string) {
		if (this.visited.has(key)) {
			const title = this.defTitleMap[key];
			return this.titleCodeMap[title];
		}
		this.visited.add(key);

		if (Object.keys(this.titleCodeMap).includes(key)) {
			const title = key.split("/").pop()!;

			const value = this.titleCodeMap[key as keyof typeof this.titleCodeMap];
			this.codeBuilder.getCodeImportList(value).forEach((importName) => {
				this.addToImportsMap(title, importName);
			});
			this.mapDefTitle(key, title);
			this.titleCodeMap[title] = value;
			return value;
		}

		const def = this.definitions[key];
		const title = def.title || key; // If no title, use the key as title
		const defCode = this.getDefinitionCode(title, def);
		this.mapDefTitle(key, title);
		this.titleCodeMap[title] = defCode;

		return defCode;
	}

	/**
	 * Check what the definition is and implement the code
	 * It also add to `titleDepsMap` on what the dependencies needed by this definition
	 * It also add to `defImportsMap` on what the imports needed this definition
	 * @param def The definition json
	 * @returns The implementation of the definition code snippet
	 */
	private getDefinitionCode(title_or_key: string, def: Definition): string {
		const { title, dataType, items } = def;

		if (dataType) {
			if (!title) {
				// | IntDefinition
				if (dataType === "integer") {
					this.mapDefTitle("Int", "Integer");
					this.addToImportsMap("Int", "Integer"); // Int as key of Integer
					return this.importCodeMap["Int"];
				}
				// | ByteDefinition -> native one
				if (dataType === "bytes") {
					this.mapDefTitle("ByteArray", "ByteString");
					this.addToImportsMap("ByteArray", "ByteString"); // ByteArray as key of ByteString
					return this.importCodeMap["ByteArray"];
				}

				if (dataType === "list") {
					if ("$ref" in items!) {
						const itemDefRef = this.getDefinitionKey(items.$ref);
						const itemCode = this.traceDefinition(itemDefRef);
						const itemTitle = this.getDefinitionTitle(itemDefRef);

						this.addToDepsMap(title_or_key, itemTitle);
						this.addToImportsMap(title_or_key, "List");

						return this.codeBuilder.list(itemCode);
					}

					// | TupleDefinition
					const itemsArray = items as { $ref: string }[];
					const itemCodes: string[] = [];

					itemsArray.forEach((item) => {
						const itemDefRef = this.getDefinitionKey(item.$ref);
						const itemCode = this.traceDefinition(itemDefRef);
						const itemTitle = this.getDefinitionTitle(itemDefRef);
						itemCodes.push(itemCode);
						this.addToDepsMap(title_or_key, itemTitle);
					});

					this.addToImportsMap(title_or_key, "Tuple");
					return this.codeBuilder.tuple(...itemCodes);
				}

				return this.codeBuilder.any();
			}

			// | ByteDefinition -> others
			if (title === "bytes") {
				this.addToImportsMap(title, "ByteString");
				return this.importCodeMap["ByteArray"];
			}

			// | MapDefinition
			if (dataType === "map") {
				const keyDefRef = this.getDefinitionKey(def.keys!.$ref);
				const valueDefRef = this.getDefinitionKey(def.values!.$ref);
				const keyCode = this.traceDefinition(keyDefRef);
				const valueCode = this.traceDefinition(valueDefRef);
				const keyTitle = this.getDefinitionTitle(keyDefRef);
				const valueTitle = this.getDefinitionTitle(valueDefRef);
				this.addToDepsMap(title, keyTitle);
				this.addToDepsMap(title, valueTitle);
				this.addToImportsMap(title, "Pairs");
				return this.codeBuilder.pairs(keyCode, valueCode);
			}

			if (dataType === "list") {
				// | ListDefinition
				if ("$ref" in items!) {
					const itemDefRef = this.getDefinitionKey(items.$ref);
					const itemCode = this.traceDefinition(itemDefRef);
					const itemTitle = this.getDefinitionTitle(itemDefRef);

					this.addToDepsMap(title, itemTitle);
					this.addToImportsMap(title, "List");

					return this.codeBuilder.list(itemCode);
				}

				// | TupleDefinition
				const itemsArray = items as { $ref: string }[];
				const itemCodes: string[] = [];

				itemsArray.forEach((item) => {
					const itemDefRef = this.getDefinitionKey(item.$ref);
					const itemCode = this.traceDefinition(itemDefRef);
					const itemTitle = this.getDefinitionTitle(itemDefRef);
					itemCodes.push(itemCode);
					this.addToDepsMap(title, itemTitle);
				});

				this.addToImportsMap(title, "Tuple");
				return this.codeBuilder.tuple(...itemCodes);
			}
		}

		// | DataDefinition
		if (title === "Data") {
			return this.codeBuilder.any();
		}

		// | BoolDefinition;
		if (title === "Bool") {
			this.addToImportsMap(title, "Bool");
			return this.importCodeMap["Bool"];
		}

		// | OptionDefinition
		if (title === "Option") {
			const someDefRef = this.getDefinitionKey(def.anyOf![0].fields[0]!.$ref);
			const someCode = this.traceDefinition(someDefRef);
			const someTitle = this.getDefinitionTitle(someDefRef);
			this.addToDepsMap(title, someTitle);
			this.addToImportsMap(title, "Option");
			return this.codeBuilder.option(someCode);
		}

		// | ConstructorsDefinition;
		if (title && def.anyOf) {
			const constructors: string[] = def.anyOf.map(
				(constr: ConstructorDefinition) => this.handleConstructor(constr, title)
			);
			return this.codeBuilder.getOrTypeCode(constructors);
		}

		return this.codeBuilder.any();
	}

	private handleConstructor = (constr: Definition, currentTitle: string) => {
		const {
			index,
			title: constructorTitle,
			fields,
		} = constr as ConstructorDefinition;
		const fieldCodes: string[] = [];

		fields?.forEach((field) => {
			const fieldDefRef = this.getDefinitionKey(field.$ref);
			const fieldCode = this.traceDefinition(fieldDefRef);
			const fieldTitle = this.getDefinitionTitle(fieldDefRef);
			constructorTitle === currentTitle
				? this.addToDepsMap(currentTitle, fieldTitle)
				: this.addToDepsMap(constructorTitle, fieldTitle);
			fieldCodes.push(fieldCode!);
		});

		const { toImport, constructorCode } = this.codeBuilder.constr(
			index,
			fieldCodes
		);

		if (constructorTitle === currentTitle) {
			this.addToImportsMap(currentTitle, toImport);
			return constructorCode;
		}

		this.addToDepsMap(currentTitle, constructorTitle!);
		this.addToImportsMap(constructorTitle!, toImport);
		this.mapDefTitle(constructorTitle!, constructorTitle!);
		this.titleCodeMap[constructorTitle!] = constructorCode;
		return constructorTitle!;
	};

	private getDefinitionKey = (defRef: string) => {
		const key = defRef.replaceAll("~1", "/").replaceAll("#/definitions/", "");
		return key;
	};

	private getDefinitionTitle = (defRef: string) => {
		const key = this.getDefinitionKey(defRef);
		if (key in this.defTitleMap) {
			return this.defTitleMap[key];
		}
		let title = this.definitions[key].title;
		if (title) {
			this.mapDefTitle(key, title);
			return title;
		}
		title = key.split("/").pop()!;
		return title;
	};

	private addToImportsMap = (title: string, importName: string) => {
		this.titleCodeMap[title] = importName;
		this.codeBuilder.getCodeImportList(importName).forEach((importCode) => {
			if (!this.titleImportsMap[title]) {
				this.titleImportsMap[title] = [];
			}
			if (this.titleImportsMap[title].includes(importCode)) {
				return;
			}
			this.titleImportsMap[title].push(importCode);
		});
	};

	private addToDepsMap = (title: string, depTitle: string) => {
		if (!this.titleDepsMap[title]) {
			this.titleDepsMap[title] = [];
		}
		if (this.titleDepsMap[title].includes(depTitle)) {
			return;
		}
		this.titleDepsMap[title].push(depTitle);
	};

	private mapDefTitle = (def: string, title: string) => {
		this.defTitleMap[def] = title;
		this.titleDefMap[title] = def;
	};

	private addToCustoms = (def: string) => {
		const parentTitle = def.split("$")[0];

		// Catching Tuple & Pairs
		if (parentTitle && parentTitle in this.importCodeMap) {
			const value =
				this.importCodeMap[parentTitle as keyof typeof this.importCodeMap];
			this.codeBuilder.getCodeImportList(value).forEach((importName) => {
				this.addToImportsMap(def, importName);
			});
			return;
		}

		if (def in this.importCodeMap) {
			const value = this.importCodeMap[def as keyof typeof this.importCodeMap];
			this.codeBuilder.getCodeImportList(value).forEach((importName) => {
				this.addToImportsMap(def, importName);
			});
			return;
		}
		this.customs.add(def);
	};

	getFullSnippet = () => [
		...this.importSnippet,
		"\n",
		...this.blueprintSnippet,
		"\n",
		...this.typeSnippet,
		"\n",
		...this.debugLog,
	];

	addDebugLog = (...logs: string[]) => {
		let currentLog = "";
		for (const log of logs) {
			currentLog += ` ${log}`;
		}
		this.debugLog.push(currentLog);
	};
}
