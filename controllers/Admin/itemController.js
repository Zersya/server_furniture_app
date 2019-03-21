var item = require("../../models/itemModel");
var user = require('../../models/user/userModel')
var tokenUtils = require('../../Utils/tokenUtils')

exports.createItem = async (req, res) => {
  var dataUser = tokenUtils.getDataFromToken(req)
  var prevBody = req.body;

  user.findOne({username: dataUser.username}, (err, _user) => {
    if(err) res.send(err)

    if(_user){
    req.body = Object.assign(prevBody, {
      created_by: _user._id,
    })
    var newItem = new item(req.body);
    newItem.save(callbackSave);
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


