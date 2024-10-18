const carApiHelper = require("../../utils/carApi");
exports.getEngines = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.year) {
            queryObj['year'] = req.query.year;
        }
        if (req.query.manufacturer) {
            queryObj['make'] = req.query.manufacturer;
        }
        if (req.query.model) {
            queryObj['model'] = req.query.model;
        }
        const allEngines = await carApiHelper.getEngines(queryObj);
        res.status(200).send({ data: allEngines, message: "Successfully fetched all Engines", status: 200 });
    } catch (err) {
        console.log("Error while fetching engine ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};