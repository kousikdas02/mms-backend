const Engine = require("./engine.model");


exports.createEngine = async (req, res) => {
    try {
        const engineObj = {
            name: req.body.name,
            model: req.body.model,
            status: 'active',
        };
        const savedEngine = await Engine.create(engineObj);
        res.status(200).send({ data: savedEngine, status: 200 });
    } catch (err) {
        console.log("Error while creating engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getEngines = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj['status'] = req.query.status;
        }
        const allEngines = await Engine.find(queryObj).populate('model');
        res.status(200).send({ data: allEngines, message: "Successfully fetched all Engines", status: 200 });
    } catch (err) {
        console.log("Error while fetching engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getEngine = async (req, res) => {
    try {
        const engineId = req.params.engineId;
        const engine = await Engine.findById(engineId).populate('model')
        res.status(200).send({ data: engine, message: "Successfully fetched Engine", status: 200 });
    } catch (err) {
        console.log("Error while fetching engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateEngine = async (req, res) => {
    try {
        const engineId = req.params.engineId;
        const engineTobeUpdated = await Engine.findById(engineId);
        if (!engineTobeUpdated) {
            return res.status(404).send({
                message: "Engine with the given id to be updated is not found",
            });
        }
        engineTobeUpdated.name = req.body.name ? req.body.name : engineTobeUpdated.name;
        engineTobeUpdated.model = req.body.model ? req.body.model : engineTobeUpdated.model;
        engineTobeUpdated.status = req.body.status ? req.body.status : engineTobeUpdated.status;

        const updatedEngine = await engineTobeUpdated.save();
        res.status(200).send({ data: updatedEngine, message: "Successfully updated the engine", status: 200 });
    } catch (err) {
        console.log("Error while updating engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.deleteEngine = async (req, res) => {
    try {
        const engineId = req.params.engineId;
        const engineTobeDeleted = await Engine.findById(engineId);
        if (!engineTobeDeleted) {
            return res.status(404).send({
                message: "Engine with the given id to be deleted is not found",
            });
        }

        const deleteObj = await Engine.deleteOne({ _id: engineTobeDeleted._id });
        if (!deleteObj) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        res.status(200).send({ data: engineTobeDeleted, message: "Successfully deleted the engine", status: 200 });
    } catch (err) {
        console.log("Error while deleting engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}