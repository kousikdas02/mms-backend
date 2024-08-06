const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    service: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "service"
    },
    vehicleYear:{
        type : Date,
        require:true
    },
    vehicleManufacturer:{
        type : mongoose.SchemaTypes.ObjectId,
        ref : "manufacturer",
        require:true
    },
    vehicleModel: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "model",
        require:true
    },
    vehicleEngine: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "engine",
        require:true
    },
    serviceDate: {
        type : Date,
        require:true
    },
    location: {
        type : Date,
        require:true
    },
    bookedBy:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
        require:true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['partial_paid', 'full-paid','pending']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'canceled','completed']
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