const Model = require("./model.model");
const mongoose = require('mongoose');


exports.createModel = async (req, res) => {
    try {
        const modelObj = {
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            status: 'active',
        };
        const savedModel = await Model.create(modelObj);
        res.status(200).send({ data: savedModel, status: 200 });
    } catch (err) {
        console.log("Error while creating model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getModels = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj['status'] = req.query.status;
        }
        if (req.query.manufacturer) {
            queryObj['manufacturer'] = mongoose.Types.ObjectId.createFromHexString(req.query.manufacturer);
        }
        const allModels = await Model.find(queryObj).populate('manufacturer');
        res.status(200).send({ data: allModels, message: "Successfully fetched all Models", status: 200 });
    } catch (err) {
        console.log("Error while fetching model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getModel = async (req, res) => {
    try {
        const modelId = req.params.modelId;
        const model = await Model.findById(modelId).populate('manufacturer')
        res.status(200).send({ data: model, message: "Successfully fetched Model", status: 200 });
    } catch (err) {
        console.log("Error while fetching model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateModel = async (req, res) => {
    try {
        const modelId = req.params.modelId;
        const modelTobeUpdated = await Model.findById(modelId);
        if (!modelTobeUpdated) {
            return res.status(404).send({
                message: "Model with the given id to be updated is not found",
            });
        }
        modelTobeUpdated.name = req.body.name ? req.body.name : modelTobeUpdated.name;
        modelTobeUpdated.manufacturer = req.body.manufacturer ? req.body.manufacturer : modelTobeUpdated.manufacturer;
        modelTobeUpdated.status = req.body.status ? req.body.status : modelTobeUpdated.status;

        const updatedModel = await modelTobeUpdated.save();
        res.status(200).send({ data: updatedModel, message: "Successfully updated the model", status: 200 });
    } catch (err) {
        console.log("Error while updating model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.deleteModel = async (req, res) => {
    try {
        const modelId = req.params.modelId;
        const modelTobeDeleted = await Model.findById(modelId);
        if (!modelTobeDeleted) {
            return res.status(404).send({
                message: "Model with the given id to be deleted is not found",
            });
        }

        const deleteObj = await Model.deleteOne({ _id: modelTobeDeleted._id });
        if (!deleteObj) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        res.status(200).send({ data: modelTobeDeleted, message: "Successfully deleted the model", status: 200 });
    } catch (err) {
        console.log("Error while deleting model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}