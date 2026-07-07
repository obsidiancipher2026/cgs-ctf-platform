const http = require("http");
const server = http.createServer((req, res) => {
  res.end("Challenge server running");
});
server.listen(3000);
