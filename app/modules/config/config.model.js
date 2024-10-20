const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
    minimumBookingPrice: {
        type: Number,
        require: true
    },
    startTime: {
        type: String,
        require: true
    },
    endTime: {
        type: String,
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


module.exports = mongoose.model("config", configSchema);