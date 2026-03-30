const express = require('express');
const router = express.Router();
const Field = require('../models/field');
const Booking = require('../models/booking');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Áp dụng 2 lớp bảo vệ cho toàn bộ API bên dưới
router.use(authMiddleware, adminMiddleware);

// ================= NHÓM QUẢN LÝ SÂN BÓNG =================

// 1. Thêm sân bóng mới
router.post('/fields', async (req, res) => {
  try {
    const { name, type, pricePerHour, description, imageUrl } = req.body;
    const newField = new Field({ name, type, pricePerHour, description, imageUrl });
    await newField.save();
    res.status(201).json({ message: 'Thêm sân bóng thành công!', field: newField });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm sân', error: error.message });
  }
});

// 2. Cập nhật thông tin hoặc đổi trạng thái sân (Bảo trì)
router.put('/fields/:id', async (req, res) => {
  try {
    const updatedField = await Field.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Trả về dữ liệu mới sau khi update
    );
    if (!updatedField) return res.status(404).json({ message: 'Không tìm thấy sân!' });
    res.json({ message: 'Cập nhật sân thành công!', field: updatedField });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sân', error: error.message });
  }
});


// ================= NHÓM QUẢN LÝ ĐẶT LỊCH (DUYỆT ĐƠN) =================

// 3. Lấy danh sách yêu cầu đặt sân (Có lọc theo trạng thái, ví dụ: ?status=PENDING)
router.get('/bookings', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Lấy thông tin đơn kèm theo tên Khách hàng và Tên sân
    const bookings = await Booking.find(filter)
      .populate('userId', 'fullName phoneNumber')
      .populate('fieldId', 'name type')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách đơn', error: error.message });
  }
});

// 4. Duyệt hoặc Từ chối đơn đặt sân
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'APPROVED' hoặc 'REJECTED'
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân!' });
    
    res.json({ message: `Đã ${status === 'APPROVED' ? 'Duyệt' : 'Từ chối'} đơn thành công!`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
});

// 5. Thống kê cơ bản (Tổng doanh thu các đơn đã duyệt)
router.get('/statistics', async (req, res) => {
  try {
    // Tính tổng tiền của các Booking có status là APPROVED
    const result = await Booking.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, totalBookings: { $sum: 1 } } }
    ]);

    const stats = result.length > 0 ? result[0] : { totalRevenue: 0, totalBookings: 0 };
    res.json({ message: 'Thống kê doanh thu', stats });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thống kê', error: error.message });
  }
});

module.exports = router;