export type SymbolKind = 'label' | 'macro' | 'include';

export interface RgbdsSymbol {
  name: string;
  fullName: string;
  kind: SymbolKind;
  line: number;
  character: number;
  file: string;
}

const labelPattern = /^\s*([A-Za-z_.$@][\w.$@#]*):/;
const macroPattern = /^\s*([A-Za-z_.$@][\w.$@#]*)\s+MACRO\b/i;
const includePattern = /^\s*INCLUDE\s+"([^"]+)"/i;

export function parseSymbols(text: string, file: string): RgbdsSymbol[] {
  const symbols: RgbdsSymbol[] = [];
  const lines = text.split(/\r?\n/);
  let currentGlobal = '';

  for (let line = 0; line < lines.length; line += 1) {
    const source = stripComment(lines[line]);
    const label = source.match(labelPattern);
    if (label) {
      const name = label[1];
      const fullName = name.startsWith('.') && currentGlobal ? `${currentGlobal}${name}` : name;
      symbols.push({ name, fullName, kind: 'label', line, character: source.indexOf(name), file });
      if (!name.startsWith('.')) currentGlobal = name;
      continue;
    }

    const macro = source.match(macroPattern);
    if (macro) {
      symbols.push({ name: macro[1], fullName: macro[1], kind: 'macro', line, character: source.indexOf(macro[1]), file });
      continue;
    }

    const include = source.match(includePattern);
    if (include) {
      symbols.push({ name: include[1], fullName: include[1], kind: 'include', line, character: source.indexOf(include[1]), file });
    }
  }

  return symbols;
}

export function stripComment(line: string): string {
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index - 1] !== '\\') quoted = !quoted;
    if (char === ';' && !quoted) return line.slice(0, index);
  }
  return line;
}

export function wordAt(text: string, offset: number): string {
  const left = text.slice(0, offset).match(/[A-Za-z_.$@#][\w.$@#]*$/)?.[0] ?? '';
  const right = text.slice(offset).match(/^[\w.$@#]*/)?.[0] ?? '';
  return left + right;
}

export function rgbdsWordPattern(word: string): RegExp {
  return new RegExp(`(?<![\\w.$@#])${escapeRegExp(word)}(?![\\w.$@#])`, 'g');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
