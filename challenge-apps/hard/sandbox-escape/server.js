const express = require('express');
const vm = require('vm');
const app = express();

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h1>Sandbox Escape</h1>
    <p>POST /run with JSON <code>{"code": "..."}</code></p>
    <form id="f"><textarea name="code" rows="6" cols="60">1+1</textarea><button>Run</button></form>
    <pre id="out"></pre>
    <script>
      document.getElementById('f').onsubmit = async function(e) {
        e.preventDefault();
        const code = document.querySelector('textarea').value;
        const r = await fetch('/run', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code}) });
        const d = await r.json();
        document.getElementById('out').textContent = d.result || d.error;
      };
    </script>`);
});

app.post('/run', (req, res) => {
  const code = req.body.code || '';
  try {
    const sandbox = {};
    const context = vm.createContext(sandbox);
    const script = new vm.Script(code);
    const result = script.runInContext(context, { timeout: 1000 });
    const output = String(result);
    if (output.includes(FLAG)) {
      return res.json({ result: output });
    }
    res.json({ result: output });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`sandbox-escape running on ${PORT}`));
