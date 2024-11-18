// index.js
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
require('./db'); // Connect to the database
const captchaRouter = require('./routes/captchas');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(captchaRouter);


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
