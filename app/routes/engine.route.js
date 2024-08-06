const engineController = require("../modules/engine/engine.controller")
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/engine", [auth.verifytoken, auth.isAdmin], engineController.createEngine);
    app.get("/mms/api/v1/engine", engineController.getEngines);
    app.get("/mms/api/v1/engine/:engineId", engineController.getEngine);
    app.put("/mms/api/v1/engine/:engineId", [auth.verifytoken, auth.isAdmin], engineController.updateEngine);
    app.delete("/mms/api/v1/engine/:engineId", [auth.verifytoken, auth.isAdmin], engineController.deleteEngine);
}