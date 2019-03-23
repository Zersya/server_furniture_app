var jwt = require("jsonwebtoken");

var admin = require("../../models/user/adminModel");
var user = require("../../models/user/userModel");

exports.createAdmin = (req, res) => {
  const newAdmin = new admin(req.body);

  newAdmin.save((err, admin) => {
    if (err) res.send(err);

    if (admin) {
      var token = jwt.sign(
        { user: admin.user, username: admin.username },
        process.env.secret,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Sign up success",
        token: token
      });
    }
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.query.userId;

  user.findById(userId, callbackDeleteUser());

  function callbackDeleteUser() {
    return function(err, _user) {
      if (_user) {
        if (_user.username == "admin") {
          res.json({
            success: false,
            message: "Cannot delete super admin"
          });
        } else {
          user.findOneAndDelete({ _id: userId }, (err, __user) => {
            if (err) res.send(err);

            res.json({
              success: true,
              message: "Success deleted " + __user.username
            });
          });
        }
      } else {
        res.json({
          success: false,
          message: "User Id " + userId + " not found"
        });
      }
    };
  }
};

exports.updateUser = (req, res) => {
  const userId = req.query.userId;

  user.findById(userId, (err, _user) => {
    if (err) res.send(err);

    _user.name = req.body.name || _user.name || "empty";
    _user.email = req.body.email || _user.email || "empty";
    _user.phoneNumber = req.body.phoneNumber || _user.phoneNumber || "empty";
    _user.address_1 = req.body.address_1 || _user.address_1 || "empty";
    _user.address_2 = req.body.address_2 || _user.address_2 || "empty";
    _user.city = req.body.city || _user.city || "empty";
    _user.postCode = req.body.postCode || _user.postCode || "empty";

    _user.save((err, __user) => {
      if (err) res.send(err);

      if (__user) {
        res.json({
          success: true,
          message: "Success updated " + __user.name
        });
      } else {
        res.json({
          success: false,
          message: "User Id " + userId + " not found"
        });
      }
    });
  });
};

exports.listUser = (req, res) => {
  if(Object.keys(req.query).length == 0){
    user.find(
      {},
      "user username name last_login email created_at",
      (err, _user) => {
        if(_user){
          res.json(_user);
        }
        else{
          res.json({
            success: true,
            message: "Users is Empty"
          });
        }
      }
    );
  }else{
    user.find(
      {$or: [
        {name: { $regex: ".*" + req.query.searchName + ".*" }},
        {user: { $regex: ".*" + req.query.searchType + ".*" }}
      ]},
      "user username name last_login email created_at",
      (err, _user) => {
        if(_user){
          res.json(_user);
        }else{
          res.json({
            success: true,
            message: "Users is Empty"
          });
        }
      }
    );
  }
};

exports.detailUser = (req, res) => {
  const userId = req.params.userId;

  user.findById(
    userId,
    "username name phoneNumber email address_1 address_2 city postCode last_login transaction",
  ).populate('Transaction')
  .exec((err, __user) => {
    if(__user){
      res.json(__user)
    }else{
      res.json({
        success: true,
        message: "User not found"
      });
    }
  });
};
