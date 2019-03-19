var customer = require('./customerRoute');
var admin = require('./adminRoute');

module.exports = (app) => {
    customer(app);
};