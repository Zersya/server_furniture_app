var customer = require('../controllers/Customer/customerController');

module.exports = (app) => {
    app.route('/api/register')
        .post(customer.createCustomer)
    
}