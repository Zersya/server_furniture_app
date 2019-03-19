var item = require('../../models/itemModel')

exports.createItem = (req, res) => {
    var newItem = new item(req.body);

    newItem.save((err, item) => {
        if(err) res.send(err);

        res.json({
            success: true,
            message: 'Adding success',
        });
    })
}