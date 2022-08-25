const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const app = express();
const port = 31337;

const weebhookAPI = 'FILL_IN_HERE_DONT_COMMIT';

app.use('*', cors({}));
app.use(bodyParser.json());

app.post('/leech', (req, res) => {
  const information = req.body;
  request.post(
    weebhookAPI, 
    {
      body: JSON.stringify(information),
      headers: {
        'Content-type': 'application/json',
        'accept': 'application/json'
      },
    }
  );
  res.send('ok');
});

app.listen(port, '127.0.0.1', () => {
  console.log(`App listening on port ${port}`);
});