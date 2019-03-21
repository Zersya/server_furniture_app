var auth = require("../controllers/Auth/authController");
authMiddleware = require("../middleware/authMiddleware");

module.exports = app => {
  app.route("/api/auth/login").post(auth.login);

  app.route("/api/auth/forgetPassword").post(auth.forgetPassword);

  app
    .route("/api/auth/resetPassword")
    .get(auth.checkToken)
    .post(auth.resetPasswordToken)
    .put(authMiddleware.checkToken, auth.resetPassword);

  app.route("/api/auth/logout").get(authMiddleware.checkToken, auth.logout);
};
