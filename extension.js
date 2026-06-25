const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const TERMINAL_NAME = 'OpenClaude';


// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function whichCmd() {
  return process.platform === 'win32' ? 'where' : 'which';
}

async function checkOpenClaudeInstalled() {
  try {
    const { stdout } = await execAsync(`${whichCmd()} openclaude`);
    return stdout.trim().length > 0;
  } catch (_err) {
    return false;
  }
}

function getUniqueTerminalName() {
  const existing = vscode.window.terminals.filter(
    t => t.name === TERMINAL_NAME || /^OpenClaude \(\d+\)$/.test(t.name)
  );
  if (existing.length === 0) { return TERMINAL_NAME; }
  const nums = existing.map(t => {
    const m = t.name.match(/\((\d+)\)$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  return `${TERMINAL_NAME} (${Math.max(...nums) + 1})`;
}

function createNewTerminal(context) {
  return vscode.window.createTerminal({
    name: getUniqueTerminalName(),
    iconPath: {
      light: vscode.Uri.file(context.asAbsolutePath('images/button-light.svg')),
      dark: vscode.Uri.file(context.asAbsolutePath('images/button-dark.svg')),
    },
    location: { viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
  });
}

function installOpenClaude(terminal) {
  terminal.show();
  terminal.sendText('npm install -g @gitlawb/openclaude');
}

function isOpenClaudeTerminalName(name) {
  return name === TERMINAL_NAME || /^OpenClaude \(\d+\)$/.test(name);
}

function isTerminalTab(tab) {
  try {
    if (typeof vscode.TabInputTerminal === 'function' && tab.input instanceof vscode.TabInputTerminal) {
      return true;
    }
    return tab.input && tab.input.constructor && tab.input.constructor.name === 'TabInputTerminal';
  } catch (_err) {
    return false;
  }
}

function getVisibleTerminalTabLabels() {
  try {
    return vscode.window.tabGroups.all
      .flatMap(group => group.tabs)
      .filter(isTerminalTab)
      .map(tab => tab.label);
  } catch (_err) {
    return [];
  }
}

function isTerminalActive(terminal) {
  if (!terminal) { return false; }
  try {
    // Verifica se o terminal tem nome e não tem exitStatus
    if (!terminal.name) { return false; }

    // Se exitStatus for definido, o terminal está fechado
    if (terminal.exitStatus !== undefined) { return false; }

    return true;
  } catch (_err) {
    return false;
  }
}

function getTerminalsInfo() {
  const visibleTerminalTabLabels = getVisibleTerminalTabLabels();
  const visibleTerminalNames = new Set(visibleTerminalTabLabels);
  const filtered = vscode.window.terminals
    .filter(t => {
      try {
        return isOpenClaudeTerminalName(t.name)
          && isTerminalActive(t)
          && visibleTerminalNames.has(t.name);
      } catch (_) {
        return false;
      }
    })
    .map(t => ({ name: t.name }));

  return filtered;
}

function getOpenClaudeTerminals() {
  const visibleTerminalNames = new Set(getVisibleTerminalTabLabels());
  return vscode.window.terminals
    .filter(t => {
      try {
        return isOpenClaudeTerminalName(t.name)
          && isTerminalActive(t)
          && visibleTerminalNames.has(t.name);
      } catch (_) {
        return false;
      }
    });
}

function focusTerminal(name) {
  const t = vscode.window.terminals.find(t => t.name === name);
  if (t) {
    try {
      t.show();
      return true;
    } catch (_) {
      return false;
    }
  }
  return false;
}

function closeTerminal(name) {
  const t = vscode.window.terminals.find(t => t.name === name);
  if (t) {
    try {
      t.dispose();
    } catch (_) {
      // Terminal já foi fechado
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Constantes
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
// Barra de status
// ---------------------------------------------------------------------------

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
// View Provider (barra lateral - multi-terminal)
// ---------------------------------------------------------------------------

const SIDEBAR_VIEW_ID = 'openclaude-vscode.sidebar';

class OpenClaudeSidebarProvider {
  constructor(context) {
    this._context = context;
    this._view = null;
    this._iconDark = null;
    this._iconLight = null;
    this._refreshInterval = null;
    this._refreshTimeout = null;
  }

  resolveWebviewView(webviewView, _context, _token) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._context.extensionUri, 'images'),
      ],
    };

    this._iconDark = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'images', 'button-dark.svg')
    );
    this._iconLight = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'images', 'button-light.svg')
    );

    webviewView.webview.html = this._getHtml();
    this._setupMessaging(webviewView);
    this._sendTerminals();

    // Atualiza a lista periodicamente para garantir sincronismo
    this._refreshInterval = setInterval(() => {
      this._sendTerminals();
    }, 3000);

    // Limpa o intervalo quando a view for fechada
    webviewView.onDidDispose(() => {
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
      if (this._refreshTimeout) {
        clearTimeout(this._refreshTimeout);
        this._refreshTimeout = null;
      }
    });
  }

  // Agrupa chamadas em sequência para evitar excesso de atualizações
  _debouncedRefresh() {
    if (this._refreshTimeout) {
      clearTimeout(this._refreshTimeout);
    }
    this._refreshTimeout = setTimeout(() => {
      this._refreshTimeout = null;
      this._sendTerminals();
    }, 300);
  }

  _setupMessaging(webviewView) {
    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.type) {
        case 'install': {
          const t = createNewTerminal(this._context);
          installOpenClaude(t);
          break;
        }
        case 'newTerminal':
          this._handleNewTerminal();
          break;
        case 'focusTerminal':
          if (!focusTerminal(message.name)) { this._sendTerminals(); }
          break;
        case 'closeTerminal':
          closeTerminal(message.name);
          this._sendTerminals();
          break;
        case 'closeAllTerminals':
          getOpenClaudeTerminals().forEach(t => {
            try { t.dispose(); } catch (_) { /* já fechado */ }
          });
          this._sendTerminals();
          break;
        case 'refresh':
          this._sendTerminals();
          break;
      }
    });
  }

  _post(type, data) {
    try {
      if (this._view) { this._view.webview.postMessage({ type, ...data }); }
    } catch (_) { /* webview disposed */ }
  }

  _sendTerminals() {
    const terminals = getTerminalsInfo();

    this._post('terminals', {
      terminals,
      iconDark: this._iconDark ? this._iconDark.toString() : '',
      iconLight: this._iconLight ? this._iconLight.toString() : '',
    });
  }

  async _handleNewTerminal() {
    const installed = await checkOpenClaudeInstalled();

    if (!installed) {
      const selection = await vscode.window.showErrorMessage(
        STRINGS.notInstalled,
        STRINGS.installNow
      );
      if (selection === STRINGS.installNow) {
        const t = createNewTerminal(this._context);
        installOpenClaude(t);
      }
      return;
    }

    const terminal = createNewTerminal(this._context);
    terminal.show();
    terminal.sendText('openclaude');
    this._sendTerminals();
  }

  _getHtml() {
    const headerIcon = this._iconDark ? this._iconDark.toString() : '';
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--vscode-font-family);font-size:var(--vscode-font-size);color:var(--vscode-sideBar-foreground,#ccc);background:var(--vscode-sideBar-background,#1e1e1e);padding:8px}
.header{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.header svg{width:22px;height:22px;flex-shrink:0}
.header h2{font-size:14px;font-weight:600;margin:0;color:var(--vscode-sideBar-foreground,#ccc)}
.btn-primary{width:100%;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;padding:8px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-primary:hover{background:var(--vscode-button-hoverBackground)}
.btn-primary svg{width:16px;height:16px;fill:currentColor}
.btn-row{display:flex;gap:6px;margin-bottom:12px}
.btn-row .btn-primary{flex:1;margin-bottom:0}
.btn-danger{flex:1;background:var(--vscode-button-secondaryBackground,#3c3c3c);color:var(--vscode-button-secondaryForeground,#ccc);border:none;padding:8px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-danger:hover{background:var(--vscode-button-secondaryHoverBackground)}
.btn-danger svg{width:14px;height:14px;fill:currentColor}
.terminal-item .icon img{width:100%;height:100%;object-fit:contain}
.terminal-list{display:flex;flex-direction:column;gap:2px}
.terminal-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:4px;cursor:pointer;color:var(--vscode-sideBar-foreground,#ccc);transition:background .15s}
.terminal-item:hover{background:var(--vscode-list-hoverBackground)}
.terminal-item .icon{width:20px;height:20px;flex-shrink:0}
.terminal-item .icon svg{width:20px;height:20px}
.terminal-item .info{flex:1;min-width:0}
.terminal-item .name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--vscode-sideBar-foreground,#ccc)}
.terminal-item .actions{display:flex;gap:4px}
.terminal-item .actions button{background:none;border:none;cursor:pointer;padding:3px 6px;border-radius:3px;color:var(--vscode-descriptionForeground,#888);font-size:12px;line-height:1}
.terminal-item .actions button:hover{background:var(--vscode-list-hoverBackground);color:var(--vscode-sideBar-foreground,#ccc)}
.empty-state{text-align:center;padding:24px 16px;color:var(--vscode-descriptionForeground,#888);font-size:13px;line-height:1.6}
.empty-state svg{width:40px;height:40px;margin-bottom:8px;opacity:.4}
.hidden{display:none}
</style>
</head>
<body>
<div class="header">
<img src="${headerIcon}" width="22" height="22" style="border-radius:3px" alt="">
<h2>OpenClaude</h2>
</div>
<div class="btn-row">
<button class="btn-primary" id="newTerminalBtn" title="Abrir novo terminal OpenClaude">
<svg viewBox="0 0 16 16"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/></svg>
Novo
</button>
<button class="btn-danger" id="closeAllBtn" title="Fechar todos os terminais">
<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
Fechar
</button>
</div>
<div id="terminalList" class="terminal-list"></div>
<div id="emptyState" class="empty-state">
<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="3" fill="currentColor"/><path d="M8 10.5l3 3-3 3" stroke="var(--vscode-sideBar-background)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="13" y="15" width="6" height="2" rx="1" fill="var(--vscode-sideBar-background)"/></svg>
<p>Nenhum terminal aberto.<br>Crie um novo terminal para começar.</p>
</div>
<script>
(function(){
var api=acquireVsCodeApi();
var list=document.getElementById('terminalList');
var empty=document.getElementById('emptyState');
var newBtn=document.getElementById('newTerminalBtn');
var iconDark='';
var iconLight='';

function render(terminals){
list.innerHTML='';
if(!terminals||terminals.length===0){
empty.classList.remove('hidden');
list.classList.add('hidden');
return;
}
empty.classList.add('hidden');
list.classList.remove('hidden');
terminals.forEach(function(t){
var item=document.createElement('div');
item.className='terminal-item';
var isDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
var iconSrc=isDark?iconDark:iconLight;
item.innerHTML=
'<div class="icon"><img src="'+iconSrc+'" width="20" height="20" alt=""></div>'+
'<div class="info"><div class="name">'+esc(t.name)+'</div></div>'+
'<div class="actions"><button class="close" title="Fechar terminal">\u2715</button></div>';
item.addEventListener('click',function(e){
if(e.target.closest('.close'))return;
api.postMessage({type:'focusTerminal',name:t.name});
});
item.querySelector('.close').addEventListener('click',function(e){
e.stopPropagation();
api.postMessage({type:'closeTerminal',name:t.name});
render(terminals.filter(function(x){return x.name!==t.name}));
});
list.appendChild(item);
});
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

newBtn.addEventListener('click',function(){
api.postMessage({type:'newTerminal'});
});

document.getElementById('closeAllBtn').addEventListener('click',function(){
api.postMessage({type:'closeAllTerminals'});
});

window.addEventListener('message',function(e){
var m=e.data;
if(m.type==='terminals'){
if(m.iconDark)iconDark=m.iconDark;
if(m.iconLight)iconLight=m.iconLight;
render(m.terminals);
}
});

api.postMessage({type:'ready'});
})();
</script>
</body>
</html>`;
  }
}

// ---------------------------------------------------------------------------
// Ativação / Desativação
// ---------------------------------------------------------------------------

function activate(context) {
  // --- Barra de status ---------------------------------------------------
  const statusBar = createStatusBarItem();
  context.subscriptions.push(statusBar);

  checkOpenClaudeInstalled().then(installed => {
    updateStatusBar(statusBar, installed);
  });

  // --- Barra lateral (activity bar) --------------------------------------
  const sidebarProvider = new OpenClaudeSidebarProvider(context);
  const sidebarView = vscode.window.registerWebviewViewProvider(
    SIDEBAR_VIEW_ID,
    sidebarProvider
  );
  context.subscriptions.push(sidebarView);

  // --- Auto-refresh da lista de terminais --------------------------------
  context.subscriptions.push(
    vscode.window.onDidOpenTerminal(() => {
      sidebarProvider._debouncedRefresh();
    })
  );
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal(() => {
      sidebarProvider._debouncedRefresh();
    })
  );

  // --- Comando principal -------------------------------------------------
  let isExecuting = false;

  const openCmd = vscode.commands.registerCommand(
    'openclaude-vscode.open',
    async () => {
      if (isExecuting) { return; }
      isExecuting = true;

      try {
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
            const terminal = createNewTerminal(context);
            installOpenClaude(terminal);
          }
          return;
        }

        const terminal = createNewTerminal(context);
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
}

module.exports = { activate, deactivate };
