const fs = require('fs');
const { execSync } = require('child_process');

// Force unbuffered output
process.stdout.write('=== DIAGNOSE START ===\n');

try {
  process.stdout.write('Node: ' + process.version + '\n');
  process.stdout.write('Cwd: ' + process.cwd() + '\n');
  process.stdout.write('PORT: ' + process.env.PORT + '\n');
  process.stdout.write('DATABASE_URL exists: ' + !!process.env.DATABASE_URL + '\n');
  
  process.stdout.write('Checking dist/main.js...\n');
  const exists = fs.existsSync('./dist/main.js');
  process.stdout.write('dist/main.js exists: ' + exists + '\n');
  
  if (exists) {
    process.stdout.write('Loading main.js...\n');
    require('./dist/main.js');
  }
} catch(e) {
  process.stdout.write('ERROR: ' + e.message + '\n');
  process.stdout.write('STACK: ' + e.stack + '\n');
  process.exit(1);
}
