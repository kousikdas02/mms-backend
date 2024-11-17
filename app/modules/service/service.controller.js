const Service = require("./service.model");
const fileDelete = require("../../utils/deletefiles");


exports.createService = async (req, res) => {
    try {
        console.log(req.body)
        const specialConsiderationArr = [];
        if (req.body.specialConsideration) {
            req.body.specialConsideration.forEach((element) => {
                specialConsiderationArr.push(JSON.parse(element))
            });
        }
        const serviceObj = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            status: 'active',
            images: [],
            specialConsideration: specialConsiderationArr
        };
        req.files.forEach(element => {
            serviceObj.images.push(element.filename);
        });
        const savedService = await Service.create(serviceObj);
        res.status(200).send({ data: savedService, status: 200 });
    } catch (err) {
        console.log("Error while creating service ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getServices = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj['status'] = req.query.status;
        }
        const allServices = await Service.find(queryObj);
        res.status(200).send({ data: allServices, message: "Successfully fetched all Services", status: 200 });
    } catch (err) {
        console.log("Error while fetching service ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findById(serviceId)
        res.status(200).send({ data: service, message: "Successfully fetched Service", status: 200 });
    } catch (err) {
        console.log("Error while fetching service ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const serviceTobeUpdated = await Service.findById(serviceId);
        if (!serviceTobeUpdated) {
            return res.status(404).send({
                message: "Service with the given id to be updated is not found",
            });
        }
        const images = [];
        if (req.files) {
            req.files.forEach(element => {
                images.push(element.filename);
            });
            serviceTobeUpdated.images.forEach((element) => {
                fileDelete.deleteFile('services/' + element);
            });
        }
        serviceTobeUpdated.name = req.body.name ? req.body.name : serviceTobeUpdated.name;
        serviceTobeUpdated.description = req.body.description ? req.body.description : serviceTobeUpdated.description;
        serviceTobeUpdated.price = req.body.price ? req.body.price : serviceTobeUpdated.price;
        serviceTobeUpdated.status = req.body.status ? req.body.status : serviceTobeUpdated.status;
        serviceTobeUpdated.images = images.length > 0 ? images : serviceTobeUpdated.images;
        const specialConsiderationArr = [];
        if (serviceTobeUpdated.specialConsideration) {
            req.body.specialConsideration.forEach((element) => {
                specialConsiderationArr.push(JSON.parse(element))
            });
        }
        serviceTobeUpdated.specialConsideration = specialConsiderationArr;



        const updatedService = await serviceTobeUpdated.save();
        res.status(200).send({ data: updatedService, message: "Successfully updated the service", status: 200 });
    } catch (err) {
        console.log("Error while updating service ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const serviceTobeDeleted = await Service.findById(serviceId);
        if (!serviceTobeDeleted) {
            return res.status(404).send({
                message: "Service with the given id to be deleted is not found",
            });
        }

        const deleteObj = await Service.deleteOne({ _id: serviceTobeDeleted._id });
        if (!deleteObj) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        serviceTobeDeleted.images.forEach(element => {
            fileDelete.deleteFile('services/' + element);
        });
        res.status(200).send({ data: serviceTobeDeleted, message: "Successfully deleted the service", status: 200 });
    } catch (err) {
        console.log("Error while deleting service ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}