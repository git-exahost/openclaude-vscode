# Instruções para Agentes de IA

Este arquivo contém as diretrizes que devem ser seguidas por qualquer agente de IA (como opencode, Copilot, etc.) ao trabalhar neste projeto.

## Boas Práticas

- Siga as convenções existentes do projeto (estilo de código, estrutura, naming)
- Mantenha o código limpo, legível e sem comentários desnecessários
- Não adicione arquivos de documentação ou README a menos que explicitamente solicitado
- **Sempre execute `npm run lint` antes de commitar** e corrija qualquer erro de lint
- **Nunca remova ou ignore arquivos de configuração** (`.eslintrc.json`, `.github/workflows/`, etc.)

## Versionamento

- **Sempre atualize a versão** no `package.json` ao fazer qualquer modificação no projeto
- Use versionamento semântico (major.minor.patch):
  - patch (0.0.x): correções de bugs, ajustes pequenos
  - minor (0.x.0): novas funcionalidades, mudanças não-quebrantes
  - major (x.0.0): mudanças incompatíveis ou grandes reformulações
- Atualize o `CHANGELOG.md` documentando cada versão com as alterações

## Idioma

- **Todos os textos devem ser escritos em português brasileiro (pt-BR)**
- README.md, descrições, mensagens para o usuário, tooltips e qualquer conteúdo textual
- Código fonte (nomes de variáveis, funções, comentários) pode permanecer em inglês conforme convenção técnica
- A única exceção é o `displayName` no package.json, que pode manter o nome original do produto

## Commits

- Use commits semânticos (ex: `feat:`, `fix:`, `chore:`, `docs:`)
- Faça commits atômicos (uma mudança por commit)
- Mensagens em português ou inglês são aceitáveis, desde que consistentes

## CI/CD

- O projeto usa GitHub Actions para CI (`.github/workflows/ci.yml`)
- O CI executa lint e empacotamento em pushes e PRs para a branch main
- Nunca faça merge sem o CI estar verde
