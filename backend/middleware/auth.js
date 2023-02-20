const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || "TEMPSECRET";

function authenticateJWT(req, res, next) {
  try {
    if (req.token) {
      req.user_id = jwt.verify(req.headers.token, SECRET_KEY)
    }
    return next();
  } catch(err) {
    console.log(err);
    return next();
  }
}

module.exports = authenticateJWT;