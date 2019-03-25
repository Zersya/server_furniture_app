var mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  Schema = mongoose.Schema
  cart = require('../transaction/cart/cartModel')
  itemCart = require('../transaction/cart/itemCartModel')
  trans = require('../transaction/transactionModel')
  cartTrans = require('../transaction/cartTransactionModel');

var UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      min: [4, "Too few characters"],
      max: [8, "Too many characters"],
      required: "Where is the username ?"
    },
    password: {
      type: String,
      required: "Where is the password ?"
    },
    email: {
      type: String,
      required: "Where is the email ?"
    },
    created_at: {
      type: Date,
      default: new Date()
    },
    login_token: {
      type: String
    },
    reset_password_token: {
      type: String
    },
    blacklisted_token: {
      type: Array
    },
    last_login: {
      type: Date
    }
  },
  { discriminatorKey: "user" }
);

UserSchema.pre("save", function(next) {
  var user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return err();

      user.password = hash;
      next();
    });
  });
});

UserSchema.pre("findOneAndUpdate", function(next) {
  var password = this._update.password;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    this.getUpdate().password = hash;
    next();
  }
  next();
});


UserSchema.pre("findOneAndDelete", function(next) {
  cart.findOneAndDelete({created_by: this._conditions._id}).exec((err, _cart) => {
    _cart.itemCarts.forEach(element => {
      itemCart.deleteOne({_id: element}).exec()
    });
  })

  trans.findOneAndDelete({created_by: this._conditions._id}).exec((err, _trans) => {
    _trans.cart.forEach(element => {
      cartTrans.deleteOne({_id: element}).exec()
    });
  })

  next()
})

module.exports = mongoose.model("User", UserSchema);
