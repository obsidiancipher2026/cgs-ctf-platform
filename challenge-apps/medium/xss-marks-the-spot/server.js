const express = require('express');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const comments = [];

app.get('/', (req, res) => {
  let commentList = '';
  for (const c of comments) {
    commentList += '<div class="comment">' + c + '</div>';
  }
  const html = ejs.render(`
    <h1>Comment Board</h1>
    <form method="POST" action="/comment">
      <textarea name="comment" placeholder="Leave a comment"></textarea>
      <button type="submit">Submit</button>
    </form>
    <hr>
    <h2>Comments</h2>
    <div id="comments"><%= commentList %></div>
  `, { commentList });
  res.send(html);
});

app.post('/comment', (req, res) => {
  const comment = req.body.comment || '';
  comments.push(comment);
  if (comment.includes('<script>')) {
    console.log('XSS detected! Flag: ' + FLAG);
  }
  res.redirect('/');
});

app.get('/admin/visit', (req, res) => {
  req.cookies.admin_session = 'secret_admin_token_123';
  let commentList = '';
  for (const c of comments) {
    commentList += '<div class="comment">' + c + '</div>';
  }
  const adminComment = '<script>document.cookie</script>';
  let flagRevealed = false;
  if (comments.some(c => c.includes('<script>'))) {
    flagRevealed = true;
  }
  const html = ejs.render(`
    <h1>Admin View</h1>
    <p>Admin session: <%= adminSession %></p>
    <h2>Comments</h2>
    <div id="comments"><%= commentList %></div>
    <% if (flagRevealed) { %>
      <div style="color:red;font-weight:bold">Admin cookie leaked! Flag: <%= FLAG %></div>
    <% } %>
  `, { commentList, adminSession: req.cookies.admin_session, flagRevealed, FLAG });
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Challenge 13 running on port ${PORT}`);
});
