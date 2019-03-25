const gcsHelpers = require("../Utils/google-cloud-storage");
const item = require("../models/itemModel");

const { storage } = gcsHelpers;

const DEFAULT_BUCKET_NAME = "harpah_images_items"; // Replace with the name of your bucket

/**
 * Middleware for uploading file to GCS.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {*}
 */
exports.sendUploadToGCS = (req, res, next) => {
  console.log(req.files)
  if (!req.files) {
    res.json({
      success: false,
      message: "Please insert any image"
    });
  }else if(req.files.length == 0){
    res.json({
      success: false,
      message: "Please insert any images."
    });
  }

  const bucketName = req.body.bucketName || DEFAULT_BUCKET_NAME;

  const bucket = storage.bucket(bucketName);
  var filename = ''

  item.findById(req.params.itemId, (err, _item) => {
    if (err) {
      res.json({
        success: false,
        message: "ItemId not valid"
      });
    } else {
      filename = req.body.name || _item.name;
      processImages();
    }
  });

  var files = [];
  function processImages() {
    return req.files.forEach((element, i) => {
      const gcsFileName = `${Date.now()}-${filename}-${i}`;
      element.gcsUrl = i;
      const file = bucket.file(gcsFileName);

      const stream = file.createWriteStream({
        metadata: {
          contentType: element.mimetype
        }
      });

      stream.on("error", err => {
        element.cloudStorageError = err;
        next(err);
      });

      stream.on("finish", () => {
        element.cloudStorageObject = gcsFileName;

        return file.makePublic().then(() => {
          element.gcsUrl = gcsHelpers.getPublicUrl(bucketName, gcsFileName);
          files.push(element);
          if (files.length == req.files.length) {
            req.files = files;
            next();
          }
        });
      });

      stream.end(element.buffer);
    });
  }
};
