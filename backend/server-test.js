const http = require('http');
process.stdout.write('=== STARTING ===\n');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  process.stdout.write('=== LISTENING ON ' + port + ' ===\n');
});
process.on('uncaughtException', (err) => {
  process.stdout.write('ERROR: ' + err.message + '\n');
});
