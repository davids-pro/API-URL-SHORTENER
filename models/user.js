const mongoose = require('mongoose');

const User = mongoose.Schema({
  email: { type: String },
  password: { type: String },
  username: { type: String },
  created: { type: Date, default: Date.now },
  lastConnexion: { type: Date }
});

module.exports = mongoose.model('User', User);
