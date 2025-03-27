# README for DEV

## Publishing the Extension

Before publishing, make sure you have the Visual Studio Code Extension Manager installed:

```sh
npm install -g @vscode/vsce
```

To generate the `.vsix` file:

```sh
vsce package
```

- You can install the extension from the `.vsix` file to test it locally.

To publish the extension to VS Code Marketplace:

```sh
vsce publish
```
