const modelController = require("../modules/model/model.controller");
module.exports = (app) => {
    app.get("/mms/api/v1/model", modelController.getModels);
}