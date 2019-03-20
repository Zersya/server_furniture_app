var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require("./userModel");

AdminSchema = new Schema(
    {
        name: {
            type: String,
            min: [4, 'Too few characters'],
            max: [24, 'Too many characters'],
            required: 'Where is the name ?'
        },
        phoneNumber: {
            type: String,
            min: [4, 'Too few characters'],
            max: [24, 'Too many characters'],
            required: 'Where is the phoneNumber ?'
        }
    }, {discriminatorKey: 'user'}
);

var Admin = User.discriminator('Admin', AdminSchema);

module.exports = Admin;