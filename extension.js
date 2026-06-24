const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TERMINAL_NAME = 'OpenClaude';

// ---------------------------------------------------------------------------
// Constantes (mensagens centralizadas para facilitar manutenção)
// ---------------------------------------------------------------------------
const STRINGS = {
  notInstalled:
    'OpenClaude não está instalado. Instale com: npm install -g @gitlawb/openclaude',
  installNow: 'Instalar Agora',
  installing: 'Instalando OpenClaude...',
  checking: 'Verificando instalação do OpenClaude...',
  errorGeneric: 'Erro ao verificar instalação do OpenClaude.',
  tooltipInstalled: 'Abrir OpenClaude (instalado)',
  tooltipNotInstalled: 'OpenClaude não instalado — clique para instalar',
  statusBarIcon: '$(hubot)',
};

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

/**
 * Retorna o comando para localizar o binário no PATH de acordo com a
 * plataforma: `where` no Windows, `which` nos demais sistemas.
 */
function whichCmd() {
  return process.platform === 'win32' ? 'where' : 'which';
}

/**
 * Verifica se o openclaude está instalado e acessível no PATH.
 * Retorna true/false sem lançar exceções.
 */
async function checkOpenClaudeInstalled() {
  try {
    const { stdout } = await execAsync(`${whichCmd()} openclaude`);
    return stdout.trim().length > 0;
  } catch (_err) {
    return false;
  }
}

/**
 * Cria / retorna o terminal compartilhado do OpenClaude.
 */
function getOrCreateTerminal(context) {
  let terminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
  if (!terminal) {
    terminal = vscode.window.createTerminal({
      name: TERMINAL_NAME,
      iconPath: {
        light: vscode.Uri.file(context.asAbsolutePath('images/button-light.svg')),
        dark: vscode.Uri.file(context.asAbsolutePath('images/button-dark.svg')),
      },
      location: { viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
    });
  }
  return terminal;
}

/**
 * Abre o terminal e executa o comando de instalação via npm global.
 */
function installOpenClaude(terminal) {
  terminal.show();
  terminal.sendText('npm install -g @gitlawb/openclaude');
}

// ---------------------------------------------------------------------------
// Barra de status
// ---------------------------------------------------------------------------

/**
 * Cria o item da barra de status e retorna o objeto para atualizações
 * futuras.
 */
function createStatusBarItem() {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = STRINGS.statusBarIcon;
  statusBar.command = 'openclaude-vscode.open';
  statusBar.tooltip = STRINGS.tooltipChecking;
  statusBar.show();
  return statusBar;
}

/**
 * Atualiza tooltip e cor da barra de status conforme o estado da
 * instalação.
 */
function updateStatusBar(statusBar, installed) {
  if (installed) {
    statusBar.tooltip = STRINGS.tooltipInstalled;
    statusBar.color = '#FF8C00';
  } else {
    statusBar.tooltip = STRINGS.tooltipNotInstalled;
    statusBar.color = '#FF4444';
  }
}

// ---------------------------------------------------------------------------
// Ativação / Desativação
// ---------------------------------------------------------------------------

function activate(context) {
  // --- Barra de status ---------------------------------------------------
  const statusBar = createStatusBarItem();
  context.subscriptions.push(statusBar);

  // Verifica instalação de forma assíncrona e atualiza barra
  checkOpenClaudeInstalled().then(installed => {
    updateStatusBar(statusBar, installed);
  });

  // --- Comando principal -------------------------------------------------
  let isExecuting = false; // debounce simples

  const openCmd = vscode.commands.registerCommand(
    'openclaude-vscode.open',
    async () => {
      if (isExecuting) { return; }
      isExecuting = true;

      try {
        // Feedback visual durante a verificação
        const installed = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: STRINGS.checking },
          () => checkOpenClaudeInstalled()
        );

        updateStatusBar(statusBar, installed);

        if (!installed) {
          const selection = await vscode.window.showErrorMessage(
            STRINGS.notInstalled,
            STRINGS.installNow
          );
          if (selection === STRINGS.installNow) {
            const terminal = getOrCreateTerminal(context);
            installOpenClaude(terminal);
          }
          return;
        }

        // Abre o terminal e executa o comando
        const terminal = getOrCreateTerminal(context);
        terminal.show();
        terminal.sendText('openclaude');
      } catch (err) {
        vscode.window.showErrorMessage(
          `${STRINGS.errorGeneric} ${err.message || ''}`
        );
      } finally {
        isExecuting = false;
      }
    }
  );

  context.subscriptions.push(openCmd);
}

function deactivate() {
  // Sem clean-up específico necessário
}

module.exports = { activate, deactivate };
