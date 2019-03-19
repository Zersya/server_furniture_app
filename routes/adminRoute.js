var admin = require('../controllers/Admin/adminController');
var item = require('../controllers/Admin/itemController');

authMiddleware = require('../middleware/authMiddleware');

module.exports = (app) => {
    
    app.route('/api/admin/manage_admin')
        .post(authMiddleware.checkTokenAdmin, admin.createAdmin)


    app.route('/api/admin/manage_item')
        .post(authMiddleware.checkTokenAdmin, item.createItem)
}