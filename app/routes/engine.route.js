const engineController = require("../modules/engine/engine.controller")

module.exports = (app) => {
    app.get("/mms/api/v1/engine", engineController.getEngines);
}