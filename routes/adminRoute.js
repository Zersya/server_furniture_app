var admin = require("../controllers/Admin/adminController");
var item = require("../controllers/Admin/itemController");

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
  app
    .route("/api/admin/manage_admin")
    .post(authMiddleware.checkTokenAdmin, admin.createAdmin);

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
