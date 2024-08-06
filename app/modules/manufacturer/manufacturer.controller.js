const Manufacturer = require("./manufacturer.model");
const fileDelete = require("../../utils/deletefiles");


exports.createManufacturer = async (req, res) => {
    try {
        const manufacturerObj = {
            name: req.body.name,
            status: 'active',
            images: []
        };
        req.files.forEach(element => {
            manufacturerObj.images.push(element.filename);
        });
        const savedManufacturer = await Manufacturer.create(manufacturerObj);
        res.status(200).send({ data: savedManufacturer, status: 200 });
    } catch (err) {
        console.log("Error while creating manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getManufacturers = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj['status'] = req.query.status;
        }
        const allManufacturers = await Manufacturer.find(queryObj);
        res.status(200).send({ data: allManufacturers, message: "Successfully fetched all Manufacturers", status: 200 });
    } catch (err) {
        console.log("Error while fetching manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getManufacturer = async (req, res) => {
    try {
        const manufacturerId = req.params.manufacturerId;
        const manufacturer = await Manufacturer.findById(manufacturerId)
        res.status(200).send({ data: manufacturer, message: "Successfully fetched Manufacturer", status: 200 });
    } catch (err) {
        console.log("Error while fetching manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateManufacturer = async (req, res) => {
    try {
        const manufacturerId = req.params.manufacturerId;
        const manufacturerTobeUpdated = await Manufacturer.findById(manufacturerId);
        if (!manufacturerTobeUpdated) {
            return res.status(404).send({
                message: "Manufacturer with the given id to be updated is not found",
            });
        }
        const images = [];
        if (req.files) {
            req.files.forEach(element => {
                images.push(element.filename);
            });
            manufacturerTobeUpdated.images.forEach((element) => {
                fileDelete.deleteFile('manufacturers/' + element);
            });
        }
        manufacturerTobeUpdated.name = req.body.name ? req.body.name : manufacturerTobeUpdated.name;
        manufacturerTobeUpdated.status = req.body.status ? req.body.status : manufacturerTobeUpdated.status;
        manufacturerTobeUpdated.images = images.length > 0 ? images : manufacturerTobeUpdated.images;

        const updatedManufacturer = await manufacturerTobeUpdated.save();
        res.status(200).send({ data: updatedManufacturer, message: "Successfully updated the manufacturer", status: 200 });
    } catch (err) {
        console.log("Error while updating manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.deleteManufacturer = async (req, res) => {
    try {
        const manufacturerId = req.params.manufacturerId;
        const manufacturerTobeDeleted = await Manufacturer.findById(manufacturerId);
        if (!manufacturerTobeDeleted) {
            return res.status(404).send({
                message: "Manufacturer with the given id to be deleted is not found",
            });
        }

        const deleteObj = await Manufacturer.deleteOne({ _id: manufacturerTobeDeleted._id });
        if (!deleteObj) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        manufacturerTobeDeleted.images.forEach(element => {
            fileDelete.deleteFile('manufacturers/' + element);
        });
        res.status(200).send({ data: manufacturerTobeDeleted, message: "Successfully deleted the manufacturer", status: 200 });
    } catch (err) {
        console.log("Error while deleting manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}