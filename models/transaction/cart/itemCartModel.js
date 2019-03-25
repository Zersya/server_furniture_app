var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ItemCartSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
    },
    quantity:{
        type: Number,
    },
    priceOne: {
        type: Number,
    },
    priceAll: {
        type: Number
    }
})

module.exports = mongoose.model('ItemCart', ItemCartSchema);