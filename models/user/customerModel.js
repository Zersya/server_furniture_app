var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  User = require("./userModel");

var CustomerSchema = new Schema({
  name: {
    type: String,
    min: [4, "Too few characters"],
    max: [24, "Too many characters"],
    required: "Where is the name ?"
  },
  phoneNumber: {
    type: String,
    min: [4, "Too few characters"],
    max: [24, "Too many characters"],
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
  }
}, {discriminatorKey: 'user'});

var Customer = User.discriminator("Customer", CustomerSchema);


module.exports = Customer;
