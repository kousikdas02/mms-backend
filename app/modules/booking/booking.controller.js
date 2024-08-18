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
            vehicleYear: req.body.year,
            vehicleManufacturer: req.body.manufacturer,
            vehicleModel: req.body.model,
            vehicleEngine: req.body.engine,
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
        const queryArr = [];
        if (req.query.status) {
            queryArr.push({
                $match: { status: req.query.status }
            });
        }
        const userObj = await User.findById(req.userId);
        if (userObj.role == 'user') {
            queryArr.push({
                $match: { bookedBy: mongoose.Types.ObjectId.createFromHexString(req.userId) }
            });
        }
        // const allBookings = await Booking.find(queryObj);
        const allBookings = await Booking.aggregate([
            ...queryArr,
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: "serviceDetails"
                },
            },
            {
                $lookup: {
                    from: "manufacturers",
                    localField: "vehicleManufacturer",
                    foreignField: "_id",
                    as: "manufacturerDetails"
                }
            },
            {
                $lookup: {
                    from: "models",
                    localField: "vehicleModel",
                    foreignField: "_id",
                    as: "vehicleModelDetails"
                }
            },
            {
                $lookup: {
                    from: "engines",
                    localField: "vehicleEngine",
                    foreignField: "_id",
                    as: "vehicleEngineDetails"
                }
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: {
                            $map: {
                                input: "$serviceDetails",
                                as: "service",
                                in: "$$service.price"
                            }
                        }
                    }
                }
            }

        ]);
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
        // const booking = await Booking.findById(req.params.bookingId);
        const booking = await Booking.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId.createFromHexString(req.params.bookingId) }
            },
            {
                $lookup: {
                    from: "services", // The collection to join
                    localField: "service", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "serviceDetails" // Output array field
                },
            },
            {
                $lookup: {
                    from: "manufacturers", // The collection to join
                    localField: "vehicleManufacturer", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "manufacturerDetails" // Output array field
                }
            },
            {
                $lookup: {
                    from: "models", // The collection to join
                    localField: "vehicleModel", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "vehicleModelDetails" // Output array field
                }
            },
            {
                $lookup: {
                    from: "engines", // The collection to join
                    localField: "vehicleEngine", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "vehicleEngineDetails" // Output array field
                }
            },
            {
                $addFields: {
                    totalPrice: { $sum: "$serviceDetails.price" }
                }
            }
        ]);
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

        if (bookingTobeUpdated['paymentStatus'] == 'pending' && bookingTobeUpdated.checkoutId.length == 1) {
            if (checkoutObj.payment_status == 'paid') {
                bookingTobeUpdated['paymentStatus'] = 'partial_paid';
            } else {
                bookingTobeUpdated['paymentStatus'] = 'failed';
            }
        } else if (bookingTobeUpdated['paymentStatus'] == 'partial_paid' && bookingTobeUpdated.checkoutId.length == 2) {
            if (checkoutObj.payment_status == 'paid') {
                bookingTobeUpdated['paymentStatus'] = 'fully_paid';
            }
        }

        if (bookingTobeUpdated['status'] == 'active' &&
            (bookingTobeUpdated['paymentStatus'] == 'pending' || bookingTobeUpdated['paymentStatus'] == 'partial_paid')) {

            bookingTobeUpdated['invoiceId'][bookingTobeUpdated.checkoutId.length - 1] = checkoutObj.invoice;
            bookingTobeUpdated['payment_intent'][bookingTobeUpdated.checkoutId.length - 1] = checkoutObj.payment_intent;
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

const Cart = require("../cart/cart.model");
exports.createBookingFromCart = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const cartItemTobeBooked = await Cart.findById(cartItemId);
        if (!cartItemTobeBooked) {
            return res.status(404).send({
                message: "Cart item with the given id to be used is not found",
            });
        }
        if (cartItemTobeBooked.createdBy != req.userId) {
            return res.status(401).send({
                message: "You are not authorized to access this cart item",
                status: 401
            });
        }

        const bookingObj = {
            service: cartItemTobeBooked.service,
            vehicleYear: cartItemTobeBooked.vehicleYear,
            vehicleManufacturer: cartItemTobeBooked.vehicleManufacturer,
            vehicleModel: cartItemTobeBooked.vehicleModel,
            vehicleEngine: cartItemTobeBooked.vehicleEngine,
            serviceDate: cartItemTobeBooked.serviceDate,
            location: cartItemTobeBooked.location,
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
        const serviceList = await Service.find({ _id: { $in: cartItemTobeBooked.service.map((item) => item) } });
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
        await Cart.deleteOne({ _id: cartItemTobeBooked._id });
        res.status(200).send({ data: savedBooking, paymentUrl: session.url, status: 200 });
    } catch (err) {
        console.log("Error while creating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};