const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // VD: '5_NGUOI', '7_NGUOI'
  pricePerHour: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true } // Trạng thái bảo trì
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);