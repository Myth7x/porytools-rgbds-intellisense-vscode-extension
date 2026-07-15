#!/usr/bin/env bash
set -eu

cd "$(dirname "$0")/.."
./scripts/build-release.sh
exec npm exec -- vsce publish --packagePath dist/rgbds-intellisense.vsix
