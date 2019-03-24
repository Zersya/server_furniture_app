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
            });

            var newCart = new cartTrans(dt_trans_cart);
            newCart.save(addingNewTransaction);
            item_cart.deleteMany({ cart: _cart._id }).exec();
          } else
            res.json({
              success: false,
              message: "Silahkan belanja terlebih dahulu"
            });
        } else
          res.json({
            success: false,
            message: "Cart tidak ditemukan"
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
        message: "Sukses menambahkan orderan"
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
              "Orderan tidak dapat dibatalkan, harap hubungi pihak admin."
          });
      } else {
        res.json({
          success: false,
          message: "Orderan tidak ada."
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
            message: "Sukses membatalkan pesanan, silahkan belanja kembali."
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
            message: "Anda tidak memiliki transaksi sebelumnya"
          });
      }
    });
};
