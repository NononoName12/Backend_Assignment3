const checkRole = (roles) => {
  return (req, res, next) => {
    const user = req.user; // kiểm tra xem có user trong session không
    if (!user || !roles.includes(user.role)) {
      // Nếu k có user hoặc user đó có role không chứa phần tử mà mãng role yêu cầu
      return res
        .status(403)
        .json({ message: "You are not allowed to access this resource" });
    }
    next();
  };
};

module.exports = checkRole;
