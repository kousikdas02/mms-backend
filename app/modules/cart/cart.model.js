const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    service: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "service"
    },
    vehicleYear: {
        type: String,
        require: true
    },
    vehicleManufacturer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "manufacturer",
        require: true
    },
    vehicleModel: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "model",
        require: true
    },
    vehicleEngine: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "engine",
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
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
        require: true
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


module.exports = mongoose.model("cart", cartSchema);