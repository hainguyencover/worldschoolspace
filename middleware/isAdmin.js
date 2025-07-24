const isAdmin = (req, res, next) => {
  try {
    // Kiểm tra xem user đã được xác thực chưa (từ middleware verifyToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục.",
      });
    }

    // Kiểm tra role có phải admin không
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền thực hiện hành động này. Chỉ admin mới được phép.",
      });
    }

    // Kiểm tra tài khoản admin có bị khóa không
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản admin đã bị khóa.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền admin.",
    });
  }
};

module.exports = isAdmin;
