//Định nghĩa một hàm middleware để xử lý trường hợp khi một trang không được tìm thấy
exports.get404 = (req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
};
