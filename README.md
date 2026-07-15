# PoryTools RGBDS IntelliSense VSCode Extension

Standalone Visual Studio Code language extension for Game Boy projects using RGBDS. No language server or application backend is required.

## Features

- Syntax highlighting for `.asm`, `.inc`, `.s`, and `.gbasm` files
- Completion for RGBDS instructions, directives, registers, labels, and macros
- Go to definition, references, rename, hover, and symbol navigation
- Porygon dark theme and welcome view
- Notification when a newer GitHub release is available

Requires Visual Studio Code 1.90 or newer.

## Development

```sh
npm install
./scripts/build.sh
./scripts/test.sh
```

The release check contacts GitHub at most once every 24 hours. It uses the public latest-release endpoint, requires no token, and opens the release page only when requested.

## References / Quellen

- [RGBDS documentation](https://rgbds.gbdev.io/docs)
- [Visual Studio Code Extension API](https://code.visualstudio.com/api)
- [Visual Studio Code language extensions](https://code.visualstudio.com/api/language-extensions/overview)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)
- [Publishing Visual Studio Code extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## License

[MIT](LICENSE)
