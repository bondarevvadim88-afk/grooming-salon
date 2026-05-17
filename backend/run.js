// Redirect all output to stdout
const { spawn } = require('child_process');

const child = spawn('node', ['dist/main.js'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env
});

child.on('exit', (code, signal) => {
  process.stdout.write('\n=== PROCESS EXIT code=' + code + ' signal=' + signal + ' ===\n');
  process.exit(code || 1);
});

child.on('error', (err) => {
  process.stdout.write('=== SPAWN ERROR: ' + err.message + ' ===\n');
  process.exit(1);
});
