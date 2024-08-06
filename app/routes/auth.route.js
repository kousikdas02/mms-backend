const authController = require("../modules/user/auth.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/auth/signup", authController.signup);
    app.post("/mms/api/v1/auth/createadmin", authController.makeAdmin);
    app.post("/mms/api/v1/auth/signin", authController.signin);
    app.get("/mms/api/v1/user", [auth.verifytoken, auth.isAdmin], authController.getUsers);
    app.get("/mms/api/v1/user/profile", [auth.verifytoken], authController.getProfile);
    app.put("/mms/api/v1/user/profile", [auth.verifytoken], authController.updateProfile);

}