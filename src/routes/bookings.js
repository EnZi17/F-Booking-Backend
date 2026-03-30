const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const { authMiddleware } = require('../middleware/auth');

// Yêu cầu đăng nhập cho toàn bộ route ở dưới
router.use(authMiddleware);

// 1. Tạo đơn đặt sân mới
router.post('/', async (req, res) => {
  try {
    const { fieldId, bookingDate, startTime, endTime, totalPrice } = req.body;
    const userId = req.user.id;

    // Logic quan trọng: Kiểm tra xem khung giờ này đã có ai đặt (PENDING hoặc APPROVED) chưa
    // Hai khoảng thời gian (start1, end1) và (start2, end2) trùng nhau khi: start1 < end2 VÀ end1 > start2
    const overlappingBooking = await Booking.findOne({
      fieldId,
      bookingDate,
      status: { $in: ['PENDING', 'APPROVED'] },
      $and: [
        { startTime: { $lt: endTime } },
        { endTime: { $gt: startTime } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Rất tiếc, khung giờ này đã có người đặt!' });
    }

    // Nếu trống, tiến hành lưu đơn
    const newBooking = new Booking({
      userId, fieldId, bookingDate, startTime, endTime, totalPrice, status: 'PENDING'
    });
    
    await newBooking.save();
    res.status(201).json({ message: 'Đặt lịch thành công, đang chờ duyệt!', booking: newBooking });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt lịch', error: error.message });
  }
});

// 2. Xem lịch sử đặt sân của cá nhân
router.get('/my-history', async (req, res) => {
  try {
    // Tìm các đơn của User này, .populate để lấy luôn thông tin tên sân bóng
    const bookings = await Booking.find({ userId: req.user.id })
                                  .populate('fieldId', 'name imageUrl')
                                  .sort({ createdAt: -1 }); // Mới nhất xếp trên
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải lịch sử', error: error.message });
  }
});

// 2.5 Lấy thông tin chi tiết của một đơn đặt sân cụ thể
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id })
                                 .populate('fieldId');
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân!' });
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải chi tiết đơn', error: error.message });
  }
});

// 3. Khách hàng tự hủy đơn (Chỉ được hủy khi đang PENDING)
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân!' });
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn khi đang chờ duyệt!' });
    }

    booking.status = 'CANCELLED';
    await booking.save();
    res.json({ message: 'Đã hủy đơn đặt sân thành công!' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn', error: error.message });
  }
});

module.exports = router;