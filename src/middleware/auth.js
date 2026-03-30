const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy Token, từ chối truy cập!' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fbooking_secret_key_2026');
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Từ chối truy cập: Chỉ dành cho Admin!' });
  }
};

module.exports = { authMiddleware, adminMiddleware };