const Booking = require("./booking.model");
const User = require("../user/user.model");
const mongoose = require('mongoose');
const stripeConfig = require("../../../configs/stripe.config");
const stripe = require('stripe')(stripeConfig.stripeSecretKey);
const Service = require("../service/service.model");

exports.createBooking = async (req, res) => {
    try {
        const dateString = req.body.serviceDate;
        const [day, month, year] = dateString.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        const bookingObj = {
            service: req.body.service,
            vehicleYear: req.body.vehicleYear,
            vehicleManufacturer: req.body.vehicleManufacturer,
            vehicleModel: req.body.vehicleModel,
            vehicleEngine: req.body.vehicleEngine,
            location: req.body.location,
            totalAmount: req.body.totalAmount,
            minimumAmount: req.body.minimumAmount,
            serviceDate: new Date(date.setUTCHours(0, 0, 0, 0)),
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
            if (+req.body.walletAmount > +req.body.totalAmount) {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount) - (+req.body.totalAmount)];
                await savedBooking.save();
            } else {
                savedBooking['walletRedeemed'] = [(+req.body.walletAmount)];
                await savedBooking.save();
                price = (+req.body.totalAmount) - (+req.body.walletAmount);
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
        if (remainingAmount == 0) {
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
                totalPaidAmount += (checkoutObj.amount_subtotal / 100);
            }
        }
        bookingTobeUpdated.walletRedeemed.forEach(element => {
            totalPaidAmount += element;
        });
        if (totalPaidAmount == 0) {
            bookingTobeUpdated['paymentStatus'] = 'failed';
        } else if (totalPaidAmount == bookingTobeUpdated.totalAmount) {
            bookingTobeUpdated['paymentStatus'] = 'fully_paid';

            const userObj = await User.findById(bookingTobeUpdated.bookedBy);
            userObj['walletBalance'] = Math.max(0, userObj['walletBalance'] - bookingTobeUpdated.walletRedeemed[bookingTobeUpdated.walletRedeemed.length - 1]);
            await userObj.save();

        } else {
            bookingTobeUpdated['paymentStatus'] = 'partial_paid';

            const userObj = await User.findById(bookingTobeUpdated.bookedBy);
            userObj['walletBalance'] = Math.max(0, userObj['walletBalance'] - bookingTobeUpdated.walletRedeemed[bookingTobeUpdated.walletRedeemed.length - 1]);
            await userObj.save();
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
                bookingTobeUpdated['payment_intent'].push(checkoutObj.payment_intent)
            } else {
                bookingTobeUpdated['payment_intent'] = [checkoutObj.payment_intent]
            }
        }

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
        const dateString = req.body.serviceDate;
        const [day, month, year] = dateString.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        const bookingObj = {
            service: req.body.service,
            vehicleYear: req.body.vehicleYear,
            vehicleManufacturer: req.body.vehicleManufacturer,
            vehicleModel: req.body.vehicleModel,
            vehicleEngine: req.body.vehicleEngine,
            location: req.body.location,
            totalAmount: req.body.totalAmount,
            minimumAmount: req.body.minimumAmount,
            serviceDate: new Date(date.setUTCHours(0, 0, 0, 0)),
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

        const cartItemId = req.params.cartItemId;
        await Cart.deleteOne({ _id: cartItemId });
        res.status(200).send({ data: savedBooking, paymentUrl: session.url, status: 200 });
    } catch (err) {
        console.log("Error while creating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};



exports.rescheduleBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingTobeUpdated = await Booking.findById(bookingId);
        if (!bookingTobeUpdated) {
            return res.status(404).send({
                message: "Booking with the given id to be updated is not found",
            });
        }

        let newDate = null;
        if (req.body.serviceDate) {
            const dateString = req.body.serviceDate;
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            newDate = new Date(date.setUTCHours(0, 0, 0, 0));
        }

        bookingTobeUpdated['serviceDate'] = req.body.serviceDate ? newDate : bookingTobeUpdated.newDate;
        bookingTobeUpdated['serviceSlot'] = req.body.serviceSlot ? req.body.serviceSlot : bookingTobeUpdated.serviceSlot;

        await bookingTobeUpdated.save();


        res.status(200).send({ data: bookingTobeUpdated, message: "Successfully rescheduled the booking", status: 200 });
    } catch (err) {
        console.log("Error while updating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingTobeUpdated = await Booking.findById(bookingId);
        if (!bookingTobeUpdated) {
            return res.status(404).send({
                message: "Booking with the given id to be updated is not found",
            });
        }

        if (req.body.refundType == 'refundAtWallet') {
            bookingTobeUpdated['paymentStatus'] = 'refunded';
            bookingTobeUpdated['status'] = 'canceled';
            await bookingTobeUpdated.save();

            const userObj = await User.findById(bookingTobeUpdated.bookedBy);
            userObj['walletBalance'] = userObj['walletBalance'] + bookingTobeUpdated.paidAmount;
            await userObj.save();

            return res.status(200).send({ data: bookingTobeUpdated, message: "Refund at wallet is successful", status: 200 });
        }

        bookingTobeUpdated.payment_intent.forEach((item) => {
            stripe.refunds.create({
                payment_intent: item,
            }).then();
        });

        bookingTobeUpdated['paymentStatus'] = 'refund_initiated';
        bookingTobeUpdated['status'] = 'canceled';
        await bookingTobeUpdated.save();

        res.status(200).send({ data: bookingTobeUpdated, message: "Successfully rescheduled the booking", status: 200 });
    } catch (err) {
        console.log("Error while updating booking ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}

exports.updateRefundStatus = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, 'whsec_08fus559hQUFBhbMo1EDDcsvQ8yqBkuh');
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'refund.updated':
            const refundUpdated = event.data.object;
            console.log('Refund updated:', refundUpdated);
            // Define and call a function to handle the event refund.updated
            break;

        case 'charge.refund.updated':
            const chargeRefundUpdated = event.data.object;
            console.log('Charge refund updated:', chargeRefundUpdated);
            // Define and call a function to handle the event charge.refund.updated
            break;

        case 'charge.refunded':
            const chargeRefunded = event.data.object;
            console.log('Charge refunded:', chargeRefunded);
            // Define and call a function to handle the event charge.refunded
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.status(200).send();
};