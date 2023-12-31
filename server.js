const express = require('express');

const port = process.env.PORT || 5000;

const app = express();

const router = require('./routes');

app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
