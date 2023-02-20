// import config first to make whatever changes app is dependent on
const config = require('./config');

// override defaults
if (process.argv.includes('TEST')) config.TEST = true;


const app = require('./app');

app.listen(process.env.PORT || 5000, function() {
  console.log(`Listening on port ${process.env.PORT || 5000}`);
})