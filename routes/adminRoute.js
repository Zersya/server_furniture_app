var user = require("../controllers/Admin/userController");
var item = require("../controllers/Admin/itemController");
var trans = require("../controllers/Admin/transactionController");

var Multer = require("multer");

authMiddleware = require("../middleware/authMiddleware");
gcsMiddleware = require("../middleware/google-cloud-storage");

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Maximum file size is 10MB
  }
});

module.exports = app => {

  //============================================== TRANSACTION ==============================================================

  app.route('/api/admin/manage_transaction')
  .get(authMiddleware.checkTokenAdmin, trans.listTransaction)

  app.route('/api/admin/manage_transaction/:tid')
  .get(authMiddleware.checkTokenAdmin, trans.detailTransaction)
  .put(authMiddleware.checkTokenAdmin, trans.changeStatusTransaction)
  .delete(authMiddleware.checkTokenAdmin, trans.deleteTransaction)


  //============================================== USER ==============================================================
  app
    .route("/api/admin/manage_user")
    .get(authMiddleware.checkTokenAdmin, user.listUser)
    .post(authMiddleware.checkTokenAdmin, user.createAdmin)
    .put(authMiddleware.checkTokenAdmin, user.updateUser)
    .delete(authMiddleware.checkTokenAdmin, user.deleteUser);

  app
    .route('/api/admin/manage_user/:userId')
    .get(authMiddleware.checkTokenAdmin, user.detailUser)
  

  //============================================== ITEM ==============================================================
  app
    .route("/api/admin/manage_item")
    .get(authMiddleware.checkTokenAdmin, item.listItem)
    .post(
      [
        authMiddleware.checkTokenAdmin,
        multer.array("images", 6),
        gcsMiddleware.sendUploadToGCS
      ],
      item.createItem
    );

  app
    .route("/api/admin/manage_item/:itemId")
    .get(authMiddleware.checkTokenAdmin, item.detailItem)
    .put(authMiddleware.checkTokenAdmin, item.updateItem)
    .delete(authMiddleware.checkTokenAdmin, item.deleteItem);

  app
    .route("/api/admin/manage_item/image/:itemId")
    .post(
      [
        authMiddleware.checkTokenAdmin,
        multer.array("images", 6),
        gcsMiddleware.sendUploadToGCS
      ],
      item.addOnlyImage
    )
    .delete(authMiddleware.checkTokenAdmin, item.deleteOnlyImage);
};
