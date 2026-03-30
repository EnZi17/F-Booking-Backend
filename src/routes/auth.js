const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET || 'fbooking_secret_key_2026';

// 1. API Đăng ký tài khoản (Khách hàng)
router.post('/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, password } = req.body;

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký!' });
    }

    // Tạo user mới (role mặc định là USER theo Model)
    const user = new User({ fullName, phoneNumber, password });
    await user.save();

    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
  }
});

// 2. API Đăng nhập (Chung cho Admin và User)
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ SĐT và Mật khẩu!' });
    }

    // --- KIỂM TRA ADMIN (HARDCODE) ---
    const adminPhone = process.env.ADMIN_PHONE || '0123456789';
    const adminPass = process.env.ADMIN_PASSWORD || '1';

    if (phoneNumber === adminPhone && password === adminPass) {
      // Tạo token cho Admin
      const token = jwt.sign({ id: 'admin_master_id', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        message: 'Đăng nhập Admin thành công!',
        token,
        user: { fullName: 'Quản trị viên', phoneNumber, role: 'ADMIN' }
      });
    }

    // --- KIỂM TRA USER BÌNH THƯỜNG ---
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Sai số điện thoại hoặc mật khẩu!' });
    }

    // So sánh mật khẩu băm
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai số điện thoại hoặc mật khẩu!' });
    }

    // Tạo Token cho User
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        phoneNumber: user.phoneNumber, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
  }
});

module.exports = router;