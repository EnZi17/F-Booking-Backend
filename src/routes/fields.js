const express = require('express');
const router = express.Router();
const Field = require('../models/field');
const Booking = require('../models/booking');

// Lấy danh sách toàn bộ sân bóng đang hoạt động
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find({ isActive: true });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải danh sách sân', error: error.message });
  }
});

// Lấy chi tiết một sân bóng theo ID
router.get('/:id', async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Không tìm thấy sân bóng!' });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
// Lấy danh sách các khung giờ đã bị đặt của sân trong 1 ngày
router.get('/:id/slots', async (req, res) => {
  try {
    const { date } = req.query; // Định dạng YYYY-MM-DD
    if (!date) return res.status(400).json({ message: 'Vui lòng cung cấp tham số date' });

    // Tìm các đơn đặt sân PENDING hoặc APPROVED vào ngày đó
    const bookedSlots = await Booking.find({
      fieldId: req.params.id,
      bookingDate: date,
      status: { $in: ['PENDING', 'APPROVED'] }
    }).select('startTime endTime status');

    res.json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách khung giờ', error: error.message });
  }
});
module.exports = router;