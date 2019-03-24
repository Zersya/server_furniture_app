var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  User = require("./userModel")
  Cart = require('../transaction/cart/cartModel')
  ItemCart = require('../transaction/cart/itemCartModel');

var CustomerSchema = new Schema({
  name: {
    type: String,
    min: [5, "Too few characters"],
    max: [24, "Too many characters"],
    required: "Where is the name ?"
  },
  phoneNumber: {
    type: String,
    min: [8, "Too few numbers"],
    max: [15, "Too many numbers"],
    required: "Where is the phoneNumber ?"
  },
  address_1: {
    type: String,
    min: [4, "Too few characters"],
    max: [24, "Too many characters"],
    required: "Where is the address_1 ?"
  },
  address_2: {
    type: String
  },
  city: {
    type: String,
    required: "Where is the city ?"
  },
  postCode: {
    type: String,
    required: "What is the postCode ?"
  },
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  }
}, {discriminatorKey: 'user'});

var Customer = User.discriminator("Customer", CustomerSchema);


module.exports = Customer;
