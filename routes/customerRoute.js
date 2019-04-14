var customer = require("../controllers/Customer/customerController");
var cart = require("../controllers/Customer/transaction/cartController");
var transaction = require("../controllers/Customer/transaction/transactionController");
var authMiddleware = require("../middleware/authMiddleware");

module.exports = app => {
  app.route("/api/register").post(customer.createCustomer);

  app
    .route("/api/customer")
    .get(authMiddleware.checkTokenCustomer, customer.listItem)
    
  app.route('/api/customer/check')
  .get(authMiddleware);
  
  app
    .route("/api/customer/transaction")
    .get(authMiddleware.checkTokenCustomer, transaction.lisTransactionCustomer)
    .post(authMiddleware.checkTokenCustomer, transaction.submitOrder)
    .delete(authMiddleware.checkTokenCustomer, transaction.cancelOrder);

  app
    .route("/api/customer/cart")
    .get(authMiddleware.checkTokenCustomer, cart.listItemCart)
    .post(authMiddleware.checkTokenCustomer, cart.addToCart)
    .put(authMiddleware.checkTokenCustomer, cart.changeQuantity)
    .delete(authMiddleware.checkTokenCustomer, cart.removeFromCart);
};
