
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var customer = require('../../models/user/customerModel');

exports.login = (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if(username && password){
        customer.find({username: username}, (err, customer) => {
            if(err) res.send(err)
            bcrypt.compare(password, customer[0].password, (err, isMatch) => {
                if(err) res.send(err)

                if(isMatch){
                    var token = jwt.sign({username: username}, process.env.secret , { expiresIn: '24h' });

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
        })
    }else{
        res.json({
            success: false,
            message: 'Please fill username and password field',
        });
    }
}

exports.createCustomer = (req, res) => {
    const newCustomer = new customer(req.body);
    
    newCustomer.save((err, customer) => {
        if(err) res.send(err)

        res.json(customer)
    })
}