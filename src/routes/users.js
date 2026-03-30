const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { authMiddleware } = require('../middleware/auth');

// Yêu cầu phải đăng nhập mới được xem/sửa hồ sơ
router.use(authMiddleware);

// 1. GET: Lấy thông tin hồ sơ của tài khoản đang đăng nhập
router.get('/profile', async (req, res) => {
  try {
    // Tìm user theo id lưu trong token, loại bỏ trường password không trả về
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải hồ sơ', error: error.message });
  }
});

// 2. PUT: Cập nhật thông tin cá nhân hoặc đổi mật khẩu
router.put('/profile', async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng' });

    if (fullName) user.fullName = fullName;
    if (password) user.password = password; // Sẽ được tự động băm (hash) lại nhờ file model users.js

    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
});

module.exports = router;