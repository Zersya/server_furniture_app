var transaction = require("../../models/transaction/transactionModel");
var cartTrs = require("../../models/transaction/cartTransactionModel");

exports.listTransaction = (req, res) => {
  const statusTrans = req.query.st;
  var conditionTrans = statusTrans
    ? { status_transaction: { $regex: ".*" + statusTrans + ".*" } }
    : {};

  transaction
    .find(conditionTrans)
    .populate("cart")
    .populate("created_by", "user username name last_login email created_at")
    .exec(responseList());

  function responseList() {
    return function(err, _transaction) {
      if (err) res.send(err);
      else {
        if (_transaction.length > 0) res.json(_transaction);
        else
          res.json({
            success: true,
            message: "Transaction is not available"
          });
      }
    };
  }
};

exports.detailTransaction = (req, res) => {
  const transactionId = req.params.tid;

  transaction
    .findById(transactionId)
    .populate({
      path: "cart",
      populate: {
        path: "items.itemId",
        select: "name",
        populate: { path: "images", select: "urlImage" }
      }
    })
    .populate("created_by", "user username name last_login email created_at")
    .exec(responseDetail());

  function responseDetail() {
    return function(err, _transaction) {
      if (err) res.send(err);
      else {
        if (_transaction) {
          res.json(_transaction);
        } else {
          res.json({
            success: false,
            message: "Transaction not found, please check transaction id"
          });
        }
      }
    };
  }
};

exports.changeStatusTransaction = (req, res) => {
  const transactionId = req.params.tid;
  var status_transaction = req.query.st;
  if (!status_transaction) {
    res.json({
      success: false,
      message: "Where is the status transaction ?"
    });
  } else {
    transaction.findByIdAndUpdate(
      transactionId,
      {
        status_transaction: status_transaction
      },
      (err, _transaction) => {
        if (err) res.send(err);
        else {
          if (_transaction) {
            res.json({
              success: true,
              message: "Success change transaction status"
            });
          } else {
            res.json({
              success: false,
              message: "Transaction not found, please check id transaction"
            });
          }
        }
      }
    );
  }
};

exports.deleteTransaction = (req, res) => {
  const transactionId = req.params.tid;

  transaction.findByIdAndDelete(transactionId, deleteCartTransaction());

  function deleteCartTransaction() {
    return function(err, _transaction) {
      if (err) res.send(err);
      else {
        if (_transaction) {
          cartTrs.deleteOne({ _id: _transaction.cart }, err => {
            if (err) res.send(err);
            else
              res.json({
                success: true,
                message: "Success deleting transaction."
              });
          });
        } else {
          res.json({
            success: false,
            message:
              "Failed deleting transaction, please check the transaction id"
          });
        }
      }
    };
  }
};
