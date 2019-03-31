var item = require("../../models/itemModel");
var image = require("../../models/imageModel");
var user = require("../../models/user/userModel");
var tokenUtils = require("../../Utils/tokenUtils");

const gcsHelpers = require("../../Utils/google-cloud-storage");

exports.createItem = (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req);
  var prevBody = req.body;

  req.body = Object.assign(prevBody, {
    created_by: dataUser._id
  });

  var newItem = new item(req.body);
  req.files.forEach(element => {
    const _image = {
      nameImage: element.cloudStorageObject,
      urlImage: element.gcsUrl
    };
    var newImage = new image(_image);
    newItem.images.push(newImage._id);

    newImage.save();
  });
  newItem.save(err => {
    if (err) res.send(err);
    else
      res.json({
        success: true,
        message: "Adding success"
      });
  });
};

exports.updateItem = (req, res) => {
  const itemId = req.params.itemId;

  item.findById(itemId, (err, _item) => {
    _item.name = req.body.name || _item.name || "empty";
    _item.price = req.body.price || _item.price || 0;
    _item.category = req.body.category || _item.category || "empty";
    _item.quantity = req.body.quantity || _item.quantity || 0;

    _item.save((err, __item) => {
      if (err) res.send(err);

      if (__item) {
        res.json({
          success: true,
          message: "Success updated " + __item.name
        });
      } else {
        res.json({
          success: false,
          message: "Item Id " + itemId + " not found"
        });
      }
    });
  });
};

exports.listItem = (req, res) => {
  if (Object.keys(req.query).length == 0) {
    item
      .find({})
      .populate("created_by", "name")
      .populate("images", "nameImage item urlImage")
      .exec(callBacklistItem());
  } else {
    item
      .find({
        $or: [
          { name: { $regex: ".*" + req.query.searchName + ".*" } },
          { category: { $regex: ".*" + req.query.searchCategory + ".*" } }
        ]
      })
      .populate("created_by", "name")
      .populate("images", "nameImage item urlImage")
      .exec(callBacklistItem());
  }

  function callBacklistItem() {
    return function(err, item) {
      if (item) {
        res.json(item.reverse());
      } else {
        res.json({
          success: true,
          message: "There is no items."
        });
      }
    };
  }
};

exports.deleteItem = (req, res) => {
  const { storage } = gcsHelpers;

  const bucketName = "harpah_images_items";
  const itemId = req.params.itemId;

  item.findByIdAndDelete(itemId, (err, _item) => {
    if (_item) {
      _item.images.forEach(element => {
        image.findByIdAndDelete(element, callbackDeleteStorage());
      });
      res.json({
        success: true,
        message: "Success deleted " + _item.name
      });
    } else {
      res.json({
        success: false,
        message: "Item Id " + itemId + " not found"
      });
    }
  });

  function callbackDeleteStorage() {
    return async function(err, _image) {
      if (err) res.send(err);

      await storage
        .bucket(bucketName)
        .file(_image.nameImage)
        .delete();
    };
  }
};

exports.detailItem = (req, res) => {
  const itemId = req.params.itemId;

  item
    .findById(itemId)
    .populate("images", "nameImage urlImage")
    .populate("created_by", "username name email phoneNumber created_at")
    .exec(callbackFind());

  function callbackFind() {
    return function(err, _item) {
      if (err) res.send(err);

      if (_item) {
        res.json(_item);
      } else {
        res.json({
          success: false,
          message: "Item Id " + itemId + " not found"
        });
      }
    };
  }
};

exports.deleteOnlyImage = (req, res) => {
  const { storage } = gcsHelpers;

  const bucketName = "harpah_images_items";
  const imageId = req.query.imageId;
  const itemId = req.params.itemId;

  item.findById(itemId, callbackItemFind());

  function callbackItemFind() {
    return function(err, _item) {
      if (err) res.send(err);
      else {
        if (_item) {
          image.findByIdAndDelete(imageId, callbackImageFind(_item));
        } else {
          res.json({
            success: false,
            message: "Item Id " + itemId + " not found"
          });
        }
      }
    };
  }

  function callbackImageFind(_item) {
    return function(err, _image) {
      if (err) res.send(err);
      else {
        if (_image) {
          item.updateOne(
            { _id: _item._id },
            { $pull: { images: _image._id } },
            deleteGoogleImages(_image)
          );
        } else {
          res.json({
            success: false,
            message: "Image Id " + imageId + " not found"
          });
        }
      }
    };
  }

  function deleteGoogleImages(_image) {
    return async err => {
      if (err) res.send(err);

      await storage
        .bucket(bucketName)
        .file(_image.nameImage)
        .delete();

      res.json({
        success: true,
        message: "Success deleted " + _image.nameImage
      });
    };
  }
};

exports.addOnlyImage = (req, res) => {
  const itemId = req.params.itemId;

  item.findById(itemId, (err, _item) => {
    if (err) res.send(err);
    var newImage;

    if (_item) {
      req.files.forEach(element => {
        const _image = {
          item: _item._id,
          nameImage: element.cloudStorageObject,
          urlImage: element.gcsUrl
        };
        newImage = new image(_image);
        _item.images.push(newImage._id);

        newImage.save();
      });
      _item.save(callbackSave);
    } else {
      res.json({
        success: false,
        message: "Item Id " + itemId + " not found"
      });
    }
  });

  var callbackSave = err => {
    if (err) res.send(err);
    else {
      res.json({
        success: true,
        message: "Adding success"
      });
    }
  };
};
