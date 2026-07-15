import * as http from 'node:http';
import * as vscode from 'vscode';

export class BackendStatus {
  private readonly item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 40);
  private disposed = false;
  private timer: NodeJS.Timeout | undefined;

  register(): vscode.Disposable {
    this.timer = setInterval(() => void this.update(), 10000);
    void this.update();
    return vscode.Disposable.from(this.item, new vscode.Disposable(() => this.dispose()));
  }

  private async update(): Promise<void> {
    if (this.disposed) return;
    const url = vscode.workspace.getConfiguration('gbasm').get<string>('backendPingUrl', 'http://127.0.0.1:8080/');
    const result = await ping(url);
    this.item.text = result === undefined ? 'Backend offline' : `Backend ${result}ms`;
    this.item.tooltip = `GBASM backend ping: ${url}`;
    this.item.show();
  }

  private dispose(): void {
    this.disposed = true;
    if (this.timer) clearInterval(this.timer);
  }
}

function ping(url: string): Promise<number | undefined> {
  const started = Date.now();
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: 2000 }, (response) => {
      response.resume();
      response.on('end', () => resolve(Date.now() - started));
    });
    request.on('timeout', () => {
      request.destroy();
      resolve(undefined);
    });
    request.on('error', () => resolve(undefined));
  });
}
