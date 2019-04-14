var cart = require("../../../models/transaction/cart/cartModel");
var item_cart = require("../../../models/transaction/cart/itemCartModel");
var user = require("../../../models/user/userModel");
var item = require("../../../models/itemModel");

var tokenUtils = require("../../../Utils/tokenUtils");

exports.addToCart = (req, res) => {
  var itemId = req.query.itemId;
  var cartId = "";
  var quantity = parseInt(req.query.quantity);
  var dataUser = tokenUtils.getDataFromToken(req);
  cart.findOne({ created_by: dataUser._id }).exec(callbackFindCart());

  function callbackFindCart() {
    return function(err, _cart) {
      if (err) res.send(err);
      else {
        if (_cart) {
          cartId = _cart._id;
          item_cart.findById(itemId, callbackFindItemCart(_cart));
        }
      }
    };
  }

  function callbackFindItemCart(_cart) {
    return function(err, _item_cart) {
      if (err) res.send(err);

      if (_item_cart) {
        quantity
          ? (_item_cart.quantity += quantity)
          : (_item_cart.quantity += 1);
        quantity
          ? (_item_cart.priceAll += _item_cart.priceOne * quantity)
          : (_item_cart.priceAll += _item_cart.priceOne);
        _item_cart.save(callbackSaveItem());
      } else {
        getItemData((err, _item) => {
          if (err) res.send(err);
          else {
            var newItem_cart = new item_cart({
              _id: itemId,
              quantity: quantity ? quantity : 1,
              priceOne: _item.price,
              priceAll: _item.price * quantity || _item.price
            });
            _cart.itemCarts.push(newItem_cart._id);
            _cart.save();
            newItem_cart.save(callbackSaveItem());
          }
        });
      }
    };
  }

  function getItemData(callback) {
    return item.findById(itemId, callback);
  }

  function callbackSaveItem() {
    return function(err, doc) {
      if (err) res.send(err);
      if (doc) {
        addingPriceTotalCart("Success adding to the cart.", cartId, res);
      } else {
        res.json({
          success: false,
          message: "Failed to add item"
        });
      }
    };
  }
};

exports.removeFromCart = (req, res) => {
  var itemId = req.query.itemId;
  var dataUser = tokenUtils.getDataFromToken(req);

  cart.findOneAndUpdate(
    { created_by: dataUser._id },
    { $pull: { itemCarts: itemId } },
    (err, _cart) => {
      if (err) res.send(err);

      if (_cart) {
        item_cart.findOneAndDelete({ _id: itemId }, (err, doc) => {
          if (err) res.send(err);
          else
            addingPriceTotalCart("Success to delete item cart", _cart._id, res);
        });
      }
    }
  );
};

exports.changeQuantity = (req, res) => {
  var itemId = req.query.itemId;
  var dataUser = tokenUtils.getDataFromToken(req);
  const quantity = parseInt(req.query.quantity);

  cart.findOne({ created_by: dataUser._id }).exec(callbackFindCart());

  function callbackFindCart() {
    return function(err, _cart) {
      item_cart.findOne({ _id: itemId }, (err, _item_cart) => {
        if (err) res.send(err);
        else {
          _item_cart.quantity = quantity;
          _item_cart.priceAll = _item_cart.priceOne * quantity;
          _item_cart.save((err, doc) => {
            if (err) res.send(err);
            else
              addingPriceTotalCart(
                "Success change quantity item",
                _cart._id,
                res
              );
          });
        }
      });
    };
  }
};

exports.listItemCart = (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req);

  cart
    .find({ created_by: dataUser._id })
    .populate({
      path: "itemCarts",
      populate: {
        path: "_id",
        populate: { path: "images", select: "urlImage", },
        populate: {path: "created_by", select: '_id user name'}
      }
    })
    .populate("created_by", "name")
    .exec((err, _cart) => {
      if (err) res.send(err);
      else {
        if (_cart) res.json(_cart);
        else
          res.json({
            success: true,
            message: "Your cart is empty"
          });
      }
    });
};

function addingPriceTotalCart(_String, cartId, res) {
  return cart
    .findById(cartId)
    .populate("itemCarts", "priceAll")
    .exec((err, _cart) => {
      if (err) res.send(err);
      else {
        if (_cart) {
          var priceTotal = 0;

          _cart.itemCarts.forEach(element => {
            priceTotal += element.priceAll;
          });
          // console.log(priceTotal)

          _cart.price = priceTotal;
          _cart.save(err => {
            if (err) res.send(err);
            else
              res.json({
                success: true,
                message: _String
              });
          });
        } else {
          res.json({
            success: false,
            message: "Cart is not found"
          });
        }
      }
    });
}
