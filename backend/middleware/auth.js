const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || "TEMPSECRET";

function authenticateJWT(req, res, next) {
  if (req.token) {
    jwt.verify
  }
}

module.exports = authenticateJWT;