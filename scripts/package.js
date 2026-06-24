const { execSync } = require('child_process');
const path = require('path');
const pkg = require('../package.json');

const out = path.resolve(__dirname, '..', 'dist', `openclaude-vscode-${pkg.version}.vsix`);

execSync(`npx vsce package --out "${out}"`, { stdio: 'inherit' });
