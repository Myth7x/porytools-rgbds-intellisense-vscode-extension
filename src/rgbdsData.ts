import * as vscode from 'vscode';

export const selector: vscode.DocumentSelector = { language: 'rgbds', scheme: 'file' };

export const mnemonics = ['adc', 'add', 'and', 'bit', 'call', 'ccf', 'cp', 'cpl', 'daa', 'dec', 'di', 'ei', 'halt', 'inc', 'jp', 'jr', 'ld', 'ldh', 'nop', 'or', 'pop', 'push', 'res', 'ret', 'reti', 'rl', 'rla', 'rlc', 'rlca', 'rr', 'rra', 'rrc', 'rrca', 'rst', 'sbc', 'scf', 'set', 'sla', 'sra', 'srl', 'stop', 'sub', 'swap', 'xor'];
export const directives = ['SECTION', 'INCLUDE', 'INCBIN', 'CHARMAP', 'NEWCHARMAP', 'SETCHARMAP', 'PUSHC', 'POPC', 'MACRO', 'ENDM', 'IF', 'ELIF', 'ELSE', 'ENDC', 'REPT', 'FOR', 'ENDR', 'DB', 'DW', 'DL', 'DS', 'RB', 'RW', 'RL', 'EXPORT', 'GLOBAL', 'IMPORT', 'DEF', 'EQU', 'SET', 'PURGE', 'RSRESET', 'RSSET'];
export const registers = ['a', 'b', 'c', 'd', 'e', 'h', 'l', 'af', 'bc', 'de', 'hl', 'sp', 'pc', 'nz', 'z', 'nc'];

export const builtinDocs = new Map<string, string>([
  ['SECTION', 'Declares an RGBDS section, for example `SECTION "Main", ROM0[$0150]`.'],
  ['INCLUDE', 'Includes another assembly source file.'],
  ['INCBIN', 'Includes raw binary data.'],
  ['MACRO', 'Starts a macro definition.'],
  ['ENDM', 'Ends a macro definition.'],
  ['DEF', 'Defines a numeric or string symbol.'],
  ['EQU', 'Defines a constant symbol.'],
  ['SET', 'Assigns or updates a symbol value.'],
  ['DB', 'Emits bytes.'],
  ['DW', 'Emits words.'],
  ['DS', 'Reserves bytes.']
]);
