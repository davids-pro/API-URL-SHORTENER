const mongoose = require('mongoose');

const User = mongoose.Schema({
  email: { type: String },
  password: { type: String },
  username: { type: String },
  created: { type: Date, default: Date.now },
  resetCode: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', User);


