var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var CartTransactionSchema = new Schema({
  items: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        ref: "Item"
      },
      quantity: {
          type: Number,
          required: 'Where is the quantity ?'
      }
    }
  ],
  price: {
    type: Number
  }
});

module.exports = mongoose.model("CartTransaction", CartTransactionSchema);
