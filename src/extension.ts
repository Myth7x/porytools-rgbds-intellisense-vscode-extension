import * as vscode from 'vscode';
import { RgbdsLanguageService } from './language';
import { registerReleaseCheck } from './releaseCheck';
import { registerUiCommands } from './ui';
import { WelcomeView } from './welcome';

export function activate(context: vscode.ExtensionContext): void {
  void vscode.workspace.getConfiguration('workbench').update('colorTheme', 'Porygon', vscode.ConfigurationTarget.Global);
  void vscode.workspace.getConfiguration('workbench').update('startupEditor', 'none', vscode.ConfigurationTarget.Global);

  const language = new RgbdsLanguageService();

  context.subscriptions.push(
    registerUiCommands(context),
    language.register(),
    registerReleaseCheck(context)
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => void language.refreshSymbols())
  );

  void new WelcomeView(context).show();
  void language.refreshSymbols();
}

export function deactivate(): void {}
