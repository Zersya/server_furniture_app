
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var user = require('../../models/user/userModel');

exports.login = (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if(username && password){
        user.findOne({username: username}, (err, user) => {
            if(err) res.send(err);

            if(user){
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) res.send(err)
                    if(isMatch){
                        var token = jwt.sign({user: user.user, username: username}, process.env.secret , { expiresIn: '24h' });

                        res.json({
                            success: true,
                            message: 'Authentication success',
                            token: token,
                        });
                        
                    }else{
                        res.json({
                            success: false,
                            message: 'Incorrect username or password',
                            token: token,
                        });
                    }
                })
            }else{
                res.json({
                    success: false,
                    message: 'User not found',
                })
            }
        })
    }else{
        res.json({
            success: false,
            message: 'Please fill username and password field',
        });
    }
}

