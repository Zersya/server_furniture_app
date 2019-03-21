let jwt = require("jsonwebtoken");


exports.getDataFromToken = (req) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
    if (token && token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    var username = "";
    jwt.verify(token, process.env.secret, (err, decode) => {
      username = decode.username;
    });
    return {
      token: token,
      username: username
    };
  }

  
exports.checkBlacklistedToken = (token, user) => {
  var bool = false;
  user.blacklisted_token.forEach(element => {

    if (element == token) {
      bool = true
    }
  });

  return bool;
}