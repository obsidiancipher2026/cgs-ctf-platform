const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const clients = new Set();

app.get('/', (req, res) => {
  res.send(`<h1>WebSocket Chat</h1>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username"><button>Login</button>
    </form>
    <div id="chat"></div>
    <script>
      const ws = new WebSocket('ws://' + location.host + '/ws');
      ws.onmessage = function(e) {
        const d = JSON.parse(e.data);
        document.getElementById('chat').innerHTML += '<p>' + d.user + ': ' + d.msg + '</p>';
      };
    </script>`);
});

app.post('/login', (req, res) => {
  const name = req.body.username || 'anon';
  res.cookie('session', 'valid_user');
  res.cookie('username', name);
  res.redirect('/');
});

wss.on('connection', (ws, req) => {
  clients.add(ws);
  console.log('WS client connected (no auth check)');
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.channel === 'admin') {
        ws.send(JSON.stringify({ user: 'system', msg: `Welcome to admin channel. Flag: ${FLAG}` }));
        return;
      }
      clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({ user: msg.user || 'anon', msg: msg.text || '' }));
        }
      });
    } catch (e) {
      ws.send(JSON.stringify({ user: 'system', msg: 'Invalid message format' }));
    }
  });
  ws.on('close', () => clients.delete(ws));
});

setInterval(() => {
  clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify({ user: 'admin_bot', msg: 'FLAG:' + FLAG }));
    }
  });
}, 30000);

server.listen(PORT, () => console.log(`websocket-whisper running on ${PORT}`));
