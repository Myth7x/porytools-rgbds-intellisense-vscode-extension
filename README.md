# PoryTools RGBDS IntelliSense VSCode Extension

Standalone Visual Studio Code language extension for Game Boy projects using RGBDS. No language server or application backend is required.

## Features

- Syntax highlighting for `.asm`, `.inc`, `.s`, and `.gbasm` files
- Completion for RGBDS instructions, directives, registers, labels, and macros
- Go to definition, references, rename, hover, and symbol navigation
- Porygon dark theme and welcome view
- Notification when a newer GitHub release is available

Requires Visual Studio Code 1.90 or newer.

## Setup in Visual Studio Code

1. Download the latest `.vsix` file from [GitHub Releases](https://github.com/Myth7x/porytools-rgbds-intellisense-vscode-extension/releases).
2. Open the Visual Studio Code Command Palette.
3. Run `Extensions: Install from VSIX...` and select the downloaded file.
4. Reload Visual Studio Code when prompted.
5. Open a folder containing RGBDS source files. Files ending in `.asm`, `.inc`, `.s`, or `.gbasm` are detected automatically.

The same file can be installed from a terminal:

```sh
code --install-extension /path/to/rgbds-intellisense.vsix
```

VS Code does not automatically update extensions installed from VSIX by default. This extension checks GitHub at most once every 24 hours and offers a link when a newer release is available.

If a file is not detected as RGBDS, run `Change Language Mode` and select `RGBDS`. No RGBDS compiler or backend is required for the editor features.

## Development

```sh
npm install
./scripts/build.sh
./scripts/test.sh
```

## References / Quellen

- [RGBDS documentation](https://rgbds.gbdev.io/docs)
- [Visual Studio Code Extension API](https://code.visualstudio.com/api)
- [Visual Studio Code language extensions](https://code.visualstudio.com/api/language-extensions/overview)
- [Installing extensions from VSIX](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_install-from-a-vsix)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)
- [Publishing Visual Studio Code extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## License

[MIT](LICENSE)
