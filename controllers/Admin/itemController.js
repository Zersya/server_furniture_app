var item = require("../../models/itemModel");
var user = require("../../models/user/userModel");
var tokenUtils = require("../../Utils/tokenUtils");

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
          newItem.urlImages.push(element.gcsUrl);
          newItem.nameImages.push(element.cloudStorageObject);
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

exports.listItem = (req, res) => {
  item
    .find({})
    .populate("created_by", 'name')
    .exec(callBacklistItem());

  function callBacklistItem() {
    return function(err, item) {
      if (err) res.send(err);

      if (item) {
        res.json(item);
      } else {
        res.json({
          success: true,
          message: "There is no items."
        });
      }
    };
  }
};
