# Changelog

## [0.10.6] - 2026-06-25
### Corrigido
- Adicionado evento `onDidChangeTerminalState` para detectar quando o estado do terminal muda
- Simplificado `isTerminalActive()` para ser mais direto (verifica apenas `name` e `exitStatus`)

## [0.10.5] - 2026-06-25
### Corrigido
- Melhorado filtro `isTerminalActive()` para verificar `exitStatus !== undefined && exitStatus !== null`
- Adicionado evento `onDidChangeActiveTerminal` para atualizar lista quando o terminal ativo muda
- Melhorada verificação de propriedades para detectar terminais fechados popped out

## [0.10.4] - 2026-06-25
### Corrigido
- Removido `sendText('', true)` da verificação de terminal que estava causando enter automático ao digitar
- A verificação agora usa apenas leitura de propriedades (`creationOptions`, `state`, `processId`) sem efeitos colaterais

## [0.10.3] - 2026-06-25
### Corrigido
- Verificação super robusta para terminais popped out que permaneciam na lista:
  - Acessa múltiplas propriedades (`creationOptions`, `state`, `processId`)
  - Tenta enviar texto vazio para o terminal (chama `sendText('', true)` que lança erro se o terminal estiver fechado)
  - Aumentada frequência de atualização para 1 segundo para sincronização mais rápida

## [0.10.2] - 2026-06-25
### Corrigido
- Filtro mais rigoroso para identificar terminais realmente ativos usando `isTerminalActive()`
- `getOpenClaudeTerminals()` e `getTerminalsInfo()` agora usam diretamente `vscode.window.terminals` e aplicam o filtro
- Removida operação que escondia terminais acidentalmente durante verificação

## [0.10.1] - 2026-06-25
### Corrigido
- Problema onde terminais fechados (popped out) permaneciam na lista da sidebar
- Adicionada atualização periódica da lista de terminais (a cada 2 segundos) para garantir sincronismo
- Melhorado tratamento de erros ao acessar propriedades de terminais que podem já ter sido fechados

## [0.10.0] - 2026-06-25
### Alterado
- Sistema de sessões substituído por gerenciamento multi-terminal
- Sidebar agora lista todos os terminais OpenClaude abertos
- Botão "Novo Terminal" cria um novo terminal com nome único (OpenClaude, OpenClaude (2), ...)
- Clique em um terminal na lista foca ele
- Botão "✕" fecha o terminal
- Barra de status e Ctrl+Esc agora sempre criam um novo terminal

### Removido
- Sistema de sessões (persistência via globalState, captura de saída, seletor de sessão)
- Comando `openclaude-vscode.newSession`
- Configuração `openclaude-vscode.maxSessions`

## [0.9.0] - 2026-06-25
### Adicionado
- Captura automática do histórico do terminal OpenClaude por sessão
- Seletor de sessão na sidebar: clique para ver o conteúdo gravado
- Botão "Retomar Sessão" para abrir o terminal em uma sessão existente
- Conteúdo do terminal é gravado em tempo real via `onDidWriteTerminalData`
- ANSI codes são removidos automaticamente do conteúdo armazenado
- Sessão ativa rastreada para associar saída do terminal à sessão correta

## [0.8.0] - 2026-06-25
### Adicionado
- Gerenciamento de sessões no painel lateral: criar, retomar, renomear e excluir sessões
- Comando "Nova Sessão OpenClaude" (openclaude-vscode.newSession)
- Configuração `openclaude-vscode.maxSessions` para limitar o histórico de sessões
- Sessões persistem via `context.globalState` e aparecem na sidebar do activity bar

## [0.7.0] - 2026-06-25
### Adicionado
- Ícone do OpenClaude na barra de atividades (activity bar) com item clicável "Abrir OpenClaude"
### Alterado
- `displayName` traduzido para português: "OpenClaude para VS Code"

## [0.6.2] - 2026-06-24
### Corrigido
- Comando `openclaude` não era enviado ao terminal ao clicar no botão — apenas o terminal era aberto sem executar nada.

## [0.6.1] - 2026-06-24
### Alterado
- Ícone da barra de status alterado de `$(cloud)` para `$(hubot)` (robô).

## [0.6.0] - 2026-06-24
### Adicionado
- ESLint configurado para padronização do código.
- CI/CD com GitHub Actions (lint + empacotamento automático).
- Script de empacotamento cross-platform (scripts/package.js).

### Alterado
- Refatoração completa do extension.js: código mais limpo e modular.
- Constantes STRINGS centralizadas para facilitar manutenção.
- Detecção do OpenClaude CLI otimizada (usa `where`/`which` por plataforma).
- Feedback visual com barra de progresso ao verificar instalação.
- Tooltip dinâmico na barra de status (instalado vs não instalado).
- Barra de status agora exibe apenas "Abrir OpenClaude" sem ícone genérico.
- .vscodeignore revisado para incluir LICENSE e CHANGELOG no pacote.

### Corrigido
- Debounce no clique do botão da barra de status (evita múltiplos terminais).
- Tratamento de erros no exec com try/catch.

## [0.5.1] - 2026-06-24

### Changed
- README.md traduzido completamente para pt-BR

## [0.5.0] - 2026-06-24

### Added
- README.md com detalhes, requisitos e instruções de instalação
- Campo `repository` no package.json

### Changed
- Descrição simplificada no package.json

## [0.4.0] - 2026-06-24

### Changed
- Ícone da extensão ajustado para formato quadrado (512x512)

## [0.3.0] - 2026-06-24

### Added
- Botão na barra de status
- Atalho de teclado Ctrl+Esc
- Verificação de instalação do OpenClaude com opção de instalação automática

### Changed
- Terminal abre no painel lateral direito (ViewColumn.Beside)
- Reuso de instância existente do terminal

## [0.2.0] - 2026-06-24

### Added
- Ícone personalizado da extensão

## [0.1.0] - 2026-06-24

### Added
- Comando "Abrir OpenClaude" no editor/title
- Funcionalidade básica de abertura do terminal

## [0.0.3] - 2026-06-24

### Added
- Primeira versão funcional da extensão
