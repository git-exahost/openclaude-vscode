# OpenClaude VS Code

**OpenClaude VS Code** é um Terminal inteligente que abre na lateral direita e reutiliza a instância existente.

## Requisitos

- VS Code 1.95+
- openclaude disponível no seu terminal PATH (`npm install -g @gitlawb/openclaude@latest`)

## Repositório Oficial

[https://github.com/Gitlawb/openclaude](https://github.com/Gitlawb/openclaude)

## Instalação

OpenClaude requer Node.js >= 22.0.0 para instalação via npm e execução. Bun é necessário apenas para compilação a partir do código fonte e desenvolvimento local.

```bash
npm install -g @gitlawb/openclaude@latest
```

Se estiver no Arch Linux, instale o OpenClaude pelo pacote AUR mantido pela comunidade:

```bash
paru -S openclaude
```

Se após a instalação for reportado que `ripgrep` não foi encontrado, instale o `ripgrep` no sistema e confirme que `rg --version` funciona no mesmo terminal antes de iniciar o OpenClaude.

### Verificar / solucionar problemas da versão instalada

```bash
openclaude --version
npm view @gitlawb/openclaude dist-tags
npm install -g @gitlawb/openclaude@latest
```
