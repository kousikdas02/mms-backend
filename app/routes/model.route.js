const modelController = require("../modules/model/model.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/model", [auth.verifytoken, auth.isAdmin], modelController.createModel);
    app.get("/mms/api/v1/model", modelController.getModels);
    app.get("/mms/api/v1/model/:modelId", modelController.getModel);
    app.put("/mms/api/v1/model/:modelId", [auth.verifytoken, auth.isAdmin], modelController.updateModel);
    app.delete("/mms/api/v1/model/:modelId", [auth.verifytoken, auth.isAdmin], modelController.deleteModel);
}