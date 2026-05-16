const http = require('http');

console.log('=== TEST SERVER STARTING ===');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log('=== TEST SERVER LISTENING ON PORT ' + port + ' ===');
});
