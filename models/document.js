const mongoose = require('mongoose');

const Document = mongoose.Schema({
  shortId: { type: String },
  url: { type: String },
  created: { type: Date, default: Date.now },
  clickCount: { type: Number, default: 0 },
  qrCode: { type: String, default: '' },
  userId: { type: String, default: '' },
  customized: { type: Boolean, default: false }
});

module.exports = mongoose.model('Document', Document);
