const configController = require("../modules/config/config.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/config", [auth.verifytoken, auth.isAdmin], configController.AddOrUpdateConfig);
    app.get("/mms/api/v1/config", configController.getConfig);
}