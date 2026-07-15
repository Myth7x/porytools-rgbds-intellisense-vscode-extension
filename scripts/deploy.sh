#!/usr/bin/env bash
set -eu

cd "$(dirname "$0")/.."
npm run package
exec npm exec -- vsce publish --packagePath ../../dist/rgbds-intellisense.vsix
