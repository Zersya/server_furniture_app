var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: {
        type: String,
        min: [4, 'Too few characters'],
        max: [24, 'Too many characters'],
        required: 'What is the name ?'
    },
    price: {
        type: Number,
        required: 'What is the price ?'
    },
    category: {
        type: String,
        required: 'What is the category ?'
    },
    quantity: {
        type: Number,
        required: 'How many is the item ?'
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: 'Who is the Operator ?'
    },
    created_date: {
        type: Date,
        default: new Date
    }

});

module.exports = mongoose.model('Item', ItemSchema);
