const Booking = require("./booking.model");
const User = require("../user/user.model");
const mongoose = require('mongoose');
const stripeConfig = require("../../../configs/stripe.config");
const stripe = require('stripe')(stripeConfig.stripeSecretKey);
const Service = require("../service/service.model");

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
            paymentStatus: 'pending',
            status: 'active',
        };
        const savedBooking = await Booking.create(bookingObj);
        if (!savedBooking) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        // const serviceIds = req.body.service.map((item) => mongoose.Types.ObjectId.createFromHexString(item));
        const serviceList = await Service.find({ _id: { $in: req.body.service.map((item) => mongoose.Types.ObjectId.createFromHexString(item)) } });
        const priceItem = serviceList.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: 1,
            };
        });
        const session = await stripe.checkout.sessions.create({
            line_items: priceItem,
            mode: 'payment',
            invoice_creation: {
                enabled: true,

            },
            success_url: `http://localhost:4200/payment-success/${savedBooking._id}`,
            cancel_url: `http://localhost:4200/payment-failed/${savedBooking._id}`,
        });
        if (!session) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        savedBooking['checkoutId'].push(session.id);
        await savedBooking.save();
        res.status(200).send({ data: savedBooking, paymentUrl: session.url, status: 200 });
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
        if (userObj.role == 'user') {
            queryObj['bookedBy'] = mongoose.Types.ObjectId.createFromHexString(req.userId);
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
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).send({
                message: "Booking with the given id is not found",
            });
        }
        res.status(200).send({ data: booking, message: "Successfully fetched Booking", status: 200 });
    } catch (err) {
        console.log("Error while fetching booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingTobeUpdated = await Booking.findById(bookingId);
        if (!bookingTobeUpdated) {
            return res.status(404).send({
                message: "Booking with the given id to be updated is not found",
            });
        }
        const checkoutObj = await stripe.checkout.sessions.retrieve(bookingTobeUpdated.checkoutId[bookingTobeUpdated.checkoutId.length - 1]);

        if (bookingTobeUpdated['paymentStatus'] == 'pending') {
            if (checkoutObj.payment_status == 'paid') {
                bookingTobeUpdated['paymentStatus'] = 'partial_paid';
            } else {
                bookingTobeUpdated['paymentStatus'] = 'failed';
            }
        } else if (bookingTobeUpdated['paymentStatus'] == 'partial_paid') {
            if (checkoutObj.payment_status == 'paid') {
                bookingTobeUpdated['paymentStatus'] = 'fully_paid';
            }
        }

        if (bookingTobeUpdated['status'] == 'active' &&
            (bookingTobeUpdated['paymentStatus'] == 'pending' || bookingTobeUpdated['paymentStatus'] == 'partial_paid')) {

            bookingTobeUpdated['invoiceId'].push(checkoutObj.invoice);
            bookingTobeUpdated['payment_intent'].push(checkoutObj.payment_intent);
        }
        bookingTobeUpdated['status'] = req.body.status ? req.body.status : bookingTobeUpdated.status;

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