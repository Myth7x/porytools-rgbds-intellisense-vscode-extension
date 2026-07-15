import * as vscode from 'vscode';

export class WelcomeView {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async show(): Promise<void> {
    for (const group of vscode.window.tabGroups.all) {
      const welcomeTabs = group.tabs.filter((tab) => tab.label === 'Welcome');
      if (welcomeTabs.length) await vscode.window.tabGroups.close(welcomeTabs);
    }

    const panel = vscode.window.createWebviewPanel(
      'porytools.welcome',
      'Welcome',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
      }
    );
    const favicon = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'favicon.png');
    const logo = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'logo-big.png'));
    const nonce = Date.now().toString(36);

    panel.iconPath = favicon;
    panel.webview.html = welcomeHtml(logo.toString(), panel.webview.cspSource, nonce);
    panel.webview.onDidReceiveMessage((message: { command?: string }) => {
      if (message.command) void vscode.commands.executeCommand(message.command);
    }, undefined, this.context.subscriptions);
  }
}

function welcomeHtml(logo: string, cspSource: string, nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>PoryTools [DEV]</title>
  <style>
    body {
      margin: 0;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
    }
    main {
      width: min(900px, calc(100vw - 64px));
      margin: 14vh auto 0;
      display: grid;
      grid-template-columns: minmax(240px, 1fr) minmax(260px, 360px);
      gap: 72px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 32px;
    }
    .brand img {
      width: 72px;
      height: 72px;
      image-rendering: pixelated;
    }
    h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 500;
      letter-spacing: 0;
    }
    .tagline {
      margin: 4px 0 0;
      color: var(--vscode-descriptionForeground);
      font-size: 18px;
    }
    h2 {
      margin: 0 0 14px;
      font-size: 20px;
      font-weight: 500;
    }
    .actions {
      display: grid;
      gap: 8px;
      margin-bottom: 38px;
    }
    .vscode-button {
      appearance: none;
      border: 0;
      padding: 6px 0;
      color: var(--vscode-textLink-foreground);
      background: transparent;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .vscode-button:hover {
      color: var(--vscode-textLink-activeForeground);
    }
    .card {
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
      padding: 18px;
      border-radius: 6px;
    }
    .card p, .recent p {
      margin: 0 0 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.45;
    }
    .card strong {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }
    @media (max-width: 760px) {
      main {
        margin-top: 48px;
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
  </style>
</head>
<body>
  <main>
    <section>
      <div class="brand">
        <img src="${logo}" alt="">
        <div>
          <h1>PoryTools [DEV]</h1>
          <p class="tagline">Game Boy RGBDS workspace</p>
        </div>
      </div>

      <h2>Start</h2>
      <div class="actions">
        <button class="vscode-button" data-command="workbench.action.files.newUntitledFile">New File...</button>
        <button class="vscode-button" data-command="workbench.action.files.openFile">Open File...</button>
        <button class="vscode-button" data-command="git.clone">Clone Git Repository...</button>
      </div>

      <div class="recent">
        <h2>Editor</h2>
        <p>Syntax highlighting, completion, and symbol navigation are ready for your Game Boy assembly files.</p>
        <div class="actions">
          <button class="vscode-button" data-command="workbench.action.openSettings">Open Settings</button>
        </div>
      </div>
    </section>

    <aside class="card">
      <strong>Next Up</strong>
      <p>Edit and explore RGBDS source with built-in language features.</p>
      <button class="vscode-button" data-command="workbench.action.showCommands">Open command palette...</button>
    </aside>
  </main>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-command]');
      if (button) vscode.postMessage({ command: button.dataset.command });
    });
  </script>
</body>
</html>`;
}
