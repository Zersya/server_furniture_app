let jwt = require('jsonwebtoken');


checkTokenAdmin = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, process.env.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        
        if(req.decoded.user == 'Admin')
            next();
        else{
            return res.json({
                success: false,
                message: 'You are not able to sign'
              });
        }
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

checkTokenCustomer = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token && token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    if (token) {
      jwt.verify(token, process.env.secret, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          
          if(req.decoded.user == 'Customer')
              next();
          else{
              return res.json({
                  success: false,
                  message: 'You are not able to sign'
                });
          }
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }
  };

module.exports = {
    checkTokenAdmin: checkTokenAdmin,
    checkTokenCustomer: checkTokenCustomer

}