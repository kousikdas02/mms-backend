const slotController = require("../modules/slots/slots.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/slot", [auth.verifytoken, auth.isAdmin], slotController.AddSlots);
    app.get("/mms/api/v1/slot", [auth.verifytoken, auth.isAdmin], slotController.getSlots);
    app.put("/mms/api/v1/slot/:slotId", [auth.verifytoken, auth.isAdmin], slotController.updateSlot);
    app.delete("/mms/api/v1/slot/:slotId", [auth.verifytoken, auth.isAdmin], slotController.deleteSlot);
    app.get("/mms/api/v1/serviceSlot", slotController.getServiceSlots);
}