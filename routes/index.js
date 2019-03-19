var customer = require('./customerRoute');
var admin = require('./adminRoute');
var auth = require('./authRoute');

module.exports = (app) => {
    customer(app)
};