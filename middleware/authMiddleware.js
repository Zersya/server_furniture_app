let jwt = require("jsonwebtoken");
var user = require("../models/user/userModel");

checkToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  if (token && token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: "Token is not valid"
        });
      } else {
        req.decoded = decoded;

        user.findOne({ username: decoded.username }, (err, user) => {
          var check = checkBlacklistedToken(token, user);
          if (check) {
            return res.json({
              success: false,
              message: "Token is blacklisted"
            });
          } else {
            next();
          }
        });

      }
    });
  } else {
    return res.json({
      success: false,
      message: "Auth token is not supplied"
    });
  }
};

checkTokenAdmin = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  if (token && token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: "Token is not valid"
        });
      } else {
        req.decoded = decoded;

        user.findOne({ username: decoded.username }, (err, user) => {
          var check = checkBlacklistedToken(token, user);
          if (check) {
            return res.json({
              success: false,
              message: "Token is blacklisted"
            });
          } else {
            if (req.decoded.user == "Customer") next();
            else {
              return res.json({
                success: false,
                message: "You are not able to sign"
              });
            }
          }
        });

        if (req.decoded.user == "Admin") next();
        else {
          return res.json({
            success: false,
            message: "You are not able to do this action"
          });
        }
      }
    });
  } else {
    return res.json({
      success: false,
      message: "Auth token is not supplied"
    });
  }
};

checkTokenCustomer = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  if (token && token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, process.env.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: "Token is not valid"
        });
      } else {
        req.decoded = decoded;

        user.findOne({ username: decoded.username }, (err, user) => {
          var check = checkBlacklistedToken(token, user);
          if (check) {
            return res.json({
              success: false,
              message: "Token is blacklisted"
            });
          } else {
            if (req.decoded.user == "Customer") next();
            else {
              return res.json({
                success: false,
                message: "You are not able to sign"
              });
            }
          }
        });
      }
    });
  } else {
    return res.json({
      success: false,
      message: "Auth token is not supplied"
    });
  }
};

function checkBlacklistedToken(token, user) {
  var bool = false;
  user.blacklisted_token.forEach(element => {

    if (element == token) {
      bool = true
    }
  });

  return bool;
}

module.exports = {
  checkToken: checkToken,
  checkTokenAdmin: checkTokenAdmin,
  checkTokenCustomer: checkTokenCustomer
};
