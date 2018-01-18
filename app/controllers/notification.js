const mongoose = require('mongoose');

const Notification = mongoose.model('Notification');

exports.addNotification = (req, res) => {
  const { friendId, link } = req.body;

  Notification.create({
    to: friendId,
    from: req.decoded.name,
    message: `${req.decoded.name} has invited you to a game`,
    link,
    read: 0
  })
    .then(() => {
      res.status(200).send({
        message: 'Notification has been sent'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

exports.loadNotification = (req, res) => {
  const userId = req.decoded.id;

  Notification.find({
    to: userId,
    read: 0
  })
    .then((data) => {
      res.status(200).send({
        notifications: data,
        message: 'Notifications loaded successfully'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

exports.readNotification = (req, res) => {
  const { id } = req.params;
  Notification.findOneAndUpdate(
    {
      _id: id
    },
    { $set: { read: 1 } }
  )
    .then(() => {
      res.status(200).send({
        message: 'Notification read successfully'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};
