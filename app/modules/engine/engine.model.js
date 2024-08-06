const mongoose = require("mongoose");

const engineSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    model: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "model",
        require:true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive']
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


module.exports = mongoose.model("engine", engineSchema);