const manufacturerController = require("../modules/manufacturer/manufacturer.controller");


module.exports = (app) => {
    app.get("/mms/api/v1/manufacturer", manufacturerController.getManufacturers);
}