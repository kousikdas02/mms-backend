const serviceController = require("../modules/service/service.controller");
const auth = require("../modules/user/auth.middleware");
const fileConfig = require("../../configs/file.config");
const multer = require("multer");
const storeImage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fileConfig.serviceUrl)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname)
    }
})
const upload = multer({ storage: storeImage })

module.exports = (app) => {

    app.post("/mms/api/v1/service", [auth.verifytoken, auth.isAdmin, upload.any('images')], serviceController.createService);
    app.get("/mms/api/v1/service", serviceController.getServices);
    app.get("/mms/api/v1/service/:serviceId", serviceController.getService);
    app.put("/mms/api/v1/service/:serviceId", [auth.verifytoken, auth.isAdmin, upload.any('images')], serviceController.updateService);
    app.delete("/mms/api/v1/service/:serviceId", [auth.verifytoken, auth.isAdmin], serviceController.deleteService);
}