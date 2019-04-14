var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
var fs = require("fs");
var handlebars = require("handlebars");

var user = require("../../models/user/userModel");
var tokenUtils = require("../../Utils/tokenUtils");

exports.login = (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    user.findOne({ username: username }, (err, _user) => {
      if (err) res.send(err);

      if (_user) {
        bcrypt.compare(password, _user.password, callBackpasswordCompare(_user));
      } else {
        res.json({
          success: false,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      success: false,
      message: "Please fill username and password field"
    });
  }

  function callBackpasswordCompare(_user){
    return function (err, isMatch) {
      if (err) res.send(err);
      if (isMatch) {
        var token = jwt.sign(
          { user: _user.user, username: username, _id: _user._id },
          process.env.secret,
          { expiresIn: "24h" }
        );
        
        _user.last_login = new Date();
        _user.login_token = token;
        _user.save();
        res.json({
          success: true,
          type: _user.user,
          message: "Authentication success",
          token: token
        });
      } else {
        res.json({
          success: false,
          message: "Incorrect username or password",
          token: token
        });
      }
    }
  }
};

exports.checkLogin = (req, res) => {
  res.json({
    success: true,
    message: "Authentication success",
  });
}

exports.forgetPassword = (req, res) => {
  var email = req.body.email;

  user.findOne({ email: email }, (err, account) => {
    if (!err) {
      if (account) {
        var token = jwt.sign(
          { user: account.user, username: account.username },
          process.env.secret_forgetpass,
          { expiresIn: "2h" }
        );

        user.findOneAndUpdate(
          { _id: account._id },
          { reset_password_token: token },
          (err, doc) => {
            if (!err) {
              readHTMLFile(
                __dirname + "/utils/forgot-password-email.html",
                async function(err, html) {
                  if (!err) {
                    var template = handlebars.compile(html);
                    var replacements = {
                      name: doc.name,
                      url:
                        process.env.website +
                        "api/auth/resetPassword?token=" +
                        token
                    };
                    var htmlToSend = template(replacements);
                    let transporter = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 587,
                      secure: false,
                      auth: {
                        user: process.env.email,
                        pass: process.env.password
                      }
                    });
                    var mailOptions = {
                      from: "Harpa",
                      to: email,
                      subject: "Lupa Password",
                      html: htmlToSend
                    };

                    await transporter.sendMail(mailOptions);
                    res.json({
                      success: true,
                      message: "Forget Password Success, check your email."
                    });
                  } else res.send(err);
                }
              );
            } else res.send(err);
          }
        );
      } else {
        res.json({
          success: false,
          message: "User not found"
        });
      }
    } else res.send(err);
  });
};

var readHTMLFile = async function(path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

exports.checkToken = (req, res) => {
  var token = req.query.token;

  if (token) {
    jwt.verify(token, process.env.secret_forgetpass, (err, decoded) => {
      if (err) res.send(err);
      user.findOne({ reset_password_token: token }, (err, doc) => {
        if (err) res.send(err);
        if (doc) {
          res.json({
            success: true,
            message: "Change Password Page."
          });
        } else {
          res.json({
            success: false,
            message: "Token is not valid."
          });
        }
      });
    });
  } else {
    res.json({
      success: false,
      message: "Token required"
    });
  }
};

exports.resetPasswordToken = (req, res) => {
  var password = req.body.password;
  var token = req.query.token;
  if (token) {
    jwt.verify(token, process.env.secret_forgetpass, (err, decoded) => {
      if (err) res.send(err);
      else {
        user.findOneAndUpdate(
          { reset_password_token: token },
          {
            password: password,
            reset_password_token: ""
          },
          (err, doc) => {
            if (err) res.send(err);
            if (doc) {
              doc.blacklisted_token.push(token);
              doc.save();

              res.json({
                success: true,
                message: "Success Changed Password"
              });
            } else {
              res.json({
                success: false,
                message: "Token is not valid."
              });
            }
          }
        );
      }
    });
  } else {
    res.json({
      success: false,
      message: "Token required"
    });
  }
};

exports.resetPassword = (req, res) => {
  var data = tokenUtils.getDataFromToken(req);
  var username = data.username;
  var old_password = req.body.old_password;
  var password = req.body.password;
  var conf_password = req.body.conf_password;

  if (!old_password || !password || !conf_password) {
    res.json({
      success: false,
      message: "Please fill the field area"
    });
  } else {
    if (!data.token)
      res.json({
        success: false,
        message: "Token cannot be empty."
      });
    if (!username) {
      res.json({
        success: false,
        message: "Token is not valid."
      });
    } else {
      user.findOne({ username: username }, (err, user) => {
        var isMatch = bcrypt.compareSync(old_password, user.password);
        if (isMatch) {
          if (password == conf_password) {
            user.password = password;
            user.save();

            res.json({
              success: true,
              message: "Password is changed!"
            });
          } else {
            res.json({
              success: false,
              message:
                "New password does not match with the confirmation password"
            });
          }
        } else {
          res.json({
            success: false,
            message: "Old password is not match."
          });
        }
      });
    }
  }
};

exports.logout = (req, res) => {
  var data = tokenUtils.getDataFromToken(req);
  if (!data.token)
    res.json({
      success: false,
      message: "Token cannot be empty."
    });
  if (!data.username)
    res.json({
      success: false,
      message: "Token is not valid."
    });

  user.findOne({ username: data.username }, (err, user) => {
    user.blacklisted_token.push(data.token);
    user.save();

    res.json({
      success: true,
      message: "Success logout"
    });
  });
};
