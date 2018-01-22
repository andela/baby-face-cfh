const mongoose = require('mongoose'),
  // config = require('../../config/config'),
  { Schema } = mongoose;


/**
 * Notification Schema
 */
const NotificationSchema = new Schema({
  to: {
    type: String
  },
  from: {
    type: String
  },
  message: {
    type: String
  },
  link: {
    type: String
  },
  read: {
    type: Number
  }
});

mongoose.model('Notification', NotificationSchema);
