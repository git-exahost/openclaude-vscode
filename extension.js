const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TERMINAL_NAME = 'OpenClaude';

/**
 * OpenClaude VS Code — EXABIT
 *
 * Requisitos:
 *   - VS Code 1.95+
 *   - openclaude disponível no PATH (npm install -g @gitlawb/openclaude)
 */

async function checkOpenClaudeInstalled() {
  try {
    await execAsync('openclaude --version');
    return true;
  } catch (error) {
    return false;
  }
}

function activate(context) {
  const openCmd = vscode.commands.registerCommand('openclaude-vscode.open', async () => {
    const isInstalled = await checkOpenClaudeInstalled();
    if (!isInstalled) {
      vscode.window.showErrorMessage(
        'OpenClaude não está instalado. Instale com: npm install -g @gitlawb/openclaude',
        'Instalar Agora'
      ).then(async (selection) => {
        if (selection === 'Instalar Agora') {
          const terminal = vscode.window.createTerminal({
            name: TERMINAL_NAME,
            iconPath: {
              light: vscode.Uri.file(context.asAbsolutePath('images/button-light.svg')),
              dark: vscode.Uri.file(context.asAbsolutePath('images/button-dark.svg')),
            },
            location: {
              viewColumn: vscode.ViewColumn.Beside,
              preserveFocus: false,
            },
          });
          terminal.show();
          terminal.sendText('npm install -g @gitlawb/openclaude');
        }
      });
      return;
    }

    const existing = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
    if (existing) {
      existing.show();
      return;
    }

    const terminal = vscode.window.createTerminal({
      name: TERMINAL_NAME,
      iconPath: {
        light: vscode.Uri.file(context.asAbsolutePath('images/button-light.svg')),
        dark: vscode.Uri.file(context.asAbsolutePath('images/button-dark.svg')),
      },
      location: {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: false,
      },
    });

    terminal.show();
    terminal.sendText('openclaude');
  });

  const statusBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBtn.command = 'openclaude-vscode.open';
  statusBtn.text = '$(cloud)';
  statusBtn.color = '#FF8C00';
  statusBtn.tooltip = 'Abrir OpenClaude na lateral direita';
  statusBtn.show();

  context.subscriptions.push(openCmd, statusBtn);
}

function deactivate() { }

module.exports = { activate, deactivate };
