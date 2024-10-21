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
            location: req.body.location,
            totalAmount: req.body.totalAmount,
            minimumAmount: req.body.minimumAmount,
            serviceDate: req.body.serviceDate,
            serviceSlot: req.body.serviceSlot,
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

        const serviceList = await Service.find({ _id: { $in: req.body.service.map((item) => mongoose.Types.ObjectId.createFromHexString(item)) } });
        const services = serviceList.map(person => person.name).join(',');

        // calculate the amount
        let price = 0;
        if (req.body.fullPayment) {
            if (+req.body.walletAmount > +req.body.fullPayment) {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount) - (+req.body.fullPayment)];
                await savedBooking.save();
            } else {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount)];
                await savedBooking.save();
                price = (+req.body.fullPayment) - (+req.body.walletAmount);
            }
        } else {
            if (+req.body.walletAmount > +req.body.minimumAmount) {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount) - (+req.body.minimumAmount)];
                await savedBooking.save();
            } else {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount)];
                await savedBooking.save();
                price = (+req.body.minimumAmount) - (+req.body.walletAmount);
            }
        }
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: services + ' services',
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                }
            ],
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
        savedBooking['checkoutId'] = [session.id];
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


exports.payRestAmount = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).send({
                message: "Booking with the given id is not found",
            });
        }
        const serviceList = await Service.find({ _id: { $in: booking.service.map((item) => item) } });
        const services = serviceList.map(person => person.name).join(',');

        // calculate the amount
        const remainingAmount = booking.totalAmount - booking.paidAmount;
        if(remainingAmount == 0){
            booking['paymentStatus'] = 'fully_paid';
            await booking.save();
        }
        const userObj = await User.findById(booking.bookedBy);

        let price = 0;
        if (userObj['walletBalance'] > remainingAmount) {
            booking['walletRedeemed'].push(userObj['walletBalance'] - remainingAmount);
            await savedBooking.save();
        } else {
            booking['walletRedeemed'].push(userObj['walletBalance']);
            await booking.save();
            price = remainingAmount - userObj['walletBalance'];
        }
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: services + ' services',
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                }
            ],
            mode: 'payment',
            invoice_creation: {
                enabled: true,

            },
            success_url: `http://localhost:4200/payment-success/${booking._id}`,
            cancel_url: `http://localhost:4200/payment-failed/${booking._id}`,
        });
        if (!session) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        booking['checkoutId'].push(session.id);
        await booking.save();
        res.status(200).send({ data: booking, paymentUrl: session.url, status: 200 });
    } catch (err) {
        console.log("Error while paying rest on booking ", err.message);
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

        let totalPaidAmount = 0;
        for (let i = 0; i < bookingTobeUpdated.checkoutId.length; i++) {
            const checkoutObj = await stripe.checkout.sessions.retrieve(bookingTobeUpdated.checkoutId[i]);
            if (checkoutObj.payment_status == 'paid') {
                totalPaidAmount += (checkoutObj.amount_subtotal/100);
            }
        }
        if (totalPaidAmount == 0) {
            bookingTobeUpdated['paymentStatus'] = 'failed';
        } else if (totalPaidAmount == bookingTobeUpdated.totalAmount) {
            bookingTobeUpdated['paymentStatus'] = 'fully_paid';
        } else {
            bookingTobeUpdated['paymentStatus'] = 'partial_paid';
        }
        bookingTobeUpdated['paidAmount'] = totalPaidAmount;
        bookingTobeUpdated['status'] = req.body.status ? req.body.status : bookingTobeUpdated.status;

        if (bookingTobeUpdated['status'] == 'active' && bookingTobeUpdated['paymentStatus'] != 'failed') {
            const checkoutObj = await stripe.checkout.sessions.retrieve(bookingTobeUpdated.checkoutId[bookingTobeUpdated.checkoutId.length - 1]);
            if (bookingTobeUpdated['invoiceId']) {
                bookingTobeUpdated['invoiceId'].push(checkoutObj.invoice)
            } else {
                bookingTobeUpdated['invoiceId'] = [checkoutObj.invoice]
            }
            if (bookingTobeUpdated['payment_intent']) {
                bookingTobeUpdated['payment_intent'].push(checkoutObj.invoice)
            } else {
                bookingTobeUpdated['payment_intent'] = [checkoutObj.invoice]
            }
        }

        const updatedBooking = await bookingTobeUpdated.save();


        const userObj = await User.findById(bookingTobeUpdated.bookedBy);
        userObj['walletBalance'] = Math.max(0, userObj['walletBalance'] - bookingTobeUpdated.walletRedeemed[bookingTobeUpdated.walletRedeemed.length-1]);
        await userObj.save();


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