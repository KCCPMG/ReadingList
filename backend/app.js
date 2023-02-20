const express = require('express');
const authenticateJWT = require('./middleware/auth'); 
const authRouter = require('./routes/auth');
const mongoose = require('mongoose');
const config = require('./config');
const dotenv = require('dotenv');


dotenv.config({
  path: './.env'
})


const app = express();

// JWT authentication middleware
app.use(authenticateJWT);

// Routing
app.use("/auth", authRouter);

// General error handler
app.get("/", (req, res, next) => {
  res.send("Hello World!");
})

// Internal Server error handler
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong, please try again"
  })
})

console.log(config.TEST);
const dbstring = config.TEST 
  ? process.env.MONGO_TEST_URI
  : process.env.MONGO_PROD_URI;

// establish mongoose options
const mongooseOptions = {}
mongooseOptions.autoIndex = config.TEST;
if (!config.TEST) {
  mongooseOptions.user = process.env.MONGO_USERNAME;
  mongooseOptions.user = process.env.MONGO_PASSWORD;
}

console.log(dbstring, mongooseOptions);

// mongoose.connect(dbstring, {
//   useNewUrlP
// })

module.exports = app;