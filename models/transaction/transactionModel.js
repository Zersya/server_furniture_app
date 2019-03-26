var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    CartTransaction = require('./cartTransactionModel');

var TransactionSchema = new Schema({
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'CartTransaction',
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status_transaction: {
        type: String,
        required: 'What is the status_transaction ?'
    },
    custom_description: {
        type: String,
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('Transaction', TransactionSchema);