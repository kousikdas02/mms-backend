const carApiHelper = require("../../utils/carApi");
exports.getModels = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.year) {
            queryObj['year'] = req.query.year;
        }
        if (req.query.manufacturer) {
            queryObj['make'] = req.query.manufacturer;
        }
        const allModels = await carApiHelper.getModels(queryObj);
        res.status(200).send({ data: allModels, message: "Successfully fetched all Models", status: 200 });
    } catch (err) {
        console.log("Error while fetching model ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};