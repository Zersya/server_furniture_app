var mongoose = require('mongoose'),
    bcrypt = require("bcrypt"),
    Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            min: [4, 'Too few characters'],
            max: [8, 'Too many characters'],
            required: 'Where is the username ?'
        },
        password: {
            type: String, 
            required: 'Where is the password ?'
        },
        created_at: {
            type: Date,
            default: new Date()
        },
    }, {discriminatorKey: 'user' }
)


UserSchema.pre("save", function(next) {
    var user = this;
  
    if (!user.isModified("password")) return next();
  
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
  
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return err();
  
        user.password = hash;
        next();
      });
    });
  });
  
module.exports = mongoose.model('User', UserSchema);