import * as vscode from 'vscode';

interface NotifyOptions {
  message: string;
  type?: 'info' | 'warning' | 'error';
  actions?: string[];
}

interface TabOptions {
  id?: string;
  title: string;
  html: string;
  column?: vscode.ViewColumn;
}

interface StatusOptions {
  id: string;
  text: string;
  tooltip?: string;
  command?: string;
}

export function registerUiCommands(context: vscode.ExtensionContext): vscode.Disposable {
  const tabs = new Map<string, vscode.WebviewPanel>();
  const statuses = new Map<string, vscode.StatusBarItem>();

  return vscode.Disposable.from(
    vscode.commands.registerCommand('gbasm.ui.notify', async (options: NotifyOptions) => {
      const actions = options.actions ?? [];
      if (options.type === 'error') return vscode.window.showErrorMessage(options.message, ...actions);
      if (options.type === 'warning') return vscode.window.showWarningMessage(options.message, ...actions);
      return vscode.window.showInformationMessage(options.message, ...actions);
    }),
    vscode.commands.registerCommand('gbasm.ui.tab', (options: TabOptions) => {
      const id = options.id ?? options.title;
      const existing = tabs.get(id);
      if (existing) {
        existing.title = options.title;
        existing.webview.html = options.html;
        existing.reveal(options.column ?? vscode.ViewColumn.One);
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        `gbasm.${id}`,
        options.title,
        options.column ?? vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = options.html;
      panel.onDidDispose(() => tabs.delete(id), undefined, context.subscriptions);
      tabs.set(id, panel);
    }),
    vscode.commands.registerCommand('gbasm.ui.status', (options: StatusOptions) => {
      let item = statuses.get(options.id);
      if (!item) {
        item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        statuses.set(options.id, item);
        context.subscriptions.push(item);
      }
      item.text = options.text;
      item.tooltip = options.tooltip;
      item.command = options.command;
      item.show();
    }),
    vscode.commands.registerCommand('gbasm.ui.clearStatus', (id: string) => {
      statuses.get(id)?.dispose();
      statuses.delete(id);
    })
  );
}
