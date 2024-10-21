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