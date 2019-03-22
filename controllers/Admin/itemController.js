var item = require("../../models/itemModel");
var image = require("../../models/imageModel");
var user = require("../../models/user/userModel");
var tokenUtils = require("../../Utils/tokenUtils");

const gcsHelpers = require("../../Utils/google-cloud-storage");

exports.createItem = (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req);
  var prevBody = req.body;
  user.findOne({ username: dataUser.username }, (err, _user) => {
    if (err) res.send(err);

    if (_user) {
      req.body = Object.assign(prevBody, {
        created_by: _user._id
      });

      if (!req.files) {
        res.json({
          success: false,
          message: "Please insert images."
        });
      } else {
        var newItem = new item(req.body);
        req.files.forEach(element => {
          const _image = {
            item: newItem._id,
            nameImage: element.cloudStorageObject,
            urlImage: element.gcsUrl
          };
          var newImage = new image(_image);
          newItem.images.push(newImage._id);

          newImage.save();
        });
        newItem.save(callbackSave);
      }
    }
  });

  var callbackSave = (err, item) => {
    if (err) res.send(err);

    if (item) {
      res.json({
        success: true,
        message: "Adding success"
      });
    }
  };
};

exports.updateItem = (req, res) => {
  const itemId = req.params.itemId;
  item.findByIdAndUpdate(itemId, req.body, (err, _item) => {
    if (err) res.send(err);

    if (_item) {
      res.json({
        success: true,
        message: "Success updated " + _item.name
      });
    } else {
      res.json({
        success: false,
        message: "ItemId not valid"
      });
    }
  });
};

exports.listItem = (req, res) => {
  item
    .find({})
    .populate("created_by", "name")
    .populate("images", "nameImage item urlImage")
    .exec(callBacklistItem());

  function callBacklistItem() {
    return function(err, item) {
      if (err) res.send(err);

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
  var itemName = "";

  item.findByIdAndDelete(itemId, (err, _item) => {
    if (err) res.send(err);

    if (_item) {
      _item.images.forEach(element => {
        itemName = _item.name;
        image.findByIdAndDelete(element, callbackDeleteStorage());
      });
      res.json({
        success: true,
        message: "Success deleted " + itemName
      });
    } else {
      res.json({
        success: false,
        message: "ItemId not valid"
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
      }
    };
  }
};

exports.deleteOnlyImage = (req, res) => {
  const { storage } = gcsHelpers;

  const bucketName = "harpah_images_items";
  const imageId = req.query.imageId;
  const itemId = req.params.itemId;
  image.findOneAndDelete({ _id: imageId }, callbackfind());

  function callbackfind() {
    return function(err, _image) {
      if (err) res.send(err);

      if (_image && _image.item == itemId) {
        item.updateOne(
          { _id: _image.item },
          { $pull: { images: _image._id } },
          async err => {
            if (err) res.send(err);

            await storage
              .bucket(bucketName)
              .file(_image.nameImage)
              .delete();

            res.json({
              success: true,
              message: "Success deleted " + _image.nameImage
            });
          }
        );
      } else {
        res.json({
          success: false,
          message: "Image Id " + imageId + " not found"
        });
      }
    };
  }
};

exports.addOnlyImage = (req, res) => {
  const itemId = req.params.itemId;

  item.findById(itemId, (err, _item) => {
    if (err) res.send(err);

    if (_item) {
      req.files.forEach(element => {
        const _image = {
          item: _item._id,
          nameImage: element.cloudStorageObject,
          urlImage: element.gcsUrl
        };
        var newImage = new image(_image);
        _item.images.push(newImage._id);
        _item.save();
        newImage.save(callbackSave);
      });
    } else {
      res.json({
        success: false,
        message: "ItemId not valid"
      });
    }
  });

  var callbackSave = (err, item) => {
    if (err) res.send(err);

    if (item) {
      res.json({
        success: true,
        message: "Adding success"
      });
    }
  };
};
