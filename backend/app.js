const express = require('express');
const auth = require('./middleware/auth');


const app = express();

app.use(auth)

app.get("/", (req, res, next) => {
  res.send("Hello World!");
})

app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong, please try again"
  })
})

module.exports = app;