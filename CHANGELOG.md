# Changelog

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
