var jwt = require("jsonwebtoken");

var customer = require("../../models/user/customerModel");
var cart = require('../../models/transaction/cart/cartModel')
var item = require('../../models/itemModel')

exports.createCustomer = (req, res) => {
  const newCustomer = new customer(req.body);
  var newCart = new cart({created_by: newCustomer._id})
  newCustomer.cart = newCart._id;

  newCustomer.save((err, _customer) => {
    if (err) res.send(err);
    if (_customer) {
      var token = jwt.sign(
        { user: _customer.user, username: _customer.username, _id: _customer._id },
        process.env.secret,
        { expiresIn: "24h" }
      );
      newCart.save((err) => {if(err)res.send(err)})
      res.json({
        success: true,
        message: "Sign up success",
        token: token
      });
    }
  });
};


exports.listItem = (req, res) => {
  if (Object.keys(req.query).length == 0) {
    item
      .find({})
      .populate("created_by", "name")
      .populate("images", "nameImage item urlImage")
      .exec(callBacklistItem());
  } else {
    item
      .find({$or: [
        {name: { $regex: ".*" + req.query.searchName + ".*" }},
        {category: { $regex: ".*" + req.query.searchCategory + ".*" }}
      ]})
      .populate("created_by", "name")
      .populate("images", "nameImage item urlImage")
      .exec(callBacklistItem());
  }

  function callBacklistItem() {
    return function(err, item) {
      if (item) {
        res.json(item.reverse());
      } else {
        res.json({
          success: true,
          message: "There is no items."
        });
      }
    };
  }
};
