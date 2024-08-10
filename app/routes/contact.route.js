const contactController = require("../modules/contact/contact.controller");
const auth = require("../modules/user/auth.middleware");
module.exports = (app) => {

    app.post("/mms/api/v1/contact", contactController.createContact);
    app.get("/mms/api/v1/contact", [auth.verifytoken, auth.isAdmin], contactController.getContacts);
}