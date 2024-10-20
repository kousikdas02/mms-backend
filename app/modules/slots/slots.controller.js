const Slots = require("./slots.model");


exports.AddSlots = async (req, res) => {
    try {
        const dateString = req.body.date;
        const [day, month, year] = dateString.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        const slotObj = {
            date: new Date(date.setUTCHours(0, 0, 0, 0)),
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            noSlot: req.body.noSlot,
        };
        const savedSlots = await Slots.create(slotObj);
        res.status(200).send({ data: savedSlots, status: 200 });
    } catch (err) {
        console.log("Error while creating slots ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

const Config = require("../config/config.model");
exports.getSlots = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.date) {
            const dateString = req.query.date;
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);

            // Set start of the day (midnight)
            const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));

            // Set end of the day (just before the next day)
            const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

            // Update the query object with date range
            queryObj['date'] = {
                "$gte": startOfDay,
                "$lt": endOfDay
            };
        }
        const allSlots = await Slots.findOne(queryObj);
        // if slot is not present
        if (!allSlots) {
            const config = await Config.findOne({});

            const dateString = req.query.date;
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            const slotObj = {
                _id: "",
                date: new Date(date.setUTCHours(0, 0, 0, 0)),
                startTime: config.startTime,
                endTime: config.endTime,
                noSlot: false
            }
            return res.status(200).send({ data: slotObj, message: "Successfully fetched all slots", status: 200 });
        }
        // if slot is present
        res.status(200).send({ data: allSlots, message: "Successfully fetched all slots", status: 200 });
    } catch (err) {
        console.log("Error while fetching slots ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateSlot = async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const slotToBeUpdated = await Slots.findById(slotId);
        if (!slotToBeUpdated) {
            return res.status(404).send({
                message: "Slot with the given id to be updated is not found",
            });
        }

        slotToBeUpdated.startTime = req.body.startTime ? req.body.startTime : slotToBeUpdated.startTime;
        slotToBeUpdated.endTime = req.body.endTime ? req.body.endTime : slotToBeUpdated.endTime;


        const updatedSlot = await slotToBeUpdated.save();
        res.status(200).send({ data: updatedSlot, message: "Successfully updated the slot", status: 200 });
    } catch (err) {
        console.log("Error while updating slot ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.deleteSlot = async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const serviceToBeDeleted = await Slots.findById(slotId);
        if (!serviceToBeDeleted) {
            return res.status(404).send({
                message: "Slot with the given id to be deleted is not found",
            });
        }
        serviceToBeDeleted.startTime = '';
        serviceToBeDeleted.endTime = '';
        serviceToBeDeleted.noSlot = true;

       
        const updatedSlot = await serviceToBeDeleted.save();
        res.status(200).send({ data: updatedSlot, message: "Successfully deleted the slot", status: 200 });
    } catch (err) {
        console.log("Error while deleting slot ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}