const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

const items = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];

app.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = q ? items.filter(i => i.includes(q)) : [];
  let list = '';
  if (q) {
    list = results.length
      ? results.map(i => `<li>${i}</li>`).join('')
      : '<li>No results found</li>';
  }
  res.send(`<!DOCTYPE html>
<html>
<head><title>Search</title>
<script defer src="/static/js/main.bundle.js"></script>
</head>
<body>
  <h2>Item Search</h2>
  <form><input type="text" name="q" placeholder="Search..." value="${q}"><button type="submit">Go</button></form>
  <ul>${list}</ul>
</body>
</html>`);
});

app.get('/static/js/main.bundle.js', (req, res) => {
  res.type('application/javascript').send(`/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({
/******/ 		"./src/index.js": (() => {
/******/ 			var data = __webpack_require__("./src/data.js");
/******/ 			function search(q) {
/******/ 				return data.filter(function(i) {
/******/ 					return i.indexOf(q) >= 0;
/******/ 				});
/******/ 			}
/******/ 			window.search = search;
/******/ 			console.log("app initialized");
/******/ 		}),
/******/ 		"./src/data.js": (() => {
/******/ 			// FLAG: ${FLAG}
/******/ 			var _secret = "${FLAG}";
/******/ 			__webpack_exports__ = ["apple","banana","cherry","date","elderberry","fig","grape","honeydew"];
/******/ 		})
/******/ 	});
/******/ 	var __webpack_require__ = {};
/******/ 	__webpack_modules__["./src/index.js"]();
/******/ })();
`);
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
