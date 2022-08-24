const express = require('express');
const app = express();
const port = 1337;

app.post('/leech', (req, res) => {
  // res.send('Hello World!');
  const information = req.body;
  console.log('information', information);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});