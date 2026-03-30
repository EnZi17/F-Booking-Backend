const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  bookingDate: { type: String, required: true }, // Định dạng YYYY-MM-DD
  startTime: { type: String, required: true },   // VD: '17:00'
  endTime: { type: String, required: true },     // VD: '18:30'
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);