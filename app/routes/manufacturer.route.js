const manufacturerController = require("../modules/manufacturer/manufacturer.controller");
const auth = require("../modules/user/auth.middleware");
const fileConfig = require("../../configs/file.config");
const multer = require("multer");
const storeImage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fileConfig.manufacturerUrl)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname)
    }
})
const upload = multer({ storage: storeImage })

module.exports = (app) => {

    app.post("/mms/api/v1/manufacturer", [auth.verifytoken, auth.isAdmin, upload.any('images')], manufacturerController.createManufacturer);
    app.get("/mms/api/v1/manufacturer", manufacturerController.getManufacturers);
    app.get("/mms/api/v1/manufacturer/:manufacturerId", manufacturerController.getManufacturer);
    app.put("/mms/api/v1/manufacturer/:manufacturerId", [auth.verifytoken, auth.isAdmin, upload.any('images')], manufacturerController.updateManufacturer);
    app.delete("/mms/api/v1/manufacturer/:manufacturerId", [auth.verifytoken, auth.isAdmin], manufacturerController.deleteManufacturer);
}