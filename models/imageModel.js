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
    created_date: {
        type: Date,
        default: new Date
    }

});

module.exports = mongoose.model('Image', FileSchema);
