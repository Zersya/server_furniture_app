var transaction = require("../../models/transaction/transactionModel");

exports.listTransaction = (req, res) => {
  const statusTrans = req.query.status_transaction;
  var conditionTrans = statusTrans
    ? { status_transaction: { $regex: ".*" + statusTrans + ".*" } }
    : {};
  // var conditionTrans = {
  //     status_transaction: 'Menunggu Konfirmasi' ||
  //    'Proses Pembuatan' ||
  //    'Selesai Pembuatan' ||
  //    'Dibatalkan'
  // }

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
            message: "Tidak ada transaksi"
          });
      }
    };
  }
};

exports.detailTransaction = (req, res) => {
  const transactionId = req.params.transactionId;

  transaction
    .findById(transactionId)
    .populate({ path: "cart", populate: { path: "items.itemId", select: 'name', populate: {path: 'images', select: 'urlImage'} } })
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
            message: "Transaksi tidak ditemukan, periksa ID transaksi"
          });
        }
      }
    };
  }
};

exports.changeStatusTransaction = (req, res) => {
  
}
