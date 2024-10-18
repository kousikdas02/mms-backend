const carApiHelper = require("../../utils/carApi");

exports.getManufacturers = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.year) {
            queryObj['year'] = req.query.year;
        }
        const allManufacturers = await carApiHelper.getManufacturers(queryObj);
        res.status(200).send({ data: allManufacturers, message: "Successfully fetched all Manufacturers", status: 200 });
    } catch (err) {
        console.log("Error while fetching manufacturer ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};