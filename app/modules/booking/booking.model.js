const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    service: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "service"
    },
    vehicleYear: {
        type: String,
        require: true
    },
    vehicleManufacturer: {
        type: String,
        require: true
    },
    vehicleModel: {
        type: String,
        require: true
    },
    vehicleEngine: {
        type: String,
        require: true
    },
    serviceDate: {
        type: Date,
        require: true
    },
    location: {
        type: String,
        require: true
    },
    bookedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
        require: true
    },
    checkoutId: {
        type: [String],
        require: false
    },
    invoiceId:{
        type: [String],
        require: false
    },
    payment_intent:{
        type: [String],
        require: false
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['partial_paid', 'fully_paid', 'pending', 'failed', 'refund_initiated', 'refunded']
    },
    refundAmount: {
        type: Number,
        require: false,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'canceled', 'completed']
    },
    createdAt: {
        type: Date,
        default: () => {
            return Date.now()
        },
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => {
            return Date.now()
        }
    }
});


module.exports = mongoose.model("booking", bookingSchema);