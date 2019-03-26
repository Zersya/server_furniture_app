var transaction = require("../../../models/transaction/transactionModel");
var cart = require("../../../models/transaction/cart/cartModel.js");
var cartTrans = require("../../../models/transaction/cartTransactionModel");
var item_cart = require("../../../models/transaction/cart/itemCartModel");
var tokenUtils = require("../../../Utils/tokenUtils");

exports.submitOrder = (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req);
  var description = req.body.description;

  cart
    .findOneAndUpdate({ created_by: dataUser._id }, { price: 0, itemCarts: [] })
    .populate("itemCarts")
    .populate("created_by")
    .exec(copyToTransactionCart());

  function copyToTransactionCart() {
    return function(err, _cart) {
      if (err) res.send(err);
      else {
        if (_cart) {
          if (_cart.itemCarts.length > 0) {
            var dt_trans_cart = {
              price: _cart.price,
              items: []
            };

            _cart.itemCarts.forEach(element => {
              var items = {
                itemId: element._id,
                quantity: element.quantity
              };

              dt_trans_cart.items.push(items);
              item_cart.deleteOne({ _id: element }).exec();

            });

            var newCart = new cartTrans(dt_trans_cart);
            newCart.save(addingNewTransaction);
          } else
            res.json({
              success: false,
              message: "Please add item to the cart first."
            });
        } else
          res.json({
            success: false,
            message: "Cart is not found"
          });
      }
    };
  }

  var addingNewTransaction = function(err, doc) {
    if (err) res.send(err);
    else {
      if (doc) {
        var newTransaction = new transaction({
          cart: doc._id,
          created_by: dataUser._id,
          status_transaction: "Menunggu Konfirmasi",
          description: description
        });

        newTransaction.save(savingMessages);
      }
    }
  };

  var savingMessages = function(err, doc) {
    if (err) res.send(err);
    else
      res.json({
        success: true,
        message: "Success adding new transaction"
      });
  };
};

exports.cancelOrder = (req, res) => {
  var transactionId = req.query.transactionId;
    console.log(transactionId)
  transaction.findById(transactionId, (err, _transaction) => {
    if (err) res.send(err);
    else {
      if (_transaction) {
        if (_transaction.status_transaction == "Menunggu Konfirmasi") {
          cartTrans.deleteOne({ _id: _transaction.cart }).exec(deletingTrans);
        } else
          res.json({
            success: true,
            message:
              "Cannot cancel the transaction, please contact admin."
          });
      } else {
        res.json({
          success: false,
          message: "Transaction not found."
        });
      }
    }
  });

  var deletingTrans = function(err, doc) {
    if (err) res.send(err);
    else
      transaction.deleteOne({ _id: transactionId }).exec(err => {
        if (err) res.send(err);
        else
          res.json({
            success: true,
            message: "Success cancel the transaction."
          });
      });
  };
};

exports.lisTransactionCustomer = (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req);

  transaction
    .find({ created_by: dataUser._id })
    .populate("cart")
    .populate("created_by", "username name email phoneNumber")
    .exec((err, _transaction) => {
      if (err) res.send(err);
      else {
        if (_transaction.length > 0) res.json(_transaction);
        else
          res.json({
            success: true,
            message: "Recent transaction is empty"
          });
      }
    });
};
