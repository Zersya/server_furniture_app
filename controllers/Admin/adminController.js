var jwt = require('jsonwebtoken');

var admin = require('../../models/user/adminModel')

exports.createAdmin = (req, res) => {
    const newAdmin = new admin(req.body);
    
    newAdmin.save((err, admin) => {
        if(err) res.send(err)
        var token = jwt.sign({user: admin.user, username: admin.username}, process.env.secret , { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Sign up success',
            token: token,
        });
    })
}