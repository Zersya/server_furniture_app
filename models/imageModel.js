var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileSchema = new Schema({
    urlImage: {
        type: String,
        required: 'Where is the urlImages ?'
    },
    nameImage: {
        type: String,
        required: 'Where is the nameImages ?'
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
    },
    created_date: {
        type: Date,
        default: new Date
    }

});

module.exports = mongoose.model('Image', FileSchema);
