const mongoose = require("mongoose");

const slotsSchema = new mongoose.Schema({
    date: {
        type: Date,
        require: true
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    noSlot: {
        type: Boolean,
        default: false
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


module.exports = mongoose.model("slots", slotsSchema);