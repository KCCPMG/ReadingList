/**
 * A file for jumpstarting playing with the User model in NodeJS
 */

const config = require('../config');
config.TEST = true;


const User = require('./User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function main() {
  try {
    const dbstring = 'mongodb://127.0.0.1:27017';
    const options =  {
      dbName: 'ReadingList'
    }
    await mongoose.connect(dbstring, options);
    console.log("Connected to mongoose");
  } catch(err) {
    console.log(err);
  }
}


main();

module.exports = {User, mongoose, jwt};
// In NodeJS, run 
// const {User, mongoose, jwt} = require('./models/UserPlayground.js');
