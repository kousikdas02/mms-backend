const Booking = require("./booking.model");
const User = require("../user/user.model");


exports.createBooking = async (req, res) => {
    try {
        const bookingObj = {
            service: req.body.service,
            vehicleYear: req.body.vehicleYear,
            vehicleManufacturer: req.body.vehicleManufacturer,
            vehicleModel: req.body.vehicleModel,
            vehicleEngine: req.body.vehicleEngine,
            serviceDate: req.body.serviceDate,
            location: req.body.location,
            bookedBy: req.userId,
            paymentStatus:'pending',
            status: 'active',
        };
        const savedBooking = await Booking.create(bookingObj);
        res.status(200).send({ data: savedBooking, status: 200 });
    } catch (err) {
        console.log("Error while creating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj['status'] = req.query.status;
        }
        const userObj = await User.findById(req.userId);
        if(userObj.role == 'user'){
            queryObj['bookedBy'] = req.userId;
        }
        const allBookings = await Booking.find(queryObj);
        res.status(200).send({ data: allBookings, message: "Successfully fetched all Bookings", status: 200 });
    } catch (err) {
        console.log("Error while fetching booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking.findById(bookingId)
        res.status(200).send({ data: booking, message: "Successfully fetched Booking", status: 200 });
    } catch (err) {
        console.log("Error while fetching booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingTobeUpdated = await Booking.findById(bookingId);
        if (!bookingTobeUpdated) {
            return res.status(404).send({
                message: "Booking with the given id to be updated is not found",
            });
        }
        bookingTobeUpdated.serviceDate = req.body.serviceDate ? req.body.serviceDate : bookingTobeUpdated.serviceDate;
        bookingTobeUpdated.status = req.body.status ? req.body.status : bookingTobeUpdated.status;

        const updatedBooking = await bookingTobeUpdated.save();
        res.status(200).send({ data: updatedBooking, message: "Successfully updated the booking", status: 200 });
    } catch (err) {
        console.log("Error while updating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}