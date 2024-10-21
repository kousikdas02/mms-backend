const Config = require("./config.model");


exports.AddOrUpdateConfig = async (req, res) => {
    try {
        const config = await Config.findOne({});
        console.log(config);
        if (config) {
            // means config is created, we need to update that
            config.minimumBookingPrice = req.body.minimumBookingPrice ? req.body.minimumBookingPrice : config.minimumBookingPrice;
            config.serviceTime = req.body.serviceTime ? req.body.serviceTime : config.serviceTime;
            config.startTime = req.body.startTime ? req.body.startTime : config.startTime;
            config.endTime = req.body.endTime ? req.body.endTime : config.endTime;
            const updatedConfig = await config.save();
            return res.status(200).send({ data: updatedConfig, message: "Successfully updated the config", status: 200 });
        }
        // Config is not created, then lets create one
        const ConfigObj = {
            minimumBookingPrice: req.body.minimumBookingPrice,
            serviceTime: req.body.serviceTime,
            startTime: req.body.startTime,
            endTime: req.body.endTime
        };
        const savedConfig = await Config.create(ConfigObj);
        return res.status(200).send({ data: savedConfig, status: 200 });
    } catch (err) {
        console.log("Error while creating slots ", err.message);
        return res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getConfig = async (req, res) => {
    try {
        const config = await Config.findOne({});
        return res.status(200).send({ data: config, message: "Successfully fetched config", status: 200 });
    } catch (err) {
        console.log("Error while fetching slots ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};