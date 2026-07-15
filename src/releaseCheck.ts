import * as vscode from 'vscode';
import { isNewerVersion } from './version';

const apiUrl = 'https://api.github.com/repos/Myth7x/porytools-rgbds-intellisense-vscode-extension/releases/latest';
const releasesUrl = 'https://github.com/Myth7x/porytools-rgbds-intellisense-vscode-extension/releases/latest';
const checkInterval = 24 * 60 * 60 * 1000;
const tickInterval = 60 * 60 * 1000;
const lastCheckKey = 'releaseCheck.lastCheck';
const lastNotifiedKey = 'releaseCheck.lastNotified';

export function registerReleaseCheck(context: vscode.ExtensionContext): vscode.Disposable {
  void checkForRelease(context);
  const timer = setInterval(() => void checkForRelease(context), tickInterval);
  return new vscode.Disposable(() => clearInterval(timer));
}

async function checkForRelease(context: vscode.ExtensionContext): Promise<void> {
  try {
    const now = Date.now();
    if (now - context.globalState.get<number>(lastCheckKey, 0) < checkInterval) return;
    await context.globalState.update(lastCheckKey, now);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'rgbds-intellisense',
        'X-GitHub-Api-Version': '2026-03-10'
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return;

    const release = await response.json() as { tag_name?: unknown };
    const version = release.tag_name;
    const current = context.extension.packageJSON.version;
    if (typeof version !== 'string' || typeof current !== 'string' || !isNewerVersion(version, current)) return;
    if (context.globalState.get<string>(lastNotifiedKey) === version) return;

    await context.globalState.update(lastNotifiedKey, version);
    const action = await vscode.window.showInformationMessage(`RGBDS IntelliSense ${version} is available.`, 'View Release');
    if (action) await vscode.env.openExternal(vscode.Uri.parse(releasesUrl));
  } catch {
    // A background update check must never interrupt editor startup.
  }
}
