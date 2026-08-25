const adminMiddleware = (req, res, next) => {
  try {
    // User authenticated hai ya nahi
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Sirf admin ko allow karo
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Admin middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authorization error.",
    });
  }
};

module.exports = adminMiddleware;