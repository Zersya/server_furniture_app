var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var CartSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId
  },
  itemCarts: [
    {
      type: Schema.Types.ObjectId,
      ref: "ItemCart"
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  price: {
    type: Number
  }
});

module.exports = mongoose.model("Cart", CartSchema);
