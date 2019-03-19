var jwt = require('jsonwebtoken');

var customer = require('../../models/user/customerModel');

exports.createCustomer = (req, res) => {
    const newCustomer = new customer(req.body);
    
    newCustomer.save((err, customer) => {
        if(err) res.send(err)
        var token = jwt.sign({user: customer.user, username: customer.username}, process.env.secret , { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Sign up success',
            token: token,
        });
    })
}
