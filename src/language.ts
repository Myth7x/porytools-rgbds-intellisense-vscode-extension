import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { parseSymbols, RgbdsSymbol, rgbdsWordPattern, wordAt } from './parser';
import { builtinDocs, directives, mnemonics, registers, selector } from './rgbdsData';

export class RgbdsLanguageService {
  private readonly files = new Map<string, string>();
  private symbols: RgbdsSymbol[] = [];

  register(): vscode.Disposable {
    return vscode.Disposable.from(
      vscode.languages.registerCompletionItemProvider(selector, {
        provideCompletionItems: () => [
          ...mnemonics.map((name) => completion(name, vscode.CompletionItemKind.Keyword, 'RGBDS instruction')),
          ...directives.map((name) => completion(name, vscode.CompletionItemKind.Keyword, builtinDocs.get(name) ?? 'RGBDS directive')),
          ...registers.map((name) => completion(name, vscode.CompletionItemKind.Variable, 'CPU register or condition')),
          ...this.symbols.map((symbol) => completion(symbol.name, symbol.kind === 'macro' ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Reference, `${symbol.kind} in ${path.basename(symbol.file)}`))
        ]
      }),
      vscode.languages.registerDefinitionProvider(selector, {
        provideDefinition: (document, position) => {
          const symbol = this.findSymbol(document, position);
          if (!symbol) return undefined;
          return new vscode.Location(vscode.Uri.file(symbol.file), new vscode.Position(symbol.line, symbol.character));
        }
      }),
      vscode.languages.registerReferenceProvider(selector, {
        provideReferences: (document, position, options) => {
          const word = wordAt(document.getText(), document.offsetAt(position));
          if (!word) return [];
          const refs = this.findReferences(word);
          if (options.includeDeclaration) return refs;
          const symbol = this.findSymbol(document, position);
          return refs.filter((ref) => !symbol || ref.uri.fsPath !== symbol.file || ref.range.start.line !== symbol.line);
        }
      }),
      vscode.languages.registerRenameProvider(selector, {
        prepareRename(document, position) {
          const word = wordAt(document.getText(), document.offsetAt(position));
          if (!word) throw new Error('No RGBDS symbol here.');
          const range = wordRange(document, position, word);
          if (!range) throw new Error('No RGBDS symbol here.');
          return range;
        },
        provideRenameEdits: (document, position, newName) => {
          const oldName = wordAt(document.getText(), document.offsetAt(position));
          const edit = new vscode.WorkspaceEdit();
          for (const ref of this.findReferences(oldName)) edit.replace(ref.uri, ref.range, newName);
          return edit;
        }
      }),
      vscode.languages.registerHoverProvider(selector, {
        provideHover: (document, position) => {
          const word = wordAt(document.getText(), document.offsetAt(position));
          if (!word) return undefined;
          const upper = word.toUpperCase();
          const doc = builtinDocs.get(upper);
          if (doc) return new vscode.Hover(new vscode.MarkdownString(`**${upper}**\n\n${doc}`));
          const symbol = this.findSymbol(document, position);
          if (!symbol) return undefined;
          return new vscode.Hover(new vscode.MarkdownString(`**${symbol.name}**\n\n${symbol.kind} in \`${path.basename(symbol.file)}:${symbol.line + 1}\``));
        }
      }),
      vscode.languages.registerDocumentSymbolProvider(selector, {
        provideDocumentSymbols: (document) => this.symbols
          .filter((symbol) => symbol.file === document.uri.fsPath && symbol.kind !== 'include')
          .map((symbol) => new vscode.SymbolInformation(
            symbol.name,
            symbol.kind === 'macro' ? vscode.SymbolKind.Function : vscode.SymbolKind.Field,
            symbol.fullName === symbol.name ? '' : symbol.fullName,
            new vscode.Location(document.uri, new vscode.Position(symbol.line, symbol.character))
          ))
      }),
      vscode.languages.registerWorkspaceSymbolProvider({
        provideWorkspaceSymbols: (query) => {
          const needle = query.toLowerCase();
          return this.symbols
            .filter((symbol) => symbol.kind !== 'include' && (!needle || symbol.fullName.toLowerCase().includes(needle) || symbol.name.toLowerCase().includes(needle)))
            .map((symbol) => new vscode.SymbolInformation(
              symbol.fullName,
              symbol.kind === 'macro' ? vscode.SymbolKind.Function : vscode.SymbolKind.Field,
              path.basename(symbol.file),
              new vscode.Location(vscode.Uri.file(symbol.file), new vscode.Position(symbol.line, symbol.character))
            ));
        }
      })
    );
  }

  async refreshSymbols(): Promise<void> {
    this.files.clear();
    this.symbols = [];
    const uris = await vscode.workspace.findFiles('**/*.{asm,inc,s,gbasm}', '**/{node_modules,.git}/**');
    await Promise.all(uris.map(async (uri) => {
      const text = await fs.readFile(uri.fsPath, 'utf8');
      this.files.set(uri.fsPath, text);
      this.symbols.push(...parseSymbols(text, uri.fsPath));
    }));
  }

  private findSymbol(document: vscode.TextDocument, position: vscode.Position): RgbdsSymbol | undefined {
    const word = wordAt(document.getText(), document.offsetAt(position));
    if (!word) return undefined;
    return this.symbolsByPriority(word, document.uri.fsPath)[0];
  }

  private symbolsByPriority(word: string, file: string): RgbdsSymbol[] {
    return this.symbols
      .filter((symbol) => symbol.name === word || symbol.fullName === word)
      .sort((left, right) => Number(right.file === file) - Number(left.file === file));
  }

  private findReferences(word: string): vscode.Location[] {
    if (!word) return [];
    const refs: vscode.Location[] = [];
    const pattern = rgbdsWordPattern(word);

    for (const [file, text] of this.files) {
      for (const lineText of text.split(/\r?\n/).entries()) {
        const [line, source] = lineText;
        pattern.lastIndex = 0;
        for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
          refs.push(new vscode.Location(vscode.Uri.file(file), new vscode.Range(line, match.index, line, match.index + word.length)));
        }
      }
    }

    return refs;
  }
}

function completion(label: string, kind: vscode.CompletionItemKind, documentation: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, kind);
  item.detail = 'RGBDS';
  item.documentation = documentation;
  return item;
}

function wordRange(document: vscode.TextDocument, position: vscode.Position, word: string): vscode.Range | undefined {
  const offset = document.offsetAt(position);
  const start = offset - (document.getText().slice(0, offset).match(/[A-Za-z_.$@#][\w.$@#]*$/)?.[0].length ?? 0);
  return new vscode.Range(document.positionAt(start), document.positionAt(start + word.length));
}
