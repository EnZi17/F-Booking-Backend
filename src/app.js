require('dotenv').config(); // Load biến môi trường từ file .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import các file Routes vừa tạo
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const fieldRoutes = require('./routes/fields');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware cơ bản
app.use(cors()); // Cho phép App Mobile/Web gọi API mà không bị chặn
app.use(express.json()); // Giúp Express đọc được dữ liệu dạng JSON gửi lên

// ================= KẾT NỐI DATABASE (MONGODB) =================
// Đảm bảo bạn đã có biến MONGODB_URI trong file .env
const URL = process.env.MONGODB_URI || 'mongodb+srv://minhthongvo170106_db_user:enzi117@cluster0.vdtlau7.mongodb.net/?appName=Cluster0';

mongoose.connect(URL)
  .then(() => console.log('✅ Kết nối MongoDB thành công!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// ================= ĐĂNG KÝ CÁC ĐƯỜNG DẪN API =================
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Route Test xem server sống không
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với Hệ thống API Đặt Sân Bóng (F-Booking)!' });
});

// Bắt các route không tồn tại (Lỗi 404)
app.use((req, res) => {
  res.status(404).json({ message: 'Đường dẫn API không tồn tại!' });
});

// ================= KHỞI CHẠY SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ngon lành tại port ${PORT}...`);
});