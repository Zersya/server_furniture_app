var auth = require('../controllers/Auth/authController');

module.exports = (app) => {
    app.route('/api/login')
        .post(auth.login)
    app.route('/api/register')
        .post(auth.createCustomer)
}