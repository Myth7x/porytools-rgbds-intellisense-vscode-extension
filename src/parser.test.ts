import assert from 'node:assert/strict';
import { parseSymbols, stripComment, wordAt } from './parser';

const source = `
Start:
  ld a, $01 ; comment
.Loop:
  jr .Loop
Print MACRO
  nop
ENDM
INCLUDE "hardware.inc"
  db "; not comment"
`;

const symbols = parseSymbols(source, 'main.asm');
assert.deepEqual(symbols.map((s) => [s.kind, s.name]), [
  ['label', 'Start'],
  ['label', '.Loop'],
  ['macro', 'Print'],
  ['include', 'hardware.inc']
]);
assert.equal(symbols[1].fullName, 'Start.Loop');
assert.equal(stripComment('db ";"; real'), 'db ";"');
assert.equal(wordAt('call Start', 7), 'Start');

console.log('parser tests passed');
